import { describe, expect, it } from "vitest";
import { LayoutInfo, Rect } from "../src";

describe("LayoutInfo", () => {
  it("returns a copy of the current LayoutInfo after calling copy()", () => {
    const layoutInfo = new LayoutInfo("loader", "key", new Rect(10, 10, 10, 10));
    layoutInfo.parentKey = "parent key";
    layoutInfo.estimatedSize = true;
    layoutInfo.isSticky = true;
    layoutInfo.opacity = 3;
    layoutInfo.transform = "scale3d(0.8, 0.8, 0.8)";
    layoutInfo.zIndex = 5;

    expect(layoutInfo.zIndex).toBe(5);
    const copy = layoutInfo.copy();
    expect(copy).toEqual(layoutInfo);
  });
});
