import { useEffect, useRef, useState } from "react";
import "./hdr/hdr-demo.css";
import { SolidColorRenderer } from "./hdr/renderers";
import { cdToCodeValue, colors, type SupportItem } from "./hdr/support";
import { SupportList } from "./hdr/SupportList";

const colorOptions: { value: string; label: string }[] = [
  { value: "white", label: "白" },
  { value: "red", label: "赤" },
  { value: "green", label: "緑" },
  { value: "blue", label: "青" },
  { value: "yellow", label: "黄" },
  { value: "cyan", label: "シアン" },
  { value: "magenta", label: "マゼンタ" },
];

/**
 * 単色を輝度だけ変えて比較するデモ。左は 100 cd/m²（SDR の白）固定、右はスライダーで選んだ輝度。
 * wwwyo/tools の src/shirobikari/demos.ts の initWebGpuDemos() 後半（単色部分）を移植。
 */
export function WebGpuSolidDemo() {
  const sdrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const hdrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [items, setItems] = useState<SupportItem[]>([]);
  const [unsupported, setUnsupported] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [color, setColor] = useState("white");
  const [brightnessCd, setBrightnessCd] = useState(400);

  const renderersRef = useRef<{ sdr: SolidColorRenderer; hdr: SolidColorRenderer } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init(): Promise<void> {
      const nextItems: SupportItem[] = [];

      if (!navigator.gpu) {
        nextItems.push({ label: "WebGPU: 非対応", ok: false, detail: "Chrome 113 以降などの対応ブラウザで開いてください。" });
        if (!cancelled) {
          setItems(nextItems);
          setUnsupported("WebGPU に対応していないため、この項目は表示できません。");
        }
        return;
      }

      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        nextItems.push({ label: "WebGPU アダプター: 取得失敗", ok: false });
        if (!cancelled) {
          setItems(nextItems);
          setUnsupported("WebGPU アダプターを取得できなかったため、この項目は表示できません。");
        }
        return;
      }

      const device = await adapter.requestDevice();
      if (cancelled) return;
      nextItems.push({ label: "WebGPU: 対応", ok: true });

      const sdrCanvas = sdrCanvasRef.current;
      const hdrCanvas = hdrCanvasRef.current;
      if (!sdrCanvas || !hdrCanvas) return;

      // 両方とも extended で構成し、輝度の違いだけを比較する
      const sdrRenderer = new SolidColorRenderer(sdrCanvas, "extended");
      const hdrRenderer = new SolidColorRenderer(hdrCanvas, "extended");
      await sdrRenderer.init(device);
      await hdrRenderer.init(device);
      if (cancelled) return;

      renderersRef.current = { sdr: sdrRenderer, hdr: hdrRenderer };
      setItems(nextItems);
      setReady(true);
    }

    init().catch((error: unknown) => {
      if (cancelled) return;
      console.error(error);
      setItems([{ label: "WebGPU: 初期化中にエラーが発生しました", ok: false, detail: String(error) }]);
      setUnsupported("初期化中にエラーが発生したため、この項目は表示できません。");
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // 色・輝度が変わるたびに再描画する（アニメーションループは不要な静止画デモのため rAF は使わない）
  useEffect(() => {
    const renderers = renderersRef.current;
    if (!renderers) return;
    const rgb = colors[color] ?? colors.white;
    if (!rgb) return;
    // 左は常に SDR の白（100 cd/m² = コード値 1.0）、右は選択した輝度をコード値に変換して描画
    renderers.sdr.render(rgb, 1.0);
    renderers.hdr.render(rgb, cdToCodeValue(brightnessCd));
  }, [color, brightnessCd, ready]);

  return (
    <div>
      <SupportList items={items} />
      {unsupported && <p className="hdr-demo-unsupported">{unsupported}</p>}
      {!unsupported && (
        <div className="hdr-demo-canvases">
          <div className="hdr-demo-canvas-block">
            <h4>100 cd/m²（SDR の白）</h4>
            <canvas ref={sdrCanvasRef} width={400} height={200} />
          </div>
          <div className="hdr-demo-canvas-block">
            <h4>{brightnessCd.toFixed(0)} cd/m²（HDR）</h4>
            <canvas ref={hdrCanvasRef} width={400} height={200} />
          </div>
        </div>
      )}
      {ready && (
        <div className="hdr-demo-controls">
          <label className="hdr-demo-controls">
            <span className="hdr-demo-control-label">色</span>
            <select value={color} onChange={(e) => setColor(e.target.value)}>
              {colorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="hdr-demo-controls">
            <span className="hdr-demo-control-label">輝度（cd/m²）</span>
            <input
              type="range"
              min={100}
              max={2000}
              step={50}
              value={brightnessCd}
              onChange={(e) => setBrightnessCd(Number.parseFloat(e.target.value))}
            />
            <span className="hdr-demo-value">{brightnessCd.toFixed(0)} cd/m²</span>
          </label>
        </div>
      )}
    </div>
  );
}

export default WebGpuSolidDemo;
