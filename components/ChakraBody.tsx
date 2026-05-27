"use client"

import { useId } from "react"

/**
 * ChakraBody — visual indicator for Mechanism1.
 *
 * Three SVG filter layers:
 *
 *  1. Body layer  — feTurbulence + feDisplacementMap
 *                   Body liquefies as alignmentLevel rises (waves in sync).
 *
 *  2. Bloom layer — feMorphology dilate (thickens thin veins for visibility)
 *                   + feColorMatrix (grey→violet/blue) + feGaussianBlur
 *                   Creates a soft glowing halo around every chakra channel.
 *
 *  3. Sharp layer — same dilate+colorize without blur
 *                   Renders crisp, vivid vein lines on top of the bloom.
 *
 * Flow animation: vein brightness oscillates with two overlapping sine waves
 * (fast + slow phase) so energy appears to pulse and circulate through the
 * channels every second — violet when dormant, blue at alignment, gold when solved.
 *
 * Colour formula: grey pixel has R=G=B=x.  The feColorMatrix coeff `k` per
 * input channel produces: out_channel = 3*k*x  (three channels each add k*x).
 * So to target hue component H at x=1: k = H/3.
 */

interface Props {
  /** min(max(0, wave_i)) across all three waves — 0 when any is negative */
  alignmentLevel: number
  aligned: boolean     // all three waves above threshold
  imminent: boolean    // within WARNING ms of next window
  solved: boolean
  failed: boolean      // fail-flash frame
  musicPulse: number   // 0-1 bass energy
}

export default function ChakraBody({
  alignmentLevel, aligned, imminent, solved, failed, musicPulse,
}: Props) {
  const id  = useId().replace(/:/g, "")
  const now = Date.now() / 1000   // seconds — drives per-frame animation

  // ── Flow pulses (two overlapping waves for organic feel) ─────────────────
  const fast = (Math.sin(now * 2.6) + 1) / 2        // ~0.4 s cycle
  const slow = (Math.sin(now * 0.85 + 1.1) + 1) / 2 // ~1.3 s cycle
  const flow = fast * 0.55 + slow * 0.45             // 0-1 composite pulse

  // ── Displacement (body liquefaction) ─────────────────────────────────────
  const dispScale = solved ? 0
    : failed  ? 24
    : alignmentLevel * 34 + musicPulse * 8

  const bfx = solved ? 0.001 : 0.005 + alignmentLevel * 0.009 + Math.sin(now * 0.27) * 0.0018
  const bfy = solved ? 0.001 : 0.005 + alignmentLevel * 0.009 + Math.cos(now * 0.39) * 0.0018

  // ── Target hues → per-channel matrix coefficients (divide by 3) ──────────
  // Violet  #9020E0  R=0.565 G=0.125 B=0.878
  // Blue    #30C8FF  R=0.188 G=0.784 B=1.000
  // Gold    #C8A96E  R=0.784 G=0.663 B=0.431
  const t = Math.max(0, Math.min(1, alignmentLevel))
  let hr: number, hg: number, hb: number
  if (solved) {
    hr = 0.784; hg = 0.663; hb = 0.431
  } else {
    hr = 0.565 + (0.188 - 0.565) * t
    hg = 0.125 + (0.784 - 0.125) * t
    hb = 0.878 + (1.000 - 0.878) * t
  }

  // State brightness: brighter when aligned/imminent
  const stateB = aligned ? 2.8 : imminent ? 1.9 : 1.1 + t * 0.7

  // Total brightness = stateB × flow animation (gives pulsing energy feel)
  const totalB = stateB * (0.75 + flow * 0.55 + musicPulse * 0.3)

  // Sharp layer coefficients
  const sr = (hr * totalB) / 3
  const sg = (hg * totalB) / 3
  const sb = (hb * totalB) / 3
  const sa = Math.min(1, (0.90 + flow * 0.6 + t * 0.5) * stateB) / 3

  // Bloom layer — brighter, will be blurred
  const boomB = totalB * (aligned ? 1.8 : 1.4)
  const br = (hr * boomB) / 3
  const bg_c = (hg * boomB) / 3
  const bb = (hb * boomB) / 3
  const ba = Math.min(1.2, sa * 1.2)

  function mat(r: number, g: number, b: number, a: number): string {
    const f = (n: number) => n.toFixed(4)
    return (
      `${f(r)} ${f(r)} ${f(r)} 0 0 ` +
      `${f(g)} ${f(g)} ${f(g)} 0 0 ` +
      `${f(b)} ${f(b)} ${f(b)} 0 0 ` +
      `${f(a)} ${f(a)} ${f(a)} 0 0`
    )
  }

  // ── Glow ─────────────────────────────────────────────────────────────────
  const glowC = solved   ? "rgba(200,169,110,0.90)"
    : aligned   ? "rgba(48,200,255,0.85)"
    : imminent  ? "rgba(144,32,224,0.75)"
    : failed    ? "rgba(192,64,64,0.80)"
    : `rgba(144,32,224,${(0.10 + t * 0.50).toFixed(2)})`
  const glowPx = solved ? 30 : aligned ? 26 : imminent ? 20 : failed ? 22
    : Math.round(6 + t * 20 + musicPulse * 8)

  return (
    <div style={{
      width: "170px", height: "255px",
      filter: `drop-shadow(0 0 ${glowPx}px ${glowC})`,
      transition: solved || failed ? "filter 0.2s" : "filter 0.5s",
    }}>
      <svg
        width="170" height="255"
        viewBox="0 0 170 255"
        style={{ overflow: "visible", display: "block" }}
      >
        <defs>
          {/* ── Layer 1: displacement (body liquefaction) ── */}
          <filter id={`${id}d`} x="-30%" y="-20%" width="160%" height="145%">
            <feTurbulence
              type="turbulence"
              baseFrequency={`${bfx.toFixed(5)} ${bfy.toFixed(5)}`}
              numOctaves="4" seed="7" result="t"
            />
            <feDisplacementMap
              in="SourceGraphic" in2="t"
              scale={dispScale}
              xChannelSelector="R" yChannelSelector="G"
            />
          </filter>

          {/* ── Layer 2: bloom (dilated + blurred glow) ── */}
          <filter id={`${id}b`} x="-25%" y="-25%" width="150%" height="150%">
            <feMorphology operator="dilate" radius="2.5" result="fat" />
            <feColorMatrix in="fat" type="matrix" values={mat(br, bg_c, bb, ba)} result="colored" />
            <feGaussianBlur in="colored" stdDeviation="4" />
          </filter>

          {/* ── Layer 3: sharp veins (dilated + colorized, no blur) ── */}
          <filter id={`${id}s`} x="-6%" y="-6%" width="112%" height="112%">
            <feMorphology operator="dilate" radius="1" result="fat" />
            <feColorMatrix in="fat" type="matrix" values={mat(sr, sg, sb, sa)} />
          </filter>
        </defs>

        {/* Layer 1 — displaced body */}
        <image
          href="/chakra-body.png"
          x="0" y="0" width="170" height="255"
          preserveAspectRatio="xMidYMid meet"
          filter={`url(#${id}d)`}
          opacity={solved ? 0.38 : 1}
        />

        {/* Layer 2 — bloom glow */}
        <image
          href="/chakra-body.png"
          x="0" y="0" width="170" height="255"
          preserveAspectRatio="xMidYMid meet"
          filter={`url(#${id}b)`}
        />

        {/* Layer 3 — sharp veins */}
        <image
          href="/chakra-body.png"
          x="0" y="0" width="170" height="255"
          preserveAspectRatio="xMidYMid meet"
          filter={`url(#${id}s)`}
        />

        {/* Solved kanji */}
        {solved && (
          <text
            x="85" y="135"
            textAnchor="middle" dominantBaseline="middle"
            fontSize="56" fill="rgba(200,169,110,0.92)"
            fontFamily="serif"
            style={{ filter: "drop-shadow(0 0 20px rgba(200,169,110,0.95))" }}
          >
            天
          </text>
        )}
      </svg>
    </div>
  )
}
