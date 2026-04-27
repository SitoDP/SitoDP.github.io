import type { ComputedRef } from 'vue'
import { optionalEnv } from '../lib/env'
import type { Product, ProductVariant } from '../types/shop'

const CHECKOUT_ENDPOINT = optionalEnv('VITE_STRIPE_CHECKOUT_URL')

interface DetailedCartItem {
  productId: number
  variantId: number
  quantity: number
  product: Product
  variant: ProductVariant
}

interface CheckoutLineItem {
  productId: number
  variantId: number
  title: string
  variantTitle: string
  price: string
  quantity: number
  image: string | null
}

/**
 * Stripe checkout hook. Takes the detailed cart items as input so it
 * doesn't need to import products.json itself, keeping the composable
 * tree-shakeable.
 */
export function useCheckout(detailedItems: ComputedRef<DetailedCartItem[]>) {
  async function checkout(): Promise<void> {
    if (!CHECKOUT_ENDPOINT) {
      throw new Error(
        'Stripe checkout URL no configurada. Define VITE_STRIPE_CHECKOUT_URL en .env',
      )
    }

    const lineItems: CheckoutLineItem[] = detailedItems.value.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      title: i.product.title,
      variantTitle: i.variant.title,
      price: i.variant.price,
      quantity: i.quantity,
      image: i.product.images[0]?.src ?? null,
    }))

    const successUrl = `${window.location.origin}/carrito?status=success`
    const cancelUrl = `${window.location.origin}/carrito?status=cancel`

    const res = await fetch(CHECKOUT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lineItems, successUrl, cancelUrl }),
    })

    if (!res.ok) {
      throw new Error(`Checkout failed: ${res.status} ${res.statusText}`)
    }

    const { url } = (await res.json()) as { url: string }
    window.location.href = url
  }

  return { checkout }
}
