/**
 * Jerarquía de categorías del escaparate.
 * Mapea las colecciones Shopify a grupos lógicos con la misma estructura
 * que usa Fender Design en su navegación principal.
 * Cada `handle` debe coincidir con un `collections.json` → handle.
 */

export interface CategoryNode {
  id: string
  title: { es: string; en: string }
  subcategories: string[] // collection handles
}

export const categoryTree: CategoryNode[] = [
  {
    id: 'hogar',
    title: { es: 'Hogar', en: 'Home' },
    subcategories: [
      'geschirr-accessoires',
      'ideen-fur-den-tisch-1',
      'crew-bekleidung',
    ],
  },
  {
    id: 'textiles',
    title: {
      es: 'Textiles personalizados para yates',
      en: 'Custom yacht textiles',
    },
    subcategories: [
      'abdeckungen',
      'personalisierte-fenderuberzuge-1',
      'fussmatten',
      'relingpolster',
      'liegeflachenbezuge',
      'liegetucher',
      'fender',
    ],
  },
  {
    id: 'innovaciones',
    title: { es: 'Innovaciones y accesorios', en: 'Innovations & accessories' },
    subcategories: [
      'nutzliche-accessoires',
      'innovationen',
      'ideen-fur-den-tisch',
      'anchorroll',
      'zubehor-anchorroll',
      'clinkfree-system',
      'brillenbander-schwimm-brillenbander',
      'bimini-beleuchtung',
    ],
  },
]
