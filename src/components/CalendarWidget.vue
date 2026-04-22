<template>
  <div class="calendar-widget">
    <div class="calendar-header">
      <button @click="prevMonth" class="cal-nav" aria-label="Mes anterior">&lt;</button>
      <h3>{{ monthNames[currentMonth] }} {{ currentYear }}</h3>
      <button @click="nextMonth" class="cal-nav" aria-label="Mes siguiente">&gt;</button>
    </div>

    <div class="calendar-weekdays">
      <span v-for="day in weekdays" :key="day">{{ day }}</span>
    </div>

    <div class="calendar-days">
      <span
        v-for="(day, index) in calendarDays"
        :key="index"
        :class="{
          empty: !day,
          today: isToday(day),
          selected: isSelected(day),
          disabled: isDisabled(day),
        }"
        @click="selectDay(day)"
      >
        {{ day || '' }}
      </span>
    </div>

    <div class="time-slots" v-if="selectedDate">
      <h4>Selecciona una hora:</h4>
      <div class="slots-grid">
        <button
          v-for="slot in timeSlots"
          :key="slot"
          :class="{ active: selectedTime === slot }"
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

interface DateSelection {
  day: number
  month: number
  year: number
}

const emit = defineEmits<{
  select: [{ date: DateSelection | null; time: string | null }]
}>()

const weekdays = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())
const selectedDate = ref<DateSelection | null>(null)
const selectedTime = ref<string | null>(null)

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

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const isToday = (day: number | null): boolean => {
  if (!day) return false
  return day === today.getDate() &&
    currentMonth.value === today.getMonth() &&
    currentYear.value === today.getFullYear()
}

const isSelected = (day: number | null): boolean => {
  if (!day || !selectedDate.value) return false
  return day === selectedDate.value.day &&
    currentMonth.value === selectedDate.value.month &&
    currentYear.value === selectedDate.value.year
}

const isDisabled = (day: number | null): boolean => {
  if (!day) return true
  const date = new Date(currentYear.value, currentMonth.value, day)
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return date < todayStart
}

const selectDay = (day: number | null) => {
  if (!day || isDisabled(day)) return
  selectedDate.value = { day, month: currentMonth.value, year: currentYear.value }
  selectedTime.value = null
  emit('select', { date: selectedDate.value, time: null })
}

const selectTime = (slot: string) => {
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

.cal-nav:hover {
  background: var(--color-primary);
  color: white;
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
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-days span {
  text-align: center;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.calendar-days span:not(.empty):not(.disabled):hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.calendar-days span.today {
  border: 2px solid var(--color-primary);
}

.calendar-days span.selected {
  background: var(--color-primary);
  color: white;
}

.calendar-days span.disabled {
  color: var(--color-gray-border);
  cursor: not-allowed;
}

.calendar-days span.empty {
  cursor: default;
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

.slots-grid button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.slots-grid button.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}
</style>
