import { describe, expect, it } from "vitest";
import { LayoutInfo, Rect } from "../src";

describe("LayoutInfo", () => {
  it("returns a full copy from copy()", () => {
    const layoutInfo = new LayoutInfo("loader", "key", new Rect(10, 10, 10, 10));
    layoutInfo.parentKey = "parent-key";
    layoutInfo.estimatedSize = true;
    layoutInfo.isSticky = true;
    layoutInfo.opacity = 0.4;
    layoutInfo.transform = "scale3d(0.8, 0.8, 0.8)";
    layoutInfo.zIndex = 5;
    layoutInfo.allowOverflow = true;
    layoutInfo.content = { foo: "bar" };

    const copy = layoutInfo.copy();
    expect(copy).toEqual(layoutInfo);
    expect(copy).not.toBe(layoutInfo);
    expect(copy.rect).not.toBe(layoutInfo.rect);
  });
});
