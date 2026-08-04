/**
 * Génère des fichiers WAV d'effets sonores réalistes par synthèse audio pure.
 * Aucune dépendance externe, aucun téléchargement réseau — tout est calculé mathématiquement.
 *
 * Sons générés :
 *  - beep-start.wav        : bip court d'amorce (880Hz, 0.15s)
 *  - beep-countdown.wav    : bip de compte à rebours (660Hz, 0.12s)
 *  - chime-go.wav          : carillon double de départ (880+1320Hz)
 *  - ding-halfway.wav      : ding de mi-parcours (1046Hz)
 *  - chime-complete.wav    : carillon de fin d'exercice (accord majeur)
 *  - fanfare-celebrate.wav : fanfare de célébration (3 notes ascendantes + accord)
 *  - whoosh.wav            : whoosh de transition (bruit filtré)
 *  - tick.wav              : tic discret (1000Hz, 0.04s)
 *  - ui-click.wav          : clic UI (1200Hz, 0.03s)
 *  - unlock.wav            : son de déblocage (arpège)
 *
 * Usage : bun run scripts/gen-sounds.ts
 */
import fs from "fs";
import path from "path";

const OUT_DIR = "/home/z/my-project/public/sounds";
const SAMPLE_RATE = 44100;
const BITS_PER_SAMPLE = 16;
const CHANNELS = 1;

fs.mkdirSync(OUT_DIR, { recursive: true });

/* ---------- Helpers de synthèse ---------- */

type Wave = number[]; // échantillons float [-1, 1]

function silence(duration: number): Wave {
  return new Array(Math.floor(SAMPLE_RATE * duration)).fill(0);
}

function sine(freq: number, duration: number, opts: {
  attack?: number;
  release?: number;
  amplitude?: number;
  phase?: number;
} = {}): Wave {
  const { attack = 0.005, release = 0.05, amplitude = 0.6, phase = 0 } = opts;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out: number[] = new Array(n);
  const attackSamples = Math.floor(SAMPLE_RATE * attack);
  const releaseSamples = Math.floor(SAMPLE_RATE * release);
  for (let i = 0; i < n; i++) {
    let env = 1;
    if (i < attackSamples) env = i / attackSamples;
    if (i > n - releaseSamples) env = Math.max(0, (n - i) / releaseSamples);
    const t = i / SAMPLE_RATE;
    out[i] = amplitude * env * Math.sin(2 * Math.PI * freq * t + phase);
  }
  return out;
}

function square(freq: number, duration: number, opts: {
  attack?: number;
  release?: number;
  amplitude?: number;
} = {}): Wave {
  const { attack = 0.003, release = 0.02, amplitude = 0.4 } = opts;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out: number[] = new Array(n);
  const attackSamples = Math.floor(SAMPLE_RATE * attack);
  const releaseSamples = Math.floor(SAMPLE_RATE * release);
  for (let i = 0; i < n; i++) {
    let env = 1;
    if (i < attackSamples) env = i / attackSamples;
    if (i > n - releaseSamples) env = Math.max(0, (n - i) / releaseSamples);
    const t = i / SAMPLE_RATE;
    const s = Math.sin(2 * Math.PI * freq * t);
    out[i] = amplitude * env * Math.sign(s);
  }
  return out;
}

function triangle(freq: number, duration: number, opts: {
  attack?: number;
  release?: number;
  amplitude?: number;
} = {}): Wave {
  const { attack = 0.005, release = 0.05, amplitude = 0.5 } = opts;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out: number[] = new Array(n);
  const attackSamples = Math.floor(SAMPLE_RATE * attack);
  const releaseSamples = Math.floor(SAMPLE_RATE * release);
  for (let i = 0; i < n; i++) {
    let env = 1;
    if (i < attackSamples) env = i / attackSamples;
    if (i > n - releaseSamples) env = Math.max(0, (n - i) / releaseSamples);
    const t = i / SAMPLE_RATE;
    const phase = (freq * t) % 1;
    const tri = 4 * Math.abs(phase - 0.5) - 1; // triangle -1..1
    out[i] = amplitude * env * tri;
  }
  return out;
}

/** Bruit blanc filtré (passe-bande simplifié) pour whoosh. */
function whoosh(duration: number, opts: {
  amplitude?: number;
  freqStart?: number;
  freqEnd?: number;
} = {}): Wave {
  const { amplitude = 0.5, freqStart = 200, freqEnd = 2000 } = opts;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out: number[] = new Array(n);
  // Filtre passe-bas simple (one-pole) avec fréquence variable
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    // Enveloppe : monte puis descend (forme de whoosh)
    const env = Math.sin(Math.PI * t);
    // Fréquence de coupure variable
    const cutoff = freqStart + (freqEnd - freqStart) * t;
    const alpha = Math.exp(-2 * Math.PI * cutoff / SAMPLE_RATE);
    const noise = (Math.random() * 2 - 1) * env;
    prev = (1 - alpha) * noise + alpha * prev;
    out[i] = amplitude * env * prev;
  }
  return out;
}

function mix(...waves: Wave[]): Wave {
  const len = Math.max(...waves.map((w) => w.length));
  const out: number[] = new Array(len).fill(0);
  for (const w of waves) {
    for (let i = 0; i < w.length; i++) out[i] += w[i];
  }
  // Normalisation pour éviter l'écrêtage
  const max = Math.max(...out.map(Math.abs));
  if (max > 1) {
    for (let i = 0; i < out.length; i++) out[i] /= max;
  }
  return out;
}

function concat(...waves: Wave[]): Wave {
  const out: number[] = [];
  for (const w of waves) out.push(...w);
  return out;
}

function withGain(wave: Wave, gain: number): Wave {
  return wave.map((s) => s * gain);
}

/* ---------- Encodage WAV ---------- */

function writeWav(samples: Wave, filepath: string) {
  const numSamples = samples.length;
  const byteRate = SAMPLE_RATE * CHANNELS * BITS_PER_SAMPLE / 8;
  const blockAlign = CHANNELS * BITS_PER_SAMPLE / 8;
  const dataSize = numSamples * blockAlign;
  const fileSize = 36 + dataSize;

  const buffer = Buffer.alloc(44 + dataSize);
  let offset = 0;

  // RIFF header
  buffer.write("RIFF", offset); offset += 4;
  buffer.writeUInt32LE(fileSize, offset); offset += 4;
  buffer.write("WAVE", offset); offset += 4;

  // fmt subchunk
  buffer.write("fmt ", offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4;        // subchunk size
  buffer.writeUInt16LE(1, offset); offset += 2;          // PCM
  buffer.writeUInt16LE(CHANNELS, offset); offset += 2;
  buffer.writeUInt32LE(SAMPLE_RATE, offset); offset += 4;
  buffer.writeUInt32LE(byteRate, offset); offset += 4;
  buffer.writeUInt16LE(blockAlign, offset); offset += 2;
  buffer.writeUInt16LE(BITS_PER_SAMPLE, offset); offset += 2;

  // data subchunk
  buffer.write("data", offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;

  // Échantillons PCM 16-bit
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(s * 32767), offset);
    offset += 2;
  }

  fs.writeFileSync(filepath, buffer);
  return fs.statSync(filepath).size;
}

/* ---------- Définition des sons ---------- */

interface SoundDef {
  name: string;
  build: () => Wave;
  description: string;
}

const sounds: SoundDef[] = [
  {
    name: "beep-start",
    description: "Bip court d'amorce (880Hz)",
    build: () => sine(880, 0.18, { attack: 0.004, release: 0.08, amplitude: 0.7 }),
  },
  {
    name: "beep-countdown",
    description: "Bip de compte à rebours (660Hz)",
    build: () => sine(660, 0.14, { attack: 0.003, release: 0.06, amplitude: 0.65 }),
  },
  {
    name: "chime-go",
    description: "Carillon double de départ (880+1320Hz)",
    build: () => mix(
      sine(880, 0.35, { attack: 0.005, release: 0.2, amplitude: 0.4 }),
      sine(1320, 0.35, { attack: 0.005, release: 0.2, amplitude: 0.3 }),
      sine(1760, 0.35, { attack: 0.005, release: 0.2, amplitude: 0.2 }),
    ),
  },
  {
    name: "ding-halfway",
    description: "Ding de mi-parcours (1046Hz)",
    build: () => mix(
      triangle(1046, 0.4, { attack: 0.005, release: 0.25, amplitude: 0.5 }),
      sine(1046, 0.4, { attack: 0.005, release: 0.25, amplitude: 0.3 }),
    ),
  },
  {
    name: "chime-complete",
    description: "Carillon de fin d'exercice (accord majeur)",
    build: () => mix(
      sine(523.25, 0.6, { attack: 0.01, release: 0.4, amplitude: 0.35 }), // Do
      sine(659.25, 0.6, { attack: 0.01, release: 0.4, amplitude: 0.3 }),  // Mi
      sine(783.99, 0.6, { attack: 0.01, release: 0.4, amplitude: 0.3 }),  // Sol
      sine(1046.5, 0.6, { attack: 0.01, release: 0.4, amplitude: 0.2 }),  // Do aigu
    ),
  },
  {
    name: "fanfare-celebrate",
    description: "Fanfare de célébration (notes ascendantes + accord)",
    build: () => concat(
      // 3 notes ascendantes
      sine(523.25, 0.15, { attack: 0.005, release: 0.05, amplitude: 0.5 }),  // Do
      silence(0.03),
      sine(659.25, 0.15, { attack: 0.005, release: 0.05, amplitude: 0.5 }),  // Mi
      silence(0.03),
      sine(783.99, 0.15, { attack: 0.005, release: 0.05, amplitude: 0.5 }),  // Sol
      silence(0.03),
      // Accord final tenu
      mix(
        sine(523.25, 1.0, { attack: 0.01, release: 0.6, amplitude: 0.3 }),
        sine(659.25, 1.0, { attack: 0.01, release: 0.6, amplitude: 0.3 }),
        sine(783.99, 1.0, { attack: 0.01, release: 0.6, amplitude: 0.3 }),
        sine(1046.5, 1.0, { attack: 0.01, release: 0.6, amplitude: 0.25 }),
        sine(1318.5, 1.0, { attack: 0.01, release: 0.6, amplitude: 0.15 }),
      ),
    ),
  },
  {
    name: "whoosh",
    description: "Whoosh de transition (bruit filtré)",
    build: () => whoosh(0.5, { amplitude: 0.55, freqStart: 150, freqEnd: 1800 }),
  },
  {
    name: "tick",
    description: "Tic discret (1000Hz, 0.04s)",
    build: () => sine(1000, 0.04, { attack: 0.001, release: 0.02, amplitude: 0.35 }),
  },
  {
    name: "ui-click",
    description: "Clic UI (1200Hz, 0.03s)",
    build: () => square(1200, 0.03, { attack: 0.001, release: 0.015, amplitude: 0.3 }),
  },
  {
    name: "unlock",
    description: "Son de déblocage (arpège ascendant)",
    build: () => concat(
      sine(659.25, 0.1, { attack: 0.003, release: 0.04, amplitude: 0.5 }),  // Mi
      silence(0.02),
      sine(880, 0.1, { attack: 0.003, release: 0.04, amplitude: 0.5 }),     // La
      silence(0.02),
      sine(1318.5, 0.2, { attack: 0.003, release: 0.1, amplitude: 0.5 }),   // Mi aigu
    ),
  },
];

/* ---------- Génération ---------- */

console.log("🎵 Génération des effets sonores...\n");
let totalSize = 0;
for (const s of sounds) {
  const samples = s.build();
  const filepath = path.join(OUT_DIR, `${s.name}.wav`);
  const size = writeWav(samples, filepath);
  totalSize += size;
  const duration = (samples.length / SAMPLE_RATE).toFixed(2);
  console.log(
    `✓ ${s.name}.wav — ${duration}s — ${(size / 1024).toFixed(1)} KB — ${s.description}`,
  );
}
console.log(`\n=== BILAN ===`);
console.log(`Total : ${sounds.length} sons, ${(totalSize / 1024).toFixed(1)} KB`);
console.log(`Dossier : ${OUT_DIR}`);
