"use client"

import { useState, useEffect, useRef } from "react"

const CORRECT_ORDER = [0, 2, 4, 1, 3]
const SIZE = 220
const CX = 110
const CY = 110
const RADIUS = 74
const ORB = 50   // orb diameter
const ORB_R = ORB / 2

function getPentagonPos(idx: number) {
  const angle = (idx * 72 - 90) * (Math.PI / 180)
  return { x: CX + RADIUS * Math.cos(angle), y: CY + RADIUS * Math.sin(angle) }
}

interface Mechanism3Props {
  onSolved: () => void
  disabled: boolean
}

export default function Mechanism3({ onSolved, disabled }: Mechanism3Props) {
  const [pressed, setPressed] = useState<number[]>([])
  const [solved, setSolved] = useState(false)
  const [error, setError] = useState(false)
  const [hintStep, setHintStep] = useState(0)
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (solved) return
    hintTimerRef.current = setTimeout(() => setHintStep((s) => (s + 1) % 5), 1200)
    return () => { if (hintTimerRef.current) clearTimeout(hintTimerRef.current) }
  }, [hintStep, solved])

  function pressOrb(posIdx: number) {
    if (disabled || solved || error) return
    if (posIdx === CORRECT_ORDER[pressed.length]) {
      const next = [...pressed, posIdx]
      setPressed(next)
      if (next.length === 5) {
        setSolved(true)
        setTimeout(() => onSolved(), 800)
      }
    } else {
      setError(true)
      setTimeout(() => { setError(false); setPressed([]) }, 600)
    }
  }

  const orbPositions = Array.from({ length: 5 }, (_, i) => getPentagonPos(i))

  function orbState(i: number): "done" | "hint" | "idle" {
    if (pressed.includes(i)) return "done"
    if (CORRECT_ORDER[hintStep] === i && pressed.length === 0) return "hint"
    return "idle"
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p
        className="font-cinzel text-center"
        style={{ color: "var(--gold-dark)", fontSize: "9px", letterSpacing: "4px", textTransform: "uppercase" }}
      >
        Les Cinq Points
      </p>

      <div style={{ position: "relative", width: `${SIZE}px`, height: `${SIZE}px` }}>
        {/* SVG background — pentagon + connection lines */}
        <svg
          width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <polygon
            points={orbPositions.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke={solved ? "rgba(200,169,110,0.4)" : "rgba(200,169,110,0.12)"}
            strokeWidth="1"
            style={{ transition: "stroke 0.6s" }}
          />
          {pressed.length >= 2 &&
            pressed.slice(0, -1).map((from, i) => {
              const pFrom = orbPositions[from]
              const pTo = orbPositions[pressed[i + 1]]
              return (
                <line key={i}
                  x1={pFrom.x} y1={pFrom.y} x2={pTo.x} y2={pTo.y}
                  stroke="rgba(200,169,110,0.35)" strokeWidth="1" strokeDasharray="3 2"
                />
              )
            })}
          <text x={CX} y={CY + 7} textAnchor="middle" fontSize="20"
            fill={solved ? "#c8a96e" : "rgba(200,169,110,0.15)"}
            fontFamily="var(--font-cinzel-var), serif"
            style={{ transition: "fill 0.6s" }}>
            {solved ? "五" : "◎"}
          </text>
        </svg>

        {/* 5 orb buttons */}
        {orbPositions.map((pos, i) => {
          const state = error ? "error" : orbState(i)
          const isDone = state === "done"
          const isHint = state === "hint"
          const isError = state === "error"

          return (
            <button
              key={i}
              onClick={() => pressOrb(i)}
              disabled={disabled || solved}
              className="orb-btn absolute"
              style={{
                left: `${pos.x - ORB_R}px`,
                top: `${pos.y - ORB_R}px`,
                width: `${ORB}px`,
                height: `${ORB}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderColor: isDone ? "var(--gold)" :
                             isHint ? "rgba(200,169,110,0.6)" :
                             isError ? "#c04040" : undefined,
                background: isDone ? "rgba(200,169,110,0.18)" :
                            isHint ? "rgba(200,169,110,0.07)" :
                            isError ? "rgba(192,64,64,0.15)" : undefined,
                boxShadow: isDone ? "0 0 18px rgba(200,169,110,0.55)" :
                           isHint ? "0 0 10px rgba(200,169,110,0.25)" :
                           isError ? "0 0 12px rgba(192,64,64,0.45)" : undefined,
                animation: isDone ? "goldGlow 2s ease-in-out infinite" :
                           isHint ? "orbIdle 1.2s ease-in-out" : "none",
                transition: "all 0.3s ease",
                cursor: disabled || solved ? "default" : "pointer",
              }}
            >
              <span style={{
                fontFamily: "var(--font-cinzel-var), serif",
                fontSize: "13px",
                color: isDone ? "var(--gold)" :
                       isError ? "#e87070" : "rgba(200,169,110,0.3)",
                transition: "color 0.3s",
                pointerEvents: "none",
                userSelect: "none",
              }}>
                {solved ? CORRECT_ORDER.indexOf(i) + 1 : "•"}
              </span>
            </button>
          )
        })}
      </div>

      <p style={{
        color: solved ? "var(--gold)" : error ? "#e87070" : "var(--muted)",
        fontSize: "12px", fontStyle: "italic",
        fontFamily: "var(--font-cormorant-var), Georgia, serif",
        transition: "color 0.3s",
      }}>
        {solved ? "五点 — Activés" : error ? "Séquence incorrecte…" : "Activez les cinq points dans l'ordre"}
      </p>
    </div>
  )
}
