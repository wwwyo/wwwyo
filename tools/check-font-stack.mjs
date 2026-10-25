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
// ここで「等幅の宣言の中で総称 `monospace` を書くなら、同じ宣言に Menlo（この Mac で実体がある
// 等幅）も要る」という形で機械的に落とす。SVG の `font-family` 属性と DESIGN.md の
// `fontFamily` token も同じ規則で見る（`<img>` で読む SVG は CSS 変数を継承できないので、
// 実フォント列を直書きするしかない）。
//
// 対象は font の宣言だけ。コメント・散文・文字列の中で `monospace` という単語に触れただけで
// 落ちると、規則を説明する文章すら書けなくなる（この注意書き自身が該当する）。
//
// 却下した対処: 等幅 web フォントを読み込む（DESIGN.md の「web フォントを一切読み込まない」に反する）、
// Chrome の固定幅フォント設定を変える（読者ごとの設定で、サイト側の再発は防げない）。
// RSS のブラウザ表示の豆腐は配信バイト列ではなく Chrome の XML ビューアの等幅表示に由来するので、
// この check の対象外（feed を変えても直らない）。
//
//   bun run check:font-stack   # 違反があれば非 0 で落ちる（CI で実行）

const TARGET_EXTENSIONS = new Set([".css", ".svg", ".astro", ".tsx", ".ts", ".js", ".mjs", ".cjs", ".md", ".mdx"]);
const SKIP_DIRECTORIES = new Set(["node_modules", "dist", ".git", ".wrangler", ".astro", ".cloudflare"]);
const MONO_GENERIC = /(?<![\w-])monospace(?![\w-])/gi;
const MONO_KEYWORD = /monospace/i;
const KNOWN_MONO = /menlo/i;
// 宣言の境界。SVG の属性は `;` で終わらないので `<` `>` でも区切る
// （`<text font-family="Menlo">A</text><text font-family="monospace">B</text>` の2つ目を、
// 1つ目の Menlo で見逃さないため）。
const DECLARATION_BREAKS = [";", "}", "{", "<", ">"];
// 宣言の見出し。CSS の `font-family:`、SVG の `font-family="..."`、素の CSS 変数
// （`--font-mono:` / `--sc-font-mono:`）、DESIGN.md と React の `fontFamily:` を拾う。
// `ui-monospace` は総称ではないので MONO_GENERIC が除く。CSS のキーワードは大文字小文字を
// 区別しない（`font-family: MONOSPACE`）ので、判定は全体を case-insensitive にする。
const FONT_DECLARATION_HEAD = /(?:font-family|fontFamily|--[\w-]*font[\w-]*)\s*[:=]/i;

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

// コメントを空白で塗り潰す。長さを保つので、以降も match.index がそのまま行番号に使える。
// `//` は直前が `:` のとき（`https://`）はコメントにしない。
function maskComments(source, extension) {
  const characters = source.split("");
  const blank = (start, end) => {
    for (let index = start; index < end; index += 1) {
      if (characters[index] !== "\n") characters[index] = " ";
    }
  };
  for (const pattern of [/\/\*[\s\S]*?\*\//g, /<!--[\s\S]*?-->/g]) {
    for (const match of source.matchAll(pattern)) blank(match.index, match.index + match[0].length);
  }
  if ([".ts", ".tsx", ".mts", ".js", ".mjs", ".cjs", ".astro"].includes(extension)) {
    for (const match of source.matchAll(/(^|[\s;{,()])\/\/[^\n]*/g)) {
      const start = match.index + match[1].length;
      blank(start, match.index + match[0].length);
    }
  }
  return characters.join("");
}

// 宣言の先頭から総称 monospace の直前までを返す。宣言の境界は CSS の `;` `}` `{`。
function declarationHead(masked, index) {
  const from = Math.max(0, index - 400);
  const window = masked.slice(from, index);
  const start = Math.max(...DECLARATION_BREAKS.map((token) => window.lastIndexOf(token))) + 1;
  return window.slice(start);
}

const violations = [];
let scanned = 0;

for await (const file of walk(root)) {
  const content = await readFile(file, "utf8");
  if (!MONO_KEYWORD.test(content)) continue;
  const extension = file.pathname.slice(file.pathname.lastIndexOf("."));

  // .md / .mdx は frontmatter（DESIGN.md の typography token）だけを見る。本文は散文なので対象外。
  let text = content;
  let textOffset = 0;
  if (extension === ".md" || extension === ".mdx") {
    const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatter) continue;
    text = frontmatter[1];
    textOffset = frontmatter.index + frontmatter[0].indexOf(frontmatter[1]);
  }
  scanned += 1;

  const masked = maskComments(text, extension);
  for (const match of masked.matchAll(MONO_GENERIC)) {
    const head = declarationHead(masked, match.index);
    if (!FONT_DECLARATION_HEAD.test(head)) continue;
    if (KNOWN_MONO.test(head)) continue;

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
console.error(`[font-stack] CSS は var(--font-mono) / var(--sc-font-mono)、SVG は Menlo を含む実フォント列を書くこと`);
process.exit(1);
