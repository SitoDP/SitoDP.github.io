import { mkdir, writeFile } from 'node:fs/promises'

const PRODUCTS_URL = 'https://fender-design.com/products.json?limit=250'
const COLLECTIONS_URL = 'https://fender-design.com/collections.json?limit=250'
const PRODUCTS_OUTPUT = new URL('../src/data/products.json', import.meta.url)
const COLLECTIONS_OUTPUT = new URL('../src/data/collections.json', import.meta.url)
const DATA_DIR = new URL('../src/data/', import.meta.url)

interface ShopifyVariant {
  id: number
  title: string
  price: string
  sku: string
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
  variants: Array<{ id: number; title: string; price: string; sku: string; available: boolean }>
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

async function syncProducts(): Promise<void> {
  console.log(`Fetching ${PRODUCTS_URL}`)
  const { products: raw } = await fetchJson<ShopifyProductsResponse>(PRODUCTS_URL)

  const products: Product[] = raw.map((p) => ({
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
  }))

  await writeFile(PRODUCTS_OUTPUT, JSON.stringify(products, null, 2) + '\n')
  console.log(`Synced ${products.length} products → src/data/products.json`)
}

async function syncCollections(): Promise<void> {
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

  await writeFile(COLLECTIONS_OUTPUT, JSON.stringify(collections, null, 2) + '\n')
  console.log(`Synced ${collections.length} collections → src/data/collections.json`)
}

async function main(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  await Promise.all([syncProducts(), syncCollections()])
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
