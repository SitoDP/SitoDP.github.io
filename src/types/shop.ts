export interface ProductVariant {
  id: number
  title: string
  price: string
  sku: string | null
  available: boolean
}

export interface ProductImage {
  src: string
  alt?: string | null
}

export interface Product {
  id: number
  title: string
  handle: string
  description: string
  vendor: string
  type: string
  tags: string[]
  price: string
  configurable?: boolean
  variants: ProductVariant[]
  images: ProductImage[]
}

export interface Collection {
  id: number
  title: string
  handle: string
  description: string
  image: ProductImage | null
  productIds: number[]
}
