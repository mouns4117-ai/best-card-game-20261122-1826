// Ember Court — the hand-in program (Node 22, standard library only).
// It copies this repository's game/ and screenshots/ into /output (or the
// directory MAKEFUN_OUTPUT_DIR names) and writes /output/dossier.json, the
// summary the judge reads, with the vendored make.fun library.
//
// The program is deterministic: the same files in give the same bytes out.
// The output directory is emptied by removing its contents only — never the
// directory itself, which the grader mounts read-only from above.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

/** Remove every entry inside `dir`, leaving the directory itself in place. */
function emptyContents(dir) {
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

mkdirSync(out, { recursive: true });
emptyContents(out);
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's caps for this bounty (from the kit's gate): at most 4
// screenshots of 256 KiB, at most 993 files and 48 MiB of game files, and the
// dossier text capped at 160 KiB. The library refuses an entry that breaks one.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

console.log('Ember Court handed in: game/, screenshots/ and dossier.json are in ' + out);
