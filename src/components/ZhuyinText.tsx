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

  return (
    <span className={className}>
      {rich.map((segment, si) => (
        <span key={si} className="inline-block whitespace-nowrap">
          {segment.map((token, ti) =>
            zhuyin && token.z ? (
              <ruby key={ti} lang="zh-TW">
                {token.t}
                <rt aria-hidden="true">{token.z}</rt>
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
