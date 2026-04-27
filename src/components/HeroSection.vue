<template>
  <section class="hero" :style="heroStyle">
    <video
      v-if="bgVideo"
      class="hero-bg hero-bg-video"
      autoplay
      muted
      loop
      playsinline
      :poster="poster"
    >
      <source :src="bgVideo" type="video/mp4" />
    </video>
    <div
      v-else-if="bgImage"
      class="hero-bg hero-bg-image"
      :style="{ backgroundImage: `url('${bgImage}')` }"
    ></div>
    <div class="hero-overlay" :class="`hero-overlay--${overlay}`"></div>
    <div class="container hero-content" :style="contentStyle">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    bgVideo?: string
    bgImage?: string
    poster?: string
    minHeight?: string
    align?: 'start' | 'center'
    maxWidth?: string
    overlay?: 'default' | 'strong' | 'soft' | 'darkest'
  }>(),
  {
    bgVideo: undefined,
    bgImage: undefined,
    poster: undefined,
    minHeight: '70vh',
    align: 'start',
    maxWidth: '860px',
    overlay: 'default',
  },
)

const heroStyle = computed(() => ({ minHeight: props.minHeight }))

const contentStyle = computed(() => {
  if (props.align === 'center') {
    return { textAlign: 'center' as const, maxWidth: props.maxWidth, marginInline: 'auto' }
  }
  return { maxWidth: props.maxWidth }
})
</script>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  position: relative;
  background: var(--color-meteorite-dark);
}

.hero-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-bg-image {
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.hero-overlay {
  position: absolute;
  inset: 0;
}

.hero-overlay--default {
  background: linear-gradient(135deg, rgba(8, 16, 24, 0.82) 0%, rgba(66, 104, 135, 0.65) 100%);
}

.hero-overlay--strong {
  background: linear-gradient(135deg, rgba(8, 16, 24, 0.88) 0%, rgba(66, 104, 135, 0.6) 100%);
}

.hero-overlay--soft {
  background: linear-gradient(135deg, rgba(8, 16, 24, 0.7) 0%, rgba(66, 104, 135, 0.55) 100%);
}

.hero-overlay--darkest {
  background: linear-gradient(135deg, rgba(8, 16, 24, 0.92) 0%, rgba(66, 104, 135, 0.75) 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
  color: var(--color-light);
  padding: 140px 20px 80px;
}
</style>
