type Sample = {
  provider: string;
  model: string;
  voice: string;
  src: string;
  seconds: number;
  bytes: number;
  pricing: string[];
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
      "TTS は 1 credit / 文字。この台本のペースで約 287 credits / 分",
    ],
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
      "今回の実課金ベースで約 $0.017 / 分",
    ],
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
      "通常の S2.1 Pro: $15 / 100万 UTF-8 bytes。この台本のペースで約 $0.014 / 分",
    ],
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
      "参考: Aivis Cloud API は 440 円 / 1万文字（税込、今回は未使用）。この台本のペースで約 12.6 円 / 分",
    ],
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
      "今回の実課金ベースで約 $0.012 / 分",
    ],
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
    credit: "VOICEVOX:四国めたん",
  },
];
