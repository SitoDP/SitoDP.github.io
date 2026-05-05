<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <button class="modal-close" @click="close" aria-label="Cerrar">&times;</button>
        <h2>{{ isConsulting ? 'Agenda tu Consultoria Nautica' : 'Reserva tu Cita' }}</h2>
        <p class="modal-subtitle">La primera es gratuita</p>

        <form v-if="!success" @submit.prevent="handleSubmit" class="booking-form" novalidate>
          <div class="form-group">
            <label for="bm-name">Nombre completo</label>
            <input
              id="bm-name"
              v-model="form.name"
              type="text"
              placeholder="Tu nombre"
              :class="{ 'input-error': errors.name }"
              @input="errors.name = ''"
            />
            <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
          </div>

          <div class="form-group">
            <label for="bm-email">Email</label>
            <input
              id="bm-email"
              v-model="form.email"
              type="email"
              placeholder="tu@email.com"
              :class="{ 'input-error': errors.email }"
              @input="errors.email = ''"
            />
            <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label for="bm-phone">Telefono</label>
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
            <label for="bm-boat">Tipo de embarcacion</label>
            <select id="bm-boat" v-model="form.boatType">
              <option value="">Selecciona...</option>
              <option value="velero">Velero</option>
              <option value="yate">Yate</option>
              <option value="lancha">Lancha</option>
              <option value="catamaran">Catamaran</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div class="form-group">
            <label for="bm-date">Fecha preferida</label>
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
            <label for="bm-time">Hora preferida</label>
            <select
              id="bm-time"
              v-model="form.time"
              :class="{ 'input-error': errors.time }"
              @change="errors.time = ''"
            >
              <option value="">Selecciona...</option>
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
            <label for="bm-comments">Comentarios adicionales</label>
            <textarea id="bm-comments" v-model="form.comments" rows="3" placeholder="Describe tu consulta o necesidades..."></textarea>
          </div>

          <div v-if="submitError" class="error-message">
            <p>Hubo un error al enviar tu solicitud. Por favor, intenta de nuevo o contactanos por telefono.</p>
          </div>

          <button type="submit" class="btn btn-primary btn-full" :disabled="submitting">
            {{ submitting ? 'Enviando...' : 'Confirmar Reserva' }}
          </button>
        </form>

        <div v-if="success" class="success-message">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
          <p>Tu solicitud ha sido enviada con exito.</p>
          <p>Te contactaremos pronto para confirmar la cita.</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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

import { toRef } from 'vue'
import { useModal } from '../composables/useModal'

const props = defineProps<{
  isOpen: boolean
  isConsulting: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

import { optionalEnv } from '../lib/env'
const SCRIPT_URL = optionalEnv('VITE_SCRIPT_URL')

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

const minDate = computed(() => new Date().toISOString().split('T')[0])

const validate = (): boolean => {
  const e = emptyErrors()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneRegex = /^\+?[\d\s\-().]{7,}$/

  if (!form.value.name.trim()) e.name = 'El nombre es obligatorio'
  else if (form.value.name.trim().length < 2) e.name = 'Mínimo 2 caracteres'

  if (!form.value.email.trim()) e.email = 'El email es obligatorio'
  else if (!emailRegex.test(form.value.email)) e.email = 'El email no es válido'

  if (!form.value.phone.trim()) e.phone = 'El teléfono es obligatorio'
  else if (!phoneRegex.test(form.value.phone)) e.phone = 'El teléfono no es válido'

  if (!form.value.date) e.date = 'La fecha es obligatoria'
  if (!form.value.time) e.time = 'La hora es obligatoria'

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
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'reserva',
        isConsulting: props.isConsulting,
        ...form.value,
      }),
      signal: controller.signal,
    })
    success.value = true
    setTimeout(close, 3500)
  } catch {
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
