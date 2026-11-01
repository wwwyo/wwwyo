import type { MouseEvent } from "react";
import { parts, VIEW_HEIGHT, VIEW_WIDTH } from "./parts";

/** 基板写真の上に部品の枠を重ね、クリックで記事内の該当部品（<details id="part-N">）を開いてスクロールする */
export default function BoardMap({ src }: { src: string }) {
  const open = (n: number) => (event: MouseEvent) => {
    const target = document.getElementById(`part-${n}`);
    if (!(target instanceof HTMLDetailsElement)) return;
    event.preventDefault();
    target.open = true;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <figure className="kit-board">
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        role="group"
        aria-label="時計キットの基板写真。番号の枠を押すとその部品の解説が開く"
      >
        <image href={src} width={VIEW_WIDTH} height={VIEW_HEIGHT} />
        {parts.map((p) => (
          <a key={p.n} href={`#part-${p.n}`} onClick={open(p.n)} className="kit-board-part" aria-label={`${p.n}. ${p.title}`}>
            <rect x={p.x} y={p.y} width={p.w} height={p.h} className="kit-board-box" />
            <rect x={p.x} y={p.y} width={p.n >= 10 ? 60 : 40} height={40} className="kit-board-tag" />
            <text x={p.x + 8} y={p.y + 31} className="kit-board-num">
              {p.n}
            </text>
          </a>
        ))}
      </svg>
    </figure>
  );
}
