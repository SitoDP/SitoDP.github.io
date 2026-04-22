<template>
  <div class="carrito">
    <section class="section carrito-section">
      <div class="container">
        <h1 class="page-title">{{ t.title }}</h1>

        <div v-if="statusMessage" :class="['status-banner', statusClass]">{{ statusMessage }}</div>

        <div v-if="detailedItems.length === 0" class="empty">
          <p>{{ t.empty }}</p>
          <router-link :to="to('/tienda')" class="btn btn-primary">{{ t.goShop }}</router-link>
        </div>

        <div v-else class="cart-layout">
          <div class="items">
            <div v-for="item in detailedItems" :key="`${item.productId}-${item.variantId}`" class="item">
              <router-link :to="to(`/tienda/${item.product.handle}`)" class="item-img">
                <img
                  v-if="item.product.images[0]"
                  :src="item.product.images[0].src"
                  :alt="item.product.title"
                />
              </router-link>
              <div class="item-body">
                <router-link :to="to(`/tienda/${item.product.handle}`)" class="item-title">
                  {{ item.product.title }}
                </router-link>
                <p v-if="item.product.variants.length > 1" class="item-variant">{{ item.variant.title }}</p>
                <p class="item-price">{{ formatPrice(item.variant.price) }}</p>
                <div class="item-controls">
                  <div class="qty-control">
                    <button @click="updateQuantity(item.productId, item.variantId, item.quantity - 1)">−</button>
                    <span>{{ item.quantity }}</span>
                    <button @click="updateQuantity(item.productId, item.variantId, item.quantity + 1)">+</button>
                  </div>
                  <button class="remove-btn" @click="removeItem(item.productId, item.variantId)">
                    {{ t.remove }}
                  </button>
                </div>
              </div>
              <div class="item-total">
                {{ formatPrice(String(Number(item.variant.price) * item.quantity)) }}
              </div>
            </div>
          </div>

          <aside class="summary">
            <h3>{{ t.summary }}</h3>
            <div class="row">
              <span>{{ t.subtotal }}</span>
              <span>{{ formatPrice(String(subtotal)) }}</span>
            </div>
            <div class="row small">
              <span>{{ t.shipping }}</span>
              <span>{{ t.shippingNote }}</span>
            </div>
            <div class="row total">
              <span>{{ t.total }}</span>
              <span>{{ formatPrice(String(subtotal)) }}</span>
            </div>
            <button class="btn btn-primary checkout-btn" :disabled="processing" @click="handleCheckout">
              {{ processing ? t.processing : t.checkout }}
            </button>
            <p v-if="error" class="error">{{ error }}</p>
            <router-link :to="to('/tienda')" class="continue-link">← {{ t.continueShopping }}</router-link>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useLanguage } from '../composables/useLanguage'
import { useCart } from '../composables/useCart'
import { useCheckout } from '../composables/useCheckout'

const route = useRoute()
const { lang, to } = useLanguage()
const { detailedItems, subtotal, updateQuantity, removeItem, clearCart } = useCart()
const { checkout } = useCheckout()

const processing = ref(false)
const error = ref('')
const statusMessage = ref('')
const statusClass = ref<'success' | 'cancel' | ''>('')

onMounted(() => {
  const status = route.query.status as string | undefined
  if (status === 'success') {
    statusMessage.value = t.value.paymentSuccess
    statusClass.value = 'success'
    clearCart()
  } else if (status === 'cancel') {
    statusMessage.value = t.value.paymentCancelled
    statusClass.value = 'cancel'
  }
})

const formatPrice = (price: string) =>
  new Intl.NumberFormat(lang.value === 'en' ? 'en-IE' : 'es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(price))

async function handleCheckout() {
  error.value = ''
  processing.value = true
  try {
    await checkout()
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
    processing.value = false
  }
}

const t = computed(() =>
  lang.value === 'en'
    ? {
        title: 'Cart',
        empty: 'Your cart is empty.',
        goShop: 'Go to shop',
        summary: 'Order summary',
        subtotal: 'Subtotal',
        shipping: 'Shipping',
        shippingNote: 'Calculated at checkout',
        total: 'Total',
        checkout: 'Checkout',
        processing: 'Processing...',
        continueShopping: 'Continue shopping',
        remove: 'Remove',
        paymentSuccess: 'Payment completed. We will process your order with Fender Design shortly.',
        paymentCancelled: 'Payment cancelled. Your cart is still here.',
      }
    : {
        title: 'Carrito',
        empty: 'Tu carrito está vacío.',
        goShop: 'Ir a la tienda',
        summary: 'Resumen del pedido',
        subtotal: 'Subtotal',
        shipping: 'Envío',
        shippingNote: 'Se calcula en el pago',
        total: 'Total',
        checkout: 'Pagar',
        processing: 'Procesando...',
        continueShopping: 'Seguir comprando',
        remove: 'Eliminar',
        paymentSuccess: 'Pago completado. En breve tramitaremos tu pedido con Fender Design.',
        paymentCancelled: 'Pago cancelado. Tu carrito sigue disponible.',
      },
)
</script>

<style scoped>
.carrito-section { padding-top: 120px; }

.page-title { font-size: 2.2rem; margin-bottom: 32px; color: var(--color-dark); }

.empty {
  text-align: center;
  padding: 60px 20px;
}

.empty p { color: var(--color-gray); margin-bottom: 24px; font-size: 1.1rem; }

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 40px;
  align-items: start;
}

.items { display: flex; flex-direction: column; gap: 16px; }

.item {
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  align-items: center;
}

.item-img {
  width: 100px;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  background: var(--color-gray-light);
}

.item-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-title {
  font-weight: 600;
  color: var(--color-dark);
  font-size: 0.95rem;
  display: block;
  margin-bottom: 4px;
}

.item-title:hover { color: var(--color-primary); }

.item-variant {
  font-size: 0.82rem;
  color: var(--color-gray);
  margin-bottom: 8px;
}

.item-price {
  font-family: var(--font-heading);
  font-weight: 600;
  color: var(--color-primary);
  font-size: 0.95rem;
  margin-bottom: 12px;
}

.item-controls { display: flex; align-items: center; gap: 16px; }

.qty-control {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--color-gray-border);
  border-radius: 6px;
  overflow: hidden;
}

.qty-control button {
  width: 32px;
  height: 32px;
  background: white;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: var(--color-primary);
}

.qty-control button:hover { background: var(--color-gray-light); }

.qty-control span {
  width: 36px;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.remove-btn {
  background: none;
  border: none;
  color: var(--color-gray);
  font-size: 0.82rem;
  cursor: pointer;
  padding: 4px 8px;
  transition: color 0.2s;
}

.remove-btn:hover { color: #dc2626; }

.item-total {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--color-dark);
}

.summary {
  background: white;
  padding: 28px;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 100px;
}

.summary h3 {
  font-size: 1.15rem;
  margin-bottom: 20px;
  color: var(--color-dark);
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  color: var(--color-gray);
  font-size: 0.95rem;
}

.row.small { font-size: 0.83rem; }

.row.total {
  border-top: 1px solid var(--color-gray-border);
  margin-top: 8px;
  padding-top: 16px;
  color: var(--color-dark);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1.15rem;
}

.checkout-btn {
  width: 100%;
  margin-top: 20px;
  padding: 14px;
  font-size: 1rem;
}

.checkout-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.continue-link {
  display: block;
  margin-top: 16px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-gray);
  transition: color 0.2s;
}

.continue-link:hover { color: var(--color-primary); }

.error {
  margin-top: 12px;
  padding: 10px 14px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 6px;
  font-size: 0.85rem;
}

.status-banner {
  padding: 16px 20px;
  border-radius: 10px;
  margin-bottom: 28px;
  font-size: 0.95rem;
}

.status-banner.success { background: #d1fae5; color: #065f46; }
.status-banner.cancel { background: #fef3c7; color: #92400e; }

@media (max-width: 800px) {
  .cart-layout { grid-template-columns: 1fr; }
  .summary { position: static; }
  .item { grid-template-columns: 80px 1fr; }
  .item-img { width: 80px; height: 80px; }
  .item-total { grid-column: 1 / -1; text-align: right; }
}
</style>
