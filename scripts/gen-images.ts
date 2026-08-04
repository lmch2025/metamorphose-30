 
/**
 * Task ID: 1 — Generate ultra-realistic fitness images via z-ai-web-dev-sdk.
 *
 * Produces 16 images into /home/z/my-project/public/images/:
 *   - 1 hero (1440x720)
 *   - 5 ambient (1024x1024): face / cardio / tone / cooldown (4 listed + cooldown = actually 4)
 *   - 4 face exercises (768x1344 portrait)
 *   - 3 cardio exercises (768x1344 portrait)
 *   - 4 tone exercises (768x1344 portrait)
 *
 * Robustness:
 *   - each image wrapped in try/catch (failures don't abort the batch)
 *   - small delay between calls to avoid rate limiting
 *   - one shared ZAI instance
 *   - CLI filter: `bun run scripts/gen-images.ts ex-face-fish` will (re)generate only
 *     the images whose `name` matches one of the args (substring match)
 */

import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images';
fs.mkdirSync(OUT_DIR, { recursive: true });

type ImgSize = '1024x1024' | '768x1344' | '864x1152' | '1344x768' | '1152x864' | '1440x720' | '720x1440' | (string & {});

interface ImgJob {
  name: string;
  size: ImgSize;
  prompt: string;
}

const JOBS: ImgJob[] = [
  {
    name: 'hero-immersive.jpg',
    // NOTE: original spec was 1440x720, but 720 is NOT a multiple of 32 so the
    // image API rejects it ("size的长宽均需满足512px-2880px之间,且为32整数倍,且最大像素数不超过2^22px").
    // 1472x736 is the closest valid 2:1 size (1472=32*46, 736=32*23, 1,083,392 px ≤ 2^22).
    size: '1472x736',
    prompt:
      "Ultra-realistic photorealistic cinematic scene of a serene zen wellness sanctuary at golden hour, a fit person meditating and stretching on a wooden deck overlooking misty mountains, soft volumetric god rays, lush tropical plants, tranquil peaceful atmosphere, professional cinematography, 8k quality, warm golden tones, depth of field",
  },
  {
    name: 'ambient-face.jpg',
    size: '1024x1024',
    prompt:
      "Ultra-realistic photorealistic close-up portrait of a person doing facial yoga exercises in a calm spa setting with soft natural light, serene expression, dewy skin, professional beauty photography, shallow depth of field",
  },
  {
    name: 'ambient-cardio.jpg',
    size: '1024x1024',
    prompt:
      "Ultra-realistic photorealistic dynamic shot of a person doing high-intensity cardio workout outdoors at sunrise, motion blur, energetic, sweating, athletic, professional sports photography, vibrant warm lighting",
  },
  {
    name: 'ambient-tone.jpg',
    size: '1024x1024',
    prompt:
      "Ultra-realistic photorealistic athletic person doing bodyweight strength training in a minimalist modern studio with large windows, natural light, toned muscles, professional fitness photography, clean aesthetic",
  },
  {
    name: 'ex-face-fish.jpg',
    size: '768x1344',
    prompt:
      "Ultra-realistic photorealistic fitness model demonstrating fish face exercise, sucking cheeks inward, clear side profile, neutral studio background, professional exercise demonstration photography, high detail",
  },
  {
    name: 'ex-face-cheek.jpg',
    size: '768x1344',
    prompt:
      "Ultra-realistic photorealistic fitness model demonstrating cheek lift smile exercise, wide smile lifting cheeks, neutral studio background, professional exercise demonstration, high detail",
  },
  {
    name: 'ex-face-jaw.jpg',
    size: '768x1344',
    prompt:
      "Ultra-realistic photorealistic fitness model demonstrating jaw release exercise, jaw moved to side, neutral studio background, professional exercise demonstration, high detail",
  },
  {
    name: 'ex-face-neck.jpg',
    size: '768x1344',
    prompt:
      "Ultra-realistic photorealistic fitness model demonstrating neck stretch, tilting head to side stretching neck, neutral studio background, professional exercise demonstration, high detail",
  },
  {
    name: 'ex-cardio-jacks.jpg',
    size: '768x1344',
    prompt:
      "Ultra-realistic photorealistic athletic person demonstrating jumping jacks exercise mid-motion, arms overhead legs apart, neutral studio background, professional exercise demonstration photography, high detail",
  },
  {
    name: 'ex-cardio-knees.jpg',
    size: '768x1344',
    prompt:
      "Ultra-realistic photorealistic athletic person demonstrating high knees running in place, dynamic motion, neutral studio background, professional exercise demonstration, high detail",
  },
  {
    name: 'ex-cardio-climbers.jpg',
    size: '768x1344',
    prompt:
      "Ultra-realistic photorealistic athletic person demonstrating mountain climbers plank position, one knee drawn in, neutral studio background, professional exercise demonstration, high detail",
  },
  {
    name: 'ex-tone-squat.jpg',
    size: '768x1344',
    prompt:
      "Ultra-realistic photorealistic athletic person demonstrating bodyweight squat, lowest position thighs parallel, neutral studio background, professional exercise demonstration, high detail",
  },
  {
    name: 'ex-tone-plank.jpg',
    size: '768x1344',
    prompt:
      "Ultra-realistic photorealistic athletic person demonstrating forearm plank hold, straight body line, neutral studio background, professional exercise demonstration, high detail",
  },
  {
    name: 'ex-tone-lunge.jpg',
    size: '768x1344',
    prompt:
      "Ultra-realistic photorealistic athletic person demonstrating forward lunge, front knee bent 90 degrees, neutral studio background, professional exercise demonstration, high detail",
  },
  {
    name: 'ex-tone-bridge.jpg',
    size: '768x1344',
    prompt:
      "Ultra-realistic photorealistic athletic person demonstrating glute bridge exercise, hips lifted up, neutral studio background, professional exercise demonstration, high detail",
  },
  {
    name: 'ambient-cooldown.jpg',
    size: '1024x1024',
    prompt:
      "Ultra-realistic photorealistic serene person doing cool down stretching in peaceful garden at sunset, soft warm light, calm meditative, professional wellness photography",
  },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function sizeBytes(p: string): number {
  try {
    return fs.statSync(p).size;
  } catch {
    return 0;
  }
}

async function genOne(zai: any, job: ImgJob, attempt = 1): Promise<boolean> {
  const outPath = path.join(OUT_DIR, job.name);
  try {
    console.log(`[gen] ${job.name} (${job.size}) attempt ${attempt} ...`);
    const res = await zai.images.generations.create({ prompt: job.prompt, size: job.size });
    const b64 = res?.data?.[0]?.base64;
    if (!b64 || typeof b64 !== 'string' || b64.length < 1000) {
      throw new Error('Empty or too-short base64 payload returned');
    }
    fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
    const kb = (sizeBytes(outPath) / 1024).toFixed(1);
    console.log(`[ok ] ${job.name}  ->  ${kb} KB`);
    return true;
  } catch (err: any) {
    console.error(`[err] ${job.name} attempt ${attempt}: ${err?.message || err}`);
    return false;
  }
}

async function main() {
  // Optional CLI filter: only (re)generate images whose name contains any of the args.
  const filterArgs = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const force = process.argv.includes('--force');
  let selected = filterArgs.length
    ? JOBS.filter((j) => filterArgs.some((f) => j.name.includes(f)))
    : JOBS;

  if (!selected.length) {
    console.error('No matching jobs. Args:', filterArgs);
    process.exit(1);
  }

  // Skip jobs that already exist on disk with a non-trivial size, unless --force.
  if (!force) {
    selected = selected.filter((j) => {
      const b = sizeBytes(path.join(OUT_DIR, j.name));
      if (b >= 5 * 1024) {
        console.log(`[skip] ${j.name} already exists (${(b / 1024).toFixed(1)} KB)`);
        return false;
      }
      return true;
    });
  }

  if (!selected.length) {
    console.log('Nothing to generate — all images already on disk. Use --force to regenerate.');
    return;
  }

  console.log(`Generating ${selected.length} image(s) into ${OUT_DIR}`);
  const zai = await ZAI.create();

  const succeeded: string[] = [];
  const failed: string[] = [];

  for (let i = 0; i < selected.length; i++) {
    const job = selected[i];
    const ok = await genOne(zai, job, 1);
    if (ok) {
      succeeded.push(job.name);
    } else {
      // one retry after a longer pause
      await sleep(2000);
      const ok2 = await genOne(zai, job, 2);
      if (ok2) succeeded.push(job.name);
      else failed.push(job.name);
    }
    // pacing between distinct jobs
    if (i < selected.length - 1) await sleep(800);
  }

  console.log('\n=========== SUMMARY ===========');
  console.log(`OK  (${succeeded.length}): ${succeeded.join(', ') || '—'}`);
  console.log(`FAIL(${failed.length}): ${failed.join(', ') || '—'}`);

  // final disk listing
  console.log('\n--- files on disk ---');
  for (const j of JOBS) {
    const p = path.join(OUT_DIR, j.name);
    const b = sizeBytes(p);
    console.log(`  ${b ? '✓' : '✗'}  ${j.name.padEnd(28)} ${(b / 1024).toFixed(1)} KB`);
  }

  process.exit(failed.length ? 2 : 0);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
