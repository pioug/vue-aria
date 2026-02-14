import { h } from "vue";
import { describe, expect, it } from "vitest";
import { getWrappedElement } from "../src/getWrappedElement";

describe("getWrappedElement", () => {
  it("wraps string children in a span", () => {
    const vnode = getWrappedElement("hello");
    expect(vnode.type).toBe("span");
    expect(vnode.children).toBe("hello");
  });

  it("returns a single vnode child as-is", () => {
    const child = h("div", { id: "child" }, "content");
    const vnode = getWrappedElement(child);
    expect(vnode).toBe(child);
  });

  it("throws when multiple children are provided", () => {
    expect(() =>
      getWrappedElement([h("div", "one"), h("div", "two")])
    ).toThrowError("Expected exactly one vnode child.");
  });
});
