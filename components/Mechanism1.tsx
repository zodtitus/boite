"use client"

import { useState, useEffect, useRef, useCallback, useId } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { computeTick, isAligned, PERIODS, WARNING, type WaveTick } from "@/lib/alignmentDetector"
import { useAudio } from "@/lib/useAudio"
import { useMusicContext } from "@/lib/MusicContext"
import ChakraBody from "@/components/ChakraBody"

const REQUIRED = 2
const MAX_FAIL = 7

// ── Main component ────────────────────────────────────────────────────────────
interface Props { onSolved: () => void; disabled: boolean }

export default function Mechanism1({ onSolved, disabled }: Props) {
  const { play, resume }    = useAudio()
  const { getBassPulse }    = useMusicContext()
  const startRef   = useRef<number>(Date.now())
  const rafRef     = useRef<number>(0)
  const warnedRef  = useRef(false)

  const [tick, setTick]           = useState<WaveTick>(() => computeTick(startRef.current))
  const [hits, setHits]           = useState(0)
  const [fails, setFails]         = useState(0)
  const [solved, setSolved]       = useState(false)
  const [failFlash, setFailFlash] = useState(false)
  const [burstKey, setBurstKey]   = useState(0)
  const [musicPulse, setMusicPulse] = useState(0)

  // RAF loop — ticks wave state and reads bass pulse every frame
  useEffect(() => {
    if (disabled) return
    function frame() {
      const t = computeTick(startRef.current)
      setTick(t)
      setMusicPulse(getBassPulse())

      if (t.imminent && !warnedRef.current) {
        play("warning")
        warnedRef.current = true
      }
      if (!t.imminent && !t.aligned) warnedRef.current = false

      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [disabled, play, getBassPulse])

  const handleClick = useCallback(() => {
    if (solved || disabled) return
    resume()
    const elapsed = Date.now() - startRef.current
    if (isAligned(elapsed)) {
      play("align")
      setBurstKey(k => k + 1)
      setHits(h => {
        const next = h + 1
        if (next >= REQUIRED) {
          play("success")
          setSolved(true)
          setTimeout(() => onSolved(), 1000)
        }
        return next
      })
    } else {
      play("fail")
      setFailFlash(true)
      setTimeout(() => setFailFlash(false), 450)
      setFails(f => {
        const next = f + 1
        if (next >= MAX_FAIL) setTimeout(() => { setHits(0); setFails(0) }, 700)
        return next
      })
    }
  }, [solved, disabled, play, resume, onSolved])

  const isImminent   = tick.imminent && !solved
  const isAlignedNow = tick.aligned  && !solved

  // alignmentLevel = min of max(0, wave_i) across all waves
  // Equals 0 when any wave is negative; rises toward 1 as all approach peak
  const alignmentLevel = tick.values.reduce(
    (acc: number, v: number) => Math.min(acc, Math.max(0, v)),
    1
  )

  let statusMsg = "Laisse ton chakra se synchroniser — frappe quand le corps se dissout"
  if (solved)          statusMsg = "Synchronisation parfaite. La voie est ouverte."
  else if (failFlash)  statusMsg = "Hors rythme."
  else if (isAlignedNow) statusMsg = "MAINTENANT !"
  else if (isImminent) statusMsg = "Prépare-toi…"
  else if (hits > 0)   statusMsg = `${hits} / ${REQUIRED} synchronisations`

  const btnBorder = solved        ? "var(--gold)"
    : failFlash    ? "#c04040"
    : isAlignedNow ? "var(--gold)"
    : isImminent   ? "#8060d0"
    : `rgba(200,169,110,${0.15 + alignmentLevel * 0.4})`

  const btnGlow = solved
    ? "0 0 24px rgba(200,169,110,0.6)"
    : failFlash
    ? "0 0 16px rgba(192,64,64,0.6)"
    : isAlignedNow
    ? "0 0 28px rgba(200,169,110,0.8)"
    : isImminent
    ? "0 0 18px rgba(128,96,208,0.6)"
    : "none"

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: "16px", width: "100%",
    }}>

      {/* Label */}
      <p className="font-cinzel" style={{
        color: "var(--gold-dark)", fontSize: "9px",
        letterSpacing: "4px", textTransform: "uppercase",
      }}>
        La Patience du Sang · 同調
      </p>

      {/* Attempt dots */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {Array.from({ length: REQUIRED }).map((_, i) => (
          <div key={i} style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: i < hits ? "var(--gold)" : "rgba(255,255,255,0.10)",
            border: `1px solid ${i < hits ? "var(--gold)" : "rgba(255,255,255,0.15)"}`,
            boxShadow: i < hits ? "0 0 6px rgba(200,169,110,0.6)" : "none",
            transition: "all 0.3s",
          }} />
        ))}
        <div style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.10)", margin: "0 3px" }} />
        {Array.from({ length: MAX_FAIL }).map((_, i) => (
          <div key={i} style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: i < fails ? "#c04040" : "rgba(255,255,255,0.08)",
            border: `1px solid ${i < fails ? "#c04040" : "rgba(255,255,255,0.12)"}`,
            transition: "all 0.3s",
          }} />
        ))}
      </div>

      {/* Chakra body — main visual */}
      <ChakraBody
        alignmentLevel={alignmentLevel}
        aligned={isAlignedNow}
        imminent={isImminent}
        solved={solved}
        failed={failFlash}
        musicPulse={musicPulse}
      />

      {/* Click button */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <AnimatePresence>
          {burstKey > 0 && (
            <motion.div
              key={burstKey}
              style={{
                position: "absolute",
                width: "130px", height: "130px",
                borderRadius: "50%",
                border: "2px solid var(--gold)",
                pointerEvents: "none",
              }}
              initial={{ opacity: 1, scale: 0.4 }}
              animate={{ opacity: 0, scale: 2.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        <button
          onClick={handleClick}
          disabled={solved || disabled}
          style={{
            width: "72px", height: "72px", borderRadius: "50%",
            border: `2px solid ${btnBorder}`,
            background: solved ? "rgba(200,169,110,0.08)" : "rgba(15,18,24,0.85)",
            boxShadow: btnGlow,
            cursor: (solved || disabled) ? "default" : "pointer",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "3px",
            outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
          }}
        >
          <span style={{
            fontFamily: "serif", fontSize: "22px", color: "var(--gold)",
            pointerEvents: "none",
            textShadow: `0 0 ${isAlignedNow ? "14px" : "6px"} rgba(200,169,110,${isAlignedNow ? 0.8 : 0.4})`,
          }}>
            刻
          </span>
          <span style={{
            fontFamily: "var(--font-cinzel-var), 'Cinzel', serif",
            fontSize: "7px", letterSpacing: "2px", color: "var(--muted)",
            textTransform: "uppercase", pointerEvents: "none",
          }}>
            {solved ? "Résolu" : "Frappe"}
          </span>
        </button>
      </div>

      {/* Imminence bar */}
      <div style={{
        width: "160px", height: "3px",
        background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden",
      }}>
        <motion.div
          style={{
            height: "100%", borderRadius: "2px",
            background: isAlignedNow ? "var(--gold)" : "#8060d0",
          }}
          animate={{ width: `${Math.round(tick.windowPct * 100)}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Status */}
      <p className="font-cormorant" style={{
        color: solved        ? "var(--gold)"
          : failFlash        ? "#c04040"
          : isAlignedNow     ? "var(--gold)"
          : isImminent       ? "#9070d0"
          : "var(--muted)",
        fontSize: "13px", fontStyle: "italic",
        textAlign: "center", minHeight: "20px",
        transition: "color 0.3s",
      }}>
        {statusMsg}
      </p>

      {/* Hint */}
      <p className="font-cinzel" style={{
        fontSize: "8px", letterSpacing: "2px",
        color: "var(--muted)", opacity: 0.4, textTransform: "uppercase",
        textAlign: "center",
      }}>
        le corps se dissout quand les trois courants s'unissent
      </p>
    </div>
  )
}
