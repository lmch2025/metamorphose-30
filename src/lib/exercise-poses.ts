/**
 * Définit les poses 3D pour chaque exercice du programme.
 * Une pose = ensemble d'angles de rotation (en degrés) pour chaque articulation
 * d'un humanoïde procédural.
 *
 * Convention des axes (humanoïde debout face à la caméra, +Y vers le haut, +Z vers l'observateur) :
 *  - rotation X = pencher en avant/arrière (nod)
 *  - rotation Y = rotation gauche/droite (yaw)
 *  - rotation Z = inclinaison latérale (tilt)
 *
 * Articulations (toutes en degrés) :
 *  - hips, spine, neck, head
 *  - leftShoulder, leftElbow, rightShoulder, rightElbow
 *  - leftHip, leftKnee, rightHip, rightKnee
 */

export interface HumanoidPose {
  hips: [number, number, number];
  spine: [number, number, number];
  neck: [number, number, number];
  head: [number, number, number];
  leftShoulder: [number, number, number];
  leftElbow: [number, number, number];
  rightShoulder: [number, number, number];
  rightElbow: [number, number, number];
  leftHip: [number, number, number];
  leftKnee: [number, number, number];
  rightHip: [number, number, number];
  rightKnee: [number, number, number];
}

/* Pose neutre : debout, bras le long du corps */
const NEUTRAL: HumanoidPose = {
  hips: [0, 0, 0],
  spine: [0, 0, 0],
  neck: [0, 0, 0],
  head: [0, 0, 0],
  leftShoulder: [0, 0, 10],
  leftElbow: [0, 0, 0],
  rightShoulder: [0, 0, -10],
  rightElbow: [0, 0, 0],
  leftHip: [0, 0, 0],
  leftKnee: [0, 0, 0],
  rightHip: [0, 0, 0],
  rightKnee: [0, 0, 0],
};

/**
 * Map des poses par ID d'exercice.
 * Pour les exercices faciaux (face), on anime surtout la tête et le cou.
 * Pour le cardio, on simule le mouvement avec bras levés / jambes écartées.
 * Pour la tonification, on reproduit la posture (squat, planche, fente, etc.).
 */
export const EXERCISE_POSES: Record<string, HumanoidPose> = {
  /* ----- ÉCHAUFFEMENT ----- */
  "warm-breath": {
    // Respiration bras levés
    ...NEUTRAL,
    leftShoulder: [180, 0, 10],
    rightShoulder: [180, 0, -10],
    head: [-10, 0, 0],
  },
  "warm-march": {
    // Marche sur place : un genou levé
    ...NEUTRAL,
    leftHip: [80, 0, 0],
    leftKnee: [-30, 0, 0],
    rightShoulder: [-60, 0, -10],
    leftShoulder: [40, 0, 10],
  },
  "warm-twist": {
    // Rotation du buste
    ...NEUTRAL,
    spine: [0, 25, 0],
    head: [0, 20, 0],
    leftShoulder: [-90, 0, 10],
    rightShoulder: [-90, 0, -10],
  },

  /* ----- VISAGE (face) — on anime la tête/cou ----- */
  "fish-face": {
    ...NEUTRAL,
    head: [0, -15, 0],
    neck: [0, -10, 0],
  },
  "cheek-lift": {
    ...NEUTRAL,
    head: [-5, 0, 0],
    neck: [-5, 0, 0],
  },
  "jaw-release": {
    ...NEUTRAL,
    head: [0, 10, 5],
    neck: [0, 10, 0],
  },
  "neck-stretch": {
    // Tête inclinée côté
    ...NEUTRAL,
    head: [0, 0, 25],
    neck: [0, 0, 15],
    leftShoulder: [0, 0, 30],
    rightShoulder: [0, 0, -20],
  },
  "lion-face": {
    ...NEUTRAL,
    head: [-15, 0, 0],
    neck: [-10, 0, 0],
  },
  "chin-lift": {
    // Menton vers le haut
    ...NEUTRAL,
    head: [-25, 0, 0],
    neck: [-15, 0, 0],
  },
  "tongue-press": {
    ...NEUTRAL,
    head: [-5, 0, 0],
  },

  /* ----- CARDIO ----- */
  "jumping-jacks": {
    // Bras levés, jambes écartées (position haute du jumping jack)
    ...NEUTRAL,
    leftShoulder: [170, 0, 20],
    rightShoulder: [170, 0, -20],
    leftHip: [0, 0, 25],
    rightHip: [0, 0, -25],
  },
  "high-knees": {
    // Un genou très haut, bras en opposition
    ...NEUTRAL,
    rightHip: [100, 0, 0],
    rightKnee: [-40, 0, 0],
    leftShoulder: [-70, 0, 10],
    rightShoulder: [60, 0, -10],
  },
  "mountain-climbers": {
    // Position planche, un genou ramené
    ...NEUTRAL,
    hips: [80, 0, 0],
    spine: [0, 0, 0],
    leftShoulder: [-170, 0, 10],
    rightShoulder: [-170, 0, -10],
    leftElbow: [0, 0, 0],
    rightElbow: [0, 0, 0],
    rightHip: [70, 0, 0],
    rightKnee: [-80, 0, 0],
  },
  "squat-jumps": {
    // Squat profond
    ...NEUTRAL,
    hips: [0, 0, 0],
    spine: [10, 0, 0],
    leftHip: [80, 0, 5],
    leftKnee: [-80, 0, 0],
    rightHip: [80, 0, -5],
    rightKnee: [-80, 0, 0],
    leftShoulder: [170, 0, 10],
    rightShoulder: [170, 0, -10],
  },
  burpees: {
    // Position planche
    ...NEUTRAL,
    hips: [80, 0, 0],
    leftShoulder: [-170, 0, 10],
    rightShoulder: [-170, 0, -10],
  },
  skaters: {
    // Latéral, une jambe croisée
    ...NEUTRAL,
    hips: [0, 0, 15],
    spine: [0, 0, -10],
    rightHip: [30, 0, -20],
    rightKnee: [-60, 0, 0],
    leftShoulder: [-30, 0, 20],
  },

  /* ----- TONIFICATION ----- */
  squat: {
    ...NEUTRAL,
    spine: [15, 0, 0],
    leftHip: [80, 0, 5],
    leftKnee: [-80, 0, 0],
    rightHip: [80, 0, -5],
    rightKnee: [-80, 0, 0],
    leftShoulder: [170, 0, 10],
    rightShoulder: [170, 0, -10],
  },
  plank: {
    // Planche sur avant-bras
    ...NEUTRAL,
    hips: [80, 0, 0],
    spine: [0, 0, 0],
    leftShoulder: [-170, 0, 10],
    rightShoulder: [-170, 0, -10],
    leftElbow: [-90, 0, 0],
    rightElbow: [-90, 0, 0],
  },
  lunge: {
    // Fente avant : jambe droite fléchie, jambe gauche arrière
    ...NEUTRAL,
    hips: [0, 0, 0],
    leftHip: [90, 0, 0],
    leftKnee: [-90, 0, 0],
    rightHip: [30, 0, 0],
    rightKnee: [-30, 0, 0],
    spine: [-5, 0, 0],
    leftShoulder: [170, 0, 10],
    rightShoulder: [170, 0, -10],
  },
  "glute-bridge": {
    // Allongé, bassin levé
    ...NEUTRAL,
    hips: [-170, 0, 0],
    spine: [-30, 0, 0],
    leftHip: [-20, 0, 0],
    leftKnee: [-90, 0, 0],
    rightHip: [-20, 0, 0],
    rightKnee: [-90, 0, 0],
  },
  pushups: {
    // Pompe, bras fléchis
    ...NEUTRAL,
    hips: [80, 0, 0],
    leftShoulder: [-170, 0, 10],
    rightShoulder: [-170, 0, -10],
    leftElbow: [-60, 0, 0],
    rightElbow: [-60, 0, 0],
  },
  "bicycle-crunch": {
    // Crunch vélo : coude vers genou opposé
    ...NEUTRAL,
    hips: [-160, 0, 0],
    spine: [-30, 0, 10],
    neck: [-30, 0, 0],
    leftHip: [60, 0, 0],
    leftKnee: [-90, 0, 0],
    rightHip: [20, 0, 0],
    rightKnee: [-30, 0, 0],
    leftShoulder: [-90, 60, 10],
    rightShoulder: [-90, -60, -10],
  },
  "wall-sit": {
    // Chaise contre mur : cuisses parallèles sol
    ...NEUTRAL,
    hips: [0, 0, 0],
    spine: [20, 0, 0],
    leftHip: [90, 0, 0],
    leftKnee: [-90, 0, 0],
    rightHip: [90, 0, 0],
    rightKnee: [-90, 0, 0],
    leftShoulder: [170, 0, 10],
    rightShoulder: [170, 0, -10],
  },

  /* ----- RÉCUPÉRATION ----- */
  "cool-stretch": {
    // Étirement bras levés
    ...NEUTRAL,
    leftShoulder: [180, 0, 10],
    rightShoulder: [180, 0, -10],
    spine: [-10, 0, 0],
  },
  "cool-breath": {
    ...NEUTRAL,
    leftShoulder: [160, 0, 10],
    rightShoulder: [160, 0, -10],
    head: [-5, 0, 0],
  },
};

/** Récupère la pose 3D d'un exercice par son ID. Retourne la pose neutre si inconnue. */
export function getPose(exerciseId: string): HumanoidPose {
  return EXERCISE_POSES[exerciseId] ?? NEUTRAL;
}
