<template>
  <div class="tienda">
    <section class="hero">
      <div class="hero-overlay"></div>
      <div class="container hero-content">
        <p class="hero-label">{{ t.label }}</p>
        <h1 class="hero-title">{{ t.title }}</h1>
        <p class="hero-subtitle">{{ t.subtitle }}</p>
      </div>
    </section>

    <section class="filter-section">
      <div class="container filter-container">
        <button
          v-show="canScrollLeft"
          class="scroll-arrow scroll-arrow-left"
          @click="scrollChips('left')"
          aria-label="Anterior"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <div class="chips-scroll" ref="chipsEl" @scroll="updateScrollState">
          <button
            class="chip"
            :class="{ active: selectedCollection === null }"
            @click="selectedCollection = null"
          >
            {{ t.all }}
            <span class="chip-count">{{ products.length }}</span>
          </button>
          <button
            v-for="c in sortedCollections"
            :key="c.id"
            class="chip"
            :class="{ active: selectedCollection === c.handle }"
            @click="selectedCollection = c.handle"
          >
            {{ c.title }}
            <span class="chip-count">{{ c.productIds.length }}</span>
          </button>
        </div>

        <button
          v-show="canScrollRight"
          class="scroll-arrow scroll-arrow-right"
          @click="scrollChips('right')"
          aria-label="Siguiente"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </section>

    <section class="section products-section">
      <div class="container">
        <div class="results-header">
          <h2 class="current-category">
            {{ selectedCollection ? (sortedCollections.find(c => c.handle === selectedCollection)?.title ?? t.all) : t.all }}
          </h2>
          <p class="result-count">{{ filteredProducts.length }} {{ t.results }}</p>
        </div>

        <div class="products-grid" v-if="filteredProducts.length">
          <router-link
            v-for="p in filteredProducts"
            :key="p.id"
            :to="to(`/tienda/${p.handle}`)"
            class="product-card"
          >
            <div class="product-image">
              <img
                v-if="p.images[0]"
                :src="p.images[0].src"
                :alt="p.images[0].alt ?? p.title"
                loading="lazy"
              />
              <div v-else class="no-image">—</div>
            </div>
            <div class="product-info">
              <h3>{{ p.title }}</h3>
              <p v-if="p.configurable" class="product-price configurable">{{ t.quotePrice }}</p>
              <p v-else class="product-price">{{ formatPrice(p.price) }}</p>
            </div>
          </router-link>
        </div>
        <p v-else class="empty-state">{{ t.empty }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useLanguage } from '../composables/useLanguage'
import productsData from '../data/products.json'
import collectionsData from '../data/collections.json'
import type { Product, Collection } from '../types/shop'

const { lang, to } = useLanguage()

const products = productsData as Product[]
const collections = collectionsData as Collection[]
const sortedCollections = computed(() =>
  [...collections].filter((c) => c.productIds.length > 0).sort((a, b) => a.title.localeCompare(b.title)),
)

const selectedCollection = ref<string | null>(null)

const chipsEl = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

function updateScrollState() {
  const el = chipsEl.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 4
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
}

function scrollChips(dir: 'left' | 'right') {
  const el = chipsEl.value
  if (!el) return
  el.scrollBy({ left: dir === 'left' ? -el.clientWidth * 0.7 : el.clientWidth * 0.7, behavior: 'smooth' })
}

onMounted(() => {
  nextTick(updateScrollState)
  window.addEventListener('resize', updateScrollState)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScrollState)
})

watch(selectedCollection, () => nextTick(updateScrollState))

const filteredProducts = computed(() => {
  if (!selectedCollection.value) return products
  const col = collections.find((c) => c.handle === selectedCollection.value)
  if (!col) return products
  const ids = new Set(col.productIds)
  return products.filter((p) => ids.has(p.id))
})

const formatPrice = (price: string) =>
  new Intl.NumberFormat(lang.value === 'en' ? 'en-IE' : 'es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(price))

const t = computed(() =>
  lang.value === 'en'
    ? {
        label: 'Shop',
        title: 'Fender Design Store',
        subtitle: 'Premium fenders, yacht textiles and nautical accessories. We handle the order and Fender Design ships directly.',
        categories: 'Categories',
        all: 'All products',
        results: 'products',
        empty: 'No products in this category.',
        quotePrice: 'Request a quote',
      }
    : {
        label: 'Tienda',
        title: 'Productos Fender Design',
        subtitle: 'Defensas premium, textiles náuticos y accesorios. Nosotros gestionamos el pedido y Fender Design lo envía directamente.',
        categories: 'Categorías',
        all: 'Todos los productos',
        results: 'productos',
        empty: 'No hay productos en esta categoría.',
        quotePrice: 'Consultar precio',
      },
)
</script>

<style scoped>
.hero {
  min-height: 40vh;
  display: flex;
  align-items: center;
  position: relative;
  background: var(--color-meteorite-dark);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(8, 16, 24, 0.92) 0%, rgba(66, 104, 135, 0.75) 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
  color: var(--color-light);
  padding: 140px 20px 60px;
  max-width: 820px;
}

.hero-label {
  font-family: var(--font-heading);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-primary-light);
  margin-bottom: 16px;
}

.hero-title { font-size: clamp(2rem, 5vw, 3rem); font-weight: 700; margin-bottom: 20px; }
.hero-subtitle { font-size: 1.05rem; opacity: 0.9; line-height: 1.7; max-width: 680px; }

/* Filter chip bar */
.filter-section {
  background: white;
  border-bottom: 1px solid var(--color-gray-border);
  padding: 20px 0;
  position: sticky;
  top: 68px;
  z-index: 10;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.filter-container {
  position: relative;
  display: flex;
  align-items: center;
}

.chips-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 2px 0;
  flex: 1;
  scroll-behavior: smooth;
  mask-image: linear-gradient(to right, transparent 0, black 40px, black calc(100% - 40px), transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0, black 40px, black calc(100% - 40px), transparent 100%);
}

.chips-scroll::-webkit-scrollbar { display: none; }

.scroll-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: 1px solid var(--color-gray-border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-dark);
  z-index: 2;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: background 0.2s, color 0.2s, transform 0.15s;
}

.scroll-arrow:hover {
  background: var(--color-primary);
  color: white;
  transform: translateY(-50%) scale(1.08);
}

.scroll-arrow-left { left: -4px; }
.scroll-arrow-right { right: -4px; }

.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--color-gray-light);
  border: 1.5px solid transparent;
  border-radius: 999px;
  padding: 9px 18px;
  cursor: pointer;
  font-family: var(--font-heading);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-dark);
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.chip:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.chip.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  box-shadow: 0 4px 14px rgba(66, 104, 135, 0.3);
}

.chip-count {
  background: rgba(255, 255, 255, 0.25);
  color: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 1px 8px;
  border-radius: 999px;
  min-width: 20px;
  text-align: center;
  opacity: 0.7;
}

.chip:not(.active) .chip-count {
  background: rgba(0, 0, 0, 0.06);
  color: var(--color-gray);
}

.products-section { padding-top: 40px; }

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-gray-border);
}

.current-category {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-dark);
}

.result-count {
  font-family: var(--font-heading);
  font-size: 0.82rem;
  color: var(--color-gray);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
}

.product-card {
  background: white;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: transform 0.25s, box-shadow 0.25s;
  color: var(--color-dark);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.product-image {
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--color-gray-light);
}

.product-image img {
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
  font-size: 1.5rem;
}

.product-info { padding: 18px; }

.product-info h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-dark);
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary);
}

.product-price.configurable {
  font-size: 0.85rem;
  color: var(--color-gray);
  font-style: italic;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  color: var(--color-gray);
  padding: 60px 20px;
}

@media (max-width: 700px) {
  .filter-section { top: 60px; padding: 14px 0; }
  .chip { padding: 8px 14px; font-size: 0.8rem; }
  .scroll-arrow { display: none; }
  .chips-scroll {
    mask-image: linear-gradient(to right, black 0, black calc(100% - 24px), transparent 100%);
    -webkit-mask-image: linear-gradient(to right, black 0, black calc(100% - 24px), transparent 100%);
  }
  .results-header {
    flex-direction: column;
    gap: 6px;
    align-items: flex-start;
    margin-bottom: 24px;
  }
  .current-category { font-size: 1.4rem; }
}
</style>
