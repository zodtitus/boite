/**
 * Wave alignment detector
 * Periods: A=4000ms  B=6000ms  C=9000ms  (LCM = 36 000ms)
 * Alignment = all three waves near their peak (±TOLERANCE ms)
 */

export const PERIODS   = [4000, 6000, 9000] as const
export const TOLERANCE = 200   // ms — half-width of the click window
export const WARNING   = 800   // ms — warn this far ahead

export function waveValue(period: number, elapsedMs: number): number {
  return Math.sin((2 * Math.PI * elapsedMs) / period)
}

export function isAligned(elapsedMs: number, tol = TOLERANCE): boolean {
  return PERIODS.every((p) => {
    const phase    = elapsedMs % p
    const peakPh   = p / 4
    const dist     = Math.min(
      Math.abs(phase - peakPh),
      Math.abs(phase - peakPh - p),
      Math.abs(phase - peakPh + p),
    )
    return dist <= tol
  })
}

export function msToNextAlignment(elapsedMs: number): number {
  for (let dt = 0; dt < 37000; dt += 5) {
    if (isAligned(elapsedMs + dt, 1)) return dt
  }
  return 36000
}

export interface WaveTick {
  elapsed: number
  values: [number, number, number]
  aligned: boolean
  msUntilNext: number
  imminent: boolean
}

export function computeTick(startMs: number): WaveTick {
  const elapsed     = Date.now() - startMs
  const values      = PERIODS.map((p) => waveValue(p, elapsed)) as [number, number, number]
  const aligned     = isAligned(elapsed)
  const msUntilNext = aligned ? 0 : msToNextAlignment(elapsed)
  return { elapsed, values, aligned, msUntilNext, imminent: !aligned && msUntilNext < WARNING }
}
