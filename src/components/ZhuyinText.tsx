import type { Rich } from "../data/schema";
import { useSettings } from "../stores/settings";

interface ZhuyinTextProps {
  rich: Rich;
  className?: string;
}

/**
 * 全站唯一的注音渲染元件(spec: zhuyin-rendering)。
 * 開:每個中文字 token → <ruby lang="zh-TW">字<rt aria-hidden>注音</rt></ruby>
 * 關:純文字,DOM 不含 ruby/rt。詞組包 nowrap 防止詞中斷行。
 */
export function ZhuyinText({ rich, className }: ZhuyinTextProps) {
  const zhuyin = useSettings((s) => s.zhuyin);

  if (!zhuyin) {
    // 關閉時輸出單一文字節點:語意最乾淨,測試的 getByText 也能直取(spec: off 無 ruby/rt)
    return <span className={className}>{rich.flatMap((seg) => seg.map((t) => t.t)).join("")}</span>;
  }

  return (
    <span className={className}>
      {rich.map((segment, si) => (
        <span key={si} className="inline-block whitespace-nowrap">
          {segment.map((token, ti) =>
            zhuyin && token.z ? (
              <ruby key={ti} lang="zh-TW">
                {token.t}
                {/* 直欄:前置 ˙ 留欄頂;尾調拆入 zy-tone(台灣正字法,spec: Tone placement) */}
                <rt aria-hidden="true">
                  {(() => {
                    const tone = /[ˊˇˋ]$/.test(token.z!) ? token.z!.slice(-1) : null;
                    const col = tone ? token.z!.slice(0, -1) : token.z!;
                    return (
                      <>
                        <span className="zy-col">{col}</span>
                        {tone && <span className="zy-tone">{tone}</span>}
                      </>
                    );
                  })()}
                </rt>
              </ruby>
            ) : (
              token.t
            ),
          )}
        </span>
      ))}
    </span>
  );
}
