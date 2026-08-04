/**
 * Task ID: 2 - Research free 3D movement / exercise resources
 *
 * Uses the z-ai-web-dev-sdk `web_search` function to query several topics,
 * then writes the raw results to /home/z/my-project/scripts/search-results.json
 * so they can be curated into `src/lib/resources-data.ts`.
 *
 * Run with:  bun scripts/research-resources.ts
 */
import ZAI from 'z-ai-web-dev-sdk';
import { writeFileSync } from 'node:fs';

async function search(query: string, num = 8) {
  const zai = await ZAI.create();
  return await zai.functions.invoke('web_search', { query, num });
}

const queries: string[] = [
  'Mixamo free 3D character animations exercise',
  'Sketchfab free 3D exercise models downloadable',
  'free 3D fitness animation models online viewer',
  'Adobe Fuse free character creator',
  'free exercise form video reference website',
  'Bodyweight exercise demonstration free online',
  'Daz 3D free models fitness',
  'free yoga pose 3D model online',
];

interface RawSearchResult {
  title?: string;
  url?: string;
  link?: string;
  snippet?: string;
  description?: string;
  content?: string;
  [key: string]: unknown;
}

async function main() {
  console.log('=== Research: free 3D movement / exercise resources ===\n');
  const out: Record<string, unknown> = {};

  for (const q of queries) {
    console.log(`\n--- Query: ${q} ---`);
    try {
      const res = await search(q, 8);
      out[q] = res;

      // Print a short summary so we can see what came back.
      const items = Array.isArray(res)
        ? res
        : (res as { results?: RawSearchResult[]; data?: RawSearchResult[] })
            .results ?? (res as { data?: RawSearchResult[] }).data ?? [];

      console.log(`Got ${(items as unknown[]).length} items`);
      for (const item of items as RawSearchResult[]) {
        const title = item.title || item.snippet || '';
        const url = item.url || item.link || '';
        if (title || url) console.log(`  - ${title} :: ${url}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ERROR for "${q}": ${msg}`);
      out[q] = { error: msg };
    }
  }

  const dest = '/home/z/my-project/scripts/search-results.json';
  writeFileSync(dest, JSON.stringify(out, null, 2));
  console.log(`\nWrote raw results to ${dest}`);
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
