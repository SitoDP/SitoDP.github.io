import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { i18n, type PageKey } from '../i18n'

export type Lang = 'es' | 'en'

export function useLanguage() {
  const route = useRoute()
  const router = useRouter()

  const lang = computed<Lang>(() =>
    route.path.startsWith('/en') ? 'en' : 'es'
  )

  const to = (esPath: string): string => {
    if (lang.value === 'en') {
      return esPath === '/' ? '/en' : '/en' + esPath
    }
    return esPath
  }

  const switchLang = (target: Lang) => {
    if (target === lang.value) return
    const path = route.path
    if (target === 'en') {
      router.push(path === '/' ? '/en' : '/en' + path)
    } else {
      router.push(path.replace(/^\/en/, '') || '/')
    }
  }

  const useT = <K extends PageKey>(page: K) =>
    computed(() => i18n[lang.value][page] as typeof i18n['es'][K])

  return { lang, to, switchLang, useT }
}
