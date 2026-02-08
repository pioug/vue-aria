import { describe, expect, it, vi } from "vitest";
import { createDragPreviewRenderer } from "../src/DragPreview";

describe("createDragPreviewRenderer", () => {
  it("passes HTMLElement results to the callback", () => {
    const element = document.createElement("div");
    const callback = vi.fn();
    const renderer = createDragPreviewRenderer(() => element);

    renderer([{ "text/plain": "foo" }], callback);

    expect(callback).toHaveBeenCalledWith(element);
  });

  it("passes custom coordinates when provided by the render result", () => {
    const element = document.createElement("div");
    const callback = vi.fn();
    const renderer = createDragPreviewRenderer(() => ({
      element,
      x: 12,
      y: 16,
    }));

    renderer([{ "text/plain": "foo" }], callback);

    expect(callback).toHaveBeenCalledWith(element, 12, 16);
  });

  it("passes null when no preview element is returned", () => {
    const callback = vi.fn();
    const renderer = createDragPreviewRenderer(() => null);

    renderer([{ "text/plain": "foo" }], callback);

    expect(callback).toHaveBeenCalledWith(null);
  });
});
