/**
 * Validación de correo electrónico para los formularios.
 *
 * Comprueba:
 *   - Formato RFC-ish (más estricto que `type="email"`).
 *   - Dominio bien formado (sin puntos sueltos, TLD ≥ 2 letras).
 *   - Que el TLD no sea de prueba (test, example, invalid, localhost…).
 *   - Errores típicos de tipeo (gmial.com, hotmial.com…) y propone
 *     la corrección.
 *
 * Devuelve códigos de error en lugar de strings para que el componente
 * los traduzca al idioma activo (ES/EN).
 */

const INVALID_TLDS = new Set([
  'test',
  'example',
  'invalid',
  'localhost',
  'local',
])

/** Errores tipográficos frecuentes. Ampliable. */
const COMMON_TYPOS: Record<string, string> = {
  // Gmail
  'gmial.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gnail.com': 'gmail.com',
  // Hotmail
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmal.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'hotmail.co': 'hotmail.com',
  'hotmail.cm': 'hotmail.com',
  'hotmail.con': 'hotmail.com',
  // Outlook
  'outloo.com': 'outlook.com',
  'outloook.com': 'outlook.com',
  'outlok.com': 'outlook.com',
  'outlook.co': 'outlook.com',
  'outlook.cm': 'outlook.com',
  // Yahoo
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yahho.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'yahoo.cm': 'yahoo.com',
  // iCloud
  'iclud.com': 'icloud.com',
  'icould.com': 'icloud.com',
  'iclould.com': 'icloud.com',
}

export type EmailErrorCode =
  | 'empty'
  | 'format'
  | 'localPart'
  | 'domainDots'
  | 'tldShort'
  | 'tldInvalid'
  | 'typo'

export interface EmailValidation {
  valid: boolean
  errorCode?: EmailErrorCode
  /** Si lo escrito parece un typo, propone una corrección clicable. */
  suggestion?: string
}

const FORMAT = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/

export function validateEmail(raw: string): EmailValidation {
  const value = raw.trim()
  if (!value) return { valid: false, errorCode: 'empty' }
  if (!FORMAT.test(value)) return { valid: false, errorCode: 'format' }

  const [local, domain] = value.toLowerCase().split('@')

  if (
    !local ||
    local.startsWith('.') ||
    local.endsWith('.') ||
    local.includes('..')
  ) {
    return { valid: false, errorCode: 'localPart' }
  }

  const parts = domain.split('.')
  if (parts.some((p) => !p)) return { valid: false, errorCode: 'domainDots' }

  const tld = parts[parts.length - 1]
  if (tld.length < 2) return { valid: false, errorCode: 'tldShort' }
  if (INVALID_TLDS.has(tld)) return { valid: false, errorCode: 'tldInvalid' }

  const fix = COMMON_TYPOS[domain]
  if (fix) {
    return {
      valid: false,
      errorCode: 'typo',
      suggestion: `${local}@${fix}`,
    }
  }

  return { valid: true }
}
