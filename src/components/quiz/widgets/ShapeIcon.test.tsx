import { describe, expect, test } from "bun:test";
import { render } from "@testing-library/react";
import type { ShapeCode } from "../../../data/schema";
import { ShapeIcon } from "./ShapeIcon";

describe("ShapeIcon", () => {
  test.each(["circle", "triangle", "square", "star", "heart", "hexagon"] as ShapeCode[])(
    "renders %s as decorative svg",
    (code) => {
      const { container } = render(<ShapeIcon code={code} index={0} />);
      expect(container.querySelector("svg")).toBeTruthy();
      expect(container.firstElementChild!.getAttribute("aria-hidden")).toBe("true");
    },
  );
});
