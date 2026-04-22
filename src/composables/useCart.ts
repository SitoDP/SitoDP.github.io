import { computed, ref, watch } from 'vue'
import productsData from '../data/products.json'
import type { Product } from '../types/shop'

const products = productsData as Product[]

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

function findProduct(productId: number) {
  return products.find((p) => p.id === productId)
}

function findVariant(productId: number, variantId: number) {
  return findProduct(productId)?.variants.find((v) => v.id === variantId)
}

export function useCart() {
  const detailedItems = computed(() =>
    items.value
      .map((item) => {
        const product = findProduct(item.productId)
        const variant = findVariant(item.productId, item.variantId)
        if (!product || !variant) return null
        return { ...item, product, variant }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null),
  )

  const itemCount = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))

  const subtotal = computed(() =>
    detailedItems.value.reduce((sum, i) => sum + Number(i.variant.price) * i.quantity, 0),
  )

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
    detailedItems,
    itemCount,
    subtotal,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  }
}
