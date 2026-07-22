import { defineCollection, z } from "astro:content";
import { file, glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
  }),
});

const works = defineCollection({
  // file loader は yaml をネイティブサポート（js-yaml は astro 本体に同梱済み、追加依存不要）。
  // 各要素は id または slug フィールドが必須のため works.yaml 側で id を付与している。
  loader: file("src/content/works.yaml"),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    url: z.string().url().optional(),
    repo: z.string().url().optional(),
    date: z.string().regex(/^\d{4}-\d{2}$/),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { blog, works };
