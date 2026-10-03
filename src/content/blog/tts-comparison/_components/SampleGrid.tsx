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
  // play はバブルしないイベントなので、React はリスナーを各 audio 要素に直接張る。
  // event.currentTarget は div ではなく audio を指すため、グリッドは closest で引く
  const pauseOthers = (event: React.SyntheticEvent<HTMLDivElement>) => {
    const current = event.target;
    if (!(current instanceof HTMLAudioElement)) return;
    for (const audio of current.closest(".tts-grid")?.querySelectorAll("audio") ??
      []) {
      if (audio !== current) audio.pause();
    }
  };

  return (
    <div className="tts-grid" onPlayCapture={pauseOthers}>
      {samples.map((s) => (
        <article className="tts-card" key={s.src}>
          <h3>{s.provider}</h3>
          <p className="tts-model">
            {s.model} / {s.voice}
          </p>
          <audio
            controls
            preload="none"
            aria-label={`${s.provider} ${s.model} ${s.voice} の試聴音声`}
          >
            <source
              src={s.src}
              type={s.src.endsWith(".mp3") ? "audio/mpeg" : "audio/mp4"}
            />
          </audio>
          <p className="tts-meta">
            {formatSeconds(s.seconds)} · {formatBytes(s.bytes)} ·{" "}
            <a href={s.src} download>
              ダウンロード
            </a>
          </p>
          <div className="tts-cost">
            <ul>
              {s.pricing.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          {s.credit && <p className="tts-meta tts-credit">{s.credit}</p>}
        </article>
      ))}
    </div>
  );
}

export default SampleGrid;
