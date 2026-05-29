import type { Unit, SynergyDef, ActiveSynergy } from "@/types/enigme3"

// ─── ROSTER — 35 personnages officiels ───────────────────────────────────────

export const ROSTER: Unit[] = [

  // ── COÛT 5 — Mizukage + Commandants ─────────────────────────────────────
  {
    id: "zungetsu",
    name: "Zungetsu Hōzuki", kanji: "瑞月",
    clan: "hozuki", role: "mage", tier: 3,
    hp: 198, atk: 68, def: 42, spd: 52,
    ability: {
      name: "Torrent du Mizukage", type: "damage_all", power: 1.0,
      description: "Déchaîne une vague d'eau absolue sur toute la ligne ennemie."
    },
    flavor: "Le Mizukage de Kirigakure. Sa volonté est la Brume."
  },
  {
    id: "ran_karatachi",
    name: "Ran Karatachi", kanji: "嵐",
    clan: "karatachi", role: "support", tier: 3,
    hp: 172, atk: 55, def: 40, spd: 55,
    ability: {
      name: "Commandement de Kiri", type: "heal_ally", power: 1.0,
      description: "Restore la combativité du guerrier le plus épuisé."
    },
    flavor: "Commandant en chef. Sa voix suffit à retourner une bataille."
  },
  {
    id: "ki_ren",
    name: "Ki Ren Yokushin", kanji: "気連",
    clan: "yokushin", role: "mage", tier: 3,
    hp: 178, atk: 65, def: 38, spd: 58,
    ability: {
      name: "Voile d'Illusion Totale", type: "damage_all", power: 0.95,
      description: "Projette une illusion dévastatrice sur tous les ennemis."
    },
    flavor: "Commandant Yokushin. Son genjutsu efface la frontière du réel."
  },

  // ── COÛT 4 — Jōnin d'élite + Porteurs d'épées ───────────────────────────
  {
    id: "kurame",
    name: "Kurame Hoshigaki", kanji: "暗目",
    clan: "hoshigaki", role: "warrior", tier: 3,
    hp: 158, atk: 56, def: 32, spd: 50,
    ability: {
      name: "Samehada", type: "heal_self", power: 0.48,
      description: "Samehada dévore le chakra ennemi et se retransforme en vie."
    },
    flavor: "Porteur de Samehada. La lame vivante choisit qui elle sert."
  },
  {
    id: "onigetsu_cb",
    name: "Ōnigetsu Hōzuki", kanji: "鬼月",
    clan: "hozuki", role: "warrior", tier: 3,
    hp: 165, atk: 60, def: 36, spd: 48,
    ability: {
      name: "Kubikiribōchō", type: "damage_single", power: 2.2,
      description: "Le grand cimeterre décapiteur s'abat avec une force brute."
    },
    flavor: "Porteur du grand cimeterre. Chaque coup enterre un adversaire."
  },
  {
    id: "maito",
    name: "Maito Kama", kanji: "舞刃",
    clan: "kama", role: "warrior", tier: 3,
    hp: 155, atk: 58, def: 30, spd: 53,
    ability: {
      name: "Kabutowari", type: "damage_single", power: 2.1,
      description: "Le brise-heaume fracasse armures et défenses."
    },
    flavor: "Porteur de Kabutowari. Aucune armure ne lui résiste."
  },
  {
    id: "rei_ren",
    name: "Rei Ren Yokushin", kanji: "零連",
    clan: "yokushin", role: "tank", tier: 3,
    hp: 148, atk: 40, def: 48, spd: 44,
    ability: {
      name: "Garde du Voile", type: "buff_def", power: 0.48,
      description: "Dresse un voile d'illusion protecteur autour d'un allié."
    },
    flavor: "Garde d'élite Yokushin. Son armure d'illusion trompe l'ennemi."
  },
  {
    id: "nyr",
    name: "Nyr Karatachi", kanji: "虚",
    clan: "karatachi", role: "warrior", tier: 3,
    hp: 152, atk: 58, def: 32, spd: 55,
    ability: {
      name: "Hiramekarei", type: "damage_single", power: 1.95,
      description: "L'épée jumelle frappe avec toute l'autorité de Kiri."
    },
    flavor: "Porteur d'Hiramekarei. Sa lame incarne la légitimité de la Brume."
  },
  {
    id: "senragi",
    name: "Senragi de la rose blanche", kanji: "千羅",
    clan: "neutre", role: "assassin", tier: 3,
    hp: 132, atk: 62, def: 22, spd: 80,
    ability: {
      name: "Filet de Soie", type: "damage_single", power: 2.3,
      description: "Enserre la cible dans ses fils invisibles et frappe au cœur."
    },
    flavor: "Mercenaire de la rose blanche. Elle n'appartient qu'à elle-même."
  },

  // ── COÛT 3 — Chef + Cercle de la Brume ──────────────────────────────────
  {
    id: "umihime",
    name: "Umihime Hōzuki", kanji: "海姫",
    clan: "hozuki", role: "support", tier: 2,
    hp: 130, atk: 28, def: 30, spd: 48,
    ability: {
      name: "Source de Mer", type: "heal_ally", power: 0.88,
      description: "Puise dans l'eau marine pour régénérer un allié."
    },
    flavor: "Chef du clan Hōzuki. Elle soigne là où d'autres fracassent."
  },
  {
    id: "onigetsu",
    name: "Onigetsu Hōzuki", kanji: "鬼朔",
    clan: "hozuki", role: "warrior", tier: 2,
    hp: 128, atk: 44, def: 26, spd: 54,
    ability: {
      name: "Lame de Lune Noire", type: "damage_single", power: 1.75,
      description: "Frappe au moment où la lune disparaît — dans le silence."
    },
    flavor: "Cercle de la Brume. Il combat quand les ombres sont les plus profondes."
  },
  {
    id: "mirei",
    name: "Mirei du Pavillon Noir", kanji: "三礼",
    clan: "pavillonNoir", role: "support", tier: 2,
    hp: 122, atk: 30, def: 32, spd: 50,
    ability: {
      name: "Drapeau Noir", type: "buff_def", power: 0.36,
      description: "Lève l'étendard pirate et renforce la résistance du groupe."
    },
    flavor: "Cercle de la Brume. Sa loyauté au Pavillon est absolue."
  },
  {
    id: "kaito_kama",
    name: "Kaito Kama", kanji: "魁刃",
    clan: "kama", role: "warrior", tier: 2,
    hp: 118, atk: 46, def: 24, spd: 58,
    ability: {
      name: "Faucille Pionnière", type: "damage_single", power: 1.72,
      description: "Ouvre le passage à la faux, brisant la première ligne."
    },
    flavor: "Cercle de la Brume. Sa faux trace le chemin, les autres suivent."
  },
  {
    id: "youhei",
    name: "Youhei de la Meute", kanji: "遊平",
    clan: "neutre", role: "warrior", tier: 2,
    hp: 120, atk: 38, def: 28, spd: 56,
    ability: {
      name: "Assaut de Meute", type: "damage_all", power: 0.58,
      description: "Appelle la meute — frappe tous les ennemis simultanément."
    },
    flavor: "Cercle de la Brume. Ses frères invisibles combattent avec lui."
  },
  {
    id: "sa_ren",
    name: "Sa Ren Yokushin", kanji: "砂連",
    clan: "yokushin", role: "mage", tier: 2,
    hp: 112, atk: 45, def: 22, spd: 63,
    ability: {
      name: "Tempête de Sable Illusoire", type: "damage_all", power: 0.70,
      description: "Fait surgir un désert d'illusion qui aveugle tous les ennemis."
    },
    flavor: "Cercle de la Brume. Son genjutsu imite les pires cauchemars."
  },
  {
    id: "sanae",
    name: "Sanae Hanagiri", kanji: "早苗",
    clan: "neutre", role: "support", tier: 2,
    hp: 108, atk: 24, def: 28, spd: 50,
    ability: {
      name: "Soin des Fleurs", type: "heal_ally", power: 0.82,
      description: "Infuse de l'énergie florale pour soigner un allié blessé."
    },
    flavor: "Cercle de la Brume. Ses remèdes sont aussi tranchants que des lames."
  },
  {
    id: "denka",
    name: "Denka K. Seishiro", kanji: "典花",
    clan: "neutre", role: "support", tier: 2,
    hp: 115, atk: 32, def: 30, spd: 52,
    ability: {
      name: "Cérémonie du Chakra", type: "buff_def", power: 0.33,
      description: "Canalise le chakra collectif pour renforcer les défenses."
    },
    flavor: "Cercle de la Brume. Sa discipline donne de la force à son groupe."
  },
  {
    id: "mushu",
    name: "Mushu du Pavillon Noir", kanji: "霧主",
    clan: "pavillonNoir", role: "mage", tier: 2,
    hp: 118, atk: 40, def: 26, spd: 56,
    ability: {
      name: "Salve du Brouillard", type: "damage_all", power: 0.68,
      description: "Bombarde tous les ennemis avec les canons du Pavillon Noir."
    },
    flavor: "Cercle de la Brume. Il commande le brouillard comme une flotte."
  },

  // ── COÛT 2 — Génération actuelle (nommés) ───────────────────────────────
  {
    id: "tengetsu",
    name: "Tengetsu Hōzuki", kanji: "天月",
    clan: "hozuki", role: "warrior", tier: 1,
    hp: 105, atk: 35, def: 22, spd: 58,
    ability: {
      name: "Lame Céleste", type: "damage_single", power: 1.62,
      description: "Frappe empreinte de la volonté du ciel."
    },
    flavor: "Diplomate Hōzuki. Son nom porte l'espoir de la Brume."
  },
  {
    id: "zengetsu",
    name: "Zengetsu Hōzuki", kanji: "全月",
    clan: "hozuki", role: "warrior", tier: 1,
    hp: 108, atk: 38, def: 20, spd: 60,
    ability: {
      name: "Pleine Lune", type: "damage_single", power: 1.70,
      description: "Frappe au moment où sa puissance est à son zénith."
    },
    flavor: "Lame du clan Hōzuki. Il combatrait jusqu'à la dernière lune."
  },
  {
    id: "sudogetsu",
    name: "Sudogetsu Hōzuki", kanji: "素月",
    clan: "hozuki", role: "assassin", tier: 1,
    hp: 98, atk: 40, def: 18, spd: 70,
    ability: {
      name: "Disparition Lunaire", type: "damage_single", power: 1.82,
      description: "Se fond dans la brume et réapparaît dans le dos de l'ennemi."
    },
    flavor: "Ombre du clan Hōzuki. Il frappe puis n'existe plus."
  },
  {
    id: "kuro_ren",
    name: "Kuro Ren Yokushin", kanji: "黒連",
    clan: "yokushin", role: "tank", tier: 1,
    hp: 110, atk: 28, def: 33, spd: 48,
    ability: {
      name: "Chaîne Sombre", type: "buff_def", power: 0.32,
      description: "Tisse une chaîne d'illusion pour absorber les coups."
    },
    flavor: "Garde Yokushin. Son armure n'existe pas — et pourtant elle protège."
  },
  {
    id: "ao_ren",
    name: "Ao Ren Yokushin", kanji: "蒼連",
    clan: "yokushin", role: "tank", tier: 1,
    hp: 112, atk: 30, def: 31, spd: 50,
    ability: {
      name: "Bouclier Azuré", type: "buff_def", power: 0.30,
      description: "Projette un écran de genjutsu bleu qui absorbe l'impact."
    },
    flavor: "Garde Yokushin. Le bleu de son bouclier cache mille pièges."
  },
  {
    id: "ou_ren",
    name: "Ou Ren Yokushin", kanji: "王連",
    clan: "yokushin", role: "support", tier: 1,
    hp: 108, atk: 26, def: 34, spd: 46,
    ability: {
      name: "Royale Protection", type: "heal_ally", power: 0.62,
      description: "Soigne l'allié le plus blessé avec une précision royale."
    },
    flavor: "Garde royal Yokushin. Sa protection n'a jamais failli."
  },
  {
    id: "kaien",
    name: "Kaien K. Seno", kanji: "海燕",
    clan: "karatachi", role: "support", tier: 1,
    hp: 98, atk: 24, def: 24, spd: 55,
    ability: {
      name: "Soin Diplomatique", type: "heal_ally", power: 0.72,
      description: "Restaure les forces d'un allié avec des techniques Karatachi."
    },
    flavor: "Diplomate Karatachi. Sa plume soigne aussi bien que sa parole."
  },
  {
    id: "kurozai",
    name: "Kurozai Hoshigaki", kanji: "黒罪",
    clan: "hoshigaki", role: "warrior", tier: 1,
    hp: 112, atk: 40, def: 20, spd: 58,
    ability: {
      name: "Morsure du Requin Noir", type: "damage_single", power: 1.72,
      description: "Mord la cible avec la ferveur d'un requin des profondeurs."
    },
    flavor: "Lame Hoshigaki. Son sourire précède toujours le tranchant."
  },
  {
    id: "nyme",
    name: "Nyme Hoshigaki", kanji: "波芽",
    clan: "hoshigaki", role: "assassin", tier: 1,
    hp: 95, atk: 38, def: 16, spd: 72,
    ability: {
      name: "Vague Fantôme", type: "damage_single", power: 1.78,
      description: "Surgit d'une vague et frappe au point vital."
    },
    flavor: "Ombre Hoshigaki. Elle se fond dans l'eau comme une ombre."
  },
  {
    id: "thorkel",
    name: "Thorkel Hoshigaki", kanji: "雷鮫",
    clan: "hoshigaki", role: "warrior", tier: 1,
    hp: 115, atk: 42, def: 22, spd: 56,
    ability: {
      name: "Frappe du Requin Tonnerre", type: "damage_single", power: 1.80,
      description: "Son attaque électrisée déchire l'armure et les chairs."
    },
    flavor: "Lame Hoshigaki. Il frappe comme la foudre et plonge comme un requin."
  },

  // ── COÛT 1 — Génération actuelle (recrues) ───────────────────────────────
  {
    id: "haruto",
    name: "Haruto Yuo", kanji: "春斗",
    clan: "neutre", role: "warrior", tier: 1,
    hp: 78, atk: 28, def: 15, spd: 65,
    ability: {
      name: "Coup du Printemps", type: "damage_single", power: 1.40,
      description: "Une attaque franche, sans artifice, sans peur."
    },
    flavor: "Recrue. Son courage dépasse encore sa technique."
  },
  {
    id: "mizuhime",
    name: "Mizuhime Hōzuki", kanji: "水姫",
    clan: "hozuki", role: "scout", tier: 1,
    hp: 75, atk: 26, def: 16, spd: 64,
    ability: {
      name: "Vague Rapide", type: "damage_single", power: 1.50,
      description: "Frappe en glissant sur l'eau avec une agilité parfaite."
    },
    flavor: "Recrue Hōzuki. Elle apprend vite — trop vite pour être ignorée."
  },
  {
    id: "nyo",
    name: "Nyo Kama", kanji: "女鎌",
    clan: "kama", role: "scout", tier: 1,
    hp: 72, atk: 28, def: 14, spd: 72,
    ability: {
      name: "Faucille Légère", type: "damage_single", power: 1.58,
      description: "Sa faux légère tranche l'air avant même que l'ennemi réagisse."
    },
    flavor: "Recrue Kama. Rapide comme une faucille au vent."
  },
  {
    id: "rai",
    name: "Rai du Pavillon Noir", kanji: "雷",
    clan: "pavillonNoir", role: "warrior", tier: 1,
    hp: 76, atk: 30, def: 14, spd: 68,
    ability: {
      name: "Éclair du Pavillon", type: "damage_single", power: 1.52,
      description: "Frappe avec la vélocité d'un coup de foudre."
    },
    flavor: "Recrue du Pavillon Noir. Rapide comme l'éclair, fidèle comme le fer."
  },
  {
    id: "akito",
    name: "Akito Kama", kanji: "秋刃",
    clan: "kama", role: "warrior", tier: 1,
    hp: 78, atk: 28, def: 15, spd: 65,
    ability: {
      name: "Lame d'Automne", type: "damage_single", power: 1.42,
      description: "Frappe froide et précise comme une nuit d'automne."
    },
    flavor: "Recrue Kama. Sa lame est aussi froide que sa détermination."
  },
  {
    id: "kael",
    name: "Kael Kama", kanji: "風鎌",
    clan: "kama", role: "scout", tier: 1,
    hp: 74, atk: 26, def: 13, spd: 74,
    ability: {
      name: "Bourrasque de Faux", type: "damage_all", power: 0.62,
      description: "Fait tournoyer sa faux pour faucher toute la ligne ennemie."
    },
    flavor: "Recrue Kama. Le vent est son allié, la vitesse son arme."
  },
  {
    id: "toreil",
    name: "Toreil du Pavillon Noir", kanji: "砦",
    clan: "pavillonNoir", role: "tank", tier: 1,
    hp: 82, atk: 24, def: 20, spd: 57,
    ability: {
      name: "Forteresse Pirate", type: "buff_def", power: 0.28,
      description: "Se plante comme un fort et absorbe les coups pour les siens."
    },
    flavor: "Recrue du Pavillon Noir. Un mur vivant sous le drapeau noir."
  },
]

// ─── SYNERGIES ────────────────────────────────────────────────────────────────

export const SYNERGIES: SynergyDef[] = [
  {
    clan: "hozuki",
    name: "Corps d'Eau",
    description: "La chair des Hōzuki se transmute en eau pure.",
    tiers: [
      { count: 2, label: "+20% HP", effects: [{ type: "hp_bonus", value: 0.20 }] },
      { count: 3, label: "+20% HP · Régén 6%/tour", effects: [{ type: "hp_bonus", value: 0.20 }, { type: "hp_regen", value: 0.06 }] },
      { count: 4, label: "+20% HP · Régén · Esquive 25%", effects: [{ type: "hp_bonus", value: 0.20 }, { type: "hp_regen", value: 0.06 }, { type: "dodge", value: 0.25 }] },
    ]
  },
  {
    clan: "karatachi",
    name: "Commandement de Kiri",
    description: "L'autorité du Mizukage galvanise tout le groupe.",
    tiers: [
      { count: 2, label: "Alliés +15% ATK", effects: [{ type: "atk_bonus", value: 0.15 }] },
      { count: 3, label: "Alliés +25% ATK", effects: [{ type: "atk_bonus", value: 0.25 }] },
      { count: 4, label: "Alliés +35% ATK", effects: [{ type: "atk_bonus", value: 0.35 }] },
    ]
  },
  {
    clan: "hoshigaki",
    name: "Meute de Requins",
    description: "La frénésie de combat s'emballe à chaque victoire.",
    tiers: [
      { count: 2, label: "Hoshigaki +22% ATK", effects: [{ type: "atk_bonus", value: 0.22 }] },
      { count: 3, label: "+22% ATK · Vol de vie 20%", effects: [{ type: "atk_bonus", value: 0.22 }, { type: "lifesteal", value: 0.20 }] },
      { count: 4, label: "+22% ATK · Vol vie · Chaîne", effects: [{ type: "atk_bonus", value: 0.22 }, { type: "lifesteal", value: 0.20 }, { type: "chain_attack", value: 1 }] },
    ]
  },
  {
    clan: "yokushin",
    name: "Voile du Désir",
    description: "L'illusion submerge les esprits les plus forts.",
    tiers: [
      { count: 2, label: "Esquive ciblage 20%", effects: [{ type: "dodge", value: 0.20 }] },
      { count: 3, label: "Esquive 20% · Confusion 28%", effects: [{ type: "dodge", value: 0.20 }, { type: "mass_confuse", value: 0.28 }] },
      { count: 4, label: "Esquive · Confusion · +20% HP", effects: [{ type: "dodge", value: 0.20 }, { type: "mass_confuse", value: 0.28 }, { type: "hp_bonus", value: 0.20 }] },
    ]
  },
  {
    clan: "pavillonNoir",
    name: "Pavillon Noir",
    description: "Sous ce drapeau, nul ne se rend.",
    tiers: [
      { count: 2, label: "+18% DEF", effects: [{ type: "def_bonus", value: 0.18 }] },
      { count: 3, label: "+18% DEF · Barrage initial 30%", effects: [{ type: "def_bonus", value: 0.18 }, { type: "cannon_barrage", value: 0.30 }] },
      { count: 4, label: "+18% DEF · Barrage 40% · +12% ATK", effects: [{ type: "def_bonus", value: 0.18 }, { type: "cannon_barrage", value: 0.40 }, { type: "atk_bonus", value: 0.12 }] },
    ]
  },
  {
    clan: "kama",
    name: "Étreinte de la Mort",
    description: "La faux des Kama moissonnes âme et chair.",
    tiers: [
      { count: 2, label: "Exécution 12% (<25% HP)", effects: [{ type: "execute", value: 0.12 }] },
      { count: 3, label: "Exéc. · Poison 5% HP/tour", effects: [{ type: "execute", value: 0.12 }, { type: "hp_regen", value: -0.05 }] },
      { count: 4, label: "Exéc. · Poison · +25% ATK/kill", effects: [{ type: "execute", value: 0.12 }, { type: "hp_regen", value: -0.05 }, { type: "atk_bonus", value: 0.25 }] },
    ]
  },
]

// ─── SYNERGY DETECTION ────────────────────────────────────────────────────────

export function getActiveSynergies(units: Unit[]): ActiveSynergy[] {
  const counts: Partial<Record<string, number>> = {}
  for (const u of units) {
    if (u.clan !== "neutre") counts[u.clan] = (counts[u.clan] || 0) + 1
  }
  return SYNERGIES.map(def => {
    const count = counts[def.clan] || 0
    let tier: 0 | 1 | 2 | null = null
    if (count >= def.tiers[2].count) tier = 2
    else if (count >= def.tiers[1].count) tier = 1
    else if (count >= def.tiers[0].count) tier = 0
    return { clan: def.clan, count, tier, def }
  }).filter(s => s.count > 0)
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function getRandomUnits(pool: Unit[], exclude: Unit[], count: number): Unit[] {
  const available = pool.filter(u => !exclude.find(e => e.id === u.id))
  const shuffled = [...available].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export const CLAN_LABELS: Record<string, string> = {
  hozuki:      "Hōzuki",
  karatachi:   "Karatachi",
  hoshigaki:   "Hoshigaki",
  yokushin:    "Yokushin",
  pavillonNoir:"Pav. Noir",
  kama:        "Kama",
  neutre:      "Neutre",
}

export const CLAN_COLORS: Record<string, string> = {
  hozuki:      "#4a90c0",
  karatachi:   "#c8a96e",
  hoshigaki:   "#5080c0",
  yokushin:    "#9060c8",
  pavillonNoir:"#c06050",
  kama:        "#70a060",
  neutre:      "#808080",
}

export const ROLE_LABELS: Record<string, string> = {
  tank:    "Garde",
  warrior: "Lame",
  assassin:"Ombre",
  mage:    "Maître",
  support: "Soutien",
  scout:   "Éclaireur",
}
