import { readdir, readFile } from "node:fs/promises";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";

// 総称 `monospace` を単独で書くと、日本語ロケールの Chromium はそれを Osaka-Mono に解決する。
// Osaka の実体が無い macOS ではフォールバックも効かず、ASCII まで豆腐（□）になる。
// 2026-10 に skillctrl のサムネイル SVG（`src/assets/projects/skillctrl.svg`）と詳細ページ
// （`tokens.css` の `--sc-font-mono`）で実際に起きた。どちらも同じ並びの実フォント列
// （`ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace`）に揃えて直した。
//
// 注意書きだけでは、project ページやサムネイル SVG を足すたびに同じ指定が復活する。
// ここで「総称 `monospace` を含む宣言には、同じ宣言の中に Menlo（この Mac で実体がある等幅）が
// 要る」という形で機械的に落とす。SVG の `font-family` 属性と DESIGN.md の typography token も
// 同じ規則で見る（`<img>` で読む SVG は CSS 変数を継承できないので、実フォント列を直書きするしかない）。
//
// 却下した対処: 等幅 web フォントを読み込む（DESIGN.md の「web フォントを一切読み込まない」に反する）、
// Chrome の固定幅フォント設定を変える（読者ごとの設定で、サイト側の再発は防げない）。
// RSS のブラウザ表示の豆腐は配信バイト列ではなく Chrome の XML ビューアの等幅表示に由来するので、
// この check の対象外（feed を変えても直らない）。
//
//   bun run check:font-stack   # 違反があれば非 0 で落ちる（CI で実行）

const TARGET_EXTENSIONS = new Set([".css", ".svg", ".astro", ".tsx", ".ts", ".md", ".mdx"]);
const SKIP_DIRECTORIES = new Set(["node_modules", "dist", ".git", ".wrangler", ".astro", ".cloudflare"]);
const MONO_GENERIC = /(?<![\w-])monospace(?![\w-])/g;
const KNOWN_MONO = "Menlo";
const DECLARATION_BREAKS = [";", "}", "{"];

const root = new URL("../", import.meta.url);

async function* walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRECTORIES.has(entry.name)) yield* walk(new URL(`${entry.name}/`, directory));
      continue;
    }
    const extension = entry.name.slice(entry.name.lastIndexOf("."));
    if (TARGET_EXTENSIONS.has(extension)) yield new URL(entry.name, directory);
  }
}

const violations = [];
let scanned = 0;

for await (const file of walk(root)) {
  const content = await readFile(file, "utf8");
  if (!content.includes("monospace")) continue;

  // .md / .mdx は frontmatter（DESIGN.md の typography token）だけを見る。
  // 本文の「総称 monospace を使わない」という説明文まで違反にすると、規則を書けなくなる。
  let text = content;
  let textOffset = 0;
  if (file.pathname.endsWith(".md") || file.pathname.endsWith(".mdx")) {
    const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatter) continue;
    text = frontmatter[1];
    textOffset = frontmatter.index + frontmatter[0].indexOf(frontmatter[1]);
  }
  scanned += 1;

  for (const match of text.matchAll(MONO_GENERIC)) {
    // 同じ宣言の中に Menlo があるか。宣言の境界は CSS の `;` `}` と属性の終わり。
    const window = text.slice(Math.max(0, match.index - 400), match.index);
    const knownAt = window.lastIndexOf(KNOWN_MONO);
    const breakAt = Math.max(...DECLARATION_BREAKS.map((token) => window.lastIndexOf(token)));
    if (knownAt > breakAt) continue;

    const absolute = textOffset + match.index;
    const line = content.slice(0, absolute).split("\n").length;
    const declaration = content.slice(absolute - 120, absolute + 20).split("\n").join(" ").trim();
    violations.push({ path: relative(fileURLToPath(root), fileURLToPath(file)), line, declaration });
  }
}

if (violations.length === 0) {
  console.log(`[font-stack] ${scanned} ファイルに総称 monospace 単独の指定なし`);
  process.exit(0);
}

console.error("[font-stack] 総称 monospace 単独の指定がある。日本語ロケールの Chromium では Osaka-Mono に解決され、実体が無い macOS で豆腐になる:");
for (const violation of violations) {
  console.error(`- ${violation.path}:${violation.line}: ...${violation.declaration}`);
}
console.error(`[font-stack] CSS は var(--font-mono) / var(--sc-font-mono)、SVG は ${KNOWN_MONO} を含む実フォント列を書くこと`);
process.exit(1);
