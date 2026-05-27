"use client"

import { useEffect, useState } from "react"

export type LightningType = 1 | 2 | 3 | 4 | 5

interface Props {
  type: LightningType
  mechIdx: number   // 0 = mech1 active, 1 = mech2 active, 2 = mech3 active
}

// Approximate vertical strike target per mechanism (% of viewport height, in SVG 0–100 coords)
// Accounts for header (~180px) + box (~200px) + each mechanism card
const MECH_TARGET_Y = [54, 68, 82]

// ─── 5 lightning designs, all in SVG viewBox 0 0 100 100 ───────────────────

function Kaminari({ ty }: { ty: number }) {
  // 雷 — sharp white fork, classic
  const mx = 49
  return (
    <g>
      <defs>
        <filter id="lf-kaminari" x="-80%" y="-20%" width="260%" height="140%">
          <feGaussianBlur stdDeviation="0.6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Main bolt */}
      <polyline
        points={`${mx},0 ${mx-3},${ty*0.32} ${mx+4},${ty*0.32} ${mx-5},${ty*0.6} ${mx+3},${ty*0.6} ${mx-2},${ty}`}
        stroke="white" strokeWidth="0.7" fill="none" strokeLinejoin="round"
        filter="url(#lf-kaminari)"
      />
      {/* Bright core */}
      <polyline
        points={`${mx},0 ${mx-3},${ty*0.32} ${mx+4},${ty*0.32} ${mx-5},${ty*0.6} ${mx+3},${ty*0.6} ${mx-2},${ty}`}
        stroke="rgba(200,230,255,0.9)" strokeWidth="0.25" fill="none" strokeLinejoin="round"
      />
      {/* Right branch */}
      <polyline
        points={`${mx+4},${ty*0.32} ${mx+12},${ty*0.52} ${mx+7},${ty*0.52} ${mx+15},${ty*0.72}`}
        stroke="white" strokeWidth="0.45" fill="none" strokeLinejoin="round" opacity="0.65"
      />
      {/* Left twig */}
      <line x1={mx-5} y1={ty*0.6} x2={mx-14} y2={ty*0.78}
        stroke="white" strokeWidth="0.3" opacity="0.45" />
      {/* Impact glow */}
      <circle cx={mx-2} cy={ty} r="1.8" fill="rgba(180,220,255,0.9)"
        style={{ animation: "lightningImpact 0.65s ease-out forwards" }} />
      <circle cx={mx-2} cy={ty} r="4" fill="none" stroke="rgba(180,220,255,0.4)" strokeWidth="0.6"
        style={{ animation: "lightningImpact 0.65s ease-out forwards" }} />
    </g>
  )
}

function Suiden({ ty }: { ty: number }) {
  // 水電 — blue water lightning, flowing S-curve
  const mx = 51
  const c1x = mx - 8, c2x = mx + 9
  const path = `M ${mx} 0 C ${c1x} ${ty*0.22} ${c2x} ${ty*0.4} ${mx-4} ${ty*0.58} C ${c1x-4} ${ty*0.74} ${c2x-2} ${ty*0.88} ${mx} ${ty}`
  return (
    <g>
      <defs>
        <filter id="lf-suiden" x="-100%" y="-10%" width="300%" height="120%">
          <feGaussianBlur stdDeviation="0.9" result="glow" />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>
      </defs>
      {/* Outer glow */}
      <path d={path} stroke="#1890d0" strokeWidth="2.2" fill="none" opacity="0.4"
        filter="url(#lf-suiden)" />
      {/* Main bolt */}
      <path d={path} stroke="#50c8f0" strokeWidth="0.8" fill="none" />
      {/* Bright core */}
      <path d={path} stroke="rgba(200,240,255,0.8)" strokeWidth="0.25" fill="none" />
      {/* Water-drop shapes along the bolt */}
      <ellipse cx={mx-2} cy={ty*0.3} rx="0.6" ry="1.0"
        fill="#80deff" opacity="0.7" transform={`rotate(-15, ${mx-2}, ${ty*0.3})`} />
      <ellipse cx={mx+3} cy={ty*0.58} rx="0.5" ry="0.9"
        fill="#80deff" opacity="0.6" transform={`rotate(10, ${mx+3}, ${ty*0.58})`} />
      {/* Impact ripple */}
      <circle cx={mx} cy={ty} r="2" fill="rgba(80,200,240,0.7)"
        style={{ animation: "lightningImpact 0.65s ease-out forwards" }} />
      <circle cx={mx} cy={ty} r="4.5" fill="none" stroke="#50c8f0" strokeWidth="0.5" opacity="0.5"
        style={{ animation: "lightningImpact 0.65s ease-out forwards" }} />
    </g>
  )
}

function Kasumiden({ ty }: { ty: number }) {
  // 霞電 — purple misty web, many thin branches
  const mx = 50
  const mid = ty * 0.48
  return (
    <g>
      <defs>
        <filter id="lf-kasumi" x="-120%" y="-10%" width="340%" height="120%">
          <feGaussianBlur stdDeviation="1.1" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Main stem */}
      <polyline points={`${mx},0 ${mx+2},${mid*0.5} ${mx-1},${mid} ${mx+1},${ty}`}
        stroke="#b070ff" strokeWidth="0.6" fill="none" filter="url(#lf-kasumi)" />
      <polyline points={`${mx},0 ${mx+2},${mid*0.5} ${mx-1},${mid} ${mx+1},${ty}`}
        stroke="rgba(220,180,255,0.7)" strokeWidth="0.2" fill="none" />
      {/* Web of branches from mid-point */}
      {[
        [mx-1, mid, mx-14, mid+ty*0.16],
        [mx-14, mid+ty*0.16, mx-22, mid+ty*0.28],
        [mx-14, mid+ty*0.16, mx-8,  mid+ty*0.3],
        [mx-1, mid, mx+13, mid+ty*0.14],
        [mx+13, mid+ty*0.14, mx+21, mid+ty*0.27],
        [mx+13, mid+ty*0.14, mx+7,  mid+ty*0.28],
        [mx-1, mid, mx-5,  mid+ty*0.35],
        [mx-1, mid, mx+4,  mid+ty*0.38],
        // Smaller sub-branches
        [mx-22, mid+ty*0.28, mx-28, mid+ty*0.38],
        [mx+21, mid+ty*0.27, mx+27, mid+ty*0.37],
        [mx+1, ty*0.85, mx-8, ty*0.95],
        [mx+1, ty*0.85, mx+10, ty*0.93],
      ].map(([x1,y1,x2,y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#b070ff" strokeWidth={i < 8 ? 0.4 : 0.25}
          opacity={i < 4 ? 0.75 : i < 8 ? 0.55 : 0.35} />
      ))}
      {/* Node glow at intersection */}
      <circle cx={mx-1} cy={mid} r="1.2" fill="#c090ff" opacity="0.85" />
      <circle cx={mx+1} cy={ty} r="1.5" fill="#b070ff" opacity="0.6"
        style={{ animation: "lightningImpact 0.65s ease-out forwards" }} />
    </g>
  )
}

function Tsukiko({ ty }: { ty: number }) {
  // 月弧 — gold crescent arc, Tengetsu's moon motif
  const ox = 58  // offset right for crescent feel
  const arc1 = `M ${ox} ${ty*0.05} Q ${ox+18} ${ty*0.5} ${ox-4} ${ty}`
  const arc2 = `M ${ox-5} ${ty*0.08} Q ${ox+12} ${ty*0.5} ${ox-10} ${ty*0.97}`
  return (
    <g>
      <defs>
        <filter id="lf-tsuki" x="-100%" y="-10%" width="300%" height="120%">
          <feGaussianBlur stdDeviation="0.8" result="glow" />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>
      </defs>
      {/* Outer crescent glow */}
      <path d={arc1} stroke="#c8a040" strokeWidth="2.5" fill="none" opacity="0.35"
        filter="url(#lf-tsuki)" />
      {/* Main crescent bolt */}
      <path d={arc1} stroke="#f0d060" strokeWidth="0.75" fill="none" />
      {/* Inner echo */}
      <path d={arc2} stroke="#f0d060" strokeWidth="0.3" fill="none" opacity="0.4" />
      {/* Bright core */}
      <path d={arc1} stroke="rgba(255,245,180,0.8)" strokeWidth="0.22" fill="none" />
      {/* Sparks at the midpoint of the arc */}
      <g transform={`translate(${ox+14}, ${ty*0.52})`}>
        <line x1="0" y1="0" x2="3"  y2="-2.5" stroke="#f0d060" strokeWidth="0.5" opacity="0.8" />
        <line x1="0" y1="0" x2="3.5" y2="1"   stroke="#f0d060" strokeWidth="0.5" opacity="0.8" />
        <line x1="0" y1="0" x2="-2" y2="-3"   stroke="#f0d060" strokeWidth="0.4" opacity="0.6" />
        <line x1="0" y1="0" x2="-2.5" y2="2"  stroke="#f0d060" strokeWidth="0.4" opacity="0.6" />
        <circle r="0.7" fill="#f8e080" />
      </g>
      {/* Moon-crescent decorative mark */}
      <text x={ox+20} y={ty*0.5-5} fontSize="3.5" fill="rgba(240,200,80,0.35)"
        fontFamily="serif" textAnchor="middle">月</text>
      {/* Impact */}
      <circle cx={ox-4} cy={ty} r="1.8" fill="rgba(240,200,80,0.8)"
        style={{ animation: "lightningImpact 0.65s ease-out forwards" }} />
    </g>
  )
}

function Kageden({ ty }: { ty: number }) {
  // 影電 — shadow lightning, double bolt, deep violet
  const mx = 47
  return (
    <g>
      <defs>
        <filter id="lf-kage" x="-80%" y="-10%" width="260%" height="120%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Shadow outer glow */}
      <polyline
        points={`${mx},0 ${mx+5},${ty*0.28} ${mx-3},${ty*0.28} ${mx+8},${ty*0.55} ${mx-4},${ty*0.55} ${mx+3},${ty*0.78} ${mx},${ty}`}
        stroke="#3a1060" strokeWidth="3.5" fill="none" strokeLinejoin="round"
        filter="url(#lf-kage)"
      />
      {/* Main shadow bolt */}
      <polyline
        points={`${mx},0 ${mx+5},${ty*0.28} ${mx-3},${ty*0.28} ${mx+8},${ty*0.55} ${mx-4},${ty*0.55} ${mx+3},${ty*0.78} ${mx},${ty}`}
        stroke="#7040bf" strokeWidth="0.8" fill="none" strokeLinejoin="round"
      />
      {/* Bright violet core */}
      <polyline
        points={`${mx},0 ${mx+5},${ty*0.28} ${mx-3},${ty*0.28} ${mx+8},${ty*0.55} ${mx-4},${ty*0.55} ${mx+3},${ty*0.78} ${mx},${ty}`}
        stroke="rgba(200,160,255,0.75)" strokeWidth="0.22" fill="none" strokeLinejoin="round"
      />
      {/* Second offset bolt (shadow echo) */}
      <polyline
        points={`${mx+9},0 ${mx+14},${ty*0.3} ${mx+6},${ty*0.3} ${mx+16},${ty*0.58} ${mx+8},${ty*0.58} ${mx+12},${ty}`}
        stroke="#5030a0" strokeWidth="0.45" fill="none" strokeLinejoin="round" opacity="0.55"
      />
      {/* Shadow dissolution at base */}
      <circle cx={mx} cy={ty} r="2.2" fill="#7040bf" opacity="0.7"
        style={{ animation: "lightningImpact 0.65s ease-out forwards" }} />
      <circle cx={mx} cy={ty} r="5" fill="none" stroke="#7040bf" strokeWidth="0.5" opacity="0.3"
        style={{ animation: "lightningImpact 0.65s ease-out forwards" }} />
      {/* Kanji 影 dissolving */}
      <text x={mx+6} y={ty*0.42} fontSize="4" fill="rgba(160,100,255,0.3)"
        fontFamily="serif" textAnchor="middle">影</text>
    </g>
  )
}

const SCREEN_COLORS: Record<LightningType, string> = {
  1: "rgba(200,225,255,0.14)",   // Kaminari — cool white-blue
  2: "rgba(20,100,180,0.12)",    // Suiden — deep blue
  3: "rgba(80,30,130,0.11)",     // Kasumiden — dark purple
  4: "rgba(180,140,30,0.10)",    // Tsukiko — warm gold
  5: "rgba(25,5,55,0.15)",       // Kageden — shadow dark
}

const DURATION = 650 // ms

export default function LightningFlash({ type, mechIdx }: Props) {
  const [visible, setVisible] = useState(true)
  const ty = MECH_TARGET_Y[Math.min(mechIdx, 2)]

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), DURATION)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      {/* Screen-wide ambient flash */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: SCREEN_COLORS[type],
          animation: `lightningFlash ${DURATION}ms ease-out forwards`,
        }}
      />

      {/* SVG bolt */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          animation: `lightningBolt ${DURATION}ms ease-out forwards`,
        }}
      >
        {type === 1 && <Kaminari ty={ty} />}
        {type === 2 && <Suiden   ty={ty} />}
        {type === 3 && <Kasumiden ty={ty} />}
        {type === 4 && <Tsukiko  ty={ty} />}
        {type === 5 && <Kageden  ty={ty} />}
      </svg>
    </div>
  )
}
