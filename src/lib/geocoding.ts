/**
 * Geocoding y cálculo de distancia.
 *
 *   - Autocompletado de localidades vía Photon (OpenStreetMap).
 *     https://photon.komoot.io/  · Gratis, sin API key, restringido
 *     a Europa por bbox.
 *
 *   - Distancia por carretera vía OSRM público.
 *     https://router.project-osrm.org/  · Gratis, sin API key.
 *
 *   - Distancia en línea recta (modo marítimo) vía Haversine local.
 *
 * Si Photon u OSRM no responden, los helpers degradan limpiamente
 * (devuelven [] o lanzan un Error que el componente captura).
 */

export interface GeoLocation {
  /** Identificador único basado en lat/lon (estable entre llamadas). */
  id: string
  /** Etiqueta principal mostrada al usuario (ciudad, puerto…). */
  label: string
  /** Detalle bajo el label (provincia, país, código postal…). */
  detail: string
  lat: number
  lon: number
  /** Tipo de OSM (city, town, village, port, harbour…). */
  osmKind?: string
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] }
  properties: {
    name?: string
    city?: string
    country?: string
    state?: string
    county?: string
    postcode?: string
    osm_value?: string
    osm_id?: number
    osm_type?: string
  }
}

// Bounding box aproximado de Europa: SO=(-31.5,34.5), NE=(45,71)
const EUROPE_BBOX = '-31.5,34.5,45,71'

const PHOTON_URL = 'https://photon.komoot.io/api/'
const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving'

/**
 * Busca localidades por texto (autocomplete). Devuelve hasta `limit`
 * resultados restringidos a Europa.
 *
 * Cancela peticiones anteriores en vuelo si pasas un AbortSignal.
 */
export async function searchPlaces(
  query: string,
  opts: { limit?: number; lang?: 'es' | 'en'; signal?: AbortSignal } = {},
): Promise<GeoLocation[]> {
  const q = query.trim()
  if (q.length < 2) return []

  // Photon solo acepta lang ∈ {default, de, en, fr}. Para 'es' (o cualquier otro),
  // omitimos el parámetro: Photon devuelve los nombres en idioma local del POI,
  // que es lo deseable para destinos en España, Francia, Italia, etc.
  const params = new URLSearchParams({
    q,
    limit: String(opts.limit ?? 6),
    bbox: EUROPE_BBOX,
  })
  if (opts.lang === 'en') params.set('lang', 'en')

  const res = await fetch(`${PHOTON_URL}?${params.toString()}`, {
    signal: opts.signal,
  })
  if (!res.ok) throw new Error(`Photon ${res.status}`)
  const data = (await res.json()) as { features: PhotonFeature[] }

  return data.features.map((f) => featureToLocation(f))
}

function featureToLocation(f: PhotonFeature): GeoLocation {
  const p = f.properties
  const [lon, lat] = f.geometry.coordinates
  const main = p.name || p.city || ''
  const detailParts = [
    p.city && p.name && p.city !== p.name ? p.city : null,
    p.state || p.county || null,
    p.country || null,
  ].filter(Boolean)
  return {
    id: `${lat.toFixed(5)},${lon.toFixed(5)}`,
    label: main || p.country || '—',
    detail: detailParts.join(' · '),
    lat,
    lon,
    osmKind: p.osm_value,
  }
}

/**
 * Distancia por carretera entre dos puntos vía OSRM. Devuelve km
 * redondeados al entero superior.
 */
export async function drivingDistanceKm(
  origin: GeoLocation,
  destination: GeoLocation,
  opts: { signal?: AbortSignal } = {},
): Promise<number> {
  const url = `${OSRM_URL}/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=false`
  const res = await fetch(url, { signal: opts.signal })
  if (!res.ok) throw new Error(`OSRM ${res.status}`)
  const data = (await res.json()) as { routes?: Array<{ distance: number }> }
  const meters = data.routes?.[0]?.distance ?? 0
  if (!meters) throw new Error('OSRM: no route found')
  return Math.ceil(meters / 1000)
}

/**
 * Distancia en línea recta (Haversine). Devuelve millas náuticas
 * redondeadas al entero superior — la unidad típica para traslados
 * marítimos.
 */
export function haversineNauticalMiles(
  a: GeoLocation,
  b: GeoLocation,
): number {
  const R_KM = 6371
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  const km = 2 * R_KM * Math.asin(Math.sqrt(h))
  return Math.ceil(km / 1.852) // 1 mn = 1.852 km
}

/** Mismo Haversine pero devolviendo km. */
export function haversineKm(a: GeoLocation, b: GeoLocation): number {
  const nm = haversineNauticalMiles(a, b)
  return Math.ceil(nm * 1.852)
}
