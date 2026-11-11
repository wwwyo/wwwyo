import { defineConfig } from "cf/config";

// 静的アセットは @astrojs/cloudflare adapter が Build Output に書く（wrangler の assets.directory 相当は不要）
export default defineConfig({
	accountId: "0f82b8922b8393c603b89b58c7b9d169",
	worker: {
		name: "wwwyo-dev",
		compatibilityDate: "2026-07-01",
		observability: {
			enabled: true,
			headSamplingRate: 1,
			logs: {
				enabled: true,
				headSamplingRate: 1,
				persist: true,
				invocationLogs: true,
			},
		},
		assets: {
			notFoundHandling: "404-page",
		},
		domains: ["wwwyo.dev"],
	},
});
