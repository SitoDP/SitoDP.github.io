<template>
  <Transition name="route-loader">
    <div v-if="visible" class="route-loader" role="progressbar" aria-label="Cargando"></div>
  </Transition>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const visible = ref(false)
let hideTimer: ReturnType<typeof setTimeout> | null = null

const router = useRouter()
const removeBefore = router.beforeEach(() => {
  if (hideTimer) clearTimeout(hideTimer)
  visible.value = true
})
const removeAfter = router.afterEach(() => {
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => (visible.value = false), 200)
})

onUnmounted(() => {
  removeBefore()
  removeAfter()
  if (hideTimer) clearTimeout(hideTimer)
})
</script>

<style scoped>
.route-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  z-index: 2000;
  pointer-events: none;
  background: linear-gradient(
    to right,
    var(--color-primary-light) 0%,
    var(--color-primary) 50%,
    var(--color-primary-light) 100%
  );
  background-size: 200% 100%;
  animation: route-loader-shimmer 1.2s ease-in-out infinite;
  transform-origin: left;
}

@keyframes route-loader-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: -100% 50%; }
}

.route-loader-enter-active,
.route-loader-leave-active {
  transition: opacity 0.2s ease;
}

.route-loader-enter-from,
.route-loader-leave-to {
  opacity: 0;
}
</style>
