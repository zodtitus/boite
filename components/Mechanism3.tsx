"use client"

import { useState, useEffect, useRef } from "react"

// Pentagon layout (indices): 0=top, 1=upper-right, 2=lower-right, 3=lower-left, 4=upper-left
// Correct press order: position 0, 2, 4, 1, 3 → orbs labeled 1,3,5,2,4
const CORRECT_ORDER = [0, 2, 4, 1, 3]

function getPentagonPos(idx: number, radius: number, cx: number, cy: number) {
  const angle = (idx * 72 - 90) * (Math.PI / 180)
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  }
}

interface Mechanism3Props {
  onSolved: () => void
  disabled: boolean
}

export default function Mechanism3({ onSolved, disabled }: Mechanism3Props) {
  const [pressed, setPressed] = useState<number[]>([]) // positions pressed in order
  const [solved, setSolved] = useState(false)
  const [error, setError] = useState(false)
  const [hintStep, setHintStep] = useState(0) // which orb is pulsing as hint
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cycle hint pulse through correct order
  useEffect(() => {
    if (solved) return
    hintTimerRef.current = setTimeout(() => {
      setHintStep((s) => (s + 1) % 5)
    }, 1200)
    return () => { if (hintTimerRef.current) clearTimeout(hintTimerRef.current) }
  }, [hintStep, solved])

  function pressOrb(posIdx: number) {
    if (disabled || solved || error) return
    const nextExpected = CORRECT_ORDER[pressed.length]
    if (posIdx === nextExpected) {
      const newPressed = [...pressed, posIdx]
      setPressed(newPressed)
      if (newPressed.length === 5) {
        setSolved(true)
        setTimeout(() => onSolved(), 800)
      }
    } else {
      // Wrong order — flash error then reset
      setError(true)
      setTimeout(() => {
        setError(false)
        setPressed([])
      }, 600)
    }
  }

  const cx = 80
  const cy = 80
  const radius = 54

  const orbPositions = Array.from({ length: 5 }, (_, i) => getPentagonPos(i, radius, cx, cy))

  function orbState(posIdx: number): "done" | "active" | "hint" | "idle" {
    if (pressed.includes(posIdx)) return "done"
    if (pressed.length < 5 && CORRECT_ORDER[pressed.length] === posIdx && !error) return "active"
    if (CORRECT_ORDER[hintStep] === posIdx && pressed.length === 0) return "hint"
    return "idle"
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p
        className="font-cinzel text-center"
        style={{
          color: "var(--gold-dark)",
          fontSize: "9px",
          letterSpacing: "4px",
          textTransform: "uppercase",
        }}
      >
        Les Cinq Points
      </p>

      <div style={{ position: "relative", width: "160px", height: "160px" }}>
        <svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          {/* Pentagon outline */}
          <polygon
            points={orbPositions.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke={solved ? "rgba(200,169,110,0.4)" : "rgba(200,169,110,0.12)"}
            strokeWidth="1"
            style={{ transition: "stroke 0.6s" }}
          />

          {/* Connection lines when orbs pressed in order */}
          {pressed.length >= 2 &&
            pressed.slice(0, -1).map((from, i) => {
              const to = pressed[i + 1]
              const pFrom = orbPositions[from]
              const pTo = orbPositions[to]
              return (
                <line
                  key={i}
                  x1={pFrom.x}
                  y1={pFrom.y}
                  x2={pTo.x}
                  y2={pTo.y}
                  stroke="rgba(200,169,110,0.35)"
                  strokeWidth="0.8"
                  strokeDasharray="3 2"
                />
              )
            })}

          {/* Center symbol */}
          <text
            x={cx}
            y={cy + 6}
            textAnchor="middle"
            fontSize="16"
            fill={solved ? "#c8a96e" : "rgba(200,169,110,0.15)"}
            fontFamily="var(--font-cinzel-var), serif"
            style={{ transition: "fill 0.6s" }}
          >
            {solved ? "五" : "◎"}
          </text>
        </svg>

        {/* 5 orb buttons */}
        {orbPositions.map((pos, i) => {
          const state = error ? "error" : orbState(i)
          return (
            <button
              key={i}
              onClick={() => pressOrb(i)}
              disabled={disabled || solved}
              className={`orb-btn absolute ${
                state === "done" ? "orb-done" :
                state === "active" ? "" :
                state === "error" ? "orb-error" : ""
              }`}
              style={{
                left: `${pos.x - 18}px`,
                top: `${pos.y - 18}px`,
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: state === "hint"
                  ? "orbIdle 1.2s ease-in-out"
                  : state === "done"
                  ? "goldGlow 2s ease-in-out infinite"
                  : "none",
                borderColor: state === "done" ? "var(--gold)" :
                             state === "active" ? "rgba(42,96,144,0.7)" :
                             state === "error" ? "#c04040" : undefined,
                background: state === "done" ? "rgba(200,169,110,0.18)" :
                            state === "active" ? "rgba(42,96,144,0.12)" :
                            state === "error" ? "rgba(192,64,64,0.15)" : undefined,
                boxShadow: state === "done" ? "0 0 14px rgba(200,169,110,0.5)" :
                           state === "active" ? "0 0 10px rgba(42,96,144,0.4)" :
                           state === "error" ? "0 0 10px rgba(192,64,64,0.4)" : undefined,
                transition: "all 0.3s ease",
                cursor: disabled || solved ? "default" : "pointer",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-cinzel-var), serif",
                  fontSize: "10px",
                  color: state === "done" ? "var(--gold)" :
                         state === "active" ? "#4a90c0" :
                         state === "error" ? "#e87070" : "rgba(200,169,110,0.3)",
                  transition: "color 0.3s",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                {/* Show order number only when solved */}
                {solved ? CORRECT_ORDER.indexOf(i) + 1 : "•"}
              </span>
            </button>
          )
        })}
      </div>

      <p
        style={{
          color: solved ? "var(--gold)" : error ? "#e87070" : "var(--muted)",
          fontSize: "11px",
          fontStyle: "italic",
          fontFamily: "var(--font-cormorant-var), Georgia, serif",
          transition: "color 0.3s",
        }}
      >
        {solved
          ? "五点 — Activés"
          : error
          ? "Séquence incorrecte…"
          : "Activez les cinq points dans l'ordre"}
      </p>
    </div>
  )
}
