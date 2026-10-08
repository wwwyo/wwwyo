# Tailwind を外し uaplus.css をベンダリング

- Status: Accepted
- Date: 2026-07-23

ユーティリティクラスを1つも使っておらず preflight だけが効いている状態だった。preflight が本文 margin を黙って消して記事タイポグラフィを壊す事故もあり、使っていない道具に挙動を左右されるのをやめた。リセットは uaplus.css（@layer 包みで既存スタイルが常に勝つ）を採用。tools 側は Tailwind 中心のままで、blog と tools はデザイン哲学が別なので統一しない
