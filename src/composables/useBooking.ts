import { computed, ref } from 'vue'

export type BookingType = 'booking' | 'consulting'

const isOpen = ref(false)
const bookingType = ref<BookingType>('booking')

export function useBooking() {
  const isConsulting = computed(() => bookingType.value === 'consulting')

  function open(type: BookingType = 'booking') {
    bookingType.value = type
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return { isOpen, bookingType, isConsulting, open, close }
}
