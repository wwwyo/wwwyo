import type { SupportItem } from "./support";

/** サポート状況の一覧表示。デモごとの自己診断結果（WebGPU 対応可否・実際の canvas 設定など）を並べる */
export function SupportList({ items }: { items: SupportItem[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="hdr-demo-support-list">
      {items.map((item) => (
        <li key={item.label}>
          <span aria-hidden="true">{item.ok ? "✅" : "⚠️"}</span>
          <span>
            <span className="hdr-demo-support-label">{item.label}</span>
            {item.detail && <span className="hdr-demo-support-detail">{item.detail}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
