import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { parse } from "node-html-parser";

// hobby 詳細ページの OGP カードは build 時にリンク先を取得せず、この snapshot を読む。
// ビルドごとに外部サイトを叩くと、取得元の rate limit（例: opengraph.githubassets.com の 429）で
// 画像が黙って欠けるため、取得と build を分離する（docs/adr/）。
//
//   bun run ogp:update   snapshot を更新する（ネットワークを使う）
//   bun tools/update-ogp.mjs --check  snapshot が hobby.ts と同期しているか検証する（ネットワーク不要）

const root = new URL("../", import.meta.url);
const hobbyFile = new URL("src/data/hobby.ts", root);
const assetsDir = new URL("src/assets/", root);
const imageDir = new URL("ogp/", assetsDir);
const snapshotFile = new URL("src/data/ogp.json", root);
const checkOnly = process.argv.includes("--check");
const MAX_ATTEMPTS = 4;
const MAX_WAIT_SECONDS = 15 * 60;

const extensions = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

/** hobby.ts の entry から slug と externalUrl を拾う。画像を import する .ts は直接読み込めないため */
async function readProjects() {
  const source = await readFile(hobbyFile, "utf8");
  const projects = [];
  for (const block of source.slice(source.indexOf("export const hobbyProjects")).split(/\n  \{\n/).slice(1)) {
    const slug = block.match(/slug:\s*"([^"]+)"/)?.[1];
    const url = block.match(/externalUrl:\s*"([^"]+)"/)?.[1];
    if (slug && url) projects.push({ slug, url });
  }
  if (projects.length === 0) throw new Error("hobby.ts から externalUrl を1件も読めなかった");
  return projects;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** rate limit (429) と一時的な 5xx は Retry-After / x-ratelimit-reset を尊重して待って再試行する */
async function request(url, label, init) {
  for (let attempt = 1; ; attempt += 1) {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(20_000) });
    if (res.ok) return res;
    const retryAfter = Number(res.headers.get("retry-after")) || 0;
    const resetAt = Number(res.headers.get("x-ratelimit-reset")) || 0;
    const resetIn = resetAt ? Math.max(0, resetAt - Math.floor(Date.now() / 1000)) : 0;
    const wait = Math.min(Math.max(retryAfter, resetIn, 5 * 2 ** (attempt - 1)), MAX_WAIT_SECONDS);
    if (attempt >= MAX_ATTEMPTS || (res.status !== 429 && res.status < 500)) {
      throw new Error(`${label}: ${res.status} ${res.statusText}`);
    }
    console.warn(`[ogp] ${label}: ${res.status} — ${wait}s 待って再試行 (${attempt}/${MAX_ATTEMPTS - 1})`);
    await sleep(wait * 1000);
  }
}

/** 内容が同じなら書き込まない（画像の意味のない churn を避ける） */
async function writeIfChanged(file, bytes) {
  if (existsSync(file) && Buffer.compare(await readFile(file), bytes) === 0) return;
  await writeFile(file, bytes);
}

async function fetchOgp(url, slug) {
  const res = await request(url, slug, {
    headers: { accept: "text/html", "user-agent": "wwwyo.dev-ogp/1.0" },
  });
  const doc = parse(await res.text());
  const meta = (key) =>
    doc
      .querySelector(`meta[property="${key}"], meta[name="${key}"]`)
      ?.getAttribute("content")
      ?.trim() || undefined;

  const title = meta("og:title") ?? doc.querySelector("title")?.text.trim();
  if (!title) throw new Error(`${slug}: og:title も title も無い`);

  const description = meta("og:description") ?? meta("description");
  const entry = {
    title,
    ...(description ? { description } : {}),
    siteName: meta("og:site_name") ?? new URL(url).hostname,
  };

  const ogImage = meta("og:image");
  if (!ogImage) return entry;

  const source = new URL(ogImage, res.url).href;
  const image = await request(source, `${slug} の og:image`, {});
  const contentType = image.headers.get("content-type")?.split(";")[0].trim() ?? "";
  const extension = extensions[contentType];
  if (!extension) throw new Error(`${slug}: og:image の content-type が不明 (${contentType || "なし"})`);

  const file = `ogp/${slug}.${extension}`;
  await writeIfChanged(new URL(file, assetsDir), Buffer.from(await image.arrayBuffer()));
  return { ...entry, image: { file, source } };
}

async function readSnapshot() {
  try {
    return JSON.parse(await readFile(snapshotFile, "utf8"));
  } catch {
    return {};
  }
}

const projects = await readProjects();
const snapshot = await readSnapshot();

if (checkOnly) {
  // build を通すのと同じ条件だけを検証する（取得元の内容が変わったかは見ない）
  const problems = [];
  for (const { slug, url } of projects) {
    const entry = snapshot[url];
    if (!entry) {
      problems.push(`${slug}: ${url} の snapshot が無い`);
    } else if (entry.image && !existsSync(new URL(entry.image.file, assetsDir))) {
      problems.push(`${slug}: ${entry.image.file} が無い`);
    }
  }
  if (problems.length > 0) {
    console.error(`OGP snapshot が hobby.ts と同期していない:\n  ${problems.join("\n  ")}`);
    console.error("bun run ogp:update で更新する");
    process.exit(1);
  }
  console.log(`[ogp] snapshot は同期している (${projects.length} 件)`);
  process.exit(0);
}

await mkdir(imageDir, { recursive: true });

const next = {};
const used = new Set();
for (const { slug, url } of projects) {
  const entry = await fetchOgp(url, slug);
  next[url] = entry;
  if (entry.image) used.add(entry.image.file.replace("ogp/", ""));
  console.log(`[ogp] ${slug}: ${entry.title.slice(0, 40)}${entry.image ? "" : " (画像なし)"}`);
}

// 使われなくなった画像を消す（hobby から外れた・slug が変わった等）
for (const name of await readdir(imageDir)) {
  if (!used.has(name)) {
    await rm(new URL(name, imageDir));
    console.log(`[ogp] 未使用の画像を削除: ${name}`);
  }
}

await writeFile(snapshotFile, `${JSON.stringify(next, null, 2)}\n`);
console.log(`[ogp] src/data/ogp.json を更新した (${projects.length} 件)`);
