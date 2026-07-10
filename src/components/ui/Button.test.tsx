import { describe, expect, test, mock } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

// spec: base-components / Button component variants and states、Minimum touch target

describe("Button", () => {
  test.each(["primary", "secondary", "ghost"] as const)("renders %s variant", (variant) => {
    render(<Button variant={variant}>按鈕</Button>);
    const btn = screen.getByRole("button", { name: "按鈕" });
    expect(btn.getAttribute("data-variant")).toBe(variant);
    expect(btn.className).toContain("min-h-11"); // 44px 觸控底線
  });

  test("defaults to primary", () => {
    render(<Button>送出</Button>);
    expect(screen.getByRole("button").getAttribute("data-variant")).toBe("primary");
  });

  test("disabled button does not fire onClick", () => {
    const onClick = mock(() => {});
    render(<Button disabled onClick={onClick}>不能按</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
  });

  test("has visible focus ring styles", () => {
    render(<Button>焦點</Button>);
    expect(screen.getByRole("button").className).toContain("focus-visible:ring");
  });

  test("forwards native attributes", () => {
    render(<Button type="submit" aria-label="送出表單">Go</Button>);
    const btn = screen.getByRole("button", { name: "送出表單" });
    expect(btn.getAttribute("type")).toBe("submit");
  });
});
