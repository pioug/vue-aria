import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useDrag1D } from "../src/useDrag1D";

describe("useDrag1D", () => {
  it("triggers increment/decrement keyboard handlers", () => {
    const container = document.createElement("div");
    const containerRef = ref(container);
    const onIncrement = vi.fn();
    const onDecrement = vi.fn();

    const handlers = useDrag1D({
      containerRef,
      orientation: "horizontal",
      onIncrement,
      onDecrement,
    });

    handlers.onKeyDown(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    handlers.onKeyDown(new KeyboardEvent("keydown", { key: "ArrowLeft" }));

    expect(onIncrement).toHaveBeenCalledTimes(1);
    expect(onDecrement).toHaveBeenCalledTimes(1);
  });
});
