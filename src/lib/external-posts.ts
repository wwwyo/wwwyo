export interface ExternalPost {
  title: string;
  url: string;
  pubDate: Date;
  source: "zenn" | "qiita" | "note";
}

const MAX_PAGES = 20;

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`${url}: ${res.status} ${res.statusText}`);
  return res.json();
}

async function fetchZenn(): Promise<ExternalPost[]> {
  const posts: ExternalPost[] = [];
  let page: number | null = 1;

  while (page && page <= MAX_PAGES) {
    const data = (await fetchJson(
      `https://zenn.dev/api/articles?username=www_y&order=latest&count=100&page=${page}`,
    )) as {
      articles: { title: string; path: string; published_at: string }[];
      next_page: number | null;
    };
    posts.push(
      ...data.articles.map((a) => ({
        title: a.title,
        url: `https://zenn.dev${a.path}`,
        pubDate: new Date(a.published_at),
        source: "zenn" as const,
      })),
    );
    page = data.next_page;
  }

  return posts;
}

async function fetchQiita(): Promise<ExternalPost[]> {
  const posts: ExternalPost[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const items = (await fetchJson(
      `https://qiita.com/api/v2/users/wwwy/items?per_page=100&page=${page}`,
    )) as { title: string; url: string; created_at: string }[];
    posts.push(
      ...items.map((item) => ({
        title: item.title,
        url: item.url,
        pubDate: new Date(item.created_at),
        source: "qiita" as const,
      })),
    );
    if (items.length < 100) break;
  }

  return posts;
}

async function fetchNote(): Promise<ExternalPost[]> {
  const posts: ExternalPost[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data } = (await fetchJson(
      `https://note.com/api/v2/creators/www_yt/contents?kind=note&page=${page}`,
    )) as {
      data: {
        contents: { name: string; key: string; publishAt: string }[];
        isLastPage: boolean;
      };
    };
    posts.push(
      ...data.contents.map((content) => ({
        title: content.name,
        url: `https://note.com/www_yt/n/${content.key}`,
        pubDate: new Date(content.publishAt),
        source: "note" as const,
      })),
    );
    if (data.isLastPage) break;
  }

  return posts;
}

/**
 * dev サーバーではページを開くたびに呼ばれるため、プロセス内で1回だけ取得する。
 * Qiita API は未認証だと 60回/時のレート制限があり、都度 fetch すると簡単に枯渇する
 */
let cachedPosts: Promise<ExternalPost[]> | null = null;

/** ビルド時に外部ブログの全記事一覧を API から取得する。失敗したサービスはスキップする */
export function fetchExternalPosts(): Promise<ExternalPost[]> {
  cachedPosts ??= fetchExternalPostsUncached();
  return cachedPosts;
}

async function fetchExternalPostsUncached(): Promise<ExternalPost[]> {
  const results = await Promise.all(
    [
      { source: "zenn", fetcher: fetchZenn },
      { source: "qiita", fetcher: fetchQiita },
      { source: "note", fetcher: fetchNote },
    ].map(async ({ source, fetcher }) => {
      try {
        return await fetcher();
      } catch (error) {
        console.warn(`[external-posts] ${source} の取得に失敗: ${error}`);
        return [];
      }
    }),
  );

  return results.flat();
}
