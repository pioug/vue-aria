import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getRTLOffsetType,
  getScrollLeft,
  setScrollLeft,
  type RTLOffsetType,
} from "../src/utils";

function detectRTLOffsetType(type: RTLOffsetType): void {
  const nativeCreateElement = document.createElement.bind(document);
  let divIndex = 0;

  const createSpy = vi
    .spyOn(document, "createElement")
    .mockImplementation((tagName: string): HTMLElement => {
      const element = nativeCreateElement(tagName);
      if (tagName.toLowerCase() === "div" && divIndex === 0) {
        divIndex += 1;
        let value = type === "positive-descending" ? 1 : 0;
        Object.defineProperty(element, "scrollLeft", {
          configurable: true,
          get: () => value,
          set: (next: number) => {
            if (type === "negative") {
              value = 0;
            } else {
              value = Number(next);
            }
          },
        });
      }

      return element;
    });

  expect(getRTLOffsetType(true)).toBe(type);
  createSpy.mockRestore();
}

function createScrollableNode(
  scrollLeft = 0,
  scrollWidth = 300,
  clientWidth = 100
): HTMLElement {
  const node = document.createElement("div");
  Object.defineProperty(node, "scrollWidth", {
    configurable: true,
    value: scrollWidth,
  });
  Object.defineProperty(node, "clientWidth", {
    configurable: true,
    value: clientWidth,
  });
  node.scrollLeft = scrollLeft;
  return node;
}

describe("virtualizer rtl scroll utils", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each<RTLOffsetType>([
    "negative",
    "positive-descending",
    "positive-ascending",
  ])("detects %s rtl offset type", (type) => {
    detectRTLOffsetType(type);
  });

  it("keeps ltr scroll values unchanged", () => {
    const node = createScrollableNode(42);

    expect(getScrollLeft(node, "ltr")).toBe(42);
    setScrollLeft(node, "ltr", 18);
    expect(node.scrollLeft).toBe(18);
  });

  it("normalizes rtl negative offset scroll behavior", () => {
    detectRTLOffsetType("negative");
    const node = createScrollableNode(-20);

    expect(getScrollLeft(node, "rtl")).toBe(20);
    setScrollLeft(node, "rtl", 36);
    expect(node.scrollLeft).toBe(-36);
  });

  it("normalizes rtl positive-descending offset scroll behavior", () => {
    detectRTLOffsetType("positive-descending");
    const node = createScrollableNode(40);

    expect(getScrollLeft(node, "rtl")).toBe(160);
    setScrollLeft(node, "rtl", 30);
    expect(node.scrollLeft).toBe(170);
  });

  it("supports rtl positive-ascending offset scroll behavior", () => {
    detectRTLOffsetType("positive-ascending");
    const node = createScrollableNode(25);

    expect(getScrollLeft(node, "rtl")).toBe(25);
    setScrollLeft(node, "rtl", 44);
    expect(node.scrollLeft).toBe(44);
  });
});
