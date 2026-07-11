import { beforeEach, describe, expect, test } from "bun:test";
import { render } from "@testing-library/react";
import type { Rich } from "../data/schema";

// spec: zhuyin-rendering / Ruby rendering of rich zhuyin text

function stubMatchMedia() {
  window.matchMedia = ((q: string) => ({
    matches: false,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as never;
}

const rich: Rich = [
  [{ t: "水", z: "ㄕㄨㄟˇ" }, { t: "果", z: "ㄍㄨㄛˇ" }],
  [{ t: "ABC123" }],
];

beforeEach(() => {
  localStorage.clear();
  stubMatchMedia();
});

async function renderWith(zhuyin: boolean) {
  const { useSettings } = await import("../stores/settings");
  useSettings.setState({ zhuyin });
  const { ZhuyinText } = await import("./ZhuyinText");
  return render(<ZhuyinText rich={rich} />);
}

describe("ZhuyinText", () => {
  test("enabled: ruby per Chinese char, rt aria-hidden at 0.55em context, segment nowrap", async () => {
    const { container } = await renderWith(true);
    const rubies = container.querySelectorAll("ruby");
    expect(rubies).toHaveLength(2);
    for (const ruby of rubies) {
      expect(ruby.getAttribute("lang")).toBe("zh-TW");
      const rt = ruby.querySelector("rt")!;
      expect(rt.getAttribute("aria-hidden")).toBe("true");
    }
    expect(rubies[0]!.textContent).toContain("ㄕㄨㄟˇ");
    const segments = container.querySelectorAll("span.whitespace-nowrap");
    expect(segments.length).toBe(2);
    expect(container.textContent).toContain("ABC123");
  });

  test("disabled: plain text only, no ruby or rt in DOM", async () => {
    const { container } = await renderWith(false);
    expect(container.querySelector("ruby")).toBeNull();
    expect(container.querySelector("rt")).toBeNull();
    expect(container.textContent).toBe("水果ABC123");
  });

  test("non-Chinese token never gets rt even when enabled", async () => {
    const { container } = await renderWith(true);
    const lastSegment = [...container.querySelectorAll("span.whitespace-nowrap")].at(-1)!;
    expect(lastSegment.querySelector("ruby")).toBeNull();
  });
});
