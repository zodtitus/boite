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
}

function UnitCard({ unit, selected, dim, onClick, size = "md", slotLabel }: UnitCardProps) {
  const isSm = size === "sm"
  const cc = CLAN_COLORS[unit.clan] || "var(--gold)"
  const tc = unit.tier === 3 ? "var(--gold)" : unit.tier === 2 ? "#9988cc" : "var(--muted)"

  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { scale: 1.03, y: -2 } : {}}
      whileTap={onClick ? { scale: 0.97 } : {}}
      style={{
        position: "relative",
        background: selected ? `${cc}18` : "rgba(255,255,255,0.025)",
        border: `1px solid ${selected ? cc : dim ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.10)"}`,
        borderRadius: "10px",
        padding: isSm ? "10px 12px" : "14px 14px",
        cursor: onClick ? "pointer" : "default",
        opacity: dim ? 0.35 : 1,
        transition: "all 0.2s",
        flexShrink: 0,
        boxShadow: selected ? `0 0 18px ${cc}40` : "none",
        width: isSm ? "148px" : "186px",
      }}
    >
      {selected && (
        <div style={{
          position: "absolute", top: "7px", right: "7px",
          width: "15px", height: "15px", borderRadius: "50%",
          background: cc, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "9px", color: "#000", fontWeight: "bold",
        }}>✓</div>
      )}
      {slotLabel && (
        <div style={{
          position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)",
          background: "var(--bg3)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "4px", padding: "1px 7px",
          fontSize: "8px", letterSpacing: "1px", color: "var(--muted)", textTransform: "uppercase",
        }}>{slotLabel}</div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "7px" }}>
        <span style={{ fontSize: isSm ? "22px" : "30px", lineHeight: 1 }}>{unit.kanji}</span>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px" }}>
          <span style={{ fontSize: "8px", color: tc, letterSpacing: "1px" }}>
            {"◆".repeat(unit.tier)}
          </span>
          <span style={{
            fontSize: "7px", color: cc, letterSpacing: "1px",
            background: `${cc}20`, padding: "2px 5px", borderRadius: "3px",
          }}>
            {CLAN_LABELS[unit.clan]}
          </span>
        </div>
      </div>

      {/* Name */}
      <p className="font-cinzel" style={{
        fontSize: isSm ? "7px" : "8px", letterSpacing: "1px", color: "var(--text)",
        marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {unit.name}
      </p>

      {/* Role */}
      <p style={{ fontSize: "7px", color: "var(--muted)", marginBottom: isSm ? "4px" : "9px" }}>
        {ROLE_LABELS[unit.role]}
      </p>

      {/* Stats */}
      {!isSm && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px", marginBottom: "9px" }}>
          {([
            ["HP", unit.hp, "#60c878"],
            ["ATK", unit.atk, "#e07860"],
            ["DEF", unit.def, "#6090e0"],
            ["VIT", unit.spd, "#d4b84a"],
          ] as const).map(([l, v, c]) => (
            <div key={l} style={{
              display: "flex", justifyContent: "space-between",
              background: "rgba(255,255,255,0.035)", borderRadius: "3px", padding: "3px 5px",
            }}>
              <span style={{ fontSize: "7px", color: "var(--muted)" }}>{l}</span>
              <span style={{ fontSize: "8px", color: c, fontWeight: "bold" }}>{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Ability */}
      {!isSm && (
        <div style={{
          background: "rgba(255,255,255,0.035)", borderRadius: "5px",
          padding: "6px 7px", borderLeft: `2px solid ${cc}`,
        }}>
          <p className="font-cinzel" style={{ fontSize: "7px", color: cc, marginBottom: "3px", letterSpacing: "1px" }}>
            {unit.ability.name}
          </p>
          <p style={{ fontSize: "7px", color: "var(--muted)", lineHeight: 1.45 }}>
            {unit.ability.description}
          </p>
        </div>
      )}
    </motion.div>
  )
}

// ─── SYNERGY PANEL ────────────────────────────────────────────────────────────

function SynergyPanel({ synergies }: { synergies: ActiveSynergy[] }) {
  const active = synergies.filter(s => s.tier !== null)
  if (!active.length) return (
    <p style={{ fontSize: "8px", color: "rgba(255,255,255,0.14)", fontStyle: "italic", textAlign: "center" }}>
      aucune synergie active
    </p>
  )
  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
      {active.map(s => {
        const c = CLAN_COLORS[s.clan] || "var(--gold)"
        return (
          <div key={s.clan} style={{
            background: `${c}16`, border: `1px solid ${c}44`,
            borderRadius: "5px", padding: "4px 9px",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            <span style={{ fontSize: "8px", color: c, letterSpacing: "1px" }}>
              {CLAN_LABELS[s.clan]} ×{s.count}
            </span>
            <span style={{ fontSize: "7px", color: "var(--muted)" }}>
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
      height: "240px", overflowY: "auto", background: "rgba(0,0,0,0.50)",
      borderRadius: "8px", padding: "12px 14px",
      border: "1px solid rgba(255,255,255,0.07)",
    }}>
      {log.slice(0, visible).map((entry, i) => (
        <motion.p key={i}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            fontSize: "11px", color: kindColors[entry.kind] || "var(--text)",
            marginBottom: "5px", lineHeight: 1.5,
          }}
        >
          {entry.turn > 0 && (
            <span style={{ color: "rgba(255,255,255,0.20)", marginRight: "5px", fontSize: "9px" }}>T{entry.turn}</span>
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
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ display: "flex", gap: "5px" }}>
        {Array.from({ length: 5 }).map((_, i) => {
          const active = i === round - 1, past = i < round - 1
          return (
            <div key={i} style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: active ? "var(--gold)" : past ? "rgba(200,169,110,0.28)" : "rgba(255,255,255,0.07)",
              border: `1px solid ${active ? "var(--gold)" : "rgba(255,255,255,0.10)"}`,
              boxShadow: active ? "0 0 7px var(--gold)" : "none",
            }} />
          )
        })}
      </div>
      <span style={{ fontSize: "8px", color: "var(--muted)" }}>Manche {round}/5</span>
      <div style={{ width: "1px", height: "10px", background: "rgba(255,255,255,0.08)" }} />
      <div style={{ display: "flex", gap: "4px" }}>
        {Array.from({ length: WINS_NEEDED }).map((_, i) => (
          <div key={i} style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: i < wins ? "#60c878" : "rgba(255,255,255,0.05)",
            border: `1px solid ${i < wins ? "#60c878" : "rgba(255,255,255,0.08)"}`,
            boxShadow: i < wins ? "0 0 5px #60c87899" : "none",
          }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: "4px" }}>
        {Array.from({ length: WINS_NEEDED }).map((_, i) => (
          <div key={i} style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: i < losses ? "#c05050" : "rgba(255,255,255,0.04)",
            border: `1px solid ${i < losses ? "#c05050" : "rgba(255,255,255,0.07)"}`,
          }} />
        ))}
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

interface Props { onSolved: () => void; disabled: boolean }

export default function Mechanism3({ onSolved, disabled }: Props) {
  const { play, resume } = useAudio()

  const [phase, setPhase]           = useState<GamePhase>("intro")
  const [round, setRound]           = useState(1)
  const [wins, setWins]             = useState(0)
  const [losses, setLosses]         = useState(0)
  const [team, setTeam]             = useState<Unit[]>([])
  const [offered, setOffered]       = useState<Unit[]>([])
  const [picked, setPicked]         = useState<Unit[]>([])
  const [swapIn, setSwapIn]         = useState<Unit | null>(null)
  const [placement, setPlacement]   = useState<Record<string, SlotPos>>({})
  const [combatLog, setCombatLog]   = useState<CombatLog[]>([])
  const [logVisible, setLogVisible] = useState(0)
  const [roundWon, setRoundWon]     = useState(false)

  const isSwapPhase = phase === "draft" && team.length >= TEAM_MAX
  const teamSynergy = getActiveSynergies(team)

  // ── Animate combat log ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "combat") return
    if (logVisible >= combatLog.length) {
      setTimeout(() => {
        setPhase("round_result")
        if (roundWon) play("align"); else play("fail")
      }, 700)
      return
    }
    const t = setTimeout(() => setLogVisible(v => v + 1), 310)
    return () => clearTimeout(t)
  }, [phase, logVisible, combatLog.length, roundWon, play])

  const generateOffers = useCallback((currentTeam: Unit[]) => {
    setOffered(getRandomUnits(ROSTER, currentTeam, 4))
    setPicked([]); setSwapIn(null)
  }, [])

  function startGame() {
    resume(); play("symbol")
    setRound(1); setWins(0); setLosses(0)
    setTeam([]); setPlacement({})
    setOffered(getRandomUnits(ROSTER, [], 4))
    setPicked([]); setSwapIn(null)
    setPhase("draft")
  }

  function togglePick(unit: Unit) {
    resume(); play("tick")
    setPicked(prev =>
      prev.find(u => u.id === unit.id)
        ? prev.filter(u => u.id !== unit.id)
        : prev.length >= 2 ? prev : [...prev, unit]
    )
  }

  function selectSwapIn(unit: Unit) {
    resume(); play("tick")
    setSwapIn(prev => prev?.id === unit.id ? null : unit)
  }

  function performSwap(teamUnit: Unit) {
    if (!swapIn) return
    play("symbol")
    setTeam(prev => prev.map(u => u.id === teamUnit.id ? swapIn! : u))
    setSwapIn(null)
  }

  function confirmDraft() {
    if (isSwapPhase) {
      // default placement for any new members from swaps
      const newPlacement: Record<string, SlotPos> = { ...placement }
      for (const u of team) {
        if (!newPlacement[u.id])
          newPlacement[u.id] = (u.role === "tank" || u.role === "warrior") ? "front" : "back"
      }
      setPlacement(newPlacement)
      setPhase("placement"); play("symbol"); return
    }
    if (picked.length !== 2) return
    const newTeam = [...team, ...picked]
    setTeam(newTeam)
    const pl: Record<string, SlotPos> = { ...placement }
    for (const u of picked) pl[u.id] = (u.role === "tank" || u.role === "warrior") ? "front" : "back"
    setPlacement(pl)
    setPhase("placement"); play("symbol")
  }

  function toggleSlot(unitId: string) {
    resume(); play("tick")
    setPlacement(prev => ({ ...prev, [unitId]: prev[unitId] === "front" ? "back" : "front" }))
  }

  function engageCombat() {
    resume(); play("warning")
    const enemyTeam = getEnemyTeam(round)
    const playerUnits = team.map(u => ({ unit: u, slot: (placement[u.id] || "front") as SlotPos }))
    const result = simulateCombat(playerUnits, enemyTeam, getActiveSynergies(team))
    setCombatLog(result.log)
    setLogVisible(0)
    setRoundWon(result.winner === "player")
    setPhase("combat")
  }

  function nextRound() {
    resume()
    const newWins   = roundWon ? wins + 1 : wins
    const newLosses = roundWon ? losses : losses + 1

    if (newWins >= WINS_NEEDED) {
      play("success"); setWins(newWins); setPhase("victory")
      setTimeout(() => onSolved(), 1800); return
    }
    if (newLosses >= WINS_NEEDED) {
      play("illusion"); setLosses(newLosses); setPhase("game_over"); return
    }

    setWins(newWins); setLosses(newLosses)
    const nextR = round + 1
    setRound(nextR)
    generateOffers(team)
    setPhase("draft"); play("symbol")
  }

  function restart() {
    play("tick"); setPhase("intro")
    setRound(1); setWins(0); setLosses(0); setTeam([]); setPlacement({})
  }

  // ── Shared button style ────────────────────────────────────────────────────
  const Btn = ({ label, onClick, disabled: dis, gold }: {
    label: string; onClick: () => void; disabled?: boolean; gold?: boolean
  }) => (
    <button
      onClick={onClick} disabled={dis}
      className="font-cinzel"
      style={{
        padding: "9px 22px", borderRadius: "7px",
        border: `1px solid ${gold ? "var(--gold)" : "rgba(255,255,255,0.15)"}`,
        background: gold ? "rgba(200,169,110,0.08)" : "rgba(255,255,255,0.04)",
        color: gold ? "var(--gold)" : "var(--muted)",
        fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase",
        cursor: dis ? "default" : "pointer", opacity: dis ? 0.4 : 1,
        transition: "all 0.2s",
      }}
    >{label}</button>
  )

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: "16px",
      width: "100%", maxWidth: "640px", margin: "0 auto",
    }}>
      {/* Title */}
      <p className="font-cinzel" style={{
        color: "var(--gold-dark)", fontSize: "9px",
        letterSpacing: "4px", textTransform: "uppercase",
      }}>
        Brouillard de Kiri · 霧の守護
      </p>

      {/* Round tracker */}
      {phase !== "intro" && <RoundTracker round={round} wins={wins} losses={losses} />}

      <AnimatePresence mode="wait">

        {/* ── INTRO ──────────────────────────────────────────────────────────── */}
        {phase === "intro" && (
          <motion.div key="intro"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.5 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px", maxWidth: "400px" }}
          >
            <p style={{ fontSize: "40px" }}>霧</p>
            <p className="font-cormorant" style={{
              fontSize: "13px", color: "var(--muted)", fontStyle: "italic",
              lineHeight: 1.75, textAlign: "center",
            }}>
              La Garde du Brouillard protège les archives de Kirigakure.<br />
              Pour les traverser, tu dois affronter cinq vagues d'élite.<br />
              Choisis tes guerriers. Forme des synergies. Brise la Brume.
            </p>
            <div style={{
              background: "rgba(255,255,255,0.03)", borderRadius: "8px",
              padding: "12px 16px", border: "1px solid rgba(255,255,255,0.07)",
              fontSize: "9px", color: "var(--muted)", lineHeight: 1.9,
            }}>
              <p style={{ color: "var(--gold-dark)", marginBottom: "5px" }} className="font-cinzel">Règles</p>
              <p>· Pioche 2 guerriers parmi 4 proposés chaque manche</p>
              <p>· Assigne-les : Avant (bonus Gardien/Lame) · Arrière (bonus Maître/Ombre)</p>
              <p>· Aligne les clans (Hōzuki · Yokushin · Kama · Pav. Noir…) pour des synergies</p>
              <p>· Gagne 3 manches sur 5 pour briser le sceau</p>
            </div>
            <Btn label="Entrer dans le Brouillard" onClick={startGame} gold />
          </motion.div>
        )}

        {/* ── DRAFT ──────────────────────────────────────────────────────────── */}
        {phase === "draft" && (
          <motion.div key="draft"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: "100%" }}
          >
            {/* Round info */}
            <div style={{ textAlign: "center" }}>
              <p className="font-cinzel" style={{ fontSize: "10px", color: "var(--gold)", letterSpacing: "2px" }}>
                {ROUND_NAMES[round]}
              </p>
              <p style={{ fontSize: "10px", color: "var(--muted)", fontStyle: "italic", marginTop: "3px" }}>
                {ROUND_FLAVORS[round]}
              </p>
            </div>

            {/* Current team (swap phase) */}
            {isSwapPhase && (
              <div style={{ width: "100%" }}>
                <p className="font-cinzel" style={{
                  fontSize: "8px", color: "var(--muted)", letterSpacing: "2px",
                  marginBottom: "10px", textAlign: "center", textTransform: "uppercase",
                }}>
                  {swapIn ? "Choisis le guerrier à remplacer ↓" : "Ton équipe — sélectionne un remplacement ci-dessous"}
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                  {team.map(u => (
                    <UnitCard
                      key={u.id} unit={u} size="sm"
                      dim={!swapIn}
                      selected={!!swapIn}
                      onClick={swapIn ? () => performSwap(u) : undefined}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Offered units */}
            <div style={{ width: "100%" }}>
              <p className="font-cinzel" style={{
                fontSize: "8px", color: "var(--muted)", letterSpacing: "2px",
                marginBottom: "10px", textAlign: "center", textTransform: "uppercase",
              }}>
                {isSwapPhase
                  ? (swapIn ? `↑ Clique un membre de ton équipe pour le remplacer par ${swapIn.name}` : "Sélectionne un guerrier à intégrer")
                  : `Recrues disponibles — Choisis 2 guerriers (${picked.length}/2)`}
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                {offered.map(u => (
                  <UnitCard
                    key={u.id} unit={u}
                    selected={isSwapPhase ? swapIn?.id === u.id : !!picked.find(p => p.id === u.id)}
                    dim={isSwapPhase
                      ? (swapIn !== null && swapIn.id !== u.id)
                      : (picked.length >= 2 && !picked.find(p => p.id === u.id))}
                    onClick={() => isSwapPhase ? selectSwapIn(u) : togglePick(u)}
                  />
                ))}
              </div>
            </div>

            {/* Synergy preview */}
            <div style={{ width: "100%", maxWidth: "500px" }}>
              <p className="font-cinzel" style={{
                fontSize: "7px", color: "var(--muted)", letterSpacing: "2px",
                textAlign: "center", marginBottom: "7px", textTransform: "uppercase",
              }}>Synergies actives</p>
              <SynergyPanel synergies={teamSynergy} />
            </div>

            {/* Confirm */}
            <div style={{ display: "flex", gap: "12px" }}>
              {isSwapPhase && <Btn label="Passer" onClick={confirmDraft} />}
              <Btn
                label={isSwapPhase ? "Valider l'équipe" : "Recruter"}
                onClick={confirmDraft}
                disabled={isSwapPhase ? false : picked.length !== 2}
                gold
              />
            </div>
          </motion.div>
        )}

        {/* ── PLACEMENT ──────────────────────────────────────────────────────── */}
        {phase === "placement" && (
          <motion.div key="placement"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: "100%" }}
          >
            <p className="font-cinzel" style={{
              fontSize: "9px", color: "var(--muted)", letterSpacing: "2px", textTransform: "uppercase",
            }}>
              Formation — clique pour changer de position
            </p>

            {/* Placement columns */}
            <div style={{ display: "flex", gap: "24px", justifyContent: "center", width: "100%" }}>
              {(["front", "back"] as SlotPos[]).map(slot => {
                const label = slot === "front" ? "AVANT" : "ARRIÈRE"
                const desc  = slot === "front"
                  ? "Gardien +22% DEF · Lame +10% ATK"
                  : "Maître/Soutien +16% ATK · Ombre/Éclaireur +12% ATK"
                const slotUnits = team.filter(u => (placement[u.id] || "front") === slot)
                return (
                  <div key={slot} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", minWidth: "196px" }}>
                    <div style={{ textAlign: "center" }}>
                      <p className="font-cinzel" style={{ fontSize: "8px", color: "var(--gold)", letterSpacing: "2px" }}>{label}</p>
                      <p style={{ fontSize: "7px", color: "rgba(255,255,255,0.28)", lineHeight: 1.5, maxWidth: "190px", textAlign: "center" }}>{desc}</p>
                    </div>
                    {slotUnits.map(u => (
                      <UnitCard key={u.id} unit={u} size="sm" slotLabel={label} onClick={() => toggleSlot(u.id)} />
                    ))}
                    {slotUnits.length === 0 && (
                      <div style={{
                        width: "148px", height: "90px",
                        border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "10px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.14)" }}>vide</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Synergies */}
            <div style={{ maxWidth: "500px", width: "100%" }}>
              <SynergyPanel synergies={teamSynergy} />
            </div>

            {/* Enemy preview */}
            <div style={{
              background: "rgba(192,64,64,0.06)", border: "1px solid rgba(192,64,64,0.16)",
              borderRadius: "7px", padding: "10px 16px", textAlign: "center",
            }}>
              <p className="font-cinzel" style={{ fontSize: "8px", color: "#c05050", letterSpacing: "2px", marginBottom: "5px" }}>
                {ROUND_NAMES[round]}
              </p>
              <p style={{ fontSize: "9px", color: "var(--muted)", fontStyle: "italic" }}>
                {getEnemyTeam(round).map(e => e.unit.name).join("  ·  ")}
              </p>
            </div>

            <Btn label="Engager le combat" onClick={engageCombat} gold />
          </motion.div>
        )}

        {/* ── COMBAT ─────────────────────────────────────────────────────────── */}
        {phase === "combat" && (
          <motion.div key="combat"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", width: "100%" }}
          >
            <p className="font-cinzel" style={{ fontSize: "9px", color: "#c05050", letterSpacing: "3px", textTransform: "uppercase" }}>
              Combat en cours…
            </p>

            {/* Team vs Enemy */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", justifyContent: "center" }}>
                {team.map(u => (
                  <div key={u.id} style={{
                    background: "rgba(96,200,120,0.08)", border: "1px solid rgba(96,200,120,0.25)",
                    borderRadius: "5px", padding: "4px 8px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "1px",
                  }}>
                    <span style={{ fontSize: "14px" }}>{u.kanji}</span>
                    <span style={{ fontSize: "7px", color: "#60c878" }}>{u.name.split(" ")[0]}</span>
                  </div>
                ))}
              </div>
              <span style={{ color: "var(--muted)", fontSize: "16px" }}>⚔</span>
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", justifyContent: "center" }}>
                {getEnemyTeam(round).map(e => (
                  <div key={e.unit.id} style={{
                    background: "rgba(192,80,80,0.08)", border: "1px solid rgba(192,80,80,0.25)",
                    borderRadius: "5px", padding: "4px 8px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "1px",
                  }}>
                    <span style={{ fontSize: "14px" }}>{e.unit.kanji}</span>
                    <span style={{ fontSize: "7px", color: "#c05050" }}>{e.unit.name.split(" ")[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            <CombatLogView log={combatLog} visible={logVisible} />

            <p style={{ fontSize: "10px", color: "var(--muted)", fontStyle: "italic" }}>
              {logVisible < combatLog.length
                ? `Tour ${combatLog[logVisible]?.turn || "…"}`
                : "Calcul du résultat…"
              }
            </p>
          </motion.div>
        )}

        {/* ── ROUND RESULT ───────────────────────────────────────────────────── */}
        {phase === "round_result" && (
          <motion.div key="round_result"
            initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.93 }} transition={{ duration: 0.4 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}
          >
            <div style={{
              background: roundWon ? "rgba(96,200,120,0.07)" : "rgba(192,80,80,0.07)",
              border: `1px solid ${roundWon ? "rgba(96,200,120,0.28)" : "rgba(192,80,80,0.28)"}`,
              borderRadius: "12px", padding: "24px 36px", textAlign: "center",
            }}>
              <p style={{ fontSize: "40px", marginBottom: "10px" }}>{roundWon ? "勝" : "敗"}</p>
              <p className="font-cinzel" style={{
                fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase",
                color: roundWon ? "#60c878" : "#c05050",
              }}>
                {roundWon ? "Victoire" : "Défaite"}
              </p>
              <p style={{ fontSize: "10px", color: "var(--muted)", marginTop: "10px", fontStyle: "italic" }}>
                {roundWon ? "Tu avances dans le brouillard." : "Le brouillard reprend ses droits."}
              </p>
            </div>

            {round < 5 && (
              <p style={{ fontSize: "9px", color: "var(--muted)" }}>
                Prochaine manche — {ROUND_NAMES[round + 1] || "Finale"}
              </p>
            )}
            <Btn
              label={round >= 5 ? "Voir le résultat final" : "Manche suivante →"}
              onClick={nextRound}
              gold={roundWon}
            />
          </motion.div>
        )}

        {/* ── GAME OVER ──────────────────────────────────────────────────────── */}
        {phase === "game_over" && (
          <motion.div key="game_over"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.5 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}
          >
            <p style={{ fontSize: "44px" }}>霧</p>
            <p className="font-cinzel" style={{ fontSize: "11px", color: "#c05050", letterSpacing: "3px", textTransform: "uppercase" }}>
              Submergé par le Brouillard
            </p>
            <p className="font-cormorant" style={{
              fontSize: "12px", color: "var(--muted)", fontStyle: "italic",
              textAlign: "center", maxWidth: "280px", lineHeight: 1.75,
            }}>
              La Garde du Brouillard repousse ton intrusion.<br />
              Forme des synergies plus puissantes et recommence.
            </p>
            <Btn label="Recommencer" onClick={restart} />
          </motion.div>
        )}

        {/* ── VICTORY ────────────────────────────────────────────────────────── */}
        {phase === "victory" && (
          <motion.div key="victory"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}
          >
            <motion.p
              animate={{ textShadow: ["0 0 20px rgba(200,169,110,0.5)", "0 0 50px rgba(200,169,110,1)", "0 0 20px rgba(200,169,110,0.5)"] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ fontSize: "48px" }}
            >天</motion.p>
            <p className="font-cinzel" style={{ fontSize: "11px", color: "var(--gold)", letterSpacing: "3px", textTransform: "uppercase" }}>
              Le Brouillard se dissipe
            </p>
            <p className="font-cormorant" style={{
              fontSize: "13px", color: "var(--muted)", fontStyle: "italic",
              textAlign: "center", maxWidth: "300px", lineHeight: 1.75,
            }}>
              Tu as traversé la Garde du Brouillard.<br />
              Les archives de Kirigakure s'ouvrent devant toi.
            </p>
            <p style={{ fontSize: "9px", color: "rgba(200,169,110,0.45)" }}>
              Chargement du carnet…
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
