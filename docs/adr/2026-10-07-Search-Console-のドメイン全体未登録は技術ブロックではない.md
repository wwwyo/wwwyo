# Search Console のドメイン全体未登録は技術ブロックではない

- Status: Accepted
- Date: 2026-10-07

/blog/hello-world/ と /hobby/ 配下5ページが SC 上「該当なし」だが、HTTP・robots.txt・sitemap-0.xml・canonical・noindex・WAF・Googlebot UA 取得は全て正常。`site:wwwyo.dev` が0件・Common Crawl に捕捉なし・被リンクは GitHub プロフィールのみ・ドメイン歴2.5ヶ月のため、個別ページではなくドメイン単位の未クロール/品質判定の可能性が高いと判断。hobby アーカイブのテキスト量は薄いが「無理に水増ししない」（画像・YouTube は index 判定材料にほぼならない）。対応として `always_use_https` 有効化済み、残るのは SC 側のサイトマップ送信・index リクエストと zenn/qiita/note プロフィールからの被リンク追加（ユーザー側タスク）。調査の有効な順序は ①技術ブロック全消し → ②`site:` でドメイン単位か切り分け → ③Common Crawl で被リンク・クロール実績の proxy 確認
