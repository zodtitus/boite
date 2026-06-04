"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { CombatAction, PieceState, CombatViewProps } from "@/types/enigme3"
import { playCombatSound } from "@/lib/enigme3/combatAudio"
import UnitPiece from "./UnitPiece"

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const CELL_SIZE = 72
const BOARD_SIZE = CELL_SIZE * 4
const PIECE_SIZE = CELL_SIZE * 0.70

// Delays in ms — multiplied by speed factor
const BASE_ACTION_DELAY   = 480
const BASE_ANIM_DURATION  = 340

// ─── OVERLAY TYPES ────────────────────────────────────────────────────────────

interface Overlay {
  id: string
  type: "attack_line" | "chain_line" | "steal_line" | "explosion" | "heal_particles" | "damage_number" | "decap_sweep"
  from?: [number, number]
  to?: [number, number]
  points?: Array<[number, number]>
  value?: number | string
  color?: string
  cellPos?: [number, number]
}

// ─── LOG ENTRY ────────────────────────────────────────────────────────────────

interface LogEntry {
  id: string
  text: string
  kind: "attack" | "ability" | "heal" | "death" | "system" | "buff" | "fail"
  round: number
}

// ─── UTILS ────────────────────────────────────────────────────────────────────

function cellCenter(row: number, col: number): [number, number] {
  return [col * CELL_SIZE + CELL_SIZE / 2, row * CELL_SIZE + CELL_SIZE / 2]
}

let _logId = 0
function lid() { return `l${++_logId}` }

function buildLogText(action: CombatAction, pieces: Map<string, PieceState>): { text: string; kind: LogEntry["kind"] } {
  const actor  = pieces.get(action.actorId)
  const target = action.targetIds[0] ? pieces.get(action.targetIds[0]) : null
  const aName  = actor?.unit.name.split(" ")[0] ?? action.actorId
  const tName  = target?.unit.name.split(" ")[0] ?? "?"
  const dmg    = action.damage?.[0]
  const isMulti = (action.damage?.length ?? 0) > 1

  switch (action.type) {
    case "attack":
      return { text: `${aName} frappe ${tName}${dmg ? ` (−${dmg})` : ""}`, kind: "attack" }
    case "ability":
      return { text: `${aName} · ${action.abilityName ?? "compétence"}${dmg ? ` → −${dmg}` : ""}`, kind: "ability" }
    case "steal":
      return { text: `${aName} · ${action.abilityName} → draine ${action.heal ?? ""}PV`, kind: "ability" }
    case "chain":
      return { text: `${aName} · ${action.abilityName}${isMulti ? ` (×${action.targetIds.length})` : ""}`, kind: "ability" }
    case "explosion":
      if (action.actorId === "synergy_cannon")
        return { text: `Barrage du Pavillon Noir !`, kind: "ability" }
      return { text: `${aName} · ${action.abilityName}`, kind: "ability" }
    case "heal":
      return { text: `${aName} soigne ${tName} (+${action.heal ?? ""}PV)`, kind: "heal" }
    case "buff":
      return { text: `${aName} · ${action.abilityName} → bouclier sur ${tName}`, kind: "buff" }
    case "ability_fail":
      return { text: `${aName} rate son attaque !`, kind: "fail" }
    case "death":
      return { text: `${tName} est éliminé.`, kind: "death" }
    default:
      return { text: action.abilityName ?? action.type, kind: "system" as LogEntry["kind"] }
  }
}

// ─── BOARD GRID BACKGROUND ───────────────────────────────────────────────────

function BoardGrid() {
  return (
    <svg
      width={BOARD_SIZE} height={BOARD_SIZE}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    >
      <defs>
        <filter id="fog-cell">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
          <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
          <feBlend in="SourceGraphic" in2="gray" mode="overlay" />
        </filter>
      </defs>
      {Array.from({ length: 4 }, (_, row) =>
        Array.from({ length: 4 }, (_, col) => {
          const x = col * CELL_SIZE, y = row * CELL_SIZE
          const isEnemyZone = row <= 1
          const isPlayerZone = row >= 2
          return (
            <rect key={`${row}-${col}`}
              x={x + 1} y={y + 1} width={CELL_SIZE - 2} height={CELL_SIZE - 2}
              rx={4}
              fill={
                isEnemyZone  ? "rgba(192,80,80,0.045)" :
                isPlayerZone ? "rgba(96,200,120,0.035)" :
                "rgba(255,255,255,0.018)"
              }
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          )
        })
      )}
      {/* Zone labels */}
      <text x={2} y={CELL_SIZE * 0.5} fontSize={7} fill="rgba(192,80,80,0.35)" fontFamily="serif">ENNEMI</text>
      <text x={2} y={CELL_SIZE * 2.5} fontSize={7} fill="rgba(96,200,120,0.35)" fontFamily="serif">ALLIÉ</text>
    </svg>
  )
}

// ─── OVERLAY LAYER ────────────────────────────────────────────────────────────

function AttackLine({ from, to, color }: { from: [number,number]; to: [number,number]; color: string }) {
  return (
    <motion.line
      x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]}
      stroke={color} strokeWidth={2} strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0.9 }}
      animate={{ pathLength: 1, opacity: 0 }}
      transition={{ duration: 0.30, ease: "easeOut" }}
    />
  )
}

function ChainLine({ from, to }: { from: [number,number]; to: [number,number] }) {
  // Persistent golden dashed chain — for ki_ren illusion web
  return (
    <motion.line
      x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]}
      stroke="#c8a96e" strokeWidth={1.5} strokeLinecap="round"
      strokeDasharray="5 3"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.85 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    />
  )
}

function StealLine({ from, to }: { from: [number,number]; to: [number,number] }) {
  // Samehada drain — stroke-dashoffset technique
  const length = Math.sqrt((to[0]-from[0])**2 + (to[1]-from[1])**2)
  return (
    <motion.line
      x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]}
      stroke="#9060c8" strokeWidth={2} strokeLinecap="round"
      strokeDasharray={length}
      initial={{ strokeDashoffset: length, opacity: 0.9 }}
      animate={{ strokeDashoffset: 0, opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeIn" }}
    />
  )
}

function ExplosionCircle({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <motion.circle
      cx={cx} cy={cy}
      stroke={color} strokeWidth={2} fill="none"
      initial={{ r: 4, opacity: 0.9 }}
      animate={{ r: CELL_SIZE * 0.9, opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    />
  )
}

function DecapSweep({ y }: { y: number }) {
  // Horizontal sweep line — Kubikiribōchō decapitation
  return (
    <motion.line
      x1={0} y1={y} x2={BOARD_SIZE} y2={y}
      stroke="#c0392b" strokeWidth={2.5} strokeLinecap="round"
      initial={{ scaleX: 0, opacity: 1 }}
      animate={{ scaleX: 1, opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ transformOrigin: `0px ${y}px` }}
    />
  )
}

function HealParticle({ cx, cy }: { cx: number; cy: number }) {
  const offX = (Math.random() - 0.5) * CELL_SIZE * 0.5
  return (
    <motion.circle
      cx={cx + offX} cy={cy}
      r={2.5} fill="#60c878"
      initial={{ opacity: 0.9, y: 0 }}
      animate={{ opacity: 0, y: -CELL_SIZE * 0.7 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    />
  )
}

function DamageNumber({ x, y, value, color }: { x: number; y: number; value: string; color: string }) {
  return (
    <motion.text
      x={x} y={y}
      fill={color} fontSize={12} fontWeight="bold"
      textAnchor="middle" fontFamily="serif"
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 0, y: -22 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {value}
    </motion.text>
  )
}

// ─── LOG PANEL ────────────────────────────────────────────────────────────────

const LOG_COLORS: Record<string, string> = {
  attack: "var(--text)",
  ability: "#c8a96e",
  heal: "#60c878",
  death: "#c05050",
  buff: "#6090e0",
  fail: "rgba(255,255,255,0.32)",
  system: "var(--muted)",
}

function CombatLog({ entries, currentRound }: { entries: LogEntry[]; currentRound: number }) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [entries.length])

  return (
    <div style={{
      flex: 1,
      height: BOARD_SIZE,
      overflowY: "auto",
      background: "rgba(0,0,0,0.55)",
      borderRadius: "8px",
      padding: "10px 12px",
      border: "1px solid rgba(255,255,255,0.07)",
      display: "flex", flexDirection: "column", gap: "3px",
    }}>
      <p className="font-cinzel" style={{ fontSize: "7px", color: "rgba(255,255,255,0.25)", letterSpacing: "2px", marginBottom: "6px" }}>
        JOURNAL DE COMBAT
      </p>
      <AnimatePresence initial={false}>
        {entries.map((e, i) => {
          const isPast = e.round < currentRound
          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: isPast ? 0.40 : 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", gap: "6px", alignItems: "baseline" }}
            >
              <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.18)", flexShrink: 0 }}>
                T{e.round}
              </span>
              <span style={{ fontSize: "9px", color: LOG_COLORS[e.kind] ?? "var(--text)", lineHeight: 1.5 }}>
                {e.text}
              </span>
            </motion.div>
          )
        })}
      </AnimatePresence>
      <div ref={endRef} />
    </div>
  )
}

// ─── MAIN COMBAT VIEW ─────────────────────────────────────────────────────────

export default function CombatView({ actions, initialPieces, onCombatEnd }: CombatViewProps) {
  const [pieces, setPieces] = useState<Map<string, PieceState>>(() => {
    const m = new Map<string, PieceState>()
    for (const p of initialPieces) m.set(p.unitId, { ...p })
    return m
  })

  const [activeId,   setActiveId]   = useState<string | null>(null)
  const [targetedIds, setTargetedIds] = useState<string[]>([])
  const [dyingIds,   setDyingIds]   = useState<Set<string>>(new Set())
  const [shieldedIds, setShieldedIds] = useState<Set<string>>(new Set())
  const [overlays,   setOverlays]   = useState<Overlay[]>([])
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])
  const [currentRound, setCurrentRound] = useState(0)
  const [paused,     setPaused]     = useState(false)
  const [speed,      setSpeed]      = useState<1 | 2>(1)
  const [done,       setDone]       = useState(false)

  const pausedRef = useRef(false)
  const speedRef  = useRef<1 | 2>(1)

  useEffect(() => { pausedRef.current = paused }, [paused])
  useEffect(() => { speedRef.current  = speed  }, [speed])

  const pieceMap = useRef(new Map<string, PieceState>())
  useEffect(() => {
    const m = new Map<string, PieceState>()
    for (const p of initialPieces) m.set(p.unitId, { ...p })
    pieceMap.current = m
  }, [initialPieces])

  // ── wait helper ─────────────────────────────────────────────────────────────
  const wait = useCallback((ms: number) => new Promise<void>(res => {
    const check = () => {
      if (!pausedRef.current) res()
      else setTimeout(check, 50)
    }
    setTimeout(check, ms / speedRef.current)
  }), [])

  // ── add overlay then remove after duration ──────────────────────────────────
  const addOverlay = useCallback((o: Overlay, durationMs: number) => {
    setOverlays(prev => [...prev, o])
    setTimeout(() => setOverlays(prev => prev.filter(x => x.id !== o.id)), durationMs)
  }, [])

  // ── process single action ───────────────────────────────────────────────────
  const processAction = useCallback(async (action: CombatAction) => {
    const pm = pieceMap.current
    const actorPiece  = pm.get(action.actorId)
    const targetPiece = action.targetIds[0] ? pm.get(action.targetIds[0]) : undefined

    // Update current round display
    setCurrentRound(action.round)

    // Build log entry
    const { text, kind } = buildLogText(action, pm)
    setLogEntries(prev => [...prev, { id: lid(), text, kind, round: action.round }])

    // Set active actor
    setActiveId(action.actorId)
    if (action.targetIds.length) setTargetedIds(action.targetIds)

    const actorPos  = actorPiece  ? cellCenter(...actorPiece.position)  : null
    const targetPos = targetPiece ? cellCenter(...targetPiece.position) : null

    // ── Play sound + show overlays per type ─────────────────────────────────
    switch (action.type) {
      case "attack": {
        playCombatSound("hit")
        if (actorPos && targetPos) {
          addOverlay({
            id: `atk-${action.id}`, type: "attack_line",
            from: actorPos, to: targetPos,
            color: actorPiece?.team === "player" ? "#c8a96e" : "#c05050",
          }, 350)
        }
        if (targetPos && action.damage?.[0]) {
          addOverlay({
            id: `dmg-${action.id}`, type: "damage_number",
            cellPos: targetPiece!.position, value: `-${action.damage[0]}`,
            color: "#e07860",
          }, 700)
        }
        break
      }
      case "ability": {
        playCombatSound("ability")
        if (actorPos && targetPos) {
          addOverlay({
            id: `atk-${action.id}`, type: "attack_line",
            from: actorPos, to: targetPos,
            color: "#c8a96e",
          }, 380)
        }
        if (targetPos && action.damage?.[0]) {
          addOverlay({
            id: `dmg-${action.id}`, type: "damage_number",
            cellPos: targetPiece!.position, value: `-${action.damage[0]}`,
            color: "#e07860",
          }, 700)
        }
        break
      }
      case "steal": {
        playCombatSound("steal")
        if (actorPos && targetPos) {
          addOverlay({ id: `steal-${action.id}`, type: "steal_line", from: targetPos, to: actorPos }, 500)
        }
        if (targetPos && action.damage?.[0]) {
          addOverlay({
            id: `dmg-${action.id}`, type: "damage_number",
            cellPos: targetPiece!.position, value: `-${action.damage[0]}`,
            color: "#9060c8",
          }, 700)
        }
        if (actorPos && action.heal) {
          addOverlay({
            id: `heal-${action.id}`, type: "damage_number",
            cellPos: actorPiece!.position, value: `+${action.heal}`,
            color: "#60c878",
          }, 700)
        }
        break
      }
      case "chain": {
        playCombatSound("chain")
        // Persistent golden dashed lines from actor to each target
        if (actorPos) {
          for (const tid of (action.chainedIds ?? action.targetIds)) {
            const tp = pm.get(tid)
            if (tp) {
              const tPos = cellCenter(...tp.position)
              addOverlay({ id: `chain-${action.id}-${tid}`, type: "chain_line", from: actorPos, to: tPos }, 700)
            }
          }
        }
        for (const [i, tid] of action.targetIds.entries()) {
          const tp = pm.get(tid)
          if (tp && action.damage?.[i]) {
            addOverlay({
              id: `dmg-${action.id}-${i}`, type: "damage_number",
              cellPos: tp.position, value: `-${action.damage[i]}`,
              color: "#9060c8",
            }, 700)
          }
        }
        break
      }
      case "explosion": {
        playCombatSound("explosion")
        // Expanding circle on each target
        for (const [i, tid] of action.targetIds.entries()) {
          const tp = pm.get(tid)
          if (tp) {
            const tPos = cellCenter(...tp.position)
            addOverlay({ id: `exp-${action.id}-${i}`, type: "explosion", from: tPos, color: "#c05050" }, 500)
            if (action.damage?.[i]) {
              addOverlay({
                id: `dmg-${action.id}-${i}`, type: "damage_number",
                cellPos: tp.position, value: `-${action.damage[i]}`,
                color: "#e07860",
              }, 700)
            }
          }
        }
        break
      }
      case "heal": {
        playCombatSound("heal")
        if (targetPiece) {
          // rising particles
          for (let p = 0; p < 4; p++) {
            addOverlay({
              id: `healp-${action.id}-${p}`, type: "heal_particles",
              cellPos: targetPiece.position,
            }, 700)
          }
          addOverlay({
            id: `healn-${action.id}`, type: "damage_number",
            cellPos: targetPiece.position, value: `+${action.heal}`,
            color: "#60c878",
          }, 700)
        }
        // Update piece HP
        if (targetPiece && action.heal) {
          const updated = { ...targetPiece, currentHp: Math.min(targetPiece.maxHp, targetPiece.currentHp + action.heal) }
          pm.set(targetPiece.unitId, updated)
          setPieces(new Map(pm))
        }
        break
      }
      case "buff": {
        playCombatSound("ability")
        if (targetPiece) {
          setShieldedIds(prev => new Set([...prev, targetPiece.unitId]))
          addOverlay({
            id: `exp-${action.id}`, type: "explosion",
            from: cellCenter(...targetPiece.position), color: "#6090e0",
          }, 500)
        }
        break
      }
      case "ability_fail": {
        // shake only — no separate sound
        break
      }
    }

    // Apply damage to pieces
    if (action.damage) {
      for (const [i, tid] of action.targetIds.entries()) {
        const tp = pm.get(tid)
        if (tp && action.damage[i]) {
          const newHp = Math.max(0, tp.currentHp - action.damage[i])
          const updated = { ...tp, currentHp: newHp, isAlive: newHp > 0 }
          pm.set(tid, updated)
        }
      }
      setPieces(new Map(pm))
    }

    // Handle decapitation sweep before death
    if (action.decapitation && targetPiece) {
      const [row] = targetPiece.position
      const cy = row * CELL_SIZE + CELL_SIZE / 2
      await wait(BASE_ANIM_DURATION * 0.5)
      addOverlay({ id: `decap-${action.id}`, type: "decap_sweep", from: [0, cy] }, 550)
      await wait(300)
    }

    // Handle eliminations
    if (action.eliminated?.length) {
      await wait(BASE_ANIM_DURATION * 0.6)
      playCombatSound("death")
      for (const id of action.eliminated) {
        const tp = pm.get(id)
        if (tp) {
          const updated = { ...tp, isAlive: false, currentHp: 0 }
          pm.set(id, updated)
        }
        setDyingIds(prev => new Set([...prev, id]))
        setLogEntries(prev => [...prev, {
          id: lid(), text: `${pm.get(id)?.unit.name ?? id} est éliminé.`, kind: "death", round: action.round,
        }])
      }
      setPieces(new Map(pm))
    }

    await wait(BASE_ACTION_DELAY)
    setActiveId(null)
    setTargetedIds([])
  }, [addOverlay, wait])

  // ── Run all actions sequentially ────────────────────────────────────────────
  useEffect(() => {
    if (!actions.length) return

    let cancelled = false
    const run = async () => {
      for (const action of actions) {
        if (cancelled) break
        await processAction(action)
      }
      if (!cancelled) {
        await wait(500)
        setDone(true)
      }
    }
    run()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions])

  // ── Notify parent when done ─────────────────────────────────────────────────
  useEffect(() => {
    if (!done) return
    const finalPieces = Array.from(pieceMap.current.values())
    const playerWon = finalPieces.some(p => p.team === "player" && p.isAlive)
    setTimeout(() => onCombatEnd(playerWon), 600)
  }, [done, onCombatEnd])

  // ── Render pieces on board ──────────────────────────────────────────────────
  const pieceArray = Array.from(pieces.values())

  return (
    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", width: "100%" }}>

      {/* ── BOARD ─────────────────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, position: "relative" }}>
        {/* Board container */}
        <div style={{
          position: "relative",
          width: BOARD_SIZE,
          height: BOARD_SIZE,
          background: "rgba(5,7,9,0.95)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "6px",
          overflow: "hidden",
        }}>
          {/* Grid */}
          <BoardGrid />

          {/* Pieces */}
          {pieceArray.map(piece => {
            if (!piece.isAlive && !dyingIds.has(piece.unitId)) return null
            const [row, col] = piece.position
            const x = col * CELL_SIZE + (CELL_SIZE - PIECE_SIZE) / 2
            const y = row * CELL_SIZE + (CELL_SIZE - PIECE_SIZE) / 2

            return (
              <div
                key={piece.unitId}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: PIECE_SIZE,
                  height: PIECE_SIZE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UnitPiece
                  piece={piece}
                  isActive={activeId === piece.unitId}
                  isTargeted={targetedIds.includes(piece.unitId)}
                  isDying={dyingIds.has(piece.unitId)}
                  isShielded={shieldedIds.has(piece.unitId)}
                  cellSize={PIECE_SIZE}
                />
              </div>
            )
          })}

          {/* SVG Overlay layer */}
          <svg
            width={BOARD_SIZE} height={BOARD_SIZE}
            style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", overflow: "visible" }}
          >
            <AnimatePresence>
              {overlays.map(o => {
                switch (o.type) {
                  case "attack_line":
                    return <AttackLine key={o.id} from={o.from!} to={o.to!} color={o.color ?? "#c8a96e"} />
                  case "chain_line":
                    return <ChainLine key={o.id} from={o.from!} to={o.to!} />
                  case "steal_line":
                    return <StealLine key={o.id} from={o.from!} to={o.to!} />
                  case "explosion":
                    return <ExplosionCircle key={o.id} cx={o.from![0]} cy={o.from![1]} color={o.color ?? "#c05050"} />
                  case "decap_sweep":
                    return <DecapSweep key={o.id} y={o.from![1]} />
                  case "heal_particles":
                    return <HealParticle key={o.id} cx={cellCenter(...o.cellPos!)[0]} cy={cellCenter(...o.cellPos!)[1]} />
                  case "damage_number":
                    return (
                      <DamageNumber
                        key={o.id}
                        x={cellCenter(...o.cellPos!)[0]}
                        y={cellCenter(...o.cellPos!)[1] - CELL_SIZE * 0.25}
                        value={String(o.value ?? "")}
                        color={o.color ?? "#e07860"}
                      />
                    )
                  default:
                    return null
                }
              })}
            </AnimatePresence>
          </svg>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: "8px", marginTop: "8px", justifyContent: "center" }}>
          <button
            onClick={() => setPaused(p => !p)}
            style={{
              padding: "4px 12px", borderRadius: "5px",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.04)",
              color: "var(--muted)", fontSize: "8px",
              letterSpacing: "1px", cursor: "pointer",
            }}
          >
            {paused ? "▶ Reprendre" : "⏸ Pause"}
          </button>
          <button
            onClick={() => setSpeed(s => s === 1 ? 2 : 1)}
            style={{
              padding: "4px 12px", borderRadius: "5px",
              border: `1px solid ${speed === 2 ? "var(--gold)" : "rgba(255,255,255,0.15)"}`,
              background: speed === 2 ? "rgba(200,169,110,0.08)" : "rgba(255,255,255,0.04)",
              color: speed === 2 ? "var(--gold)" : "var(--muted)", fontSize: "8px",
              letterSpacing: "1px", cursor: "pointer",
            }}
          >
            {speed === 2 ? "×2" : "×1"}
          </button>
        </div>
      </div>

      {/* ── LOG PANEL ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* Round label */}
        <p className="font-cinzel" style={{
          fontSize: "8px", color: "rgba(255,255,255,0.30)", letterSpacing: "2px",
          textTransform: "uppercase",
        }}>
          {done ? "Combat terminé" : currentRound > 0 ? `Tour ${currentRound}` : "Initialisation…"}
        </p>

        <CombatLog entries={logEntries} currentRound={currentRound} />
      </div>
    </div>
  )
}
