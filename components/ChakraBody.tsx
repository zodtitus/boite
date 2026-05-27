"use client"

import { useId } from "react"

/**
 * ChakraBody — visual indicator for Mechanism1.
 *
 * Displays `public/chakra-body.png` through two SVG filter layers:
 *   Layer 1 (body)  — feTurbulence + feDisplacementMap; scale rises with
 *                     alignmentLevel so the body *liquefies* as waves sync.
 *   Layer 2 (veins) — feColorMatrix that maps grey pixels → violet / blue
 *                     (black body pixels → transparent, revealing layer 1).
 *
 * Color path: violet (dormant) → light-blue (aligned) → gold (solved)
 *
 * Note: grey pixels have R = G = B = x.  The matrix formula
 *   R_out = 3 * vr * x   (each of the 3 equal input channels adds vr * x)
 * lets us hit any target hue with the coefficients below.
 */

interface Props {
  /** 0-1  = min(max(0, wave_i)) across all three waves */
  alignmentLevel: number
  aligned: boolean      // all three waves above threshold right now
  imminent: boolean     // within WARNING ms of next window
  solved: boolean
  failed: boolean       // fail-flash frame
  musicPulse: number    // 0-1 instantaneous bass energy
}

export default function ChakraBody({
  alignmentLevel, aligned, imminent, solved, failed, musicPulse,
}: Props) {
  const id    = useId().replace(/:/g, "")
  const phase = Date.now() / 1000   // seconds — drives turbulence animation

  // ── Displacement (liquefaction) ─────────────────────────────────────────
  // Body dissolves MORE as alignment approaches 1 (player knows to click)
  const dispScale = solved ? 0
    : failed  ? 22
    : alignmentLevel * 32 + musicPulse * 7

  const bfx = solved ? 0.001
    : 0.005 + alignmentLevel * 0.01 + Math.sin(phase * 0.28) * 0.002
  const bfy = solved ? 0.001
    : 0.005 + alignmentLevel * 0.01 + Math.cos(phase * 0.41) * 0.002

  // ── Vein color ──────────────────────────────────────────────────────────
  // Target hues (for a fully-white pixel, R=G=B=1):
  //   Violet  #8020E0  → (0.502, 0.125, 0.878) per-unit, coeffs = /3
  //   Blue    #40C0FF  → (0.251, 0.753, 1.000) per-unit, coeffs = /3
  //   Gold    #C8A96E  → (0.784, 0.663, 0.431) per-unit, coeffs = /3
  const t = Math.max(0, Math.min(1, alignmentLevel))

  let vr: number, vg: number, vb: number
  if (solved) {
    vr = 0.261; vg = 0.221; vb = 0.144                            // gold
  } else {
    vr = 0.167 + (0.084 - 0.167) * t   // violet → blue
    vg = 0.042 + (0.251 - 0.042) * t
    vb = 0.293 + (0.333 - 0.293) * t
  }

  // Brightness boost on imminent / aligned states
  const boost = aligned ? 1.7 : imminent ? 1.35 : 1 + t * 0.45
  const vr2 = vr * boost
  const vg2 = vg * boost
  const vb2 = vb * boost
  // Alpha: grey intensity → visibility (black body stays transparent here)
  const va2 = Math.min(0.5, 0.333 * boost)

  // ── Glow ────────────────────────────────────────────────────────────────
  const glowColor = solved
    ? "rgba(200,169,110,0.90)"
    : aligned
    ? "rgba(64,192,255,0.80)"
    : imminent
    ? "rgba(140,50,230,0.70)"
    : failed
    ? "rgba(192,64,64,0.80)"
    : `rgba(128,32,224,${(0.10 + t * 0.45).toFixed(2)})`

  const glowPx = solved  ? 28
    : aligned   ? 24
    : imminent  ? 18
    : failed    ? 20
    : Math.round(4 + t * 16 + musicPulse * 6)

  const colorMatrix =
    `${vr2.toFixed(4)} ${vr2.toFixed(4)} ${vr2.toFixed(4)} 0 0 ` +
    `${vg2.toFixed(4)} ${vg2.toFixed(4)} ${vg2.toFixed(4)} 0 0 ` +
    `${vb2.toFixed(4)} ${vb2.toFixed(4)} ${vb2.toFixed(4)} 0 0 ` +
    `${va2.toFixed(4)} ${va2.toFixed(4)} ${va2.toFixed(4)} 0 0`

  return (
    <div style={{
      width: "170px",
      height: "255px",
      filter: `drop-shadow(0 0 ${glowPx}px ${glowColor})`,
      transition: solved || failed ? "filter 0.25s" : "filter 0.55s",
    }}>
      <svg
        width="170" height="255"
        viewBox="0 0 170 255"
        style={{ overflow: "visible", display: "block" }}
      >
        <defs>
          {/* Layer 1 filter — turbulence displacement for liquefaction */}
          <filter id={`${id}d`} x="-30%" y="-20%" width="160%" height="140%">
            <feTurbulence
              type="turbulence"
              baseFrequency={`${bfx.toFixed(5)} ${bfy.toFixed(5)}`}
              numOctaves="4"
              seed="7"
              result="t"
            />
            <feDisplacementMap
              in="SourceGraphic" in2="t"
              scale={dispScale}
              xChannelSelector="R" yChannelSelector="G"
            />
          </filter>

          {/* Layer 2 filter — grey lines → violet/blue, black → transparent */}
          <filter id={`${id}v`} x="-8%" y="-8%" width="116%" height="116%">
            <feColorMatrix type="matrix" values={colorMatrix} />
          </filter>
        </defs>

        {/* Layer 1: displaced body (liquefies at high alignment) */}
        <image
          href="/chakra-body.png"
          x="0" y="0" width="170" height="255"
          preserveAspectRatio="xMidYMid meet"
          filter={`url(#${id}d)`}
          opacity={solved ? 0.4 : 1}
        />

        {/* Layer 2: colorized chakra veins */}
        <image
          href="/chakra-body.png"
          x="0" y="0" width="170" height="255"
          preserveAspectRatio="xMidYMid meet"
          filter={`url(#${id}v)`}
        />

        {/* Solved: kanji overlay */}
        {solved && (
          <text
            x="85" y="135"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="54"
            fill="rgba(200,169,110,0.92)"
            fontFamily="serif"
            style={{ filter: "drop-shadow(0 0 18px rgba(200,169,110,0.95))" }}
          >
            天
          </text>
        )}
      </svg>
    </div>
  )
}
