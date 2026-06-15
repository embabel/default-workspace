// Build authored program lenses: src/<name>.lens.ts → ../<name>.lens.js
//
// The runtime substrate is "inline class body against a host-injected `Lens`
// base" — the SAME substrate a dynamically-generated lens runs against. So the
// build only needs to (1) strip TS types and (2) remove the
// `@embabel/runtime-types` import and any `export`, leaving a bare class that
// references `Lens` as the ambient the host driver injects. esbuild does the
// type-strip; a couple of line rewrites do the rest.
//
// Authoring imports `@embabel/runtime-types` exactly like a pack type imports
// `Entity` (so `npm run typecheck` checks against the real types); the import is
// a build-time-only convenience, resolved away here.

import { transform } from "esbuild";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = join(here, "src");

const RUNTIME_IMPORT = /^\s*import\s+(?:type\s+)?\{[^}]*\}\s+from\s+["']@embabel\/runtime-types["'];?\s*$/gm;
const EXPORT_KEYWORD = /^\s*export\s+(class|function|const|let|var|abstract)\b/gm;
const EXPORT_STATEMENT = /^\s*export\s*\{[^}]*\};?\s*$/gm;

async function buildOne(file) {
  const name = basename(file, ".ts"); // e.g. "briefing.lens"
  const ts = await readFile(join(srcDir, file), "utf8");
  const { code } = await transform(ts, { loader: "ts", format: "esm", target: "es2022" });
  const js = code
    .replace(RUNTIME_IMPORT, "")
    .replace(EXPORT_STATEMENT, "")
    .replace(EXPORT_KEYWORD, "$1")
    .replace(/^\n+/, "");
  const out = join(here, `${name}.js`);
  const header =
    `// GENERATED from src/${file} by build.mjs — do not edit. Run \`npm run build\`.\n` +
    `// Runs against the host-injected \`Lens\` base (ModuleLensOpener); no import at runtime.\n\n`;
  await writeFile(out, header + js);
  return `${file} → ${basename(out)} (${(header + js).length} bytes)`;
}

const files = (await readdir(srcDir)).filter((f) => f.endsWith(".lens.ts"));
if (!files.length) {
  console.error("No src/*.lens.ts files found.");
  process.exit(1);
}
for (const f of files) console.log("built", await buildOne(f));
