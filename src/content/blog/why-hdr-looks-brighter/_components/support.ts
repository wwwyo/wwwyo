/**
 * HDR デモ各所で共有するサポート判定 / 単位変換ロジック。
 * wwwyo/tools の src/shirobikari/demos.ts から移植（ロジックは変更していない）。
 */

export type SupportItem = { label: string; ok: boolean; detail?: string };

/** CSS dynamic-range-limit プロパティのサポート判定 */
export function supportsDrl(): boolean {
  return typeof CSS !== "undefined" && CSS.supports("dynamic-range-limit", "standard");
}

/** HDR ディスプレイの検出 */
export function detectHdrDisplay(): boolean {
  return window.matchMedia("(dynamic-range: high)").matches;
}

/** SDR の基準白の輝度。Rec.709 / sRGB のスタジオ基準値 */
const SDR_WHITE_CD = 100;

/**
 * cd/m² を extended sRGB のコード値へ変換する。
 * canvas の値は線形光ではなく sRGB 伝達関数でエンコードされたコード値として
 * 解釈されるため、輝度をそのまま渡すと桁違いに明るくなる。
 */
export function cdToCodeValue(cd: number): number {
  const linear = cd / SDR_WHITE_CD;
  return linear <= 0.0031308 ? linear * 12.92 : 1.055 * Math.pow(linear, 1 / 2.4) - 0.055;
}

/** 単色デモの色定義（白は純粋な#ffffffではなく少しずらす） */
export const colors: Record<string, readonly [number, number, number]> = {
  white: [0.98, 0.98, 0.96], // 少し暖色寄りにずらした白
  red: [1.0, 0.0, 0.0],
  green: [0.0, 1.0, 0.0],
  blue: [0.0, 0.0, 1.0],
  yellow: [1.0, 1.0, 0.0],
  cyan: [0.0, 1.0, 1.0],
  magenta: [1.0, 0.0, 1.0],
};
