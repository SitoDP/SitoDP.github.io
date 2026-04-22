import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Nosotros from '../views/Nosotros.vue'
import Proyectos from '../views/Proyectos.vue'
import Galeria from '../views/Galeria.vue'
import Contacto from '../views/Contacto.vue'
import YachtConsulting from '../views/YachtConsulting.vue'
import YachtManagement from '../views/YachtManagement.vue'
import YachtLogistics from '../views/YachtLogistics.vue'
import YachtDetailing from '../views/YachtDetailing.vue'
import PoliticaPrivacidad from '../views/PoliticaPrivacidad.vue'
import TerminosCondiciones from '../views/TerminosCondiciones.vue'
import Tienda from '../views/Tienda.vue'
import ProductoDetalle from '../views/ProductoDetalle.vue'
import Carrito from '../views/Carrito.vue'

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
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
