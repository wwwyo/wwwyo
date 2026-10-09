# wwwyo.dev

[![CI](https://github.com/wwwyo/wwwyo/actions/workflows/ci.yml/badge.svg)](https://github.com/wwwyo/wwwyo/actions/workflows/ci.yml)

[サイト](https://wwwyo.dev) · [開発・構成](AGENTS.md)

wwwyo の個人ブログ。図を動かしたり、入力を変えて結果を試したりできる記事を、Astro の MDX と React island で公開する。過去の個人プロジェクトは [Hobby](https://wwwyo.dev/hobby) にまとめている。

## ローカルで動かす

ツールは [mise.toml](mise.toml) で固定している。

```sh
mise install
bun install --frozen-lockfile
bun run dev
```

起動ログに表示されるローカル URL を開く。

## 検証

```sh
bun run build
```

main への merge は自動デプロイを伴う。構成・執筆ルール・運用の入口は [AGENTS.md](AGENTS.md)、設計判断は [docs/adr/](docs/adr/) を参照する。
