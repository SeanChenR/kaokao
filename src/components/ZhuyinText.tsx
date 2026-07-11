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
    return <span data-zhuyin-text className={className}>{rich.flatMap((seg) => seg.map((t) => t.t)).join("")}</span>;
  }

  // 避頭點:以「行首禁則」標點開頭的 segment 併入前一組 nowrap,標點不落行首
  const NO_LINE_START = /^[,。?!:;、)」』…]/;
  const groups: Rich = [];
  for (const segment of rich) {
    const first = segment[0]?.t ?? "";
    if (groups.length > 0 && NO_LINE_START.test(first)) {
      groups[groups.length - 1] = [...groups[groups.length - 1]!, ...segment];
    } else {
      groups.push(segment);
    }
  }

  return (
    <span data-zhuyin-text className={className}>
      {groups.map((segment, si) => (
        <span key={si} className="inline-block whitespace-nowrap">
          {segment.map((token, ti) =>
            zhuyin && token.z ? (
              <ruby key={ti} lang="zh-TW">
                {token.t}
                {/* 注音排版 v2(W3C/CMEX 慣例):逐符號 flex 直堆 + 恆佔位聲調 lane,
                    零 writing-mode/absolute — 行動瀏覽器行為確定(聲調曾在真機消失) */}
                <rt aria-hidden="true">
                  {(() => {
                    const z = token.z!;
                    const tone = /[ˊˇˋ]$/.test(z) ? z.slice(-1) : null;
                    const body = tone ? z.slice(0, -1) : z;
                    const dot = body.startsWith("˙");
                    const symbols = [...(dot ? body.slice(1) : body)];
                    return (
                      <>
                        <span className="zy-col">
                          {dot && <span className="zy-dot">˙</span>}
                          {symbols.map((sym, si) => (
                            <span key={si}>{sym}</span>
                          ))}
                        </span>
                        <span className="zy-lane">{tone}</span>
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
