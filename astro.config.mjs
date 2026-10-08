import { existsSync, readdirSync, readFileSync } from "node:fs";
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// blog 記事の sitemap エントリに frontmatter の日付を lastmod として載せる。
// Google は不正確な lastmod を無視するため、日付を持つ記事ページだけに付ける
const blogLastmod = new Map(
  readdirSync("src/content/blog", { withFileTypes: true }).flatMap((entry) => {
    if (!entry.isDirectory() && !entry.name.endsWith(".mdx")) return [];
    const file = entry.isDirectory()
      ? `src/content/blog/${entry.name}/index.mdx`
      : `src/content/blog/${entry.name}`;
    if (!existsSync(file)) return [];
    const frontmatter =
      readFileSync(file, "utf8").match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
    const raw = (
      frontmatter.match(/^updatedDate:\s*(.+)$/m)?.[1] ??
      frontmatter.match(/^pubDate:\s*(.+)$/m)?.[1]
    )?.trim();
    // YAML スカラーの引用符・行末コメントを剥がしてから lastmod に載せる
    const lastmod = raw
      ?.split("#")[0]
      .trim()
      .replace(/^(['"])(.*)\1$/, "$2");
    return lastmod ? [[`/blog/${entry.name.replace(/\.mdx$/, "")}/`, lastmod]] : [];
  }),
);

export default defineConfig({
  site: "https://wwwyo.dev",
  integrations: [
    mdx(),
    react(),
    sitemap({
      serialize: (item) => {
        const lastmod = blogLastmod.get(new URL(item.url).pathname);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
  build: {
    // island が import する CSS を inline <style> 化すると security.csp の
    // hash 生成から漏れてブロックされるため、常に外部ファイルで配信する
    inlineStylesheets: "never",
  },
  security: {
    // inline script (island hydration 等) の hash 入り meta CSP をページごとに生成する。
    // frame-ancestors は meta で指定できないため public/_headers に残している
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data: blob:",
        "frame-src https://tools.wwwyo.dev https://www.youtube-nocookie.com",
        "object-src 'none'",
        "base-uri 'none'",
      ],
      scriptDirective: {
        resources: ["'self'", "https://static.cloudflareinsights.com"],
      },
      // style 属性は使わない方針（hash があると unsafe-inline は無視されるため入れない）
      styleDirective: {
        resources: ["'self'"],
      },
    },
  },
});
