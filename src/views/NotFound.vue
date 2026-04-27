<template>
  <div class="not-found-page">
    <div class="container">
      <p class="error-code">404</p>
      <h1>{{ t.title }}</h1>
      <p class="message">{{ t.message }}</p>
      <div class="actions">
        <router-link :to="to('/')" class="btn btn-primary">{{ t.home }}</router-link>
        <router-link :to="to('/tienda')" class="btn btn-outline">{{ t.shop }}</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLanguage } from '../composables/useLanguage'

const { to, useT } = useLanguage()
const t = useT('notFound')
</script>

<style scoped>
.not-found-page {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 140px 20px 80px;
}

.error-code {
  font-family: var(--font-heading);
  font-size: clamp(5rem, 18vw, 10rem);
  font-weight: 700;
  color: var(--color-primary-light);
  line-height: 1;
  margin-bottom: 16px;
}

h1 {
  font-size: clamp(1.5rem, 4vw, 2.4rem);
  color: var(--color-dark);
  margin-bottom: 16px;
}

.message {
  color: var(--color-gray);
  font-size: 1.05rem;
  max-width: 540px;
  margin: 0 auto 32px;
  line-height: 1.7;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
