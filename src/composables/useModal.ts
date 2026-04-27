import { computed, ref, watch, type Ref } from 'vue'

const openCount = ref(0)

/** Reactive flag that any non-modal UI (e.g. floating WhatsApp button) can use to hide itself. */
export const isAnyModalOpen = computed(() => openCount.value > 0)

interface UseModalOptions {
  /** Reactive flag indicating whether the modal is currently open. */
  isOpen: Ref<boolean> | { value: boolean }
  /** Called when the user presses Escape. */
  onClose: () => void
  /** When true, locks the body scroll while the modal is open. Defaults to true. */
  lockScroll?: boolean
}

/**
 * Adds standard a11y/UX behaviours to a modal:
 *  - closes on Escape
 *  - locks body scroll while open
 *  - tracks open count globally so other components can react (e.g. hide
 *    floating WhatsApp button when any modal is showing)
 *
 * Usage in a `<script setup>`:
 *
 *   const props = defineProps<{ isOpen: boolean }>()
 *   const emit = defineEmits<{ close: [] }>()
 *   useModal({ isOpen: toRef(props, 'isOpen'), onClose: () => emit('close') })
 */
export function useModal({ isOpen, onClose, lockScroll = true }: UseModalOptions) {
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen.value) {
      onClose()
    }
  }

  watch(
    () => isOpen.value,
    (open, prev) => {
      if (open && !prev) {
        openCount.value++
        if (lockScroll && typeof document !== 'undefined') {
          document.body.style.overflow = 'hidden'
        }
        if (typeof window !== 'undefined') {
          window.addEventListener('keydown', handleKeydown)
        }
      } else if (!open && prev) {
        openCount.value = Math.max(0, openCount.value - 1)
        if (lockScroll && typeof document !== 'undefined' && openCount.value === 0) {
          document.body.style.overflow = ''
        }
        if (typeof window !== 'undefined') {
          window.removeEventListener('keydown', handleKeydown)
        }
      }
    },
    { immediate: true },
  )
}
