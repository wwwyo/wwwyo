/**
 * WebGPU レンダラー（グラデーション / 単色）。
 * wwwyo/tools の src/shirobikari/demos.ts から移植。シェーダーとレンダラーのロジックは変更していない。
 */

// 単色用シェーダー（vec4fでアライメント問題を回避）
export const solidShaderCode = `
  struct Uniforms {
    colorAndBrightness: vec4f,  // xyz=color, w=brightness
  }

  @group(0) @binding(0) var<uniform> uniforms: Uniforms;

  struct VertexOutput {
    @builtin(position) position: vec4f,
  }

  @vertex
  fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    var pos = array<vec2f, 3>(
      vec2f(-1.0, -1.0),
      vec2f(3.0, -1.0),
      vec2f(-1.0, 3.0)
    );
    var output: VertexOutput;
    output.position = vec4f(pos[vertexIndex], 0.0, 1.0);
    return output;
  }

  @fragment
  fn fragmentMain() -> @location(0) vec4f {
    let color = uniforms.colorAndBrightness.xyz * uniforms.colorAndBrightness.w;
    return vec4f(color, 1.0);
  }
`;

// グラデーション用シェーダー
export const gradientShaderCode = `
  struct Uniforms {
    brightness: f32,
    time: f32,
  }

  @group(0) @binding(0) var<uniform> uniforms: Uniforms;

  struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
  }

  @vertex
  fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    // フルスクリーン三角形
    var pos = array<vec2f, 3>(
      vec2f(-1.0, -1.0),
      vec2f(3.0, -1.0),
      vec2f(-1.0, 3.0)
    );
    var uv = array<vec2f, 3>(
      vec2f(0.0, 1.0),
      vec2f(2.0, 1.0),
      vec2f(0.0, -1.0)
    );

    var output: VertexOutput;
    output.position = vec4f(pos[vertexIndex], 0.0, 1.0);
    output.uv = uv[vertexIndex];
    return output;
  }

  // 円の距離関数
  fn sdCircle(p: vec2f, center: vec2f, r: f32) -> f32 {
    return length(p - center) - r;
  }

  // スムーズな円
  fn smoothCircle(p: vec2f, center: vec2f, r: f32, softness: f32) -> f32 {
    let d = sdCircle(p, center, r);
    return 1.0 - smoothstep(0.0, softness, d);
  }

  @fragment
  fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
    let uv = input.uv;
    let brightness = uniforms.brightness;
    let time = uniforms.time;

    // 背景グラデーション
    var color = mix(
      vec3f(0.08, 0.08, 0.16),
      vec3f(0.16, 0.08, 0.24),
      uv.y
    );

    // WebGPU の NDC→フレームバッファ変換により、uv.y は 0 が画面上端・1 が画面下端になる。
    // 輝度ランプを画面上半分（uv.y < 0.5）に大きく取り、SDR/HDR の差の主役にする。
    // 装飾の円と離すことで、SDR 側が「どこで階調が止まるか」を邪魔されずに見せる。
    if (uv.y < 0.5) {
      let barLuminance = uv.x * brightness * 2.0;
      color = vec3f(barLuminance);

      // 目盛り線: 0.25 / 0.5 / 0.75 の位置に細い基準線を引く（暗めのグレーで、飽和しても潰れない）
      let grid1 = 1.0 - smoothstep(0.0, 0.0015, abs(uv.x - 0.25));
      let grid2 = 1.0 - smoothstep(0.0, 0.0015, abs(uv.x - 0.5));
      let grid3 = 1.0 - smoothstep(0.0, 0.0015, abs(uv.x - 0.75));
      color = mix(color, vec3f(0.4), (grid1 + grid2 + grid3) * 0.4);

      // barLuminance = uv.x * brightness * 2.0 が 1.0 と交わる x 位置 = 1.0 / (brightness * 2.0)。
      // ここが SDR の白 = 100 cd/m²（コード値 1.0）に一致する位置なので、目印として示す。
      // 輝度を 1.0 未満（0.9, 0.35, 0.05）に抑えているので、SDR 側でも飽和せず目印として見える。
      let thresholdX = 1.0 / (brightness * 2.0);
      if (thresholdX <= 1.0) {
        let distToThreshold = abs(uv.x - thresholdX);
        let marker = 1.0 - smoothstep(0.0, 0.004, distToThreshold);
        color = mix(color, vec3f(0.9, 0.35, 0.05), marker);
      }
    }

    // 輝く円たち（画面下半分に配置。ランプ帯（uv.y<0.5）を汚さないよう境界に余白を残す）
    let aspect = 400.0 / 300.0;
    let p = vec2f(uv.x * aspect, uv.y);

    // 赤い円
    let redCenter = vec2f(0.33 * aspect, 0.86);
    let redGlow = smoothCircle(p, redCenter, 0.12, 0.15);
    let redColor = vec3f(brightness * 1.5, 0.1, 0.1) * redGlow;
    color += redColor;

    // 緑の円
    let greenCenter = vec2f(0.5 * aspect, 0.86);
    let greenGlow = smoothCircle(p, greenCenter, 0.12, 0.15);
    let greenColor = vec3f(0.1, brightness * 1.5, 0.1) * greenGlow;
    color += greenColor;

    // 青い円
    let blueCenter = vec2f(0.67 * aspect, 0.86);
    let blueGlow = smoothCircle(p, blueCenter, 0.12, 0.15);
    let blueColor = vec3f(0.1, 0.1, brightness * 1.5) * blueGlow;
    color += blueColor;

    // 白い輝く円 - 係数を 2.5 から 0.6 に下げた。スライダー既定値(1.5)で 0.9 と 1.0 未満に収まり、
    // SDR 側でも階調を保ったまま光る。ここが飽和すると「白飽和 vs 白超え」の差になり、
    // 主役であるランプの「階調が止まる/止まらない」という構造の差が霞んでしまうため。
    let whiteCenter = vec2f(0.5 * aspect, 0.72);
    let whiteGlow = smoothCircle(p, whiteCenter, 0.1, 0.12);
    let whiteColor = vec3f(brightness * 0.6) * whiteGlow;
    color += whiteColor;

    // パルスする輝点（アニメーション）
    let pulseIntensity = 0.5 + 0.5 * sin(time * 2.0);
    let sparkleCenter = vec2f(0.5 * aspect, 0.95);
    let sparkleGlow = smoothCircle(p, sparkleCenter, 0.03, 0.05);
    let sparkleColor = vec3f(brightness * 3.0 * pulseIntensity) * sparkleGlow;
    color += sparkleColor;

    return vec4f(color, 1.0);
  }
`;

export type ToneMappingMode = "standard" | "extended";

/**
 * canvas に適用する WebGPU の描画設定。
 * SDR 側は 8bit フォーマット（クランプが GPU 側で確定する）、HDR 側は rgba16float +
 * extended という異なる設定を使うため、レンダラーの外から可変にする。
 * `fragment.targets[0].format` は canvas の configure() の format と一致している必要があるため、
 * このオブジェクト1つを両方に使い回すことで不一致を構造的に防ぐ。
 */
export type CanvasRenderConfig = {
  readonly format: GPUTextureFormat;
  readonly toneMapping?: ToneMappingMode;
};

/** getConfiguration() から読み取った、実際に適用されている設定の自己診断結果 */
export type ConfigDiagnostics = { readonly ok: boolean; readonly detail: string };

/** グラデーションの輝く円たちを描くレンダラー */
export class GradientHDRRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly renderConfig: CanvasRenderConfig;
  private device: GPUDevice | null = null;
  private context: GPUCanvasContext | null = null;
  private pipeline: GPURenderPipeline | null = null;
  private uniformBuffer: GPUBuffer | null = null;
  private bindGroup: GPUBindGroup | null = null;

  constructor(canvas: HTMLCanvasElement, renderConfig: CanvasRenderConfig) {
    this.canvas = canvas;
    this.renderConfig = renderConfig;
  }

  async init(device: GPUDevice): Promise<void> {
    this.device = device;
    const context = this.canvas.getContext("webgpu");
    if (!context) {
      throw new Error("webgpu canvas context を取得できませんでした");
    }
    this.context = context;

    this.context.configure({
      device: this.device,
      format: this.renderConfig.format,
      // SDR 側は toneMapping を指定しない（既定 = standard 相当)。8bit フォーマット自体が
      // 1.0 超えの値を保持できないため、toneMapping の実装差に関係なくクランプが確定する。
      ...(this.renderConfig.toneMapping ? { toneMapping: { mode: this.renderConfig.toneMapping } } : {}),
      alphaMode: "premultiplied",
    });

    const shaderModule = this.device.createShaderModule({ code: gradientShaderCode });

    // Uniformバッファ: brightness(f32) + time(f32)
    this.uniformBuffer = this.device.createBuffer({
      size: 8,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: { type: "uniform" },
        },
      ],
    });

    const pipelineLayout = this.device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] });

    this.pipeline = this.device.createRenderPipeline({
      layout: pipelineLayout,
      vertex: { module: shaderModule, entryPoint: "vertexMain" },
      fragment: {
        module: shaderModule,
        entryPoint: "fragmentMain",
        // canvas の configure() に渡した format と必ず一致させる（不一致は実行時例外になる）
        targets: [{ format: this.renderConfig.format }],
      },
      primitive: { topology: "triangle-list" },
    });

    this.bindGroup = this.device.createBindGroup({
      layout: bindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }],
    });
  }

  /** getConfiguration()（Chrome 131+）で実際に適用された format / toneMapping.mode を読む自己診断 */
  getConfigDiagnostics(): ConfigDiagnostics {
    if (!this.context || typeof this.context.getConfiguration !== "function") {
      return { ok: false, detail: "確認できません（getConfiguration 未対応。Chrome 131 以降が必要です）" };
    }
    const configuration = this.context.getConfiguration();
    if (!configuration) {
      return { ok: false, detail: "確認できません（context が未設定です）" };
    }
    const toneModeText = configuration.toneMapping?.mode ?? "指定なし（既定 = standard 相当）";
    return { ok: true, detail: `format: ${configuration.format} / toneMapping.mode: ${toneModeText}` };
  }

  render(brightness: number, time: number): void {
    if (!this.device || !this.context || !this.pipeline || !this.uniformBuffer || !this.bindGroup) return;

    const uniformData = new Float32Array([brightness, time]);
    this.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData);

    const commandEncoder = this.device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.context.getCurrentTexture().createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });

    renderPass.setPipeline(this.pipeline);
    renderPass.setBindGroup(0, this.bindGroup);
    renderPass.draw(3); // フルスクリーン三角形
    renderPass.end();

    this.device.queue.submit([commandEncoder.finish()]);
  }
}

/** 単色を輝度だけ変えて描くレンダラー */
export class SolidColorRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly toneMappingMode: ToneMappingMode;
  private device: GPUDevice | null = null;
  private context: GPUCanvasContext | null = null;
  private pipeline: GPURenderPipeline | null = null;
  private uniformBuffer: GPUBuffer | null = null;
  private bindGroup: GPUBindGroup | null = null;

  constructor(canvas: HTMLCanvasElement, toneMappingMode: ToneMappingMode) {
    this.canvas = canvas;
    this.toneMappingMode = toneMappingMode;
  }

  async init(device: GPUDevice): Promise<void> {
    this.device = device;
    const context = this.canvas.getContext("webgpu");
    if (!context) {
      throw new Error("webgpu canvas context を取得できませんでした");
    }
    this.context = context;

    this.context.configure({
      device: this.device,
      format: "rgba16float",
      toneMapping: { mode: this.toneMappingMode },
      alphaMode: "premultiplied",
    });

    const shaderModule = this.device.createShaderModule({ code: solidShaderCode });

    // 16バイトアライメント: vec3f(12) + f32(4) = 16
    this.uniformBuffer = this.device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: { type: "uniform" },
        },
      ],
    });

    const pipelineLayout = this.device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] });

    this.pipeline = this.device.createRenderPipeline({
      layout: pipelineLayout,
      vertex: { module: shaderModule, entryPoint: "vertexMain" },
      fragment: {
        module: shaderModule,
        entryPoint: "fragmentMain",
        targets: [{ format: "rgba16float" }],
      },
      primitive: { topology: "triangle-list" },
    });

    this.bindGroup = this.device.createBindGroup({
      layout: bindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }],
    });
  }

  render(color: readonly [number, number, number], brightness: number): void {
    if (!this.device || !this.context || !this.pipeline || !this.uniformBuffer || !this.bindGroup) return;

    const uniformData = new Float32Array([color[0], color[1], color[2], brightness]);
    this.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData);

    const commandEncoder = this.device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.context.getCurrentTexture().createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });

    renderPass.setPipeline(this.pipeline);
    renderPass.setBindGroup(0, this.bindGroup);
    renderPass.draw(3);
    renderPass.end();

    this.device.queue.submit([commandEncoder.finish()]);
  }
}
