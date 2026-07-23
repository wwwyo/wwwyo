# wwwyo.dev

個人の portfolio / blog サイト。成果物の一覧と、interactive なコンポーネント（tools の埋め込み・外部 API を叩くデモ等）を埋め込める記事を置く。

## 設計原則

- **interactive 記事だけを置く**: 静的テキストで済む記事は zenn / qiita / note に書く。ここには MDX + island でしか成立しない記事を置く（差別化）
- **tools の埋め込みは iframe**: [wwwyo/tools](https://github.com/wwwyo/tools) のコードを import しない
- **デフォルト zero-JS**: 記事本文は静的 HTML。ブラウザで動かすコンポーネントだけ `client:visible` を付ける
- **現行 works 一覧は置かない**: 成果物は [tools.wwwyo.dev](https://tools.wwwyo.dev) へのリンクで済ませ、wwwyo.dev 側で portfolio データを持たない。ただし過去の個人プロジェクトのアーカイブは `/hobby` に静的な一覧 + 詳細ページとして置く

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
- **hobby**: `/hobby` に過去の個人プロジェクトを年の降順で一覧表示し、各プロジェクトは `/hobby/[slug]/` の詳細ページ（画像・動画・外部リンク）へリンクする。データは `src/data/hobby.ts` に集約する
- **リンクはページ冒頭に置く**: 詳細ページの外部リンク・受賞などの重要情報はヘッダー直下（メディア・本文より上）に書く。読者は最後まで読まない前提でレイアウトする

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

## CSP（Content Security Policy）

- **CSP は Astro の `security.csp` で管理する**（`astro.config.mjs`）。island hydration 等の inline script の hash 入り meta CSP をビルド時にページごとに生成する。`public/_headers` の CSP には meta で指定できない `frame-ancestors` だけを置く（両方に directive を書くと積集合で評価されるため、script-src 等を header 側に足さないこと）
- **記事・コンポーネントで `style=""` 属性を使わない**: style-src に hash が含まれるため `'unsafe-inline'` はブラウザに無視される。装飾は CSS クラス（`global.css`）で行う。JS からの `element.style` 操作は CSP の対象外なので island 内の React は問題ない

## パッケージ管理

- exact ピン留め（`bunfig.toml` の `exact = true`）
- mise の tool 追加は `mise use --pin --before 7d <tool>@latest`（supply-chain cooldown 7day）
