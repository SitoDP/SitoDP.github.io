export interface CalcConfig {
  detailing: {
    prices: Record<'basica' | 'pulido' | 'completo' | 'premium', number>
    materialFactor: Record<string, number>
  }
  maritime: {
    patronPerDay: number
    fuelPricePerLiter: number
    mooringRatePerNightPerMeter: number
    dietPerDay: number
    params: Record<string, { speed: number; motorPct: number; lph: number }>
  }
  land: {
    beMin: number
    gondolaMin: number
    supplementBeam: number
  }
}

export const DEFAULT_CONFIG: CalcConfig = {
  detailing: {
    prices: { basica: 51, pulido: 105, completo: 176, premium: 275 },
    materialFactor: { fibra: 1.00, gelcoat: 1.20, madera: 1.30, aluminio: 1.15 },
  },
  maritime: {
    patronPerDay: 150,
    fuelPricePerLiter: 1.60,
    mooringRatePerNightPerMeter: 3.50,
    dietPerDay: 40,
    params: {
      velero:    { speed: 5.5, motorPct: 0.30, lph: 5 },
      yate:      { speed: 8,   motorPct: 1.00, lph: 15 },
      catamaran: { speed: 7,   motorPct: 0.60, lph: 8 },
      lancha:    { speed: 8,   motorPct: 1.00, lph: 20 },
    },
  },
  land: {
    beMin: 250,
    gondolaMin: 600,
    supplementBeam: 250,
  },
}
