/**
 * Centralized config for asset URLs and external services.
 * Avoids hard-coding the same domain in multiple components.
 */

export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://boat-solutions.es'

export const ASSETS = {
  /** Cloudflare R2 bucket serving hero videos */
  cdn: 'https://pub-e19f3243d179441cbc3adda22f8d74fc.r2.dev',
  /** Legacy Zyro CDN serving images */
  imagesCdn: 'https://assets.zyrosite.com',
  /** Brand logo PNG */
  logo: 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=192,h=192,fit=crop,f=png/AMqDOgByPghjN30x/untitled-design-4-dOqZL1pLyvs3RvbW.png',
} as const

export const SOCIAL = {
  instagram: 'https://www.instagram.com/boat_solutions.es/',
  youtube: 'https://youtube.com/@SailingBoatSolutions',
  email: 'info@boat-solutions.es',
  phone: '+34676625595',
  phoneDisplay: '+34 676 625 595',
} as const

/** Build a full CDN URL for a video file in the R2 bucket */
export const cdnVideo = (filename: string): string => `${ASSETS.cdn}/${filename}`
