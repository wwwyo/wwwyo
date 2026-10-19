import { getImage } from "astro:assets";
import { parse } from "node-html-parser";

export interface Ogp {
  url: string;
  title: string;
  description?: string;
  siteName?: string;
  /** 自ドメインから配る最適化済み画像（CSP の img-src 'self' に収まる） */
  image?: { src: string; width: number; height: number };
}

const cache = new Map<string, Promise<Ogp | null>>();

/**
 * ビルド時にリンク先の OGP を取得する。dev ではページを開くたびに呼ばれるため URL ごとに1回だけ取得する。
 * 失敗したら null を返し、呼び出し側はテキストリンクに戻す
 */
export function fetchOgp(url: string): Promise<Ogp | null> {
  let ogp = cache.get(url);
  if (!ogp) {
    ogp = fetchOgpUncached(url).catch((error) => {
      console.warn(`[ogp] ${url} の取得に失敗: ${error}`);
      return null;
    });
    cache.set(url, ogp);
  }
  return ogp;
}

async function fetchOgpUncached(url: string): Promise<Ogp | null> {
  const res = await fetch(url, {
    headers: { accept: "text/html", "user-agent": "wwwyo.dev-ogp/1.0" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

  const doc = parse(await res.text());
  const meta = (key: string) =>
    doc
      .querySelector(`meta[property="${key}"], meta[name="${key}"]`)
      ?.getAttribute("content")
      ?.trim() || undefined;

  const title = meta("og:title") ?? doc.querySelector("title")?.text.trim();
  if (!title) return null;

  const imageUrl = meta("og:image");
  return {
    url,
    title,
    description: meta("og:description") ?? meta("description"),
    siteName: meta("og:site_name") ?? new URL(url).hostname,
    image: imageUrl ? await optimizeImage(new URL(imageUrl, res.url).href) : undefined,
  };
}

/** 外部画像を直リンクせず、ビルド時に取り込んで自ドメインから配る。失敗したら画像なしのカードにする */
async function optimizeImage(src: string): Promise<Ogp["image"]> {
  try {
    const image = await getImage({ src, inferSize: true, width: 480, format: "webp" });
    return {
      src: image.src,
      width: Number(image.attributes.width),
      height: Number(image.attributes.height),
    };
  } catch (error) {
    console.warn(`[ogp] 画像 ${src} の取り込みに失敗: ${error}`);
    return undefined;
  }
}
