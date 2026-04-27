import { computed, type ComputedRef } from 'vue'
import { useHead } from '@unhead/vue'
import { useRoute } from 'vue-router'
import { useLanguage } from './useLanguage'
import { ASSETS, SITE_URL } from '../config'

interface Meta {
  title: string
  description: string
  image?: string
}

interface MetaInput {
  es: Meta
  en: Meta
}

/**
 * Sets the page title, description, OG tags, canonical and hreflang
 * for the current route. Call once in `<script setup>` of each view.
 */
export function usePageMeta(input: MetaInput | ComputedRef<MetaInput>) {
  const route = useRoute()
  const { lang } = useLanguage()

  const data = computed(() => {
    const value = 'value' in (input as object) ? (input as ComputedRef<MetaInput>).value : (input as MetaInput)
    return value[lang.value]
  })

  // Build alternate (es / en) URLs for hreflang
  const esPath = computed(() => route.path.replace(/^\/en/, '') || '/')
  const enPath = computed(() => (esPath.value === '/' ? '/en' : `/en${esPath.value}`))

  useHead({
    title: () => `${data.value.title} · Boat Solutions International`,
    meta: [
      { name: 'description', content: () => data.value.description },
      { property: 'og:title', content: () => data.value.title },
      { property: 'og:description', content: () => data.value.description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: () => `${SITE_URL}${route.path}` },
      { property: 'og:image', content: () => data.value.image ?? ASSETS.logo },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    link: [
      { rel: 'canonical', href: () => `${SITE_URL}${route.path}` },
      { rel: 'alternate', hreflang: 'es', href: () => `${SITE_URL}${esPath.value}` },
      { rel: 'alternate', hreflang: 'en', href: () => `${SITE_URL}${enPath.value}` },
      { rel: 'alternate', hreflang: 'x-default', href: () => `${SITE_URL}${esPath.value}` },
    ],
  })
}
