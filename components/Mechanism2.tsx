"use client"

import { useState, useEffect } from "react"

// 3 rings, each with 4 symbols. Click ring to rotate.
// Target: ring 0 shows index 0 (水), ring 1 shows index 0 (月), ring 2 shows index 0 (霧)
const RINGS = [
  { symbols: ["水", "火", "土", "風"], color: "#2a6090", lightColor: "#4a90c0", radius: 68 },
  { symbols: ["月", "雷", "岩", "空"], color: "#7c5cbf", lightColor: "#b09cdf", radius: 48 },
  { symbols: ["霧", "砂", "影", "光"], color: "#a07840", lightColor: "#c8a96e", radius: 28 },
]

interface Mechanism2Props {
  onSolved: () => void
  disabled: boolean
}

export default function Mechanism2({ onSolved, disabled }: Mechanism2Props) {
  // selectedIndex for each ring (which symbol is at top)
  const [indices, setIndices] = useState([2, 3, 1]) // start misaligned
  const [solved, setSolved] = useState(false)

  useEffect(() => {
    if (indices.every((idx) => idx === 0) && !solved) {
      setSolved(true)
      setTimeout(() => onSolved(), 700)
    }
  }, [indices, solved, onSolved])

  function rotateRing(ringIdx: number) {
    if (disabled || solved) return
    setIndices((prev) => {
      const next = [...prev]
      next[ringIdx] = (next[ringIdx] + 1) % 4
      return next
    })
  }

  const size = 160
  const cx = 80
  const cy = 80

  // Compute symbol positions on each ring (top = selected, then 90° steps)
  function getSymbolPos(radius: number, angleIdx: number) {
    const angle = (angleIdx * 90 - 90) * (Math.PI / 180)
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
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
        Anneaux Hōzuki
      </p>

      <div style={{ position: "relative", width: `${size}px`, height: `${size}px` }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            {RINGS.map((r, i) => (
              <radialGradient key={i} id={`ringGrad${i}`} cx="50%" cy="50%" r="50%">
                <stop offset="70%" stopColor={r.color} stopOpacity="0.08" />
                <stop offset="100%" stopColor={r.color} stopOpacity="0.25" />
              </radialGradient>
            ))}
          </defs>

          {/* Target indicator — top line */}
          <line
            x1={cx - 10}
            y1={cy - 10}
            x2={cx + 10}
            y2={cy - 10}
            stroke="rgba(200,169,110,0.4)"
            strokeWidth="1"
            strokeDasharray="3 2"
          />

          {/* Rings (outermost first) */}
          {[...RINGS].reverse().map((ring, revIdx) => {
            const i = RINGS.length - 1 - revIdx
            const isSolved = indices[i] === 0
            return (
              <g key={i}>
                {/* Ring track */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={ring.radius}
                  fill="none"
                  stroke={isSolved ? ring.lightColor : ring.color}
                  strokeWidth={i === 0 ? 18 : i === 1 ? 16 : 14}
                  strokeOpacity={isSolved ? 0.35 : 0.15}
                  style={{ transition: "stroke-opacity 0.4s, stroke 0.4s", cursor: disabled || solved ? "default" : "pointer" }}
                  onClick={() => rotateRing(i)}
                />

                {/* Clickable ring overlay */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={ring.radius}
                  fill="transparent"
                  stroke="transparent"
                  strokeWidth={i === 0 ? 24 : i === 1 ? 22 : 20}
                  style={{ cursor: disabled || solved ? "default" : "pointer" }}
                  onClick={() => rotateRing(i)}
                />

                {/* Symbols on ring */}
                {ring.symbols.map((sym, symIdx) => {
                  const rotatedIdx = (symIdx - indices[i] + 4) % 4
                  const pos = getSymbolPos(ring.radius, symIdx)
                  const isTop = rotatedIdx === 0
                  return (
                    <text
                      key={symIdx}
                      x={pos.x}
                      y={pos.y + 5}
                      textAnchor="middle"
                      fontSize={isTop ? 14 : 11}
                      fill={isTop && isSolved ? ring.lightColor : isTop ? ring.lightColor : ring.color}
                      opacity={isTop ? (isSolved ? 1 : 0.85) : 0.35}
                      fontFamily="var(--font-cinzel-var), serif"
                      style={{
                        pointerEvents: "none",
                        transition: "opacity 0.3s, font-size 0.3s",
                      }}
                    >
                      {sym}
                    </text>
                  )
                })}

                {/* Solved glow ring */}
                {isSolved && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={ring.radius}
                    fill="none"
                    stroke={ring.lightColor}
                    strokeWidth="1.5"
                    opacity="0.6"
                    style={{ animation: "goldPulse 2s ease-in-out infinite" }}
                  />
                )}
              </g>
            )
          })}

          {/* Center dot */}
          <circle
            cx={cx}
            cy={cy}
            r={solved ? 8 : 5}
            fill={solved ? "#c8a96e" : "rgba(200,169,110,0.2)"}
            style={{ transition: "all 0.6s ease" }}
          />
          {solved && (
            <text x={cx} y={cy + 5} textAnchor="middle" fontSize="10" fill="#050709" fontFamily="serif">
              ◈
            </text>
          )}

          {/* Alignment indicator at top */}
          <line
            x1={cx}
            y1={cy - 14}
            x2={cx}
            y2={cy - 80}
            stroke="rgba(200,169,110,0.12)"
            strokeWidth="0.8"
            strokeDasharray="2 4"
          />
        </svg>

        {/* Ring click labels */}
        {RINGS.map((ring, i) => (
          <div
            key={i}
            className="absolute font-cinzel"
            style={{
              bottom: `${4 + i * 3}px`,
              right: `${2 + i * 2}px`,
              fontSize: "7px",
              color: indices[i] === 0 ? ring.lightColor : ring.color,
              letterSpacing: "1px",
              pointerEvents: "none",
              opacity: 0.7,
            }}
          >
            {i === 0 ? "外" : i === 1 ? "中" : "内"}
          </div>
        ))}
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
        {solved ? "水月霧 — Alignés" : "Cliquez les anneaux pour les faire tourner"}
      </p>
    </div>
  )
}
