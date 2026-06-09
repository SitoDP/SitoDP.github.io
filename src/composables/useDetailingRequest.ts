import { ref } from 'vue'

export type DetailingLevel = 'basica' | 'pulido' | 'completo' | 'premium'

export interface DetailingPrefill {
  level?: DetailingLevel
  length?: number
  material?: string
}

const isOpen = ref(false)
const prefill = ref<DetailingPrefill>({})

export function useDetailingRequest() {
  function open(p: DetailingPrefill = {}) {
    prefill.value = p
    isOpen.value = true
  }
  function close() {
    isOpen.value = false
  }
  return { isOpen, prefill, open, close }
}
