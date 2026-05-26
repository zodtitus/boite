export type NarrationBlock =
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "separator" }

export interface Narration {
  id: number
  roman: string
  title: string
  period: string
  blocks: NarrationBlock[]
}

export const narrations: Narration[] = [
  {
    id: 1,
    roman: "I",
    title: "Le Sang de l'Eau",
    period: "Clan Hōzuki · Premières années",
    blocks: [
      { type: "paragraph", text: "Je suis né dans l'eau." },
      { type: "paragraph", text: "Pas métaphoriquement — littéralement. On dit que j'ai ouvert les yeux pour la première fois sous la pluie, dans la tour Hōzuki, pendant que la brume étouffait Kirigakure comme elle le fait toujours à cette saison. Le premier son que j'ai entendu n'était pas une voix. C'était la pluie sur la pierre." },
      { type: "paragraph", text: "Je pense souvent à ça." },
      { type: "paragraph", text: "Les Hōzuki ne choisissent pas l'eau. L'eau choisit les Hōzuki. C'est une distinction qui paraît subtile et qui ne l'est pas. Elle dit tout de la relation que nous entretenons avec notre kekkei genkai — nous ne le contrôlons pas. Nous le sommes." },
      { type: "quote", text: "« Apprends à te liquéfier avant d'apprendre à frapper. Un Hōzuki qui frappe d'abord a déjà perdu. »" },
      { type: "paragraph", text: "Mon père m'a dit ça une fois, d'une façon qui n'appelait pas de réponse. Je n'ai pas répondu. J'ai gravé." },
    ],
  },
  {
    id: 2,
    roman: "II",
    title: "Le Premier Miroir",
    period: "Académie de Kirigakure · Deuxième année",
    blocks: [
      { type: "paragraph", text: "Le genjutsu est une question de perception." },
      { type: "paragraph", text: "Sensei Aruma me l'a dit le premier jour de cours. J'ai mis trois semaines à comprendre ce qu'il voulait dire. Pas par lenteur — par méfiance. Je n'accepte pas les affirmations sans les avoir testées." },
      { type: "paragraph", text: "Voilà ce que le genjutsu est, en vérité : il ne ment pas. Il gouverne la perception. La différence est fondamentale. Le mensonge peut être démasqué par la logique. La perception, elle, est la réalité — jusqu'à ce qu'on s'en rende compte." },
      { type: "paragraph", text: "Ce jour-là, j'ai compris que la discipline la plus puissante n'est pas celle qui brise le corps. C'est celle qui convainc l'esprit que le corps est déjà brisé." },
      { type: "paragraph", text: "J'ai demandé à Sensei Aruma si l'on pouvait utiliser un genjutsu sur soi-même. Il a mis une demi-seconde de trop à répondre." },
      { type: "quote", text: "« En théorie. »" },
      { type: "paragraph", text: "Je note toujours les demi-secondes de trop." },
    ],
  },
  {
    id: 3,
    roman: "III",
    title: "Les Livres de Jagetsu",
    period: "Bibliothèque du clan Hōzuki · Troisième année",
    blocks: [
      { type: "paragraph", text: "Je cherchais des questions pour l'examen de passage. Des choses mortes sur du papier — dates, noms, batailles." },
      { type: "paragraph", text: "Le livre était sur un rayon bas, à hauteur de genou. Deux volumes, spine bordeaux foncé, caractères dorés : Jagetsu Hōzuki — Traité des Illusions Profondes. Tome I et Tome II." },
      { type: "paragraph", text: "Je ne l'avais pas cherché. Je l'ai pris parce que le nom était le nôtre — et que je ne l'avais jamais vu cité nulle part. Je ne suis pas sorti de la bibliothèque avant l'heure du dîner." },
      { type: "quote", text: "« L'illusion parfaite n'est pas celle que la cible ne détecte pas. C'est celle qu'elle choisit de ne pas remettre en question. »" },
      { type: "paragraph", text: "Ce que Jagetsu écrit n'est pas une technique. C'est une philosophie — une façon de concevoir l'esprit humain comme un terrain régi par des règles implicites, et la mission du shinobi comme celle du seul joueur à les connaître." },
      { type: "paragraph", text: "Je ne suis pas encore à sa hauteur. Mais je sais maintenant où il est, et dans quelle direction je marche." },
    ],
  },
  {
    id: 4,
    roman: "IV",
    title: "Le Dojo des Sept",
    period: "Tour Hōzuki · Quatrième année",
    blocks: [
      { type: "paragraph", text: "Mon père m'a emmené au Dojo des Sept sans prévenir. Une aube froide, pas de petit-déjeuner, pas d'explication. C'est ainsi qu'Onigetsu enseigne." },
      { type: "paragraph", text: "Kurozai était là aussi — pas par hasard. Il y avait quelque chose de délibéré dans sa présence, comme dans tout ce que fait mon père." },
      { type: "paragraph", text: "La liquéfaction. Ce n'est pas un jutsu qu'on apprend. C'est une limite que l'on franchit — ou pas. Certains Hōzuki ne l'atteignent jamais. J'avais neuf ans et je n'en dormais plus la nuit depuis un mois." },
      { type: "paragraph", text: "Ce matin-là, face aux sept piliers de pierre et au regard silencieux d'Onigetsu, j'ai compris que je n'avais pas le choix. Pas parce qu'on m'y forçait. Parce que reculer aurait été la seule chose qui m'aurait défini pour toujours." },
      { type: "quote", text: "« L'eau ne recule pas. Elle contourne, elle s'infiltre, elle dissout. »" },
      { type: "paragraph", text: "J'ai franchi la limite. Kurozai a reçu sa marque le même jour. Ce genre d'expérience crée quelque chose entre deux personnes — quelque chose qu'on ne choisit pas mais qu'on ne peut pas ignorer." },
    ],
  },
  {
    id: 5,
    roman: "V",
    title: "La Prison de Sang",
    period: "Mission Hōzuki · Cinquième année",
    blocks: [
      { type: "paragraph", text: "Il y a des moments où le calcul cesse." },
      { type: "paragraph", text: "Kurozai était prise. La prison de sang d'un shinobi d'Ame — un jutsu primitif, brutal, efficace. Elle n'avait pas crié. Ce détail m'a frappé plus que tout le reste." },
      { type: "paragraph", text: "J'aurais pu attendre. Évaluer. Trouver le meilleur angle d'intervention avec le minimum d'exposition. C'est ce que la raison recommandait." },
      { type: "paragraph", text: "Je n'ai pas attendu." },
      { type: "quote", text: "« Ceux qui comptent pour moi sont protégés. Point. »" },
      { type: "paragraph", text: "Pas de calcul. Pas de stratégie. On n'abandonne pas ceux qui ont partagé une épreuve réelle. C'est une règle que je n'ai jamais formulée avant ce jour — et que je n'ai jamais eu besoin de reformuler depuis." },
    ],
  },
  {
    id: 6,
    roman: "VI",
    title: "La Première Défaite",
    period: "Frontière d'Oto · Mission de libération",
    blocks: [
      { type: "paragraph", text: "Le Taijutsu pur ne respecte pas le genjutsu." },
      { type: "paragraph", text: "C'est la leçon que j'ai apprise ce jour-là, les mains dans la poussière à la frontière d'Oto. Pas dans un livre. Pas dans un cours. Avec le corps." },
      { type: "paragraph", text: "Ils étaient trois. Spécialistes de corps-à-corps, sans chakra élaboré, sans fioritures. Juste la physicalité — brutale, immédiate, réelle. J'ai tenté le genjutsu. Ils ont traversé. J'ai tenté la liquidification. L'un d'eux avait étudié les Hōzuki. Il savait où frapper pour me forcer à reprendre forme." },
      { type: "paragraph", text: "La mission de libération a échoué. Ao Ren a été exfiltré par d'autres. Moi, j'ai été ramené." },
      { type: "quote", text: "« Ils ne sont pas une menace permanente. Ils sont une dette ouverte. »" },
      { type: "paragraph", text: "Je retournerai à cet endroit. Avec une réponse différente. Le corps que j'avais ce jour-là n'était pas suffisant. Le corps que j'aurai ne le sera pas non plus — tant que je n'aurai pas résolu la question que cette défaite a posée." },
      { type: "paragraph", text: "Debout jusqu'au bout. C'est tout ce que je peux promettre." },
    ],
  },
  {
    id: 7,
    roman: "VII",
    title: "La Porte",
    period: "Tour Hōzuki · Nuit après la défaite",
    blocks: [
      { type: "paragraph", text: "Je m'étais isolé. C'est ce que je fais quand quelque chose me pèse vraiment — je disparais dans ma chambre et je laisse le silence faire son travail." },
      { type: "paragraph", text: "Il y avait quelqu'un derrière la porte." },
      { type: "paragraph", text: "Pas un bruit, pas un appel — juste une présence perceptible, cette légère modification de l'air qu'on apprend à reconnaître quand on a grandi dans un clan. Kokigetsu. Je l'ai su avant d'ouvrir." },
      { type: "paragraph", text: "Il n'a pas dit grand-chose. Il n'avait pas besoin. Il était là, sans jugement, sans question. Il attendait — non pas que j'aille mieux, mais juste que je n'aie pas à l'être seul." },
      { type: "quote", text: "« Je me sens proche de lui. Et en même temps — loin. Comme deux eaux du même fleuve qui ne se rejoignent pas. »" },
      { type: "paragraph", text: "Ce geste n'a pas été oublié. Je ne l'oublierai pas." },
    ],
  },
  {
    id: 8,
    roman: "VIII",
    title: "Thorkel",
    period: "Académie · Cours de Suiton",
    blocks: [
      { type: "paragraph", text: "Il y a des rivalités qui naissent avant le premier échange. Thorkel Hoshigaki était de ceux-là." },
      { type: "paragraph", text: "En cours de suiton, j'étais meilleur. Objectivement — la maîtrise technique, la précision, le contrôle. Ce n'est pas de l'arrogance. C'est un constat que tous les élèves pouvaient faire ce jour-là." },
      { type: "paragraph", text: "Puis il a proposé un duel. Et il a gagné." },
      { type: "paragraph", text: "Ce n'est pas la défaite en elle-même qui m'a marqué. C'est la façon dont il l'a fait — avec cette économie de mouvement, cette lecture de mes intentions une demi-seconde avant que je les exprime. Quelqu'un qui me lisait vraiment." },
      { type: "paragraph", text: "Il m'a ramené au village après. Nous avons parlé d'avenir. De la place qu'il voulait dans le monde que je compte bâtir." },
      { type: "quote", text: "« J'ai attendri quelque chose dans sa garde. Une fissure, pas une ouverture. Ça suffit pour l'instant. »" },
      { type: "paragraph", text: "Le goût amer reste. Il reste toujours." },
    ],
  },
  {
    id: 9,
    roman: "IX",
    title: "Gin Karatachi",
    period: "Kirigakure · Première rencontre",
    blocks: [
      { type: "paragraph", text: "Il existe un type de talent qu'on reconnaît sans se tromper." },
      { type: "paragraph", text: "Gin Karatachi a ce talent. Immense. Ce n'est pas de l'admiration facile — c'est le constat froid d'un stratège qui sait jauger un adversaire. Et un adversaire de cette valeur-là, ça ne se méprise pas. Ça se respecte, ça s'étudie, ça se prépare." },
      { type: "paragraph", text: "Même objectif. Chemins différents. Ce qui nous lie est précisément ce qui nous oppose — et je le sais." },
      { type: "quote", text: "« Son talent m'effraie. Et c'est exactement pour ça qu'elle est l'adversaire qui compte le plus. »" },
      { type: "paragraph", text: "On ne redoute pas ce qu'on peut ignorer. On redoute ce qu'on est forcé de prendre au sérieux. Gin Karatachi est sérieuse." },
      { type: "paragraph", text: "Je m'y prépare. En conséquence." },
    ],
  },
  {
    id: 10,
    roman: "X",
    title: "Zengetsu",
    period: "Tour Hōzuki · Arrivée du cousin",
    blocks: [
      { type: "paragraph", text: "Sur le papier, c'est un cousin." },
      { type: "paragraph", text: "Dans les faits, c'est la menace la plus proche." },
      { type: "paragraph", text: "Fils du Mizukage régnant. Visible, fort, naturellement imposant — de cette façon qu'ont certains garçons de remplir une pièce sans effort apparent. Certains voient déjà en lui l'héritier du trône de Kiri. Ces certains ne sont pas des imbéciles." },
      { type: "paragraph", text: "Depuis son arrivée, j'observe. Chaque apparition, chaque interaction, chaque regard du clan dans sa direction — enregistré. Pas de haine ouverte. Pas de confrontation déclarée." },
      { type: "quote", text: "« La place que je convoite n'est pas vide. Et elle ne le sera pas sans effort. »" },
      { type: "paragraph", text: "Deux Hōzuki dans la même pièce, conscients de ce que l'autre représente. C'est une tension particulière — celle qui ne s'exprime jamais directement et qui, pour cette raison précise, ne disparaît jamais non plus." },
    ],
  },
  {
    id: 11,
    roman: "XI",
    title: "Ce que le Père ne dit pas",
    period: "Réflexions · Sixième année",
    blocks: [
      { type: "paragraph", text: "Onigetsu agit en profondeur." },
      { type: "paragraph", text: "En silence. Avec la patience d'un homme qui pense en décennies — et qui sait que les décennies sont à lui. Je ne comprends pas entièrement mon père. C'est précisément pour ça que je lui voue une admiration mêlée de méfiance." },
      { type: "paragraph", text: "Certains pères parlent avec leurs mots. D'autres avec leurs actes. Onigetsu parle avec ses silences — et les silences, je les lis mieux que la plupart." },
      { type: "quote", text: "« Certains pères parlent avec leur épée. Le mien aussi. »" },
      { type: "paragraph", text: "Plus le temps passe, plus je perçois quelque chose dans son regard — la recherche d'un héritier digne. Pas d'un fils. D'un héritier. La distinction est tout." },
      { type: "paragraph", text: "Je ne sais pas encore si je suis cet héritier. Mais je comprends maintenant que la réponse n'appartient pas à mon père. Elle m'appartient à moi." },
    ],
  },
  {
    id: 12,
    roman: "XII",
    title: "Ce qu'Umihime cache",
    period: "Réflexions · Sixième année",
    blocks: [
      { type: "paragraph", text: "C'est elle qui m'a élevé. Elle qui a comblé les silences laissés par Onigetsu." },
      { type: "paragraph", text: "Tengetsu éprouve pour elle une affection sincère. Pas aveugle." },
      { type: "paragraph", text: "Ses interactions avec les Karatachi — la façon dont elle se raidit imperceptiblement à certains noms, la façon dont elle change de sujet avec une fluidité trop calculée. Ce sont des patterns. Je les note depuis des mois." },
      { type: "quote", text: "« Elle cache quelque chose. Je le sens. Et je ne sais pas encore si ce quelque chose me concerne. »" },
      { type: "paragraph", text: "Je ne lui pose pas la question directement. Pas encore. Si je la pose trop tôt, elle aura le temps de construire une réponse. Je préfère attendre que l'occasion rende la question inévitable." },
      { type: "paragraph", text: "La confiance absolue n'est pas encore là. Mais l'affection, elle, est réelle. Les deux peuvent coexister. Je l'ai appris d'elle, justement." },
    ],
  },
  {
    id: 13,
    roman: "XIII",
    title: "Sudogetsu et la Chute",
    period: "Entraînement Hōzuki · Septième année",
    blocks: [
      { type: "paragraph", text: "Il m'a plongé dans son genjutsu sans prévenir." },
      { type: "paragraph", text: "Pas d'introduction, pas d'explication, pas de contexte pédagogique. Une seconde j'étais dans le couloir de la tour, la seconde d'après j'étais au fond d'un lac sans fond, sans chakra, sans repère." },
      { type: "paragraph", text: "J'ai mis sept minutes à en sortir. Je ne l'ai jamais admis à voix haute. Sept minutes dans un genjutsu de Sudogetsu, c'est long." },
      { type: "paragraph", text: "Après, il n'a pas commenté. Il m'a juste dit :" },
      { type: "quote", text: "« Tu as cherché la logique. Il fallait chercher la fissure. »" },
      { type: "paragraph", text: "On n'apprend pas dans les livres avec Sudogetsu. On apprend en tombant. Et l'oncle qui vous apprend ça sans ménagement mérite un respect particulier — le genre qui ne ressemble pas à de la gratitude, mais qui l'est quand même." },
    ],
  },
  {
    id: 14,
    roman: "XIV",
    title: "Ao Ren, Yokushin de Seconde Main",
    period: "Réflexions · Septième année",
    blocks: [
      { type: "paragraph", text: "Je sais très bien pourquoi Ao Ren me suit." },
      { type: "paragraph", text: "Je connais sa valeur — et je sais aussi qu'avant moi, il était lié à mon cousin. Ce détail n'échappe pas à Tengetsu. Il ne le dit pas. Mais il le note — et il traite ce lien avec la précaution que mérite une loyauté qui a déjà connu un autre maître." },
      { type: "quote", text: "« La loyauté d'un Yokushin se lit dans ses actes, pas dans ses serments. »" },
      { type: "paragraph", text: "Ao Ren est capable. Ses actes, jusqu'ici, l'attestent. Mais je maintiens une légère distance — non par méfiance active, mais par prudence structurelle. Il y a des confiances qui s'accordent immédiatement. Celle-là se gagnera progressivement." },
      { type: "paragraph", text: "Ce n'est pas de la froideur. C'est du réalisme." },
    ],
  },
  {
    id: 15,
    roman: "XV",
    title: "Ce que je convoite",
    period: "Réflexions · Hiver, septième année",
    blocks: [
      { type: "paragraph", text: "Quel imbécile révèle à ses concurrents ce qu'il convoite ?" },
      { type: "paragraph", text: "Personne dans ce clan ne connaît mes ambitions exactement — pas même mon père, qui les devine sans que je les aie jamais formulées à voix haute. C'est ainsi que ça doit rester." },
      { type: "paragraph", text: "Je monte. Lentement pour certains. Inexorablement pour ceux qui regardent vraiment." },
      { type: "paragraph", text: "L'ego comme premier bouclier, le calcul comme second réflexe — et en dessous, quelque chose que je ne nomme pas ici non plus. Certaines choses perdent leur force dès qu'on les couche sur du papier." },
      { type: "quote", text: "« La place est marquée. Le chemin est long. Les deux faits me conviennent parfaitement. »" },
      { type: "paragraph", text: "Je suis né dans l'eau. Je saurai liquéfier tous les obstacles." },
      { type: "separator" },
      { type: "paragraph", text: "Il reste des pages vides dans ce carnet. Je les remplirai." },
    ],
  },
]
