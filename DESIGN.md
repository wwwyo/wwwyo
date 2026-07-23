---
version: "alpha"
name: wwwyo.dev
description: hacker minimalism にリンク青一色の規律を通した個人サイト
colors:
  background: "#FFFFFF"
  foreground: "#1A1A1A"
  primary: "#1D4ED8"
  primaryForeground: "#FFFFFF"
  muted: "#F6F5F3"
  mutedForeground: "#6B6B6B"
  border: "#E4E2DF"
darkColors:
  background: "#111111"
  foreground: "#E8E6E3"
  primary: "#60A5FA"
  primaryForeground: "#111111"
  muted: "#1C1B1A"
  mutedForeground: "#9A9891"
  border: "#2C2A28"
typography:
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Hiragino Sans\", \"Noto Sans JP\", \"Yu Gothic UI\", Meiryo, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.9
    letterSpacing: 0.03em
  heading:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Hiragino Sans\", \"Noto Sans JP\", \"Yu Gothic UI\", Meiryo, sans-serif"
    fontSize: 1.375rem
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: 0.02em
    fontFeature: "palt"
  mono:
    fontFamily: "ui-monospace, \"SF Mono\", Menlo, Consolas, \"Liberation Mono\", monospace"
    fontSize: 0.875rem
    lineHeight: 1.7
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
rounded:
  none: 0px
  code: 4px
composition:
  lineBreak: strict
  wordBreak: normal
  headingWordBreak: keep-all
  overflowWrap: break-word
  contentMaxWidth: 40rem
components:
  link:
    textColor: "{colors.primary}"
  link-hover:
    textColor: "{colors.primary}"
  heading-h2:
    typography: "{typography.heading}"
    textColor: "{colors.foreground}"
  meta-text:
    typography: "{typography.mono}"
    textColor: "{colors.mutedForeground}"
  code-inline:
    typography: "{typography.mono}"
    textColor: "{colors.foreground}"
    backgroundColor: "{colors.muted}"
    rounded: "{rounded.code}"
    padding: 2px
---

## Overview

憧れの参照は simonwillison.net と Hacker News — 装飾ゼロ・情報密度・速度がすべてに優先する「素の HTML」の美学。ただし模倣ではない。HN が「ベージュ地 + Verdana + 極小文字」で密度を出すのに対し、wwwyo.dev は「純白（ダークでは炭黒）+ system font stack + 日本語向けのゆとりある行間」で静けさを出す。web フォントを一切読み込まず、JS もデフォルトでゼロ。ページの軽さそのものがデザインの主張である。

このサイトの「顔」は一色の規律にある。リンク青（Link Blue `{colors.primary}`）だけが唯一の彩度で、リンクと構造マーカー（見出しの点・水平線）に限って現れる。他のすべては黒・白・灰。装飾を足すのではなく、色が現れる場所を厳格に制限することが個性になる。

## Colors

トークンの命名は [shadcn/ui の theming 規約](https://ui.shadcn.com/docs/theming)に従う（`background` / `foreground` / `primary` / `muted` / `muted-foreground` / `border`）。CSS 変数も同名（`--background` 等）で定義し、ダークは shadcn の `.dark` と同じ発想で**同名トークンの値だけを差し替える**（このサイトではクラスではなく `prefers-color-scheme` で切り替え、値は frontmatter の `darkColors` を使う）。

ライトは純白 `{colors.background}` 地に濃墨 `{colors.foreground}`。ダークは炭黒 `#111111` 地に生成りがかった白 `#E8E6E3`。

唯一のアクセントは Link Blue `{colors.primary}`（ダークでは明度を上げた Sky Blue `#60A5FA`）。ブラウザ既定のリンク色を思わせるクラシックな青で、白地に対して WCAG AA（4.5:1 以上）を確保している。使ってよい場所は2つだけ: (1) リンク（文字と下線）、(2) 見出し・`<hr>` などの構造マーカーの点使い。地の色や広い面には決して使わない。

補助として、日付やメタ情報には Warm Gray `{colors.mutedForeground}`、区切り線には Faint Sand `{colors.border}`、コード背景には紙より半段沈む `{colors.muted}` を使う（ダーク側は `darkColors` の同名トークン）。

## Typography

web フォントは読み込まない。和文 → 欧文 → generic のフォールバックチェーンを持つ system font stack（`typography.body` 参照）が本文・見出しの両方を担う。書体で個性を出さない代わりに、組み方で読みやすさを出す: 本文は 16px / 行間 1.9 / 字間 0.03em と、日本語散文向けにゆったり取る。

見出しは weight 700 でサイズ差は控えめ（h2 で 1.375rem）。サイズのジャンプではなく、前後の余白と青のマーカーで階層を示す。見出しには `palt`（プロポーショナル字詰め）を適用し、本文には適用しない。

等幅（`typography.mono`）はコード・日付・URL などのメタ情報専用。本文より一回り小さく `{colors.mutedForeground}` で組み、本文と混植しても目立たせない。

## Layout

単一カラム、最大幅 40rem（本文が1行 35〜38 文字に収まる幅）、左右 padding は `{spacing.md}`。グリッドもサイドバーもない。文書がそのまま画面になる構造で、HTML のセマンティクス（`<article>` `<nav>` `<time>`）が視覚構造と一致する。

余白は水平方向に切り詰め、垂直方向に投資する。セクション間は `{spacing.xl}`、段落間は `{spacing.md}`。密度は行間と字間で確保し、詰め込みでは作らない。

## Elevation & Depth

完全にフラット。影・グラデーション・重なりは一切使わない。層の区別が必要な場面（コードブロック等）は背景色を半段ずらすだけで表現する。

## Shapes

角丸ゼロ、鋭角のまま（`{rounded.none}`）。例外はインラインコード・コードブロックの `{rounded.code}`（4px）のみ。枠線は原則使わず、区切りは `<hr>`（1px、`{colors.border}`）か余白で行う。

## Components

* **Links:** 本文リンクは青文字 `{colors.primary}` + 同色 1px の下線（`text-underline-offset` 約 0.2em）のクラシックなリンク表現。hover は下線を 2px に太らせるだけで色は変えない。visited の色分けはしない。全ページで一貫させる。
* **Headings:** `heading-h2` 参照。装飾は先頭の青マーカー（`#` 一文字またはビュレット相当の点）だけを許す。
* **Meta text（日付・タグ・URL）:** `meta-text` 参照。等幅 + Warm Gray。記事一覧・記事ヘッダの日付は `YYYY/MM/DD` 形式でこの体裁。
* **Code:** インラインは `code-inline` 参照。ブロックは同じ背景色で padding `{spacing.md}`、枠線なし。
* **Post list（トップの記事一覧）:** カードにしない。1記事 = 1行（等幅・muted の日付 `YYYY/MM/DD` + タイトルリンク）。罫線は使わず余白で区切る。

## Do's and Don'ts

* **Do:** 迷ったら要素を削る。新しい UI が必要になったら、まず素の HTML 要素で成立しないか試す。
* **Do:** 青は「リンク・構造マーカー」の2用途のみ。3つ目の用途を足したくなったら、それはデザインの逸脱。
* **Don't:** web フォント・アイコンフォント・CSS フレームワークの見た目（影付きカード、ピル型ボタン、グラデーション）を持ち込まない。
* **Don't:** 2色目のアクセントを追加しない。バッジやタグに色分けが欲しくなっても灰色濃淡で解決する。
* **Don't:** HN の模倣に寄せない — ベージュ背景・極小文字・テーブルレイアウトは採らない。
* **Don't:** 本文に `word-break: keep-all` を適用しない（見出し・固有名詞など短い文字列専用）。
