<template>
  <RouteLoader />
  <Header />
  <main>
    <router-view />
  </main>
  <Footer />
  <BookingModal :isOpen="isOpen" :isConsulting="isConsulting" @close="close" />
  <ToastContainer />
  <WhatsAppButton />
</template>

<script setup lang="ts">
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import BookingModal from './components/BookingModal.vue'
import ToastContainer from './components/ToastContainer.vue'
import WhatsAppButton from './components/WhatsAppButton.vue'
import RouteLoader from './components/RouteLoader.vue'
import { useBooking } from './composables/useBooking'

const { isOpen, isConsulting, close } = useBooking()
</script>

<style>
@import './styles/main.css';

main {
  min-height: 100vh;
}
</style>
