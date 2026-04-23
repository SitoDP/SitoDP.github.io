<template>
  <div v-if="product" class="product-detail">
    <section class="section detail">
      <div class="container detail-grid">
        <div class="gallery">
          <div class="main-image">
            <img
              v-if="product.images[activeImage]"
              :src="product.images[activeImage].src"
              :alt="product.images[activeImage].alt ?? product.title"
            />
            <div v-else class="no-image">—</div>
          </div>
          <div v-if="product.images.length > 1" class="thumbs">
            <button
              v-for="(img, idx) in product.images"
              :key="idx"
              :class="['thumb', { active: idx === activeImage }]"
              @click="activeImage = idx"
            >
              <img :src="img.src" :alt="img.alt ?? ''" />
            </button>
          </div>
        </div>

        <div class="info">
          <a href="#" class="back-link" @click.prevent="goBack">← {{ t.back }}</a>
          <span v-if="product.configurable" class="product-tag configurable-tag">{{ t.configurable }}</span>
          <span v-else-if="product.type" class="product-tag">{{ product.type }}</span>
          <h1>{{ product.title }}</h1>

          <p v-if="product.configurable" class="price configurable">{{ t.quotePrice }}</p>
          <p v-else class="price">{{ formatPrice(selectedVariant?.price ?? product.price) }}</p>

          <template v-if="!product.configurable">
            <div v-if="product.variants.length > 1" class="variants">
              <label>{{ t.variant }}</label>
              <div class="variant-buttons">
                <button
                  v-for="v in product.variants"
                  :key="v.id"
                  :class="['variant-btn', { active: selectedVariantId === v.id, unavailable: !v.available }]"
                  :disabled="!v.available"
                  @click="selectedVariantId = v.id"
                >
                  {{ v.title }}
                </button>
              </div>
            </div>

            <div class="quantity">
              <label>{{ t.quantity }}</label>
              <div class="qty-control">
                <button @click="quantity = Math.max(1, quantity - 1)">−</button>
                <span>{{ quantity }}</span>
                <button @click="quantity++">+</button>
              </div>
            </div>

            <button
              class="btn btn-primary add-to-cart"
              :disabled="!selectedVariant?.available"
              @click="handleAdd"
            >
              {{ selectedVariant?.available ? t.addToCart : t.unavailable }}
            </button>

            <div v-if="justAdded" class="added-feedback">{{ t.added }}</div>
          </template>

          <template v-else>
            <p class="configurable-note">{{ t.configurableNote }}</p>
            <button class="btn btn-primary add-to-cart" @click="quoteOpen = true">
              {{ t.requestQuote }}
            </button>
          </template>

          <div v-if="product.description" class="description" v-html="product.description"></div>
        </div>
      </div>
    </section>

    <QuoteModal
      :is-open="quoteOpen"
      :product-title="product.title"
      :product-handle="product.handle"
      @close="quoteOpen = false"
    />
  </div>
  <div v-else class="not-found">
    <div class="container">
      <h1>{{ t.notFound }}</h1>
      <router-link :to="to('/tienda')" class="btn btn-primary">← {{ t.back }}</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLanguage } from '../composables/useLanguage'
import { useCart } from '../composables/useCart'
import productsData from '../data/products.json'
import type { Product } from '../types/shop'
import QuoteModal from '../components/QuoteModal.vue'

const route = useRoute()
const router = useRouter()
const { lang, to } = useLanguage()
const { addItem } = useCart()

function goBack() {
  // Vue Router stores the previous URL in history.state.back when navigating within the SPA.
  // If null, the user landed here directly (external referrer) — fall back to /tienda.
  const prev = (window.history.state as { back?: string } | null)?.back
  if (prev && prev.startsWith('/')) {
    router.back()
  } else {
    router.push(to('/tienda'))
  }
}

const products = productsData as Product[]
const product = computed(() => products.find((p) => p.handle === route.params.handle))

const selectedVariantId = ref<number | null>(null)
const quantity = ref(1)
const activeImage = ref(0)
const justAdded = ref(false)
const quoteOpen = ref(false)

watch(
  product,
  (p) => {
    if (p) {
      const firstAvail = p.variants.find((v) => v.available)
      selectedVariantId.value = (firstAvail ?? p.variants[0])?.id ?? null
      activeImage.value = 0
    }
  },
  { immediate: true },
)

const selectedVariant = computed(() =>
  product.value?.variants.find((v) => v.id === selectedVariantId.value),
)

const formatPrice = (price: string) =>
  new Intl.NumberFormat(lang.value === 'en' ? 'en-IE' : 'es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(price))

function handleAdd() {
  if (!product.value || !selectedVariant.value) return
  addItem(product.value.id, selectedVariant.value.id, quantity.value)
  justAdded.value = true
  setTimeout(() => (justAdded.value = false), 2000)
}

const t = computed(() =>
  lang.value === 'en'
    ? {
        back: 'Back to shop',
        variant: 'Variant',
        quantity: 'Quantity',
        addToCart: 'Add to cart',
        unavailable: 'Unavailable',
        added: '✓ Added to cart',
        notFound: 'Product not found',
        configurable: 'Made to order',
        quotePrice: 'Request a quote',
        configurableNote: 'This product is made to measure. Price depends on dimensions, fabric and personalization. Request a quote and we will reply within 24h.',
        requestQuote: 'Request quote',
      }
    : {
        back: 'Volver a la tienda',
        variant: 'Variante',
        quantity: 'Cantidad',
        addToCart: 'Añadir al carrito',
        unavailable: 'No disponible',
        added: '✓ Añadido al carrito',
        notFound: 'Producto no encontrado',
        configurable: 'Hecho a medida',
        quotePrice: 'Consultar precio',
        configurableNote: 'Este producto se fabrica a medida. El precio depende de las dimensiones, el tejido y la personalización. Solicita un presupuesto y te responderemos en menos de 24h.',
        requestQuote: 'Solicitar presupuesto',
      },
)
</script>

<style scoped>
.section.detail { padding-top: 120px; }

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  max-width: 1200px;
  margin: 0 auto;
}

.gallery { display: flex; flex-direction: column; gap: 12px; }

.main-image {
  aspect-ratio: 1;
  background: var(--color-gray-light);
  border-radius: 16px;
  overflow: hidden;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--color-gray);
  font-size: 2rem;
}

.thumbs { display: flex; gap: 10px; overflow-x: auto; }

.thumb {
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  padding: 0;
  background: var(--color-gray-light);
  cursor: pointer;
}

.thumb.active { border-color: var(--color-primary); }

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info { display: flex; flex-direction: column; gap: 20px; }

.back-link {
  font-size: 0.85rem;
  color: var(--color-gray);
  font-family: var(--font-heading);
  letter-spacing: 0.5px;
  transition: color 0.2s;
}

.back-link:hover { color: var(--color-primary); }

.product-tag {
  display: inline-block;
  font-family: var(--font-heading);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 4px 12px;
  border-radius: 20px;
  width: fit-content;
}

.info h1 { font-size: 2rem; color: var(--color-dark); line-height: 1.2; }

.price {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-primary);
}

.price.configurable {
  font-size: 1.1rem;
  color: var(--color-gray);
  font-style: italic;
  font-weight: 600;
}

.configurable-tag {
  background: #fef3c7;
  color: #92400e;
}

.configurable-note {
  background: var(--color-gray-light);
  padding: 14px 18px;
  border-radius: 10px;
  color: var(--color-gray);
  font-size: 0.88rem;
  line-height: 1.6;
}

.variants label,
.quantity label {
  display: block;
  font-family: var(--font-heading);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-dark);
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}

.variant-buttons { display: flex; flex-wrap: wrap; gap: 8px; }

.variant-btn {
  padding: 10px 16px;
  border: 2px solid var(--color-gray-border);
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.88rem;
  color: var(--color-dark);
  transition: all 0.2s;
}

.variant-btn:hover:not(.unavailable) { border-color: var(--color-primary); }

.variant-btn.active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
}

.variant-btn.unavailable {
  opacity: 0.4;
  cursor: not-allowed;
  text-decoration: line-through;
}

.qty-control {
  display: inline-flex;
  align-items: center;
  border: 2px solid var(--color-gray-border);
  border-radius: 8px;
  overflow: hidden;
}

.qty-control button {
  width: 40px;
  height: 40px;
  background: white;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--color-primary);
}

.qty-control button:hover { background: var(--color-gray-light); }

.qty-control span {
  width: 50px;
  text-align: center;
  font-family: var(--font-heading);
  font-weight: 600;
}

.add-to-cart {
  margin-top: 8px;
  padding: 16px 28px;
  font-size: 1rem;
}

.add-to-cart:disabled { opacity: 0.5; cursor: not-allowed; }

.added-feedback {
  padding: 12px 16px;
  background: #d1fae5;
  color: #065f46;
  border-radius: 8px;
  font-family: var(--font-heading);
  font-size: 0.9rem;
}

.description {
  margin-top: 16px;
  padding-top: 24px;
  border-top: 1px solid var(--color-gray-border);
  color: var(--color-gray);
  line-height: 1.7;
}

.description :deep(p) { margin-bottom: 12px; }
.description :deep(h3) { font-size: 1.05rem; color: var(--color-dark); margin: 16px 0 10px; }
.description :deep(ul), .description :deep(ol) { padding-left: 20px; margin-bottom: 12px; }
.description :deep(li) { margin-bottom: 4px; }
.description :deep(hr) { border: none; border-top: 1px solid var(--color-gray-border); margin: 20px 0; }

.not-found {
  padding: 140px 20px 80px;
  text-align: center;
}

.not-found h1 { margin-bottom: 24px; }

@media (max-width: 800px) {
  .detail-grid { grid-template-columns: 1fr; gap: 28px; }
  .info h1 { font-size: 1.5rem; }
  .price { font-size: 1.3rem; }
}
</style>
