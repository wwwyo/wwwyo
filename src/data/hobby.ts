import type { ImageMetadata } from "astro";

import arGamePoster from "../assets/hobby/ar-game-poster.png";
import atcoder1 from "../assets/hobby/atcoder-1.png";
import carehub1 from "../assets/hobby/carehub-1.png";
import chemoinformatics1 from "../assets/hobby/chemoinformatics-1.png";
import emoemoji1 from "../assets/hobby/emoemoji-1.png";
import nekojima1 from "../assets/hobby/nekojima-1.png";
import proscons1 from "../assets/hobby/proscons-1.png";
import proscons2 from "../assets/hobby/proscons-2.png";
import remission1 from "../assets/hobby/remission-1.png";
import remission2 from "../assets/hobby/remission-2.png";
import themis1 from "../assets/hobby/themis-1.png";
import tools1 from "../assets/hobby/tools-1.png";
import typeQuestThumb from "../assets/hobby/type-quest-thumb.jpg";
import warashibe1 from "../assets/hobby/warashibe-1.png";
import webSpeedHackathon1 from "../assets/hobby/web-speed-hackathon-1.png";
import withdom1 from "../assets/hobby/withdom-1.png";

export type HobbyMedia =
  | { type: "images"; images: ImageMetadata[] }
  | { type: "video"; src: string; poster: ImageMetadata }
  | { type: "youtube"; videoId: string; start?: number; thumbnail?: ImageMetadata };

export interface HobbyProject {
  slug: string;
  title: string;
  period: string;
  /** 一覧用の 1〜2 行の要約 */
  summary: string;
  /** 詳細ページ用の全文説明。改行で段落分け */
  description: string;
  externalUrl?: string;
  /** 受賞などの成果。詳細ページに表示 */
  achievement?: { label: string; url?: string };
  /** 詳細ページ最下部に置くデモ動画（public 配下のパス） */
  demoVideo?: { src: string };
  stopped?: boolean;
  thumbnail?: ImageMetadata;
  media?: HobbyMedia;
}

export const hobbyProjects: HobbyProject[] = [
  {
    slug: "tools",
    title: "tools",
    period: "2026/07 -",
    summary:
      "ペラいちの PoC ツール集。1 ツール = 1 ディレクトリで作り、Cloudflare に deploy している。",
    description:
      "ペラいちの PoC ツール集。1 ツール = 1 ディレクトリで作り、Cloudflare に deploy している。思いついたら気軽に足していく置き場。",
    externalUrl: "https://tools.wwwyo.dev",
    thumbnail: tools1,
    media: { type: "images", images: [tools1] },
  },
  {
    slug: "web-speed-hackathon",
    title: "Web Speed Hackathon 2026",
    period: "2026/03",
    summary:
      "CyberAgent 主催の Web パフォーマンスチューニングコンテスト。2 位。",
    description:
      "CyberAgent 主催の Web パフォーマンスチューニングコンテスト。重い Web アプリケーションを制限時間内にどれだけ高速化できるかを競う。スコア 866.45 で 2 位。",
    externalUrl: "https://github.com/wwwyo/web-speed-hackathon-2026",
    achievement: { label: "Web Speed Hackathon 2026 第 2 位" },
    thumbnail: webSpeedHackathon1,
    media: { type: "images", images: [webSpeedHackathon1] },
  },
  {
    slug: "carehub",
    title: "CareHub",
    period: "2025/08 - 2026/05",
    summary:
      "障がい福祉の相談支援専門員の業務を AI で効率化する SaaS。",
    description:
      "障がい福祉の相談支援専門員の業務を AI で効率化する SaaS。分断されている施設の空き情報や支援記録をデータでつなぎ、ワンタップ録音のリアルタイム文字起こしから、AI による計画案・報告書の自動作成（厚生労働省フォーマット出力）、施設の空き情報検索までを一気通貫で提供する。",
    achievement: {
      label: "都知事杯オープンデータ・ハッカソン 2025 サービス開発部門賞受賞",
      url: "https://www.youtube.com/watch?v=7OS-RqhEQtA",
    },
    stopped: true,
    thumbnail: carehub1,
    media: { type: "youtube", videoId: "7OS-RqhEQtA", start: 7850 },
    demoVideo: { src: "/videos/hobby-carehub-demo.mp4" },
  },
  {
    slug: "themis",
    title: "Themis",
    period: "2024/07 - 2024/08",
    summary:
      "AI を活用して法的紛争の解決を支援するアプリ。Google Gemini API Developer Competition にチームで出展。",
    description:
      "AI を活用した法的紛争の解決を支援するアプリ。Google Gemini API Developer Competition にチーム Themis として出展した。",
    externalUrl: "https://ai.google.dev/competition/projects/themis?hl=ja",
    thumbnail: themis1,
    media: { type: "images", images: [themis1] },
  },
  {
    slug: "remission",
    title: "ReMission",
    period: "2024/05 - 2024/06",
    summary: "ハッカソン作品。推しが応援してくれる習慣継続アプリ。",
    description: "ハッカソン作品。推しが応援してくれる習慣継続アプリ。",
    thumbnail: remission1,
    media: { type: "images", images: [remission1, remission2] },
  },
  {
    slug: "nekojima",
    title: "猫じま応援PJ",
    period: "2024/04",
    summary:
      "ハッカソン作品。猫の島（田代島）の猫を勝手に識別しようと試みたアプリ。",
    description:
      "ハッカソン作品。猫の島（田代島）の猫を勝手に識別しようと試みたアプリ。LINE ビーコン → LINE → LIFF と誘導し、Instagram・寄付・公式サイトへの導線を作った。",
    achievement: { label: "ハッカソン 第 2 位" },
    thumbnail: nekojima1,
    media: { type: "images", images: [nekojima1] },
  },
  {
    slug: "type-quest",
    title: "Type Quest",
    period: "2024/02",
    summary:
      "Qiita Hackathon の個人作品。ドラクエ(?) × TypeScript × Qiita のオンライン対戦早解きバトル。",
    description:
      "Qiita Hackathon の個人作品。Type Quest = ドラクエ(?) × TypeScript × Qiita。オンライン対戦の早解きバトルで、Quest（Type Challenges）を 2 問先取した方が勝ち。\n技術: TypeScript / React / Next.js (App Router) / Prisma / Qiita API OAuth / PlanetScale / Vercel。",
    externalUrl: "https://github.com/wwwyo/type-quest",
    thumbnail: typeQuestThumb,
    media: { type: "youtube", videoId: "5zQTf81IOwk", thumbnail: typeQuestThumb },
  },
  {
    slug: "chemoinformatics",
    title: "ケモインフォマティクス用アプリ",
    period: "2023/01 -",
    summary:
      "化学構造などの情報を特徴量として機械学習モデルを作成し、回帰分析するための Web アプリ。",
    description:
      "化学構造などの情報を特徴量として機械学習モデルを作成し、回帰分析するための Web アプリ。既存のソフトが高額すぎたので自作した。\n技術: Python / Machine Learning / Streamlit。",
    externalUrl: "https://chemoinfor.streamlit.app/",
    thumbnail: chemoinformatics1,
    media: { type: "images", images: [chemoinformatics1] },
  },
  {
    slug: "warashibe",
    title: "わらしべ長者アプリ",
    period: "2022/09",
    summary: "モバイルアプリハッカソン SPAJAM の予選で 2 位を取ったときのアプリ。",
    description:
      "モバイルアプリハッカソン SPAJAM の予選で 2 位を取ったときのアプリ。バックエンドを TypeScript / Node.js / Firebase で作り、位置情報から近い人を検出するロジックなどを実装した。",
    achievement: { label: "SPAJAM 2022 予選 第 2 位" },
    thumbnail: warashibe1,
    media: { type: "youtube", videoId: "bpuTqjN51q0", thumbnail: warashibe1 },
  },
  {
    slug: "emoemoji",
    title: "Slack の絵文字まとめサイト",
    period: "2022/03",
    summary: "Slack のカスタム絵文字をまとめたサイト。ポイントはエモ。",
    description:
      "Slack のカスタム絵文字をまとめたサイト。ポイントはエモ。\n技術: Vue 3 / Vuetify / GitHub Pages。",
    externalUrl: "https://wwwyo.github.io/emoemoji/",
    thumbnail: emoemoji1,
    media: { type: "images", images: [emoemoji1] },
  },
  {
    slug: "ar-game",
    title: "ポケモンGO風ARゲーム",
    period: "2022/01 - 2022/02",
    summary: "AR にハマって作った Unity / Blender 製ゲーム。",
    description:
      "AR にハマって作った Unity / Blender 製ゲーム。作ったものの中で一番好み。",
    externalUrl: "https://github.com/wwwyo/MoleHitting",
    thumbnail: arGamePoster,
    media: { type: "video", src: "/videos/hobby-ar-game.mp4", poster: arGamePoster },
  },
  {
    slug: "atcoder",
    title: "AtCoder",
    period: "2021/06 - 2022/01",
    summary: "競技プログラミング（アルゴリズム）のコンテスト。緑到達。",
    description: "競技プログラミング（アルゴリズム）のコンテスト。緑到達。",
    externalUrl: "https://atcoder.jp/users/www_y",
    thumbnail: atcoder1,
    media: { type: "images", images: [atcoder1] },
  },
  {
    slug: "withdom",
    title: "withdom",
    period: "2020/12 - 2021/01",
    summary:
      "プログラミングの勉強仲間とのチーム開発。仲間との知恵の共有を目的に作成した。",
    description:
      "プログラミングの勉強仲間とのチーム開発。仲間との知恵の共有を目的に作成した。wisdom『知恵』 + with『共有』。",
    stopped: true,
    thumbnail: withdom1,
    media: { type: "images", images: [withdom1] },
  },
  {
    slug: "proscons",
    title: "Proscons（投票型掲示板サイト）",
    period: "2020/11 - 2021/02",
    summary:
      "\"Proscons\" という投票型の掲示板サイト。賛成派・反対派のチーム制度と、票の可視化・変更ができるフラットな投票制度を持つ。",
    description:
      '"Proscons" という投票型の掲示板サイト。"pros" は長所や賛成、"cons" は短所や反対の意味。賛成派・反対派のチーム制度と、票の動きを可視化し変更も可能なフラットな投票制度で、自分の考えを自信を持って主張できなかった人をサポートする。\n技術: Ruby / Ruby on Rails / Docker / AWS (EC2, S3)。',
    externalUrl: "https://github.com/wwwyo/proscons",
    stopped: true,
    thumbnail: proscons1,
    media: { type: "images", images: [proscons1, proscons2] },
  },
];
