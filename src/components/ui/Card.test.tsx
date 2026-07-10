import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

// spec: base-components / Card surface container
describe("Card", () => {
  test("renders children on a surface container with border and card shadow tokens", () => {
    render(<Card data-testid="card">內容</Card>);
    const card = screen.getByTestId("card");
    expect(card.textContent).toBe("內容");
    expect(card.className).toContain("bg-surface");
    expect(card.className).toContain("border-line");
    expect(card.className).toContain("shadow-card");
  });

  test("merges custom className", () => {
    render(<Card data-testid="card" className="p-8">x</Card>);
    expect(screen.getByTestId("card").className).toContain("p-8");
  });
});
