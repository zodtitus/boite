/**
 * Wave alignment detector — v2
 *
 * Periods : A=3000ms  B=4000ms  C=6000ms  (LCM = 12 000ms)
 * Phase offsets chosen so ALL THREE waves peak simultaneously at t=5000ms
 * (≈5s after puzzle mount, giving the player time to read).
 *
 * Alignment window = all three wave values ≥ THRESHOLD (≈ ±1150ms around
 * the peak at full threshold 0.35). Repeats every 12 seconds.
 *
 * Confirmed windows in a 36s cycle (threshold 0.35):
 *   ~4420–5580ms  (width ≈ 1160ms)
 *   ~16420–17580ms
 *   ~28420–29580ms
 */

export const PERIODS    = [3000, 4000, 6000] as const
// Shift each wave so it peaks at t = 5000ms:
//   peak when (t - SHIFT) / period = 1/4  →  SHIFT = t_peak - period/4
const SHIFTS            = [4250, 4000, 3500] as const
export const THRESHOLD  = 0.35   // wave value must exceed this for "high"
export const WARNING    = 1600   // ms before window start to pulse the warning

/** Sine value [−1,1] for wave i at elapsed time */
export function waveValue(i: 0|1|2, elapsedMs: number): number {
  return Math.sin((2 * Math.PI * (elapsedMs - SHIFTS[i])) / PERIODS[i])
}

/** True when ALL three waves are in their high zone simultaneously */
export function isAligned(elapsedMs: number): boolean {
  return (waveValue(0, elapsedMs) >= THRESHOLD) &&
         (waveValue(1, elapsedMs) >= THRESHOLD) &&
         (waveValue(2, elapsedMs) >= THRESHOLD)
}

/** Milliseconds until the next alignment window begins (scans ≤ 12001ms) */
export function msToNextAlignment(elapsedMs: number): number {
  if (isAligned(elapsedMs)) return 0
  for (let dt = 5; dt <= 12500; dt += 5) {
    if (isAligned(elapsedMs + dt)) return dt
  }
  return 12000
}

export interface WaveTick {
  elapsed: number
  values: [number, number, number]
  aligned: boolean          // inside click window right now
  msUntilNext: number       // ms to next window
  imminent: boolean         // msUntilNext < WARNING
  windowPct: number         // 0–1 fill for the timer bar (1 = window open)
}

export function computeTick(startMs: number): WaveTick {
  const elapsed   = Date.now() - startMs
  const values    = [
    waveValue(0, elapsed),
    waveValue(1, elapsed),
    waveValue(2, elapsed),
  ] as [number, number, number]
  const aligned      = isAligned(elapsed)
  const msUntilNext  = msToNextAlignment(elapsed)
  const imminent     = !aligned && msUntilNext < WARNING
  const windowPct    = aligned
    ? 1
    : imminent
    ? 1 - msUntilNext / WARNING
    : 0
  return { elapsed, values, aligned, msUntilNext, imminent, windowPct }
}
