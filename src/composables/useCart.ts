import { computed, ref, watch } from 'vue'
import type { Product } from '../types/shop'

interface CartItem {
  productId: number
  variantId: number
  quantity: number
}

const STORAGE_KEY = 'boat-solutions-cart'

function load(): CartItem[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

const items = ref<CartItem[]>(load())

watch(items, (v) => localStorage.setItem(STORAGE_KEY, JSON.stringify(v)), { deep: true })

/**
 * Lightweight cart composable. Holds only the cart items + count, no
 * product catalog dependency. Use `useCartDetails` from views that need
 * full product info (Carrito, checkout) so the catalog JSON only ships
 * to the routes that actually need it.
 */
export function useCart() {
  const itemCount = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))

  function addItem(productId: number, variantId: number, quantity = 1) {
    const existing = items.value.find(
      (i) => i.productId === productId && i.variantId === variantId,
    )
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({ productId, variantId, quantity })
    }
  }

  function updateQuantity(productId: number, variantId: number, quantity: number) {
    const existing = items.value.find(
      (i) => i.productId === productId && i.variantId === variantId,
    )
    if (!existing) return
    if (quantity <= 0) {
      removeItem(productId, variantId)
    } else {
      existing.quantity = quantity
    }
  }

  function removeItem(productId: number, variantId: number) {
    items.value = items.value.filter(
      (i) => !(i.productId === productId && i.variantId === variantId),
    )
  }

  function clearCart() {
    items.value = []
  }

  return {
    items,
    itemCount,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  }
}

/**
 * Cart with full product/variant lookup. Imports `products.json`, so
 * only call from routes that actually render product info (Carrito,
 * useCheckout). The Header should keep using `useCart()` for the badge.
 */
export function useCartDetails(products: Product[]) {
  const productMap = new Map(products.map((p) => [p.id, p]))

  const detailedItems = computed(() =>
    items.value
      .map((item) => {
        const product = productMap.get(item.productId)
        const variant = product?.variants.find((v) => v.id === item.variantId)
        if (!product || !variant) return null
        return { ...item, product, variant }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null),
  )

  const subtotal = computed(() =>
    detailedItems.value.reduce((sum, i) => sum + Number(i.variant.price) * i.quantity, 0),
  )

  return { detailedItems, subtotal }
}
