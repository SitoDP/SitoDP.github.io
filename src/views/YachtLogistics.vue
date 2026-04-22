<template>
  <div class="yacht-logistics">
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-overlay"></div>
      <div class="container hero-content">
        <p class="hero-label">{{ t.heroLabel }}</p>
        <h1 class="hero-title">{{ t.heroTitle }}</h1>
        <p class="hero-subtitle">{{ t.heroSubtitle }}</p>
        <button class="btn btn-primary" @click="emit('open-booking', 'consulting')">{{ t.heroBtn }}</button>
      </div>
    </section>

    <section class="section intro">
      <div class="container intro-inner">
        <div class="intro-stats">
          <div class="stat">
            <span class="stat-number">{{ t.stat1 }}</span>
            <span class="stat-label">{{ t.stat1Label }}</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ t.stat2 }}</span>
            <span class="stat-label">{{ t.stat2Label }}</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ t.stat3 }}</span>
            <span class="stat-label">{{ t.stat3Label }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section services">
      <div class="container">
        <h2 class="section-title">{{ t.servicesTitle }}</h2>
        <div class="transport-grid">
          <div class="transport-card">
            <div class="transport-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M2 20h20M3 20l4-8h10l4 8M7 12V8a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h3>{{ t.t1Title }}</h3>
            <p>{{ t.t1Desc }}</p>
            <ul>
              <li v-for="item in t.t1Items" :key="item">{{ item }}</li>
            </ul>
          </div>
          <div class="transport-card">
            <div class="transport-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <rect x="1" y="3" width="15" height="13" rx="1"/>
                <path d="M16 8h4l3 3v5h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <h3>{{ t.t2Title }}</h3>
            <p>{{ t.t2Desc }}</p>
            <ul>
              <li v-for="item in t.t2Items" :key="item">{{ item }}</li>
            </ul>
          </div>
          <div class="transport-card">
            <div class="transport-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3>{{ t.t3Title }}</h3>
            <p>{{ t.t3Desc }}</p>
            <ul>
              <li v-for="item in t.t3Items" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Calculator -->
    <section class="section calculator-section">
      <div class="container">
        <div class="calculator-wrap">
          <div class="calculator-header">
            <h2>{{ t.calcTitle }}</h2>
            <p>{{ t.calcSubtitle }}</p>
          </div>
          <div class="calculator-body">
            <div class="calc-form">
              <div class="calc-field">
                <label>{{ t.calcTypeLabel }}</label>
                <div class="toggle-group">
                  <button :class="['toggle-btn', { active: calc.type === 'maritimo' }]" @click="calc.type = 'maritimo'">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h20M3 20l4-8h10l4 8M7 12V8a5 5 0 0 1 10 0v4"/></svg>
                    {{ t.calcMaritime }}
                  </button>
                  <button :class="['toggle-btn', { active: calc.type === 'terrestre' }]" @click="calc.type = 'terrestre'">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                    {{ t.calcLand }}
                  </button>
                </div>
              </div>

              <div class="calc-field">
                <label>{{ t.calcBoatLabel }}</label>
                <select v-model="calc.boatType">
                  <option v-for="(label, key) in t.calcBoatTypes" :key="key" :value="key">{{ label }}</option>
                </select>
              </div>

              <div class="calc-field">
                <label>{{ t.calcLengthLabel }}</label>
                <div class="slider-wrap">
                  <input type="range" v-model.number="calc.length" min="5" max="25" step="0.5" />
                  <span class="slider-value">{{ calc.length }} m</span>
                </div>
              </div>

              <div class="calc-field" v-if="calc.type === 'maritimo'">
                <label>{{ t.calcDistLabel }}</label>
                <div class="slider-wrap">
                  <input type="range" v-model.number="calc.distance" min="10" max="2000" step="10" />
                  <span class="slider-value">{{ calc.distance }} mn</span>
                </div>
              </div>

              <div class="calc-field" v-if="calc.type === 'terrestre'">
                <label>{{ t.calcKmLabel }}</label>
                <div class="slider-wrap">
                  <input type="range" v-model.number="calc.km" min="50" max="2000" step="50" />
                  <span class="slider-value">{{ calc.km }} km</span>
                </div>
              </div>
            </div>

            <div class="calc-result">
              <p class="result-label">{{ t.resultLabel }}</p>
              <p class="result-price">{{ formattedPrice }}</p>
              <p class="result-note">{{ t.resultNote }}</p>
              <button class="btn btn-primary" @click="emit('open-booking', 'consulting')">
                {{ t.calcBtn }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Projects -->
    <section class="section projects">
      <div class="container">
        <h2 class="section-title">{{ t.projectsTitle }}</h2>

        <div class="project-card">
          <div class="project-image">
            <img src="..\\assets\\marcela2.jpeg" alt="MARCELA traslado anual" />
          </div>
          <div class="project-info">
            <span class="project-tag">{{ t.marcela.tag }}</span>
            <h3>{{ t.marcela.title }}</h3>
            <p class="project-sub">{{ t.marcela.sub }}</p>
            <p>{{ t.marcela.desc }}</p>
          </div>
        </div>

        <div class="project-card reverse">
          <div class="project-image">
            <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=800,fit=crop/AMqDOgByPghjN30x/img_1681-zR73hJx3RTqLfd01.jpg" alt="Flota J80 J70" />
          </div>
          <div class="project-info">
            <span class="project-tag">{{ t.fleet.tag }}</span>
            <h3>{{ t.fleet.title }}</h3>
            <p class="project-sub">{{ t.fleet.sub }}</p>
            <p>{{ t.fleet.desc }}</p>
          </div>
        </div>

        <div class="project-card">
          <div class="project-image">
            <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,fit=crop/AMqDOgByPghjN30x/img_20220420_090516-yYEsKX76VSkhJu6A.jpg" alt="OCEAN Elan 350" />
          </div>
          <div class="project-info">
            <span class="project-tag">{{ t.ocean.tag }}</span>
            <h3>{{ t.ocean.title }}</h3>
            <p class="project-sub">{{ t.ocean.sub }}</p>
            <p>{{ t.ocean.desc }}</p>
            <a
              href="https://www.youtube.com/@SailingBoatSolutions"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-youtube"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
              </svg>
              Más info
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="section booking" id="contacto">
      <div class="container">
        <h2 class="section-title">{{ t.bookingTitle }}</h2>
        <p class="section-subtitle">{{ t.bookingSubtitle }}</p>
        <div class="booking-grid">
          <CalendarWidget @select="handleDateSelect" />
          <div class="booking-info">
            <h3>{{ t.bookingInfoTitle }}</h3>
            <p>{{ t.bookingInfoText }}</p>
            <div class="contact-list">
              <a href="mailto:info@boat-solutions.es" class="contact-opt">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                info@boat-solutions.es
              </a>
              <a href="tel:+34676625595" class="contact-opt">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                +34 676 625 595
              </a>
            </div>
            <button class="btn btn-primary" @click="emit('open-booking', 'consulting')">
              {{ t.bookBtn }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CalendarWidget from '../components/CalendarWidget.vue'
import { useLanguage } from '../composables/useLanguage'

const emit = defineEmits<{ 'open-booking': [type: string] }>()
const { useT } = useLanguage()
const t = useT('logistics')

const calc = ref({
  type: 'maritimo' as 'maritimo' | 'terrestre',
  boatType: 'velero',
  length: 10,
  distance: 300,
  km: 500,
})

const BASE_BY_LENGTH: Record<string, number> = {
  velero: 120, yate: 150, catamaran: 180, lancha: 80,
}

const formattedPrice = computed(() => {
  const base = BASE_BY_LENGTH[calc.value.boatType] ?? 120
  let price: number
  if (calc.value.type === 'maritimo') {
    price = base * calc.value.length + calc.value.distance * 2.8
  } else {
    price = base * calc.value.length * 0.6 + calc.value.km * 1.4
  }
  price = Math.round(price / 50) * 50
  return `${price.toLocaleString('es-ES')} €`
})

const handleDateSelect = (data: { date: unknown; time: string | null }) => {
  if (data.date && data.time) emit('open-booking', 'consulting')
}
</script>

<style scoped>
.hero {
  min-height: 65vh;
  display: flex;
  align-items: center;
  position: relative;
  background: var(--color-meteorite-dark);
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: url('https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1920,fit=crop/AMqDOgByPghjN30x/img_1681-zR73hJx3RTqLfd01.jpg') center/cover no-repeat;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(8, 16, 24, 0.88) 0%, rgba(66, 104, 135, 0.6) 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
  color: var(--color-light);
  padding: 140px 20px 80px;
  max-width: 820px;
}

.hero-label {
  font-family: var(--font-heading);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-primary-light);
  margin-bottom: 16px;
}

.hero-title { font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 700; margin-bottom: 20px; }

.hero-subtitle {
  font-size: 1.1rem;
  max-width: 620px;
  opacity: 0.9;
  line-height: 1.8;
  font-family: var(--font-body);
  margin-bottom: 32px;
}

/* Intro stats */
.intro { background: var(--color-primary); }

.intro-inner { text-align: center; }

.intro-stats {
  display: flex;
  justify-content: center;
  gap: 80px;
}

.stat { display: flex; flex-direction: column; align-items: center; gap: 6px; }

.stat-number {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.75);
  font-family: var(--font-heading);
  letter-spacing: 0.5px;
}

/* Services */
.transport-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 28px;
}

.transport-card {
  background: var(--color-light);
  border-radius: 20px;
  padding: 36px 28px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.07);
  transition: transform 0.2s;
}

.transport-card:hover { transform: translateY(-4px); }

.transport-icon {
  width: 72px;
  height: 72px;
  background: var(--color-primary-light);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  margin-bottom: 24px;
}

.transport-card h3 { font-size: 1.3rem; color: var(--color-dark); margin-bottom: 12px; }
.transport-card > p { color: var(--color-gray); line-height: 1.7; margin-bottom: 20px; font-size: 0.95rem; }

.transport-card ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }

.transport-card li {
  color: var(--color-gray);
  font-size: 0.88rem;
  padding-left: 18px;
  position: relative;
}

.transport-card li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--color-primary);
  font-weight: 700;
}

/* Calculator */
.calculator-section { background: var(--color-gray-light); }

.calculator-wrap {
  background: var(--color-light);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 16px 56px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  margin: 0 auto;
}

.calculator-header {
  background: var(--color-primary);
  padding: 36px 44px;
  color: white;
}

.calculator-header h2 { font-size: 1.8rem; margin-bottom: 8px; color: white; }
.calculator-header p { opacity: 0.85; font-family: var(--font-body); font-size: 1rem; }

.calculator-body {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 0;
}

.calc-form { padding: 40px 44px; display: flex; flex-direction: column; gap: 28px; }

.calc-field { display: flex; flex-direction: column; gap: 10px; }

.calc-field label {
  font-family: var(--font-heading);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-dark);
}

.calc-field select {
  padding: 12px 16px;
  border: 2px solid var(--color-gray-border);
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: var(--font-body);
  transition: border-color 0.2s;
}

.calc-field select:focus { outline: none; border-color: var(--color-primary); }

.toggle-group { display: flex; gap: 8px; }

.toggle-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid var(--color-gray-border);
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-family: var(--font-heading);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-gray);
  transition: all 0.2s;
}

.toggle-btn.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.slider-wrap { display: flex; align-items: center; gap: 16px; }

.slider-wrap input[type="range"] {
  flex: 1;
  appearance: none;
  -webkit-appearance: none;
  height: 4px;
  background: var(--color-gray-border);
  border-radius: 2px;
  outline: none;
}

.slider-wrap input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: var(--color-primary);
  border-radius: 50%;
  cursor: pointer;
}

.slider-value {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-primary);
  min-width: 70px;
  text-align: right;
}

.calc-result {
  background: var(--color-gray-light);
  padding: 40px 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  border-left: 1px solid var(--color-gray-border);
}

.result-label {
  font-family: var(--font-heading);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--color-gray);
  margin-bottom: 12px;
}

.result-price {
  font-family: var(--font-heading);
  font-size: 2.8rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 16px;
  line-height: 1;
}

.result-note {
  font-size: 0.82rem;
  color: var(--color-gray);
  line-height: 1.6;
  margin-bottom: 28px;
}

/* Projects */
.projects { background: var(--color-gray-light); }

.project-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  align-items: center;
  margin-bottom: 72px;
}

.project-card:last-child { margin-bottom: 0; }
.project-card.reverse { direction: rtl; }
.project-card.reverse > * { direction: ltr; }

.project-image img {
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.project-tag {
  display: inline-block;
  font-family: var(--font-heading);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 14px;
}

.project-info h3 {
  font-size: 2rem;
  color: var(--color-dark);
  margin-bottom: 6px;
}

.project-sub {
  font-size: 0.95rem;
  color: var(--color-primary);
  font-weight: 500;
  margin-bottom: 18px;
  font-family: var(--font-heading);
}

.project-info > p { color: var(--color-gray); line-height: 1.8; }

.btn-youtube {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding: 12px 24px;
  background: #FF0000;
  color: white;
  border-radius: 8px;
  font-family: var(--font-heading);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s, transform 0.2s;
}

.btn-youtube:hover {
  background: #cc0000;
  transform: translateY(-2px);
}

/* Booking */
.booking { background: var(--color-light); }

.booking-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  max-width: 1000px;
  margin: 0 auto;
}

.booking-info { display: flex; flex-direction: column; justify-content: center; }

.booking-info h3 { font-size: 1.4rem; color: var(--color-dark); margin-bottom: 14px; }
.booking-info > p { color: var(--color-gray); line-height: 1.7; margin-bottom: 24px; }

.contact-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px; }

.contact-opt {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-primary);
  font-weight: 500;
  font-size: 0.9rem;
  transition: opacity 0.2s;
}

.contact-opt:hover { opacity: 0.75; }

@media (max-width: 968px) {
  .intro-stats { gap: 40px; }
  .calculator-body { grid-template-columns: 1fr; }
  .calc-result { border-left: none; border-top: 1px solid var(--color-gray-border); }
  .project-card { grid-template-columns: 1fr; direction: ltr; }
  .project-card.reverse { direction: ltr; }
  .booking-grid { grid-template-columns: 1fr; }
  .hero-title { font-size: 2rem; }
}

@media (max-width: 600px) {
  .intro-stats { flex-direction: column; gap: 24px; }
  .calc-form, .calculator-header { padding: 28px 24px; }
}
</style>
