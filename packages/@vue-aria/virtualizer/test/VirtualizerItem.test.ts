import { describe, expect, it } from "vitest";
import { LayoutInfo, Rect } from "@vue-aria/virtualizer-state";
import { layoutInfoToStyle } from "../src/VirtualizerItem";

describe("layoutInfoToStyle", () => {
  it("computes absolute ltr style and caches by layout info", () => {
    const layoutInfo = new LayoutInfo("item", "a", new Rect(10, 20, 120, 48));

    const first = layoutInfoToStyle(layoutInfo, "ltr");
    const second = layoutInfoToStyle(layoutInfo, "ltr");

    expect(first.position).toBe("absolute");
    expect(first.top).toBe(20);
    expect(first.left).toBe(10);
    expect(first.width).toBe(120);
    expect(first.height).toBe(48);
    expect(second).toBe(first);
  });

  it("uses right positioning in rtl", () => {
    const layoutInfo = new LayoutInfo("item", "b", new Rect(15, 12, 80, 30));

    const style = layoutInfoToStyle(layoutInfo, "rtl");

    expect(style.right).toBe(15);
    expect(style.left).toBeUndefined();
  });

  it("offsets from parent unless sticky layout allows overflow", () => {
    const parent = new LayoutInfo("row", "parent", new Rect(5, 8, 300, 200));
    const child = new LayoutInfo("cell", "child", new Rect(20, 40, 60, 24));

    const offsetStyle = layoutInfoToStyle(child, "ltr", parent);
    expect(offsetStyle.left).toBe(15);
    expect(offsetStyle.top).toBe(32);

    const stickyChild = new LayoutInfo(
      "cell",
      "sticky-child",
      new Rect(20, 40, 60, 24)
    );
    stickyChild.isSticky = true;
    parent.allowOverflow = true;
    const stickyStyle = layoutInfoToStyle(stickyChild, "ltr", parent);
    expect(stickyStyle.left).toBe(20);
    expect(stickyStyle.top).toBe(40);
    expect(stickyStyle.position).toBe("sticky");
    expect(stickyStyle.display).toBe("inline-block");
  });

  it("drops non-finite coordinates from style output", () => {
    const layoutInfo = new LayoutInfo(
      "item",
      "c",
      new Rect(Number.NaN, Number.POSITIVE_INFINITY, 50, 20)
    );

    const style = layoutInfoToStyle(layoutInfo, "ltr");

    expect(style.left).toBeUndefined();
    expect(style.top).toBeUndefined();
    expect(style.width).toBe(50);
    expect(style.height).toBe(20);
  });
});
