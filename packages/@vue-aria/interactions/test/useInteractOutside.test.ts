import { describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useInteractOutside } from "../src/useInteractOutside";

function createPointerEvent(type: string, button = 0): PointerEvent {
  return new PointerEvent(type, { bubbles: true, cancelable: true, button });
}

describe("useInteractOutside", () => {
  it("fires on interact outside for pointerdown + click sequence", () => {
    const onInteractOutside = vi.fn();
    const onInteractOutsideStart = vi.fn();
    const target = document.createElement("div");
    document.body.appendChild(target);

    const scope = effectScope();
    scope.run(() => {
      useInteractOutside({
        ref: ref(target),
        onInteractOutside,
        onInteractOutsideStart,
      });
    });

    target.dispatchEvent(createPointerEvent("pointerdown"));
    target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onInteractOutside).not.toHaveBeenCalled();

    document.body.dispatchEvent(createPointerEvent("pointerdown"));
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(onInteractOutsideStart).toHaveBeenCalledTimes(1);
    expect(onInteractOutside).toHaveBeenCalledTimes(1);
    scope.stop();
  });

  it("only listens for left mouse button", () => {
    const onInteractOutside = vi.fn();
    const target = document.createElement("div");
    document.body.appendChild(target);

    const scope = effectScope();
    scope.run(() => {
      useInteractOutside({
        ref: ref(target),
        onInteractOutside,
      });
    });

    document.body.dispatchEvent(createPointerEvent("pointerdown", 1));
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 1 }));
    expect(onInteractOutside).not.toHaveBeenCalled();

    document.body.dispatchEvent(createPointerEvent("pointerdown", 0));
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }));
    expect(onInteractOutside).toHaveBeenCalledTimes(1);
    scope.stop();
  });

  it("does not fire when click happens without prior pointerdown", () => {
    const onInteractOutside = vi.fn();
    const target = document.createElement("div");
    document.body.appendChild(target);

    document.body.dispatchEvent(createPointerEvent("pointerdown"));

    const scope = effectScope();
    scope.run(() => {
      useInteractOutside({
        ref: ref(target),
        onInteractOutside,
      });
    });

    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onInteractOutside).not.toHaveBeenCalled();
    scope.stop();
  });

  it("does not handle events when disabled", () => {
    const onInteractOutside = vi.fn();
    const target = document.createElement("div");
    document.body.appendChild(target);

    const scope = effectScope();
    scope.run(() => {
      useInteractOutside({
        ref: ref(target),
        isDisabled: true,
        onInteractOutside,
      });
    });

    document.body.dispatchEvent(createPointerEvent("pointerdown", 0));
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onInteractOutside).not.toHaveBeenCalled();
    scope.stop();
  });

  it("ignores targets marked as top-layer", () => {
    const onInteractOutside = vi.fn();
    const target = document.createElement("div");
    document.body.appendChild(target);
    const topLayer = document.createElement("div");
    topLayer.setAttribute("data-react-aria-top-layer", "true");
    document.body.appendChild(topLayer);

    const scope = effectScope();
    scope.run(() => {
      useInteractOutside({
        ref: ref(target),
        onInteractOutside,
      });
    });

    topLayer.dispatchEvent(createPointerEvent("pointerdown", 0));
    topLayer.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onInteractOutside).not.toHaveBeenCalled();
    scope.stop();
  });
});
