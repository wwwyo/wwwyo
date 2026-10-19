import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";
import snapshot from "../data/ogp.json";

export interface Ogp {
  url: string;
  title: string;
  description?: string;
  siteName?: string;
  /** 自ドメインから配る最適化済み画像（CSP の img-src 'self' に収まる） */
  image?: { src: string; width: number; height: number };
}

interface Snapshot {
  title: string;
  description?: string;
  siteName: string;
  /** 取得元の og:image（出典の記録用）。file は src/assets からの相対パス */
  image?: { file: string; source: string };
}

// build 時に外部サイトを叩かず、tools/update-ogp.mjs が作った snapshot を読む（docs/adr/）
const images = import.meta.glob<{ default: ImageMetadata }>("../assets/ogp/*", { eager: true });

/**
 * 外部リンクの OGP カード。snapshot が無い URL では null を返し、呼び出し側はテキストリンクに戻す
 */
export async function getOgp(url: string): Promise<Ogp | null> {
  const entry = (snapshot as Record<string, Snapshot>)[url];
  if (!entry) {
    console.warn(`[ogp] ${url} の snapshot が無い。bun run ogp:update で更新する`);
    return null;
  }
  return {
    url,
    title: entry.title,
    description: entry.description,
    siteName: entry.siteName,
    image: entry.image ? await optimizeImage(entry.image.file) : undefined,
  };
}

/** スナップショットの画像をビルド時に取り込む。失敗したら画像なしのカードにする */
async function optimizeImage(file: string): Promise<Ogp["image"]> {
  try {
    const image = images[`../assets/${file}`];
    if (!image) throw new Error(`${file} を読み込めない`);
    const optimized = await getImage({ src: image.default, width: 480, format: "webp" });
    return {
      src: optimized.src,
      width: Number(optimized.attributes.width),
      height: Number(optimized.attributes.height),
    };
  } catch (error) {
    console.warn(`[ogp] 画像 ${file} の取り込みに失敗: ${error}`);
    return undefined;
  }
}
