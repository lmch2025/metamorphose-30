/**
 * Task ID: 2 — Curated FREE resources for 3D character models and realistic
 * exercise / movement animations that the user can imitate at home
 * (no equipment, small space).
 *
 * Resources were discovered via the z-ai-web-dev-sdk `web_search` function
 * (see /home/z/my-project/scripts/research-resources.ts) and curated by hand.
 *
 * Selection criteria (in priority order):
 *   1. 100% free for the core use-case (no heavy freemium limits).
 *   2. Works directly in the browser (no software install preferred).
 *   3. Shows realistic human movements: face exercises, jumping jacks, squats,
 *      lunges, planks, mountain climbers, high knees, glute bridges, stretching.
 *
 * Descriptions are written in French as requested by the project owner.
 */

export type FitnessResourceCategory =
  | '3d-character'
  | 'animation'
  | 'video-demo'
  | 'pose-library';

export interface FitnessResource {
  /** Stable unique id, kebab-case. */
  id: string;
  /** Display name of the resource. */
  name: string;
  /** Canonical URL of the resource (landing page or most useful entry point). */
  url: string;
  /** What kind of resource it is. */
  category: FitnessResourceCategory;
  /** True if the core feature is usable at no cost (no paid plan required). */
  free: boolean;
  /** True if it works directly in the browser without installing software. */
  inBrowser: boolean;
  /** Short 1-2 sentence description in French. */
  description: string;
  /** Short French note about which exercises / movements it helps with. */
  bestFor: string;
}

export const fitnessResources: FitnessResource[] = [
  {
    id: 'mixamo',
    name: 'Mixamo (Adobe)',
    url: 'https://www.mixamo.com',
    category: 'animation',
    free: true,
    inBrowser: true,
    description:
      "Service gratuit d'Adobe offrant des centaines de personnages 3D riggés et une bibliothèque de mouvements animés capturés en motion-capture. L'utilisateur choisit un personnage, applique une animation (squat, jumping jack, course, étirements…) et la lit directement dans le navigateur, image par image, pour imiter le geste à la perfection.",
    bestFor:
      'Jumping jacks, squats, fentes, course sur place (high knees), mountain climbers, étirements — idéal pour visualiser chaque phase du mouvement sous tous les angles.',
  },
  {
    id: 'sketchfab-exercise',
    name: 'Sketchfab — Exercise & Workout models',
    url: 'https://sketchfab.com/tags/exercise',
    category: '3d-character',
    free: true,
    inBrowser: true,
    description:
      "Plateforme communautaire de modèles 3D avec une visionneuse WebGL intégrée au navigateur. La section « exercise » regroupe des personnages animés en plein mouvement (pompes, tractions, gainage) que l'on peut faire tourner à 360° et lire en boucle sans rien télécharger.",
    bestFor:
      'Pompes, gainage (plank), abdos, mouvements de musculation au poids du corps — visualisation 3D réaliste dans le navigateur.',
  },
  {
    id: 'sketchfab-yoga',
    name: 'Sketchfab — Yoga & Stretching 3D models',
    url: 'https://sketchfab.com/tags/yoga',
    category: 'pose-library',
    free: true,
    inBrowser: true,
    description:
      "Sous-ensemble de Sketchfab dédié aux postures de yoga et d'étirement. Chaque posture est modélisée en 3D et visualisable dans le navigateur à 360°, ce qui permet de comprendre l'alignement du corps et de reproduire la pose avec précision.",
    bestFor:
      'Postures de yoga, étirements, équilibre, souplesse — parfait pour les jours de récupération et de stretching du programme 30 jours.',
  },
  {
    id: 'anatomytool',
    name: 'AnatomyTool — Open 3D Anatomy',
    url: 'https://anatomytool.org/open3dmodel',
    category: '3d-character',
    free: true,
    inBrowser: true,
    description:
      "Modèle anatomique 3D open source développé par des anatomistes universitaires. Visualisable en ligne, il montre les muscles et les articulations sollicités pendant un mouvement, aidant l'utilisateur à comprendre QUOI tendre et proteger pendant chaque exercice.",
    bestFor:
      'Compréhension des muscles engagés (fessiers, abdominaux, quadriceps) pour exécuter squats, fentes et ponts fessiers avec la bonne activation musculaire.',
  },
  {
    id: 'gymvisual',
    name: 'GymVisual',
    url: 'https://gymvisual.com',
    category: 'animation',
    free: true,
    inBrowser: true,
    description:
      "Bibliothèque en ligne d'animations GIF et d'illustrations de fitness montrant chaque exercice boucle par boucle, directement dans le navigateur. Parfait pour avoir un repère visuel rapide d'un mouvement avant de le reproduire.",
    bestFor:
      'Tous les exercices au poids du corps : pompes, squats, jumping jacks, mountain climbers, gainage — repère visuel en boucle pour caler le rythme.',
  },
  {
    id: 'muscle-and-strength',
    name: 'Muscle and Strength — Exercise Database',
    url: 'https://www.muscleandstrength.com/exercises',
    category: 'video-demo',
    free: true,
    inBrowser: true,
    description:
      "Base de données vidéo de plus de 1 500 exercices filmés sous plusieurs angles avec explications écrites. Chaque vidéo se lit dans le navigateur et montre la technique complète, du placement de départ à la fin du mouvement.",
    bestFor:
      "Squats, fentes, pompes, ponts fessiers, mountain climbers — référence vidéo fiable pour copier l'amplitude et la cadence exactes.",
  },
  {
    id: 'ace-fitness-library',
    name: 'ACE Fitness Exercise Library',
    url: 'https://www.acefitness.org/resources/everyone/exercise-library/',
    category: 'video-demo',
    free: true,
    inBrowser: true,
    description:
      "Bibliothèque d'exercices gratuite tenue par l'American Council on Exercise. Filtres par équipement (bodyweight / aucun équipement), groupe musculaire et niveau. Chaque exercice propose photos, vidéo et instructions pas à pas.",
    bestFor:
      'Exercices au poids du corps sans matériel, étirements, gainage — idéal pour structurer un programme maison équilibré sur 30 jours.',
  },
  {
    id: 'darebee',
    name: 'DAREBEE',
    url: 'https://darebee.com/library.html',
    category: 'video-demo',
    free: true,
    inBrowser: true,
    description:
      "Ressource mondiale gratuite, sans pub ni placement produit. DAREBEE propose des fiches visuelles illustrées (posters) et des vidéos montrant chaque mouvement, pensées pour s'entraîner à la maison sans aucun matériel.",
    bestFor:
      'HIIT, jumping jacks, high knees, burpees, gainage — programmes visuels complets pour petits espaces et sans équipement.',
  },
  {
    id: 'nhs-better-health',
    name: 'NHS Better Health — Home workout videos',
    url: 'https://www.nhs.uk/better-health/get-active/home-workout-videos',
    category: 'video-demo',
    free: true,
    inBrowser: true,
    description:
      "Série de vidéos de 30 minutes guidées par des coachs du Service de Santé britannique (NHS). Aucun équipement requis, séances filmées en continu que l'utilisateur peut suivre en direct devant son écran.",
    bestFor:
      'Séances complètes de renforcement et de cardio maison : squats, fentes, pompes, gainage, étirements — accompagnement guidé en temps réel.',
  },
  {
    id: 'precision-nutrition',
    name: 'Precision Nutrition — Video Exercise Library',
    url: 'https://www.precisionnutrition.com/video-exercise-library',
    category: 'video-demo',
    free: true,
    inBrowser: true,
    description:
      "Bibliothèque gratuite de plus de 400 exercices filmés avec un exemple rapide puis une démonstration complète et détaillée. Très utile pour vérifier la technique avant d'enchaîner les répétitions.",
    bestFor:
      'Pompes, squats, fentes, ponts fessiers, planches, mountain climbers — vérification de la forme technique avant la série.',
  },
  {
    id: 'westrive-database',
    name: 'WeStrive Exercise Database',
    url: 'https://www.westrive.com/features/exercise-database',
    category: 'video-demo',
    free: true,
    inBrowser: true,
    description:
      "Plus de 1 500 photos et vidéos d'exercices enregistrées par l'équipe WeStrive. Chaque vidéo propose un exemple court puis une explication complète, le tout directement dans le navigateur.",
    bestFor:
      'Exercices au poids du corps, étirements, mobilité — variété de progressions pour débutants comme avancés.',
  },
  {
    id: 'daz-3d',
    name: 'Daz 3D — Daz Studio + free assets',
    url: 'https://www.daz3d.com',
    category: '3d-character',
    free: true,
    inBrowser: false,
    description:
      "Logiciel gratuit Daz Studio (à télécharger) avec des personnages humanoïdes réalistes et des packs de poses de fitness gratuits. Permet de figer un personnage dans une posture précise pour l'étudier sous tous les angles avant de la reproduire.",
    bestFor:
      "Postures de yoga, poses de gainage, étirements — utile pour étudier l'alignement du corps quand on veut un repère 3D personnalisé (installation requise).",
  },
];
