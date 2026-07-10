// Subsets the jf open 粉圓 (open-huninn) TTF down to the character set in
// scripts/charset.txt and emits woff2 into src/assets/fonts/.
// Run with: bun run subset-fonts
import subsetFont from "subset-font";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const srcDir = path.join(root, "assets-src/fonts");
const outDir = path.join(root, "src/assets/fonts");
const MAX_BYTES = 1.5 * 1024 * 1024;

// open-huninn v2.1 ships a single Regular weight only, mapped to 400.
// Add a 700 entry here if/when justfont releases a Bold TTF.
const weights = [{ weight: 400, src: "jf-openhuninn-2.1.ttf" }];

const charset = await readFile(path.join(root, "scripts/charset.txt"), "utf8");
await mkdir(outDir, { recursive: true });

for (const { weight, src } of weights) {
  const ttf = await readFile(path.join(srcDir, src));
  const woff2 = await subsetFont(ttf, charset, { targetFormat: "woff2" });
  const outPath = path.join(outDir, `huninn-${weight}.woff2`);
  await writeFile(outPath, woff2);

  const kb = (woff2.length / 1024).toFixed(1);
  const rel = path.relative(root, outPath);
  if (woff2.length > MAX_BYTES) {
    throw new Error(`${rel} is ${kb} KB, over the 1.5 MB budget`);
  }
  console.log(`${rel}  ${kb} KB  (from ${src}, ${[...charset].length} glyphs)`);
}
