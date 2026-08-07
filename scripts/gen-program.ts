/**
 * Génère le programme 30 jours à 10 min/jour (600s) avec 4 abdos + 3 tonification tous les jours.
 * Structure : 30s échauff + 2×45s visage + 3×45s cardio + 4×45s abdos + 3×45s tonification + 30s récup = 600s
 *
 * Usage : bun run scripts/gen-program.ts > /tmp/program-generated.ts
 */
import { program } from "../src/lib/program-data";

// Pools d'exercices (IDs dans l'objet E)
const WARMUPS = ["warmBreath", "warmMarch", "warmTwist"];
const FACE = ["fishFace", "cheekLift", "jawRelease", "neckStretch", "lionFace", "chinLift", "tonguePress"];
const CARDIO = ["jumpingJacks", "highKnees", "mountainClimbers", "squatJumps", "burpees", "skaters"];
const ABS = ["plank", "bicycleCrunch", "russianTwist", "legRaises", "flutterKicks", "deadBug", "sidePlank", "hollowHold", "birdDog", "shoulderTaps", "plankUp"];
const TONE = ["squat", "lunge", "gluteBridge", "pushups", "wallSit", "tricepDips", "calfRaises", "superman", "reverseLunge", "sumoSquat", "gluteKickback"];
const COOLDOWNS = ["coolStretch", "coolBreath"];

// Phases
const PHASES = [
  { name: "Fondation", days: [1, 7], intensity: "doux" },
  { name: "Progression", days: [8, 14], intensity: "modéré" },
  { name: "Intensification", days: [15, 21], intensity: "HIIT" },
  { name: "Maîtrise", days: [22, 30], intensity: "max" },
] as const;

// Titres et citations par jour
const DAY_META: Record<number, { title: string; subtitle: string; focus: string; quote: string }> = {
  1: { title: "Premier élan", subtitle: "Découverte en douceur", focus: "Lance la machine en douceur.", quote: "Un voyage de mille kilomètres commence par un seul pas." },
  2: { title: "Réveil du visage", subtitle: "Cible les joues", focus: "Focus joues + cardio modéré.", quote: "La constance bat l'intensité. Montre-toi chaque jour." },
  3: { title: "Cœur et jambes", subtitle: "Cardio + tonification", focus: "Cardio et bas du corps.", quote: "Ton corps est capable de bien plus que tu ne le penses." },
  4: { title: "Affinage du visage", subtitle: "Joues + menton", focus: "Affine l'ovale du visage.", quote: "Les petites actions répétées chaque jour deviennent de grands changements." },
  5: { title: "Gainage et cardio", subtitle: "Abdos + rythme", focus: "Découvre le gainage.", quote: "La douleur d'aujourd'hui est la force de demain." },
  6: { title: "Visage de lion", subtitle: "Yoga facial complet", focus: "Intègre la face de lion.", quote: "Prends soin de ton corps. C'est le seul endroit où tu es obligé de vivre." },
  7: { title: "Bilan de semaine 1", subtitle: "On consolide", focus: "Récapitulatif de la semaine.", quote: "Une semaine déjà. Tu as fait le plus dur : commencer." },
  8: { title: "On monte en intensité", subtitle: "Cardio plus soutenu", focus: "Mountain climbers et intensité.", quote: "Le succès, c'est se relever une fois de plus qu'on est tombé." },
  9: { title: "Haut du corps", subtitle: "Découverte des pompes", focus: "Haut du corps + triceps.", quote: "Ne compare pas tes débuts à la fin de quelqu'un d'autre." },
  10: { title: "Brûle calories", subtitle: "HIIT modéré", focus: "Enchaînement cardio rapide.", quote: "La sueur d'aujourd'hui est le succès de demain." },
  11: { title: "Fessiers et cuisses", subtitle: "Spécial bas du corps", focus: "Galbe et brûle.", quote: "Ton corps peut presque tout. C'est ton esprit qu'il faut convaincre." },
  12: { title: "Abdos et visage", subtitle: "Sangle abdominale", focus: "Obliques et ventre plat.", quote: "Ce n'est pas ce que tu fais de temps en temps, mais ce que tu fais chaque jour." },
  13: { title: "Endurance", subtitle: "Chaise contre mur", focus: "Endurance des cuisses.", quote: "Quand ça brûle, c'est que le changement est en train de se faire." },
  14: { title: "Cap de la moitié", subtitle: "Bilan semaine 2", focus: "Récapitulatif intensif.", quote: "Tu es plus fort maintenant qu'il y a 14 jours. Continue." },
  15: { title: "HIIT explosif", subtitle: "Sauts en squat", focus: "Puissance des jambes.", quote: "La magie opère en dehors de ta zone de confort." },
  16: { title: "Burpees accessibles", subtitle: "Corps complet", focus: "L'exercice le plus complet.", quote: "Tu ne sais pas de quoi tu es capable tant que tu ne te pousses pas." },
  17: { title: "Patineurs et agilité", subtitle: "Cardio latéral", focus: "Équilibre et abducteurs.", quote: "L'agilité du corps naît de la régularité de l'effort." },
  18: { title: "Force et volume", subtitle: "Haut + bas du corps", focus: "Tout le corps en force.", quote: "La force n'est pas une question de taille, mais de régularité." },
  19: { title: "Brûle-max cardio", subtitle: "HIIT long", focus: "Calorie bomb.", quote: "Le corps atteint ce que l'esprit croit. Crois en toi." },
  20: { title: "Gainage extrême", subtitle: "Core et posture", focus: "Gainage intensif.", quote: "Un core fort, un dos sauvé pour la vie." },
  21: { title: "Cap des 3 semaines", subtitle: "Bilan semaine 3", focus: "Test complet.", quote: "21 jours. Tu n'es plus le même." },
  22: { title: "Explosivité", subtitle: "Sauts et puissance", focus: "Puissance maximale.", quote: "La puissance, c'est la force appliquée vite." },
  23: { title: "Corps complet HIIT", subtitle: "Burpees et pompes", focus: "Haut et cardio.", quote: "Le corps complet, c'est l'efficacité maximale." },
  24: { title: "Jambes d'acier", subtitle: "Endurance bas du corps", focus: "Les jambes parlent.", quote: "Les jambes fortes portent un esprit fort." },
  25: { title: "Cardio infernal", subtitle: "HIIT maximal", focus: "Le cardio le plus intense.", quote: "Quand tu veux abandonner, souviens-toi pourquoi tu as commencé." },
  26: { title: "Visage sculpté", subtitle: "Yoga facial avancé", focus: "Tous les exercices faciaux.", quote: "Un visage détendu est un visage rayonnant." },
  27: { title: "Force et volume", subtitle: "Renforcement complet", focus: "La séance force.", quote: "La force n'arrive pas de ce que tu peux faire, mais de surmonter ce que tu ne pensais pas pouvoir." },
  28: { title: "Avant-dernier round", subtitle: "HIIT + force", focus: "Combo explosif.", quote: "Plus que deux jours. Ta transformation est presque complète." },
  29: { title: "La grande épreuve", subtitle: "Tout en intensité", focus: "Donne tout ce qu'il te reste.", quote: "Aujourd'hui, tu découvres de quoi tu es vraiment capable." },
  30: { title: "Jour 30 — Ta victoire", subtitle: "Célébration finale", focus: "Le flow final.", quote: "30 jours. Tu l'as fait. Ce n'est pas une fin, c'est un début." },
};

// Helper : pick n elements from a pool with rotation based on day
function pick<T>(pool: T[], count: number, offset: number): T[] {
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    result.push(pool[(offset + i) % pool.length]);
  }
  return result;
}

// Génère le programme
const lines: string[] = [];
lines.push("export const program: DayProgram[] = [");

for (let day = 1; day <= 30; day++) {
  const phase = PHASES.find((p) => day >= p.days[0] && day <= p.days[1])!;
  const meta = DAY_META[day];

  // Rotation des exercices selon le jour (variété)
  const warmup = pick(WARMUPS, 1, day - 1)[0];
  const face = pick(FACE, 2, (day - 1) * 2);
  const cardio = pick(CARDIO, 3, (day - 1) * 3);
  const abs = pick(ABS, 4, (day - 1) * 4);
  const tone = pick(TONE, 3, (day - 1) * 3);
  const cooldown = pick(COOLDOWNS, 1, day - 1)[0];

  const exercises = [warmup, ...face, ...cardio, ...abs, ...tone, cooldown];

  lines.push("  {");
  lines.push(`    day: ${day},`);
  lines.push(`    phase: '${phase.name}',`);
  lines.push(`    title: '${meta.title}',`);
  lines.push(`    subtitle: '${meta.subtitle}',`);
  lines.push(`    focus: "${meta.focus}",`);
  lines.push(`    duration: 600,`);
  lines.push("    exercises: [");
  for (const ex of exercises) {
    lines.push(`      E.${ex},`);
  }
  lines.push("    ],");
  lines.push(`    quote: '${meta.quote}',`);
  lines.push("  },");
}

lines.push("];");

console.log(lines.join("\n"));
