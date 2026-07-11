import { useSettings } from "../stores/settings";

/** 惰性單例 — Web Audio 不可用(happy-dom/舊環境)時全 API no-op(spec: Gentle audio feedback, off by default) */
let ctx: AudioContext | null | undefined;

function getContext(): AudioContext | null {
  if (ctx !== undefined) return ctx;
  ctx = typeof AudioContext === "undefined" ? null : new AudioContext();
  return ctx;
}

/** 在 user gesture 呼叫以解鎖(iOS Safari);SoundToggle 開啟與開始測驗是解鎖點 */
export function unlock(): void {
  const c = getContext();
  if (c && c.state === "suspended") void c.resume().catch(() => {});
}

const PEAK_GAIN = 0.12;

/** 短 sine 音 — attack/release 包絡防爆音;互動音落 400–900Hz */
export function blip(freq: number, durationSec = 0.1): void {
  if (!useSettings.getState().sound) return;
  const c = getContext();
  if (!c || c.state !== "running") return;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(c.destination);
    const t = c.currentTime;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(PEAK_GAIN, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + durationSec);
    osc.start(t);
    osc.stop(t + durationSec + 0.02);
  } catch {
    // 音效非核心,靜默略過
  }
}

/** 依序播放短旋律(結果頁分級);context 未 running 時整段跳過 */
export function melody(freqs: number[], noteSec = 0.16): void {
  if (!useSettings.getState().sound) return;
  const c = getContext();
  if (!c || c.state !== "running") return;
  freqs.forEach((f, i) => {
    setTimeout(() => blip(f, noteSec), i * noteSec * 1000 * 0.9);
  });
}
