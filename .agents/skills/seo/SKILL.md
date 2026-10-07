---
name: seo
description: "wwwyo.dev の SEO・Google インデックス調査。「index されない」「Search Console で『該当なし』」「検索に出ない」「sitemap を出したい」などの依頼で参照する。Cloudflare zone 設定の確認手順も含む"
---

# SEO / インデックス調査

「index されない」系の問いは、コードの不具合を疑う前に下の順序で潰す。技術的ブロックが全部無いのに登録されないのは、新規ドメインでは典型挙動であり不具合ではない。

## 調査の型（上から順に）

1. **技術ブロックの全消し** — 全部 agent 側から確認できる:
   - HTTP ステータス（https で 200）
   - `robots.txt`（Allow + sitemap 参照）
   - `sitemap-0.xml` に対象 URL が載っているか
   - canonical（自己参照・https 正規化）
   - `noindex` / `X-Robots-Tag` の不在
   - 内部リンク: `/`・一覧ページから静的 HTML で対象へ到達できるか
   - Cloudflare WAF・アクセスルール・UA ブロックが空か（`cf` CLI）
   - Googlebot UA での fetch が 200 を返すか
2. **ドメイン単位か個別ページかを切り分ける** — `site:wwwyo.dev` が 0 件なら個別ページではなくドメイン全体が未登録。`tools.wwwyo.dev` 等のサブドメインも見る
3. **外部発見経路を見る** — Common Crawl の index API（`index.commoncrawl.org`）にキャプチャがあるかが被リンク・クロール実績の proxy。ゼロなら外部からの発見経路がほぼ無い
4. **ドメイン歴を確認** — zone 作成日を `cf` CLI の zone info で見る。新規ドメイン + 薄いテキスト + 被リンクゼロでの SC「該当なし」は想定内の挙動

## 判断の型

- 1〜4 を全部潰して初めて「Google の品質判定 or 未クロール」と結論づける
- **画像・動画・YouTube はインデックス判定のテキスト材料にほぼならない**。hobby 詳細ページのようなメディア中心のページは本文1〜3文だと thin content 判定されうる。アーカイブ用途なら密度そのままで妥当で、水増しは不要
- `.dev` は HSTS preload 済みで実ブラウザは必ず https で来るため、`http` がリダイレクトされず 200 を返しても衛生上の問題（重複コンテンツ）に留まり、未インデックスの主因にはならない

## Search Console 側の確認（ユーザーの作業）

agent は SC にログインできない。以下はユーザーに確認してもらう:

- URL 検査の「ページのインデックス登録」詳細 — 「検出 – インデックス未登録」ならクロールすら来ていない、「クロール済み – インデックス未登録」なら品質判定で弾かれている
- 設定 → クロール統計情報（Googlebot の到来有無）
- サイトマップ送信履歴のステータス
- 手動による対策・セキュリティ問題（新規ドメインならまず無いはず）

## 改善レバー（効く順）

1. SC でサイトマップを明示送信 + 主要ページで「インデックス登録をリクエスト」— 無料で即効性のある唯一の手段
2. zenn / qiita / note のプロフィールに wwwyo.dev へのリンクを追加 — 外部発見経路の最短
3. sitemap の `lastmod` — blog 記事は frontmatter の `pubDate`/`updatedDate` から `astro.config.mjs` の `serialize` で自動付与している。日付を持たないページには付けない（Google は不正確な lastmod を無視する）
4. Cloudflare zone 設定の衛生 — `always_use_https` 等は **zone レベルの設定で `wrangler.jsonc` には出ない**。on なら `http://wwwyo.dev/` は 301 → https を返す（確認: `curl -sI http://wwwyo.dev/`）。off だと全ページが http/https の2系統で 200 配信され重複コンテンツになる。変更は `cf` CLI の write 操作 = 本番変更なので AGENTS.md の承認ルールに従う
