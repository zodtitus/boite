export type Role = "tank" | "warrior" | "assassin" | "mage" | "support" | "scout"
export type Clan = "hozuki" | "karatachi" | "hoshigaki" | "yokushin" | "pavillonNoir" | "kama" | "neutre"
export type Tier = 1 | 2 | 3
export type AbilityType = "damage_single" | "damage_all" | "heal_ally" | "heal_self" | "buff_def"
export type SynergyEffectType =
  | "hp_bonus" | "atk_bonus" | "def_bonus"
  | "hp_regen" | "dodge" | "execute"
  | "chain_attack" | "lifesteal" | "cannon_barrage" | "mass_confuse"

export type ActionType =
  | "attack" | "ability" | "ability_fail" | "buff" | "debuff"
  | "death" | "steal" | "chain" | "explosion" | "heal" | "mirror"

export interface Ability {
  name: string
  type: AbilityType
  power: number
  description: string
}

export interface Unit {
  id: string
  name: string
  kanji: string
  clan: Clan
  role: Role
  tier: Tier
  hp: number
  atk: number
  def: number
  spd: number
  ability: Ability
  flavor: string
}

export interface SynergyEffect {
  type: SynergyEffectType
  value: number
}

export interface SynergyTier {
  count: number
  label: string
  effects: SynergyEffect[]
}

export interface SynergyDef {
  clan: Clan
  name: string
  description: string
  tiers: [SynergyTier, SynergyTier, SynergyTier]
}

export interface ActiveSynergy {
  clan: Clan
  count: number
  tier: 0 | 1 | 2 | null
  def: SynergyDef
}

export type SlotPos = "front" | "back"

export interface PlacedUnit {
  unit: Unit
  slot: SlotPos
}

export interface CombatAction {
  id: string
  round: number
  actionIndex: number
  type: ActionType
  actorId: string
  targetIds: string[]
  abilityName?: string
  damage?: number[]
  heal?: number
  failed?: boolean
  eliminated?: string[]
  chainedIds?: string[]
  decapitation?: boolean
}

export interface Effect {
  type: string
  duration: number
  value?: number
}

export interface PieceState {
  unitId: string
  currentHp: number
  maxHp: number
  position: [number, number]
  isAlive: boolean
  activeEffects: Effect[]
  stolenAbility?: string
  team: "player" | "enemy"
  unit: Unit
}

export interface CombatState {
  unit: Unit
  currentHp: number
  team: "player" | "enemy"
  slot: SlotPos
  shieldTurns: number
  boosted: boolean
}

export interface CombatLog {
  turn: number
  text: string
  kind: "attack" | "ability" | "heal" | "death" | "system" | "synergy"
}

export interface RoundResult {
  winner: "player" | "enemy"
  actions: CombatAction[]
  initialPieces: PieceState[]
}

export interface CombatViewProps {
  actions: CombatAction[]
  initialPieces: PieceState[]
  onCombatEnd: (playerWon: boolean) => void
}

export type GamePhase =
  | "intro"
  | "draft"
  | "swap"
  | "placement"
  | "combat"
  | "round_result"
  | "game_over"
  | "victory"
