type Sample = {
  provider: string;
  model: string;
  voice: string;
  src: string;
  seconds: number;
  bytes: number;
  pricing: string[];
  note: string;
  sourceUrl: string;
  credit?: string;
  favorite?: boolean;
};

export const samples: Sample[] = [
  {
    provider: "ElevenLabs",
    model: "Eleven v4",
    voice: "Otani",
    src: "/audio/tts-comparison/elevenlabs-otani.mp3",
    seconds: 21.315875,
    bytes: 357992,
    pricing: [
      "Free: $0 / 月、10,000 credits（非商用のみ）",
      "Starter: $6 / 月、30,000 credits。Creator: $22 / 月、121,000 credits（税別・月払い）",
    ],
    note: "Web UI で生成した Take 1。API では無料プランがライブラリ音声を使えず（402 paid_plan_required）、今回の音声は Web 版のもの。",
    sourceUrl: "https://elevenlabs.io/pricing",
    credit: "Generated with ElevenLabs",
    favorite: true,
  },
  {
    provider: "Google（OpenRouter 経由）",
    model: "Gemini 3.8 Flash TTS",
    voice: "Kore",
    src: "/audio/tts-comparison/gemini-kore.m4a",
    seconds: 19.712,
    bytes: 161341,
    pricing: [
      "OpenRouter: 入力 $0.50 / 100万 tokens、音声出力 $9 / 100万 tokens",
      "Google 直販も 2026 年末まで同じ標準単価（2027 年から 2 倍予定）",
    ],
    note: "24 kHz・16 bit・モノラルの PCM を WAV で受け取り、配信用に AAC に変換。モデル ID は google/gemini-3.8-flash-tts。",
    sourceUrl: "https://openrouter.ai/google/gemini-3.8-flash-tts",
    favorite: true,
  },
  {
    provider: "Fish Audio",
    model: "S2.1 Pro Free（s2.1-pro-free）",
    voice: "さとる（ナレーション）",
    src: "/audio/tts-comparison/fish-s2.1-pro-satoru.mp3",
    seconds: 18.128875,
    bytes: 290062,
    pricing: [
      "無料モデル s2.1-pro-free: $0（2026-11-30 までの期間限定、Fair Use・SLA なし）",
      "通常の S2.1 Pro: $15 / 100万 UTF-8 bytes",
    ],
    note: "公式 API で無料モデルを明示指定して生成。Fish が権利を確保した（licensed=true の）日本語話者。入力は 286 UTF-8 bytes。",
    sourceUrl:
      "https://docs.fish.audio/developer-guide/models-pricing/pricing-and-rate-limits",
    favorite: true,
  },
  {
    provider: "Aivis Project",
    model: "AivisSpeech Engine 1.2.0",
    voice: "まお ノーマル（話者モデル v1.2.0）",
    src: "/audio/tts-comparison/aivisspeech-mao.m4a",
    seconds: 18.46,
    bytes: 226301,
    pricing: [
      "ソフトウェア・話者モデルの利用料は ¥0（PC・電力などの計算資源は別）",
      "参考: Aivis Cloud API は 440 円 / 1万文字（税込）、今回は未使用",
    ],
    note: "この Mac の CPU でローカル生成（推論ログ 8.48 秒。インストール・モデルダウンロードの時間は含まない）。話者モデルは ACML 1.0 で、クレジットは任意。",
    sourceUrl: "https://aivis-project.com/AivisSpeech",
    credit: "AivisSpeech: まお",
    favorite: true,
  },
  {
    provider: "Google（OpenRouter 経由）",
    model: "Gemini 3.8 Flash Lite TTS",
    voice: "Kore",
    src: "/audio/tts-comparison/gemini-lite-kore.m4a",
    seconds: 19.627,
    bytes: 160650,
    pricing: [
      "OpenRouter: 入力 $0.50 / 100万 tokens、音声出力 $6 / 100万 tokens",
      "Google 直販も 2026 年末まで同じ標準単価（2027 年から 2 倍予定）",
    ],
    note: "Flash と同じ話者・台本。モデル ID は google/gemini-3.8-flash-lite-tts。PCM を配信用に AAC に変換。",
    sourceUrl: "https://openrouter.ai/google/gemini-3.8-flash-lite-tts",
  },
  {
    provider: "Alibaba",
    model: "Qwen3-TTS-12Hz-1.7B-CustomVoice",
    voice: "Ono_anna",
    src: "/audio/tts-comparison/qwen3-tts-ono-anna.m4a",
    seconds: 18.518,
    bytes: 151672,
    pricing: [
      "公開モデルのローカル実行: 利用料 ¥0（計算資源の費用は別）",
      "公式 Hugging Face デモは無料だが待ち時間・GPU 制限あり",
    ],
    note: "公式 Hugging Face デモで生成（バックエンド報告 27.347 秒。表示までの待ち時間とは別）。WAV を配信用に AAC に変換。",
    sourceUrl: "https://github.com/QwenLM/Qwen3-TTS",
  },
  {
    provider: "litagin",
    model: "Style-BERT-VITS2 2.5.0",
    voice: "あみたろ Neutral",
    src: "/audio/tts-comparison/style-bert-vits2-amitaro.m4a",
    seconds: 16.671995,
    bytes: 204538,
    pricing: [
      "公開ソフトウェアのローカル実行: 利用料 ¥0（計算資源・話者モデルの条件は別）",
      "公開デモは 1 行 50 文字までの制限あり",
    ],
    note: "作者の公開デモで生成。文字数制限のため台本を 3 行に分け、行間に 0.5 秒の無音が入る。WAV を配信用に AAC に変換。",
    sourceUrl: "https://github.com/litagin02/Style-Bert-VITS2",
    credit:
      "Style-BertVITS2モデル: あみたろ、あみたろの声素材工房 (https://amitaro.net/)",
  },
  {
    provider: "VOICEVOX Project",
    model: "VOICEVOX（engine version 未確認）",
    voice: "四国めたん ノーマル",
    src: "/audio/tts-comparison/voicevox-metan.m4a",
    seconds: 16.982,
    bytes: 139240,
    pricing: [
      "ソフトウェア利用料 ¥0（計算資源は別）",
      "各話者の利用規約に従い、クレジット表記が必要",
    ],
    note: "非公式 Web デモ https://voicevox.su-shiki.com/simple/ で生成（speed 1 / pitch 0 / intonation 1）。デモ側が入力のハイフンを除去するため、この音声では「ASDSTE100」と読んでいる。リンク先の公式サイトとは別物。WAV を配信用に AAC に変換。",
    sourceUrl: "https://voicevox.hiroshiba.jp/",
    credit: "VOICEVOX:四国めたん",
  },
];
