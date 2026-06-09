<template>
  <div class="loc-autocomplete" :class="{ 'loc-autocomplete--open': open }">
    <div class="loc-input-wrap">
      <span class="loc-icon" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </span>
      <input
        ref="inputEl"
        :value="text"
        :placeholder="placeholder"
        type="text"
        autocomplete="off"
        spellcheck="false"
        :class="{ 'has-error': error }"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown.down.prevent="moveCursor(1)"
        @keydown.up.prevent="moveCursor(-1)"
        @keydown.enter.prevent="selectCurrent"
        @keydown.esc="close"
      />
      <button
        v-if="text && !loading"
        type="button"
        class="loc-clear"
        aria-label="Borrar"
        @mousedown.prevent="clear"
      >&times;</button>
      <span v-if="loading" class="loc-spinner" aria-hidden></span>
    </div>

    <ul v-if="open && (suggestions.length || emptyMessage)" class="loc-list" role="listbox">
      <li
        v-for="(s, i) in suggestions"
        :key="s.id"
        :class="['loc-item', { 'loc-item--active': i === cursor }]"
        role="option"
        :aria-selected="i === cursor"
        @mousedown.prevent="select(s)"
        @mouseenter="cursor = i"
      >
        <span class="loc-item-label">{{ s.label }}</span>
        <span v-if="s.detail" class="loc-item-detail">{{ s.detail }}</span>
      </li>
      <li v-if="!suggestions.length && emptyMessage" class="loc-empty">{{ emptyMessage }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { searchPlaces, type GeoLocation } from '../lib/geocoding'

interface Props {
  modelValue: GeoLocation | null
  placeholder?: string
  lang?: 'es' | 'en'
  error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  lang: 'es',
  error: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: GeoLocation | null]
}>()

const inputEl = ref<HTMLInputElement | null>(null)
const text = ref<string>(props.modelValue?.label ?? '')
const suggestions = ref<GeoLocation[]>([])
const loading = ref(false)
const open = ref(false)
const cursor = ref(0)
const emptyMessage = ref('')
let debounce: ReturnType<typeof setTimeout> | null = null
let aborter: AbortController | null = null

watch(
  () => props.modelValue,
  (v) => { text.value = v?.label ?? '' },
)

const onInput = (e: Event) => {
  const v = (e.target as HTMLInputElement).value
  text.value = v
  // Si el texto deja de coincidir con la selección activa, deselecciona.
  if (props.modelValue && v !== props.modelValue.label) {
    emit('update:modelValue', null)
  }
  open.value = true
  cursor.value = 0
  emptyMessage.value = ''
  schedule(v)
}

const schedule = (q: string) => {
  if (debounce) clearTimeout(debounce)
  if (aborter) { aborter.abort(); aborter = null }
  if (q.trim().length < 2) {
    suggestions.value = []
    loading.value = false
    return
  }
  loading.value = true
  debounce = setTimeout(() => { void run(q) }, 220)
}

const run = async (q: string) => {
  aborter = new AbortController()
  try {
    const results = await searchPlaces(q, { lang: props.lang, signal: aborter.signal })
    suggestions.value = results
    emptyMessage.value = results.length === 0 ? (props.lang === 'en' ? 'No matches' : 'Sin resultados') : ''
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') return
    suggestions.value = []
    emptyMessage.value = props.lang === 'en' ? 'Service unavailable' : 'Servicio no disponible'
    // eslint-disable-next-line no-console
    console.error('[LocationAutocomplete] photon error', err)
  } finally {
    loading.value = false
    aborter = null
  }
}

const onFocus = () => {
  open.value = true
  if (text.value.trim().length >= 2 && !suggestions.value.length) schedule(text.value)
}

const onBlur = () => {
  // Pequeño delay para permitir que el click en una sugerencia se procese
  setTimeout(() => { open.value = false }, 120)
}

const moveCursor = (delta: number) => {
  if (!suggestions.value.length) return
  open.value = true
  const len = suggestions.value.length
  cursor.value = (cursor.value + delta + len) % len
}

const selectCurrent = () => {
  const s = suggestions.value[cursor.value]
  if (s) select(s)
}

const select = (s: GeoLocation) => {
  text.value = s.label
  open.value = false
  suggestions.value = []
  emit('update:modelValue', s)
}

const clear = () => {
  text.value = ''
  suggestions.value = []
  open.value = false
  emit('update:modelValue', null)
  inputEl.value?.focus()
}

const close = () => { open.value = false }
</script>

<style scoped>
.loc-autocomplete {
  position: relative;
}

.loc-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.loc-icon {
  position: absolute;
  left: 14px;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  pointer-events: none;
}

.loc-input-wrap input {
  width: 100%;
  padding: 12px 40px 12px 42px;
  border: 2px solid var(--color-gray-border);
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: var(--font-body);
  background: white;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.loc-input-wrap input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.loc-input-wrap input.has-error {
  border-color: #dc2626;
}

.loc-clear {
  position: absolute;
  right: 10px;
  width: 22px;
  height: 22px;
  border: none;
  background: var(--color-gray-light);
  color: var(--color-gray);
  border-radius: 50%;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loc-clear:hover { background: var(--color-gray-border); color: var(--color-dark); }

.loc-spinner {
  position: absolute;
  right: 14px;
  width: 14px;
  height: 14px;
  border: 2px solid var(--color-gray-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: loc-spin 0.7s linear infinite;
}

@keyframes loc-spin { to { transform: rotate(360deg); } }

.loc-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  margin: 0;
  padding: 6px;
  list-style: none;
  background: white;
  border: 1px solid var(--color-gray-border);
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(13, 20, 26, 0.12);
  max-height: 280px;
  overflow-y: auto;
}

.loc-item {
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: background 0.12s;
}

.loc-item:hover,
.loc-item--active {
  background: var(--color-primary-light);
}

.loc-item-label {
  font-size: 0.93rem;
  color: var(--color-dark);
  font-weight: 500;
  font-family: var(--font-heading);
}

.loc-item-detail {
  font-size: 0.78rem;
  color: var(--color-gray);
}

.loc-empty {
  padding: 12px;
  color: var(--color-gray);
  font-size: 0.85rem;
  text-align: center;
  font-style: italic;
}
</style>
