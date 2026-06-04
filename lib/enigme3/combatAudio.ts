let _ctx: AudioContext | null = null
function ctx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext()
  return _ctx
}

function tone(freq: number, type: OscillatorType, dur: number, gain: number, attack = 0.01, delay = 0) {
  const ac  = ctx()
  if (ac.state === "suspended") ac.resume()
  const osc = ac.createOscillator()
  const amp = ac.createGain()
  const now = ac.currentTime + delay
  osc.type = type
  osc.frequency.setValueAtTime(freq, now)
  amp.gain.setValueAtTime(0, now)
  amp.gain.linearRampToValueAtTime(gain, now + attack)
  amp.gain.exponentialRampToValueAtTime(0.001, now + dur)
  osc.connect(amp); amp.connect(ac.destination)
  osc.start(now); osc.stop(now + dur + 0.05)
}

function noise(dur: number, gain: number, filterFreq = 800, delay = 0) {
  const ac     = ctx()
  if (ac.state === "suspended") ac.resume()
  const frames = ac.sampleRate * dur
  const buf    = ac.createBuffer(1, frames, ac.sampleRate)
  const data   = buf.getChannelData(0)
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1
  const src = ac.createBufferSource()
  src.buffer = buf
  const f   = ac.createBiquadFilter()
  f.type = "bandpass"; f.frequency.value = filterFreq; f.Q.value = 0.8
  const amp = ac.createGain()
  const now = ac.currentTime + delay
  amp.gain.setValueAtTime(gain, now)
  amp.gain.exponentialRampToValueAtTime(0.001, now + dur)
  src.connect(f); f.connect(amp); amp.connect(ac.destination)
  src.start(now)
}

export type CombatSoundType =
  | "hit"        // basic attack impact
  | "ability"    // ability activation
  | "death"      // unit eliminated
  | "steal"      // Samehada drain
  | "explosion"  // AOE / cannon barrage
  | "chain"      // illusion chain (ki_ren)
  | "heal"       // heal animation

export const combatSounds: Record<CombatSoundType, () => void> = {
  hit: () => {
    noise(0.06, 0.14, 1200)
    tone(200, "square", 0.08, 0.08)
  },
  ability: () => {
    tone(550, "sine", 0.18, 0.12)
    tone(825, "sine", 0.14, 0.06, 0.01, 0.04)
    noise(0.12, 0.05, 1600, 0.02)
  },
  death: () => {
    tone(180, "sawtooth", 0.4, 0.20, 0.005)
    noise(0.35, 0.12, 300)
    tone(120, "sine", 0.5, 0.08, 0.01, 0.15)
  },
  steal: () => {
    tone(660, "sine", 0.08, 0.10)
    tone(440, "sine", 0.25, 0.12, 0.01, 0.06)
    tone(330, "sine", 0.30, 0.07, 0.01, 0.14)
    noise(0.15, 0.04, 2000, 0.02)
  },
  explosion: () => {
    noise(0.25, 0.20, 600)
    tone(120, "sawtooth", 0.30, 0.18, 0.005)
    tone(200, "square", 0.20, 0.10, 0.01, 0.05)
    noise(0.15, 0.08, 2400, 0.08)
  },
  chain: () => {
    tone(880, "sine", 0.12, 0.08)
    tone(1320, "sine", 0.10, 0.06, 0.005, 0.06)
    tone(660,  "sine", 0.18, 0.10, 0.01,  0.10)
    tone(990,  "sine", 0.14, 0.05, 0.005, 0.16)
  },
  heal: () => {
    tone(528, "sine", 0.25, 0.10)
    tone(792, "sine", 0.22, 0.07, 0.01, 0.05)
    tone(1056,"sine", 0.18, 0.04, 0.01, 0.10)
  },
}

export function playCombatSound(type: CombatSoundType) {
  try { combatSounds[type]() } catch (_) { /* ignore */ }
}
