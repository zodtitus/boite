import type { Unit, CombatState, CombatAction, PieceState, RoundResult, ActiveSynergy, SlotPos, ActionType } from "@/types/enigme3"
import { SYNERGIES } from "./data"

let _actionIdx = 0
function nextId() { return `a${++_actionIdx}` }

function rng(min: number, max: number) { return min + Math.random() * (max - min) }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }

function getEffects(synergies: ActiveSynergy[]) {
  const out = {
    hp_bonus: 0, atk_bonus: 0, def_bonus: 0,
    hp_regen: 0, dodge: 0, execute: 0,
    chain_attack: 0, lifesteal: 0, cannon_barrage: 0, mass_confuse: 0,
  }
  for (const as of synergies) {
    if (as.tier === null) continue
    const tier = as.def.tiers[as.tier]
    for (const ef of tier.effects) {
      (out as Record<string, number>)[ef.type] += ef.value
    }
  }
  return out
}

function buildCombatUnit(unit: Unit, team: "player" | "enemy", slot: SlotPos): CombatState {
  return { unit: { ...unit }, currentHp: unit.hp, team, slot, shieldTurns: 0, boosted: false }
}

function applyPositionBonus(cs: CombatState) {
  const u = cs.unit
  if (cs.slot === "front") {
    if (u.role === "tank")    cs.unit = { ...u, def: Math.round(u.def * 1.22) }
    if (u.role === "warrior") cs.unit = { ...u, atk: Math.round(u.atk * 1.10) }
  } else {
    if (u.role === "mage" || u.role === "support")
      cs.unit = { ...u, atk: Math.round(u.atk * 1.16) }
    if (u.role === "scout" || u.role === "assassin")
      cs.unit = { ...u, atk: Math.round(u.atk * 1.12), spd: Math.round(u.spd * 1.12) }
  }
}

function calcDamage(atk: CombatState, def: CombatState, mult: number): number {
  const raw = atk.unit.atk * mult
  const eff_def = def.shieldTurns > 0 ? def.unit.def * 1.35 : def.unit.def
  const reduction = clamp(eff_def * 0.45, 0, raw * 0.78)
  const variance = rng(0.82, 1.20)
  return Math.max(1, Math.round((raw - reduction) * variance))
}

function getEnemyTarget(actor: CombatState, all: CombatState[]): CombatState | null {
  const enemies = all.filter(u => u.team !== actor.team && u.currentHp > 0)
  if (!enemies.length) return null
  const { role } = actor.unit
  if (role === "assassin" || role === "scout") {
    return enemies.reduce((a, b) => a.currentHp < b.currentHp ? a : b)
  }
  const front = enemies.filter(e => e.slot === "front")
  const pool = front.length ? front : enemies
  return pool[Math.floor(Math.random() * pool.length)]
}

function getWeakestAlly(actor: CombatState, all: CombatState[]): CombatState | null {
  const allies = all.filter(u => u.team === actor.team && u.currentHp > 0 && u !== actor)
  if (!allies.length) return actor.currentHp < actor.unit.hp ? actor : null
  return allies.reduce((a, b) => {
    const ar = a.currentHp / a.unit.hp, br = b.currentHp / b.unit.hp
    return ar < br ? a : b
  })
}

function assignBoardPositions(
  playerUnits: Array<{ unit: Unit; slot: SlotPos }>,
  enemyUnits: Array<{ unit: Unit; slot: SlotPos }>
): PieceState[] {
  const pieces: PieceState[] = []

  // Player front → row 2, enemy front → row 1, back rows 3/0
  const place = (units: Array<{ unit: Unit; slot: SlotPos }>, team: "player" | "enemy") => {
    const frontUnits = units.filter(u => u.slot === "front")
    const backUnits  = units.filter(u => u.slot === "back")
    const baseRow    = team === "player" ? 2 : 1
    const backRow    = team === "player" ? 3 : 0

    const colsFor = (count: number) => {
      if (count === 1) return [1]
      if (count === 2) return [0, 2]
      if (count === 3) return [0, 1, 2]
      return [0, 1, 2, 3]
    }

    frontUnits.forEach((pu, i) => {
      const cols = colsFor(frontUnits.length)
      pieces.push({
        unitId: pu.unit.id,
        currentHp: pu.unit.hp,
        maxHp: pu.unit.hp,
        position: [baseRow, cols[i]],
        isAlive: true,
        activeEffects: [],
        team,
        unit: pu.unit,
      })
    })

    backUnits.forEach((pu, i) => {
      const cols = colsFor(backUnits.length)
      pieces.push({
        unitId: pu.unit.id,
        currentHp: pu.unit.hp,
        maxHp: pu.unit.hp,
        position: [backRow, cols[i]],
        isAlive: true,
        activeEffects: [],
        team,
        unit: pu.unit,
      })
    })
  }

  place(playerUnits, "player")
  place(enemyUnits, "enemy")
  return pieces
}

export function simulateCombat(
  playerUnits: Array<{ unit: Unit; slot: SlotPos }>,
  enemyUnits:  Array<{ unit: Unit; slot: SlotPos }>,
  playerSynergies: ActiveSynergy[]
): RoundResult {
  _actionIdx = 0
  const actions: CombatAction[] = []
  const initialPieces = assignBoardPositions(playerUnits, enemyUnits)
  let turn = 0

  const fx = getEffects(playerSynergies)

  const all: CombatState[] = [
    ...playerUnits.map(({ unit, slot }) => buildCombatUnit(unit, "player", slot)),
    ...enemyUnits.map(({ unit, slot })  => buildCombatUnit(unit, "enemy",  slot)),
  ]

  all.forEach(applyPositionBonus)

  // Apply synergy stat bonuses to player units
  for (const cs of all) {
    if (cs.team !== "player") continue
    if (fx.hp_bonus > 0) {
      cs.unit = { ...cs.unit, hp: Math.round(cs.unit.hp * (1 + fx.hp_bonus)) }
      cs.currentHp = cs.unit.hp
    }
    if (fx.atk_bonus > 0) {
      const karatachi = playerSynergies.some(s => s.clan === "karatachi" && s.tier !== null)
      const hoshigaki = playerSynergies.some(s => s.clan === "hoshigaki" && s.tier !== null)
      const kama      = playerSynergies.some(s => s.clan === "kama"      && s.tier !== null)
      let bonusAtk = 0
      if (karatachi) bonusAtk = fx.atk_bonus
      else if (hoshigaki && cs.unit.clan === "hoshigaki") bonusAtk = fx.atk_bonus
      else if (kama      && cs.unit.clan === "kama")      bonusAtk = fx.atk_bonus
      if (bonusAtk > 0) cs.unit = { ...cs.unit, atk: Math.round(cs.unit.atk * (1 + bonusAtk)) }
    }
    if (fx.def_bonus > 0)
      cs.unit = { ...cs.unit, def: Math.round(cs.unit.def * (1 + fx.def_bonus)) }
  }

  // Cannon barrage
  if (fx.cannon_barrage > 0) {
    const targets = all.filter(u => u.team === "enemy")
    const damages = targets.map(cs => {
      const dmg = Math.round(cs.unit.hp * fx.cannon_barrage)
      cs.currentHp -= dmg
      return dmg
    })
    const eliminated = targets.filter(t => t.currentHp <= 0).map(t => { t.currentHp = 0; return t.unit.id })
    actions.push({
      id: nextId(), round: 0, actionIndex: actions.length,
      type: "explosion",
      actorId: "synergy_cannon",
      targetIds: targets.map(t => t.unit.id),
      abilityName: "Barrage du Pavillon Noir",
      damage: damages,
      eliminated: eliminated.length ? eliminated : undefined,
    })
  }

  // Synergy intro
  const activeSyn = playerSynergies.filter(s => s.tier !== null)
  if (activeSyn.length) {
    actions.push({
      id: nextId(), round: 0, actionIndex: actions.length,
      type: "ability",
      actorId: "synergy_intro",
      targetIds: [],
      abilityName: activeSyn.map(s => s.def.name).join(", "),
    })
  }

  const MAX_TURNS = 24

  while (turn < MAX_TURNS) {
    const alive  = all.filter(u => u.currentHp > 0)
    const pAlive = alive.some(u => u.team === "player")
    const eAlive = alive.some(u => u.team === "enemy")
    if (!pAlive || !eAlive) break
    turn++

    // Regen / Poison
    if (fx.hp_regen !== 0) {
      for (const cs of all) {
        if (cs.currentHp <= 0) continue
        if (cs.team === "player" && fx.hp_regen > 0) {
          const heal = Math.round(cs.unit.hp * fx.hp_regen)
          cs.currentHp = Math.min(cs.unit.hp, cs.currentHp + heal)
          actions.push({
            id: nextId(), round: turn, actionIndex: actions.length,
            type: "heal", actorId: "synergy_regen", targetIds: [cs.unit.id], heal,
          })
        }
        if (cs.team === "enemy" && fx.hp_regen < 0) {
          const poison = Math.round(cs.unit.hp * Math.abs(fx.hp_regen))
          cs.currentHp = Math.max(0, cs.currentHp - poison)
          const elim = cs.currentHp === 0 ? [cs.unit.id] : undefined
          actions.push({
            id: nextId(), round: turn, actionIndex: actions.length,
            type: "debuff", actorId: "synergy_poison", targetIds: [cs.unit.id],
            damage: [poison], eliminated: elim,
          })
        }
      }
    }

    for (const cs of all) if (cs.shieldTurns > 0) cs.shieldTurns--

    const sorted = [...all.filter(u => u.currentHp > 0)].sort((a, b) => b.unit.spd - a.unit.spd)
    const abilityTurn = turn % 3 === 0

    for (const actor of sorted) {
      if (actor.currentHp <= 0) continue
      const pA = all.some(u => u.team === "player" && u.currentHp > 0)
      const eA = all.some(u => u.team === "enemy"  && u.currentHp > 0)
      if (!pA || !eA) break

      const { role, ability } = actor.unit

      // ── SUPPORT / BUFF_DEF ────────────────────────────────────────────────
      if (role === "support" || (abilityTurn && (ability.type === "heal_ally" || ability.type === "buff_def"))) {
        if (ability.type === "heal_ally" && abilityTurn) {
          const target = getWeakestAlly(actor, all)
          if (target) {
            const heal = Math.round(actor.unit.atk * ability.power)
            const actual = Math.min(heal, target.unit.hp - target.currentHp)
            target.currentHp += actual
            actions.push({
              id: nextId(), round: turn, actionIndex: actions.length,
              type: "heal", actorId: actor.unit.id, targetIds: [target.unit.id],
              abilityName: ability.name, heal: actual,
            })
            continue
          }
        }
        if (ability.type === "buff_def" && abilityTurn) {
          const target = getWeakestAlly(actor, all) || actor
          target.shieldTurns = 2
          actions.push({
            id: nextId(), round: turn, actionIndex: actions.length,
            type: "buff", actorId: actor.unit.id, targetIds: [target.unit.id],
            abilityName: ability.name,
          })
          continue
        }
      }

      // ── MAGE AOE ─────────────────────────────────────────────────────────
      if (role === "mage" && abilityTurn && ability.type === "damage_all") {
        const enemies = all.filter(u => u.team !== actor.team && u.currentHp > 0)
        let confused = false

        if (actor.team === "enemy" && fx.mass_confuse > 0 && Math.random() < fx.mass_confuse) {
          actions.push({
            id: nextId(), round: turn, actionIndex: actions.length,
            type: "ability_fail", actorId: actor.unit.id, targetIds: [],
            abilityName: ability.name, failed: true,
          })
          confused = true
        }

        if (!confused) {
          // ki_ren specific → chain type
          const actionType: ActionType = actor.unit.id === "ki_ren" ? "chain" : "explosion"
          const damages: number[] = []
          const eliminated: string[] = []
          for (const target of enemies) {
            const dmg = calcDamage(actor, target, ability.power)
            target.currentHp -= dmg
            damages.push(dmg)
            if (fx.lifesteal > 0 && actor.team === "player") {
              actor.currentHp = Math.min(actor.unit.hp, actor.currentHp + Math.round(dmg * fx.lifesteal))
            }
            if (target.currentHp <= 0) { target.currentHp = 0; eliminated.push(target.unit.id) }
          }
          actions.push({
            id: nextId(), round: turn, actionIndex: actions.length,
            type: actionType,
            actorId: actor.unit.id,
            targetIds: enemies.map(e => e.unit.id),
            chainedIds: actor.unit.id === "ki_ren" ? enemies.map(e => e.unit.id) : undefined,
            abilityName: ability.name,
            damage: damages,
            eliminated: eliminated.length ? eliminated : undefined,
          })
        }
        continue
      }

      // ── HEAL_SELF (drain / Samehada) ──────────────────────────────────────
      if (abilityTurn && ability.type === "heal_self") {
        const target = getEnemyTarget(actor, all)
        if (target) {
          const dmg = calcDamage(actor, target, 1.0)
          target.currentHp -= dmg
          const heal = Math.round(dmg * ability.power)
          actor.currentHp = Math.min(actor.unit.hp, actor.currentHp + heal)
          const elim = target.currentHp <= 0 ? [target.unit.id] : undefined
          if (target.currentHp <= 0) target.currentHp = 0
          // kurame → steal type
          const actionType: ActionType = actor.unit.id === "kurame" ? "steal" : "ability"
          actions.push({
            id: nextId(), round: turn, actionIndex: actions.length,
            type: actionType,
            actorId: actor.unit.id, targetIds: [target.unit.id],
            abilityName: ability.name,
            damage: [dmg], heal,
            eliminated: elim,
          })
          continue
        }
      }

      // ── DAMAGE_SINGLE ABILITY ─────────────────────────────────────────────
      if (abilityTurn && ability.type === "damage_single") {
        const target = getEnemyTarget(actor, all)
        if (!target) continue

        if (actor.team === "enemy" && fx.dodge > 0 && Math.random() < fx.dodge) {
          actions.push({
            id: nextId(), round: turn, actionIndex: actions.length,
            type: "ability_fail", actorId: actor.unit.id, targetIds: [target.unit.id],
            abilityName: ability.name, failed: true,
          })
          continue
        }
        if (actor.team === "enemy" && fx.mass_confuse > 0 && Math.random() < fx.mass_confuse) {
          actions.push({
            id: nextId(), round: turn, actionIndex: actions.length,
            type: "ability_fail", actorId: actor.unit.id, targetIds: [target.unit.id],
            abilityName: ability.name, failed: true,
          })
          continue
        }

        const dmg = calcDamage(actor, target, ability.power)
        target.currentHp -= dmg
        if (fx.lifesteal > 0 && actor.team === "player")
          actor.currentHp = Math.min(actor.unit.hp, actor.currentHp + Math.round(dmg * fx.lifesteal))

        const eliminated: string[] = []
        let decapitation = false
        if (target.currentHp <= 0) {
          target.currentHp = 0
          eliminated.push(target.unit.id)
          // Kubikiribōchō decapitation check
          if (actor.unit.id === "onigetsu_cb" && target.currentHp / target.unit.hp < 0.20) {
            decapitation = true
          }

          // Chain attack (Hoshigaki T3)
          if (fx.chain_attack > 0 && actor.team === "player") {
            const next = getEnemyTarget(actor, all)
            if (next) {
              const chainDmg = calcDamage(actor, next, 0.7)
              next.currentHp -= chainDmg
              if (next.currentHp <= 0) { next.currentHp = 0; eliminated.push(next.unit.id) }
              actions.push({
                id: nextId(), round: turn, actionIndex: actions.length,
                type: "attack", actorId: actor.unit.id, targetIds: [next.unit.id],
                abilityName: "Attaque enchaînée",
                damage: [chainDmg],
                eliminated: next.currentHp <= 0 ? [next.unit.id] : undefined,
              })
            }
          }
        }

        actions.push({
          id: nextId(), round: turn, actionIndex: actions.length,
          type: "ability", actorId: actor.unit.id, targetIds: [target.unit.id],
          abilityName: ability.name, damage: [dmg],
          eliminated: eliminated.length ? eliminated : undefined,
          decapitation: decapitation || undefined,
        })
        continue
      }

      // ── BASIC ATTACK ──────────────────────────────────────────────────────
      const target = getEnemyTarget(actor, all)
      if (!target) continue

      if (actor.team === "enemy" && fx.dodge > 0 && Math.random() < fx.dodge) {
        actions.push({
          id: nextId(), round: turn, actionIndex: actions.length,
          type: "ability_fail", actorId: actor.unit.id, targetIds: [target.unit.id], failed: true,
        })
        continue
      }
      if (actor.team === "enemy" && fx.mass_confuse > 0 && Math.random() < fx.mass_confuse) {
        actions.push({
          id: nextId(), round: turn, actionIndex: actions.length,
          type: "ability_fail", actorId: actor.unit.id, targetIds: [target.unit.id], failed: true,
        })
        continue
      }

      const dmg = calcDamage(actor, target, 1.0)
      target.currentHp -= dmg
      if (fx.lifesteal > 0 && actor.team === "player")
        actor.currentHp = Math.min(actor.unit.hp, actor.currentHp + Math.round(dmg * fx.lifesteal))

      const elim = target.currentHp <= 0 ? [target.unit.id] : undefined
      if (target.currentHp <= 0) target.currentHp = 0

      actions.push({
        id: nextId(), round: turn, actionIndex: actions.length,
        type: "attack", actorId: actor.unit.id, targetIds: [target.unit.id],
        damage: [dmg], eliminated: elim,
      })
    }
  }

  const pAlive = all.some(u => u.team === "player" && u.currentHp > 0)
  return { winner: pAlive ? "player" : "enemy", actions, initialPieces }
}
