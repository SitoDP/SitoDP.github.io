<template>
  <header class="header">
    <div class="container header-content">
      <router-link :to="to('/')" class="logo">
        <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=192,h=192,fit=crop,f=png/AMqDOgByPghjN30x/untitled-design-4-dOqZL1pLyvs3RvbW.png" alt="Boat Solutions International" class="logo-img" />
      </router-link>

      <nav class="nav" :class="{ 'nav-active': menuOpen }">
        <router-link :to="to('/')" class="nav-link" @click="close">{{ lbl.home }}</router-link>
        <router-link :to="to('/nosotros')" class="nav-link" @click="close">{{ lbl.about }}</router-link>
        <router-link :to="to('/proyectos')" class="nav-link" @click="close">{{ lbl.projects }}</router-link>

        <!-- Servicios dropdown -->
        <div
          class="nav-dropdown"
          @mouseenter="servicesOpen = true"
          @mouseleave="servicesOpen = false"
        >
          <button class="nav-link nav-link-btn" :class="{ active: isServicesActive }">
            {{ lbl.services }}
            <svg class="chevron" :class="{ rotated: servicesOpen }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <Transition name="dropdown">
            <div v-show="servicesOpen" class="dropdown-menu">
              <router-link :to="to('/yacht-consulting')" class="dropdown-item" @click="close">
                <div class="dropdown-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                </div>
                <div>
                  <span class="dropdown-label">Yacht Consulting</span>
                  <span class="dropdown-desc">{{ lbl.consultingDesc }}</span>
                </div>
              </router-link>
              <router-link :to="to('/yacht-management')" class="dropdown-item" @click="close">
                <div class="dropdown-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                </div>
                <div>
                  <span class="dropdown-label">Yacht Management</span>
                  <span class="dropdown-desc">{{ lbl.managementDesc }}</span>
                </div>
              </router-link>
              <router-link :to="to('/yacht-logistics')" class="dropdown-item" @click="close">
                <div class="dropdown-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                </div>
                <div>
                  <span class="dropdown-label">Yacht Logistics</span>
                  <span class="dropdown-desc">{{ lbl.logisticsDesc }}</span>
                </div>
              </router-link>
              <router-link :to="to('/yacht-detailing')" class="dropdown-item" @click="close">
                <div class="dropdown-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                </div>
                <div>
                  <span class="dropdown-label">Yacht Detailing</span>
                  <span class="dropdown-desc">{{ lbl.detailingDesc }}</span>
                </div>
              </router-link>
            </div>
          </Transition>
        </div>

        <router-link :to="to('/galeria')" class="nav-link" @click="close">{{ lbl.gallery }}</router-link>
        <router-link :to="to('/contacto')" class="nav-link" @click="close">{{ lbl.contact }}</router-link>

        <!-- Mobile-only services list -->
        <div class="nav-services-mobile">
          <p class="nav-services-title">{{ lbl.services }}</p>
          <router-link :to="to('/yacht-consulting')" class="nav-link nav-link-sub" @click="close">Yacht Consulting</router-link>
          <router-link :to="to('/yacht-management')" class="nav-link nav-link-sub" @click="close">Yacht Management</router-link>
          <router-link :to="to('/yacht-logistics')" class="nav-link nav-link-sub" @click="close">Yacht Logistics</router-link>
          <router-link :to="to('/yacht-detailing')" class="nav-link nav-link-sub" @click="close">Yacht Detailing</router-link>
        </div>

      </nav>

      <button class="btn btn-primary btn-reserve" @click="$emit('open-booking', 'consulting')">
        {{ lbl.reserve }}
      </button>

      <div class="nav-lang">
        <button :class="['lang-btn', { 'lang-btn--active': lang === 'es' }]" @click="switchLang('es')">ES</button>
        <button :class="['lang-btn', { 'lang-btn--active': lang === 'en' }]" @click="switchLang('en')">EN</button>
      </div>

      <button class="menu-toggle" @click="menuOpen = !menuOpen" :class="{ active: menuOpen }" aria-label="Abrir menú">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLanguage } from '../composables/useLanguage'

defineEmits<{ 'open-booking': [type: string] }>()

const route = useRoute()
const { lang, to, switchLang } = useLanguage()

const menuOpen = ref(false)
const servicesOpen = ref(false)

const serviceRoutes = ['/yacht-consulting', '/yacht-management', '/yacht-logistics', '/yacht-detailing']
const isServicesActive = computed(() => {
  const normalizedPath = route.path.replace(/^\/en/, '') || '/'
  return serviceRoutes.includes(normalizedPath)
})

const lbl = computed(() => lang.value === 'en' ? {
  home: 'Home',
  about: 'About Us',
  projects: 'Projects',
  services: 'Services',
  gallery: 'Gallery',
  contact: 'Contact',
  reserve: 'Book appointment',
  consultingDesc: 'Advisory & trading',
  managementDesc: 'Full management + Checklist',
  logisticsDesc: 'Transport + Calculator',
  detailingDesc: 'Aesthetics + Calculator',
} : {
  home: 'Inicio',
  about: 'Nosotros',
  projects: 'Proyectos',
  services: 'Servicios',
  gallery: 'Galería',
  contact: 'Contacto',
  reserve: 'Reserva cita',
  consultingDesc: 'Asesoría y compraventa',
  managementDesc: 'Gestión integral + Checklist',
  logisticsDesc: 'Traslados + Calculadora',
  detailingDesc: 'Estética + Calculadora',
})

const close = () => {
  menuOpen.value = false
  servicesOpen.value = false
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(12px);
  z-index: 1000;
  box-shadow: 0 2px 24px rgba(0, 0, 0, 0.08);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  max-width: 1280px;
  margin: 0 auto;
  gap: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.logo-img { width: 38px; height: 38px; object-fit: contain; }

.logo-text {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1.4rem;
  color: var(--color-dark);
  letter-spacing: 1px;
}

/* ── Desktop nav ── */
.nav {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: center;
}

.nav-link {
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 13px;
  color: var(--color-dark);
  padding: 8px 12px;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

/* ── Dropdown ── */
.nav-dropdown {
  position: relative;
}

.nav-link-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link-btn.active {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.chevron {
  transition: transform 0.25s ease;
  opacity: 0.7;
}

.chevron.rotated { transform: rotate(180deg); }

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 14px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.14);
  padding: 10px;
  min-width: 260px;
  z-index: 100;
  border: 1px solid rgba(0,0,0,0.06);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 10px;
  transition: background 0.2s;
  color: var(--color-dark);
}

.dropdown-item:hover {
  background: var(--color-gray-light);
}

.dropdown-item.router-link-active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.dropdown-item.router-link-active .dropdown-icon {
  background: var(--color-primary);
  color: white;
}

.dropdown-icon {
  width: 36px;
  height: 36px;
  background: var(--color-gray-light);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;
  transition: background 0.2s;
}

.dropdown-label {
  display: block;
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 13px;
  color: inherit;
}

.dropdown-desc {
  display: block;
  font-size: 11px;
  color: var(--color-gray);
  margin-top: 2px;
}

/* ── Dropdown transition ── */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}

/* ── Reserve button ── */
.btn-reserve {
  padding: 10px 20px;
  font-size: 13px;
  flex-shrink: 0;
  white-space: nowrap;
}

/* ── Lang ── */
.nav-lang {
  display: flex;
  gap: 4px;
  margin-left: 8px;
  padding-left: 16px;
  border-left: 1px solid var(--color-gray-border);
}

.lang-btn {
  padding: 5px 10px;
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 700;
  border-radius: 4px;
  color: var(--color-gray);
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.5px;
}

.lang-btn:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.lang-btn--active {
  background: var(--color-primary);
  color: white !important;
}

.lang-btn--active:hover {
  background: var(--color-primary-dark);
}

/* ── Mobile toggle ── */
.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  flex-shrink: 0;
}

.menu-toggle span {
  width: 22px;
  height: 2px;
  background: var(--color-dark);
  transition: all 0.3s ease;
  display: block;
}

/* ── Mobile services ── */
.nav-services-mobile { display: none; }

@media (max-width: 1024px) {
  .menu-toggle { display: flex; }
  .btn-reserve { display: none; }

  .nav {
    position: fixed;
    top: 0;
    right: -100%;
    width: 85%;
    max-width: 340px;
    height: 100vh;
    background: var(--color-light);
    flex-direction: column;
    align-items: flex-start;
    padding: 90px 28px 40px;
    gap: 4px;
    transition: right 0.3s ease;
    box-shadow: -10px 0 40px rgba(0, 0, 0, 0.12);
    overflow-y: auto;
  }

  .nav-active { right: 0; }

  .nav-dropdown { width: 100%; }
  .nav-link-btn { width: 100%; justify-content: space-between; }

  .dropdown-menu {
    position: static;
    transform: none;
    box-shadow: none;
    border: none;
    background: var(--color-gray-light);
    border-radius: 10px;
    margin-top: 4px;
    padding: 8px;
  }

  .dropdown-enter-from,
  .dropdown-leave-to {
    opacity: 0;
    transform: none;
  }

  /* Hide desktop dropdown, show mobile list */
  .nav-dropdown { display: none; }
  .nav-services-mobile {
    display: flex;
    flex-direction: column;
    width: 100%;
    border-top: 1px solid var(--color-gray-border);
    border-bottom: 1px solid var(--color-gray-border);
    padding: 12px 0;
    margin: 4px 0;
    gap: 2px;
  }

  .nav-services-title {
    font-family: var(--font-heading);
    font-size: 11px;
    font-weight: 700;
    color: var(--color-gray);
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 4px 12px 8px;
  }

  .nav-link-sub {
    padding: 8px 12px;
    font-size: 13px;
    color: var(--color-dark);
  }

  .nav-lang { margin-left: 0; padding-left: 0; border-left: none; }
}
</style>
