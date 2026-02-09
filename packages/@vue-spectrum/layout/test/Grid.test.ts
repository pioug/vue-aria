import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Grid, fitContent, minmax, repeat } from "../src";

describe("Grid", () => {
  it("handles defaults", () => {
    const wrapper = mount(Grid);
    const grid = wrapper.get("div").element as HTMLDivElement;

    expect(grid.style.display).toBe("grid");
  });

  it("supports template areas and dimensions", () => {
    const wrapper = mount(Grid, {
      props: {
        areas: ["header header", "content sidebar"],
        columns: ["2fr", "1fr"],
        rows: ["auto", "1fr"],
        gap: 8,
      },
    });

    const grid = wrapper.get("div").element as HTMLDivElement;
    expect(grid.style.gridTemplateColumns).toBe("2fr 1fr");
    expect(grid.style.gridTemplateRows).toBe("auto 1fr");
    expect(grid.style.gap).toBe("8px");
    expect(grid.style.gridTemplateAreas).toContain("\"header header\"");
  });

  it("exports CSS grid helper functions", () => {
    expect(repeat(3, "1fr")).toBe("repeat(3, 1fr)");
    expect(repeat("auto-fit", ["100px", "1fr"])).toBe(
      "repeat(auto-fit, 100px 1fr)"
    );
    expect(minmax("120px", "1fr")).toBe("minmax(120px, 1fr)");
    expect(fitContent("240px")).toBe("fit-content(240px)");
  });
});
