"use client"

import { useState, useCallback, useRef, useEffect, useId } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAudio } from "@/lib/useAudio"

const TRUE_KANJI  = "月"
const ILLUSIONS   = ["目", "日", "白", "明", "用", "囚", "旧"]
const REQUIRED    = 3
const MAX_FAIL    = 4
const STAGE_W     = 440
const STAGE_H     = 270

// ── Symbol data ───────────────────────────────────────────────────────────────
interface SymData {
  id: number; kanji: string; isTrue: boolean
  x: number; y: number; vx: number; vy: number
  turbFreq: number; turbSeed: number; size: number
}

function genSymbols(n = 7): SymData[] {
  const trueIdx = Math.floor(Math.random() * n)
  const margin  = 50
  return Array.from({ length: n }, (_, i) => {
    const isTrue = i === trueIdx
    const angle  = Math.random() * Math.PI * 2
    const speed  = 0.3 + Math.random() * 0.6
    return {
      id: i, isTrue,
      kanji: isTrue ? TRUE_KANJI : ILLUSIONS[(i + Math.floor(Math.random() * ILLUSIONS.length)) % ILLUSIONS.length],
      x: margin + Math.random() * (STAGE_W - margin * 2),
      y: margin + Math.random() * (STAGE_H - margin * 2),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      turbFreq: Math.random(),
      turbSeed: Math.floor(Math.random() * 50) + 1,
      size: isTrue ? 50 : 40 + (Math.random() * 14 | 0),
    }
  })
}

// ── Floating symbol ───────────────────────────────────────────────────────────
function FloatSym({ data, onClick, disabled, flash }: {
  data: SymData; onClick: (id: number, isTrue: boolean) => void
  disabled: boolean; flash: "correct" | "wrong" | null
}) {
  const filterId = useId().replace(/:/g, "")
  const turbFreq  = data.isTrue ? 0.01 : 0.04 + data.turbFreq * 0.03
  const turbScale = data.isTrue ? 3    : 12 + data.turbFreq * 8
  const baseColor = data.isTrue ? "rgba(200,169,110,0.85)" : "rgba(106,96,80,0.55)"
  const fillColor = flash === "correct" ? "rgba(200,169,110,1)"
    : flash === "wrong" ? "rgba(200,60,60,0.9)" : baseColor
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
            strokeWidth={data.isTrue ? 1.5 : 0.8} opacity={flash ? 0.9 : data.isTrue ? 0.5 : 0.2} />
          <text x="30" y="42" textAnchor="middle" fontSize="34" fontFamily="serif" fill={fillColor}
            style={{
              filter: flash === "correct" ? "drop-shadow(0 0 6px rgba(200,169,110,0.9))"
                : flash === "wrong" ? "drop-shadow(0 0 8px rgba(200,60,60,0.8))"
                : data.isTrue ? "drop-shadow(0 0 3px rgba(200,169,110,0.3))" : "none",
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
function Mist({ dense }: { dense: boolean }) {
  const id = useId().replace(/:/g, "")
  return (
    <motion.div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      animate={{ opacity: dense ? 0.55 : 0.18 }}
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
      {[[0,0],[STAGE_W,0],[STAGE_W,STAGE_H],[0,STAGE_H]].map(([x,y],i)=>(
        <line key={i} x1={x} y1={y} x2={cx} y2={vpy}
          stroke="rgba(200,169,110,0.06)" strokeWidth="0.8" />
      ))}
      {[0.25,0.5,0.75].map((t,i)=>{
        const lx1=cx+(0-cx)*(1-t), lx2=cx+(STAGE_W-cx)*(1-t), ly=vpy+(STAGE_H-vpy)*t
        return <line key={i} x1={lx1} y1={ly} x2={lx2} y2={ly} stroke="rgba(200,169,110,0.04)" strokeWidth="0.5" />
      })}
      <rect width={STAGE_W} height={STAGE_H} fill="url(#vig)" />
      <motion.circle cx={cx} cy={vpy} r="2.5" fill="rgba(200,169,110,0.5)"
        animate={{ r:[1.5,4,1.5], opacity:[0.3,0.7,0.3] }}
        transition={{ duration:3, repeat:Infinity, ease:"easeInOut" }} />
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props { onSolved: () => void; disabled: boolean }

export default function Mechanism2({ onSolved, disabled }: Props) {
  const { play, resume } = useAudio()
  const mistTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const [symbols, setSymbols] = useState<SymData[]>(() => genSymbols())
  const [hits,    setHits]    = useState(0)
  const [fails,   setFails]   = useState(0)
  const [solved,  setSolved]  = useState(false)
  const [flash,   setFlash]   = useState<{ id: number; type: "correct"|"wrong" } | null>(null)
  const [screenFlash, setScreenFlash] = useState<"correct"|"wrong"|null>(null)
  const [mistDense, setMistDense]     = useState(false)

  // Mist cycle
  useEffect(() => {
    if (disabled || solved) return
    function cycle() {
      setMistDense(true)
      mistTimer.current = setTimeout(() => {
        setMistDense(false)
        mistTimer.current = setTimeout(cycle, 5000 + Math.random() * 7000)
      }, 2500 + Math.random() * 2000)
    }
    mistTimer.current = setTimeout(cycle, 3000)
    return () => clearTimeout(mistTimer.current)
  }, [disabled, solved])

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
          play("success"); setSolved(true)
          setTimeout(() => onSolved(), 1200)
        } else {
          setTimeout(() => setSymbols(genSymbols()), 500)
        }
        return next
      })
    } else {
      play("illusion")
      setFails(f => {
        const next = f + 1
        if (next >= MAX_FAIL) setTimeout(() => { setHits(0); setFails(0); setSymbols(genSymbols()) }, 800)
        return next
      })
    }
  }, [solved, disabled, play, resume, onSolved])

  const statusMsg = solved ? "L'illusion se dissipe. Tu perces les ténèbres."
    : screenFlash === "correct" ? "Juste — symbole reconnu."
    : screenFlash === "wrong"   ? "Illusion. Ton esprit est trompé."
    : hits > 0 ? `${hits} / ${REQUIRED} symboles identifiés`
    : "Trouve le vrai symbole parmi les illusions."

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: "100%" }}>
      {/* Label */}
      <p className="font-cinzel" style={{ color: "var(--gold-dark)", fontSize: "9px", letterSpacing: "4px", textTransform: "uppercase" }}>
        L&apos;Illusion des Abysses · 幻惑
      </p>

      {/* Clue */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span className="font-cinzel" style={{ fontSize: "9px", letterSpacing: "2px", color: "var(--muted)", textTransform: "uppercase" }}>Cherche</span>
        <span style={{ fontFamily: "serif", fontSize: "28px", color: "var(--gold)", textShadow: "0 0 8px rgba(200,169,110,0.5)" }}>{TRUE_KANJI}</span>
        <span className="font-cinzel" style={{ fontSize: "9px", letterSpacing: "2px", color: "var(--muted)", textTransform: "uppercase" }}>ignore les autres</span>
      </div>

      {/* Stage */}
      <div style={{
        position: "relative", width: `${STAGE_W}px`, height: `${STAGE_H}px`,
        background: "radial-gradient(ellipse at 50% 40%, #0a0f1a 0%, var(--bg) 80%)",
        border: "1px solid rgba(200,169,110,0.07)", overflow: "hidden",
        cursor: "crosshair", maxWidth: "100%",
      }}>
        <Room />
        <Mist dense={mistDense} />

        {/* Screen flash */}
        <AnimatePresence>
          {screenFlash && (
            <motion.div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none",
              background: screenFlash === "correct" ? "rgba(200,169,110,1)" : "rgba(200,50,50,1)" }}
              initial={{ opacity: 0 }} animate={{ opacity: screenFlash === "correct" ? 0.10 : 0.15 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.14 }} />
          )}
        </AnimatePresence>

        {/* Symbols */}
        {symbols.map(sym => (
          <div key={sym.id} style={{ position: "absolute", left: sym.x, top: sym.y, transform: "translate(-50%,-50%)" }}>
            <FloatSym data={sym} onClick={handleClick} disabled={disabled || solved}
              flash={flash?.id === sym.id ? flash.type : null} />
          </div>
        ))}

        {/* Solved overlay */}
        <AnimatePresence>
          {solved && (
            <motion.div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
              justifyContent: "center", background: "rgba(5,7,9,0.65)", zIndex: 20 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
              <motion.span style={{ fontFamily: "serif", fontSize: "64px", color: "var(--gold)",
                textShadow: "0 0 40px rgba(200,169,110,0.8)" }}
                initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.7, ease: [0.16,1,0.3,1] }}>
                {TRUE_KANJI}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {Array.from({ length: REQUIRED }).map((_, i) => (
          <div key={i} style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: i < hits ? "var(--gold)" : "rgba(255,255,255,0.1)",
            border: `1px solid ${i < hits ? "var(--gold)" : "rgba(255,255,255,0.15)"}`,
            boxShadow: i < hits ? "0 0 6px rgba(200,169,110,0.6)" : "none", transition: "all 0.3s",
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

      {/* Status */}
      <p className="font-cormorant" style={{
        color: solved ? "var(--gold)" : screenFlash === "correct" ? "var(--gold)" : screenFlash === "wrong" ? "#c04040" : "var(--muted)",
        fontSize: "13px", fontStyle: "italic", textAlign: "center", minHeight: "20px",
        transition: "color 0.3s",
      }}>
        {statusMsg}
      </p>
    </div>
  )
}
