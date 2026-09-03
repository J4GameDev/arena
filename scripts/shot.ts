/**
 * Take a screenshot of the game for a post.
 *
 *   npm run shot                                   the Berserker fighting a Strange Bear
 *   npm run shot -- --foe strange-wolf --weapon twin-daggers
 *   npm run shot -- --view gear                    a camp tab: gear | out | craft | inventory
 *   npm run shot -- --url http://localhost:5173    against the dev server instead of the live build
 *   npm run shot -- --out content/shots/bear.png
 *
 * Drives a headless Chromium against the live build with a fresh save, picks
 * the weapon, and hunts until the fight you asked for comes up. Then it
 * freezes the fight clock once a few blows have landed and photographs the
 * scene. Every build is a shareable link; this makes every build a shareable
 * picture too.
 *
 * Freezing works by pinning `performance.now`, which the fight view reads to
 * drive playback. It is a debugging hook the view happens to expose; if the
 * view ever stops using it, this script needs a new one.
 */
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { chromium } from 'playwright';

const args = parseArgs(process.argv.slice(2));
const url = args.get('url') ?? 'https://farther.vercel.app';
const weapon = args.get('weapon') ?? 'greataxe';
const foe = args.get('foe') ?? 'strange-bear';
const view = args.get('view');
const out = args.get('out') ?? `content/shots/${view ?? `${weapon}-vs-${foe}`}.png`;
/** How many hunts to try before giving up on a foe that will not show. */
const MAX_HUNTS = 12;

/** The name the fight view prints for a monster id. Kept in step with data/monsters.ts. */
const FOE_NAMES: Readonly<Record<string, string>> = {
  'strange-boar': 'Strange Boar',
  'strange-elk': 'Strange Elk',
  'strange-wolf': 'Strange Wolf',
  'strange-bear': 'Strange Bear',
  bandit: 'Bandit',
  mugger: 'Mugger',
};

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 820 },
  deviceScaleFactor: 2,
});
await page.goto(url, { waitUntil: 'networkidle' });

// A fresh browser has no save, so the game opens on the weapon choice.
await page.click(`[data-weapon="${weapon}"]`);

if (view !== undefined) {
  await page.click(`[data-tab="${view}"]`);
  await page.waitForTimeout(300);
  mkdirSync(dirname(out), { recursive: true });
  await page.screenshot({ path: out, fullPage: true, animations: 'disabled' });
  console.log(`saved ${out}`);
  await browser.close();
  process.exit(0);
}

const foeName = FOE_NAMES[foe];
if (foeName === undefined) {
  console.error(`Unknown foe "${foe}". Try: ${Object.keys(FOE_NAMES).join(', ')}`);
  process.exit(1);
}

let frozen = false;
for (let hunt = 0; hunt < MAX_HUNTS && !frozen; hunt += 1) {
  // Back to camp if a previous hunt just ended, then out again.
  const back = page.locator('.continue');
  if (await back.count()) await back.click();
  await page.click('[data-tab="out"]');
  await page.click('[data-hunt="forest-edge"]');

  frozen = await page.evaluate(
    async ({ want }) => {
      const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
      const q = (s: string) => document.querySelector(s);
      const realNow = Object.getPrototypeOf(performance).now.bind(performance) as () => number;
      let lastFoe = '';
      const start = Date.now();
      while (Date.now() - start < 25_000) {
        if (q('.outcome')) return false;
        const foes = [...document.querySelectorAll('.side.foe .side-name')].map(
          (e) => e.textContent ?? '',
        );
        const key = foes.join('+');
        if (foes.length === 1 && foes[0] === want) {
          const lines = q('.log')?.children.length ?? 0;
          const hp = parseInt(q('.side.foe .health-text')?.textContent ?? '0', 10);
          const max = parseInt(
            (q('.side.foe .health-text')?.textContent ?? '0/1').split('/')[1] ?? '1',
            10,
          );
          // A few blows in, the foe still clearly alive: that is the picture.
          if (lines >= 4 && hp > max * 0.4) {
            const pin = realNow();
            performance.now = () => pin;
            return true;
          }
        } else if (key !== '' && key !== lastFoe) {
          // Not the one we want: skip this fight and look at the next.
          lastFoe = key;
          (q('.skip') as HTMLButtonElement | null)?.click();
        }
        await wait(100);
      }
      return false;
    },
    { want: foeName },
  );

  // Let the hunt finish if we did not freeze it, so the outcome button exists.
  if (!frozen) await page.locator('.outcome').waitFor({ timeout: 60_000 });
}

if (!frozen) {
  console.error(`No lone ${foeName} turned up in ${MAX_HUNTS} hunts.`);
  await browser.close();
  process.exit(1);
}

mkdirSync(dirname(out), { recursive: true });
await page.locator('.scene').screenshot({ path: out, animations: 'disabled' });
const state = await page.evaluate(() => ({
  hero: document.querySelector('.side.hero .health-text')?.textContent,
  foe: document.querySelector('.side.foe .health-text')?.textContent,
  meter: document.querySelector('.meter-text')?.textContent,
  caption: document.querySelector('.caption')?.textContent,
}));
console.log(`saved ${out}`);
console.log(`  ${state.caption} · hero ${state.hero} · foe ${state.foe} · ${state.meter}`);
await browser.close();

function parseArgs(argv: readonly string[]): Map<string, string> {
  const parsed = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === undefined || !token.startsWith('--')) continue;
    const value = argv[i + 1];
    if (value === undefined) continue;
    parsed.set(token.slice(2), value);
  }
  return parsed;
}
