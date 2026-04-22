import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useToast } from '../useToast'

describe('useToast', () => {
  beforeEach(() => {
    const { toasts } = useToast()
    toasts.value = []
    vi.useFakeTimers()
  })

  it('adds a toast with the correct properties', () => {
    const { show, toasts } = useToast()
    show('Mensaje de prueba', 'success')
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0].message).toBe('Mensaje de prueba')
    expect(toasts.value[0].type).toBe('success')
  })

  it('defaults type to info', () => {
    const { show, toasts } = useToast()
    show('Info')
    expect(toasts.value[0].type).toBe('info')
  })

  it('removes toast after duration', () => {
    const { show, toasts } = useToast()
    show('Auto-dismiss', 'success', 2000)
    expect(toasts.value).toHaveLength(1)
    vi.advanceTimersByTime(2000)
    expect(toasts.value).toHaveLength(0)
  })

  it('dismisses a toast by id', () => {
    const { show, dismiss, toasts } = useToast()
    show('A', 'info')
    show('B', 'error')
    const id = toasts.value[0].id
    dismiss(id)
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0].message).toBe('B')
  })

  it('handles dismiss of non-existent id gracefully', () => {
    const { dismiss, toasts } = useToast()
    expect(() => dismiss(9999)).not.toThrow()
    expect(toasts.value).toHaveLength(0)
  })
})
