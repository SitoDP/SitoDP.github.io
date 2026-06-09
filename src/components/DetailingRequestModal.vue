<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <button class="modal-close" @click="close" aria-label="Cerrar">&times;</button>
        <h2>{{ t.title }}</h2>
        <p class="modal-subtitle">{{ t.subtitle }}</p>

        <form v-if="!success" @submit.prevent="handleSubmit" class="dr-form" novalidate>
          <fieldset class="dr-section">
            <legend>{{ t.serviceSection }}</legend>
            <div class="form-group">
              <label>{{ t.levelLabel }}</label>
              <div class="level-grid">
                <button
                  v-for="lvl in levels"
                  :key="lvl"
                  type="button"
                  :class="['level-card-mini', { active: form.level === lvl }, { 'has-error': errors.level && !form.level }]"
                  @click="form.level = lvl; errors.level = ''"
                >
                  <span class="level-name">{{ t.levels[lvl] }}</span>
                  <span class="level-hint">{{ t.levelHints[lvl] }}</span>
                </button>
              </div>
              <span v-if="errors.level" class="field-error">{{ errors.level }}</span>
            </div>
          </fieldset>

          <fieldset class="dr-section">
            <legend>{{ t.boatSection }}</legend>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t.lengthLabel }}</label>
                <input v-model.number="form.length" type="number" min="3" max="60" step="0.5" />
              </div>
              <div class="form-group">
                <label>{{ t.materialLabel }}</label>
                <select v-model="form.material">
                  <option v-for="(label, key) in t.materials" :key="key" :value="key">{{ label }}</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>{{ t.dateLabel }}</label>
              <input v-model="form.date" type="date" :placeholder="t.datePlaceholder" />
            </div>
          </fieldset>

          <fieldset class="dr-section">
            <legend>{{ t.contactSection }}</legend>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t.nameLabel }}</label>
                <input
                  v-model="form.name"
                  type="text"
                  :placeholder="t.namePlaceholder"
                  :class="{ 'input-error': errors.name }"
                  @input="errors.name = ''"
                />
                <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
              </div>
              <div class="form-group">
                <label>{{ t.phoneLabel }}</label>
                <input
                  v-model="form.phone"
                  type="tel"
                  :placeholder="t.phonePlaceholder"
                  :class="{ 'input-error': errors.phone }"
                  @input="errors.phone = ''"
                />
                <span v-if="errors.phone" class="field-error">{{ errors.phone }}</span>
              </div>
            </div>

            <div class="form-group">
              <label>{{ t.emailLabel }}</label>
              <input
                v-model="form.email"
                type="email"
                autocomplete="email"
                inputmode="email"
                :placeholder="t.emailPlaceholder"
                :class="{ 'input-error': errors.email || emailFeedback?.errorCode }"
                @input="errors.email = ''; emailFeedback = null"
                @blur="onEmailBlur"
              />
              <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
              <span v-else-if="emailFeedback?.errorCode === 'typo'" class="field-error">
                {{ t.didYouMean }}
                <button type="button" class="email-suggestion" @click="applyEmailSuggestion">{{ emailFeedback.suggestion }}</button>?
              </span>
              <span v-else-if="emailFeedback?.errorCode" class="field-error">{{ emailErrorMessage }}</span>
            </div>

            <div class="form-group">
              <label>{{ t.messageLabel }}</label>
              <textarea
                v-model="form.message"
                rows="4"
                :placeholder="t.messagePlaceholder"
                :class="{ 'input-error': errors.message }"
                @input="errors.message = ''"
              ></textarea>
              <span v-if="errors.message" class="field-error">{{ errors.message }}</span>
            </div>

            <label class="checkbox-row">
              <input
                type="checkbox"
                v-model="form.privacy"
                :class="{ 'checkbox-error': errors.privacy }"
                @change="errors.privacy = ''"
              />
              <span>{{ t.privacyLabel }}</span>
            </label>
            <span v-if="errors.privacy" class="field-error">{{ errors.privacy }}</span>
          </fieldset>

          <p v-if="submitError" class="error-msg">{{ t.errorMsg }}</p>

          <button type="submit" class="btn btn-primary submit-btn" :disabled="submitting">
            {{ submitting ? t.sending : t.submit }}
          </button>
        </form>

        <div v-else class="success-state">
          <div class="success-icon">✓</div>
          <h3>{{ t.successTitle }}</h3>
          <p>{{ t.successMsg }}</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useLanguage } from '../composables/useLanguage'
import { useModal } from '../composables/useModal'
import { useDetailingRequest, type DetailingLevel } from '../composables/useDetailingRequest'
import { optionalEnv } from '../lib/env'
import { validateEmail, type EmailValidation } from '../lib/email'

const { isOpen, prefill, close: closeModal } = useDetailingRequest()
const { lang, useT } = useLanguage()
const t = useT('detailingRequest')
const SCRIPT_URL = optionalEnv('VITE_SCRIPT_URL')

useModal({ isOpen, onClose: () => closeModal() })

const levels: DetailingLevel[] = ['basica', 'pulido', 'completo', 'premium']

interface FormState {
  level: DetailingLevel | ''
  length: number
  material: string
  date: string
  name: string
  email: string
  phone: string
  message: string
  privacy: boolean
}

const emptyForm = (): FormState => ({
  level: '',
  length: 10,
  material: 'fibra',
  date: '',
  name: '', email: '', phone: '', message: '', privacy: false,
})

const form = reactive<FormState>(emptyForm())
const errors = reactive({ name: '', email: '', phone: '', level: '', message: '', privacy: '' })
const submitting = ref(false)
const submitError = ref(false)
const success = ref(false)
const emailFeedback = ref<EmailValidation | null>(null)

watch(isOpen, (open) => {
  if (!open) return
  Object.assign(form, emptyForm())
  Object.assign(errors, { name: '', email: '', phone: '', level: '', message: '', privacy: '' })
  submitError.value = false
  success.value = false
  emailFeedback.value = null
  const p = prefill.value
  if (p.level) form.level = p.level
  if (typeof p.length === 'number') form.length = p.length
  if (p.material) form.material = p.material
})

const emailErrorMessage = computed(() => {
  switch (emailFeedback.value?.errorCode) {
    case 'empty':       return t.value.errEmail
    case 'format':      return t.value.errEmailFormat
    case 'localPart':   return t.value.errEmailLocalPart
    case 'domainDots':  return t.value.errEmailDomainDots
    case 'tldShort':    return t.value.errEmailTldShort
    case 'tldInvalid':  return t.value.errEmailTldInvalid
    default:            return ''
  }
})

const onEmailBlur = () => {
  if (!form.email.trim()) { emailFeedback.value = null; return }
  emailFeedback.value = validateEmail(form.email)
}

const applyEmailSuggestion = () => {
  const sugg = emailFeedback.value?.suggestion
  if (!sugg) return
  form.email = sugg
  emailFeedback.value = null
}

const close = () => closeModal()

function validate(): boolean {
  let valid = true
  errors.name = errors.email = errors.phone = errors.level = errors.message = errors.privacy = ''

  if (!form.name.trim()) { errors.name = t.value.errName; valid = false }

  const emailCheck = validateEmail(form.email)
  if (!emailCheck.valid) {
    errors.email = t.value.errEmail
    emailFeedback.value = emailCheck
    valid = false
  } else {
    emailFeedback.value = null
  }

  if (!form.phone.trim() || !/^\+?[\d\s\-().]{7,}$/.test(form.phone)) {
    errors.phone = t.value.errPhone
    valid = false
  }
  if (!form.level) { errors.level = t.value.errLevel; valid = false }
  if (!form.message.trim() || form.message.trim().length < 10) {
    errors.message = t.value.errMessage
    valid = false
  }
  if (!form.privacy) { errors.privacy = t.value.errPrivacy; valid = false }

  return valid
}

async function handleSubmit() {
  if (!validate()) return
  if (!SCRIPT_URL) { submitError.value = true; return }
  submitting.value = true
  submitError.value = false

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const payload = {
      type: 'detailing-request',
      language: lang.value,
      level: form.level,
      levelLabel: form.level ? t.value.levels[form.level] : '',
      length: form.length,
      material: form.material,
      materialLabel: t.value.materials[form.material as keyof typeof t.value.materials] || form.material,
      date: form.date,
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: form.message,
    }
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      signal: controller.signal,
      redirect: 'follow',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = (await res.json().catch(() => ({ ok: true }))) as { ok?: boolean; error?: string }
    if (json.ok === false) throw new Error(json.error || 'unknown')
    success.value = true
    setTimeout(close, 5000)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[DetailingRequestModal] envío fallido:', err)
    submitError.value = true
  } finally {
    clearTimeout(timeout)
    submitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000; padding: 20px; overflow-y: auto;
}
.modal-content {
  background: var(--color-light);
  border-radius: 16px;
  padding: 40px;
  max-width: 640px;
  width: 100%;
  max-height: 92vh;
  overflow-y: auto;
  position: relative;
  margin: 20px auto;
}
.modal-close {
  position: absolute; top: 16px; right: 20px;
  background: none; border: none; font-size: 2rem;
  cursor: pointer; color: var(--color-gray); line-height: 1;
}
.modal-close:hover { color: var(--color-dark); }
.modal-content h2 { font-size: 1.6rem; color: var(--color-dark); margin-bottom: 6px; }
.modal-subtitle { color: var(--color-gray); margin-bottom: 24px; font-size: 0.95rem; }

.dr-form { display: flex; flex-direction: column; gap: 20px; }
.dr-section {
  border: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 12px;
}
.dr-section legend {
  font-family: var(--font-heading);
  font-size: 0.78rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1.5px;
  color: var(--color-primary);
  padding-bottom: 6px;
  border-bottom: 1px solid var(--color-gray-border);
  width: 100%; margin-bottom: 4px;
}
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label {
  font-family: var(--font-heading);
  font-size: 0.78rem; font-weight: 600;
  color: var(--color-dark);
}
.form-group input,
.form-group select,
.form-group textarea {
  padding: 11px 14px;
  border: 2px solid var(--color-gray-border);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.92rem; width: 100%; box-sizing: border-box;
  transition: border-color 0.2s;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  outline: none; border-color: var(--color-primary);
}
.form-group textarea { resize: vertical; }

.input-error { border-color: #dc2626 !important; }
.field-error { color: #dc2626; font-size: 0.78rem; }
.email-suggestion {
  background: none; border: none; padding: 0; font: inherit;
  color: var(--color-primary); font-weight: 600;
  text-decoration: underline; text-underline-offset: 2px; cursor: pointer;
}
.email-suggestion:hover { color: var(--color-primary-dark); }

.level-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.level-card-mini {
  background: white;
  border: 2px solid var(--color-gray-border);
  border-radius: 10px;
  padding: 14px 12px;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all 0.2s;
}
.level-card-mini:hover { border-color: var(--color-primary); }
.level-card-mini.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}
.level-card-mini.has-error { border-color: #dc2626; }
.level-name {
  font-family: var(--font-heading);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-dark);
}
.level-card-mini.active .level-name { color: var(--color-primary); }
.level-hint {
  font-size: 0.75rem;
  color: var(--color-gray);
  line-height: 1.35;
}

.checkbox-row {
  display: flex; align-items: flex-start; gap: 10px;
  font-size: 0.82rem; color: var(--color-gray); cursor: pointer;
}
.checkbox-row input { width: 18px; height: 18px; margin-top: 2px; flex-shrink: 0; }
.checkbox-error { outline: 2px solid #dc2626; outline-offset: 2px; }

.error-msg {
  padding: 10px 14px; background: #fee2e2; color: #991b1b;
  border-radius: 6px; font-size: 0.85rem;
}
.submit-btn { padding: 14px; font-size: 0.95rem; }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.success-state { text-align: center; padding: 20px 10px; }
.success-icon {
  width: 72px; height: 72px; margin: 0 auto 20px; border-radius: 50%;
  background: #d1fae5; color: #065f46; font-size: 2.5rem;
  display: flex; align-items: center; justify-content: center;
}
.success-state h3 { font-size: 1.25rem; color: var(--color-dark); margin-bottom: 10px; }
.success-state p { color: var(--color-gray); line-height: 1.6; }

@media (max-width: 600px) {
  .modal-content { padding: 28px 20px; }
  .form-row { grid-template-columns: 1fr; }
  .level-grid { grid-template-columns: 1fr; }
}
</style>
