import { ref } from 'vue'
import type { GeoLocation } from '../lib/geocoding'

/**
 * Pre-relleno opcional cuando se abre el modal desde la calculadora.
 * Si se abre desde el botón del hero/booking, se abre vacío.
 */
export interface TransportPrefill {
  type?: 'maritimo' | 'terrestre'
  boatType?: string
  length?: number
  manga?: number
  peso?: number
  origin?: GeoLocation | null
  destination?: GeoLocation | null
  distance?: number
  estimate?: string
}

const isOpen = ref(false)
const prefill = ref<TransportPrefill>({})

export function useTransportRequest() {
  function open(p: TransportPrefill = {}) {
    prefill.value = p
    isOpen.value = true
  }
  function close() {
    isOpen.value = false
  }
  return { isOpen, prefill, open, close }
}
