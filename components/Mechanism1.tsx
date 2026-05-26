"use client"

import { useState, useEffect } from "react"

// 4 quadrant segments, each rotatable by clicking (cycles 0→90→180→270°)
// Target rotation for each: 0, 270, 90, 180 (forms 水 when combined)
const TARGETS = [0, 270, 90, 180]

// SVG path data for each quarter of 水 (simplified stroke representation)
const QUAD_PATHS = [
  // Top-left: top stroke going down-left
  "M 40 40 L 40 10 M 40 25 L 15 40 M 15 40 L 8 55",
  // Top-right: top stroke going down-right
  "M 10 40 L 10 10 M 10 25 L 35 40 M 35 40 L 42 55",
  // Bottom-left: left flowing stroke
  "M 40 10 Q 20 30 10 55 M 25 30 L 15 50",
  // Bottom-right: right flowing stroke
  "M 10 10 Q 30 30 40 55 M 25 30 L 35 50",
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

  const quadLabels = ["水", "月", "霧", "◇"]
  const quadPositions = [
    { x: 0, y: 0 },   // TL
    { x: 1, y: 0 },   // TR
    { x: 0, y: 1 },   // BL
    { x: 1, y: 1 },   // BR
  ]

  const goldColor = "#c8a96e"
  const waterBlue = "#2a6090"

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
        Sceau de l&apos;Eau
      </p>

      {/* 4 rotating quadrants */}
      <div
        className="relative"
        style={{
          width: "160px",
          height: "160px",
          border: `1px solid ${solved ? goldColor : "rgba(200,169,110,0.2)"}`,
          borderRadius: "50%",
          boxShadow: solved ? `0 0 24px rgba(200,169,110,0.4)` : "none",
          transition: "box-shadow 0.8s ease, border-color 0.6s ease",
        }}
      >
        {/* Center kanji — visible when solved */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            fontFamily: "var(--font-cinzel-var), Cinzel, serif",
            fontSize: "36px",
            color: goldColor,
            opacity: solved ? 0.9 : 0.08,
            transition: "opacity 0.8s ease",
            zIndex: 2,
            textShadow: solved ? `0 0 20px rgba(200,169,110,0.8)` : "none",
          }}
        >
          水
        </div>

        {/* Divider cross */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <svg width="160" height="160" viewBox="0 0 160 160">
            <line x1="80" y1="8" x2="80" y2="152" stroke="rgba(200,169,110,0.15)" strokeWidth="1" />
            <line x1="8" y1="80" x2="152" y2="80" stroke="rgba(200,169,110,0.15)" strokeWidth="1" />
            <circle cx="80" cy="80" r="4" fill={solved ? goldColor : "rgba(200,169,110,0.2)"} />
          </svg>
        </div>

        {/* 4 quadrant buttons */}
        {quadPositions.map((pos, i) => {
          const isCorrect = rotations[i] === TARGETS[i]
          return (
            <button
              key={i}
              onClick={() => rotate(i)}
              disabled={disabled || solved}
              style={{
                position: "absolute",
                left: pos.x === 0 ? "4px" : "82px",
                top: pos.y === 0 ? "4px" : "82px",
                width: "74px",
                height: "74px",
                border: "none",
                background: "transparent",
                cursor: disabled || solved ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: pos.x === 0 && pos.y === 0 ? "50% 0 0 0" :
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                }}
              >
                <svg width="54" height="54" viewBox="0 0 54 54">
                  {/* Stroke fragment */}
                  <path
                    d={QUAD_PATHS[i]}
                    stroke={isCorrect ? goldColor : waterBlue}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    opacity={isCorrect ? 0.9 : 0.5}
                    style={{ transition: "stroke 0.4s, opacity 0.4s" }}
                  />
                  {/* Small rotation indicator dot */}
                  <circle
                    cx="8"
                    cy="8"
                    r="3"
                    fill={isCorrect ? goldColor : "rgba(200,169,110,0.25)"}
                    style={{ transition: "fill 0.4s" }}
                  />
                </svg>
              </div>
            </button>
          )
        })}

        {/* Success pulse ring */}
        {(solved || justSolved) && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              border: `2px solid ${goldColor}`,
              animation: "goldPulse 2s ease-in-out infinite",
            }}
          />
        )}
      </div>

      <p
        style={{
          color: solved ? "var(--gold)" : "var(--muted)",
          fontSize: "11px",
          fontStyle: "italic",
          fontFamily: "var(--font-cormorant-var), Georgia, serif",
          transition: "color 0.5s",
        }}
      >
        {solved ? "水 — Aligné" : "Alignez les quatre fragments"}
      </p>
    </div>
  )
}
