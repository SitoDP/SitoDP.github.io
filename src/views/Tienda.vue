<template>
  <div class="tienda">
    <HeroSection min-height="40vh" max-width="820px" overlay="darkest">
      <p class="hero-label">{{ t.label }}</p>
      <h1 class="hero-title">{{ t.title }}</h1>
      <p class="hero-subtitle">{{ t.subtitle }}</p>
    </HeroSection>

    <!-- Top-level category tabs -->
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
            class="chip chip-top"
            :class="{ active: selectedTop === null }"
            @click="selectTop(null)"
          >
            {{ t.all }}
            <span class="chip-count">{{ products.length }}</span>
          </button>
          <button
            v-for="cat in categoryTree"
            :key="cat.id"
            class="chip chip-top"
            :class="{ active: selectedTop === cat.id }"
            @click="selectTop(cat.id)"
          >
            {{ lang === 'en' ? cat.title.en : cat.title.es }}
            <span class="chip-count">{{ countForTop(cat.id) }}</span>
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

      <!-- Subcategory chip bar -->
      <Transition name="subchips">
        <div v-if="activeTop" class="sub-section">
          <div class="container">
            <div class="chips-scroll sub-chips">
              <button
                class="chip chip-sub"
                :class="{ active: selectedSub === null }"
                @click="selectedSub = null"
              >
                {{ t.seeAllIn }} {{ lang === 'en' ? activeTop.title.en : activeTop.title.es }}
              </button>
              <button
                v-for="handle in availableSubs"
                :key="handle"
                class="chip chip-sub"
                :class="{ active: selectedSub === handle }"
                @click="selectedSub = handle"
              >
                {{ collectionMap.get(handle)?.title ?? handle }}
                <span class="chip-count">{{ collectionMap.get(handle)?.productIds.length ?? 0 }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </section>

    <!-- Search bar -->
    <section class="search-section">
      <div class="container">
        <div class="search-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            :placeholder="t.searchPlaceholder"
            :aria-label="t.searchAriaLabel"
            class="search-input"
          />
          <button v-if="searchQuery" class="search-clear" :aria-label="t.clearSearch" @click="searchQuery = ''">×</button>
        </div>
      </div>
    </section>

    <section class="section products-section">
      <div class="container">
        <div class="results-header">
          <h2 class="current-category">{{ currentTitle }}</h2>
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
import { useRoute, useRouter } from 'vue-router'
import HeroSection from '../components/HeroSection.vue'
import { useLanguage } from '../composables/useLanguage'
import { usePageMeta } from '../composables/useMeta'
import productsData from '../data/products.json'
import collectionsData from '../data/collections.json'
import { categoryTree } from '../data/category-tree'
import type { Product, Collection } from '../types/shop'

usePageMeta({
  es: {
    title: 'Tienda Fender Design',
    description: 'Defensas premium, textiles náuticos y accesorios Fender Design. Pedido gestionado por Boat Solutions, envío directo desde Fender.',
  },
  en: {
    title: 'Fender Design Shop',
    description: 'Premium fenders, yacht textiles and Fender Design accessories. Boat Solutions handles the order, Fender ships directly.',
  },
})

const { lang, to, useT } = useLanguage()
const t = useT('shop')
const route = useRoute()
const router = useRouter()

const products = productsData as Product[]
const collections = collectionsData as Collection[]
const collectionMap = new Map(collections.map((c) => [c.handle, c]))

const selectedTop = ref<string | null>((route.query.cat as string) || null)
const selectedSub = ref<string | null>((route.query.sub as string) || null)
const searchQuery = ref<string>((route.query.q as string) || '')

// Sync selection → URL (using replace to avoid polluting history)
watch([selectedTop, selectedSub, searchQuery], ([top, sub, q]) => {
  const query: Record<string, string> = {}
  if (top) query.cat = top
  if (sub) query.sub = sub
  if (q) query.q = q
  if (
    (route.query.cat ?? null) === top &&
    (route.query.sub ?? null) === sub &&
    (route.query.q ?? '') === (q || '')
  ) return
  router.replace({ query })
})

// Sync URL → selection (when user uses browser back/forward)
watch(
  () => route.query,
  (q) => {
    const cat = (q.cat as string) || null
    const sub = (q.sub as string) || null
    const search = (q.q as string) || ''
    if (selectedTop.value !== cat) selectedTop.value = cat
    if (selectedSub.value !== sub) selectedSub.value = sub
    if (searchQuery.value !== search) searchQuery.value = search
  },
)

const activeTop = computed(() => categoryTree.find((c) => c.id === selectedTop.value) ?? null)

const availableSubs = computed(() => {
  if (!activeTop.value) return []
  return activeTop.value.subcategories.filter((h) => {
    const col = collectionMap.get(h)
    return col && col.productIds.length > 0
  })
})

function selectTop(id: string | null) {
  selectedTop.value = id
  selectedSub.value = null
}

function countForTop(id: string): number {
  const cat = categoryTree.find((c) => c.id === id)
  if (!cat) return 0
  const ids = new Set<number>()
  for (const handle of cat.subcategories) {
    const col = collectionMap.get(handle)
    if (col) col.productIds.forEach((pid) => ids.add(pid))
  }
  return ids.size
}

const filteredProducts = computed(() => {
  let result = products

  if (selectedSub.value) {
    const col = collectionMap.get(selectedSub.value)
    if (col) {
      const ids = new Set(col.productIds)
      result = result.filter((p) => ids.has(p.id))
    }
  } else if (activeTop.value) {
    const ids = new Set<number>()
    for (const handle of activeTop.value.subcategories) {
      const col = collectionMap.get(handle)
      if (col) col.productIds.forEach((pid) => ids.add(pid))
    }
    result = result.filter((p) => ids.has(p.id))
  }

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    result = result.filter((p) => {
      if (p.title.toLowerCase().includes(q)) return true
      if (p.type && p.type.toLowerCase().includes(q)) return true
      if (p.tags.some((tag) => tag.toLowerCase().includes(q))) return true
      return false
    })
  }

  return result
})

const currentTitle = computed(() => {
  if (selectedSub.value) return collectionMap.get(selectedSub.value)?.title ?? t.value.all
  if (activeTop.value) return lang.value === 'en' ? activeTop.value.title.en : activeTop.value.title.es
  return t.value.all
})

const formatPrice = (price: string) =>
  new Intl.NumberFormat(lang.value === 'en' ? 'en-IE' : 'es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(price))

// Horizontal scroll handling
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

watch([selectedTop, selectedSub], () => nextTick(updateScrollState))

</script>

<style scoped>
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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-gray-border);
  padding: 20px 0 0;
  position: sticky;
  top: 68px;
  z-index: 10;
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
  padding: 2px 0 20px;
  flex: 1;
  scroll-behavior: smooth;
  mask-image: linear-gradient(to right, transparent 0, black 40px, black calc(100% - 40px), transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0, black 40px, black calc(100% - 40px), transparent 100%);
}

.chips-scroll::-webkit-scrollbar { display: none; }

.scroll-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-60%);
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
  transform: translateY(-60%) scale(1.08);
}

.scroll-arrow-left { left: -4px; }
.scroll-arrow-right { right: -4px; }

.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1.5px solid transparent;
  border-radius: 999px;
  cursor: pointer;
  font-family: var(--font-heading);
  font-weight: 600;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.chip-top {
  background: var(--color-gray-light);
  padding: 10px 20px;
  font-size: 0.9rem;
  color: var(--color-dark);
}

.chip-top:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.chip-top.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  box-shadow: 0 4px 14px rgba(66, 104, 135, 0.3);
}

.chip-sub {
  background: transparent;
  border: 1.5px solid var(--color-gray-border);
  padding: 7px 14px;
  font-size: 0.8rem;
  color: var(--color-gray);
  font-weight: 500;
}

.chip-sub:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.chip-sub.active {
  background: var(--color-dark);
  color: white;
  border-color: var(--color-dark);
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
  opacity: 0.75;
}

.chip:not(.active) .chip-count {
  background: rgba(0, 0, 0, 0.06);
  color: var(--color-gray);
}

/* Sub-category row */
.sub-section {
  background: var(--color-gray-light);
  border-top: 1px solid var(--color-gray-border);
  padding: 12px 0;
}

.sub-chips { padding: 2px 0; }

.subchips-enter-active,
.subchips-leave-active {
  transition: opacity 0.25s ease, max-height 0.3s ease;
  overflow: hidden;
}

.subchips-enter-from,
.subchips-leave-to {
  opacity: 0;
  max-height: 0;
}

.subchips-enter-to,
.subchips-leave-from {
  opacity: 1;
  max-height: 80px;
}

/* Product grid */
/* Search bar */
.search-section {
  padding: 24px 0 0;
  background: white;
}

.search-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-gray-light);
  border-radius: 999px;
  padding: 10px 18px;
  max-width: 480px;
  border: 1.5px solid transparent;
  transition: border-color 0.2s, background 0.2s;
}

.search-wrap:focus-within {
  border-color: var(--color-primary);
  background: white;
}

.search-wrap svg { color: var(--color-gray); flex-shrink: 0; }

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-dark);
  min-width: 0;
}

.search-input::placeholder { color: var(--color-gray); }

.search-clear {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  color: var(--color-gray);
  padding: 0 4px;
}

.search-clear:hover { color: var(--color-dark); }

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
  .filter-section { top: 60px; padding: 14px 0 0; }
  .chip-top { padding: 8px 14px; font-size: 0.8rem; }
  .chip-sub { padding: 6px 12px; font-size: 0.75rem; }
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
