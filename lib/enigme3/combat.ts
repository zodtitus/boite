import type { Unit, CombatState, CombatLog, RoundResult, ActiveSynergy, SlotPos } from "@/types/enigme3"
import { SYNERGIES } from "./data"

function rng(min: number, max: number) { return min + Math.random() * (max - min) }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }

function getEffects(synergies: ActiveSynergy[]) {
  const out = {
    hp_bonus:      0, atk_bonus:     0, def_bonus:   0,
    hp_regen:      0, dodge:         0, execute:     0,
    chain_attack:  0, lifesteal:     0, cannon_barrage: 0,
    mass_confuse:  0,
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
  // warriors/tanks prefer front row
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

export function simulateCombat(
  playerUnits: Array<{ unit: Unit; slot: SlotPos }>,
  enemyUnits:  Array<{ unit: Unit; slot: SlotPos }>,
  playerSynergies: ActiveSynergy[]
): RoundResult {
  const log: CombatLog[] = []
  let turn = 0

  const fx = getEffects(playerSynergies)

  // Build combatants
  const all: CombatState[] = [
    ...playerUnits.map(({ unit, slot }) => buildCombatUnit(unit, "player", slot)),
    ...enemyUnits.map(({ unit, slot })  => buildCombatUnit(unit, "enemy",  slot)),
  ]

  // Apply position bonuses
  all.forEach(applyPositionBonus)

  // Apply synergy stat bonuses to player units
  for (const cs of all) {
    if (cs.team !== "player") continue
    if (fx.hp_bonus > 0) {
      cs.unit = { ...cs.unit, hp: Math.round(cs.unit.hp * (1 + fx.hp_bonus)) }
      cs.currentHp = cs.unit.hp
    }
    if (fx.atk_bonus > 0) {
      // Karatachi atk_bonus applies to all allies; Hoshigaki only to their clan
      const karatachi = playerSynergies.some(s => s.clan === "karatachi" && s.tier !== null)
      const hoshigaki = playerSynergies.some(s => s.clan === "hoshigaki" && s.tier !== null)
      const kama      = playerSynergies.some(s => s.clan === "kama"      && s.tier !== null)
      let bonusAtk = 0
      if (karatachi) bonusAtk = fx.atk_bonus                       // all allies
      else if (hoshigaki && cs.unit.clan === "hoshigaki") bonusAtk = fx.atk_bonus
      else if (kama      && cs.unit.clan === "kama")      bonusAtk = fx.atk_bonus
      if (bonusAtk > 0) cs.unit = { ...cs.unit, atk: Math.round(cs.unit.atk * (1 + bonusAtk)) }
    }
    if (fx.def_bonus > 0)
      cs.unit = { ...cs.unit, def: Math.round(cs.unit.def * (1 + fx.def_bonus)) }
  }

  // Cannon barrage (Pavillon Noir T2+)
  if (fx.cannon_barrage > 0) {
    for (const cs of all.filter(u => u.team === "enemy")) {
      const dmg = Math.round(cs.unit.hp * fx.cannon_barrage)
      cs.currentHp -= dmg
      log.push({ turn: 0, kind: "synergy",
        text: `Barrage du Pavillon Noir ! ${cs.unit.name} subit ${dmg} dégâts.` })
    }
  }

  // Synergie intro lines
  const activeSyn = playerSynergies.filter(s => s.tier !== null)
  if (activeSyn.length) {
    const names = activeSyn.map(s => s.def.name).join(", ")
    log.push({ turn: 0, kind: "synergy", text: `Synergies actives : ${names}.` })
  }

  const MAX_TURNS = 24

  while (turn < MAX_TURNS) {
    const alive     = all.filter(u => u.currentHp > 0)
    const pAlive    = alive.some(u => u.team === "player")
    const eAlive    = alive.some(u => u.team === "enemy")
    if (!pAlive || !eAlive) break
    turn++

    // Regen / Poison (Kama: negative regen on enemies, Hōzuki: positive on players)
    if (fx.hp_regen !== 0) {
      for (const cs of all) {
        if (cs.currentHp <= 0) continue
        if (cs.team === "player" && fx.hp_regen > 0) {
          const heal = Math.round(cs.unit.hp * fx.hp_regen)
          cs.currentHp = Math.min(cs.unit.hp, cs.currentHp + heal)
        }
        if (cs.team === "enemy" && fx.hp_regen < 0) {
          const poison = Math.round(cs.unit.hp * Math.abs(fx.hp_regen))
          cs.currentHp = Math.max(0, cs.currentHp - poison)
          if (cs.currentHp === 0)
            log.push({ turn, kind: "death", text: `${cs.unit.name} succombe au poison des Kama.` })
        }
      }
    }

    // Tick shield counters
    for (const cs of all) if (cs.shieldTurns > 0) cs.shieldTurns--

    // Sort by SPD
    const sorted = [...all.filter(u => u.currentHp > 0)].sort((a, b) => b.unit.spd - a.unit.spd)
    const abilityTurn = turn % 3 === 0

    for (const actor of sorted) {
      if (actor.currentHp <= 0) continue
      const pA = all.some(u => u.team === "player" && u.currentHp > 0)
      const eA = all.some(u => u.team === "enemy"  && u.currentHp > 0)
      if (!pA || !eA) break

      const { role, ability } = actor.unit

      // ── SUPPORT: heal ──────────────────────────────────────────────────
      if (role === "support" || (abilityTurn && (ability.type === "heal_ally" || ability.type === "buff_def"))) {
        if (ability.type === "heal_ally" && abilityTurn) {
          const target = getWeakestAlly(actor, all)
          if (target) {
            const heal = Math.round(actor.unit.atk * ability.power)
            const actual = Math.min(heal, target.unit.hp - target.currentHp)
            target.currentHp += actual
            log.push({ turn, kind: "heal",
              text: `${actor.unit.name} utilise ${ability.name} → soigne ${target.unit.name} de ${actual} HP.` })
            continue
          }
        }
        if (ability.type === "buff_def" && abilityTurn) {
          const target = getWeakestAlly(actor, all) || actor
          target.shieldTurns = 2
          log.push({ turn, kind: "ability",
            text: `${actor.unit.name} utilise ${ability.name} → protège ${target.unit.name} (DEF+35% pendant 2 tours).` })
          continue
        }
        // Fallthrough to basic attack if no heal needed
      }

      // ── MAGE: AOE ability ──────────────────────────────────────────────
      if (role === "mage" && abilityTurn && (ability.type === "damage_all" || ability.type === "heal_self")) {
        if (ability.type === "damage_all") {
          const enemies = all.filter(u => u.team !== actor.team && u.currentHp > 0)
          for (const target of enemies) {
            // Yokushin mass_confuse check
            if (actor.team === "enemy" && fx.mass_confuse > 0 && Math.random() < fx.mass_confuse) {
              log.push({ turn, kind: "ability",
                text: `${actor.unit.name} est confus ! Son attaque échoue.` })
              break
            }
            const dmg = calcDamage(actor, target, ability.power)
            target.currentHp -= dmg
            if (fx.lifesteal > 0 && actor.team === "player") {
              actor.currentHp = Math.min(actor.unit.hp, actor.currentHp + Math.round(dmg * fx.lifesteal))
            }
            log.push({ turn, kind: "ability",
              text: `${actor.unit.name} : ${ability.name} → ${target.unit.name} (−${dmg} HP).` })
            if (target.currentHp <= 0) {
              target.currentHp = 0
              log.push({ turn, kind: "death", text: `${target.unit.name} est éliminé.` })
            }
          }
          continue
        }
      }

      // ── HEAL_SELF (drain): attack + heal ───────────────────────────────
      if (abilityTurn && ability.type === "heal_self") {
        const target = getEnemyTarget(actor, all)
        if (target) {
          const dmg = calcDamage(actor, target, 1.0)
          target.currentHp -= dmg
          const heal = Math.round(dmg * ability.power)
          actor.currentHp = Math.min(actor.unit.hp, actor.currentHp + heal)
          log.push({ turn, kind: "ability",
            text: `${actor.unit.name} : ${ability.name} → ${target.unit.name} (−${dmg} HP, +${heal} HP récupérés).` })
          if (target.currentHp <= 0) {
            target.currentHp = 0
            log.push({ turn, kind: "death", text: `${target.unit.name} est éliminé.` })
          }
          continue
        }
      }

      // ── SINGLE DAMAGE ABILITY ──────────────────────────────────────────
      if (abilityTurn && ability.type === "damage_single") {
        const target = getEnemyTarget(actor, all)
        if (!target) continue
        // Dodge check (Yokushin or Hōzuki synergy)
        if (actor.team === "enemy" && fx.dodge > 0 && Math.random() < fx.dodge) {
          log.push({ turn, kind: "ability",
            text: `${actor.unit.name} vise ${target.unit.name} mais l'attaque est esquivée !` })
          continue
        }
        // Confuse check
        if (actor.team === "enemy" && fx.mass_confuse > 0 && Math.random() < fx.mass_confuse) {
          log.push({ turn, kind: "ability",
            text: `${actor.unit.name} est confus et rate son attaque !` })
          continue
        }
        const dmg = calcDamage(actor, target, ability.power)
        target.currentHp -= dmg
        if (fx.lifesteal > 0 && actor.team === "player")
          actor.currentHp = Math.min(actor.unit.hp, actor.currentHp + Math.round(dmg * fx.lifesteal))
        log.push({ turn, kind: "ability",
          text: `${actor.unit.name} : ${ability.name} → ${target.unit.name} (−${dmg} HP).` })
        if (target.currentHp <= 0) {
          target.currentHp = 0
          log.push({ turn, kind: "death", text: `${target.unit.name} est éliminé.` })
          // Execute check (Kama)
          if (fx.execute > 0 && actor.team === "player" && Math.random() < fx.execute)
            log.push({ turn, kind: "ability", text: `Exécution Kama ! La cible est fauchée net.` })
          // Chain attack (Hoshigaki T3)
          if (fx.chain_attack > 0 && actor.team === "player") {
            const next = getEnemyTarget(actor, all)
            if (next) {
              const chainDmg = calcDamage(actor, next, 0.7)
              next.currentHp -= chainDmg
              log.push({ turn, kind: "ability",
                text: `Attaque enchaînée ! ${actor.unit.name} frappe ${next.unit.name} (−${chainDmg} HP).` })
              if (next.currentHp <= 0) {
                next.currentHp = 0
                log.push({ turn, kind: "death", text: `${next.unit.name} est éliminé.` })
              }
            }
          }
        }
        continue
      }

      // ── BASIC ATTACK (fallback) ────────────────────────────────────────
      const target = getEnemyTarget(actor, all)
      if (!target) continue

      if (actor.team === "enemy" && fx.dodge > 0 && Math.random() < fx.dodge) {
        log.push({ turn, kind: "attack",
          text: `${actor.unit.name} attaque ${target.unit.name} mais l'esquive est réussie !` })
        continue
      }
      if (actor.team === "enemy" && fx.mass_confuse > 0 && Math.random() < fx.mass_confuse) {
        log.push({ turn, kind: "attack",
          text: `${actor.unit.name} est confus et frappe dans le vide !` })
        continue
      }

      const dmg = calcDamage(actor, target, 1.0)
      target.currentHp -= dmg
      if (fx.lifesteal > 0 && actor.team === "player")
        actor.currentHp = Math.min(actor.unit.hp, actor.currentHp + Math.round(dmg * fx.lifesteal))

      log.push({ turn, kind: "attack",
        text: `${actor.unit.name} frappe ${target.unit.name} (−${dmg} HP).` })

      if (target.currentHp <= 0) {
        target.currentHp = 0
        log.push({ turn, kind: "death", text: `${target.unit.name} est éliminé.` })
        // Execute check
        if (fx.execute > 0 && actor.team === "player" && Math.random() < fx.execute)
          log.push({ turn, kind: "ability", text: `Exécution Kama !` })
      }
    }
  }

  const pAlive = all.some(u => u.team === "player" && u.currentHp > 0)
  return { winner: pAlive ? "player" : "enemy", log }
}
