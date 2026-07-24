import { useEffect, useState } from "react";
import "./hdr-demo.css";
import { supportsDrl } from "./support";

/**
 * CSS dynamic-range-limit のホバー/フォーカス切り替えデモ。
 * 非対応ブラウザでは standard 固定になるため、その旨を表示する。
 */
export function DrlDemo() {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setSupported(supportsDrl());
  }, []);

  return (
    <div>
      {supported === false && (
        <p className="hdr-demo-unsupported">
          このブラウザは dynamic-range-limit に対応していません。画像は常に標準の明るさで表示されます。
        </p>
      )}
      <div className="hdr-demo-figures">
        <figure className="hdr-demo-figure">
          <img
            src="/hdr/ultra-hdr.jpg"
            alt="UltraHDR形式のサンプル写真。ホバーまたはフォーカスすると白い部分の明るさが変わる"
            tabIndex={0}
            className="drl-hover"
          />
          <figcaption>ホバー / フォーカスで standard ⇔ no-limit</figcaption>
        </figure>
        <figure className="hdr-demo-figure">
          <img
            src="/hdr/ultra-hdr.jpg"
            alt="同じUltraHDR写真をno-limit固定で表示したもの。常に最大輝度で表示される"
            className="drl-no-limit"
          />
          <figcaption>常に no-limit（比較用）</figcaption>
        </figure>
      </div>
    </div>
  );
}

export default DrlDemo;
