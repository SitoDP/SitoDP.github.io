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

    <section class="section">
      <div class="container tienda-layout">
        <aside class="sidebar">
          <h3 class="sidebar-title">{{ t.categories }}</h3>
          <button
            class="category-btn"
            :class="{ active: selectedCollection === null }"
            @click="selectedCollection = null"
          >
            {{ t.all }} <span class="count">({{ products.length }})</span>
          </button>
          <button
            v-for="c in sortedCollections"
            :key="c.id"
            class="category-btn"
            :class="{ active: selectedCollection === c.handle }"
            @click="selectedCollection = c.handle"
          >
            {{ c.title }} <span class="count">({{ c.productIds.length }})</span>
          </button>
        </aside>

        <div class="grid-wrap">
          <p class="result-count">{{ filteredProducts.length }} {{ t.results }}</p>
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
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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

.tienda-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 40px;
  align-items: start;
}

.sidebar {
  position: sticky;
  top: 100px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-title {
  font-family: var(--font-heading);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--color-gray);
  margin-bottom: 12px;
}

.category-btn {
  text-align: left;
  background: none;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.92rem;
  color: var(--color-dark);
  transition: background 0.2s, color 0.2s;
}

.category-btn:hover { background: var(--color-gray-light); }

.category-btn.active {
  background: var(--color-primary);
  color: white;
}

.count { opacity: 0.55; font-size: 0.8rem; margin-left: 4px; }

.result-count {
  font-family: var(--font-heading);
  font-size: 0.85rem;
  color: var(--color-gray);
  margin-bottom: 20px;
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

@media (max-width: 900px) {
  .tienda-layout { grid-template-columns: 1fr; }
  .sidebar {
    position: static;
    flex-direction: row;
    overflow-x: auto;
    gap: 8px;
    padding-bottom: 12px;
  }
  .sidebar-title { display: none; }
  .category-btn { white-space: nowrap; flex-shrink: 0; }
}
</style>
