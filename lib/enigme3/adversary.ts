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
    name: unit.name,
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
 * Enemy teams drawn from the official roster.
 * They are the Garde du Brouillard — les mêmes guerriers en tant que gardiens.
 */
export function getEnemyTeam(round: number): EnemyPlacement[] {
  switch (round) {
    case 1:
      // Recrues de la Garde — 2 coût 1
      return [
        { unit: byId("haruto"),  slot: "front" },
        { unit: byId("akito"),   slot: "back"  },
      ]

    case 2:
      // Patrouille de la Brume — 3 unités coût 1–2
      return [
        { unit: scale(byId("toreil"),  1.05), slot: "front" },
        { unit: scale(byId("rai"),     1.05), slot: "front" },
        { unit: scale(byId("nyo"),     1.05), slot: "back"  },
      ]

    case 3:
      // Cercle de la Brume — 3 coût 2–3
      return [
        { unit: scale(byId("onigetsu"),   1.10), slot: "front" },
        { unit: scale(byId("kaito_kama"), 1.10), slot: "front" },
        { unit: scale(byId("sa_ren"),     1.10), slot: "back"  },
      ]

    case 4:
      // Jōnin d'élite — 4 coût 3–4
      return [
        { unit: scale(byId("rei_ren"),    1.15), slot: "front" },
        { unit: scale(byId("nyr"),        1.15), slot: "front" },
        { unit: scale(byId("senragi"),    1.15), slot: "back"  },
        { unit: scale(byId("umihime"),    1.15), slot: "back"  },
      ]

    case 5:
    default:
      // La Garde du Brouillard — 4 coût 5 (les plus puissants)
      return [
        { unit: scale(byId("onigetsu_cb"), 1.28), slot: "front" },
        { unit: scale(byId("maito"),       1.28), slot: "front" },
        { unit: scale(byId("zungetsu"),    1.28), slot: "back"  },
        { unit: scale(byId("ki_ren"),      1.28), slot: "back"  },
      ]
  }
}

export const ROUND_NAMES: Record<number, string> = {
  1: "Recrues de la Garde",
  2: "Patrouille du Brouillard",
  3: "Cercle de la Brume",
  4: "Jōnin d'Élite",
  5: "La Garde du Brouillard",
}

export const ROUND_FLAVORS: Record<number, string> = {
  1: "Des recrues gardent l'entrée des archives de Kirigakure.",
  2: "Une patrouille se referme dans la brume épaisse.",
  3: "Le Cercle de la Brume bloque le passage central.",
  4: "Les Jōnin d'élite défendent les archives secrètes.",
  5: "Zungetsu Hōzuki lui-même mène la défense finale.",
}
