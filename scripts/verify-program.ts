/**
 * Vérification automatique du programme 30 jours.
 * S'assure que :
 *  - Chaque jour fait exactement 600s (10 minutes)
 *  - Chaque jour contient 4 exercices d'abdos
 *  - Chaque jour contient au moins 1 exercice de chaque catégorie (face, cardio, tone)
 *  - Chaque jour a 14 exercices
 *
 * Usage : bun run scripts/verify-program.ts
 */
import { program, type ExerciseCategory } from "../src/lib/program-data";

interface Issue {
  day: number;
  type: string;
  detail: string;
}

const issues: Issue[] = [];

// Pool d'exercices d'abdos reconnus (catégorie 'tone' qui ciblent les abdos).
// Note : mountain-climbers est un exercice cardio qui sollicite aussi les abdos,
// mais il est placé dans le slot cardio du programme, pas dans le slot abdos.
const AB_EXERCISE_IDS = new Set([
  "plank",
  "bicycle-crunch",
  "russian-twist",
  "leg-raises",
  "flutter-kicks",
  "dead-bug",
  "side-plank",
  "hollow-hold",
  "bird-dog",
  "shoulder-taps",
  "plank-up",
]);

console.log("🔍 Vérification du programme 30 jours...\n");

for (const day of program) {
  // 1. Durée = 600s
  const computedDuration = day.exercises.reduce((s, e) => s + e.duration, 0);
  if (day.duration !== 600) {
    issues.push({
      day: day.day,
      type: "DURÉE_DECLARÉE",
      detail: `duration=${day.duration}s (attendu 600s)`,
    });
  }
  if (computedDuration !== 600) {
    issues.push({
      day: day.day,
      type: "DURÉE_CALCULÉE",
      detail: `somme des exercices=${computedDuration}s (attendu 600s)`,
    });
  }

  // 2. Nombre d'exercices = 14
  if (day.exercises.length !== 14) {
    issues.push({
      day: day.day,
      type: "NOMBRE_EXERCICES",
      detail: `${day.exercises.length} exercices (attendu 14)`,
    });
  }

  // 3. 4 exercices d'abdos
  const abExercises = day.exercises.filter((e) => AB_EXERCISE_IDS.has(e.id));
  if (abExercises.length !== 4) {
    issues.push({
      day: day.day,
      type: "ABDOS",
      detail: `${abExercises.length} exercices d'abdos (attendu 4): ${abExercises.map((e) => e.id).join(", ") || "AUCUN"}`,
    });
  }

  // 4. Au moins 1 exercice par catégorie principale
  const categories: ExerciseCategory[] = ["face", "cardio", "tone"];
  for (const cat of categories) {
    const count = day.exercises.filter((e) => e.category === cat).length;
    if (cat === "tone") {
      // tone inclut abdos + tonification, donc >= 7 (4 abdos + 3 tonification)
      if (count < 7) {
        issues.push({
          day: day.day,
          type: "CATÉGORIE_TONE",
          detail: `${count} exercices tone (attendu >=7: 4 abdos + 3 tonification)`,
        });
      }
    } else {
      if (count < 2) {
        issues.push({
          day: day.day,
          type: `CATÉGORIE_${cat.toUpperCase()}`,
          detail: `${count} exercices ${cat} (attendu >=2)`,
        });
      }
    }
  }

  // 5. Échauffement + récupération présents
  const hasWarmup = day.exercises.some((e) => e.category === "warmup");
  const hasCooldown = day.exercises.some((e) => e.category === "cooldown");
  if (!hasWarmup) {
    issues.push({ day: day.day, type: "ÉCHAUFFEMENT", detail: "manquant" });
  }
  if (!hasCooldown) {
    issues.push({ day: day.day, type: "RÉCUPÉRATION", detail: "manquant" });
  }
}

// Affichage du rapport
console.log("=== RAPPORT DE VÉRIFICATION ===\n");
console.log(`Jours vérifiés : ${program.length}`);
console.log(`Issues détectées : ${issues.length}\n`);

if (issues.length === 0) {
  console.log("✅ TOUT EST CONFORME — chaque jour fait 10 min et contient 4 abdos.\n");
  // Afficher un résumé par jour
  console.log("=== RÉSUMÉ PAR JOUR ===");
  for (const day of program) {
    const computedDuration = day.exercises.reduce((s, e) => s + e.duration, 0);
    const abExercises = day.exercises.filter((e) => AB_EXERCISE_IDS.has(e.id));
    const face = day.exercises.filter((e) => e.category === "face").length;
    const cardio = day.exercises.filter((e) => e.category === "cardio").length;
    const tone = day.exercises.filter((e) => e.category === "tone").length;
    console.log(
      `Jour ${day.day.toString().padStart(2)} | ${computedDuration}s | ${day.exercises.length} ex | abdos: ${abExercises.length} (${abExercises.map((e) => e.name).join(", ")}) | F:${face} C:${cardio} T:${tone}`,
    );
  }
} else {
  console.log("❌ ISSUES DÉTECTÉES :\n");
  for (const issue of issues) {
    console.log(`  Jour ${issue.day} [${issue.type}]: ${issue.detail}`);
  }
}

process.exit(issues.length === 0 ? 0 : 1);
