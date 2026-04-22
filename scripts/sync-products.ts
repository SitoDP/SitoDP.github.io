import { mkdir, writeFile } from 'node:fs/promises'
import { flushCache, hasDeepLKey, translate, translateMany } from './translate.js'

const PRODUCTS_URL = 'https://fender-design.com/products.json?limit=250'
const COLLECTIONS_URL = 'https://fender-design.com/collections.json?limit=250'
const PRODUCTS_OUTPUT = new URL('../src/data/products.json', import.meta.url)
const COLLECTIONS_OUTPUT = new URL('../src/data/collections.json', import.meta.url)
const DATA_DIR = new URL('../src/data/', import.meta.url)

interface ShopifyVariant {
  id: number
  title: string
  price: string
  sku: string | null
  available: boolean
}

interface ShopifyImage {
  src: string
  alt: string | null
}

interface ShopifyProduct {
  id: number
  title: string
  handle: string
  body_html: string
  vendor: string
  product_type: string
  tags: string[]
  variants: ShopifyVariant[]
  images: ShopifyImage[]
}

interface ShopifyProductsResponse {
  products: ShopifyProduct[]
}

interface ShopifyCollection {
  id: number
  title: string
  handle: string
  description: string
  image: ShopifyImage | null
  products_count: number
}

interface ShopifyCollectionsResponse {
  collections: ShopifyCollection[]
}

interface Product {
  id: number
  title: string
  handle: string
  description: string
  vendor: string
  type: string
  tags: string[]
  price: string
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

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

function mapProduct(p: ShopifyProduct): Product {
  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    description: p.body_html,
    vendor: p.vendor,
    type: p.product_type,
    tags: p.tags,
    price: p.variants[0]?.price ?? '0',
    variants: p.variants.map((v) => ({
      id: v.id,
      title: v.title,
      price: v.price,
      sku: v.sku,
      available: v.available,
    })),
    images: p.images.map((i) => ({ src: i.src, alt: i.alt })),
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
  const { products: raw } = await fetchJson<ShopifyProductsResponse>(PRODUCTS_URL)
  const products: Product[] = raw.map(mapProduct)
  console.log(`Fetched ${products.length} products`)
  return products
}

async function syncCollections(): Promise<Collection[]> {
  console.log(`Fetching ${COLLECTIONS_URL}`)
  const { collections: raw } = await fetchJson<ShopifyCollectionsResponse>(COLLECTIONS_URL)

  const collections: Collection[] = await Promise.all(
    raw.map(async (c) => {
      const url = `https://fender-design.com/collections/${c.handle}/products.json?limit=250`
      const { products } = await fetchJson<ShopifyProductsResponse>(url)
      return {
        id: c.id,
        title: c.title,
        handle: c.handle,
        description: c.description,
        image: c.image ? { src: c.image.src, alt: c.image.alt } : null,
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
