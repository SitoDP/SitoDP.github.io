import { ref, readonly } from 'vue'
import { DEFAULT_CONFIG, type CalcConfig } from '../data/calc-config-defaults'

const config = ref<CalcConfig>(DEFAULT_CONFIG)
let loaded = false

function parseRow(row: string[]): [string, number] | null {
  const key = row[0]?.trim()
  const value = parseFloat(row[1]?.trim() ?? '')
  if (!key || isNaN(value)) return null
  return [key, value]
}

function applyRows(rows: [string, number][]) {
  const c = structuredClone(DEFAULT_CONFIG)
  for (const [key, value] of rows) {
    if (key === 'detailing_basica')           c.detailing.prices.basica = value
    else if (key === 'detailing_pulido')      c.detailing.prices.pulido = value
    else if (key === 'detailing_completo')    c.detailing.prices.completo = value
    else if (key === 'detailing_premium')     c.detailing.prices.premium = value
    else if (key === 'detailing_factor_fibra')    c.detailing.materialFactor.fibra = value
    else if (key === 'detailing_factor_gelcoat')  c.detailing.materialFactor.gelcoat = value
    else if (key === 'detailing_factor_madera')   c.detailing.materialFactor.madera = value
    else if (key === 'detailing_factor_aluminio') c.detailing.materialFactor.aluminio = value
    else if (key === 'maritime_patron_day')        c.maritime.patronPerDay = value
    else if (key === 'maritime_fuel_price')        c.maritime.fuelPricePerLiter = value
    else if (key === 'maritime_mooring_rate')      c.maritime.mooringRatePerNightPerMeter = value
    else if (key === 'maritime_diet_day')          c.maritime.dietPerDay = value
    else if (key === 'land_be_min')           c.land.beMin = value
    else if (key === 'land_gondola_min')      c.land.gondolaMin = value
    else if (key === 'land_supplement_beam')  c.land.supplementBeam = value
  }
  config.value = c
}

async function loadConfig() {
  const url = import.meta.env.VITE_CALC_CONFIG_URL as string | undefined
  if (!url) return
  try {
    const res = await fetch(url)
    if (!res.ok) return
    const text = await res.text()
    const rows = text.split('\n').map(line => line.split(',')).flatMap(r => {
      const parsed = parseRow(r)
      return parsed ? [parsed] : []
    })
    applyRows(rows)
  } catch {
    // silently use defaults
  }
}

export function useCalcConfig() {
  if (!loaded) {
    loaded = true
    void loadConfig()
  }
  return readonly(config)
}
