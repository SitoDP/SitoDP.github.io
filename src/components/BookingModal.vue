<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <button class="modal-close" @click="close" :aria-label="t.ariaClose">&times;</button>
        <h2>{{ isConsulting ? t.titleConsulting : t.titleBooking }}</h2>
        <p class="modal-subtitle">{{ t.subtitle }}</p>

        <form v-if="!success" @submit.prevent="handleSubmit" class="booking-form" novalidate>
          <div class="form-group">
            <label for="bm-name">{{ t.labelName }}</label>
            <input
              id="bm-name"
              v-model="form.name"
              type="text"
              :placeholder="t.placeholderName"
              :class="{ 'input-error': errors.name }"
              @input="errors.name = ''"
            />
            <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
          </div>

          <div class="form-group">
            <label for="bm-email">{{ t.labelEmail }}</label>
            <input
              id="bm-email"
              v-model="form.email"
              type="email"
              placeholder="tu@email.com"
              autocomplete="email"
              inputmode="email"
              :class="{ 'input-error': errors.email || emailFeedback?.errorCode }"
              @input="errors.email = ''; emailFeedback = null"
              @blur="onEmailBlur"
            />
            <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
            <span v-else-if="emailFeedback?.errorCode === 'typo'" class="field-error">
              {{ t.emailTypoPrefix }}
              <button type="button" class="email-suggestion" @click="applyEmailSuggestion">
                {{ emailFeedback.suggestion }}</button>{{ t.emailTypoSuffix }}
            </span>
            <span v-else-if="emailFeedback?.errorCode" class="field-error">
              {{ emailErrorMessage }}
            </span>
          </div>

          <div class="form-group">
            <label for="bm-phone">{{ t.labelPhone }}</label>
            <input
              id="bm-phone"
              v-model="form.phone"
              type="tel"
              placeholder="+34 XXX XXX XXX"
              :class="{ 'input-error': errors.phone }"
              @input="errors.phone = ''"
            />
            <span v-if="errors.phone" class="field-error">{{ errors.phone }}</span>
          </div>

          <div class="form-group">
            <label for="bm-boat">{{ t.labelBoatType }}</label>
            <select id="bm-boat" v-model="form.boatType">
              <option value="">{{ t.selectPlaceholder }}</option>
              <option value="velero">{{ t.boatVelero }}</option>
              <option value="yate">{{ t.boatYate }}</option>
              <option value="lancha">{{ t.boatLancha }}</option>
              <option value="catamaran">{{ t.boatCatamaran }}</option>
              <option value="otro">{{ t.boatOtro }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="bm-date">{{ t.labelDate }}</label>
            <input
              id="bm-date"
              v-model="form.date"
              type="date"
              :min="minDate"
              :class="{ 'input-error': errors.date }"
              @change="errors.date = ''"
            />
            <span v-if="errors.date" class="field-error">{{ errors.date }}</span>
          </div>

          <div class="form-group">
            <label for="bm-time">{{ t.labelTime }}</label>
            <select
              id="bm-time"
              v-model="form.time"
              :class="{ 'input-error': errors.time }"
              @change="errors.time = ''"
            >
              <option value="">{{ t.selectPlaceholder }}</option>
              <option value="09:00">09:00</option>
              <option value="10:00">10:00</option>
              <option value="11:00">11:00</option>
              <option value="12:00">12:00</option>
              <option value="14:00">14:00</option>
              <option value="15:00">15:00</option>
              <option value="16:00">16:00</option>
              <option value="17:00">17:00</option>
            </select>
            <span v-if="errors.time" class="field-error">{{ errors.time }}</span>
          </div>

          <div class="form-group">
            <label for="bm-comments">{{ t.labelComments }}</label>
            <textarea id="bm-comments" v-model="form.comments" rows="3" :placeholder="t.placeholderComments"></textarea>
          </div>

          <div v-if="submitError" class="error-message">
            <p>{{ t.submitError }}</p>
          </div>

          <button type="submit" class="btn btn-primary btn-full" :disabled="submitting">
            {{ submitting ? t.btnSending : t.btnConfirm }}
          </button>
        </form>

        <div v-if="success" class="success-message">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
          <p>{{ t.successMsg1 }}</p>
          <p>{{ t.successMsg2 }}</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { useModal } from '../composables/useModal'
import { useLanguage } from '../composables/useLanguage'
import { optionalEnv } from '../lib/env'
import { validateEmail, type EmailValidation } from '../lib/email'

interface BookingForm {
  name: string
  email: string
  phone: string
  boatType: string
  date: string
  time: string
  comments: string
}

interface FormErrors {
  name: string
  email: string
  phone: string
  date: string
  time: string
}

const props = defineProps<{
  isOpen: boolean
  isConsulting: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const SCRIPT_URL = optionalEnv('VITE_SCRIPT_URL')

const { lang } = useLanguage()

const t = computed(() => lang.value === 'en' ? {
  titleConsulting: 'Book a Nautical Consultation',
  titleBooking: 'Book an Appointment',
  subtitle: 'The first one is free',
  labelName: 'Full name',
  placeholderName: 'Your name',
  labelEmail: 'Email',
  labelPhone: 'Phone',
  labelBoatType: 'Boat type',
  selectPlaceholder: 'Select...',
  boatVelero: 'Sailboat',
  boatYate: 'Yacht',
  boatLancha: 'Motorboat',
  boatCatamaran: 'Catamaran',
  boatOtro: 'Other',
  labelDate: 'Preferred date',
  labelTime: 'Preferred time',
  labelComments: 'Additional comments',
  placeholderComments: 'Describe your query or needs...',
  submitError: 'There was an error sending your request. Please try again or contact us by phone.',
  btnSending: 'Sending…',
  btnConfirm: 'Confirm Booking',
  successMsg1: 'Your request has been sent successfully.',
  successMsg2: 'We will contact you shortly to confirm the appointment.',
  emailTypoPrefix: 'Did you mean',
  emailTypoSuffix: '?',
  ariaClose: 'Close',
  errors: {
    nameRequired: 'Name is required',
    nameMin: 'Minimum 2 characters',
    emailRequired: 'Email is required',
    emailInvalid: 'Email is not valid',
    phoneRequired: 'Phone is required',
    phoneInvalid: 'Phone is not valid',
    dateRequired: 'Date is required',
    timeRequired: 'Time is required',
  },
  emailErrors: {
    empty: 'Email is required',
    format: 'Email format is not valid',
    localPart: 'The part before @ seems incorrect',
    domainDots: 'The email domain has a misplaced dot',
    tldShort: 'Domain extension must be at least 2 letters',
    tldInvalid: 'That domain is not used for real email',
  },
} : {
  titleConsulting: 'Agenda tu Consultoría Náutica',
  titleBooking: 'Reserva tu Cita',
  subtitle: 'La primera es gratuita',
  labelName: 'Nombre completo',
  placeholderName: 'Tu nombre',
  labelEmail: 'Email',
  labelPhone: 'Teléfono',
  labelBoatType: 'Tipo de embarcación',
  selectPlaceholder: 'Selecciona...',
  boatVelero: 'Velero',
  boatYate: 'Yate',
  boatLancha: 'Lancha',
  boatCatamaran: 'Catamarán',
  boatOtro: 'Otro',
  labelDate: 'Fecha preferida',
  labelTime: 'Hora preferida',
  labelComments: 'Comentarios adicionales',
  placeholderComments: 'Describe tu consulta o necesidades...',
  submitError: 'Hubo un error al enviar tu solicitud. Por favor, intenta de nuevo o contáctanos por teléfono.',
  btnSending: 'Enviando...',
  btnConfirm: 'Confirmar Reserva',
  successMsg1: 'Tu solicitud ha sido enviada con éxito.',
  successMsg2: 'Te contactaremos pronto para confirmar la cita.',
  emailTypoPrefix: '¿Quizás quisiste escribir',
  emailTypoSuffix: '?',
  ariaClose: 'Cerrar',
  errors: {
    nameRequired: 'El nombre es obligatorio',
    nameMin: 'Mínimo 2 caracteres',
    emailRequired: 'El email es obligatorio',
    emailInvalid: 'El email no es válido',
    phoneRequired: 'El teléfono es obligatorio',
    phoneInvalid: 'El teléfono no es válido',
    dateRequired: 'La fecha es obligatoria',
    timeRequired: 'La hora es obligatoria',
  },
  emailErrors: {
    empty: 'El email es obligatorio',
    format: 'El formato del correo no es válido',
    localPart: 'El nombre antes de la @ no parece correcto',
    domainDots: 'El dominio del correo tiene un punto mal puesto',
    tldShort: 'La extensión del dominio debe tener al menos 2 letras',
    tldInvalid: 'Ese dominio no se usa para correo real',
  },
})

useModal({ isOpen: toRef(props, 'isOpen'), onClose: () => emit('close') })

const emptyForm = (): BookingForm => ({
  name: '', email: '', phone: '', boatType: '', date: '', time: '', comments: '',
})

const emptyErrors = (): FormErrors => ({
  name: '', email: '', phone: '', date: '', time: '',
})

const form = ref<BookingForm>(emptyForm())
const errors = ref<FormErrors>(emptyErrors())
const submitting = ref(false)
const success = ref(false)
const submitError = ref(false)
const emailFeedback = ref<EmailValidation | null>(null)

const minDate = computed(() => new Date().toISOString().split('T')[0])

const emailErrorMessage = computed(() => {
  const code = emailFeedback.value?.errorCode
  if (!code) return ''
  return t.value.emailErrors[code as keyof typeof t.value.emailErrors] ?? ''
})

const onEmailBlur = () => {
  if (!form.value.email.trim()) { emailFeedback.value = null; return }
  emailFeedback.value = validateEmail(form.value.email)
}

const applyEmailSuggestion = () => {
  const sugg = emailFeedback.value?.suggestion
  if (!sugg) return
  form.value.email = sugg
  emailFeedback.value = null
}

const validate = (): boolean => {
  const e = emptyErrors()
  const phoneRegex = /^\+?[\d\s\-().]{7,}$/

  const te = t.value.errors
  if (!form.value.name.trim()) e.name = te.nameRequired
  else if (form.value.name.trim().length < 2) e.name = te.nameMin

  const emailCheck = validateEmail(form.value.email)
  if (!emailCheck.valid) {
    e.email = emailCheck.errorCode === 'empty' ? te.emailRequired : te.emailInvalid
    emailFeedback.value = emailCheck
  } else {
    emailFeedback.value = null
  }

  if (!form.value.phone.trim()) e.phone = te.phoneRequired
  else if (!phoneRegex.test(form.value.phone)) e.phone = te.phoneInvalid

  if (!form.value.date) e.date = te.dateRequired
  if (!form.value.time) e.time = te.timeRequired

  errors.value = e
  return !Object.values(e).some(Boolean)
}

const close = () => {
  emit('close')
  setTimeout(() => {
    success.value = false
    submitError.value = false
    form.value = emptyForm()
    errors.value = emptyErrors()
  }, 300)
}

const handleSubmit = async () => {
  if (!validate()) return
  if (!SCRIPT_URL) { submitError.value = true; return }

  submitting.value = true
  submitError.value = false

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    // Sin Content-Type para evitar el preflight CORS de Apps Script.
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        type: 'reserva',
        language: lang.value,
        isConsulting: props.isConsulting,
        ...form.value,
      }),
      signal: controller.signal,
      redirect: 'follow',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = (await res.json().catch(() => ({ ok: true }))) as { ok?: boolean; error?: string }
    if (json.ok === false) throw new Error(json.error || 'unknown')
    success.value = true
    setTimeout(close, 3500)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[BookingModal] envío fallido:', err)
    submitError.value = true
  } finally {
    clearTimeout(timeout)
    submitting.value = false
  }
}
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
  right: 16px;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: var(--color-gray);
  transition: color 0.3s;
  line-height: 1;
}

.modal-close:hover {
  color: var(--color-dark);
}

.modal-content h2 {
  color: var(--color-meteorite-dark);
  font-size: 1.75rem;
  margin-bottom: 8px;
}

.modal-subtitle {
  color: var(--color-success);
  font-weight: 500;
  margin-bottom: 24px;
}

.booking-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--color-dark);
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px 16px;
  border: 2px solid var(--color-gray-border);
  border-radius: 8px;
  font-size: 1rem;
  font-family: var(--font-body);
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.input-error {
  border-color: #dc2626 !important;
}

.field-error {
  font-size: 0.8rem;
  color: #dc2626;
  margin-top: 2px;
}
.email-suggestion {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
}
.email-suggestion:hover { color: var(--color-primary-dark); }

.btn-full {
  width: 100%;
  margin-top: 8px;
}

.success-message {
  padding: 32px 16px;
  text-align: center;
  color: #008361;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.success-message svg {
  color: #00b090;
}

.success-message p {
  margin: 0;
}

.error-message {
  padding: 14px 16px;
  background: #fef2f2;
  border-radius: 8px;
  border-left: 4px solid #dc2626;
  color: #991b1b;
  font-size: 0.9rem;
}

.error-message p {
  margin: 0;
}
</style>
