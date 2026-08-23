/**
 * Mappage précis exercice → illustration la plus représentative.
 *
 * Pour chaque exercice, on définit :
 *  - image : l'image la plus pertinente parmi celles disponibles
 *  - prefer3D : si true, le mode 3D est activé par défaut (l'animation dédiée
 *    est plus représentative que l'image disponible)
 *
 * Les images disponibles :
 *  - ex-face-fish, ex-face-cheek, ex-face-jaw, ex-face-neck (visage)
 *  - ex-cardio-jacks, ex-cardio-knees, ex-cardio-climbers (cardio)
 *  - ex-tone-squat, ex-tone-plank, ex-tone-lunge, ex-tone-bridge (tonification)
 *  - ambient-tone, ambient-cooldown, ambient-face, ambient-cardio (ambiances)
 *
 * Pour les exercices d'abdos sans image dédiée (russianTwist, legRaises, etc.),
 * le modèle 3D avec son animation dédiée est plus représentatif → prefer3D = true.
 */

export interface ExerciseVisual {
  /** Nom de base de l'image (sans extension). */
  image: string;
  /** Si true, le mode 3D est activé par défaut (animation dédiée plus pertinente). */
  prefer3D: boolean;
}

const DEFAULT: ExerciseVisual = {
  image: "ambient-tone",
  prefer3D: false,
};

const VISUAL_MAP: Record<string, ExerciseVisual> = {
  // Échauffement
  "warm-breath": { image: "ambient-cooldown", prefer3D: true },
  "warm-march": { image: "ex-cardio-knees", prefer3D: true },
  "warm-twist": { image: "ambient-tone", prefer3D: true },

  // Visage
  "fish-face": { image: "ex-face-fish", prefer3D: false },
  "cheek-lift": { image: "ex-face-cheek", prefer3D: false },
  "jaw-release": { image: "ex-face-jaw", prefer3D: false },
  "neck-stretch": { image: "ex-face-neck", prefer3D: false },
  "lion-face": { image: "ex-face-jaw", prefer3D: false },
  "chin-lift": { image: "ex-face-neck", prefer3D: false },
  "tongue-press": { image: "ex-face-fish", prefer3D: false },

  // Cardio
  "jumping-jacks": { image: "ex-cardio-jacks", prefer3D: false },
  "high-knees": { image: "ex-cardio-knees", prefer3D: false },
  "mountain-climbers": { image: "ex-cardio-climbers", prefer3D: false },
  "squat-jumps": { image: "ex-tone-squat", prefer3D: true },
  burpees: { image: "ex-cardio-jacks", prefer3D: true },
  skaters: { image: "ex-cardio-knees", prefer3D: true },

  // Tonification — bas du corps
  squat: { image: "ex-tone-squat", prefer3D: false },
  lunge: { image: "ex-tone-lunge", prefer3D: false },
  "glute-bridge": { image: "ex-tone-bridge", prefer3D: false },
  "reverse-lunge": { image: "ex-tone-lunge", prefer3D: true },
  "sumo-squat": { image: "ex-tone-squat", prefer3D: true },
  "calf-raises": { image: "ex-tone-squat", prefer3D: true },
  "wall-sit": { image: "ex-tone-squat", prefer3D: true },
  "glute-kickback": { image: "ex-tone-plank", prefer3D: true },

  // Tonification — haut du corps
  pushups: { image: "ex-tone-plank", prefer3D: false },
  "tricep-dips": { image: "ex-tone-plank", prefer3D: true },

  // Tonification — dos/core
  superman: { image: "ex-tone-bridge", prefer3D: true },
  "bird-dog": { image: "ex-tone-plank", prefer3D: true },
  "shoulder-taps": { image: "ex-tone-plank", prefer3D: true },
  "plank-up": { image: "ex-tone-plank", prefer3D: true },

  // Abdos — pas d'image dédiée, 3D préférée (animation dédiée plus représentative)
  plank: { image: "ex-tone-plank", prefer3D: false },
  "bicycle-crunch": { image: "ex-tone-bridge", prefer3D: true },
  "russian-twist": { image: "ex-tone-bridge", prefer3D: true },
  "leg-raises": { image: "ex-tone-bridge", prefer3D: true },
  "flutter-kicks": { image: "ex-tone-bridge", prefer3D: true },
  "dead-bug": { image: "ex-tone-bridge", prefer3D: true },
  "side-plank": { image: "ex-tone-plank", prefer3D: true },
  "hollow-hold": { image: "ex-tone-bridge", prefer3D: true },

  // Récupération
  "cool-stretch": { image: "ambient-cooldown", prefer3D: false },
  "cool-breath": { image: "ambient-cooldown", prefer3D: false },
};

export function getExerciseVisual(exerciseId: string): ExerciseVisual {
  return VISUAL_MAP[exerciseId] ?? DEFAULT;
}
