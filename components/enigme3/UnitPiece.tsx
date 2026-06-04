"use client"

import { motion } from "framer-motion"
import type { PieceState } from "@/types/enigme3"

interface Props {
  piece: PieceState
  isActive?: boolean
  isTargeted?: boolean
  isDying?: boolean
  isShielded?: boolean
  cellSize: number
}

// ─── SVG shapes per role ──────────────────────────────────────────────────────

function ShapeTank({ stroke, size }: { stroke: string; size: number }) {
  const s = size * 0.38
  // Shield shape
  return (
    <path
      d={`M 0 ${-s} L ${s * 0.8} ${-s * 0.3} L ${s * 0.8} ${s * 0.3} L 0 ${s} L ${-s * 0.8} ${s * 0.3} L ${-s * 0.8} ${-s * 0.3} Z`}
      fill="none" stroke={stroke} strokeWidth={2.2} strokeLinejoin="round"
    />
  )
}

function ShapeWarrior({ stroke, size }: { stroke: string; size: number }) {
  const s = size * 0.36
  // Diamond
  return (
    <path
      d={`M 0 ${-s} L ${s * 0.7} 0 L 0 ${s} L ${-s * 0.7} 0 Z`}
      fill="none" stroke={stroke} strokeWidth={2.2} strokeLinejoin="round"
    />
  )
}

function ShapeAssassin({ stroke, size }: { stroke: string; size: number }) {
  const s = size * 0.36
  // Inverted triangle
  return (
    <path
      d={`M ${-s} ${-s * 0.6} L ${s} ${-s * 0.6} L 0 ${s * 0.8} Z`}
      fill="none" stroke={stroke} strokeWidth={2.2} strokeLinejoin="round"
    />
  )
}

function ShapeMage({ stroke, size }: { stroke: string; size: number }) {
  const s = size * 0.33
  // Hexagon
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6
    return `${Math.cos(a) * s},${Math.sin(a) * s}`
  }).join(" ")
  return <polygon points={pts} fill="none" stroke={stroke} strokeWidth={2.2} />
}

function ShapeSupport({ stroke, size }: { stroke: string; size: number }) {
  const s = size * 0.30
  // Circle + inner ring
  return (
    <>
      <circle cx={0} cy={0} r={s} fill="none" stroke={stroke} strokeWidth={2.2} />
      <circle cx={0} cy={0} r={s * 0.5} fill="none" stroke={stroke} strokeWidth={1.2} />
    </>
  )
}

function ShapeScout({ stroke, size }: { stroke: string; size: number }) {
  const s = size * 0.30
  // Tilted square (rotated 45°)
  return (
    <rect
      x={-s} y={-s} width={s * 2} height={s * 2}
      fill="none" stroke={stroke} strokeWidth={2.2}
      transform="rotate(45)"
    />
  )
}

// ─── HP BAR ───────────────────────────────────────────────────────────────────

function HpBar({ hp, maxHp, team, size }: { hp: number; maxHp: number; team: string; size: number }) {
  const ratio = Math.max(0, hp / maxHp)
  const w = size * 0.7
  const barColor = ratio > 0.5 ? "#60c878" : ratio > 0.25 ? "#d4b84a" : "#c05050"
  return (
    <g transform={`translate(${-w / 2}, ${size * 0.46})`}>
      <rect x={0} y={0} width={w} height={3} rx={1.5} fill="rgba(0,0,0,0.5)" />
      <rect x={0} y={0} width={w * ratio} height={3} rx={1.5} fill={barColor} />
    </g>
  )
}

// ─── MAIN PIECE ───────────────────────────────────────────────────────────────

export default function UnitPiece({ piece, isActive, isTargeted, isDying, isShielded, cellSize }: Props) {
  const { unit, currentHp, maxHp, team } = piece

  const goldColor  = "#c8a96e"
  const enemyColor = "rgba(255,255,255,0.62)"
  const baseStroke = team === "player" ? goldColor : enemyColor

  const stroke = isTargeted ? "#c0392b"
    : isActive ? goldColor
    : baseStroke

  const shapeProps = { stroke, size: cellSize }

  const shapeEl = (() => {
    switch (unit.role) {
      case "tank":    return <ShapeTank    {...shapeProps} />
      case "warrior": return <ShapeWarrior {...shapeProps} />
      case "assassin":return <ShapeAssassin {...shapeProps} />
      case "mage":    return <ShapeMage    {...shapeProps} />
      case "support": return <ShapeSupport {...shapeProps} />
      case "scout":   return <ShapeScout   {...shapeProps} />
      default:        return <ShapeWarrior {...shapeProps} />
    }
  })()

  // Glow filter id per team
  const filterId = `glow-${piece.unitId}`

  const svgSize = cellSize

  const variants = {
    idle:     { scale: 1,    opacity: 1 },
    active:   { scale: 1.08, opacity: 1 },
    targeted: { scale: 1,    opacity: 1 },
    dying:    { scale: 0,    opacity: 0 },
  }

  const animState = isDying ? "dying" : isActive ? "active" : "idle"

  return (
    <motion.svg
      width={svgSize} height={svgSize}
      viewBox={`${-svgSize / 2} ${-svgSize / 2} ${svgSize} ${svgSize}`}
      variants={variants}
      animate={animState}
      transition={isDying ? { duration: 0.6, ease: "easeOut" } : { duration: 0.18 }}
      style={{ overflow: "visible", cursor: "default", display: "block" }}
    >
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={isActive ? "3" : isTargeted ? "2.5" : "1"} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        {isDying && (
          <filter id={`dissolve-${piece.unitId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="3" result="noise" seed="2">
              <animate attributeName="baseFrequency" from="0.05" to="0.65" dur="0.6s" fill="freeze" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" result="displaced">
              <animate attributeName="scale" from="0" to="80" dur="0.6s" fill="freeze" />
            </feDisplacementMap>
          </filter>
        )}
      </defs>

      {/* Shield ring */}
      {isShielded && (
        <motion.circle
          cx={0} cy={0} r={cellSize * 0.44}
          fill="none" stroke="rgba(100,160,255,0.55)" strokeWidth={1.5}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          strokeDasharray="4 3"
        />
      )}

      {/* Piece shape */}
      <g
        filter={`url(#${filterId})`}
        style={isDying ? { filter: `url(#dissolve-${piece.unitId})` } : undefined}
      >
        {isTargeted ? (
          <motion.g
            animate={{ x: [0, -3, 3, -3, 3, 0] }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {shapeEl}
          </motion.g>
        ) : shapeEl}
      </g>

      {/* Active pulse ring */}
      {isActive && (
        <motion.circle
          cx={0} cy={0} r={cellSize * 0.42}
          fill="none" stroke={goldColor} strokeWidth={1}
          animate={{ opacity: [0.6, 0.1, 0.6], scale: [1, 1.12, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* HP bar */}
      {!isDying && (
        <HpBar hp={currentHp} maxHp={maxHp} team={team} size={svgSize} />
      )}

      {/* Kanji label */}
      {!isDying && (
        <text
          x={0} y={cellSize * 0.22}
          textAnchor="middle"
          fontSize={cellSize * 0.22}
          fill={stroke}
          opacity={0.7}
          fontFamily="serif"
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          {unit.kanji}
        </text>
      )}
    </motion.svg>
  )
}
