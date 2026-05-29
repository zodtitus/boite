import type { Unit, SlotPos } from "@/types/enigme3"
import { ROSTER } from "./data"

function byId(id: string): Unit {
  const u = ROSTER.find(r => r.id === id)
  if (!u) throw new Error(`Unknown unit id: ${id}`)
  return u
}

function scale(unit: Unit, mult: number): Unit {
  return {
    ...unit,
    hp:  Math.round(unit.hp  * mult),
    atk: Math.round(unit.atk * mult),
    def: Math.round(unit.def * mult),
  }
}

export interface EnemyPlacement {
  unit: Unit
  slot: SlotPos
}

/**
 * Returns the enemy team for the given round (1-5).
 * Difficulty escalates: fewer but stronger units early, many T3 units late.
 */
export function getEnemyTeam(round: number): EnemyPlacement[] {
  switch (round) {
    case 1:
      // 2 T1 units — easy introduction
      return [
        { unit: byId("kama_novice"),      slot: "front" },
        { unit: byId("hebiichigo"),       slot: "back"  },
      ]

    case 2:
      // 3 units, mix T1-T2
      return [
        { unit: scale(byId("hoshigaki_raider"), 1.05), slot: "front" },
        { unit: scale(byId("kama_hunter"),      1.05), slot: "front" },
        { unit: scale(byId("shadow_weaver"),    1.05), slot: "back"  },
      ]

    case 3:
      // 3 T2 units, real challenge
      return [
        { unit: scale(byId("hoshigaki_alpha"), 1.10), slot: "front" },
        { unit: scale(byId("corsair"),         1.10), slot: "front" },
        { unit: scale(byId("mind_breaker"),    1.10), slot: "back"  },
      ]

    case 4:
      // 4 units T2-T3 — escalated threat
      return [
        { unit: scale(byId("kama_sentinel"),    1.15), slot: "front" },
        { unit: scale(byId("ameyuri"),          1.15), slot: "front" },
        { unit: scale(byId("soul_thief"),       1.15), slot: "back"  },
        { unit: scale(byId("first_mate"),       1.15), slot: "back"  },
      ]

    case 5:
    default:
      // La Garde du Brouillard — 4 elite T3 bosses
      return [
        { unit: scale(byId("kisame"),          1.25), slot: "front" },
        { unit: scale(byId("ghost_ship"),      1.25), slot: "front" },
        { unit: scale(byId("yagura"),          1.25), slot: "back"  },
        { unit: scale(byId("kama_incarnation"), 1.25), slot: "back" },
      ]
  }
}

export const ROUND_NAMES: Record<number, string> = {
  1: "Avant-garde du Brouillard",
  2: "Embuscade dans la Brume",
  3: "Vague des Sept Épées",
  4: "Cœur du Brouillard",
  5: "La Garde du Brouillard",
}

export const ROUND_FLAVORS: Record<number, string> = {
  1: "Des sentinelles Kama patrouillent aux portes de Kirigakure.",
  2: "Une embuscade se referme dans le brouillard épais.",
  3: "Les disciples des Sept Épées bloquent le passage.",
  4: "Les élites de la Brume gardent les archives secrètes.",
  5: "La Garde personnelle du Mizukage se dresse devant toi.",
}
