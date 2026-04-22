import { readFile, writeFile } from 'node:fs/promises'

const DEEPL_API_KEY = process.env.DEEPL_API_KEY
const DEEPL_URL = process.env.DEEPL_API_URL ?? 'https://api-free.deepl.com/v2/translate'
const CACHE_URL = new URL('../src/data/.translation-cache.json', import.meta.url)

const SOURCE_LANG = 'DE'
const TARGET_LANG = 'ES'

interface CacheEntry {
  text: string
  html?: boolean
}

interface DeepLResponse {
  translations: Array<{ text: string; detected_source_language: string }>
}

let cache: Record<string, string> = {}
let cacheLoaded = false
let dirty = false

async function loadCache(): Promise<void> {
  if (cacheLoaded) return
  try {
    const raw = await readFile(CACHE_URL, 'utf-8')
    cache = JSON.parse(raw) as Record<string, string>
  } catch {
    cache = {}
  }
  cacheLoaded = true
}

export async function flushCache(): Promise<void> {
  if (!dirty) return
  await writeFile(CACHE_URL, JSON.stringify(cache, null, 2) + '\n')
  dirty = false
}

function cacheKey(text: string, html: boolean): string {
  return `${html ? 'html' : 'text'}:${text}`
}

async function deeplTranslate(texts: string[], html: boolean): Promise<string[]> {
  if (!DEEPL_API_KEY) {
    throw new Error('DEEPL_API_KEY is not set')
  }
  const params = new URLSearchParams()
  params.append('source_lang', SOURCE_LANG)
  params.append('target_lang', TARGET_LANG)
  if (html) params.append('tag_handling', 'html')
  for (const t of texts) params.append('text', t)

  const res = await fetch(DEEPL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`DeepL error ${res.status}: ${body}`)
  }

  const data = (await res.json()) as DeepLResponse
  return data.translations.map((t) => t.text)
}

export async function translate(text: string, options: { html?: boolean } = {}): Promise<string> {
  const html = options.html ?? false
  if (!text || !text.trim()) return text
  await loadCache()
  const key = cacheKey(text, html)
  if (cache[key] !== undefined) return cache[key]

  if (!DEEPL_API_KEY) {
    return text
  }

  const [result] = await deeplTranslate([text], html)
  cache[key] = result
  dirty = true
  return result
}

export async function translateMany(
  texts: string[],
  options: { html?: boolean } = {},
): Promise<string[]> {
  const html = options.html ?? false
  if (texts.length === 0) return []
  await loadCache()

  const results = new Array<string>(texts.length)
  const missingIndices: number[] = []
  const missingTexts: string[] = []

  texts.forEach((text, i) => {
    if (!text || !text.trim()) {
      results[i] = text
      return
    }
    const key = cacheKey(text, html)
    if (cache[key] !== undefined) {
      results[i] = cache[key]
    } else {
      missingIndices.push(i)
      missingTexts.push(text)
    }
  })

  if (missingTexts.length === 0) return results

  if (!DEEPL_API_KEY) {
    missingIndices.forEach((i) => (results[i] = texts[i]))
    return results
  }

  // DeepL accepts up to 50 texts per call
  const BATCH = 50
  for (let offset = 0; offset < missingTexts.length; offset += BATCH) {
    const batch = missingTexts.slice(offset, offset + BATCH)
    const translated = await deeplTranslate(batch, html)
    batch.forEach((source, j) => {
      const globalIndex = missingIndices[offset + j]
      const result = translated[j]
      results[globalIndex] = result
      cache[cacheKey(source, html)] = result
      dirty = true
    })
  }

  return results
}

export function hasDeepLKey(): boolean {
  return Boolean(DEEPL_API_KEY)
}

// Keep CacheEntry in the exports for potential external use
export type { CacheEntry }
