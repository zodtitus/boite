import type { Unit, SynergyDef, ActiveSynergy } from "@/types/enigme3"

// ─── ROSTER ──────────────────────────────────────────────────────────────────

export const ROSTER: Unit[] = [

  // ── HŌZUKI ──────────────────────────────────────────────────────────────
  {
    id: "suigetsu", name: "Suigetsu Hōzuki", kanji: "水月",
    clan: "hozuki", role: "scout", tier: 1,
    hp: 80, atk: 32, def: 13, spd: 74,
    ability: { name: "Hydrification", type: "damage_single", power: 1.6,
      description: "Se liquéfie et surgit à travers l'ennemi." },
    flavor: "Son corps d'eau le rend presque intouchable."
  },
  {
    id: "mangetsu", name: "Mangetsu Hōzuki", kanji: "満月",
    clan: "hozuki", role: "warrior", tier: 2,
    hp: 122, atk: 38, def: 22, spd: 55,
    ability: { name: "Sept Épées", type: "damage_single", power: 1.9,
      description: "Enchaîne deux coups d'épée légendaires." },
    flavor: "Maîtrise de toutes les épées légendaires de la Brume."
  },
  {
    id: "fuguki", name: "Fuguki Suikazan", kanji: "吹鬼",
    clan: "hozuki", role: "tank", tier: 3,
    hp: 172, atk: 24, def: 38, spd: 38,
    ability: { name: "Drain Samehada", type: "heal_self", power: 0.5,
      description: "Dévore le chakra ennemi pour régénérer sa vie." },
    flavor: "Porteur de Samehada, l'épée vivante."
  },
  {
    id: "kushimaru", name: "Kushimaru Kuriarare", kanji: "串丸",
    clan: "hozuki", role: "assassin", tier: 2,
    hp: 90, atk: 42, def: 14, spd: 80,
    ability: { name: "Fil du Linceul", type: "damage_single", power: 2.0,
      description: "Tresse l'ennemi dans ses fils mortels." },
    flavor: "Son aiguille-épée tisse la mort en silence."
  },
  {
    id: "jinin", name: "Jinin Akebino", kanji: "仁人",
    clan: "hozuki", role: "warrior", tier: 2,
    hp: 116, atk: 35, def: 20, spd: 53,
    ability: { name: "Frappe Émoussée", type: "damage_all", power: 0.55,
      description: "Son épée à dents brise armures et moral." },
    flavor: "Sa lame de guerre sème la terreur dans les rangs."
  },
  {
    id: "hebiichigo", name: "Hebiichigo", kanji: "蛇苺",
    clan: "hozuki", role: "mage", tier: 1,
    hp: 72, atk: 30, def: 14, spd: 60,
    ability: { name: "Pluie d'Épines", type: "damage_all", power: 0.65,
      description: "Bombarde tous les ennemis d'aiguilles explosives." },
    flavor: "La framboise-serpent frappe de loin, sans pitié."
  },
  {
    id: "hozuki_elder", name: "Ancien Hōzuki", kanji: "水老",
    clan: "hozuki", role: "support", tier: 3,
    hp: 140, atk: 18, def: 30, spd: 42,
    ability: { name: "Source Vitale", type: "heal_ally", power: 0.9,
      description: "Canalise l'eau sacrée pour soigner un allié." },
    flavor: "Dernier gardien de la fontaine ancestrale Hōzuki."
  },

  // ── KARATACHI ──────────────────────────────────────────────────────────
  {
    id: "kagura", name: "Kagura Karatachi", kanji: "花柄",
    clan: "karatachi", role: "warrior", tier: 1,
    hp: 88, atk: 30, def: 18, spd: 63,
    ability: { name: "Hiramekarei", type: "damage_single", power: 1.7,
      description: "Concentre du chakra pour une frappe dévastatrice." },
    flavor: "Héritier d'Hiramekarei, portant le poids de la Brume."
  },
  {
    id: "yagura", name: "Yagura Karatachi", kanji: "柳楽",
    clan: "karatachi", role: "mage", tier: 3,
    hp: 148, atk: 52, def: 30, spd: 58,
    ability: { name: "Queue du Sanbi", type: "damage_all", power: 0.9,
      description: "Libère la bête à queue sur l'ennemi." },
    flavor: "Quatrième Mizukage. Le Sanbi obéit à sa volonté."
  },
  {
    id: "chojuro", name: "Chojuro", kanji: "長十郎",
    clan: "karatachi", role: "tank", tier: 2,
    hp: 138, atk: 28, def: 36, spd: 48,
    ability: { name: "Bouclier de Chakra", type: "buff_def", power: 0.35,
      description: "Renforce la défense d'un allié vulnérable." },
    flavor: "Sixième Mizukage. Sa lame double protège les siens."
  },
  {
    id: "mei", name: "Mei Terumi", kanji: "照美",
    clan: "karatachi", role: "mage", tier: 3,
    hp: 112, atk: 56, def: 24, spd: 62,
    ability: { name: "Dissolution Ardente", type: "damage_single", power: 2.1,
      description: "Lance acide qui ignore la résistance ennemie." },
    flavor: "Cinquième Mizukage. Sa Nature Combinée corrode tout."
  },
  {
    id: "ao", name: "Ao", kanji: "蒼",
    clan: "karatachi", role: "support", tier: 1,
    hp: 82, atk: 22, def: 20, spd: 57,
    ability: { name: "Soin Tactique", type: "heal_ally", power: 0.7,
      description: "Analyse la situation et soigne l'allié le plus faible." },
    flavor: "Son Byakugan volé voit tout, anticipe tout."
  },
  {
    id: "gengetsu", name: "Gengetsu Hōzuki", kanji: "幻月",
    clan: "karatachi", role: "mage", tier: 2,
    hp: 96, atk: 42, def: 20, spd: 61,
    ability: { name: "Grand Clam", type: "damage_all", power: 0.7,
      description: "Invoque une grande illusion qui confond les ennemis." },
    flavor: "Deuxième Mizukage. Son illusion géante défie la réalité."
  },
  {
    id: "karatachi_scout", name: "Éclaireur de Kiri", kanji: "霧哨",
    clan: "karatachi", role: "scout", tier: 1,
    hp: 74, atk: 28, def: 14, spd: 78,
    ability: { name: "Frappe du Brouillard", type: "damage_single", power: 1.8,
      description: "Surgit du brouillard pour une attaque foudroyante." },
    flavor: "Le brouillard est sa maison. L'ennemi ne le verra jamais."
  },

  // ── HOSHIGAKI ──────────────────────────────────────────────────────────
  {
    id: "kisame", name: "Kisame Hoshigaki", kanji: "鬼鮫",
    clan: "hoshigaki", role: "warrior", tier: 3,
    hp: 156, atk: 50, def: 28, spd: 60,
    ability: { name: "Danse des Requins", type: "heal_self", power: 0.4,
      description: "Dévore le chakra ennemi et régénère ses forces." },
    flavor: "Monstre sans queue ni tête. Samehada choisit ses maîtres."
  },
  {
    id: "jinpachi", name: "Jinpachi Munashi", kanji: "仁八",
    clan: "hoshigaki", role: "warrior", tier: 2,
    hp: 118, atk: 38, def: 20, spd: 54,
    ability: { name: "Shibuki Explosif", type: "damage_single", power: 2.1,
      description: "Déclenche une cascade de bombes sur la cible." },
    flavor: "Son épée Shibuki accumule les sceaux explosifs."
  },
  {
    id: "ameyuri", name: "Ameyuri Ringo", kanji: "雨百合",
    clan: "hoshigaki", role: "assassin", tier: 2,
    hp: 88, atk: 44, def: 16, spd: 82,
    ability: { name: "Foudre Jumelle", type: "damage_single", power: 1.8,
      description: "Frappe deux fois avec des lames électrisées." },
    flavor: "Ses épées-éclairs Kiba terrifiaient des légions entières."
  },
  {
    id: "hoshigaki_raider", name: "Raider Hoshigaki", kanji: "鮫兵",
    clan: "hoshigaki", role: "warrior", tier: 1,
    hp: 90, atk: 32, def: 18, spd: 61,
    ability: { name: "Charge du Requin", type: "damage_single", power: 1.5,
      description: "Charge brutale qui brise la formation ennemie." },
    flavor: "Sa chair de requin lui sert d'armure naturelle."
  },
  {
    id: "hoshigaki_diver", name: "Plongeur Hoshigaki", kanji: "鮫潜",
    clan: "hoshigaki", role: "scout", tier: 1,
    hp: 76, atk: 28, def: 15, spd: 76,
    ability: { name: "Nage Fantôme", type: "damage_single", power: 1.6,
      description: "Surgit de l'eau à toute vitesse." },
    flavor: "Il se fond dans les eaux brumeuses du Pays de l'Eau."
  },
  {
    id: "hoshigaki_alpha", name: "Alpha Hoshigaki", kanji: "鮫首",
    clan: "hoshigaki", role: "tank", tier: 2,
    hp: 132, atk: 26, def: 33, spd: 44,
    ability: { name: "Écailles Dures", type: "buff_def", power: 0.3,
      description: "Renforce ses écailles pour résister aux assauts." },
    flavor: "Ses écailles de requin repoussent lames et jutsu."
  },
  {
    id: "hoshigaki_ancient", name: "Requin Ancestral", kanji: "古鮫",
    clan: "hoshigaki", role: "tank", tier: 3,
    hp: 176, atk: 24, def: 42, spd: 36,
    ability: { name: "Abîme des Profondeurs", type: "damage_all", power: 0.5,
      description: "Attire les ennemis et les écrase de pression." },
    flavor: "Né dans les abysses. Aucune lame ne l'a jamais blessé."
  },

  // ── YOKUSHIN ──────────────────────────────────────────────────────────
  {
    id: "shadow_weaver", name: "Tisseuse d'Ombres", kanji: "影織",
    clan: "yokushin", role: "support", tier: 1,
    hp: 70, atk: 22, def: 16, spd: 62,
    ability: { name: "Voile Protecteur", type: "buff_def", power: 0.25,
      description: "Tisse le brouillard en bouclier autour d'un allié." },
    flavor: "Elle tisse le brouillard en armure d'ombre."
  },
  {
    id: "mind_breaker", name: "Briseur d'Esprits", kanji: "心砕",
    clan: "yokushin", role: "mage", tier: 2,
    hp: 88, atk: 40, def: 18, spd: 63,
    ability: { name: "Genjutsu de Confusion", type: "damage_all", power: 0.6,
      description: "Plonge tous les ennemis dans un genjutsu dévastateur." },
    flavor: "Sa voix brise la volonté des plus solides."
  },
  {
    id: "soul_thief", name: "Voleur d'Âmes", kanji: "魂盗",
    clan: "yokushin", role: "assassin", tier: 2,
    hp: 86, atk: 42, def: 14, spd: 78,
    ability: { name: "Vol de Vie", type: "heal_self", power: 0.5,
      description: "Draine la force vitale de sa cible pour se soigner." },
    flavor: "Il prend ce dont il a besoin — y compris votre souffle."
  },
  {
    id: "veil_master", name: "Maître du Voile", kanji: "幕主",
    clan: "yokushin", role: "mage", tier: 3,
    hp: 106, atk: 52, def: 22, spd: 58,
    ability: { name: "Réalité Tordue", type: "damage_all", power: 0.95,
      description: "Distord la réalité, infligeant des dégâts massifs à tous." },
    flavor: "Il a regardé le néant si longtemps qu'il peut le projeter."
  },
  {
    id: "whisper", name: "Chuchoteur", kanji: "囁人",
    clan: "yokushin", role: "scout", tier: 1,
    hp: 72, atk: 30, def: 13, spd: 82,
    ability: { name: "Lame Silencieuse", type: "damage_single", power: 1.7,
      description: "Frappe depuis l'ombre sans qu'on l'entende approcher." },
    flavor: "Personne n'a jamais vu son visage."
  },
  {
    id: "mirror_self", name: "Miroir Vivant", kanji: "生鏡",
    clan: "yokushin", role: "support", tier: 2,
    hp: 92, atk: 24, def: 24, spd: 54,
    ability: { name: "Double Parfait", type: "heal_ally", power: 0.75,
      description: "Crée un clone salvateur pour protéger un allié." },
    flavor: "Est-il le miroir ou le reflet ?"
  },
  {
    id: "grand_illusionist", name: "Grand Illusionniste", kanji: "幻大師",
    clan: "yokushin", role: "mage", tier: 3,
    hp: 116, atk: 48, def: 26, spd: 55,
    ability: { name: "Monde Inversé", type: "damage_all", power: 0.8,
      description: "Retourne la perception des ennemis contre eux-mêmes." },
    flavor: "Dans son monde, vos forces deviennent vos faiblesses."
  },

  // ── PAVILLON NOIR ─────────────────────────────────────────────────────
  {
    id: "swashbuckler", name: "Flibustier", kanji: "海賊剣",
    clan: "pavillonNoir", role: "warrior", tier: 1,
    hp: 86, atk: 30, def: 18, spd: 61,
    ability: { name: "Estocade Pirate", type: "damage_single", power: 1.6,
      description: "Frappe rapide avec la lame recourbée du pirate." },
    flavor: "La mer lui appartient. Et la Brume aussi."
  },
  {
    id: "cannoneer", name: "Canonnier", kanji: "砲術師",
    clan: "pavillonNoir", role: "mage", tier: 1,
    hp: 75, atk: 32, def: 15, spd: 57,
    ability: { name: "Barrage Explosif", type: "damage_all", power: 0.7,
      description: "Bombarde toute la ligne ennemie de projectiles de chakra." },
    flavor: "Ses bombes illuminent le brouillard comme des étoiles."
  },
  {
    id: "sea_captain", name: "Capitaine des Mers", kanji: "海将",
    clan: "pavillonNoir", role: "tank", tier: 2,
    hp: 136, atk: 24, def: 35, spd: 46,
    ability: { name: "Proue d'Acier", type: "buff_def", power: 0.35,
      description: "Protège le groupe derrière son armure de fer." },
    flavor: "Il a navigué à travers tempêtes et jutsu du rang S."
  },
  {
    id: "corsair", name: "Corsaire", kanji: "私掠船",
    clan: "pavillonNoir", role: "assassin", tier: 2,
    hp: 86, atk: 42, def: 16, spd: 79,
    ability: { name: "Crochet & Lame", type: "damage_single", power: 1.9,
      description: "Crochet au visage + estocade mortelle." },
    flavor: "Il prend ce qui lui appartient — absolument tout."
  },
  {
    id: "first_mate", name: "Second", kanji: "副長",
    clan: "pavillonNoir", role: "support", tier: 2,
    hp: 94, atk: 26, def: 26, spd: 52,
    ability: { name: "Cri de Ralliement", type: "heal_ally", power: 0.8,
      description: "Galvanise un allié épuisé, restaurant ses forces." },
    flavor: "Sa voix galvanise même les plus blessés."
  },
  {
    id: "pirate_admiral", name: "Amiral Pirate", kanji: "海賊提督",
    clan: "pavillonNoir", role: "warrior", tier: 3,
    hp: 152, atk: 48, def: 26, spd: 65,
    ability: { name: "Tempête Déchaînée", type: "damage_all", power: 0.75,
      description: "Déchaîne une tempête de chakra sur tous les ennemis." },
    flavor: "Sa flotte a coulé des armadas entières. Il reste debout."
  },
  {
    id: "ghost_ship", name: "Vaisseau Fantôme", kanji: "幽霊船",
    clan: "pavillonNoir", role: "tank", tier: 3,
    hp: 182, atk: 20, def: 44, spd: 33,
    ability: { name: "Équipage Immortel", type: "buff_def", power: 0.5,
      description: "Invoque son équipage fantôme pour absorber les coups." },
    flavor: "On ne coule pas ce qui est déjà mort."
  },

  // ── KAMA ──────────────────────────────────────────────────────────────
  {
    id: "kama_novice", name: "Novice Kama", kanji: "鎌新",
    clan: "kama", role: "warrior", tier: 1,
    hp: 80, atk: 28, def: 16, spd: 63,
    ability: { name: "Faux Tournoyante", type: "damage_single", power: 1.4,
      description: "Taille en arc pour blesser profondément." },
    flavor: "Sa faux cherche encore à prouver sa valeur."
  },
  {
    id: "kama_hunter", name: "Chasseur Kama", kanji: "鎌狩",
    clan: "kama", role: "scout", tier: 1,
    hp: 74, atk: 30, def: 13, spd: 80,
    ability: { name: "Traque Mortelle", type: "damage_single", power: 1.9,
      description: "Pourchasse l'ennemi le plus faible sans relâche." },
    flavor: "Il sent le sang de loin. Il ne lâche jamais sa proie."
  },
  {
    id: "kama_reaper", name: "Faucheur Kama", kanji: "鎌死神",
    clan: "kama", role: "assassin", tier: 2,
    hp: 88, atk: 44, def: 14, spd: 77,
    ability: { name: "Marque de Mort", type: "damage_single", power: 2.0,
      description: "Marque l'ennemi d'un sceau fatal qui amplifie les dégâts." },
    flavor: "Sa marque suit la cible jusqu'au dernier souffle."
  },
  {
    id: "kama_sentinel", name: "Sentinelle Kama", kanji: "鎌番",
    clan: "kama", role: "tank", tier: 2,
    hp: 128, atk: 24, def: 35, spd: 42,
    ability: { name: "Position de Pierre", type: "buff_def", power: 0.45,
      description: "Adopte une posture imprenable pour tout encaisser." },
    flavor: "Il ne recule jamais. Jamais."
  },
  {
    id: "kama_oracle", name: "Oracle Kama", kanji: "鎌神",
    clan: "kama", role: "support", tier: 2,
    hp: 86, atk: 20, def: 22, spd: 51,
    ability: { name: "Malédiction de Mort", type: "heal_ally", power: 0.65,
      description: "Maudit les ennemis pour soigner les alliés de leur douleur." },
    flavor: "Elle lit la mort dans les yeux de chacun."
  },
  {
    id: "kama_harbinger", name: "Précurseur Kama", kanji: "鎌先触",
    clan: "kama", role: "warrior", tier: 3,
    hp: 148, atk: 50, def: 28, spd: 67,
    ability: { name: "Moisson Massive", type: "damage_all", power: 0.72,
      description: "Fauche tous les ennemis d'un arc de sa grande faux." },
    flavor: "Sa récolte n'est jamais petite."
  },
  {
    id: "kama_incarnation", name: "Incarnation Kama", kanji: "鎌化身",
    clan: "kama", role: "mage", tier: 3,
    hp: 126, atk: 55, def: 24, spd: 61,
    ability: { name: "Récolte des Âmes", type: "heal_self", power: 0.55,
      description: "Absorbe les âmes des morts pour se régénérer." },
    flavor: "La mort n'est pas sa fin — c'est son festin."
  },
]

// ─── SYNERGIES ────────────────────────────────────────────────────────────────

export const SYNERGIES: SynergyDef[] = [
  {
    clan: "hozuki",
    name: "Corps d'Eau",
    description: "Les Hōzuki transmutent leur chair en eau pure.",
    tiers: [
      { count: 2, label: "+18% HP", effects: [{ type: "hp_bonus", value: 0.18 }] },
      { count: 4, label: "+18% HP · Régén 6%/tour", effects: [{ type: "hp_bonus", value: 0.18 }, { type: "hp_regen", value: 0.06 }] },
      { count: 6, label: "+18% HP · Régén · Esquive 25%", effects: [{ type: "hp_bonus", value: 0.18 }, { type: "hp_regen", value: 0.06 }, { type: "dodge", value: 0.25 }] },
    ]
  },
  {
    clan: "karatachi",
    name: "Commandement de Kiri",
    description: "L'autorité du Mizukage galvanise tout le groupe.",
    tiers: [
      { count: 2, label: "Alliés +12% ATK", effects: [{ type: "atk_bonus", value: 0.12 }] },
      { count: 4, label: "Alliés +20% ATK", effects: [{ type: "atk_bonus", value: 0.20 }] },
      { count: 6, label: "Alliés +30% ATK", effects: [{ type: "atk_bonus", value: 0.30 }] },
    ]
  },
  {
    clan: "hoshigaki",
    name: "Meute de Requins",
    description: "La frénésie de combat s'emballe à chaque victoire.",
    tiers: [
      { count: 2, label: "Hoshigaki +22% ATK", effects: [{ type: "atk_bonus", value: 0.22 }] },
      { count: 4, label: "+22% ATK · Vol de vie 20%", effects: [{ type: "atk_bonus", value: 0.22 }, { type: "lifesteal", value: 0.20 }] },
      { count: 6, label: "+22% ATK · Vol de vie · Chaîne", effects: [{ type: "atk_bonus", value: 0.22 }, { type: "lifesteal", value: 0.20 }, { type: "chain_attack", value: 1 }] },
    ]
  },
  {
    clan: "yokushin",
    name: "Voile du Désir",
    description: "L'illusion submerge les esprits les plus forts.",
    tiers: [
      { count: 2, label: "Esquive ciblage 18%", effects: [{ type: "dodge", value: 0.18 }] },
      { count: 4, label: "Esquive 18% · Confusion 25%", effects: [{ type: "dodge", value: 0.18 }, { type: "mass_confuse", value: 0.25 }] },
      { count: 6, label: "Esquive · Confusion · Réd. 30%", effects: [{ type: "dodge", value: 0.18 }, { type: "mass_confuse", value: 0.25 }, { type: "hp_bonus", value: 0.20 }] },
    ]
  },
  {
    clan: "pavillonNoir",
    name: "Pavillon Noir",
    description: "Sous ce drapeau, nul ne se rend.",
    tiers: [
      { count: 2, label: "+18% DEF", effects: [{ type: "def_bonus", value: 0.18 }] },
      { count: 4, label: "+18% DEF · Barrage initial 30%", effects: [{ type: "def_bonus", value: 0.18 }, { type: "cannon_barrage", value: 0.30 }] },
      { count: 6, label: "+18% DEF · Barrage 40% · +10% ATK", effects: [{ type: "def_bonus", value: 0.18 }, { type: "cannon_barrage", value: 0.40 }, { type: "atk_bonus", value: 0.10 }] },
    ]
  },
  {
    clan: "kama",
    name: "Étreinte de la Mort",
    description: "La faux des Kama moissonnes âmes et chair.",
    tiers: [
      { count: 2, label: "Exécution 12% (<25% HP)", effects: [{ type: "execute", value: 0.12 }] },
      { count: 4, label: "Exéc. · Poison 5% HP/tour", effects: [{ type: "execute", value: 0.12 }, { type: "hp_regen", value: -0.05 }] },
      { count: 6, label: "Exéc. · Poison · +25% ATK/kill", effects: [{ type: "execute", value: 0.12 }, { type: "hp_regen", value: -0.05 }, { type: "atk_bonus", value: 0.25 }] },
    ]
  },
]

// ─── SYNERGY DETECTION ────────────────────────────────────────────────────────

export function getActiveSynergies(units: Unit[]): ActiveSynergy[] {
  const counts: Partial<Record<string, number>> = {}
  for (const u of units) counts[u.clan] = (counts[u.clan] || 0) + 1

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
  hozuki: "Hōzuki",
  karatachi: "Karatachi",
  hoshigaki: "Hoshigaki",
  yokushin: "Yokushin",
  pavillonNoir: "Pav. Noir",
  kama: "Kama",
}

export const CLAN_COLORS: Record<string, string> = {
  hozuki: "#4a90c0",
  karatachi: "#c8a96e",
  hoshigaki: "#5080c0",
  yokushin: "#9060c8",
  pavillonNoir: "#c06050",
  kama: "#70a060",
}

export const ROLE_LABELS: Record<string, string> = {
  tank: "Gardien",
  warrior: "Guerrier",
  assassin: "Assassin",
  mage: "Mage",
  support: "Soutien",
  scout: "Éclaireur",
}
