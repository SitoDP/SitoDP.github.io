import { mkdir, writeFile } from 'node:fs/promises'
import { z } from 'zod'
import { flushCache, hasDeepLKey, translate, translateMany } from './translate.js'

const PRODUCTS_URL = 'https://fender-design.com/products.json?limit=250'
const COLLECTIONS_URL = 'https://fender-design.com/collections.json?limit=250'
const PRODUCTS_OUTPUT = new URL('../src/data/products.json', import.meta.url)
const COLLECTIONS_OUTPUT = new URL('../src/data/collections.json', import.meta.url)
const DATA_DIR = new URL('../src/data/', import.meta.url)

// Runtime validation schemas — fail fast and loud if Fender Design's
// Shopify response shape changes (better than letting Vue crash later).
const ShopifyVariantSchema = z.object({
  id: z.number(),
  title: z.string(),
  price: z.string(),
  sku: z.string().nullable(),
  available: z.boolean(),
})

const ShopifyImageSchema = z.object({
  src: z.string().url(),
  alt: z.string().nullable().optional(),
})

const ShopifyProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  handle: z.string(),
  body_html: z.string(),
  vendor: z.string(),
  product_type: z.string(),
  tags: z.array(z.string()),
  variants: z.array(ShopifyVariantSchema),
  images: z.array(ShopifyImageSchema),
})

const ShopifyProductsResponseSchema = z.object({
  products: z.array(ShopifyProductSchema),
})

const ShopifyCollectionSchema = z.object({
  id: z.number(),
  title: z.string(),
  handle: z.string(),
  description: z.string(),
  image: ShopifyImageSchema.nullable(),
  products_count: z.number(),
})

const ShopifyCollectionsResponseSchema = z.object({
  collections: z.array(ShopifyCollectionSchema),
})

type ShopifyProduct = z.infer<typeof ShopifyProductSchema>
type ShopifyProductsResponse = z.infer<typeof ShopifyProductsResponseSchema>
type ShopifyCollection = z.infer<typeof ShopifyCollectionSchema>
type ShopifyCollectionsResponse = z.infer<typeof ShopifyCollectionsResponseSchema>

interface Product {
  id: number
  title: string
  handle: string
  description: string
  vendor: string
  type: string
  tags: string[]
  price: string
  configurable: boolean
  variants: Array<{ id: number; title: string; price: string; sku: string | null; available: boolean }>
  images: Array<{ src: string; alt: string | null }>
}

interface Collection {
  id: number
  title: string
  handle: string
  description: string
  image: { src: string; alt: string | null } | null
  productIds: number[]
}

async function fetchValidated<T>(url: string, schema: z.ZodType<T>): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
  const json = await res.json()
  const result = schema.safeParse(json)
  if (!result.success) {
    console.error(`Validation failed for ${url}:`)
    console.error(JSON.stringify(result.error.issues.slice(0, 5), null, 2))
    throw new Error(`Response from ${url} did not match expected schema`)
  }
  return result.data
}

function mapProduct(p: ShopifyProduct): Product {
  const allZero = p.variants.every((v) => Number(v.price) === 0)
  const configurable = allZero || p.tags.some((t) => /configurador/i.test(t))
  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    description: p.body_html,
    vendor: p.vendor,
    type: p.product_type,
    tags: p.tags,
    price: p.variants[0]?.price ?? '0',
    configurable,
    variants: p.variants.map((v) => ({
      id: v.id,
      title: v.title,
      price: v.price,
      sku: v.sku,
      available: v.available,
    })),
    images: p.images.map((i) => ({ src: i.src, alt: i.alt ?? null })),
  }
}

async function translateProducts(products: Product[]): Promise<void> {
  // Batch-translate all short text fields in one call, plus HTML descriptions separately
  const textFields: Array<{ source: string; apply: (result: string) => void }> = []
  const htmlFields: Array<{ source: string; apply: (result: string) => void }> = []

  for (const p of products) {
    textFields.push({ source: p.title, apply: (r) => (p.title = r) })
    if (p.type) textFields.push({ source: p.type, apply: (r) => (p.type = r) })
    p.tags.forEach((tag, i) => {
      textFields.push({ source: tag, apply: (r) => (p.tags[i] = r) })
    })
    p.variants.forEach((v, i) => {
      textFields.push({ source: v.title, apply: (r) => (p.variants[i].title = r) })
    })
    if (p.description) {
      htmlFields.push({ source: p.description, apply: (r) => (p.description = r) })
    }
  }

  const textResults = await translateMany(textFields.map((f) => f.source))
  textFields.forEach((f, i) => f.apply(textResults[i]))

  const htmlResults = await translateMany(
    htmlFields.map((f) => f.source),
    { html: true },
  )
  htmlFields.forEach((f, i) => f.apply(htmlResults[i]))
}

async function translateCollections(collections: Collection[]): Promise<void> {
  const titles = collections.map((c) => c.title)
  const translatedTitles = await translateMany(titles)
  collections.forEach((c, i) => (c.title = translatedTitles[i]))

  for (const c of collections) {
    if (c.description) {
      c.description = await translate(c.description, { html: true })
    }
  }
}

async function syncProducts(): Promise<Product[]> {
  console.log(`Fetching ${PRODUCTS_URL}`)
  const { products: raw } = await fetchValidated(PRODUCTS_URL, ShopifyProductsResponseSchema)
  const products: Product[] = raw.map(mapProduct)
  console.log(`Fetched ${products.length} products`)
  return products
}

async function syncCollections(): Promise<Collection[]> {
  console.log(`Fetching ${COLLECTIONS_URL}`)
  const { collections: raw } = await fetchValidated(COLLECTIONS_URL, ShopifyCollectionsResponseSchema)

  const collections: Collection[] = await Promise.all(
    raw.map(async (c) => {
      const url = `https://fender-design.com/collections/${c.handle}/products.json?limit=250`
      const { products } = await fetchValidated(url, ShopifyProductsResponseSchema)
      return {
        id: c.id,
        title: c.title,
        handle: c.handle,
        description: c.description,
        image: c.image ? { src: c.image.src, alt: c.image.alt ?? null } : null,
        productIds: products.map((p) => p.id),
      }
    }),
  )
  console.log(`Fetched ${collections.length} collections`)
  return collections
}

async function main(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })

  const [products, collections] = await Promise.all([syncProducts(), syncCollections()])

  if (hasDeepLKey()) {
    console.log('Translating DE → ES with DeepL...')
    await translateProducts(products)
    await translateCollections(collections)
    await flushCache()
    console.log('Translation done')
  } else {
    console.warn('DEEPL_API_KEY not set — skipping translation (content stays in German)')
  }

  await writeFile(PRODUCTS_OUTPUT, JSON.stringify(products, null, 2) + '\n')
  console.log(`Wrote src/data/products.json (${products.length} products)`)

  await writeFile(COLLECTIONS_OUTPUT, JSON.stringify(collections, null, 2) + '\n')
  console.log(`Wrote src/data/collections.json (${collections.length} collections)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
