# deploy は wrangler のまま、cf は API 操作に限る

- Status: Accepted
- Date: 2026-10-21

`cf` へ移行できるかを試したが、この repo（Astro 7.3.7・adapter 無しの静的 build）は `cf` で build・deploy できない。`cf dev` は `cloudflare.config.ts` が無い Wrangler プロジェクトでは自動構成を走らせ、非対話環境では確認なしに `cloudflare.config.ts` / `wrangler.config.ts` を書き、`package.json`（`deploy` script を含む）・lockfile・`.gitignore`・`vite.config.ts` を変更してから `astro dev` に委譲する。`cf` は build も `astro build` に委譲し、その後 `.cloudflare/output/v0/config.json`（Build Output Specification）を読むが、adapter 無しの `astro build` は `dist/` に HTML を書くだけでこの形式を作らないため、`cf deploy --dry-run` は `no root config found at .cloudflare/output/v0/config.json` で失敗する（2026-10 に `cf migrate` 後に確認）。`cf dev` は `public/_redirects` も解釈しない。よって dev・build・deploy は Astro + wrangler（`bun run deploy`）のまま残し、`cf` は zone・DNS など API 操作にだけ使う。`public/_redirects` のローカル確認は `wrangler dev` でしかできない。公式 docs も「Astro 6 以降は beta の間 `cf` で build できない」としている。

却下した案:

- **`@astrojs/cloudflare` adapter（安定版 14.4.1）の導入**: 依存が `@cloudflare/vite-plugin ^1.63.1`（安定版 1.x）で、cf 形式を書くのは 2.0.0-beta だけなので `cf deploy` は同じ箇所で失敗する（`npm view` で確認）。加えて静的サイトに SSR 用 adapter を入れること自体が deploy 方式の変更になる
- **`@astrojs/cloudflare` 15.0.0-beta.2 の導入**: `@cloudflare/vite-plugin 2.0.0-beta.v.1` を使い `cf` での deploy に対応するが、peer が `astro ^7.4.0` でこの repo は 7.3.7（2026-10-21 時点。astro の最新は 7.4.1）。beta で、しかも Astro 側の minor 更新を伴うため、今回は採らない
- **plugin 2.0-beta を Astro の Vite 設定に直接差し込む**: Cloudflare も Astro もサポートしない組合せ。main merge = 即本番なので壊れたときの切り分けができず、7 day cooldown を満たす版も選べない
- **Build Output を自作して `--prebuilt` で deploy**: beta の内部形式に依存した経路を本番 deploy に載せることになる

再開条件: `cf` が Astro 6 以降の build に対応したら移行を検討する。具体的には「adapter 15 系が stable になり、astro 7.4 以降へ上げたうえで `cf deploy --dry-run` が通る」ことを確認できた時点で、`cf migrate` からやり直す（手順は `.agents/skills/cf-cli`）。

`cf migrate` と `cf dev` は書き換える範囲が違う。`cf migrate` は `wrangler.jsonc` を変更せず、`cloudflare.config.ts`（と Wrangler bundler を使う場合は `wrangler.config.ts`）を作り、`cf` を devDependency に足して `package.json`・lockfile を変える。`cloudflare.config.ts` が既にあると実行されない。どちらも `--dry-run` では挙動を確かめきれないので、試すときは使い捨て branch か worktree で実行し、直後に `git status --short` を見る。revert は docs の undo 手順どおり、変更されたファイルを `git restore` で戻し、新規に出た `cloudflare.config.ts` / `wrangler.config.ts` / `.cloudflare/` を消し、`node_modules` を lockfile 通りに揃え直すところまで含めて完了する。
