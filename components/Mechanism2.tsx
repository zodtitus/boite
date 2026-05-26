"use client"

import { useState, useEffect } from "react"

const SIZE = 220
const CX = 110
const CY = 110

const RINGS = [
  { symbols: ["水", "火", "土", "風"], color: "#2a6090", lightColor: "#4a90c0", radius: 94, sw: 22 },
  { symbols: ["月", "雷", "岩", "空"], color: "#7c5cbf", lightColor: "#b09cdf", radius: 66, sw: 18 },
  { symbols: ["霧", "砂", "影", "光"], color: "#a07840", lightColor: "#c8a96e", radius: 39, sw: 16 },
]

// Non-overlapping donut hit areas — each covers a distinct annular zone
const HIT = [
  { inner: 72, outer: 108 }, // outer ring
  { inner: 46, outer: 72 },  // middle ring
  { inner: 0,  outer: 46 },  // inner ring (full circle)
]

// SVG donut path using two semi-arcs + fill-rule evenodd
function annulusPath(cx: number, cy: number, innerR: number, outerR: number): string {
  const lines = [
    `M ${cx} ${cy - outerR}`,
    `A ${outerR} ${outerR} 0 0 1 ${cx} ${cy + outerR}`,
    `A ${outerR} ${outerR} 0 0 1 ${cx} ${cy - outerR}`,
    `Z`,
  ]
  if (innerR > 0) {
    lines.push(
      `M ${cx} ${cy - innerR}`,
      `A ${innerR} ${innerR} 0 0 0 ${cx} ${cy + innerR}`,
      `A ${innerR} ${innerR} 0 0 0 ${cx} ${cy - innerR}`,
      `Z`,
    )
  }
  return lines.join(" ")
}

interface Mechanism2Props {
  onSolved: () => void
  disabled: boolean
}

export default function Mechanism2({ onSolved, disabled }: Mechanism2Props) {
  const [indices, setIndices] = useState([2, 3, 1])
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

  function getSymbolPos(radius: number, angleIdx: number) {
    const angle = (angleIdx * 90 - 90) * (Math.PI / 180)
    return { x: CX + radius * Math.cos(angle), y: CY + radius * Math.sin(angle) }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p
        className="font-cinzel text-center"
        style={{ color: "var(--gold-dark)", fontSize: "9px", letterSpacing: "4px", textTransform: "uppercase" }}
      >
        Anneaux Hōzuki
      </p>

      <div style={{ position: "relative", width: `${SIZE}px`, height: `${SIZE}px` }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {/* Alignment markers */}
          <line x1={CX - 14} y1={CY - 14} x2={CX + 14} y2={CY - 14}
            stroke="rgba(200,169,110,0.45)" strokeWidth="1" strokeDasharray="3 2" />
          <line x1={CX} y1={CY - 18} x2={CX} y2={CY - 108}
            stroke="rgba(200,169,110,0.1)" strokeWidth="0.8" strokeDasharray="2 4" />

          {/* Rings rendered outer→inner so inner appears on top visually */}
          {RINGS.map((ring, i) => {
            const isSolved = indices[i] === 0
            return (
              <g key={i}>
                {/* Visual ring track */}
                <circle cx={CX} cy={CY} r={ring.radius}
                  fill="none"
                  stroke={isSolved ? ring.lightColor : ring.color}
                  strokeWidth={ring.sw}
                  strokeOpacity={isSolved ? 0.38 : 0.16}
                  style={{ transition: "stroke-opacity 0.4s, stroke 0.4s" }}
                />

                {/* Glow when solved */}
                {isSolved && (
                  <circle cx={CX} cy={CY} r={ring.radius}
                    fill="none" stroke={ring.lightColor} strokeWidth="1.5" opacity="0.65"
                    style={{ animation: "goldPulse 2s ease-in-out infinite" }}
                  />
                )}

                {/* Symbols at cardinal positions */}
                {ring.symbols.map((sym, symIdx) => {
                  const rotatedIdx = (symIdx - indices[i] + 4) % 4
                  const pos = getSymbolPos(ring.radius, symIdx)
                  const isTop = rotatedIdx === 0
                  return (
                    <text key={symIdx}
                      x={pos.x} y={pos.y + 5}
                      textAnchor="middle"
                      fontSize={isTop ? 17 : 13}
                      fill={isTop ? ring.lightColor : ring.color}
                      opacity={isTop ? (isSolved ? 1 : 0.9) : 0.28}
                      fontFamily="var(--font-cinzel-var), serif"
                      style={{ pointerEvents: "none", transition: "opacity 0.3s, font-size 0.3s" }}
                    >
                      {sym}
                    </text>
                  )
                })}

                {/* ✅ Donut-shaped click area — no overlap between rings */}
                <path
                  d={annulusPath(CX, CY, HIT[i].inner, HIT[i].outer)}
                  fill="rgba(0,0,0,0.001)"
                  fillRule="evenodd"
                  stroke="none"
                  style={{ cursor: disabled || solved ? "default" : "pointer" }}
                  onClick={() => rotateRing(i)}
                />
              </g>
            )
          })}

          {/* Center dot */}
          <circle cx={CX} cy={CY} r={solved ? 11 : 6}
            fill={solved ? "#c8a96e" : "rgba(200,169,110,0.2)"}
            style={{ transition: "all 0.6s ease", pointerEvents: "none" }}
          />
          {solved && (
            <text x={CX} y={CY + 5} textAnchor="middle" fontSize="12" fill="#050709"
              fontFamily="serif" style={{ pointerEvents: "none" }}>
              ◈
            </text>
          )}

          {/* Ring labels */}
          <text x={CX + 98} y={CY - 2} fontSize="9" fill={indices[0] === 0 ? "#4a90c0" : "#2a6090"}
            fontFamily="var(--font-cinzel-var), serif" opacity="0.7" style={{ pointerEvents: "none" }}>外</text>
          <text x={CX + 70} y={CY - 2} fontSize="8" fill={indices[1] === 0 ? "#b09cdf" : "#7c5cbf"}
            fontFamily="var(--font-cinzel-var), serif" opacity="0.6" style={{ pointerEvents: "none" }}>中</text>
          <text x={CX + 43} y={CY - 2} fontSize="7" fill={indices[2] === 0 ? "#c8a96e" : "#a07840"}
            fontFamily="var(--font-cinzel-var), serif" opacity="0.6" style={{ pointerEvents: "none" }}>内</text>
        </svg>
      </div>

      <p style={{
        color: solved ? "var(--gold)" : "var(--muted)",
        fontSize: "12px", fontStyle: "italic",
        fontFamily: "var(--font-cormorant-var), Georgia, serif",
        transition: "color 0.5s",
      }}>
        {solved ? "水月霧 — Alignés" : "Cliquez les anneaux pour les faire tourner"}
      </p>
    </div>
  )
}
