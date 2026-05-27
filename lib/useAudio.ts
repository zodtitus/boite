import { useRef, useCallback } from "react"

export type SoundType = "tick" | "align" | "success" | "fail" | "warning" | "symbol" | "illusion"

let _ctx: AudioContext | null = null
function ctx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext()
  return _ctx
}

function tone(freq: number, type: OscillatorType, dur: number, gain: number, attack = 0.01) {
  const ac  = ctx()
  if (ac.state === "suspended") ac.resume()
  const osc = ac.createOscillator()
  const amp = ac.createGain()
  const now = ac.currentTime
  osc.type = type
  osc.frequency.setValueAtTime(freq, now)
  amp.gain.setValueAtTime(0, now)
  amp.gain.linearRampToValueAtTime(gain, now + attack)
  amp.gain.exponentialRampToValueAtTime(0.001, now + dur)
  osc.connect(amp); amp.connect(ac.destination)
  osc.start(now); osc.stop(now + dur + 0.05)
}

function noise(dur: number, gain: number, filterFreq = 800) {
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
  const now = ac.currentTime
  amp.gain.setValueAtTime(gain, now)
  amp.gain.exponentialRampToValueAtTime(0.001, now + dur)
  src.connect(f); f.connect(amp); amp.connect(ac.destination)
  src.start(now)
}

const sounds: Record<SoundType, () => void> = {
  tick:     () => tone(880,  "sine",     0.08, 0.06,  0.005),
  warning:  () => { tone(440, "sine", 0.3, 0.12); tone(660, "sine", 0.3, 0.06, 0.02) },
  align:    () => { tone(528, "sine", 0.5, 0.15); tone(792, "sine", 0.5, 0.07, 0.02); tone(1056, "sine", 0.5, 0.04, 0.03) },
  success:  () => { tone(440, "sine", 1.2, 0.16); tone(528, "sine", 1.2, 0.12, 0.05); tone(660, "sine", 1.2, 0.08, 0.09); tone(880, "sine", 1.2, 0.05, 0.13) },
  fail:     () => { tone(120, "sawtooth", 0.35, 0.18, 0.005); noise(0.25, 0.07) },
  symbol:   () => { tone(660, "sine", 0.25, 0.10); tone(990, "sine", 0.20, 0.05, 0.02) },
  illusion: () => { tone(200, "sawtooth", 0.4, 0.14, 0.005); noise(0.3, 0.06, 400) },
}

export function useAudio() {
  const ready = useRef(false)

  const resume = useCallback(() => {
    ctx().resume().catch(() => {})
    ready.current = true
  }, [])

  const play = useCallback((type: SoundType) => {
    try { sounds[type]() } catch (_) { /* ignore */ }
  }, [])

  return { play, resume }
}
