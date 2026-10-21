# deploy は wrangler のまま、cf は API 操作に限る

- Status: Accepted
- Date: 2026-10-21

`cf` への移行を試したが、この repo（Astro 7.3.7・adapter 無しの静的 build）は `cf` で build・deploy できない。`cf` は Astro を検出すると build を `astro build` に委譲し、その後 `.cloudflare/output/v0/config.json`（Build Output Specification）を読む。adapter 無しの `astro build` は `dist/` に HTML を書くだけでこの形式を作らないため、`cf deploy --dry-run` は `no root config found at .cloudflare/output/v0/config.json` で失敗する（2026-10 に `cf migrate` 後に確認）。`cf dev` も `astro dev` に委譲するだけで、`public/_redirects` を解釈しない。よって dev・build・deploy は Astro + wrangler（`bun run deploy`）のまま残し、`cf` は zone・DNS など API 操作にだけ使う。公式 docs も「Astro 6 以降は beta の間 `cf` で build できない」としている。

却下した案:

- **`@astrojs/cloudflare` adapter の導入**: adapter 14.4.1 は `@cloudflare/vite-plugin ^1.63.1`（安定版 1.x）に依存し、cf 形式を書くのは 2.0.0-beta だけなので、adapter を足しても `cf deploy` は同じ箇所で失敗する（`npm view` で確認）。docs の「Astro 6 以降は非対応」の実体がこの世代差。加えて静的サイトに SSR 用 adapter を入れること自体が deploy 方式の変更になる
- **plugin 2.0-beta を Astro の Vite 設定に直接差し込む**: Cloudflare も Astro もサポートしない組合せ。main merge = 即本番なので壊れたときの切り分けができず、7 day cooldown を満たす版も選べない
- **Build Output を自作して `--prebuilt` で deploy**: beta の内部形式に依存した経路を本番 deploy に載せることになる

再開条件: `cf` が Astro 6 以降の build に対応したら `cf migrate` から移行する（手順は `.agents/skills/cf-cli`）。`cf migrate` / `cf dev` は確認なしに `package.json`・`bun.lock`・`.gitignore`・`wrangler.jsonc` を書き換えるため、`cf migrate` を試すときは使い捨て branch か worktree で実行し、直後に `git status --short` を見る。revert は `node_modules` を lockfile 通りに揃え直すところまで含めて完了する。
