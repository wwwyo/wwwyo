# wwwyo.dev

個人の portfolio / blog サイト。成果物の一覧と、interactive なコンポーネント（tools の埋め込み・外部 API を叩くデモ等）を埋め込める記事を置く。

## 設計原則

- **interactive 記事だけを置く**: 静的テキストで済む記事は zenn / qiita / note に書く。ここには MDX + island でしか成立しない記事を置く（差別化）
- **tools の埋め込みは iframe**: [wwwyo/tools](https://github.com/wwwyo/tools) のコードを import しない。`tools.wwwyo.dev` の deploy 済み URL を iframe で埋め込む（tools 側の「ツール間共有 FORBIDDEN」原則を repo をまたいでも守る）
- **デフォルト zero-JS**: 記事本文は静的 HTML。ブラウザで動かすコンポーネントだけ `client:visible` を付ける
- **works 一覧は置かない**: 成果物は [tools.wwwyo.dev](https://tools.wwwyo.dev) へのリンクで済ませ、wwwyo.dev 側で portfolio データを持たない

## ディレクトリ構造

```
wwwyo.dev/
├── src/
│   ├── content/
│   │   └── blog/        # 記事（MDX）
│   ├── components/
│   │   └── embeds/      # 記事に埋め込む island（必要になってから作る）
│   └── pages/
├── mise.toml
└── wrangler.jsonc       # Cloudflare Workers static assets
```

## 情報設計

- **blog URL**: `/blog/[slug]/`。slug はファイル名で日付は入れない（interactive 記事は寿命が長く、URL は短く保つ）。一覧はトップページ（`/`）。タグ・ページネーションは記事が増えるまで作らない
- **blog frontmatter**: `title` / `description` / `pubDate`（+ 必要になったら `updatedDate`）
- **RSS**: `/rss.xml` を `@astrojs/rss` で配信している
- **OGP**: 当面はサイト共通の静的画像1枚。記事別 OGP は wwwyo/tools の satori + `@resvg/resvg-js` ビルド時静的生成の知見を流用して、記事が増えてから導入

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
