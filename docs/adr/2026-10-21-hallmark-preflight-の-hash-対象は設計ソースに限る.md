# hallmark preflight の hash 対象は設計ソースに限る

- Status: Accepted
- Date: 2026-10-21

`.hallmark/preflight.json` の `sources` は、hallmark が設計時に読んだ設計ソース（`DESIGN.md`・スタイルシート・レイアウト・ページ）に限る。`bun run preflight:check` が CI でこの hash の drift を落とし、設計ソースを変えたら `bun run preflight:update` を回す。手で hash を管理していたため、PR #54 ではレビューで不一致を指摘されてその場で計算し直す対応が発生し、`package.json` の分は drift したまま残った。

`package.json` は対象に含めない。hallmark は font stack・motion 依存・framework の signal を `package.json` から読むが、`bunfig.toml` の `exact = true` で依存更新は必ず `package.json` を書き換えるため、含めると依存 bump の PR（dependabot を含む）が毎回この check で落ちる。bot に hash を追従させる案は採らなかった — `.github/workflows/dependabot-lockfile.yml` が `GITHUB_TOKEN` で push しても `pull_request` の CI は承認待ちで止まり dependabot PR は緑にならず、CI が見る merge 結果と bot が hash を計算する PR head も一致しない。代償として、依存をまたぐ変更ではキャッシュが自動で無効化されないので、依存が大きく変わったときに hallmark を使う場合は「refresh pre-flight」でスキャンし直す。
