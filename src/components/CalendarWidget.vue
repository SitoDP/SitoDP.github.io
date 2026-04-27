<template>
  <div class="calendar-widget">
    <div class="calendar-header">
      <button @click="prevMonth" class="cal-nav" :aria-label="t.prev" type="button">&lt;</button>
      <h3>{{ monthName }} {{ currentYear }}</h3>
      <button @click="nextMonth" class="cal-nav" :aria-label="t.next" type="button">&gt;</button>
    </div>

    <div class="calendar-weekdays" role="row">
      <span v-for="day in weekdays" :key="day" role="columnheader">{{ day }}</span>
    </div>

    <div class="calendar-days" role="grid" :aria-label="t.gridLabel">
      <template v-for="(day, index) in calendarDays" :key="index">
        <span v-if="!day" class="day empty" aria-hidden="true"></span>
        <button
          v-else
          type="button"
          class="day"
          :class="{
            today: isToday(day),
            selected: isSelected(day),
            disabled: isDisabled(day),
          }"
          :disabled="isDisabled(day)"
          :aria-label="dayLabel(day)"
          :aria-pressed="isSelected(day)"
          @click="selectDay(day)"
        >
          {{ day }}
        </button>
      </template>
    </div>

    <div class="time-slots" v-if="selectedDate">
      <h4>{{ t.selectTime }}</h4>
      <div class="slots-grid">
        <button
          v-for="slot in timeSlots"
          :key="slot"
          type="button"
          :class="{ active: selectedTime === slot }"
          :aria-pressed="selectedTime === slot"
          @click="selectTime(slot)"
        >
          {{ slot }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLanguage } from '../composables/useLanguage'

interface DateSelection {
  day: number
  month: number
  year: number
}

const emit = defineEmits<{
  select: [{ date: DateSelection | null; time: string | null }]
}>()

const { lang } = useLanguage()

const t = computed(() =>
  lang.value === 'en'
    ? {
        prev: 'Previous month',
        next: 'Next month',
        gridLabel: 'Calendar grid, use arrow keys to navigate days',
        selectTime: 'Select a time:',
      }
    : {
        prev: 'Mes anterior',
        next: 'Mes siguiente',
        gridLabel: 'Cuadrícula del calendario, usa las flechas del teclado para navegar',
        selectTime: 'Selecciona una hora:',
      },
)

const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())
const selectedDate = ref<DateSelection | null>(null)
const selectedTime = ref<string | null>(null)

const localeCode = computed(() => (lang.value === 'en' ? 'en-GB' : 'es-ES'))

const weekdays = computed(() => {
  // Build localized short weekday names starting on Monday
  const fmt = new Intl.DateTimeFormat(localeCode.value, { weekday: 'short' })
  // 2024-01-01 was a Monday — use it as anchor
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, 1 + i)
    return fmt.format(d).replace('.', '')
  })
})

const monthName = computed(() => {
  const fmt = new Intl.DateTimeFormat(localeCode.value, { month: 'long' })
  return fmt.format(new Date(currentYear.value, currentMonth.value, 1))
})

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const daysInMonth = lastDay.getDate()

  let startDay = firstDay.getDay() - 1
  if (startDay < 0) startDay = 6

  const days: (number | null)[] = []
  for (let i = 0; i < startDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  return days
})

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function isToday(day: number | null): boolean {
  if (!day) return false
  return day === today.getDate() &&
    currentMonth.value === today.getMonth() &&
    currentYear.value === today.getFullYear()
}

function isSelected(day: number | null): boolean {
  if (!day || !selectedDate.value) return false
  return day === selectedDate.value.day &&
    currentMonth.value === selectedDate.value.month &&
    currentYear.value === selectedDate.value.year
}

function isDisabled(day: number | null): boolean {
  if (!day) return true
  const date = new Date(currentYear.value, currentMonth.value, day)
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return date < todayStart
}

function dayLabel(day: number): string {
  const date = new Date(currentYear.value, currentMonth.value, day)
  return new Intl.DateTimeFormat(localeCode.value, { dateStyle: 'full' }).format(date)
}

function selectDay(day: number | null) {
  if (!day || isDisabled(day)) return
  selectedDate.value = { day, month: currentMonth.value, year: currentYear.value }
  selectedTime.value = null
  emit('select', { date: selectedDate.value, time: null })
}

function selectTime(slot: string) {
  selectedTime.value = slot
  emit('select', { date: selectedDate.value, time: slot })
}
</script>

<style scoped>
.calendar-widget {
  background: var(--color-light);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-header h3 {
  color: var(--color-meteorite-dark);
  font-size: 1.25rem;
  text-transform: capitalize;
}

.cal-nav {
  background: var(--color-gray-light);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.cal-nav:hover,
.cal-nav:focus-visible {
  background: var(--color-primary);
  color: white;
  outline: none;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.calendar-weekdays span {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-gray);
  padding: 8px 0;
  text-transform: capitalize;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day {
  text-align: center;
  padding: 10px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  cursor: pointer;
}

.day:not(.empty):not(:disabled):hover,
.day:not(.empty):not(:disabled):focus-visible {
  background: var(--color-primary-light);
  color: var(--color-primary);
  outline: none;
}

.day.today {
  border: 2px solid var(--color-primary);
}

.day.selected {
  background: var(--color-primary);
  color: white;
}

.day:disabled,
.day.disabled {
  color: var(--color-gray-border);
  cursor: not-allowed;
}

.day.empty {
  cursor: default;
  pointer-events: none;
}

.time-slots {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--color-gray-border);
}

.time-slots h4 {
  margin-bottom: 12px;
  color: var(--color-dark);
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.slots-grid button {
  padding: 10px;
  border: 2px solid var(--color-gray-border);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.slots-grid button:hover,
.slots-grid button:focus-visible {
  border-color: var(--color-primary);
  color: var(--color-primary);
  outline: none;
}

.slots-grid button.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}
</style>
