import { home } from './home'
import { nosotros } from './nosotros'
import { consulting } from './consulting'
import { management } from './management'
import { logistics } from './logistics'
import { detailing } from './detailing'
import { galeria } from './galeria'
import { proyectos } from './proyectos'
import { contacto } from './contacto'
import { checklist } from './checklist'
import { header } from './header'
import { footer } from './footer'
import { cart } from './cart'
import { shop } from './shop'
import { product } from './product'
import { quote } from './quote'
import { notFound } from './notFound'

export const i18n = {
  es: {
    home: home.es,
    nosotros: nosotros.es,
    consulting: consulting.es,
    management: management.es,
    logistics: logistics.es,
    detailing: detailing.es,
    galeria: galeria.es,
    proyectos: proyectos.es,
    contacto: contacto.es,
    checklist: checklist.es,
    header: header.es,
    footer: footer.es,
    cart: cart.es,
    shop: shop.es,
    product: product.es,
    quote: quote.es,
    notFound: notFound.es,
  },
  en: {
    home: home.en,
    nosotros: nosotros.en,
    consulting: consulting.en,
    management: management.en,
    logistics: logistics.en,
    detailing: detailing.en,
    galeria: galeria.en,
    proyectos: proyectos.en,
    contacto: contacto.en,
    checklist: checklist.en,
    header: header.en,
    footer: footer.en,
    cart: cart.en,
    shop: shop.en,
    product: product.en,
    quote: quote.en,
    notFound: notFound.en,
  },
}

export type Lang = keyof typeof i18n
export type PageKey = keyof typeof i18n['es']
