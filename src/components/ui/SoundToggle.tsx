import { unlock } from "../../audio/blip";
import { useSettings } from "../../stores/settings";

/** 音效開關 — 開啟那次 click 是 AudioContext 解鎖點(iOS);圖示語意明確非透明度 */
export function SoundToggle() {
  const sound = useSettings((s) => s.sound);
  const label = sound ? "關閉音效" : "開啟音效";

  return (
    <button
      type="button"
      aria-pressed={sound}
      aria-label={label}
      title={label}
      onClick={() => {
        const next = !sound;
        useSettings.getState().setSound(next);
        if (next) unlock();
      }}
      className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-2xl
        bg-surface text-text border border-line cursor-pointer text-lg
        motion-safe:transition-[border-color,box-shadow] motion-safe:duration-150 hover:border-primary
        focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:outline-none"
    >
      <span aria-hidden="true">{sound ? "🔔" : "🔕"}</span>
    </button>
  );
}
