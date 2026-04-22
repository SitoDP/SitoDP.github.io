import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BookingModal from '../BookingModal.vue'

vi.stubGlobal('fetch', vi.fn().mockResolvedValue({}))

const factory = (props = {}) =>
  mount(BookingModal, {
    props: { isOpen: true, isConsulting: false, ...props },
    global: { stubs: { Teleport: true } },
  })

describe('BookingModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the form when open', () => {
    const wrapper = factory()
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('shows consulting title when isConsulting is true', () => {
    const wrapper = factory({ isConsulting: true })
    expect(wrapper.find('h2').text()).toContain('Consultoria')
  })

  it('shows booking title when isConsulting is false', () => {
    const wrapper = factory({ isConsulting: false })
    expect(wrapper.find('h2').text()).toContain('Reserva')
  })

  it('shows validation errors on empty submit', async () => {
    const wrapper = factory()
    await wrapper.find('form').trigger('submit')
    const errors = wrapper.findAll('.field-error')
    expect(errors.length).toBeGreaterThan(0)
  })

  it('shows name error when name is empty', async () => {
    const wrapper = factory()
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('nombre es obligatorio')
  })

  it('shows email error when email is invalid', async () => {
    const wrapper = factory()
    await wrapper.find('#bm-name').setValue('Ana García')
    await wrapper.find('#bm-email').setValue('not-an-email')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('email no es válido')
  })

  it('clears field error on input', async () => {
    const wrapper = factory()
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('nombre es obligatorio')
    await wrapper.find('#bm-name').setValue('Ana')
    expect(wrapper.text()).not.toContain('nombre es obligatorio')
  })

  it('emits close when close button is clicked', async () => {
    const wrapper = factory()
    await wrapper.find('.modal-close').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('does not render when isOpen is false', () => {
    const wrapper = factory({ isOpen: false })
    expect(wrapper.find('form').exists()).toBe(false)
  })
})
