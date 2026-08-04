/**
 * Programme complet de 30 jours — 5 minutes par jour
 * Objectifs : perdre les joues du visage, perdre du poids, tonifier tout le corps
 *
 * Structure d'une séance (300s = 5 min) :
 *   - Échauffement : 30s
 *   - Circuit principal : 6 exercices × 40s = 240s
 *   - Récupération : 30s
 *
 * 4 phases de progression :
 *   - Jours  1-7  : Fondation       (doux, apprentissage)
 *   - Jours  8-14 : Progression      (intensité modérée)
 *   - Jours 15-21 : Intensification  (HIIT, amplitude)
 *   - Jours 22-30 : Maîtrise         (intensité maximale)
 */

export type ExerciseCategory =
  | 'face'
  | 'cardio'
  | 'tone'
  | 'warmup'
  | 'cooldown';

export type ProgramPhase =
  | 'Fondation'
  | 'Progression'
  | 'Intensification'
  | 'Maîtrise';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  image?: string;
  duration: number;
  description: string;
  instructions: string[];
  tips: string;
  targetMuscles: string;
  resourceId?: string;
}

export interface DayProgram {
  day: number;
  phase: ProgramPhase;
  title: string;
  subtitle: string;
  focus: string;
  duration: number;
  exercises: Exercise[];
  quote: string;
}

/* ------------------------------------------------------------------ */
/*  POULE D'EXERCICES — réutilisée et combinée sur 30 jours           */
/* ------------------------------------------------------------------ */

const E = {
  /* ----- ÉCHAUFFEMENT ----- */
  warmBreath: {
    id: 'warm-breath',
    name: 'Respiration dynamique',
    category: 'warmup' as const,
    image: '/images/ambient-cooldown.jpg',
    duration: 30,
    description:
      "Échauffement respiratoire pour oxygéner le corps et préparer les muscles.",
    instructions: [
      "Debout, pieds écartés largeur d'épaules",
      'Inspire profondément par le nez en levant les bras',
      'Expire par la bouche en descendant les bras',
      'Répète en gainant légèrement le ventre',
    ],
    tips: 'Garde le rythme 4 secondes inspiration, 4 secondes expiration.',
    targetMuscles: 'Diaphragme, épaules, circulation générale',
  },
  warmMarch: {
    id: 'warm-march',
    name: 'Marche sur place',
    category: 'warmup' as const,
    image: '/images/ex-cardio-knees.jpg',
    duration: 30,
    description: "Marche dynamique sur place pour réveiller tout le corps.",
    instructions: [
      'Marche sur place en levant bien les genoux',
      'Balance les bras naturellement',
      'Garde le buste droit et gainé',
      'Augmente progressivement le rythme',
    ],
    tips: 'Pose le pied à plat, sans à-coups.',
    targetMuscles: 'Jambes, mollets, épaules',
    resourceId: 'mixamo',
  },
  warmTwist: {
    id: 'warm-twist',
    name: 'Rotations du buste',
    category: 'warmup' as const,
    image: '/images/ambient-tone.jpg',
    duration: 30,
    description: "Rotations douces du tronc pour préparer le bas du corps.",
    instructions: [
      'Debout, pieds largeur épaules, bras croisés',
      'Pivote le buste à droite puis à gauche',
      'Garde les hanches stables',
      'Cherche l amplitude sans forcer',
    ],
    tips: 'Expire sur la rotation, inspire au centre.',
    targetMuscles: 'Obliques, bas du dos, épaules',
  },

  /* ----- VISAGE (perdre les joues) ----- */
  fishFace: {
    id: 'fish-face',
    name: 'Fish Face (joues creusées)',
    category: 'face' as const,
    image: '/images/ex-face-fish.jpg',
    duration: 40,
    description:
      "Exercice star pour affiner les joues : on creuse les joues en aspirant vers l'intérieur.",
    instructions: [
      'Aspire tes joues vers l intérieur comme un poisson',
      'Maintiens la contraction 5 secondes',
      'Relâche 2 secondes et recommence',
      'Garde le reste du visage détendu',
    ],
    tips:
      'Tu dois sentir tes joues coller aux dents. Plus tu tiens, plus le muscle tonifie.',
    targetMuscles: 'Muscles zygomatiques, buccinateur, joues',
    resourceId: 'gymvisual',
  },
  cheekLift: {
    id: 'cheek-lift',
    name: 'Sourire large (lift de joues)',
    category: 'face' as const,
    image: '/images/ex-face-cheek.jpg',
    duration: 40,
    description:
      "Sourire exagéré pour remonter les pommettes et tonifier les joues.",
    instructions: [
      'Souvre la bouche et souris le plus largement possible',
      'Pousse tes pommettes vers le haut',
      'Plisse légèrement les yeux',
      'Maintiens 10s, relâche 2s, recommence',
    ],
    tips: 'Imagine que tu souris avec tes oreilles : ça aide à bien lever les pommettes.',
    targetMuscles: 'Zygomatique majeur, pommettes, paupières',
    resourceId: 'sketchfab-yoga',
  },
  jawRelease: {
    id: 'jaw-release',
    name: 'Relâchement de mâchoire',
    category: 'face' as const,
    image: '/images/ex-face-jaw.jpg',
    duration: 40,
    description:
      "Mouvement de mâchoire pour affiner l'ovale du visage et relâcher les tensions.",
    instructions: [
      'Bouge la mâchoire alternativement à droite puis à gauche',
      'Ensuite, projette le menton vers l avant puis rentre-le',
      'Mouvement lent et contrôlé',
      'Respire régulièrement pendant le mouvement',
    ],
    tips: 'Pas de craquements forcés. Le mouvement doit rester fluide et sans douleur.',
    targetMuscles: 'Masséter, muscles masticateurs, ovale du visage',
    resourceId: 'gymvisual',
  },
  neckStretch: {
    id: 'neck-stretch',
    name: 'Étirement du cou',
    category: 'face' as const,
    image: '/images/ex-face-neck.jpg',
    duration: 40,
    description:
      "Étire le cou pour éliminer le double menton et drainer les joues.",
    instructions: [
      'Incline la tête vers la droite, oreille vers épaule',
      'Sentis l étirement sur le côté gauche du cou',
      'Reste 15s, change de côté',
      'Termine en regardant le plafond, menton vers le haut',
    ],
    tips: 'Épaules basses et détendues. Ne tire jamais brusquement la tête.',
    targetMuscles: 'Sterno-cléido-mastoïdien, platysma, sous-mental',
    resourceId: 'sketchfab-yoga',
  },
  lionFace: {
    id: 'lion-face',
    name: 'Face de lion',
    category: 'face' as const,
    image: '/images/ex-face-jaw.jpg',
    duration: 40,
    description:
      "Exercice yoga anti-âge : ouvrir grand la bouche et tirer la langue pour tonifier tout le visage.",
    instructions: [
      'Ouvre grand la bouche et les yeux',
      'Tire la langue vers le bas le plus loin possible',
      'Contracte tout le visage vers l extérieur',
      'Maintiens 5s, relâche 2s, répète',
    ],
    tips: 'C est l exercice le plus complet pour le bas du visage et le double menton.',
    targetMuscles: 'Platysma, langue, joues, paupières',
    resourceId: 'sketchfab-yoga',
  },
  chinLift: {
    id: 'chin-lift',
    name: 'Élévation du menton',
    category: 'face' as const,
    image: '/images/ex-face-neck.jpg',
    duration: 40,
    description:
      "Lève le menton vers le plafond pour cibler le double menton et le cou.",
    instructions: [
      'Redresse la tête, regarde le plafond',
      'Pousse le menton vers le haut et l avant',
      'Fais un baiser vers le ciel en contractant le cou',
      'Maintiens 5s, relâche, répète',
    ],
    tips: 'Tu dois sentir le bas du menton travailler intensément.',
    targetMuscles: 'Platysma, muscles sous-mentonniers',
    resourceId: 'gymvisual',
  },
  tonguePress: {
    id: 'tongue-press',
    name: 'Pression de langue au palais',
    category: 'face' as const,
    image: '/images/ex-face-fish.jpg',
    duration: 40,
    description:
      "Exercice discret pour affiner la mâchoire : la langue presse le palais.",
    instructions: [
      'Place la langue contre le palais, juste derrière les dents',
      'Appuie fermement vers le haut',
      'Maintiens la pression 10s',
      'Relâche 3s et recommence',
    ],
    tips: 'Exercice parfait à refaire dans la journée : dans les transports, au bureau.',
    targetMuscles: 'Langue, muscles masticateurs, ovale du visage',
  },

  /* ----- CARDIO (perdre du poids) ----- */
  jumpingJacks: {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    category: 'cardio' as const,
    image: '/images/ex-cardio-jacks.jpg',
    duration: 40,
    description:
      "Le grand classique du cardio : saut écarté bras-jambes pour brûler un max de calories.",
    instructions: [
      'Débout, pieds joints, bras le long du corps',
      'Saille en écartant jambes et bras au-dessus de la tête',
      'Reviens en sautant à la position de départ',
      'Garde un rythme soutenu et régulier',
    ],
    tips: 'Atterris genoux légèrement fléchis pour protéger les articulations.',
    targetMuscles: 'Cardio, épaules, mollets, cuisses',
    resourceId: 'mixamo',
  },
  highKnees: {
    id: 'high-knees',
    name: 'Montées de genoux',
    category: 'cardio' as const,
    image: '/images/ex-cardio-knees.jpg',
    duration: 40,
    description:
      "Course sur place en montant les genoux à hauteur de hanche : cardio explosif.",
    instructions: [
      'Court sur place en montant les genoux haut',
      'Vise la hauteur de hanche avec chaque genou',
      'Balanced les bras en opposition',
      'Reste sur la pointe des pieds',
    ],
    tips: 'Gainage abdominal serré pour protéger le dos.',
    targetMuscles: 'Cardio, abdos, fléchisseurs de hanche, quadriceps',
    resourceId: 'mixamo',
  },
  mountainClimbers: {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    category: 'cardio' as const,
    image: '/images/ex-cardio-climbers.jpg',
    duration: 40,
    description:
      "Position de planche, genoux alternés vers la poitrine : cardio + abdos explosifs.",
    instructions: [
      'Position de planche haute, mains sous les épaules',
      'Ramène un genou vers la poitrine',
      'Alterne rapidement les jambes comme en course',
      'Garde les hanches stables, ne lève pas les fesses',
    ],
    tips: 'Plus tu vas vite, plus le cardio travaille. Commence lentement pour bien placer.',
    targetMuscles: 'Cardio, abdos, obliques, épaules',
    resourceId: 'mixamo',
  },
  squatJumps: {
    id: 'squat-jumps',
    name: 'Sauts en squat',
    category: 'cardio' as const,
    image: '/images/ex-tone-squat.jpg',
    duration: 40,
    description:
      "Squat explosif avec saut : brûle des calories et tonifie les jambes.",
    instructions: [
      'Pieds largeur épaules, descends en squat',
      'Pousse explosivement vers le haut en sautant',
      'Atterris en douceur, genoux fléchis',
      'Enchaîne immédiatement le squat suivant',
    ],
    tips: 'Si tu entends un bruit en atterrissant, atterris trop lourdement. Sois léger.',
    targetMuscles: 'Cardio, quadriceps, fessiers, mollets',
    resourceId: 'mixamo',
  },
  burpees: {
    id: 'burpees',
    name: 'Burpees simplifiés',
    category: 'cardio' as const,
    image: '/images/ex-cardio-jacks.jpg',
    duration: 40,
    description:
      "Exercice complet : squat, planche, saut. Version accessible sans pompe complète.",
    instructions: [
      'Débout, descends en squat et pose les mains au sol',
      'Saute les pieds en arrière en position planche',
      'Ramène les pieds vers les mains',
      'Relève-toi avec un petit saut et bras au ciel',
    ],
    tips: 'Version débutant : remonte une jambe à la fois en arrière pour ménager le dos.',
    targetMuscles: 'Corps entier, cardio explosif',
    resourceId: 'darebee',
  },
  skaters: {
    id: 'skaters',
    name: 'Patineurs latéraux',
    category: 'cardio' as const,
    image: '/images/ex-cardio-knees.jpg',
    duration: 40,
    description:
      "Sauts latéraux d'un pied sur l'autre comme un patineur : cardio + équilibre.",
    instructions: [
      'Saute latéralement sur le pied droit',
      'Passe la jambe gauche derrière en croisé',
      'Saule ensuite sur le pied gauche',
      'Enchaîne en restant léger et rapide',
    ],
    tips: 'Abras les bras pour t équilibrer. Vise la largeur plutôt que la hauteur.',
    targetMuscles: 'Cardio, fessiers moyens, abducteurs',
    resourceId: 'mixamo',
  },

  /* ----- TONIFICATION (corps entier) ----- */
  squat: {
    id: 'squat',
    name: 'Squat',
    category: 'tone' as const,
    image: '/images/ex-tone-squat.jpg',
    duration: 40,
    description:
      "Roi des exercices : squat pour fessiers, cuisses et force du bas du corps.",
    instructions: [
      'Pieds largeur épaules, pointes légèrement en dehors',
      'Descends en poussant les fesses vers l arrière',
      'Cuisses parallèles au sol (ou plus haut si débutant)',
      'Remonte en poussant sur les talons',
    ],
    tips: 'Genoux dans l axe des pointes de pieds. Dos droit, regard vers l avant.',
    targetMuscles: 'Quadriceps, fessiers, ischio-jambiers',
    resourceId: 'muscle-and-strength',
  },
  plank: {
    id: 'plank',
    name: 'Planche (gainage)',
    category: 'tone' as const,
    image: '/images/ex-tone-plank.jpg',
    duration: 40,
    description:
      "Gainage statique : corps droit sur les avant-bras. Le meilleur pour la sangle abdominale.",
    instructions: [
      'Avant-bras au sol, coudes sous les épaules',
      'Corps aligné de la tête aux talons',
      'Contracte les abdos et les fessiers',
      'Ne laisse pas les hanches descendre',
    ],
    tips: 'Respire calmement. Si ça tremble, c est normal : c est le muscle qui travaille.',
    targetMuscles: 'Abdos profonds, transverse, lombaires',
    resourceId: 'muscle-and-strength',
  },
  lunge: {
    id: 'lunge',
    name: 'Fentes',
    category: 'tone' as const,
    image: '/images/ex-tone-lunge.jpg',
    duration: 40,
    description:
      "Fentes alternées pour travailler unilatéralement fessiers et cuisses.",
    instructions: [
      'Débout, fais un grand pas en avant',
      'Descends en pliant les deux genoux à 90°',
      'Le genou arrière effleure le sol',
      'Pousse sur le talon avant pour remonter',
    ],
    tips: 'Le genou avant ne dépasse pas la pointe du pied. Buste droit.',
    targetMuscles: 'Quadriceps, fessiers, ischio-jambiers',
    resourceId: 'muscle-and-strength',
  },
  gluteBridge: {
    id: 'glute-bridge',
    name: 'Pont fessier',
    category: 'tone' as const,
    image: '/images/ex-tone-bridge.jpg',
    duration: 40,
    description:
      "Allongé sur le dos, soulève le bassin pour tonifier fessiers et bas du dos.",
    instructions: [
      'Allongé sur le dos, pieds à plat, genoux pliés',
      'Pousse sur les talons pour lever le bassin',
      'Aligne genoux-hanches-épaules en haut',
      'Contracte les fessiers 2s en haut, redesends',
    ],
    tips: 'Pousse depuis les talons, pas les pointes. Serre les fessiers en haut.',
    targetMuscles: 'Grand fessier, ischio-jambiers, bas du dos',
    resourceId: 'muscle-and-strength',
  },
  pushups: {
    id: 'pushups',
    name: 'Pompes (adaptées)',
    category: 'tone' as const,
    image: '/images/ex-tone-plank.jpg',
    duration: 40,
    description:
      "Pompes sur les genoux ou contre un mur : haut du corps et gainage.",
    instructions: [
      'Mains au sol largeur épaules',
      'Version accessible : genoux au sol, chevules croisés',
      'Descends la poitrine vers le sol, coudes à 45°',
      'Pousse pour remonter en gainant les abdos',
    ],
    tips: 'Mieux vaut 5 pompes parfaites que 15 mal exécutées. Garde le corps aligné.',
    targetMuscles: 'Pectoraux, triceps, épaules, abdos',
    resourceId: 'muscle-and-strength',
  },
  bicycleCrunch: {
    id: 'bicycle-crunch',
    name: 'Crunch vélo',
    category: 'tone' as const,
    image: '/images/ex-tone-bridge.jpg',
    duration: 40,
    description:
      "Abdos en mouvement vélo : coudes vers genou opposé pour tout le buste.",
    instructions: [
      'Allongé, mains derrière la tête',
      'Ramène le coude droit vers le genou gauche',
      'Étends la jambe droite en même temps',
      'Alterne comme en pédalant',
    ],
    tips: 'Ne tire pas sur la nuque. Les abdos font le travail, pas les bras.',
    targetMuscles: 'Grands droits, obliques',
    resourceId: 'darebee',
  },
  wallSit: {
    id: 'wall-sit',
    name: 'Chaise contre un mur',
    category: 'tone' as const,
    image: '/images/ex-tone-squat.jpg',
    duration: 40,
    description:
      "Position assise immobile contre un mur : endurance des cuisses.",
    instructions: [
      'Dos contre un mur, descends jusqu à avoir les genoux à 90°',
      'Cuisses parallèles au sol',
      'Maintiens la position immobile',
      'Poids dans les talons',
    ],
    tips: 'Si ça brûle, c est parfait. Respire profondément et tiens.',
    targetMuscles: 'Quadriceps, fessiers',
    resourceId: 'darebee',
  },

  /* ----- RÉCUPÉRATION ----- */
  coolStretch: {
    id: 'cool-stretch',
    name: 'Étirement global',
    category: 'cooldown' as const,
    image: '/images/ambient-cooldown.jpg',
    duration: 30,
    description:
      "Récupération active : étire tout le corps pour relâcher les tensions.",
    instructions: [
      'Étire les bras vers le ciel, respire profondément',
      'Penche-toi vers l avant pour étirer le dos',
      'Roule doucement pour remonter vertèbre par vertèbre',
      'Termine par 3 respirations profondes',
    ],
    tips: 'Pas de rebond. Étire en douceur, 20s par position.',
    targetMuscles: 'Dos, ischio-jambiers, épaules',
    resourceId: 'sketchfab-yoga',
  },
  coolBreath: {
    id: 'cool-breath',
    name: 'Respiration apaisante',
    category: 'cooldown' as const,
    image: '/images/ambient-cooldown.jpg',
    duration: 30,
    description:
      "Respiration finale pour faire redescendre le rythme cardiaque.",
    instructions: [
      'Débout ou assis, dos droit',
      'Inspire 4s par le nez, gonfle le ventre',
      'Retiens 2s',
      'Expire 6s par la bouche',
    ],
    tips: 'L expiration plus longue que l inspiration active le système parasympathique (calme).',
    targetMuscles: 'Système nerveux, récupération',
    resourceId: 'sketchfab-yoga',
  },
};

/* ------------------------------------------------------------------ */
/*  PROGRAMME 30 JOURS                                                 */
/* ------------------------------------------------------------------ */

export const program: DayProgram[] = [
  /* ===== PHASE 1 : FONDATION (Jours 1-7) ===== */
  {
    day: 1,
    phase: 'Fondation',
    title: 'Premier élan',
    subtitle: 'Découverte en douceur',
    focus: "Visage + cardio léger pour lancer la machine en douceur.",
    duration: 300,
    exercises: [
      E.warmBreath,
      E.fishFace,
      E.cheekLift,
      E.jumpingJacks,
      E.squat,
      E.gluteBridge,
      E.coolBreath,
    ],
    quote: 'Un voyage de mille kilomètres commence par un seul pas.',
  },
  {
    day: 2,
    phase: 'Fondation',
    title: 'Réveil du visage',
    subtitle: 'Cible les joues',
    focus: "Focus sur les joues avec un peu de cardio pour démarrer la dépense.",
    duration: 300,
    exercises: [
      E.warmMarch,
      E.fishFace,
      E.cheekLift,
      E.jawRelease,
      E.highKnees,
      E.plank,
      E.coolStretch,
    ],
    quote: "La constance bat l intensité. Montre-toi chaque jour.",
  },
  {
    day: 3,
    phase: 'Fondation',
    title: 'Cœur et jambes',
    subtitle: 'Cardio + tonification',
    focus: "On monte un peu le cardio et on tonifie le bas du corps.",
    duration: 300,
    exercises: [
      E.warmTwist,
      E.neckStretch,
      E.jumpingJacks,
      E.squat,
      E.lunge,
      E.gluteBridge,
      E.coolBreath,
    ],
    quote: "Ton corps est capable de bien plus que tu ne le penses.",
  },
  {
    day: 4,
    phase: 'Fondation',
    title: 'Affinage du visage',
    subtitle: 'Joues + menton',
    focus: "Combinaison joues et menton pour affiner l ovale du visage.",
    duration: 300,
    exercises: [
      E.warmBreath,
      E.fishFace,
      E.chinLift,
      E.cheekLift,
      E.highKnees,
      E.squat,
      E.coolStretch,
    ],
    quote: "Les petites actions répétées chaque jour deviennent de grands changements.",
  },
  {
    day: 5,
    phase: 'Fondation',
    title: 'Gainage et cardio',
    subtitle: 'Abdos + rythme',
    focus: "On découvre la planche et on ajoute du cardio pour le cœur.",
    duration: 300,
    exercises: [
      E.warmMarch,
      E.jawRelease,
      E.jumpingJacks,
      E.plank,
      E.lunge,
      E.gluteBridge,
      E.coolBreath,
    ],
    quote: "La douleur d aujourd hui est la force de demain.",
  },
  {
    day: 6,
    phase: 'Fondation',
    title: 'Visage de lion',
    subtitle: 'Yoga facial complet',
    focus: "On intègre la face de lion : l exercice le plus complet pour le visage.",
    duration: 300,
    exercises: [
      E.warmTwist,
      E.lionFace,
      E.cheekLift,
      E.neckStretch,
      E.squat,
      E.plank,
      E.coolStretch,
    ],
    quote: "Prends soin de ton corps. C est le seul endroit où tu es obligé de vivre.",
  },
  {
    day: 7,
    phase: 'Fondation',
    title: 'Bilan de semaine 1',
    subtitle: 'On consolide',
    focus: "Récapitulatif de la semaine : tous les exercices appris en un flow.",
    duration: 300,
    exercises: [
      E.warmBreath,
      E.fishFace,
      E.lionFace,
      E.jumpingJacks,
      E.squat,
      E.plank,
      E.coolBreath,
    ],
    quote: "Une semaine déjà. Tu as fait le plus dur : commencer.",
  },

  /* ===== PHASE 2 : PROGRESSION (Jours 8-14) ===== */
  {
    day: 8,
    phase: 'Progression',
    title: 'On monte en intensité',
    subtitle: 'Cardio plus soutenu',
    focus: "On ajoute les mountain climbers : cardio + abdos explosifs.",
    duration: 300,
    exercises: [
      E.warmMarch,
      E.fishFace,
      E.chinLift,
      E.mountainClimbers,
      E.squat,
      E.lunge,
      E.coolStretch,
    ],
    quote: "Le succès, c est se relever une fois de plus qu on est tombé.",
  },
  {
    day: 9,
    phase: 'Progression',
    title: 'Haut du corps',
    subtitle: 'Découverte des pompes',
    focus: "On introduit les pompes adaptées pour tonifier le haut du corps.",
    duration: 300,
    exercises: [
      E.warmTwist,
      E.cheekLift,
      E.jawRelease,
      E.jumpingJacks,
      E.pushups,
      E.plank,
      E.coolBreath,
    ],
    quote: "Ne compare pas tes débuts à la fin de quelqu un d autre.",
  },
  {
    day: 10,
    phase: 'Progression',
    title: 'Brûle calories',
    subtitle: 'HIIT modéré',
    focus: "Enchaînement cardio plus rapide pour augmenter la dépense calorique.",
    duration: 300,
    exercises: [
      E.warmMarch,
      E.fishFace,
      E.lionFace,
      E.highKnees,
      E.mountainClimbers,
      E.squat,
      E.coolStretch,
    ],
    quote: "La sueur d aujourd hui est le succès de demain.",
  },
  {
    day: 11,
    phase: 'Progression',
    title: 'Fessiers et cuisses',
    subtitle: "Spécial bas du corps",
    focus: "Cible fessiers et cuisses pour galber et brûler.",
    duration: 300,
    exercises: [
      E.warmBreath,
      E.neckStretch,
      E.chinLift,
      E.squat,
      E.lunge,
      E.gluteBridge,
      E.coolBreath,
    ],
    quote: "Ton corps peut presque tout. C est ton esprit qu il faut convaincre.",
  },
  {
    day: 12,
    phase: 'Progression',
    title: 'Abdos et visage',
    subtitle: 'Sangle abdominale',
    focus: "On ajoute les crunchs vélo pour les obliques et le ventre plat.",
    duration: 300,
    exercises: [
      E.warmTwist,
      E.fishFace,
      E.cheekLift,
      E.bicycleCrunch,
      E.plank,
      E.mountainClimbers,
      E.coolStretch,
    ],
    quote: "Ce n est pas ce que tu fais de temps en temps, mais ce que tu fais chaque jour.",
  },
  {
    day: 13,
    phase: 'Progression',
    title: 'Endurance',
    subtitle: 'Chaise contre mur',
    focus: "On découvre la chaise contre le mur : endurance pure des cuisses.",
    duration: 300,
    exercises: [
      E.warmMarch,
      E.lionFace,
      E.chinLift,
      E.jumpingJacks,
      E.wallSit,
      E.pushups,
      E.coolBreath,
    ],
    quote: "Quand ça brûle, c est que le changement est en train de se faire.",
  },
  {
    day: 14,
    phase: 'Progression',
    title: 'Cap de la moitié',
    subtitle: 'Bilan semaine 2',
    focus: "Récapitulatif intensif : tout le programme de la semaine en un flow.",
    duration: 300,
    exercises: [
      E.warmBreath,
      E.fishFace,
      E.lionFace,
      E.highKnees,
      E.squat,
      E.bicycleCrunch,
      E.coolStretch,
    ],
    quote: "Tu es plus fort maintenant qu il y a 14 jours. Continue.",
  },

  /* ===== PHASE 3 : INTENSIFICATION (Jours 15-21) ===== */
  {
    day: 15,
    phase: 'Intensification',
    title: 'HIIT explosif',
    subtitle: 'Sauts en squat',
    focus: "On introduit les sauts en squat : cardio + puissance des jambes.",
    duration: 300,
    exercises: [
      E.warmMarch,
      E.fishFace,
      E.lionFace,
      E.squatJumps,
      E.mountainClimbers,
      E.plank,
      E.coolStretch,
    ],
    quote: "La magie opère en dehors de ta zone de confort.",
  },
  {
    day: 16,
    phase: 'Intensification',
    title: 'Burpees accessibles',
    subtitle: "Corps complet",
    focus: "Découverte des burpees simplifiés : l exercice le plus complet.",
    duration: 300,
    exercises: [
      E.warmTwist,
      E.cheekLift,
      E.chinLift,
      E.burpees,
      E.squat,
      E.lunge,
      E.coolBreath,
    ],
    quote: "Tu ne sais pas de quoi tu es capable tant que tu ne te pousses pas.",
  },
  {
    day: 17,
    phase: 'Intensification',
    title: 'Patineurs et agilité',
    subtitle: 'Cardio latéral',
    focus: "Patineurs latéraux pour cardio, équilibre et abducteurs.",
    duration: 300,
    exercises: [
      E.warmMarch,
      E.fishFace,
      E.jawRelease,
      E.skaters,
      E.highKnees,
      E.squat,
      E.coolStretch,
    ],
    quote: "L agilité du corps naît de la régularité de l effort.",
  },
  {
    day: 18,
    phase: 'Intensification',
    title: 'Force et volume',
    subtitle: 'Haut + bas du corps',
    focus: "Combo pompes, squats et fentes pour travailler tout le corps.",
    duration: 300,
    exercises: [
      E.warmBreath,
      E.lionFace,
      E.neckStretch,
      E.pushups,
      E.squat,
      E.lunge,
      E.coolBreath,
    ],
    quote: "La force n est pas une question de taille, mais de régularité.",
  },
  {
    day: 19,
    phase: 'Intensification',
    title: 'Brûle-max cardio',
    subtitle: 'HIIT long',
    focus: "Enchaînement cardio long sans récup : calorie bomb.",
    duration: 300,
    exercises: [
      E.warmMarch,
      E.fishFace,
      E.cheekLift,
      E.jumpingJacks,
      E.highKnees,
      E.mountainClimbers,
      E.coolStretch,
    ],
    quote: "Le corps atteint ce que l esprit croit. Crois en toi.",
  },
  {
    day: 20,
    phase: 'Intensification',
    title: 'Gainage extrême',
    subtitle: 'Core et posture',
    focus: "Focus gainage : planche, mountain climbers et abdos.",
    duration: 300,
    exercises: [
      E.warmTwist,
      E.chinLift,
      E.lionFace,
      E.plank,
      E.bicycleCrunch,
      E.mountainClimbers,
      E.coolBreath,
    ],
    quote: "Un core fort, un dos sauvé pour la vie.",
  },
  {
    day: 21,
    phase: 'Intensification',
    title: 'Cap des 3 semaines',
    subtitle: 'Bilan semaine 3',
    focus: "Test complet : le meilleur des 3 semaines en une séance.",
    duration: 300,
    exercises: [
      E.warmBreath,
      E.fishFace,
      E.lionFace,
      E.squatJumps,
      E.burpees,
      E.plank,
      E.coolStretch,
    ],
    quote: "21 jours. Tu n es plus le même. Tu es plus fort, plus souple, plus confiant.",
  },

  /* ===== PHASE 4 : MAÎTRISE (Jours 22-30) ===== */
  {
    day: 22,
    phase: 'Maîtrise',
    title: 'Explosivité',
    subtitle: 'Sauts et puissance',
    focus: "On combine sauts en squat et patineurs pour la puissance.",
    duration: 300,
    exercises: [
      E.warmMarch,
      E.fishFace,
      E.lionFace,
      E.squatJumps,
      E.skaters,
      E.squat,
      E.coolStretch,
    ],
    quote: "La puissance, c est la force appliquée vite.",
  },
  {
    day: 23,
    phase: 'Maîtrise',
    title: 'Corps complet HIIT',
    subtitle: 'Burpees et pompes',
    focus: "Enchaînement burpees + pompes pour le haut et le cardio.",
    duration: 300,
    exercises: [
      E.warmTwist,
      E.cheekLift,
      E.chinLift,
      E.burpees,
      E.pushups,
      E.plank,
      E.coolBreath,
    ],
    quote: "Le corps complet, c est l efficacité maximale.",
  },
  {
    day: 24,
    phase: 'Maîtrise',
    title: 'Jambes d acier',
    subtitle: 'Endurance bas du corps',
    focus: "Chaise contre mur + fentes + squats : les jambes parlent.",
    duration: 300,
    exercises: [
      E.warmMarch,
      E.lionFace,
      E.neckStretch,
      E.wallSit,
      E.squat,
      E.lunge,
      E.coolStretch,
    ],
    quote: "Les jambes fortes portent un esprit fort.",
  },
  {
    day: 25,
    phase: 'Maîtrise',
    title: 'Cardio infernal',
    subtitle: 'HIIT maximal',
    focus: "Le cardio le plus intense du programme. Donnne tout.",
    duration: 300,
    exercises: [
      E.warmBreath,
      E.fishFace,
      E.cheekLift,
      E.highKnees,
      E.mountainClimbers,
      E.squatJumps,
      E.coolBreath,
    ],
    quote: "Quand tu veux abandonner, souviens-toi pourquoi tu as commencé.",
  },
  {
    day: 26,
    phase: 'Maîtrise',
    title: 'Visage sculpté',
    subtitle: 'Yoga facial avancé',
    focus: "Focus maximal visage : tous les exercices faciaux réunis.",
    duration: 300,
    exercises: [
      E.warmTwist,
      E.fishFace,
      E.lionFace,
      E.cheekLift,
      E.chinLift,
      E.jawRelease,
      E.coolBreath,
    ],
    quote: "Un visage détendu est un visage rayonnant.",
  },
  {
    day: 27,
    phase: 'Maîtrise',
    title: 'Force et volume',
    subtitle: 'Renforcement complet',
    focus: "Pompes, squats, fentes, pont : la séance force du programme.",
    duration: 300,
    exercises: [
      E.warmMarch,
      E.fishFace,
      E.lionFace,
      E.pushups,
      E.squat,
      E.lunge,
      E.coolStretch,
    ],
    quote: "La force n arrive pas de ce que tu peux faire, mais de surmonter ce que tu ne pensais pas pouvoir.",
  },
  {
    day: 28,
    phase: 'Maîtrise',
    title: 'Avant-dernier round',
    subtitle: 'HIIT + force',
    focus: "Combo explosif : burpees, mountain climbers et abdos.",
    duration: 300,
    exercises: [
      E.warmBreath,
      E.cheekLift,
      E.chinLift,
      E.burpees,
      E.mountainClimbers,
      E.bicycleCrunch,
      E.coolStretch,
    ],
    quote: "Plus que deux jours. Ta transformation est presque complète.",
  },
  {
    day: 29,
    phase: 'Maîtrise',
    title: 'La grande épreuve',
    subtitle: 'Tout en intensité',
    focus: "La séance la plus complète du programme. Donnne tout ce qu il te reste.",
    duration: 300,
    exercises: [
      E.warmMarch,
      E.fishFace,
      E.lionFace,
      E.squatJumps,
      E.burpees,
      E.plank,
      E.coolBreath,
    ],
    quote: "Aujourd hui, tu découvres de quoi tu es vraiment capable.",
  },
  {
    day: 30,
    phase: 'Maîtrise',
    title: 'Jour 30 — Ta victoire',
    subtitle: 'Célébration finale',
    focus: "La séance finale : un flow représentatif de tout ton parcours.",
    duration: 300,
    exercises: [
      E.warmBreath,
      E.fishFace,
      E.lionFace,
      E.jumpingJacks,
      E.squat,
      E.plank,
      E.coolStretch,
    ],
    quote: "30 jours. Tu l as fait. Ce n est pas une fin, c est un début. Bienvenue dans ta nouvelle vie.",
  },
];

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

export const PHASES: Record<ProgramPhase, {
  label: string;
  description: string;
  color: string;
  gradient: string;
  days: string;
}> = {
  Fondation: {
    label: 'Fondation',
    description: "Apprentissage des mouvements en douceur",
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-500',
    days: 'Jours 1-7',
  },
  Progression: {
    label: 'Progression',
    description: "Intensité modérée et nouveaux exercices",
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500',
    days: 'Jours 8-14',
  },
  Intensification: {
    label: 'Intensification',
    description: "HIIT, explosivité et amplitude",
    color: 'orange',
    gradient: 'from-orange-500 to-rose-500',
    days: 'Jours 15-21',
  },
  Maîtrise: {
    label: 'Maîtrise',
    description: "Intensité maximale et performance",
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600',
    days: 'Jours 22-30',
  },
};

export const TOTAL_DAYS = program.length;
export const TOTAL_DURATION = program.reduce((s, d) => s + d.duration, 0);
export const TOTAL_EXERCISES = program.reduce(
  (s, d) => s + d.exercises.length,
  0,
);

export function getDay(day: number): DayProgram | undefined {
  return program.find((d) => d.day === day);
}

export function getNextDay(completedDays: number[]): number | null {
  for (let i = 1; i <= TOTAL_DAYS; i++) {
    if (!completedDays.includes(i)) return i;
  }
  return null;
}
