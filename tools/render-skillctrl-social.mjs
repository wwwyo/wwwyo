import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

// Resolve the image service from its pinned owner without changing site-wide SVG policy.
const require = createRequire(import.meta.url);
const astroRequire = createRequire(require.resolve("astro/package.json"));
const sharp = astroRequire("sharp");
const source = new URL("../src/assets/hobby/skillctrl-social.svg", import.meta.url);
const output = new URL("../public/images/skillctrl/social.png", import.meta.url);

await sharp(fileURLToPath(source)).png().toFile(fileURLToPath(output));
