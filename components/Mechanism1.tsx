"use client"

import { useState, useEffect } from "react"

const TARGETS = [0, 270, 90, 180]
const SIZE = 220

const QUAD_PATHS = [
  "M 40 40 L 40 10 M 40 25 L 15 40 M 15 40 L 8 55",
  "M 10 40 L 10 10 M 10 25 L 35 40 M 35 40 L 42 55",
  "M 40 10 Q 20 30 10 55 M 25 30 L 15 50",
  "M 10 10 Q 30 30 40 55 M 25 30 L 35 50",
]

const quadPositions = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
]

interface Mechanism1Props {
  onSolved: () => void
  disabled: boolean
}

export default function Mechanism1({ onSolved, disabled }: Mechanism1Props) {
  const [rotations, setRotations] = useState([0, 0, 0, 0])
  const [solved, setSolved] = useState(false)
  const [justSolved, setJustSolved] = useState(false)

  useEffect(() => {
    const isSolved = rotations.every((r, i) => r === TARGETS[i])
    if (isSolved && !solved) {
      setSolved(true)
      setJustSolved(true)
      setTimeout(() => setJustSolved(false), 800)
      setTimeout(() => onSolved(), 600)
    }
  }, [rotations, solved, onSolved])

  function rotate(idx: number) {
    if (disabled || solved) return
    setRotations((prev) => {
      const next = [...prev]
      next[idx] = (next[idx] + 90) % 360
      return next
    })
  }

  const goldColor = "#c8a96e"
  const waterBlue = "#2a6090"
  // Scaled from 160→220: factor 1.375
  const half = SIZE / 2      // 110
  const pad = 6              // edge padding (was 4)
  const btnSize = 102        // quadrant button size (was 74)
  const gap = half           // second column/row offset = 110 (was 82)

  return (
    <div className="flex flex-col items-center gap-4">
      <p
        className="font-cinzel text-center"
        style={{ color: "var(--gold-dark)", fontSize: "9px", letterSpacing: "4px", textTransform: "uppercase" }}
      >
        Sceau de l&apos;Eau
      </p>

      <div
        className="relative"
        style={{
          width: `${SIZE}px`,
          height: `${SIZE}px`,
          border: `1px solid ${solved ? goldColor : "rgba(200,169,110,0.2)"}`,
          borderRadius: "50%",
          boxShadow: solved ? `0 0 28px rgba(200,169,110,0.45)` : "none",
          transition: "box-shadow 0.8s ease, border-color 0.6s ease",
        }}
      >
        {/* Center kanji */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            fontFamily: "var(--font-cinzel-var), serif",
            fontSize: "52px",
            color: goldColor,
            opacity: solved ? 0.9 : 0.08,
            transition: "opacity 0.8s ease",
            zIndex: 2,
            textShadow: solved ? `0 0 24px rgba(200,169,110,0.85)` : "none",
          }}
        >
          水
        </div>

        {/* Cross divider */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <line x1={half} y1="11" x2={half} y2={SIZE - 11} stroke="rgba(200,169,110,0.15)" strokeWidth="1" />
            <line x1="11" y1={half} x2={SIZE - 11} y2={half} stroke="rgba(200,169,110,0.15)" strokeWidth="1" />
            <circle cx={half} cy={half} r="5" fill={solved ? goldColor : "rgba(200,169,110,0.2)"} />
          </svg>
        </div>

        {/* 4 quadrant buttons */}
        {quadPositions.map((pos, i) => {
          return (
            <button
              key={i}
              onClick={() => rotate(i)}
              disabled={disabled || solved}
              style={{
                position: "absolute",
                left: pos.x === 0 ? `${pad}px` : `${gap}px`,
                top: pos.y === 0 ? `${pad}px` : `${gap}px`,
                width: `${btnSize}px`,
                height: `${btnSize}px`,
                border: "none",
                background: "transparent",
                cursor: disabled || solved ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius:
                  pos.x === 0 && pos.y === 0 ? "50% 0 0 0" :
                  pos.x === 1 && pos.y === 0 ? "0 50% 0 0" :
                  pos.x === 0 && pos.y === 1 ? "0 0 0 50%" : "0 0 50% 0",
                zIndex: 3,
                transition: "background 0.3s",
              }}
              onMouseEnter={(e) => {
                if (!disabled && !solved)
                  (e.currentTarget as HTMLElement).style.background = "rgba(200,169,110,0.06)"
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent"
              }}
            >
              <div
                style={{
                  transform: `rotate(${rotations[i]}deg)`,
                  transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="64" height="64" viewBox="0 0 54 54">
                  <path
                    d={QUAD_PATHS[i]}
                    stroke={solved ? goldColor : waterBlue}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    opacity={0.5}
                    style={{ transition: "stroke 0.4s" }}
                  />
                  <circle cx="8" cy="8" r="3.5"
                    fill="rgba(200,169,110,0.25)"
                    style={{ transition: "fill 0.4s" }}
                  />
                </svg>
              </div>
            </button>
          )
        })}

        {/* Success pulse */}
        {(solved || justSolved) && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ border: `2px solid ${goldColor}`, animation: "goldPulse 2s ease-in-out infinite" }}
          />
        )}
      </div>

      <p style={{
        color: solved ? "var(--gold)" : "var(--muted)",
        fontSize: "12px", fontStyle: "italic",
        fontFamily: "var(--font-cormorant-var), Georgia, serif",
        transition: "color 0.5s",
      }}>
        {solved ? "水 — Aligné" : "Cliquez chaque quadrant pour le faire pivoter"}
      </p>
    </div>
  )
}
