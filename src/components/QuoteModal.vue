<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <button class="modal-close" @click="close" aria-label="Cerrar">&times;</button>
        <h2>{{ t.title }}</h2>
        <p class="modal-subtitle">{{ productTitle }}</p>

        <form v-if="!success" @submit.prevent="handleSubmit" class="quote-form" novalidate>
          <div class="form-group">
            <label for="qm-name">{{ t.name }}</label>
            <input
              id="qm-name"
              v-model="form.name"
              type="text"
              :placeholder="t.namePlaceholder"
              :class="{ 'input-error': errors.name }"
              @input="errors.name = ''"
            />
            <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
          </div>

          <div class="form-group">
            <label for="qm-email">{{ t.email }}</label>
            <input
              id="qm-email"
              v-model="form.email"
              type="email"
              placeholder="tu@email.com"
              :class="{ 'input-error': errors.email }"
              @input="errors.email = ''"
            />
            <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label for="qm-phone">{{ t.phone }}</label>
            <input
              id="qm-phone"
              v-model="form.phone"
              type="tel"
              placeholder="+34 XXX XXX XXX"
            />
          </div>

          <div class="form-group">
            <label for="qm-specs">{{ t.specs }}</label>
            <textarea
              id="qm-specs"
              v-model="form.specs"
              rows="4"
              :placeholder="t.specsPlaceholder"
              :class="{ 'input-error': errors.specs }"
              @input="errors.specs = ''"
            ></textarea>
            <span v-if="errors.specs" class="field-error">{{ errors.specs }}</span>
          </div>

          <button type="submit" class="btn btn-primary submit-btn" :disabled="submitting">
            {{ submitting ? t.sending : t.submit }}
          </button>

          <p v-if="submitError" class="error-msg">{{ t.error }}</p>
        </form>

        <div v-else class="success-state">
          <div class="success-icon">✓</div>
          <h3>{{ t.successTitle }}</h3>
          <p>{{ t.successMessage }}</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useLanguage } from '../composables/useLanguage'

interface Props {
  isOpen: boolean
  productTitle: string
  productHandle: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()

const { lang } = useLanguage()

const SCRIPT_URL = import.meta.env.VITE_SCRIPT_URL as string

const form = reactive({ name: '', email: '', phone: '', specs: '' })
const errors = reactive({ name: '', email: '', specs: '' })
const submitting = ref(false)
const submitError = ref(false)
const success = ref(false)

watch(
  () => props.isOpen,
  (v) => {
    if (v) {
      success.value = false
      submitError.value = false
      Object.assign(form, { name: '', email: '', phone: '', specs: '' })
      Object.assign(errors, { name: '', email: '', specs: '' })
    }
  },
)

function close() {
  emit('close')
}

function validate(): boolean {
  let valid = true
  errors.name = ''
  errors.email = ''
  errors.specs = ''

  if (!form.name.trim()) {
    errors.name = t.value.errName
    valid = false
  }
  if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = t.value.errEmail
    valid = false
  }
  if (!form.specs.trim() || form.specs.trim().length < 10) {
    errors.specs = t.value.errSpecs
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validate()) return
  submitting.value = true
  submitError.value = false

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'quote',
        product: props.productTitle,
        productHandle: props.productHandle,
        ...form,
      }),
      signal: controller.signal,
    })
    success.value = true
    setTimeout(close, 4000)
  } catch {
    submitError.value = true
  } finally {
    clearTimeout(timeout)
    submitting.value = false
  }
}

const t = computed(() =>
  lang.value === 'en'
    ? {
        title: 'Request a quote',
        name: 'Full name',
        namePlaceholder: 'Your name',
        email: 'Email',
        phone: 'Phone',
        specs: 'Customization details',
        specsPlaceholder: 'Dimensions, fabric colour, custom text/logo, desired quantity...',
        submit: 'Request quote',
        sending: 'Sending...',
        successTitle: 'Request sent',
        successMessage: "We'll reply with a personalized quote within 24h.",
        error: 'Something went wrong. Please try again or email us directly.',
        errName: 'Please enter your name',
        errEmail: 'Please enter a valid email',
        errSpecs: 'Describe what you need (min. 10 characters)',
      }
    : {
        title: 'Solicitar presupuesto',
        name: 'Nombre completo',
        namePlaceholder: 'Tu nombre',
        email: 'Email',
        phone: 'Teléfono',
        specs: 'Detalles de personalización',
        specsPlaceholder: 'Medidas, color de tela, texto/logo a bordar, cantidad deseada...',
        submit: 'Solicitar presupuesto',
        sending: 'Enviando...',
        successTitle: 'Solicitud enviada',
        successMessage: 'Te responderemos con un presupuesto personalizado en menos de 24h.',
        error: 'Ha ocurrido un error. Intenta de nuevo o escríbenos directamente.',
        errName: 'Introduce tu nombre',
        errEmail: 'Introduce un email válido',
        errSpecs: 'Describe lo que necesitas (mín. 10 caracteres)',
      },
)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background: var(--color-light);
  border-radius: 16px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 20px;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: var(--color-gray);
  line-height: 1;
}

.modal-close:hover { color: var(--color-dark); }

.modal-content h2 {
  font-size: 1.5rem;
  color: var(--color-dark);
  margin-bottom: 6px;
}

.modal-subtitle {
  color: var(--color-primary);
  font-family: var(--font-heading);
  font-size: 0.95rem;
  margin-bottom: 24px;
}

.quote-form { display: flex; flex-direction: column; gap: 16px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }

.form-group label {
  font-family: var(--font-heading);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-dark);
}

.form-group input,
.form-group textarea {
  padding: 11px 14px;
  border: 2px solid var(--color-gray-border);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.92rem;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.form-group textarea { resize: vertical; font-family: inherit; }

.form-group input:focus,
.form-group textarea:focus { outline: none; border-color: var(--color-primary); }

.input-error { border-color: #dc2626 !important; }

.field-error {
  color: #dc2626;
  font-size: 0.78rem;
  font-family: var(--font-body);
}

.submit-btn {
  margin-top: 8px;
  padding: 14px;
  font-size: 0.95rem;
}

.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.error-msg {
  padding: 10px 14px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 6px;
  font-size: 0.85rem;
  margin-top: 4px;
}

.success-state {
  text-align: center;
  padding: 20px 10px;
}

.success-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 20px;
  border-radius: 50%;
  background: #d1fae5;
  color: #065f46;
  font-size: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-state h3 {
  font-size: 1.25rem;
  color: var(--color-dark);
  margin-bottom: 10px;
}

.success-state p {
  color: var(--color-gray);
  line-height: 1.6;
}

@media (max-width: 500px) {
  .modal-content { padding: 28px 20px; }
}
</style>
