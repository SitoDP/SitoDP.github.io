<template>
  <Header @open-booking="openBooking" />
  <main>
    <router-view v-slot="{ Component }">
      <component :is="Component" @open-booking="openBooking" />
    </router-view>
  </main>
  <Footer />
  <BookingModal :isOpen="showBooking" :isConsulting="isConsulting" @close="closeBooking" />
  <ToastContainer />
  <WhatsAppButton />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import BookingModal from './components/BookingModal.vue'
import ToastContainer from './components/ToastContainer.vue'
import WhatsAppButton from './components/WhatsAppButton.vue'

const showBooking = ref(false)
const isConsulting = ref(false)

const openBooking = (type = 'booking') => {
  isConsulting.value = type === 'consulting'
  showBooking.value = true
}

const closeBooking = () => {
  showBooking.value = false
}
</script>

<style>
@import './styles/main.css';

main {
  min-height: 100vh;
}
</style>
