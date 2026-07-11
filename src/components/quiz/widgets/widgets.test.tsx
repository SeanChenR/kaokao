import { beforeEach, describe, expect, test, mock } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import type { FillQ, ImageQ, MatchQ, MultiQ, SingleQ } from "../../../data/schema";
import { FillBlank } from "./FillBlank";
import { ImageChoice } from "./ImageChoice";
import { Matching } from "./Matching";
import { MultiChoice } from "./MultiChoice";
import { SingleChoice } from "./SingleChoice";

// spec: answer-widgets — aria 對照表逐項斷言 + payload 型別 + 狀態機

function stubMatchMedia() {
  window.matchMedia = ((q: string) => ({
    matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {},
  })) as never;
}

beforeEach(async () => {
  localStorage.clear();
  sessionStorage.clear();
  stubMatchMedia();
  const { useSettings } = await import("../../../stores/settings");
  useSettings.setState({ zhuyin: true }); // 防其他測試檔留下的單例狀態污染
});

const seg = (t: string) => t.split("").map((ch) => (/\p{Script=Han}/u.test(ch) ? { t: ch, z: "ㄅ" } : { t: ch }));
const rich = (t: string) => [seg(t)];

const singleQ: SingleQ = { id: "s1", type: "single", stem: rich("題目"), options: [rich("甲"), rich("乙"), rich("丙")], answer: 0 };
const multiQ: MultiQ = { id: "m1", type: "multi", stem: rich("題目"), options: [rich("甲"), rich("乙"), rich("丙"), rich("丁")], answer: [0, 2] };
const fillQ: FillQ = { id: "f1", type: "fill", stem: rich("一年有"), suffix: rich("個月"), accept: ["12"], placeholder: "?" };
const matchQ: MatchQ = { id: "mt1", type: "match", stem: rich("配對"), left: [rich("蜜蜂"), rich("魚")], right: [rich("蜂巢"), rich("魚缸")], answer: [0, 1] };
const imageQ: ImageQ = {
  id: "i1", type: "image", stem: rich("找三角形"),
  shapes: [{ code: "circle", label: rich("圓形") }, { code: "triangle", label: rich("三角形") }], answer: 1,
};

describe("SingleChoice", () => {
  test("radiogroup labelled by stem; radio aria-checked; numeric payload; no un-select", () => {
    const onChange = mock((v: number) => v);
    const { rerender } = render(<SingleChoice question={singleQ} value={undefined} onChange={onChange} />);
    const group = screen.getByRole("radiogroup");
    expect(group.getAttribute("aria-labelledby")).toBe("stem-s1");
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
    fireEvent.click(radios[1]!);
    expect(onChange).toHaveBeenLastCalledWith(1);
    rerender(<SingleChoice question={singleQ} value={1} onChange={onChange} />);
    expect(radios[1]!.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(radios[1]!); // 再點同顆:不可取消 → 不觸發 null
    for (const call of onChange.mock.calls) expect(call[0]).not.toBeNull();
  });

  test("options render zhuyin", () => {
    const { container } = render(<SingleChoice question={singleQ} value={undefined} onChange={() => {}} />);
    expect(container.querySelector("ruby")).toBeTruthy();
  });
});

describe("MultiChoice", () => {
  test("checkbox roles; toggle emits ascending unique arrays", () => {
    let value: number[] = [];
    const onChange = mock((v: number[]) => { value = v; });
    const { rerender } = render(<MultiChoice question={multiQ} value={value} onChange={onChange} />);
    const boxes = screen.getAllByRole("checkbox");
    expect(boxes).toHaveLength(4);
    fireEvent.click(boxes[2]!);
    expect(onChange).toHaveBeenLastCalledWith([2]);
    rerender(<MultiChoice question={multiQ} value={[2]} onChange={onChange} />);
    fireEvent.click(boxes[0]!);
    expect(onChange).toHaveBeenLastCalledWith([0, 2]);
    rerender(<MultiChoice question={multiQ} value={[0, 2]} onChange={onChange} />);
    expect(boxes[0]!.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(boxes[2]!); // 取消
    expect(onChange).toHaveBeenLastCalledWith([0]);
  });
});

describe("FillBlank", () => {
  test("textbox named from stem; writes string on change; suffix rendered", () => {
    const onChange = mock((v: string) => v);
    render(<FillBlank question={fillQ} value="" onChange={onChange} />);
    const input = screen.getByRole("textbox");
    expect(input.getAttribute("aria-label")).toContain("一年有");
    fireEvent.change(input, { target: { value: "12" } });
    expect(onChange).toHaveBeenLastCalledWith("12");
    expect(screen.getByText("個")).toBeTruthy();
  });
});

describe("Matching", () => {
  test("pair, cancel, reassign state machine with live announcements", () => {
    let value: (number | null)[] = [null, null];
    const onChange = mock((v: (number | null)[]) => { value = v; });
    const { rerender, container } = render(<Matching question={matchQ} value={value} onChange={onChange} />);
    const [beeBtn, fishBtn] = screen.getAllByRole("button").slice(0, 2);
    const rights = screen.getAllByRole("button").slice(2);

    fireEvent.click(beeBtn!); // 選左
    expect(beeBtn!.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(rights[0]!); // 配對 蜜蜂-蜂巢
    expect(onChange).toHaveBeenLastCalledWith([0, null]);
    rerender(<Matching question={matchQ} value={[0, null]} onChange={onChange} />);
    expect(container.textContent).toContain("蜜蜂 和 蜂巢 配對了");
    expect(container.querySelectorAll("line")).toHaveLength(1);

    fireEvent.click(fishBtn!); // 選另一左
    fireEvent.click(rights[0]!); // 佔用的右項 → 重配給魚
    expect(onChange).toHaveBeenLastCalledWith([null, 0]);
    rerender(<Matching question={matchQ} value={[null, 0]} onChange={onChange} />);

    fireEvent.click(fishBtn!); // 點已配對左項 → 取消
    expect(onChange).toHaveBeenLastCalledWith([null, null]);
    rerender(<Matching question={matchQ} value={[null, null]} onChange={onChange} />);
    expect(container.querySelectorAll("line")).toHaveLength(0);
    expect(container.textContent).toContain("配對取消了");
  });

  // 鍵盤 Enter/Space 由原生 button 保證,真實鍵盤行為由 e2e「arrow keys」與 Playwright keyboard 驗;
  // happy-dom 的 keyDown 不會合成 click,RTL 層不做同義反覆斷言(review MEDIUM #4)
});

describe("ImageChoice", () => {
  test("radios named by shape label plain text; numeric payload; zhuyin decorative", () => {
    const onChange = mock((v: number) => v);
    render(<ImageChoice question={imageQ} value={undefined} onChange={onChange} />);
    const triangle = screen.getByRole("radio", { name: "三角形" });
    fireEvent.click(triangle);
    expect(onChange).toHaveBeenLastCalledWith(1);
  });
});

describe("sound triggers", () => {
  test("multi: adding blips, removing stays silent", async () => {
    const blipMock = mock(() => {});
    mock.module("../../../audio/blip", () => ({ blip: blipMock, unlock: mock(() => {}), melody: mock(() => {}) }));
    const { MultiChoice: Fresh } = await import(`./MultiChoice.tsx?sound=${Math.random()}`);
    const onChange = mock(() => {});
    const { rerender } = render(<Fresh question={multiQ} value={[]} onChange={onChange} />);
    fireEvent.click(screen.getAllByRole("checkbox")[1]!);
    expect(blipMock).toHaveBeenCalledTimes(1);
    rerender(<Fresh question={multiQ} value={[1]} onChange={onChange} />);
    fireEvent.click(screen.getAllByRole("checkbox")[1]!); // 取消
    expect(blipMock).toHaveBeenCalledTimes(1); // 不再響
  });
});
