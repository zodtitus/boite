"use client"

import { useState, useCallback, useRef, useEffect, useId } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAudio } from "@/lib/useAudio"

const TRUE_KANJI = "月"
const ILLUSIONS  = ["目", "日", "白", "明", "用", "囚", "旧", "月", "肉", "朋"]
const REQUIRED   = 6          // 6 identifications to win
const STAGE_W    = 440
const STAGE_H    = 270

/**
 * Difficulty scaling per hit:
 *
 *  hit  symbols  timer   true-distort  size-gap  help
 *   0      7     5000ms   scale=3        +10px   full
 *   1      8     4200ms   scale=5        +8px    full
 *   2      9     3400ms   scale=7        +6px    partial (no status "Juste")
 *   3     10     2700ms   scale=9        +4px    partial (cryptic)
 *   4     11     2100ms   scale=11       +2px    minimal
 *   5     12     1600ms   scale=13        0px    silent
 */
function dynRoundMs(hits: number): number {
  return [5000, 4200, 3400, 2700, 2100, 1600][Math.min(hits, 5)]
}
function numSymbols(hits: number): number {
  return Math.min(12, 7 + hits)
}
// true kanji turbulence displacement scale (makes 月 harder to identify)
function trueDistortScale(hits: number): number {
  return 3 + hits * 2
}
// px size advantage of true symbol over illusions (shrinks to 0)
function trueSizeBonus(hits: number): number {
  return Math.max(0, 10 - hits * 2)
}
// mist base opacity (rises with hits so stage gets foggier)
function mistBaseOpacity(hits: number): number {
  return 0.18 + hits * 0.06
}

// ── Symbol data ───────────────────────────────────────────────────────────────
interface SymData {
  id: number; kanji: string; isTrue: boolean
  x: number; y: number; vx: number; vy: number
  turbFreq: number; turbSeed: number; size: number
}

function genSymbols(n: number, sizeBonus: number): SymData[] {
  const trueIdx = Math.floor(Math.random() * n)
  const margin  = 45
  return Array.from({ length: n }, (_, i) => {
    const isTrue = i === trueIdx
    const angle  = Math.random() * Math.PI * 2
    const speed  = 0.25 + Math.random() * 0.65
    const baseSize = 40 + (Math.random() * 14 | 0)
    return {
      id: i, isTrue,
      kanji: isTrue
        ? TRUE_KANJI
        : ILLUSIONS[(i + Math.floor(Math.random() * (ILLUSIONS.length - 1))) % ILLUSIONS.length],
      x: margin + Math.random() * (STAGE_W - margin * 2),
      y: margin + Math.random() * (STAGE_H - margin * 2),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      turbFreq: Math.random(),
      turbSeed: Math.floor(Math.random() * 50) + 1,
      size: isTrue ? baseSize + sizeBonus : baseSize,
    }
  })
}

// ── Floating symbol ───────────────────────────────────────────────────────────
function FloatSym({ data, onClick, disabled, flash, distort }: {
  data: SymData
  onClick: (id: number, isTrue: boolean) => void
  disabled: boolean
  flash: "correct" | "wrong" | null
  distort: number   // true-kanji distortion scale for current difficulty
}) {
  const filterId  = useId().replace(/:/g, "")
  const turbFreq  = data.isTrue ? 0.01 + distort * 0.003 : 0.04 + data.turbFreq * 0.03
  const turbScale = data.isTrue ? distort : 12 + data.turbFreq * 8
  const baseColor = data.isTrue ? "rgba(200,169,110,0.85)" : "rgba(106,96,80,0.55)"
  const fillColor = flash === "correct" ? "rgba(200,169,110,1)"
    : flash === "wrong"   ? "rgba(200,60,60,0.9)"
    : baseColor
  const strokeC   = data.isTrue
    ? `rgba(200,169,110,${flash === "correct" ? 1 : 0.4})`
    : `rgba(106,96,80,${flash === "wrong" ? 0.8 : 0.15})`

  return (
    <motion.div
      style={{ position: "absolute", cursor: disabled ? "default" : "pointer",
        userSelect: "none", zIndex: data.isTrue ? 2 : 1 }}
      animate={{
        x: [0, data.vx * 50, -data.vx * 35, data.vx * 25, 0],
        y: [0, -data.vy * 40, data.vy * 30, -data.vy * 15, 0],
      }}
      transition={{ duration: 11 + data.turbFreq * 7, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
      onClick={() => !disabled && onClick(data.id, data.isTrue)}
      whileHover={disabled ? {} : { scale: 1.1 }}
      whileTap={disabled ? {} : { scale: 0.93 }}
    >
      <svg width={data.size} height={data.size} viewBox="0 0 60 60" style={{ overflow: "visible" }}>
        <defs>
          <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
            <feTurbulence type="turbulence" baseFrequency={turbFreq} numOctaves="4" seed={data.turbSeed} result="t" />
            <feDisplacementMap in="SourceGraphic" in2="t"
              scale={flash === "wrong" ? turbScale * 2.5 : turbScale}
              xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g filter={`url(#${filterId})`}>
          <circle cx="30" cy="30" r="25" fill="none" stroke={strokeC}
            strokeWidth={data.isTrue ? 1.5 : 0.8}
            opacity={flash ? 0.9 : data.isTrue ? 0.5 : 0.2} />
          <text x="30" y="42" textAnchor="middle" fontSize="34" fontFamily="serif" fill={fillColor}
            style={{
              filter: flash === "correct" ? "drop-shadow(0 0 6px rgba(200,169,110,0.9))"
                : flash === "wrong" ? "drop-shadow(0 0 8px rgba(200,60,60,0.8))"
                : data.isTrue ? "drop-shadow(0 0 3px rgba(200,169,110,0.3))"
                : "none",
              transition: "fill 0.2s",
            }}>
            {data.kanji}
          </text>
        </g>
      </svg>
    </motion.div>
  )
}

// ── Mist layer ────────────────────────────────────────────────────────────────
function Mist({ dense, baseOpacity }: { dense: boolean; baseOpacity: number }) {
  const id = useId().replace(/:/g, "")
  return (
    <motion.div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      animate={{ opacity: dense ? Math.min(0.75, baseOpacity * 3) : baseOpacity }}
      transition={{ duration: 2, ease: "easeInOut" }}
    >
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }} preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id={id}>
            <feTurbulence type="fractalNoise" baseFrequency="0.007 0.005" numOctaves="3" seed="3" result="t" />
            <feColorMatrix type="matrix"
              values="0 0 0 0 0.04  0 0 0 0 0.05  0 0 0 0 0.07  0 0 0 7 -3" />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter={`url(#${id})`} fill="white" />
      </svg>
    </motion.div>
  )
}

// ── Room perspective lines ────────────────────────────────────────────────────
function Room() {
  const cx = STAGE_W / 2, vpy = STAGE_H * 0.4
  return (
    <svg width={STAGE_W} height={STAGE_H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <defs>
        <radialGradient id="vig" cx="50%" cy="50%" r="65%">
          <stop offset="35%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(5,7,9,0.85)" />
        </radialGradient>
      </defs>
      {[[0,0],[STAGE_W,0],[STAGE_W,STAGE_H],[0,STAGE_H]].map(([x,y],i) => (
        <line key={i} x1={x} y1={y} x2={cx} y2={vpy}
          stroke="rgba(200,169,110,0.06)" strokeWidth="0.8" />
      ))}
      {[0.25, 0.5, 0.75].map((t, i) => {
        const lx1 = cx + (0 - cx) * (1 - t), lx2 = cx + (STAGE_W - cx) * (1 - t)
        const ly = vpy + (STAGE_H - vpy) * t
        return <line key={i} x1={lx1} y1={ly} x2={lx2} y2={ly} stroke="rgba(200,169,110,0.04)" strokeWidth="0.5" />
      })}
      <rect width={STAGE_W} height={STAGE_H} fill="url(#vig)" />
      <motion.circle cx={cx} cy={vpy} r="2.5" fill="rgba(200,169,110,0.5)"
        animate={{ r: [1.5, 4, 1.5], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props { onSolved: () => void; disabled: boolean }

export default function Mechanism2({ onSolved, disabled }: Props) {
  const { play, resume } = useAudio()
  const mistTimer   = useRef<ReturnType<typeof setTimeout>>(undefined)
  const timerRafRef = useRef<number>(0)
  const timerStart  = useRef<number>(0)
  const timerAlive  = useRef(false)
  const hitsRef     = useRef(0)  // mirror for timer RAF

  const [symbols,     setSymbols]     = useState<SymData[]>(() => genSymbols(7, 10))
  const [hits,        setHits]        = useState(0)
  const [solved,      setSolved]      = useState(false)
  const [flash,       setFlash]       = useState<{ id: number; type: "correct"|"wrong" } | null>(null)
  const [screenFlash, setScreenFlash] = useState<"correct"|"wrong"|null>(null)
  const [mistDense,   setMistDense]   = useState(false)
  const [timerPct,    setTimerPct]    = useState(0)
  const [timerWarn,   setTimerWarn]   = useState(false)

  useEffect(() => { hitsRef.current = hits }, [hits])

  // ── Round countdown ───────────────────────────────────────────────────────
  const stopTimer = useCallback(() => {
    cancelAnimationFrame(timerRafRef.current)
    timerAlive.current = false
    setTimerPct(0)
    setTimerWarn(false)
  }, [])

  const startTimer = useCallback((ms: number) => {
    cancelAnimationFrame(timerRafRef.current)
    timerAlive.current = true
    timerStart.current = Date.now()

    function tick() {
      const pct = Math.max(0, 1 - (Date.now() - timerStart.current) / ms)
      setTimerPct(pct)
      setTimerWarn(pct < 0.30)
      if (pct <= 0 && timerAlive.current) {
        timerAlive.current = false
        play("fail")
        setHits(0)
        setTimerPct(0)
        setTimerWarn(false)
        setScreenFlash("wrong")
        setTimeout(() => setScreenFlash(null), 350)
        setTimeout(() => setSymbols(genSymbols(numSymbols(0), trueSizeBonus(0))), 400)
        return
      }
      if (timerAlive.current) timerRafRef.current = requestAnimationFrame(tick)
    }
    timerRafRef.current = requestAnimationFrame(tick)
  }, [play])

  // ── Mist cycle — gets more aggressive with difficulty ─────────────────────
  useEffect(() => {
    if (disabled || solved) return
    const h = hitsRef.current
    const denseMs  = 2500 + Math.random() * 1500 - h * 200
    const sparseMs = Math.max(2000, 5000 - h * 500) + Math.random() * 3000

    function cycle() {
      setMistDense(true)
      mistTimer.current = setTimeout(() => {
        setMistDense(false)
        mistTimer.current = setTimeout(cycle, sparseMs)
      }, Math.max(800, denseMs))
    }
    mistTimer.current = setTimeout(cycle, Math.max(1000, 3000 - hits * 300))
    return () => clearTimeout(mistTimer.current)
  }, [disabled, solved, hits])

  // ── Click handler ─────────────────────────────────────────────────────────
  const handleClick = useCallback((id: number, isTrue: boolean) => {
    if (solved || disabled) return
    resume()

    setFlash({ id, type: isTrue ? "correct" : "wrong" })
    setScreenFlash(isTrue ? "correct" : "wrong")
    setTimeout(() => setFlash(null), 380)
    setTimeout(() => setScreenFlash(null), 280)

    if (isTrue) {
      play("symbol")
      setHits(h => {
        const next = h + 1
        if (next >= REQUIRED) {
          stopTimer()
          play("success")
          setSolved(true)
          setTimeout(() => onSolved(), 1200)
        } else {
          startTimer(dynRoundMs(next))
          setTimeout(() => {
            setSymbols(genSymbols(numSymbols(next), trueSizeBonus(next)))
          }, 480)
        }
        return next
      })
    } else {
      play("illusion")
      stopTimer()
      setTimeout(() => {
        setHits(0)
        setSymbols(genSymbols(numSymbols(0), trueSizeBonus(0)))
      }, 480)
    }
  }, [solved, disabled, play, resume, onSolved, startTimer, stopTimer])

  // ── Status ─────────────────────────────────────────────────────────────────
  const helpLevel = hits < 2 ? 0 : hits < 4 ? 1 : 2
  const statusMsg = solved
    ? "L'illusion se dissipe. Tu perces les ténèbres."
    : screenFlash === "correct"
    ? helpLevel === 0 ? "Juste — symbole reconnu." : `${hits} / ${REQUIRED}`
    : screenFlash === "wrong"
    ? helpLevel === 0 ? "Illusion. Retour au début." : helpLevel === 1 ? "…" : ""
    : timerWarn && hits > 0
    ? helpLevel === 0 ? "Vite — le temps se dissipe…" : "…"
    : hits > 0
    ? `${hits} / ${REQUIRED}`
    : "Trouve le vrai symbole parmi les illusions."

  const distort = trueDistortScale(hits)
  const baseMistOp = mistBaseOpacity(hits)

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: "100%" }}>

      {/* Label */}
      <p className="font-cinzel" style={{ color: "var(--gold-dark)", fontSize: "9px", letterSpacing: "4px", textTransform: "uppercase" }}>
        L&apos;Illusion des Abysses · 幻惑
      </p>

      {/* Clue — fades slightly at higher difficulty */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        opacity: helpLevel === 0 ? 1 : helpLevel === 1 ? 0.7 : 0.45,
        transition: "opacity 0.8s",
      }}>
        <span className="font-cinzel" style={{ fontSize: "9px", letterSpacing: "2px", color: "var(--muted)", textTransform: "uppercase" }}>
          {helpLevel < 2 ? "Cherche" : "…"}
        </span>
        <span style={{ fontFamily: "serif", fontSize: "28px", color: "var(--gold)", textShadow: "0 0 8px rgba(200,169,110,0.5)" }}>
          {TRUE_KANJI}
        </span>
        <span className="font-cinzel" style={{ fontSize: "9px", letterSpacing: "2px", color: "var(--muted)", textTransform: "uppercase" }}>
          {helpLevel < 2 ? "ignore les autres" : ""}
        </span>
      </div>

      {/* Stage */}
      <div style={{
        position: "relative", width: `${STAGE_W}px`, height: `${STAGE_H}px`,
        background: "radial-gradient(ellipse at 50% 40%, #0a0f1a 0%, var(--bg) 80%)",
        border: "1px solid rgba(200,169,110,0.07)", overflow: "hidden",
        cursor: "crosshair", maxWidth: "100%",
      }}>
        <Room />
        <Mist dense={mistDense} baseOpacity={baseMistOp} />

        {/* Screen flash */}
        <AnimatePresence>
          {screenFlash && (
            <motion.div style={{
              position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none",
              background: screenFlash === "correct" ? "rgba(200,169,110,1)" : "rgba(200,50,50,1)",
            }}
              initial={{ opacity: 0 }}
              animate={{ opacity: screenFlash === "correct" ? 0.10 : 0.20 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
            />
          )}
        </AnimatePresence>

        {/* Symbols */}
        {symbols.map(sym => (
          <div key={sym.id} style={{ position: "absolute", left: sym.x, top: sym.y, transform: "translate(-50%,-50%)" }}>
            <FloatSym
              data={sym}
              onClick={handleClick}
              disabled={disabled || solved}
              flash={flash?.id === sym.id ? flash.type : null}
              distort={distort}
            />
          </div>
        ))}

        {/* Solved overlay */}
        <AnimatePresence>
          {solved && (
            <motion.div style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
              background: "rgba(5,7,9,0.65)", zIndex: 20,
            }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}
            >
              <motion.span style={{
                fontFamily: "serif", fontSize: "64px", color: "var(--gold)",
                textShadow: "0 0 40px rgba(200,169,110,0.8)",
              }}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                {TRUE_KANJI}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {Array.from({ length: REQUIRED }).map((_, i) => (
          <div key={i} style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: i < hits ? "var(--gold)" : "rgba(255,255,255,0.10)",
            border: `1px solid ${i < hits ? "var(--gold)" : "rgba(255,255,255,0.15)"}`,
            boxShadow: i < hits ? "0 0 7px rgba(200,169,110,0.6)" : "none",
            transition: "all 0.3s",
          }} />
        ))}
      </div>

      {/* Inter-round timer bar */}
      <div style={{
        width: "200px", height: "3px",
        background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden",
        opacity: timerPct > 0 ? 1 : 0,
        transition: "opacity 0.3s",
      }}>
        <motion.div style={{
          height: "100%", borderRadius: "2px",
          background: timerWarn
            ? "linear-gradient(90deg, #c04040, #e06060)"
            : "linear-gradient(90deg, var(--gold-dark), var(--gold))",
        }}
          animate={{ width: `${Math.round(timerPct * 100)}%` }}
          transition={{ duration: 0.05 }}
        />
      </div>

      {/* Status */}
      <p className="font-cormorant" style={{
        color: solved               ? "var(--gold)"
          : screenFlash === "correct" ? "var(--gold)"
          : screenFlash === "wrong"   ? "#c04040"
          : timerWarn               ? "#e07050"
          : "var(--muted)",
        fontSize: "13px", fontStyle: "italic",
        textAlign: "center", minHeight: "20px",
        transition: "color 0.3s",
      }}>
        {statusMsg}
      </p>

      {/* Rules hint — fades as difficulty rises */}
      <p className="font-cinzel" style={{
        fontSize: "8px", letterSpacing: "2px",
        color: "var(--muted)",
        opacity: Math.max(0, 0.38 - hits * 0.06),
        textTransform: "uppercase", textAlign: "center",
        transition: "opacity 1s",
      }}>
        6 fois d&apos;affilée · toute erreur recommence depuis le début
      </p>
    </div>
  )
}
