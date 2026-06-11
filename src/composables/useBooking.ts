import { computed, ref } from 'vue'

export type BookingType = 'booking' | 'consulting'

export interface BookingPrefill {
  date?: string  // YYYY-MM-DD
  time?: string  // HH:MM
}

const isOpen = ref(false)
const bookingType = ref<BookingType>('booking')
const prefill = ref<BookingPrefill>({})

export function useBooking() {
  const isConsulting = computed(() => bookingType.value === 'consulting')

  function open(type: BookingType = 'booking', prefilledData?: BookingPrefill) {
    bookingType.value = type
    prefill.value = prefilledData ?? {}
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return { isOpen, bookingType, isConsulting, prefill, open, close }
}
