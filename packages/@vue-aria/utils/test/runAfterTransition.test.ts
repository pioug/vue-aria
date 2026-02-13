import { describe, expect, it, vi } from "vitest";
import { runAfterTransition } from "../src/runAfterTransition";

class MockTransitionEvent extends Event {
  propertyName: string;

  constructor(type: string, eventInitDict?: TransitionEventInit) {
    super(type, eventInitDict);
    this.propertyName = eventInitDict?.propertyName || "";
  }
}

describe("runAfterTransition", () => {
  const originalTransitionEvent = globalThis.TransitionEvent;

  it("calls callback when there is no active transition", () => {
    vi.useFakeTimers();
    globalThis.TransitionEvent = MockTransitionEvent as any;

    const callback = vi.fn();
    runAfterTransition(callback);
    vi.runOnlyPendingTimers();

    expect(callback).toHaveBeenCalledTimes(1);

    globalThis.TransitionEvent = originalTransitionEvent;
    vi.useRealTimers();
  });

  it("defers callback until transition ends", () => {
    vi.useFakeTimers();
    globalThis.TransitionEvent = MockTransitionEvent as any;

    const element = document.createElement("div");
    document.body.appendChild(element);

    element.dispatchEvent(new TransitionEvent("transitionrun", { propertyName: "opacity", bubbles: true }));

    const callback = vi.fn();
    runAfterTransition(callback);
    vi.runOnlyPendingTimers();

    expect(callback).not.toHaveBeenCalled();

    element.dispatchEvent(new TransitionEvent("transitionend", { propertyName: "opacity", bubbles: true }));
    expect(callback).toHaveBeenCalledTimes(1);

    element.remove();
    globalThis.TransitionEvent = originalTransitionEvent;
    vi.useRealTimers();
  });
});
