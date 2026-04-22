<template>
  <div class="home">
    <section class="hero">
      <video class="hero-bg" autoplay muted loop playsinline>
        <source src="https://pub-e19f3243d179441cbc3adda22f8d74fc.r2.dev/videoHome.mp4" type="video/mp4" />
      </video>
      <div class="hero-overlay"></div>
      <div class="container hero-content">
        <h1 class="hero-title">{{ t.heroTitle }}</h1>
        <p class="hero-subtitle">{{ t.heroSubtitle }}</p>
        <div class="hero-buttons">
          <button class="btn btn-primary" @click="emit('open-booking', 'booking')">{{ t.heroBook }}</button>
          <button class="btn btn-outline" @click="emit('open-booking', 'consulting')">{{ t.heroConsult }}</button>
        </div>
        <p class="hero-note">{{ t.heroNote }}</p>
      </div>
    </section>

    <section id="servicios" class="section services">
      <div class="container">
        <h2 class="section-title">{{ t.servicesTitle }}</h2>
        <p class="section-subtitle">{{ t.servicesSubtitle }}</p>

        <div class="services-grid">
          <div class="service-card">
            <div class="service-img-wrap">
              <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=600,fit=crop/AMqDOgByPghjN30x/img_3592-mp84x25VeJCLqWJL.JPG" alt="Soluciones a medida" />
            </div>
            <div class="service-body">
              <h3>{{ t.service1Title }}</h3>
              <p>{{ t.service1Desc }}</p>
              <button class="btn btn-outline" @click="emit('open-booking', 'consulting')">{{ t.service1Btn }}</button>
            </div>
          </div>

          <div class="service-card">
            <div class="service-img-wrap">
              <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=600,fit=crop/AMqDOgByPghjN30x/pulir-baiona-m5K8N07gwlSrDxWn.png" alt="Realce estetico" />
            </div>
            <div class="service-body">
              <h3>{{ t.service2Title }}</h3>
              <p>{{ t.service2Desc }}</p>
              <button class="btn btn-outline" @click="emit('open-booking', 'consulting')">{{ t.service2Btn }}</button>
              <span class="service-note">{{ t.service2Note }}</span>
            </div>
          </div>

          <div class="service-card">
            <div class="service-img-wrap">
              <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=600,fit=crop/AMqDOgByPghjN30x/img_20220420_090516-yYEsKX76VSkhJu6A.jpg" alt="Traslados" />
            </div>
            <div class="service-body">
              <h3>{{ t.service3Title }}</h3>
              <p>{{ t.service3Desc }}</p>
              <button class="btn btn-outline" @click="emit('open-booking', 'consulting')">{{ t.service3Btn }}</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="proyectos" class="section projects">
      <div class="container">
        <h2 class="section-title">{{ t.projectsTitle }}</h2>

        <div class="project-card">
          <div class="project-image">
            <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=800,fit=crop/AMqDOgByPghjN30x/img_23233-yxk0N83Y27Icf47I.jpg" alt="Dulcinea" />
          </div>
          <div class="project-info">
            <h3>DULCINEA</h3>
            <p>{{ t.dulcineaDesc1 }}</p>
            <p>{{ t.dulcineaDesc2 }}</p>
            <router-link :to="lang === 'en' ? '/en/proyectos' : '/proyectos'" class="btn btn-primary">{{ t.moreInfo }}</router-link>
          </div>
        </div>

        <div class="project-card reverse">
          <div class="project-image">
            <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=800,fit=crop/AMqDOgByPghjN30x/img_1681-zR73hJx3RTqLfd01.jpg" alt="Marcela" />
          </div>
          <div class="project-info">
            <h3>MARCELA</h3>
            <p>{{ t.marcelaDesc1 }}</p>
            <p>{{ t.marcelaDesc2 }}</p>
            <router-link :to="lang === 'en' ? '/en/proyectos' : '/proyectos'" class="btn btn-primary">{{ t.moreInfo }}</router-link>
          </div>
        </div>
      </div>
    </section>

    <section class="section subscribe">
      <div class="container">
        <div class="subscribe-content">
          <h2>{{ t.subscribeTitle }}</h2>
          <p>{{ t.subscribeText }}</p>
          <div class="youtube-embed">
            <iframe
              src="https://www.youtube.com/embed/V79rgBRcBro"
              title="Boat Solutions YouTube"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
          <a href="https://youtube.com/@SailingBoatSolutions" target="_blank" rel="noopener noreferrer" class="btn btn-light">
            {{ t.subscribeBtn }}
          </a>
        </div>
      </div>
    </section>

    <section id="galeria" class="section gallery">
      <div class="container">
        <h2 class="section-title">{{ t.galleryTitle }}</h2>
        <p class="section-subtitle">{{ t.gallerySubtitle }}</p>

        <div class="gallery-grid">
          <div class="gallery-item" v-for="(img, i) in galleryImages" :key="i">
            <img :src="img.src" :alt="img.alt" />
          </div>
        </div>
      </div>
    </section>

    <section id="contacto" class="section contact">
      <div class="container">
        <h2 class="section-title">{{ t.contactTitle }}</h2>
        <p class="section-subtitle">{{ t.contactSubtitle }}</p>

        <div class="contact-grid">
          <div class="contact-card">
            <CalendarWidget @select="handleDateSelect" />
          </div>
          <div class="contact-card">
            <div class="contact-info-card">
              <h3>{{ t.contactInfoTitle }}</h3>
              <div class="contact-item">
                <span class="contact-label">Email:</span>
                <a href="mailto:info@boat-solutions.es">info@boat-solutions.es</a>
              </div>
              <div class="contact-item">
                <span class="contact-label">{{ lang === 'en' ? 'Phone' : 'Teléfono' }}:</span>
                <a href="tel:+34676625595">+34 676 625 595</a>
              </div>
              <div class="contact-item">
                <span class="contact-label">{{ lang === 'en' ? 'Location' : 'Ubicación' }}:</span>
                <span>{{ t.contactLocation }}</span>
              </div>
              <button class="btn btn-primary btn-full" @click="emit('open-booking', 'consulting')">
                {{ t.bookBtn }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import CalendarWidget from '../components/CalendarWidget.vue'
import { useLanguage } from '../composables/useLanguage'

const emit = defineEmits<{ 'open-booking': [type: string] }>()
const { lang, useT } = useLanguage()
const t = useT('home')

const galleryImages = [
  { src: 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=600,fit=crop/AMqDOgByPghjN30x/dji_0773-mk34eQ2g2ZUekG6R.JPG', alt: 'Vista aerea de yate' },
  { src: 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=600,fit=crop/AMqDOgByPghjN30x/img_1681-zR73hJx3RTqLfd01.jpg', alt: 'Embarcacion en el mar' },
  { src: 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=600,fit=crop/AMqDOgByPghjN30x/img_23233-yxk0N83Y27Icf47I.jpg', alt: 'Gestion de yates' },
  { src: 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=600,fit=crop/AMqDOgByPghjN30x/pulir-baiona-m5K8N07gwlSrDxWn.png', alt: 'Detailing profesional' },
]

const handleDateSelect = (data: { date: unknown; time: string | null }) => {
  if (data.time) emit('open-booking', 'consulting')
}
</script>

<style scoped>
.hero {
  min-height: 100vh;
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

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(8, 16, 24, 0.82) 0%, rgba(66, 104, 135, 0.65) 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: var(--color-light);
  padding: 140px 20px 80px;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 24px;
  line-height: 1.25;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.hero-subtitle {
  font-size: 1.2rem;
  max-width: 650px;
  margin: 0 auto 36px;
  opacity: 0.9;
  font-family: var(--font-body);
  line-height: 1.7;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.hero-buttons .btn-outline {
  border-color: rgba(255,255,255,0.8);
  color: var(--color-light);
}

.hero-buttons .btn-outline:hover {
  background: var(--color-light);
  color: var(--color-primary);
}

.hero-note {
  font-size: 0.875rem;
  opacity: 0.75;
  font-family: var(--font-heading);
}

/* ── Servicios ── */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
}

.service-card {
  background: var(--color-light);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.service-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
}

.service-img-wrap {
  height: 220px;
  overflow: hidden;
}

.service-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.service-card:hover .service-img-wrap img {
  transform: scale(1.05);
}

.service-body {
  padding: 28px;
  text-align: left;
}

.service-body h3 {
  font-size: 1.35rem;
  color: var(--color-dark);
  margin-bottom: 12px;
}

.service-body p {
  color: var(--color-gray);
  margin-bottom: 20px;
  line-height: 1.7;
  font-size: 0.95rem;
}

.service-note {
  display: block;
  margin-top: 10px;
  font-size: 0.8rem;
  color: var(--color-success);
  font-weight: 500;
  font-family: var(--font-heading);
}

/* ── Proyectos ── */
.projects {
  background: var(--color-gray-light);
}

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
  transition: transform 0.3s ease;
}

.project-image img:hover { transform: scale(1.02); }

.project-info h3 {
  font-size: 2rem;
  color: var(--color-dark);
  margin-bottom: 16px;
  letter-spacing: 1px;
}

.project-info p {
  color: var(--color-gray);
  margin-bottom: 16px;
  line-height: 1.8;
}

/* ── Subscribe ── */
.subscribe {
  background: linear-gradient(135deg, var(--color-meteorite-dark) 0%, var(--color-primary) 100%);
  color: var(--color-light);
}

.subscribe-content {
  text-align: center;
}

.subscribe-content h2 {
  font-size: 2rem;
  margin-bottom: 8px;
}

.subscribe-content > p {
  margin-bottom: 32px;
  opacity: 0.9;
}

.youtube-embed {
  max-width: 640px;
  margin: 0 auto 32px;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 16/9;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.youtube-embed iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.btn-light {
  background: var(--color-light);
  color: var(--color-primary);
  border: none;
}

.btn-light:hover {
  background: rgba(255,255,255,0.9);
  transform: translateY(-2px);
}

/* ── Galeria ── */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.gallery-item {
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 4/3;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-item:hover img { transform: scale(1.05); }

/* ── Contacto ── */
.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  max-width: 900px;
  margin: 0 auto;
}

.contact-info-card {
  padding: 32px;
  background: var(--color-light);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.contact-info-card h3 {
  color: var(--color-dark);
  margin-bottom: 24px;
}

.contact-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
}

.contact-label {
  font-weight: 600;
  color: var(--color-gray);
  font-family: var(--font-heading);
  font-size: 0.9rem;
}

.contact-item a { color: var(--color-primary); font-weight: 500; }

.btn-full { width: 100%; margin-top: 24px; }

@media (max-width: 768px) {
  .hero-title { font-size: 2rem; }

  .project-card { grid-template-columns: 1fr; gap: 24px; }
  .project-card.reverse { direction: ltr; }

  .gallery-grid { grid-template-columns: 1fr; }
  .contact-grid { grid-template-columns: 1fr; }
}
</style>
