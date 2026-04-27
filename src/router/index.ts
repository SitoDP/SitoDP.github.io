import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

// Eagerly import the home view (most likely landing page) so first paint
// doesn't wait on a chunk fetch. Every other view is lazy-loaded.
const Nosotros = () => import('../views/Nosotros.vue')
const Proyectos = () => import('../views/Proyectos.vue')
const Galeria = () => import('../views/Galeria.vue')
const Contacto = () => import('../views/Contacto.vue')
const YachtConsulting = () => import('../views/YachtConsulting.vue')
const YachtManagement = () => import('../views/YachtManagement.vue')
const YachtLogistics = () => import('../views/YachtLogistics.vue')
const YachtDetailing = () => import('../views/YachtDetailing.vue')
const PoliticaPrivacidad = () => import('../views/PoliticaPrivacidad.vue')
const TerminosCondiciones = () => import('../views/TerminosCondiciones.vue')
const Tienda = () => import('../views/Tienda.vue')
const ProductoDetalle = () => import('../views/ProductoDetalle.vue')
const Carrito = () => import('../views/Carrito.vue')
const NotFound = () => import('../views/NotFound.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/nosotros', name: 'nosotros', component: Nosotros },
    { path: '/proyectos', name: 'proyectos', component: Proyectos },
    { path: '/galeria', name: 'galeria', component: Galeria },
    { path: '/contacto', name: 'contacto', component: Contacto },
    { path: '/yacht-consulting', name: 'yacht-consulting', component: YachtConsulting },
    { path: '/yacht-management', name: 'yacht-management', component: YachtManagement },
    { path: '/yacht-logistics', name: 'yacht-logistics', component: YachtLogistics },
    { path: '/yacht-detailing', name: 'yacht-detailing', component: YachtDetailing },
    { path: '/politica-de-privacidad', name: 'politica-privacidad', component: PoliticaPrivacidad },
    { path: '/terminos-y-condiciones', name: 'terminos-condiciones', component: TerminosCondiciones },
    { path: '/tienda', name: 'tienda', component: Tienda },
    { path: '/tienda/:handle', name: 'producto-detalle', component: ProductoDetalle },
    { path: '/carrito', name: 'carrito', component: Carrito },
    // Legacy redirect
    { path: '/servicios', redirect: '/yacht-consulting' },
    // EN routes
    { path: '/en', name: 'home-en', component: Home },
    { path: '/en/nosotros', name: 'nosotros-en', component: Nosotros },
    { path: '/en/proyectos', name: 'proyectos-en', component: Proyectos },
    { path: '/en/galeria', name: 'galeria-en', component: Galeria },
    { path: '/en/contacto', name: 'contacto-en', component: Contacto },
    { path: '/en/yacht-consulting', name: 'yacht-consulting-en', component: YachtConsulting },
    { path: '/en/yacht-management', name: 'yacht-management-en', component: YachtManagement },
    { path: '/en/yacht-logistics', name: 'yacht-logistics-en', component: YachtLogistics },
    { path: '/en/yacht-detailing', name: 'yacht-detailing-en', component: YachtDetailing },
    { path: '/en/tienda', name: 'tienda-en', component: Tienda },
    { path: '/en/tienda/:handle', name: 'producto-detalle-en', component: ProductoDetalle },
    { path: '/en/carrito', name: 'carrito-en', component: Carrito },
    // Catch-all
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

// Keep <html lang> in sync with the active locale (improves SEO + a11y)
router.afterEach((to) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = to.path.startsWith('/en') ? 'en' : 'es'
  }
})

export default router
