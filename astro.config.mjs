import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://wwwyo.dev",
  integrations: [mdx(), react(), sitemap()],
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
