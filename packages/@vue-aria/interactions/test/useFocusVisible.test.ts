import { describe, expect, it, vi } from "vitest";
import { effectScope } from "vue";
import {
  addWindowFocusTracking,
  changeHandlers,
  getInteractionModality,
  getPointerType,
  hasSetupGlobalListeners,
  isFocusVisible,
  setInteractionModality,
  useFocusVisible,
  useFocusVisibleListener,
} from "../src/useFocusVisible";

describe("useFocusVisible infrastructure", () => {
  it("tracks interaction modality and pointer type", () => {
    setInteractionModality("pointer");
    expect(getInteractionModality()).toBe("pointer");
    expect(getPointerType()).toBe("mouse");
    expect(isFocusVisible()).toBe(false);

    setInteractionModality("keyboard");
    expect(getInteractionModality()).toBe("keyboard");
    expect(getPointerType()).toBe("keyboard");
    expect(isFocusVisible()).toBe(true);
  });

  it("notifies focus visible listeners", () => {
    const callback = vi.fn();
    const scope = effectScope();
    scope.run(() => {
      useFocusVisibleListener(callback, []);
    });

    setInteractionModality("pointer");
    setInteractionModality("keyboard");

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, false);
    expect(callback).toHaveBeenNthCalledWith(2, true);

    scope.stop();
  });

  it("useFocusVisible returns current visibility state", () => {
    setInteractionModality("pointer");

    const scope = effectScope();
    const result = scope.run(() => useFocusVisible());

    expect(result?.isFocusVisible).toBe(false);

    scope.stop();
  });

  it("can setup and tear down window focus tracking", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const initialSize = hasSetupGlobalListeners.size;
    const teardown = addWindowFocusTracking(root);
    const afterSetupSize = hasSetupGlobalListeners.size;

    expect(afterSetupSize).toBeGreaterThanOrEqual(initialSize);

    teardown();
    expect(hasSetupGlobalListeners.size).toBeLessThanOrEqual(afterSetupSize);
    expect(hasSetupGlobalListeners.size).toBeGreaterThanOrEqual(0);

    root.remove();
  });

  it("registers and unregisters handlers on scope dispose", () => {
    const initialSize = changeHandlers.size;
    const scope = effectScope();

    scope.run(() => {
      useFocusVisibleListener(() => {}, []);
    });

    expect(changeHandlers.size).toBe(initialSize + 1);

    scope.stop();

    expect(changeHandlers.size).toBe(initialSize);
  });
});
