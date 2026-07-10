import { useSettings } from "../../stores/settings";

/** 注音顯示開關 — switch 語意用 aria-pressed(spec: zhuyin-rendering / Zhuyin display toggle) */
export function ZhuyinToggle() {
  const zhuyin = useSettings((s) => s.zhuyin);

  return (
    <button
      type="button"
      aria-pressed={zhuyin}
      aria-label="注音顯示"
      title="注音顯示"
      onClick={() => useSettings.getState().setZhuyin(!zhuyin)}
      className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-2xl
        bg-surface text-text border border-line cursor-pointer text-sm font-bold
        motion-safe:transition-[border-color,box-shadow,opacity] motion-safe:duration-150 hover:border-primary
        focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:outline-none"
    >
      <span className={zhuyin ? "" : "opacity-40"}>ㄅ</span>
    </button>
  );
}
