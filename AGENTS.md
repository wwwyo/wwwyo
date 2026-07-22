# wwwyo.dev

個人の portfolio / blog サイト。成果物の一覧と、interactive なコンポーネント（tools の埋め込み・外部 API を叩くデモ等）を埋め込める記事を置く。

## 設計原則

- **interactive 記事だけを置く**: 静的テキストで済む記事は zenn / qiita / note に書く。ここには MDX + island でしか成立しない記事を置く（差別化）
- **tools の埋め込みは iframe**: [wwwyo/tools](https://github.com/wwwyo/tools) のコードを import しない。`tools.wwwyo.dev` の deploy 済み URL を iframe で埋め込む（tools 側の「ツール間共有 FORBIDDEN」原則を repo をまたいでも守る）
- **デフォルト zero-JS**: 記事本文は静的 HTML。ブラウザで動かすコンポーネントだけ `client:visible` を付ける
- **works は data-driven**: portfolio 一覧は `src/content/works.yaml` を SSOT にし、ページはそれを描画するだけ

## ディレクトリ構造

```
wwwyo.dev/
├── src/
│   ├── content/
│   │   ├── blog/        # 記事（MDX）
│   │   └── works.yaml   # portfolio データ
│   ├── components/
│   │   └── embeds/      # 記事に埋め込む island（必要になってから作る）
│   └── pages/
├── mise.toml
└── wrangler.jsonc       # Cloudflare Workers static assets
```

## セットアップ

ツールは mise で管理している。

```bash
mise install   # mise.toml に従ってツールをインストール
bun install
bun run dev    # 開発サーバー
bun run deploy # ビルド + Cloudflare Workers へ deploy
```

## 技術スタック

- Bun
- Astro + MDX + React（`@astrojs/react`。island は `client:visible` を基本にする）
- Tailwind CSS v4
- Cloudflare Workers static assets（Wrangler で deploy、custom domain: wwwyo.dev）

## パッケージ管理

- exact ピン留め（`bunfig.toml` の `exact = true`）
- mise の tool 追加は `mise use --pin --before 7d <tool>@latest`（supply-chain cooldown 7day）
