import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

// .hallmark/preflight.json は hallmark が設計時点で読んだファイルの sha256 を持つ。
// 手で更新しているあいだに黙って drift し、レビューで「ハッシュが不一致」と指摘されて
// 毎回その場で計算し直す手間が発生していた（2026-10 の PR #54）。ここで機械的に突き合わせる。
//
//   bun run preflight:check    # drift があれば非 0 で落ちる（CI で実行）
//   bun run preflight:update   # sha256 を実測値に書き換える（drift を直すとき）

const args = process.argv.slice(2);
const unknown = args.filter((arg) => arg !== "--update");
if (unknown.length > 0) {
  console.error(`[preflight] 不明な引数: ${unknown.join(" ")}。--update 以外は取らない`);
  process.exit(1);
}
const update = args.includes("--update");

const root = new URL("../", import.meta.url);
const preflightFile = new URL(".hallmark/preflight.json", root);
const raw = await readFile(preflightFile, "utf8");
const preflight = JSON.parse(raw);

const drift = [];
for (const source of preflight.sources) {
  const path = new URL(source.path, root);
  if (!existsSync(path)) {
    drift.push({ path: source.path, reason: "ファイルが無い" });
    continue;
  }
  const actual = createHash("sha256").update(await readFile(path)).digest("hex");
  if (actual === source.sha256) continue;
  drift.push({ path: source.path, expected: source.sha256, actual });
  source.sha256 = actual;
}

if (drift.length === 0) {
  console.log(`[preflight] ${preflight.sources.length} 件すべて一致`);
  process.exit(0);
}

const lines = drift.map((d) => (d.reason ? `- ${d.path}: ${d.reason}` : `- ${d.path}: ${d.expected} -> ${d.actual}`));
const missing = drift.filter((d) => d.reason);

if (update) {
  // JSON.stringify で書き直すとキー順とインデントが保たれる（元のファイルも 2 スペース + 末尾改行）
  await writeFile(preflightFile, `${JSON.stringify(preflight, null, 2)}\n`);
  console.log(`[preflight] ${drift.length} 件の sha256 を更新した`);
  console.log(lines.join("\n"));
  process.exit(missing.length > 0 ? 1 : 0);
}

console.error("[preflight] .hallmark/preflight.json の sha256 が実ファイルと一致しない:");
console.error(lines.join("\n"));
if (missing.length > 0) {
  console.error("[preflight] 記録されているのに存在しないファイルがある。preflight.json の sources を直すこと");
} else {
  console.error("[preflight] 直すには bun run preflight:update を実行して差分を commit する");
}
process.exit(1);
