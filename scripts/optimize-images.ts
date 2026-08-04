/**
 * Optimise toutes les images de public/images/ pour connexion lente :
 *  - Convertit en WebP (compression bien supérieure au JPEG)
 *  - Redimensionne aux dimensions réellement affichées
 *  - Génère un placeholder flou (LQIP) en base64 pour affichage instantané
 *  - Conserve les JPEG d'origine comme fallback (renommés .orig.jpg supprimés)
 *
 * Usage : bun run scripts/optimize-images.ts
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const SRC_DIR = "/home/z/my-project/public/images";
const OUT_DIR = "/home/z/my-project/public/images"; // écrase en WebP + garde .jpg fallback
const BLUR_OUT = "/home/z/my-project/src/lib/blur-data.ts";

interface Target {
  file: string;
  width: number;
  quality: number;
}

// Dimensions cibles selon l'usage (poussé au max nécessaire pour retina)
const TARGETS: Target[] = [
  { file: "hero-immersive.jpg", width: 1600, quality: 68 },
  { file: "ambient-face.jpg", width: 640, quality: 65 },
  { file: "ambient-cardio.jpg", width: 640, quality: 65 },
  { file: "ambient-tone.jpg", width: 640, quality: 65 },
  { file: "ambient-cooldown.jpg", width: 640, quality: 65 },
  { file: "ex-face-fish.jpg", width: 480, quality: 62 },
  { file: "ex-face-cheek.jpg", width: 480, quality: 62 },
  { file: "ex-face-jaw.jpg", width: 480, quality: 62 },
  { file: "ex-face-neck.jpg", width: 480, quality: 62 },
  { file: "ex-cardio-jacks.jpg", width: 480, quality: 62 },
  { file: "ex-cardio-knees.jpg", width: 480, quality: 62 },
  { file: "ex-cardio-climbers.jpg", width: 480, quality: 62 },
  { file: "ex-tone-squat.jpg", width: 480, quality: 62 },
  { file: "ex-tone-plank.jpg", width: 480, quality: 62 },
  { file: "ex-tone-lunge.jpg", width: 480, quality: 62 },
  { file: "ex-tone-bridge.jpg", width: 480, quality: 62 },
];

const blurEntries: string[] = [];
let totalOriginal = 0;
let totalWebp = 0;

for (const t of TARGETS) {
  const srcPath = path.join(SRC_DIR, t.file);
  if (!fs.existsSync(srcPath)) {
    console.warn(`⚠️  Manquant: ${t.file}`);
    continue;
  }

  const baseName = t.file.replace(/\.jpg$/, "");
  const webpPath = path.join(OUT_DIR, `${baseName}.webp`);
  const jpgFallbackPath = path.join(OUT_DIR, `${baseName}.jpg`);

  const originalSize = fs.statSync(srcPath).size;
  totalOriginal += originalSize;

  // 1. WebP optimisé
  await sharp(srcPath)
    .resize({ width: t.width, withoutEnlargement: true })
    .webp({ quality: t.quality, effort: 4 })
    .toFile(webpPath);

  // 2. JPEG fallback recompressé (au cas où WebP non supporté — rare)
  //     On passe par un fichier temporaire car sharp ne peut écrire sur sa propre source.
  const tmpJpg = `${jpgFallbackPath}.tmp`;
  await sharp(srcPath)
    .resize({ width: t.width, withoutEnlargement: true })
    .jpeg({ quality: t.quality, mozjpeg: true })
    .toFile(tmpJpg);
  fs.renameSync(tmpJpg, jpgFallbackPath);

  // 3. Placeholder flou (LQIP) — 20px de large, très flou, base64
  const blurBuffer = await sharp(srcPath)
    .resize({ width: 20 })
    .webp({ quality: 30 })
    .toBuffer();
  const blurBase64 = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

  blurEntries.push(`  "${baseName}": "${blurBase64}",`);

  const webpSize = fs.statSync(webpPath).size;
  totalWebp += webpSize;

  console.log(
    `✓ ${baseName}: ${Math.round(originalSize / 1024)}KB → ${Math.round(webpSize / 1024)}KB WebP (-${Math.round((1 - webpSize / originalSize) * 100)}%)`,
  );
}

// Écrit le fichier TS avec les placeholders
const tsContent = `/**
 * Placeholders flous (LQIP) générés automatiquement par scripts/optimize-images.ts.
 * Permettent un affichage instantané pendant le chargement des vraies images.
 * NE PAS ÉDITER À LA MAIN — régénérer via : bun run scripts/optimize-images.ts
 */
export const blurPlaceholders: Record<string, string> = {
${blurEntries.join("\n")}
};

/** Récupère le placeholder flou d'une image par son nom de base (sans extension). */
export function getBlur(name: string): string | undefined {
  return blurPlaceholders[name];
}
`;

fs.writeFileSync(BLUR_OUT, tsContent);

console.log("\n=== BILAN ===");
console.log(
  `Total original : ${(totalOriginal / 1024).toFixed(0)} KB (${(totalOriginal / 1024 / 1024).toFixed(2)} MB)`,
);
console.log(
  `Total WebP     : ${(totalWebp / 1024).toFixed(0)} KB (${(totalWebp / 1024 / 1024).toFixed(2)} MB)`,
);
console.log(
  `Réduction      : ${((1 - totalWebp / totalOriginal) * 100).toFixed(1)} %`,
);
console.log(`Placeholders  : ${BLUR_OUT}`);
