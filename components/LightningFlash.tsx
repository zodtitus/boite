"use client"

import { useEffect, useState } from "react"

export type LightningType = 1 | 2 | 3 | 4 | 5

interface Props {
  type: LightningType
  mechIdx: number
}

const MECH_TARGET_Y = [54, 68, 82]
const DURATION = 500 // ms

// ── Manga-style impact starburst ────────────────────────────────────────────
function ImpactBurst({
  cx, cy, color, count = 10, minLen = 2.5, maxLen = 5,
}: { cx: number; cy: number; color: string; count?: number; minLen?: number; maxLen?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const deg = (360 / count) * i
        const rad = (deg * Math.PI) / 180
        const len = i % 2 === 0 ? maxLen : minLen
        return (
          <line key={i}
            x1={cx} y1={cy}
            x2={cx + Math.cos(rad) * len}
            y2={cy + Math.sin(rad) * len}
            stroke={color} strokeWidth="0.45" opacity="0.9"
          />
        )
      })}
      <circle cx={cx} cy={cy} r="0.9" fill="white" opacity="0.95" />
    </>
  )
}

// ── Bolt layer helper (black outline + color mid + white core) ───────────────
function MangaBolt({
  points, outlineW = 2.0, colorW = 0.85, coreW = 0.22,
  color, opacity = 1,
}: {
  points: string; outlineW?: number; colorW?: number; coreW?: number
  color: string; opacity?: number
}) {
  const shared = { fill: "none", strokeLinejoin: "miter" as const, strokeLinecap: "round" as const }
  return (
    <>
      <polyline points={points} stroke="#080810" strokeWidth={outlineW} {...shared} opacity={opacity} />
      <polyline points={points} stroke={color}   strokeWidth={colorW}   {...shared} opacity={opacity} />
      <polyline points={points} stroke="rgba(255,255,255,0.85)" strokeWidth={coreW} {...shared} opacity={opacity} />
    </>
  )
}

// ── Type 1 : 雷 Kaminari ────────────────────────────────────────────────────
// Classic manga thunder — sharp angular zigzag, electric yellow, starburst
function Kaminari({ ty }: { ty: number }) {
  const mx = 49
  const main = `${mx},0 ${mx-4},${ty*0.3} ${mx+7},${ty*0.3} ${mx-7},${ty*0.62} ${mx+5},${ty*0.62} ${mx-2},${ty}`
  const branch = `${mx+7},${ty*0.3} ${mx+20},${ty*0.5} ${mx+11},${ty*0.5} ${mx+22},${ty*0.68}`
  return (
    <g>
      <MangaBolt points={main}   color="#d4b800" outlineW={2.4} colorW={1.0} coreW={0.3} />
      <MangaBolt points={branch} color="#d4b800" outlineW={1.4} colorW={0.55} coreW={0.18} opacity={0.7} />
      {/* Small left twig */}
      <line x1={mx-7} y1={ty*0.62} x2={mx-18} y2={ty*0.8} stroke="#080810" strokeWidth="1.0" />
      <line x1={mx-7} y1={ty*0.62} x2={mx-18} y2={ty*0.8} stroke="#d4b800" strokeWidth="0.4" opacity="0.6" />
      <ImpactBurst cx={mx-2} cy={ty} color="#d4b800" count={12} minLen={2} maxLen={5.5} />
    </g>
  )
}

// ── Type 2 : 水電 Suiden ────────────────────────────────────────────────────
// Water discharge — angular S-curve, deep cyan, diamond impact
function Suiden({ ty }: { ty: number }) {
  const mx = 51
  // Angular S instead of smooth curve
  const pts = `${mx},0 ${mx-6},${ty*0.2} ${mx+8},${ty*0.38} ${mx-8},${ty*0.58} ${mx+5},${ty*0.78} ${mx},${ty}`
  return (
    <g>
      <MangaBolt points={pts} color="#0090b8" outlineW={2.2} colorW={0.9} coreW={0.28} />
      {/* Water-drop marks at kinks */}
      {[[mx-6,ty*0.2],[mx+8,ty*0.38],[mx-8,ty*0.58]].map(([x,y],i) => (
        <ellipse key={i}
          cx={x} cy={y} rx="0.55" ry="0.9"
          fill="#0090b8" stroke="#080810" strokeWidth="0.3"
          transform={`rotate(${i%2===0?-20:20}, ${x}, ${y})`}
          opacity="0.8"
        />
      ))}
      {/* Diamond impact */}
      <polygon points={`${mx},${ty-3.5} ${mx+3.5},${ty} ${mx},${ty+3.5} ${mx-3.5},${ty}`}
        fill="none" stroke="#080810" strokeWidth="0.7" />
      <polygon points={`${mx},${ty-3.5} ${mx+3.5},${ty} ${mx},${ty+3.5} ${mx-3.5},${ty}`}
        fill="none" stroke="#0090b8" strokeWidth="0.3" opacity="0.9" />
      <circle cx={mx} cy={ty} r="0.8" fill="white" />
    </g>
  )
}

// ── Type 3 : 霞電 Kasumiden ─────────────────────────────────────────────────
// Cursed web — crisp thin branches, dark violet, no blur, precise geometry
function Kasumiden({ ty }: { ty: number }) {
  const mx = 50
  const mid = ty * 0.46
  // Main stem
  const stem = `${mx},0 ${mx+2},${mid*0.45} ${mx-1},${mid} ${mx+1},${ty}`
  // Branch angles from midpoint
  const branches: [number,number,number,number][] = [
    [mx-1, mid,   mx-16, mid+ty*0.15],
    [mx-16,mid+ty*0.15, mx-26, mid+ty*0.26],
    [mx-16,mid+ty*0.15, mx-10, mid+ty*0.28],
    [mx-1, mid,   mx+15, mid+ty*0.13],
    [mx+15,mid+ty*0.13, mx+24, mid+ty*0.25],
    [mx+15,mid+ty*0.13, mx+8,  mid+ty*0.27],
    [mx-1, mid,   mx-4,  mid+ty*0.32],
    [mx-1, mid,   mx+5,  mid+ty*0.35],
    [mx+1, ty*0.82, mx-9, ty*0.93],
    [mx+1, ty*0.82, mx+11, ty*0.94],
  ]
  return (
    <g>
      {/* Stem */}
      <MangaBolt points={stem} color="#6028a8" outlineW={1.8} colorW={0.7} coreW={0.2} />
      {/* Web branches — outline + color only, no core for thin ones */}
      {branches.map(([x1,y1,x2,y2], i) => (
        <g key={i}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#080810" strokeWidth={i<4?0.9:0.55} />
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6028a8" strokeWidth={i<4?0.38:0.22} opacity="0.85" />
        </g>
      ))}
      {/* Node hexagons at intersections */}
      {[[mx-1,mid],[mx+1,ty*0.82]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="1.2" fill="#080810" stroke="#6028a8" strokeWidth="0.35" />
      ))}
      <circle cx={mx+1} cy={ty} r="1.0" fill="#6028a8" stroke="#080810" strokeWidth="0.4" opacity="0.8" />
    </g>
  )
}

// ── Type 4 : 月弧 Tsukiko ───────────────────────────────────────────────────
// Moon slash — crescent arc like a sword slash in anime, dark amber, speed lines
function Tsukiko({ ty }: { ty: number }) {
  const ox = 56
  // Control points for a tight crescent arc
  const arc = `M ${ox} ${ty*0.04} L ${ox+8} ${ty*0.18} L ${ox+16} ${ty*0.38} L ${ox+14} ${ty*0.58} L ${ox+6} ${ty*0.78} L ${ox-2} ${ty}`
  const echo = `M ${ox-6} ${ty*0.06} L ${ox+2} ${ty*0.2} L ${ox+10} ${ty*0.4} L ${ox+8} ${ty*0.6} L ${ox} ${ty*0.8} L ${ox-8} ${ty*0.97}`
  // Speed lines (horizontal slashes going left from the arc)
  const speeds: [number,number,number][] = [
    [ox-8, ty*0.25, 18],
    [ox-6, ty*0.38, 24],
    [ox-7, ty*0.52, 20],
    [ox-5, ty*0.65, 15],
  ]
  return (
    <g>
      {/* Speed lines */}
      {speeds.map(([x,y,len], i) => (
        <g key={i}>
          <line x1={x} y1={y} x2={x-len} y2={y} stroke="#080810" strokeWidth="0.7" />
          <line x1={x} y1={y} x2={x-len} y2={y} stroke="#b08800" strokeWidth="0.3" opacity="0.7" />
        </g>
      ))}
      {/* Echo arc (thinner, offset) */}
      <polyline points={echo} stroke="#080810" strokeWidth="0.9" fill="none" strokeLinejoin="miter" opacity="0.5" />
      <polyline points={echo} stroke="#b08800" strokeWidth="0.3" fill="none" opacity="0.4" />
      {/* Main arc */}
      <MangaBolt points={arc} color="#c09800" outlineW={2.2} colorW={0.9} coreW={0.26} />
      {/* Slash cross mark at tip */}
      <g transform={`translate(${ox-2}, ${ty})`}>
        <line x1="-2.5" y1="-2.5" x2="2.5" y2="2.5" stroke="#080810" strokeWidth="0.8" />
        <line x1="2.5"  y1="-2.5" x2="-2.5" y2="2.5" stroke="#080810" strokeWidth="0.8" />
        <line x1="-2.5" y1="-2.5" x2="2.5" y2="2.5" stroke="#c09800" strokeWidth="0.32" />
        <line x1="2.5"  y1="-2.5" x2="-2.5" y2="2.5" stroke="#c09800" strokeWidth="0.32" />
      </g>
      <text x={ox+18} y={ty*0.46} fontSize="4" fill="rgba(180,140,0,0.28)"
        fontFamily="serif" textAnchor="middle">月</text>
    </g>
  )
}

// ── Type 5 : 影電 Kageden ───────────────────────────────────────────────────
// Void energy — Jujutsu Kaisen style, near-black bolt, dark purple, curse marks
function Kageden({ ty }: { ty: number }) {
  const mx = 47
  const main = `${mx},0 ${mx+6},${ty*0.26} ${mx-4},${ty*0.26} ${mx+9},${ty*0.54} ${mx-5},${ty*0.54} ${mx+3},${ty*0.78} ${mx},${ty}`
  const echo = `${mx+9},0 ${mx+14},${ty*0.28} ${mx+5},${ty*0.28} ${mx+17},${ty*0.56} ${mx+7},${ty*0.56} ${mx+12},${ty}`
  // Floating curse-mark dots along bolt
  const dots: [number,number][] = [
    [mx+6, ty*0.26],
    [mx+9, ty*0.54],
    [mx+3, ty*0.78],
  ]
  return (
    <g>
      {/* Echo / shadow bolt */}
      <polyline points={echo} stroke="#0d0018" strokeWidth="1.5" fill="none" strokeLinejoin="miter" opacity="0.7" />
      <polyline points={echo} stroke="#500870" strokeWidth="0.5" fill="none" strokeLinejoin="miter" opacity="0.5" />
      {/* Main void bolt */}
      <MangaBolt points={main} color="#6010a0" outlineW={2.6} colorW={1.0} coreW={0.28} />
      {/* Curse marks (hollow circles floating along the bolt) */}
      {dots.map(([x,y],i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="1.5" fill="#0d0018" stroke="#6010a0" strokeWidth="0.45" opacity="0.9" />
          <circle cx={x} cy={y} r="0.55" fill="#9030c8" opacity="0.7" />
        </g>
      ))}
      {/* Dark void at impact */}
      <circle cx={mx} cy={ty} r="2.8" fill="#0d0018" stroke="#6010a0" strokeWidth="0.5" opacity="0.8" />
      <circle cx={mx} cy={ty} r="1.0" fill="#9030c8" opacity="0.9" />
      <text x={mx+7} y={ty*0.41} fontSize="3.8" fill="rgba(120,20,180,0.3)"
        fontFamily="serif" textAnchor="middle">影</text>
    </g>
  )
}

// ── Screen flash colors (very subtle, manga-dark) ───────────────────────────
const FLASH: Record<LightningType, string> = {
  1: "rgba(180,160,0,0.05)",    // Kaminari — barely-there yellow
  2: "rgba(0,90,130,0.05)",     // Suiden — dark blue
  3: "rgba(50,0,100,0.05)",     // Kasumiden — deep violet
  4: "rgba(140,100,0,0.04)",    // Tsukiko — amber
  5: "rgba(5,0,20,0.08)",       // Kageden — void dark
}

export default function LightningFlash({ type, mechIdx }: Props) {
  const [visible, setVisible] = useState(true)
  const ty = MECH_TARGET_Y[Math.min(mechIdx, 2)]

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), DURATION)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50 }}>
      {/* Minimal screen flash */}
      <div style={{
        position: "absolute", inset: 0,
        background: FLASH[type],
        animation: `lightningFlash ${DURATION}ms ease-out forwards`,
      }} />

      {/* SVG bolt */}
      <svg
        width="100%" height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute", inset: 0,
          animation: `lightningBolt ${DURATION}ms ease-out forwards`,
        }}
      >
        {type === 1 && <Kaminari  ty={ty} />}
        {type === 2 && <Suiden    ty={ty} />}
        {type === 3 && <Kasumiden ty={ty} />}
        {type === 4 && <Tsukiko   ty={ty} />}
        {type === 5 && <Kageden   ty={ty} />}
      </svg>
    </div>
  )
}
