import { useEffect, useRef, useState } from "react";
import "./hdr/hdr-demo.css";
import { GradientHDRRenderer } from "./hdr/renderers";
import { cdToCodeValue, detectHdrDisplay, type SupportItem } from "./hdr/support";
import { SupportList } from "./hdr/SupportList";

/**
 * SDR（8bit・クランプ確定） vs HDR（rgba16float・extended）のグラデーション比較。
 * wwwyo/tools の src/shirobikari/demos.ts の initWebGpuDemos() 前半（グラデーション部分）を移植。
 */
export function WebGpuGradientDemo() {
  const sdrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const hdrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [items, setItems] = useState<SupportItem[]>([]);
  const [unsupported, setUnsupported] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [brightnessCd, setBrightnessCd] = useState(400);

  // requestAnimationFrame ループから最新のスライダー値を読むための ref。
  // brightnessCd を effect の依存に入れるとスライダー操作のたびに WebGPU を再初期化してしまうため、
  // 値の受け渡しだけ ref 越しにする。
  const brightnessCdRef = useRef(brightnessCd);
  brightnessCdRef.current = brightnessCd;

  useEffect(() => {
    let cancelled = false;
    let rafId: number | null = null;

    async function init(): Promise<void> {
      const nextItems: SupportItem[] = [];
      const hdrDisplay = detectHdrDisplay();
      nextItems.push({
        label: `HDR ディスプレイ: ${hdrDisplay ? "検出" : "非検出"}`,
        ok: hdrDisplay,
        detail: hdrDisplay ? undefined : "SDR ディスプレイでは HDR 部分の差が見えにくい場合があります。",
      });

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

      // SDR 側: 8bit フォーマット（通常 bgra8unorm）。1.0 超えの値を物理的に保持できないため、
      // GPU 側の書き込み時点でクランプが確定する。toneMapping は指定しない（既定 = standard 相当）
      const sdrRenderer = new GradientHDRRenderer(sdrCanvas, { format: navigator.gpu.getPreferredCanvasFormat() });
      // HDR 側: rgba16float + extended。1.0 超えの輝度値をそのまま保持・出力できる
      const hdrRenderer = new GradientHDRRenderer(hdrCanvas, { format: "rgba16float", toneMapping: "extended" });
      await sdrRenderer.init(device);
      await hdrRenderer.init(device);
      if (cancelled) return;

      // 自己診断: getConfiguration() で実際に適用された設定を読み、ブラウザが toneMapping を
      // 無視しているようなケースを一目で切り分けられるようにする
      const sdrDiagnostics = sdrRenderer.getConfigDiagnostics();
      nextItems.push({ label: "SDR canvas の適用設定", ok: sdrDiagnostics.ok, detail: sdrDiagnostics.detail });
      const hdrDiagnostics = hdrRenderer.getConfigDiagnostics();
      nextItems.push({ label: "HDR canvas の適用設定", ok: hdrDiagnostics.ok, detail: hdrDiagnostics.detail });

      setItems(nextItems);
      setReady(true);

      const startTime = performance.now();
      function renderFrame(): void {
        const time = (performance.now() - startTime) / 1000;
        // ランプ右端（uv.x = 1）のコード値が brightness * 2.0 になる（シェーダ側の式）ため、
        // 右端の輝度が指定した cd/m² と一致するよう半分にして渡す
        const brightnessCode = cdToCodeValue(brightnessCdRef.current) / 2.0;
        sdrRenderer.render(brightnessCode, time);
        hdrRenderer.render(brightnessCode, time);
        rafId = requestAnimationFrame(renderFrame);
      }
      renderFrame();
    }

    init().catch((error: unknown) => {
      if (cancelled) return;
      console.error(error);
      setItems([{ label: "WebGPU: 初期化中にエラーが発生しました", ok: false, detail: String(error) }]);
      setUnsupported("初期化中にエラーが発生したため、この項目は表示できません。");
    });

    return () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div>
      <SupportList items={items} />
      {unsupported && <p className="hdr-demo-unsupported">{unsupported}</p>}
      {!unsupported && (
        <div className="hdr-demo-canvases">
          <div className="hdr-demo-canvas-block">
            <h4>SDR（8bit・クランプ確定）</h4>
            <canvas ref={sdrCanvasRef} width={400} height={300} />
          </div>
          <div className="hdr-demo-canvas-block">
            <h4>HDR（rgba16float・extended）</h4>
            <canvas ref={hdrCanvasRef} width={400} height={300} />
          </div>
        </div>
      )}
      {ready && (
        <div className="hdr-demo-controls">
          <span className="hdr-demo-control-label">ランプ右端の輝度（cd/m²）</span>
          <input
            type="range"
            min={100}
            max={2000}
            step={50}
            value={brightnessCd}
            onChange={(e) => setBrightnessCd(Number.parseFloat(e.target.value))}
          />
          <span className="hdr-demo-value">{brightnessCd.toFixed(0)} cd/m²</span>
        </div>
      )}
    </div>
  );
}

export default WebGpuGradientDemo;
