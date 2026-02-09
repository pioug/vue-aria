import { describe, expect, it } from "vitest";
import { h } from "vue";
import { getWrappedElement } from "../src";

describe("getWrappedElement", () => {
  it("wraps string children in a span", () => {
    const element = getWrappedElement("Click me");

    expect(element.type).toBe("span");
    expect(element.children).toBe("Click me");
  });

  it("returns a vnode child unchanged", () => {
    const child = h("a", { href: "#test" }, "Link");
    const element = getWrappedElement(child);

    expect(element).toBe(child);
  });

  it("returns the single vnode from child arrays", () => {
    const child = h("a", { href: "#test" }, "Link");
    const element = getWrappedElement([null, child, false]);

    expect(element).toBe(child);
  });

  it("throws when there is not exactly one valid vnode child", () => {
    expect(() => getWrappedElement([])).toThrowError(
      "Expected exactly one valid child element."
    );

    expect(() =>
      getWrappedElement([h("a", null, "one"), h("a", null, "two")])
    ).toThrowError("Expected exactly one valid child element.");
  });
});
