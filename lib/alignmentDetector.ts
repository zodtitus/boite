/**
 * Wave alignment detector — v3
 *
 * Periods : A=3000ms  B=4000ms  C=6000ms  (LCM = 12 000ms)
 * Phase offsets chosen so ALL THREE waves peak simultaneously at t=5000ms.
 *
 * computeTick / isAligned / msToNextAlignment accept optional `threshold`
 * and `warning` params so Mechanism1 can tighten the window as the player
 * progresses through hits (difficulty scaling).
 *
 * Window width at threshold 0.35 ≈ 1160ms.  At 0.65 ≈ 690ms.
 * Repeats every 12 000ms.
 */

export const PERIODS    = [3000, 4000, 6000] as const
const SHIFTS            = [4250, 4000, 3500] as const
export const THRESHOLD  = 0.35   // default
export const WARNING    = 1600   // default ms before window start

/** Sine value [−1, 1] for wave i at elapsed time */
export function waveValue(i: 0|1|2, elapsedMs: number): number {
  return Math.sin((2 * Math.PI * (elapsedMs - SHIFTS[i])) / PERIODS[i])
}

/** True when ALL three waves are simultaneously above `threshold` */
export function isAligned(elapsedMs: number, threshold = THRESHOLD): boolean {
  return (waveValue(0, elapsedMs) >= threshold) &&
         (waveValue(1, elapsedMs) >= threshold) &&
         (waveValue(2, elapsedMs) >= threshold)
}

/** Milliseconds until the next alignment window begins (scans ≤ 12 001ms) */
export function msToNextAlignment(elapsedMs: number, threshold = THRESHOLD): number {
  if (isAligned(elapsedMs, threshold)) return 0
  for (let dt = 5; dt <= 12500; dt += 5) {
    if (isAligned(elapsedMs + dt, threshold)) return dt
  }
  return 12000
}

export interface WaveTick {
  elapsed: number
  values: [number, number, number]
  aligned: boolean
  msUntilNext: number
  imminent: boolean
  windowPct: number
}

export function computeTick(
  startMs: number,
  threshold = THRESHOLD,
  warning   = WARNING,
): WaveTick {
  const elapsed     = Date.now() - startMs
  const values      = [
    waveValue(0, elapsed),
    waveValue(1, elapsed),
    waveValue(2, elapsed),
  ] as [number, number, number]
  const aligned     = isAligned(elapsed, threshold)
  const msUntilNext = msToNextAlignment(elapsed, threshold)
  const imminent    = !aligned && msUntilNext < warning
  const windowPct   = aligned ? 1 : imminent ? 1 - msUntilNext / warning : 0
  return { elapsed, values, aligned, msUntilNext, imminent, windowPct }
}
