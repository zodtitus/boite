"use client"

import { useState, useEffect, useRef, useCallback, useId } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { computeTick, isAligned, PERIODS, WARNING, type WaveTick } from "@/lib/alignmentDetector"
import { useAudio } from "@/lib/useAudio"

const REQUIRED = 2
const MAX_FAIL = 7

// ── Wave bar ─────────────────────────────────────────────────────────────────
const BAR_COLORS = [
  { idle: "#1a4a6a", active: "#4a90c0", glow: "rgba(74,144,192,0.7)" },
  { idle: "#6a1a1a", active: "#c04040", glow: "rgba(192,64,64,0.7)"  },
  { idle: "#3a2a6a", active: "#8060d0", glow: "rgba(128,96,208,0.7)" },
] as const

function WaveBar({ value, period, index, aligned, imminent, solved }: {
  value: number; period: number; index: number
  aligned: boolean; imminent: boolean; solved: boolean
}) {
  const col  = BAR_COLORS[index]
  const norm = (value + 1) / 2                 // 0..1
  const barH = 100
  const fillH = Math.round(norm * barH)

  const isHigh = value >= 0.35
  const color  = solved   ? "var(--gold)"
    : isHigh && aligned   ? col.active
    : isHigh && imminent  ? col.active
    : isHigh              ? col.active
    :                       col.idle
  const glow = solved
    ? "0 0 14px rgba(200,169,110,0.7)"
    : isHigh
    ? `0 0 ${aligned ? 14 : imminent ? 10 : 6}px ${col.glow}`
    : "none"

  const labels = ["α", "β", "γ"] as const
  const periodLabel = period < 3500 ? "3s" : period < 5000 ? "4s" : "6s"

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
      <span style={{
        fontFamily: "serif", fontSize: "16px",
        color, transition: "color 0.3s",
        textShadow: glow !== "none" ? `0 0 6px ${col.glow}` : "none",
      }}>
        {labels[index]}
      </span>

      <div style={{
        width: "22px", height: `${barH}px`,
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${color}44`, borderRadius: "3px",
        position: "relative", overflow: "hidden",
        transition: "border-color 0.3s", boxShadow: glow,
      }}>
        {/* Threshold line */}
        <div style={{
          position: "absolute", left: 0, right: 0,
          top: `${barH - Math.round(0.675 * barH)}px`,
          height: "1px", background: "rgba(200,169,110,0.25)", zIndex: 2,
        }} />
        {/* Fill */}
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          height: `${fillH}px`,
          background: `linear-gradient(to top, ${color}cc, ${color}44)`,
          borderRadius: "0 0 2px 2px",
        }} />
        {/* Peak line */}
        <div style={{
          position: "absolute", left: 0, right: 0,
          top: `${barH - fillH}px`, height: "1px",
          background: color, boxShadow: `0 0 3px ${color}`,
        }} />
      </div>

      <span style={{
        fontFamily: "var(--font-cinzel-var), 'Cinzel', serif",
        fontSize: "8px", letterSpacing: "1px",
        color: "var(--muted)", textTransform: "uppercase",
      }}>
        {periodLabel}
      </span>
    </div>
  )
}

// ── Shinobi silhouette ────────────────────────────────────────────────────────
function ShinobiSVG({ aligned, imminent, solved, failed }: {
  aligned: boolean; imminent: boolean; solved: boolean; failed: boolean
}) {
  const id = useId().replace(/:/g, "")
  const turbFreq  = solved ? 0 : failed ? 0.18 : aligned ? 0 : imminent ? 0.025 : 0.06
  const turbScale = solved ? 0 : failed ? 22 : aligned ? 0 : imminent ? 5 : 9
  const bodyColor = solved ? "var(--gold)" : aligned ? "#4a90c0" : imminent ? "#8060d0"
    : failed ? "#c04040" : "var(--muted)"
  const glowC = solved ? "rgba(200,169,110,0.8)"
    : aligned ? "rgba(74,144,192,0.7)"
    : imminent ? "rgba(128,96,208,0.6)"
    : failed ? "rgba(192,64,64,0.8)"
    : "rgba(106,96,80,0.2)"

  return (
    <div style={{
      filter: `drop-shadow(0 0 ${aligned || solved ? 16 : imminent ? 10 : failed ? 12 : 3}px ${glowC})`,
      transition: "filter 0.3s",
    }}>
      <svg viewBox="0 0 120 160" width="88" height="118" style={{ overflow: "visible" }}>
        <defs>
          <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="turbulence" baseFrequency={turbFreq} numOctaves="3" seed="7" result="t" />
            <feDisplacementMap in="SourceGraphic" in2="t" scale={turbScale}
              xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g filter={`url(#${id})`} fill={bodyColor}>
          <ellipse cx="60" cy="24" rx="14" ry="16" opacity="0.9" />
          <rect x="54" y="36" width="12" height="8" rx="2" opacity="0.8" />
          <path d="M36 44 L84 44 L90 80 L72 82 L72 100 L48 100 L48 82 L30 80 Z" opacity="0.85" />
          <path d="M36 48 L14 36 L10 42 L32 56 Z" opacity="0.8" />
          <ellipse cx="11" cy="39" rx="7" ry="5" opacity="0.75" />
          <path d="M84 48 L106 68 L102 74 L80 54 Z" opacity="0.8" />
          <ellipse cx="104" cy="71" rx="7" ry="5" opacity="0.75" />
          <path d="M48 98 L42 130 L52 132 L56 100 Z" opacity="0.8" />
          <ellipse cx="47" cy="132" rx="10" ry="5" opacity="0.75" />
          <path d="M72 98 L78 130 L68 132 L64 100 Z" opacity="0.8" />
          <ellipse cx="73" cy="132" rx="10" ry="5" opacity="0.75" />
          <rect x="46" y="14" width="28" height="6" rx="2" opacity="0.6"
            fill={solved ? "var(--gold-dark)" : imminent ? "#6040a0" : "#2a3a5a"} />
          {solved && (
            <text x="60" y="22" textAnchor="middle" fontSize="8"
              fill="var(--bg)" opacity="0.9" fontFamily="serif">天</text>
          )}
        </g>
      </svg>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props { onSolved: () => void; disabled: boolean }

export default function Mechanism1({ onSolved, disabled }: Props) {
  const { play, resume } = useAudio()
  const startRef  = useRef<number>(Date.now())
  const rafRef    = useRef<number>(0)
  const warnedRef = useRef(false)

  const [tick, setTick]           = useState<WaveTick>(() => computeTick(startRef.current))
  const [hits, setHits]           = useState(0)
  const [fails, setFails]         = useState(0)
  const [solved, setSolved]       = useState(false)
  const [failFlash, setFailFlash] = useState(false)
  const [burstKey, setBurstKey]   = useState(0)

  // RAF loop
  useEffect(() => {
    if (disabled) return
    function frame() {
      const t = computeTick(startRef.current)
      setTick(t)
      // Fire warning sound once per approach
      if (t.imminent && !warnedRef.current) {
        play("warning")
        warnedRef.current = true
      }
      if (!t.imminent && !t.aligned) warnedRef.current = false
      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [disabled, play])

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

  let statusMsg = "Attends que les trois barres montent — frappe quand elles brillent"
  if (solved)          statusMsg = "Synchronisation parfaite. La voie est ouverte."
  else if (failFlash)  statusMsg = "Hors rythme."
  else if (isAlignedNow) statusMsg = "MAINTENANT !"
  else if (isImminent) statusMsg = "Prépare-toi…"
  else if (hits > 0)   statusMsg = `${hits} / ${REQUIRED} synchronisations`

  const btnBorder = solved       ? "var(--gold)"
    : failFlash    ? "#c04040"
    : isAlignedNow ? "var(--gold)"
    : isImminent   ? "#8060d0"
    : "rgba(200,169,110,0.2)"
  const btnGlow = solved         ? "0 0 24px rgba(200,169,110,0.6)"
    : failFlash    ? "0 0 16px rgba(192,64,64,0.6)"
    : isAlignedNow ? "0 0 28px rgba(200,169,110,0.8)"
    : isImminent   ? "0 0 18px rgba(128,96,208,0.6)"
    : "none"

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px", width: "100%" }}>

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
            background: i < hits ? "var(--gold)" : "rgba(255,255,255,0.1)",
            border: `1px solid ${i < hits ? "var(--gold)" : "rgba(255,255,255,0.15)"}`,
            boxShadow: i < hits ? "0 0 6px rgba(200,169,110,0.6)" : "none",
            transition: "all 0.3s",
          }} />
        ))}
        <div style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.1)", margin: "0 3px" }} />
        {Array.from({ length: MAX_FAIL }).map((_, i) => (
          <div key={i} style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: i < fails ? "#c04040" : "rgba(255,255,255,0.08)",
            border: `1px solid ${i < fails ? "#c04040" : "rgba(255,255,255,0.12)"}`,
            transition: "all 0.3s",
          }} />
        ))}
      </div>

      {/* Arena: bars + shinobi + button */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>

        {/* Left bars (α, β) */}
        <div style={{ display: "flex", gap: "10px" }}>
          {([0, 1] as const).map(i => (
            <WaveBar key={i} value={tick.values[i]} period={PERIODS[i]} index={i}
              aligned={isAlignedNow} imminent={isImminent} solved={solved} />
          ))}
        </div>

        {/* Centre */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
          <ShinobiSVG aligned={isAlignedNow} imminent={isImminent} solved={solved} failed={failFlash} />

          {/* Button */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AnimatePresence>
              {burstKey > 0 && (
                <motion.div key={burstKey}
                  style={{ position: "absolute", width: "120px", height: "120px",
                    borderRadius: "50%", border: "2px solid var(--gold)",
                    pointerEvents: "none" }}
                  initial={{ opacity: 1, scale: 0.5 }}
                  animate={{ opacity: 0, scale: 2.0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              )}
            </AnimatePresence>

            <button onClick={handleClick} disabled={solved || disabled} style={{
              width: "72px", height: "72px", borderRadius: "50%",
              border: `2px solid ${btnBorder}`,
              background: solved ? "rgba(200,169,110,0.08)" : "rgba(15,18,24,0.8)",
              boxShadow: btnGlow,
              cursor: (solved || disabled) ? "default" : "pointer",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: "3px",
              outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
            }}>
              <span style={{ fontFamily: "serif", fontSize: "20px", color: "var(--gold)",
                pointerEvents: "none", textShadow: "0 0 6px rgba(200,169,110,0.4)" }}>刻</span>
              <span style={{
                fontFamily: "var(--font-cinzel-var), 'Cinzel', serif",
                fontSize: "7px", letterSpacing: "2px", color: "var(--muted)",
                textTransform: "uppercase", pointerEvents: "none",
              }}>
                {solved ? "Résolu" : "Frappe"}
              </span>
            </button>
          </div>
        </div>

        {/* Right bar (γ) */}
        <WaveBar value={tick.values[2]} period={PERIODS[2]} index={2}
          aligned={isAlignedNow} imminent={isImminent} solved={solved} />
      </div>

      {/* Imminence bar */}
      <div style={{
        width: "160px", height: "3px",
        background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden",
      }}>
        <motion.div style={{
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

      {/* Subtle hint */}
      <p className="font-cinzel" style={{
        fontSize: "8px", letterSpacing: "2px",
        color: "var(--muted)", opacity: 0.4, textTransform: "uppercase",
      }}>
        frappe quand les trois barres dépassent le trait doré
      </p>
    </div>
  )
}
