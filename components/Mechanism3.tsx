"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Unit, GamePhase, ActiveSynergy, SlotPos, CombatLog } from "@/types/enigme3"
import {
  ROSTER, getActiveSynergies, getRandomUnits,
  CLAN_LABELS, CLAN_COLORS, ROLE_LABELS,
} from "@/lib/enigme3/data"
import { simulateCombat } from "@/lib/enigme3/combat"
import { getEnemyTeam, ROUND_NAMES, ROUND_FLAVORS } from "@/lib/enigme3/adversary"
import { useAudio } from "@/lib/useAudio"

const TEAM_MAX = 4
const WINS_NEEDED = 3

// ─── UNIT CARD ────────────────────────────────────────────────────────────────

interface UnitCardProps {
  unit: Unit
  selected?: boolean
  dim?: boolean
  onClick?: () => void
  size?: "sm" | "md"
  slotLabel?: string
  removable?: boolean
  onRemove?: () => void
}

function UnitCard({ unit, selected, dim, onClick, size = "md", slotLabel, removable, onRemove }: UnitCardProps) {
  const isSm = size === "sm"
  const clanColor = CLAN_COLORS[unit.clan] || "var(--gold)"
  const tierColor = unit.tier === 3 ? "var(--gold)" : unit.tier === 2 ? "#8888cc" : "var(--muted)"

  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { scale: 1.03 } : {}}
      whileTap={onClick ? { scale: 0.97 } : {}}
      style={{
        position: "relative",
        background: selected ? `${clanColor}14` : "rgba(255,255,255,0.02)",
        border: `1px solid ${selected ? clanColor : dim ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.09)"}`,
        borderRadius: "8px",
        padding: isSm ? "7px 9px" : "11px 12px",
        cursor: onClick ? "pointer" : "default",
        opacity: dim ? 0.38 : 1,
        transition: "border-color 0.2s, background 0.2s, opacity 0.2s",
        flexShrink: 0,
        boxShadow: selected ? `0 0 14px ${clanColor}33` : "none",
        width: isSm ? "116px" : "148px",
      }}
    >
      {selected && (
        <div style={{
          position: "absolute", top: "6px", right: "6px",
          width: "13px", height: "13px", borderRadius: "50%",
          background: clanColor, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "8px", color: "#000",
        }}>✓</div>
      )}
      {removable && (
        <div
          onClick={e => { e.stopPropagation(); onRemove?.() }}
          style={{
            position: "absolute", top: "5px", right: "5px",
            width: "14px", height: "14px", borderRadius: "50%",
            background: "rgba(192,64,64,0.7)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "9px", color: "#fff", lineHeight: 1,
          }}
        >×</div>
      )}
      {slotLabel && (
        <div style={{
          position: "absolute", top: "-9px", left: "50%", transform: "translateX(-50%)",
          background: "var(--bg3)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "3px", padding: "1px 6px",
          fontSize: "7px", letterSpacing: "1px", color: "var(--muted)", textTransform: "uppercase",
        }}>{slotLabel}</div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "5px" }}>
        <span style={{ fontSize: isSm ? "18px" : "24px", lineHeight: 1 }}>{unit.kanji}</span>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
          <span style={{ fontSize: "7px", color: tierColor }}>{"◆".repeat(unit.tier)}</span>
          <span style={{
            fontSize: "6px", color: clanColor, letterSpacing: "1px",
            background: `${clanColor}18`, padding: "1px 4px", borderRadius: "3px",
          }}>
            {CLAN_LABELS[unit.clan]}
          </span>
        </div>
      </div>

      <p className="font-cinzel" style={{
        fontSize: isSm ? "6px" : "7px", letterSpacing: "1px", color: "var(--text)",
        marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {unit.name}
      </p>
      <p style={{ fontSize: "6px", color: "var(--muted)", marginBottom: isSm ? "3px" : "7px" }}>
        {ROLE_LABELS[unit.role]}
      </p>

      {!isSm && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px", marginBottom: "7px" }}>
            {([["HP", unit.hp, "#60c878"], ["ATK", unit.atk, "#e07860"],
               ["DEF", unit.def, "#6090e0"], ["VIT", unit.spd, "#d4b84a"]] as const).map(([l, v, c]) => (
              <div key={l} style={{
                display: "flex", justifyContent: "space-between",
                background: "rgba(255,255,255,0.03)", borderRadius: "2px", padding: "2px 4px",
              }}>
                <span style={{ fontSize: "6px", color: "var(--muted)" }}>{l}</span>
                <span style={{ fontSize: "7px", color: c, fontWeight: "bold" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{
            background: "rgba(255,255,255,0.03)", borderRadius: "4px",
            padding: "4px 5px", borderLeft: `2px solid ${clanColor}`,
          }}>
            <p className="font-cinzel" style={{ fontSize: "6px", color: clanColor, marginBottom: "2px", letterSpacing: "1px" }}>
              {unit.ability.name}
            </p>
            <p style={{ fontSize: "6px", color: "var(--muted)", lineHeight: 1.35 }}>
              {unit.ability.description}
            </p>
          </div>
        </>
      )}
    </motion.div>
  )
}

// ─── SYNERGY PANEL ────────────────────────────────────────────────────────────

function SynergyPanel({ synergies }: { synergies: ActiveSynergy[] }) {
  const active = synergies.filter(s => s.tier !== null)
  if (!active.length) return (
    <p style={{ fontSize: "7px", color: "rgba(255,255,255,0.15)", fontStyle: "italic", textAlign: "center" }}>
      aucune synergie active
    </p>
  )
  return (
    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", justifyContent: "center" }}>
      {active.map(s => {
        const c = CLAN_COLORS[s.clan] || "var(--gold)"
        return (
          <div key={s.clan} style={{
            background: `${c}14`, border: `1px solid ${c}40`,
            borderRadius: "4px", padding: "3px 7px",
            display: "flex", alignItems: "center", gap: "5px",
          }}>
            <span style={{ fontSize: "7px", color: c, letterSpacing: "1px" }}>
              {CLAN_LABELS[s.clan]} ×{s.count}
            </span>
            <span style={{ fontSize: "6px", color: "var(--muted)" }}>
              {s.def.tiers[s.tier!].label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── COMBAT LOG ───────────────────────────────────────────────────────────────

function CombatLogView({ log, visible }: { log: CombatLog[]; visible: number }) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [visible])

  const kindColors: Record<string, string> = {
    attack: "var(--text)", ability: "var(--gold)", heal: "#60c878",
    death: "#c05050", system: "var(--muted)", synergy: "#9060d0",
  }
  return (
    <div style={{
      height: "180px", overflowY: "auto", background: "rgba(0,0,0,0.45)",
      borderRadius: "6px", padding: "10px 12px",
      border: "1px solid rgba(255,255,255,0.06)",
    }}>
      {log.slice(0, visible).map((entry, i) => (
        <motion.p key={i}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            fontSize: "9px", color: kindColors[entry.kind] || "var(--text)",
            marginBottom: "4px", lineHeight: 1.45,
          }}
        >
          {entry.turn > 0 && (
            <span style={{ color: "rgba(255,255,255,0.18)", marginRight: "4px" }}>T{entry.turn}</span>
          )}
          {entry.text}
        </motion.p>
      ))}
      <div ref={endRef} />
    </div>
  )
}

// ─── ROUND TRACKER ────────────────────────────────────────────────────────────

function RoundTracker({ round, wins, losses }: { round: number; wins: number; losses: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {/* Round dots */}
      <div style={{ display: "flex", gap: "4px" }}>
        {Array.from({ length: 5 }).map((_, i) => {
          const active = i === round - 1
          const past   = i < round - 1
          return (
            <div key={i} style={{
              width: "7px", height: "7px", borderRadius: "50%",
              background: active ? "var(--gold)" : past ? "rgba(200,169,110,0.28)" : "rgba(255,255,255,0.07)",
              border: `1px solid ${active ? "var(--gold)" : "rgba(255,255,255,0.10)"}`,
              boxShadow: active ? "0 0 6px var(--gold)" : "none",
            }} />
          )
        })}
      </div>
      <span style={{ fontSize: "7px", color: "var(--muted)" }}>Manche {round}/5</span>
      <div style={{ width: "1px", height: "9px", background: "rgba(255,255,255,0.08)" }} />
      <div style={{ display: "flex", gap: "3px" }}>
        {Array.from({ length: WINS_NEEDED }).map((_, i) => (
          <div key={i} style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: i < wins ? "#60c878" : "rgba(255,255,255,0.05)",
            border: `1px solid ${i < wins ? "#60c878" : "rgba(255,255,255,0.08)"}`,
            boxShadow: i < wins ? "0 0 4px #60c87899" : "none",
          }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: "3px" }}>
        {Array.from({ length: WINS_NEEDED }).map((_, i) => (
          <div key={i} style={{
            width: "5px", height: "5px", borderRadius: "50%",
            background: i < losses ? "#c05050" : "rgba(255,255,255,0.04)",
            border: `1px solid ${i < losses ? "#c05050" : "rgba(255,255,255,0.07)"}`,
          }} />
        ))}
      </div>
    </div>
  )
}

// ─── USED POOL ────────────────────────────────────────────────────────────────

function usedPool(team: Unit[]) {
  // IDs already in team
  return team.map(u => u.id)
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

interface Props { onSolved: () => void; disabled: boolean }

export default function Mechanism3({ onSolved, disabled }: Props) {
  const { play, resume } = useAudio()

  const [phase, setPhase]         = useState<GamePhase>("intro")
  const [round, setRound]         = useState(1)
  const [wins, setWins]           = useState(0)
  const [losses, setLosses]       = useState(0)
  const [team, setTeam]           = useState<Unit[]>([])           // persistent roster
  const [offered, setOffered]     = useState<Unit[]>([])           // 4 draft cards
  const [picked, setPicked]       = useState<Unit[]>([])           // selected in draft (max 2)
  const [swapIn, setSwapIn]       = useState<Unit | null>(null)    // staged offered unit
  const [placement, setPlacement] = useState<Record<string, SlotPos>>({}) // unitId → slot
  const [combatLog, setCombatLog] = useState<CombatLog[]>([])
  const [logVisible, setLogVisible] = useState(0)
  const [roundWon, setRoundWon]   = useState(false)
  const [solved, setSolved]       = useState(false)

  // Derived
  const isSwapPhase  = phase === "draft" && team.length >= TEAM_MAX
  const teamSynergy  = getActiveSynergies(team)
  const placedSyn    = getActiveSynergies(team)

  // ── Animate combat log ─────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "combat") return
    if (logVisible >= combatLog.length) {
      setTimeout(() => {
        setPhase("round_result")
        if (roundWon) play("align")
        else play("fail")
      }, 700)
      return
    }
    const t = setTimeout(() => setLogVisible(v => v + 1), 310)
    return () => clearTimeout(t)
  }, [phase, logVisible, combatLog.length, roundWon, play])

  // ── Generate draft offers ──────────────────────────────────────────────
  const generateOffers = useCallback((currentTeam: Unit[]) => {
    const exclude = currentTeam  // don't offer what's in team
    const offers = getRandomUnits(ROSTER, exclude, 4)
    setOffered(offers)
    setPicked([])
    setSwapIn(null)
  }, [])

  // ── Start game ─────────────────────────────────────────────────────────
  function startGame() {
    resume()
    play("symbol")
    setRound(1); setWins(0); setLosses(0)
    setTeam([]); setPlacement({})
    const offers = getRandomUnits(ROSTER, [], 4)
    setOffered(offers)
    setPicked([])
    setSwapIn(null)
    setPhase("draft")
  }

  // ── Draft: pick unit (rounds 1-2, team < TEAM_MAX) ────────────────────
  function togglePick(unit: Unit) {
    resume()
    setPicked(prev => {
      if (prev.find(u => u.id === unit.id)) return prev.filter(u => u.id !== unit.id)
      if (prev.length >= 2) return prev  // max 2
      return [...prev, unit]
    })
    play("tick")
  }

  // ── Swap: select offered unit to swap in ──────────────────────────────
  function selectSwapIn(unit: Unit) {
    resume()
    setSwapIn(prev => prev?.id === unit.id ? null : unit)
    play("tick")
  }

  // ── Swap: select team unit to remove ─────────────────────────────────
  function performSwap(teamUnit: Unit) {
    if (!swapIn) return
    play("symbol")
    setTeam(prev => prev.map(u => u.id === teamUnit.id ? swapIn : u))
    setSwapIn(null)
  }

  // ── Confirm draft → placement ─────────────────────────────────────────
  function confirmDraft() {
    if (isSwapPhase) {
      // team already updated via performSwap calls, just go to placement
      setPhase("placement")
      play("symbol")
      return
    }
    if (picked.length !== 2) return
    const newTeam = [...team, ...picked]
    setTeam(newTeam)
    // Default placement: tanks/warriors → front, rest → back
    const defaultPlacement: Record<string, SlotPos> = {}
    for (const u of newTeam) {
      defaultPlacement[u.id] = (u.role === "tank" || u.role === "warrior") ? "front" : "back"
    }
    setPlacement(defaultPlacement)
    setPhase("placement")
    play("symbol")
  }

  // ── Toggle slot ───────────────────────────────────────────────────────
  function toggleSlot(unitId: string) {
    resume()
    setPlacement(prev => ({
      ...prev,
      [unitId]: prev[unitId] === "front" ? "back" : "front",
    }))
    play("tick")
  }

  // ── Engage combat ─────────────────────────────────────────────────────
  function engageCombat() {
    resume()
    play("warning")
    const enemyTeam = getEnemyTeam(round)
    const playerUnits = team.map(u => ({
      unit: u,
      slot: (placement[u.id] || "front") as SlotPos,
    }))
    const synergies = getActiveSynergies(team)
    const result = simulateCombat(playerUnits, enemyTeam, synergies)
    setCombatLog(result.log)
    setLogVisible(0)
    setRoundWon(result.winner === "player")
    setPhase("combat")
  }

  // ── Round result → next ───────────────────────────────────────────────
  function nextRound() {
    resume()
    const newWins   = roundWon ? wins + 1 : wins
    const newLosses = roundWon ? losses : losses + 1

    if (newWins >= WINS_NEEDED) {
      play("success")
      setSolved(true)
      setWins(newWins)
      setPhase("victory")
      setTimeout(() => onSolved(), 1800)
      return
    }
    if (newLosses >= WINS_NEEDED) {
      play("illusion")
      setLosses(newLosses)
      setPhase("game_over")
      return
    }

    setWins(newWins)
    setLosses(newLosses)
    const nextR = round + 1
    setRound(nextR)
    generateOffers(team)
    setPhase("draft")
    play("symbol")
  }

  // ── Restart ───────────────────────────────────────────────────────────
  function restart() {
    play("tick")
    setRound(1); setWins(0); setLosses(0)
    setTeam([]); setPlacement({})
    setPhase("intro")
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  const btn = (label: string, onClick: () => void, disabled_?: boolean, gold?: boolean) => (
    <button
      onClick={onClick}
      disabled={disabled_}
      className="font-cinzel"
      style={{
        padding: "8px 20px", borderRadius: "6px",
        border: `1px solid ${gold ? "var(--gold)" : "rgba(255,255,255,0.15)"}`,
        background: gold ? "rgba(200,169,110,0.08)" : "rgba(255,255,255,0.04)",
        color: gold ? "var(--gold)" : "var(--muted)",
        fontSize: "8px", letterSpacing: "2px", textTransform: "uppercase",
        cursor: disabled_ ? "default" : "pointer",
        opacity: disabled_ ? 0.4 : 1,
        transition: "all 0.2s",
      }}
    >{label}</button>
  )

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: "12px", width: "100%",
    }}>
      {/* Title */}
      <p className="font-cinzel" style={{
        color: "var(--gold-dark)", fontSize: "8px",
        letterSpacing: "4px", textTransform: "uppercase",
      }}>
        Brouillard de Kiri · 霧の守護
      </p>

      {/* Round tracker (hidden in intro) */}
      {phase !== "intro" && (
        <RoundTracker round={round} wins={wins} losses={losses} />
      )}

      <AnimatePresence mode="wait">

        {/* ── INTRO ────────────────────────────────────────────────────── */}
        {phase === "intro" && (
          <motion.div key="intro"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", maxWidth: "320px" }}
          >
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "28px", marginBottom: "8px" }}>霧</p>
              <p className="font-cormorant" style={{
                fontSize: "12px", color: "var(--muted)", fontStyle: "italic",
                lineHeight: 1.7, textAlign: "center",
              }}>
                La Garde du Brouillard protège les archives de Kirigakure.<br />
                Pour les traverser, tu dois affronter cinq vagues d'élite.<br />
                Choisis tes guerriers. Forme des synergies. Brise le brouillard.
              </p>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.03)", borderRadius: "8px",
              padding: "10px 14px", border: "1px solid rgba(255,255,255,0.07)",
              fontSize: "8px", color: "var(--muted)", lineHeight: 1.8, textAlign: "left",
            }}>
              <p style={{ color: "var(--gold-dark)", marginBottom: "4px" }} className="font-cinzel">Règles</p>
              <p>· Pioche 2 guerriers parmi 4 proposés chaque manche</p>
              <p>· Positionne-les : Avant (bonus défense) / Arrière (bonus pouvoir)</p>
              <p>· Aligne les clans pour activer des synergies</p>
              <p>· Gagne 3 manches sur 5 pour briser le sceau</p>
            </div>
            {btn("Entrer dans le Brouillard", startGame, false, true)}
          </motion.div>
        )}

        {/* ── DRAFT ────────────────────────────────────────────────────── */}
        {phase === "draft" && (
          <motion.div key="draft"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", width: "100%" }}
          >
            {/* Round info */}
            <div style={{ textAlign: "center" }}>
              <p className="font-cinzel" style={{ fontSize: "9px", color: "var(--gold)", letterSpacing: "2px" }}>
                {ROUND_NAMES[round]}
              </p>
              <p style={{ fontSize: "9px", color: "var(--muted)", fontStyle: "italic" }}>
                {ROUND_FLAVORS[round]}
              </p>
            </div>

            {/* Current team (shown when swapping) */}
            {isSwapPhase && team.length > 0 && (
              <div style={{ width: "100%" }}>
                <p className="font-cinzel" style={{ fontSize: "7px", color: "var(--muted)", letterSpacing: "2px", marginBottom: "8px", textAlign: "center", textTransform: "uppercase" }}>
                  Ton équipe — clique pour remplacer
                </p>
                <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                  {team.map(u => (
                    <UnitCard
                      key={u.id}
                      unit={u}
                      size="sm"
                      dim={!!swapIn && swapIn.id !== u.id}
                      onClick={swapIn ? () => performSwap(u) : undefined}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Offered units */}
            <div style={{ width: "100%" }}>
              <p className="font-cinzel" style={{
                fontSize: "7px", color: "var(--muted)", letterSpacing: "2px",
                marginBottom: "8px", textAlign: "center", textTransform: "uppercase",
              }}>
                {isSwapPhase
                  ? (swapIn ? "Sélectionne un guerrier à remplacer ci-dessus" : "Sélectionne un guerrier à intégrer")
                  : `Choisis 2 guerriers (${picked.length}/2)`
                }
              </p>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                {offered.map(u => (
                  <UnitCard
                    key={u.id}
                    unit={u}
                    selected={isSwapPhase ? swapIn?.id === u.id : !!picked.find(p => p.id === u.id)}
                    dim={isSwapPhase
                      ? (swapIn !== null && swapIn.id !== u.id)
                      : (picked.length >= 2 && !picked.find(p => p.id === u.id))
                    }
                    onClick={() => isSwapPhase ? selectSwapIn(u) : togglePick(u)}
                  />
                ))}
              </div>
            </div>

            {/* Synergy preview */}
            <div style={{ width: "100%", maxWidth: "340px" }}>
              <p className="font-cinzel" style={{ fontSize: "6px", color: "var(--muted)", letterSpacing: "2px", textAlign: "center", marginBottom: "6px", textTransform: "uppercase" }}>
                Synergies actives
              </p>
              <SynergyPanel synergies={teamSynergy} />
            </div>

            {/* Confirm */}
            <div style={{ display: "flex", gap: "10px" }}>
              {isSwapPhase && btn("Passer", confirmDraft)}
              {btn(
                isSwapPhase ? "Valider l'équipe" : "Recruter",
                confirmDraft,
                isSwapPhase ? false : picked.length !== 2,
                true
              )}
            </div>
          </motion.div>
        )}

        {/* ── PLACEMENT ────────────────────────────────────────────────── */}
        {phase === "placement" && (
          <motion.div key="placement"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", width: "100%" }}
          >
            <p className="font-cinzel" style={{ fontSize: "8px", color: "var(--muted)", letterSpacing: "2px", textTransform: "uppercase" }}>
              Formation — clique pour changer de position
            </p>

            {/* Placement grid */}
            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
              {(["front", "back"] as SlotPos[]).map(slot => {
                const label = slot === "front" ? "AVANT" : "ARRIÈRE"
                const desc = slot === "front" ? "Gardien +22% DEF · Guerrier +10% ATK" : "Mage/Soutien +16% ATK · Scout/Assassin +12% ATK"
                return (
                  <div key={slot} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <div style={{ textAlign: "center" }}>
                      <p className="font-cinzel" style={{ fontSize: "7px", color: "var(--gold)", letterSpacing: "2px" }}>{label}</p>
                      <p style={{ fontSize: "6px", color: "rgba(255,255,255,0.3)", maxWidth: "160px", textAlign: "center", lineHeight: 1.4 }}>{desc}</p>
                    </div>
                    {team.filter(u => (placement[u.id] || "front") === slot).map(u => (
                      <UnitCard
                        key={u.id}
                        unit={u}
                        size="sm"
                        slotLabel={label}
                        onClick={() => toggleSlot(u.id)}
                      />
                    ))}
                    {team.filter(u => (placement[u.id] || "front") === slot).length === 0 && (
                      <div style={{
                        width: "116px", height: "80px", border: "1px dashed rgba(255,255,255,0.08)",
                        borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.15)" }}>vide</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Synergy */}
            <div style={{ maxWidth: "340px", width: "100%" }}>
              <SynergyPanel synergies={placedSyn} />
            </div>

            {/* Enemy preview */}
            <div style={{
              background: "rgba(192,64,64,0.06)", border: "1px solid rgba(192,64,64,0.15)",
              borderRadius: "6px", padding: "8px 14px", textAlign: "center",
            }}>
              <p className="font-cinzel" style={{ fontSize: "7px", color: "#c05050", letterSpacing: "2px", marginBottom: "4px" }}>
                {ROUND_NAMES[round]}
              </p>
              <p style={{ fontSize: "8px", color: "var(--muted)", fontStyle: "italic" }}>
                {getEnemyTeam(round).map(e => e.unit.name).join("  ·  ")}
              </p>
            </div>

            {btn("Engager le combat", engageCombat, false, true)}
          </motion.div>
        )}

        {/* ── COMBAT ───────────────────────────────────────────────────── */}
        {phase === "combat" && (
          <motion.div key="combat"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%" }}
          >
            <p className="font-cinzel" style={{ fontSize: "8px", color: "#c05050", letterSpacing: "3px", textTransform: "uppercase" }}>
              Combat en cours…
            </p>

            {/* Team vs Enemy header */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
              <div style={{ display: "flex", gap: "4px" }}>
                {team.map(u => (
                  <div key={u.id} style={{
                    background: "rgba(96,200,120,0.08)", border: "1px solid rgba(96,200,120,0.25)",
                    borderRadius: "4px", padding: "3px 6px", fontSize: "8px", color: "#60c878",
                  }}>{u.kanji}</div>
                ))}
              </div>
              <span style={{ color: "var(--muted)", fontSize: "10px" }}>⚔</span>
              <div style={{ display: "flex", gap: "4px" }}>
                {getEnemyTeam(round).map(e => (
                  <div key={e.unit.id} style={{
                    background: "rgba(192,80,80,0.08)", border: "1px solid rgba(192,80,80,0.25)",
                    borderRadius: "4px", padding: "3px 6px", fontSize: "8px", color: "#c05050",
                  }}>{e.unit.kanji}</div>
                ))}
              </div>
            </div>

            <CombatLogView log={combatLog} visible={logVisible} />

            <p style={{ fontSize: "9px", color: "var(--muted)", fontStyle: "italic" }}>
              {logVisible < combatLog.length
                ? `Tour ${combatLog[logVisible]?.turn || "…"}`
                : "Calcul du résultat…"
              }
            </p>
          </motion.div>
        )}

        {/* ── ROUND RESULT ─────────────────────────────────────────────── */}
        {phase === "round_result" && (
          <motion.div key="round_result"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}
          >
            <div style={{
              background: roundWon ? "rgba(96,200,120,0.06)" : "rgba(192,80,80,0.06)",
              border: `1px solid ${roundWon ? "rgba(96,200,120,0.25)" : "rgba(192,80,80,0.25)"}`,
              borderRadius: "10px", padding: "20px 28px", textAlign: "center",
            }}>
              <p style={{ fontSize: "32px", marginBottom: "8px" }}>
                {roundWon ? "勝" : "敗"}
              </p>
              <p className="font-cinzel" style={{
                fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase",
                color: roundWon ? "#60c878" : "#c05050",
              }}>
                {roundWon ? "Victoire" : "Défaite"}
              </p>
              <p style={{ fontSize: "9px", color: "var(--muted)", marginTop: "8px", fontStyle: "italic" }}>
                {roundWon
                  ? "Tu avances dans le brouillard."
                  : "Le brouillard reprend ses droits."}
              </p>
            </div>

            {round < 5 && (
              <p style={{ fontSize: "8px", color: "var(--muted)" }}>
                Manche {round + 1} — {ROUND_NAMES[round + 1] || "Finale"}
              </p>
            )}

            {btn(
              round >= 5 ? "Voir le résultat" : "Manche suivante",
              nextRound, false, roundWon
            )}
          </motion.div>
        )}

        {/* ── GAME OVER ────────────────────────────────────────────────── */}
        {phase === "game_over" && (
          <motion.div key="game_over"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}
          >
            <p style={{ fontSize: "36px" }}>霧</p>
            <p className="font-cinzel" style={{ fontSize: "10px", color: "#c05050", letterSpacing: "3px", textTransform: "uppercase" }}>
              Submergé par le Brouillard
            </p>
            <p className="font-cormorant" style={{
              fontSize: "11px", color: "var(--muted)", fontStyle: "italic",
              textAlign: "center", maxWidth: "260px", lineHeight: 1.7,
            }}>
              La Garde du Brouillard repousse ton intrusion.<br />
              Forme des synergies plus puissantes et recommence.
            </p>
            {btn("Recommencer", restart, false, false)}
          </motion.div>
        )}

        {/* ── VICTORY ──────────────────────────────────────────────────── */}
        {phase === "victory" && (
          <motion.div key="victory"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}
          >
            <motion.p
              animate={{ textShadow: ["0 0 20px rgba(200,169,110,0.6)", "0 0 40px rgba(200,169,110,0.95)", "0 0 20px rgba(200,169,110,0.6)"] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ fontSize: "40px" }}
            >天</motion.p>
            <p className="font-cinzel" style={{ fontSize: "10px", color: "var(--gold)", letterSpacing: "3px", textTransform: "uppercase" }}>
              Le Brouillard se dissipe
            </p>
            <p className="font-cormorant" style={{
              fontSize: "12px", color: "var(--muted)", fontStyle: "italic",
              textAlign: "center", maxWidth: "260px", lineHeight: 1.7,
            }}>
              Tu as traversé la Garde du Brouillard.<br />
              Les archives de Kirigakure s'ouvrent devant toi.
            </p>
            <p style={{ fontSize: "9px", color: "rgba(200,169,110,0.5)" }}>
              Chargement du carnet…
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
