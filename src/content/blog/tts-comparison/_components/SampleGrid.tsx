import { useEffect, useRef } from "react";
import "./tts-samples.css";
import { samples } from "./samples";

function formatBytes(bytes: number): string {
  return `${Math.round(bytes / 1024)} KB`;
}

function formatSeconds(seconds: number): string {
  return `${seconds.toFixed(1)} 秒`;
}

/**
 * 試聴カード一覧。audio タグは SSR の HTML にそのまま出るため JS なしでも再生できる。
 * hydration 後は play イベントを捕捉し、同時に鳴る音声を 1 本に絞る。
 */
export function SampleGrid() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const onPlay = (event: Event) => {
      const current = event.target;
      if (!(current instanceof HTMLAudioElement)) return;
      for (const audio of root.querySelectorAll("audio")) {
        if (audio !== current) audio.pause();
      }
    };
    root.addEventListener("play", onPlay, true);
    return () => root.removeEventListener("play", onPlay, true);
  }, []);

  return (
    <div className="tts-grid" ref={ref}>
      {samples.map((s) => (
        <article className="tts-card" key={s.src}>
          <h3>
            {s.provider}
            {s.favorite && <span className="tts-fav">筆者のお気に入り</span>}
          </h3>
          <p className="tts-model">
            {s.model} / {s.voice}
          </p>
          <audio controls preload="none" src={s.src} />
          <p className="tts-meta">
            {formatSeconds(s.seconds)} · {formatBytes(s.bytes)} ·{" "}
            <a href={s.src} download>
              ダウンロード
            </a>
          </p>
          <div className="tts-cost">
            <strong>{s.cost}</strong>
            <ul>
              {s.pricing.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <p className="tts-meta">{s.note}</p>
          <p className="tts-meta">
            <a href={s.sourceUrl}>公式の料金・利用条件</a>
            {s.credit && <span className="tts-credit">{s.credit}</span>}
          </p>
        </article>
      ))}
    </div>
  );
}

export default SampleGrid;
