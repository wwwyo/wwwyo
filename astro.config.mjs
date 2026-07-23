import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://wwwyo.dev",
  integrations: [mdx(), react()],
  security: {
    // inline script (island hydration 等) の hash 入り meta CSP をページごとに生成する。
    // frame-ancestors は meta で指定できないため public/_headers に残している
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data: blob:",
        "frame-src https://tools.wwwyo.dev",
        "object-src 'none'",
        "base-uri 'none'",
      ],
      scriptDirective: {
        resources: ["'self'", "https://static.cloudflareinsights.com"],
      },
      styleDirective: {
        resources: ["'self'", "'unsafe-inline'"],
      },
    },
  },
});
