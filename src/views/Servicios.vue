<template>
  <div class="servicios-page">
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-overlay"></div>
      <div class="container hero-content">
        <h1 class="hero-title">Servicios</h1>
        <p class="hero-subtitle">Soluciones a armadores: Desarrollo de soluciones a medida, realce estetico y transportes por mar y por tierra.</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="services-grid">
          <div class="service-card">
            <div class="service-img-wrap">
              <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=600,fit=crop/AMqDOgByPghjN30x/img_3592-mp84x25VeJCLqWJL.JPG" alt="Soluciones a medida" />
            </div>
            <div class="service-body">
              <h3>Soluciones a medida</h3>
              <p>Nuestros servicios de consultoria y gestion de embarcaciones hara que disfrutes de tu barco el 100% del tiempo. Supervisamos el mantenimiento y los proveedores para que todo funcione a la perfeccion, temporada tras temporada.</p>
              <button class="btn btn-primary" @click="emit('open-booking', 'consulting')">Programa tu primera reunion</button>
            </div>
          </div>

          <div class="service-card">
            <div class="service-img-wrap">
              <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=600,fit=crop/AMqDOgByPghjN30x/pulir-baiona-m5K8N07gwlSrDxWn.png" alt="Realce estetico" />
            </div>
            <div class="service-body">
              <h3>Realce estetico</h3>
              <p>Mantenemos tu embarcacion impecable, preservando su valor limpiando y puliendo las superficies. Tambien realizamos videografia aerea para campañas de venta.</p>
              <button class="btn btn-primary" @click="emit('open-booking', 'consulting')">Pide presupuesto</button>
              <span class="service-note">El primero tiene descuento de bienvenida</span>
            </div>
          </div>

          <div class="service-card">
            <div class="service-img-wrap">
              <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=600,fit=crop/AMqDOgByPghjN30x/img_20220420_090516-yYEsKX76VSkhJu6A.jpg" alt="Traslados" />
            </div>
            <div class="service-body">
              <h3>Traslados</h3>
              <p>Podemos trasladar tu barco por tierra o por mar. Desplazarse para un campeonato importante o comprar un barco en el extranjero nunca ha sido tan facil.</p>
              <button class="btn btn-primary" @click="emit('open-booking', 'consulting')">Pide presupuesto</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section cta">
      <div class="container">
        <h2>Necesitas ayuda con tu embarcacion?</h2>
        <p>Agenda una consulta gratuita y te asesoramos sin compromiso.</p>
        <button class="btn btn-primary btn-large" @click="emit('open-booking', 'consulting')">
          Agenda tu consultoria nautica — Gratis
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  'open-booking': [type: string]
}>()
</script>

<style scoped>
.hero {
  min-height: 50vh;
  display: flex;
  align-items: center;
  position: relative;
  background: var(--color-meteorite-dark);
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: url('https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1920,fit=crop/AMqDOgByPghjN30x/img_3592-mp84x25VeJCLqWJL.JPG') center/cover no-repeat;
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
  padding: 140px 20px 60px;
}

.hero-title { font-size: 3rem; font-weight: 700; margin-bottom: 16px; }

.hero-subtitle {
  font-size: 1.2rem;
  max-width: 650px;
  margin: 0 auto;
  opacity: 0.9;
  font-family: var(--font-body);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 36px;
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
  height: 240px;
  overflow: hidden;
}

.service-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.service-card:hover .service-img-wrap img { transform: scale(1.05); }

.service-body { padding: 32px; }

.service-body h3 {
  font-size: 1.5rem;
  color: var(--color-dark);
  margin-bottom: 14px;
}

.service-body p {
  color: var(--color-gray);
  margin-bottom: 24px;
  line-height: 1.8;
}

.service-note {
  display: block;
  margin-top: 12px;
  font-size: 0.8rem;
  color: var(--color-success);
  font-weight: 500;
  font-family: var(--font-heading);
}

.cta {
  background: var(--color-gray-light);
  text-align: center;
}

.cta h2 { color: var(--color-dark); margin-bottom: 16px; }
.cta p { color: var(--color-gray); margin-bottom: 32px; font-size: 1.1rem; }
.btn-large { padding: 16px 40px; }

@media (max-width: 768px) {
  .hero-title { font-size: 2rem; }
  .services-grid { grid-template-columns: 1fr; }
}
</style>
