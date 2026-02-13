import { effectScope, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useScrollWheel } from "../src/useScrollWheel";

describe("useScrollWheel", () => {
  it("handles wheel events and emits deltas", () => {
    const onScroll = vi.fn();
    const element = document.createElement("div");
    const elementRef = ref<HTMLElement | null>(element);

    const scope = effectScope();
    scope.run(() => {
      useScrollWheel({ onScroll }, elementRef);
    });

    const event = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      deltaX: 10,
      deltaY: 20,
    });

    element.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(onScroll).toHaveBeenCalledWith({ deltaX: 10, deltaY: 20 });

    scope.stop();
  });

  it("ignores ctrl+wheel events", () => {
    const onScroll = vi.fn();
    const element = document.createElement("div");
    const elementRef = ref<HTMLElement | null>(element);

    const scope = effectScope();
    scope.run(() => {
      useScrollWheel({ onScroll }, elementRef);
    });

    const event = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      deltaX: 1,
      deltaY: 2,
      ctrlKey: true,
    });

    element.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(onScroll).not.toHaveBeenCalled();

    scope.stop();
  });

  it("does not register when disabled", () => {
    const onScroll = vi.fn();
    const element = document.createElement("div");
    const elementRef = ref<HTMLElement | null>(element);

    const scope = effectScope();
    scope.run(() => {
      useScrollWheel({ onScroll, isDisabled: true }, elementRef);
    });

    const event = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      deltaX: 3,
      deltaY: 4,
    });

    element.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(onScroll).not.toHaveBeenCalled();

    scope.stop();
  });
});
