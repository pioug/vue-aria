import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope } from "vue";
import { useOverlayPosition } from "../src/useOverlayPosition";

describe("useOverlayPosition", () => {
  const originalGetBoundingClientRect = window.HTMLElement.prototype.getBoundingClientRect;

  beforeEach(() => {
    (window as any).visualViewport = {
      offsetTop: 0,
      height: 768,
      offsetLeft: 0,
      scale: 1,
      width: 500,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
      onresize: () => {},
      onscroll: () => {},
      pageLeft: 0,
      pageTop: 0,
    } as VisualViewport;

    document.body.style.margin = "0";

    Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, value: 768 });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, value: 500 });

    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
      return parseInt(this.style.width, 10) || 0;
    });
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (this: HTMLElement) {
      return parseInt(this.style.height, 10) || 0;
    });

    HTMLElement.prototype.getBoundingClientRect = function () {
      const rect = originalGetBoundingClientRect.apply(this);
      if (this.tagName === "BODY") {
        return {
          ...rect,
          height: this.clientHeight,
          width: this.clientWidth,
        };
      }

      return {
        ...rect,
        left: parseInt(this.style.left, 10) || 0,
        top: parseInt(this.style.top, 10) || 0,
        right: parseInt(this.style.right, 10) || 0,
        bottom: parseInt(this.style.bottom, 10) || 0,
        width: parseInt(this.style.width, 10) || 0,
        height: parseInt(this.style.height, 10) || 0,
      } as DOMRect;
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it("positions overlay relative to the trigger", () => {
    const trigger = document.createElement("div");
    trigger.style.left = "10px";
    trigger.style.top = "250px";
    trigger.style.width = "100px";
    trigger.style.height = "100px";

    const overlay = document.createElement("div");
    overlay.style.width = "300px";
    overlay.style.height = "200px";

    const arrow = document.createElement("div");
    arrow.style.width = "8px";
    arrow.style.height = "8px";

    document.body.append(trigger, overlay, arrow);

    const scope = effectScope();
    let placement: string | null = null;
    let overlayStyle: Record<string, unknown> = {};
    scope.run(() => {
      const result = useOverlayPosition({
        targetRef: { current: trigger },
        overlayRef: { current: overlay },
        arrowRef: { current: arrow },
      });
      placement = result.placement;
      overlayStyle = result.overlayProps.style as Record<string, unknown>;
    });

    expect(placement).toBe("bottom");
    expect(overlayStyle.position).toBe("absolute");
    expect(overlayStyle.left).toBe(12);
    expect(overlayStyle.top).toBe(350);
    expect(overlayStyle.maxHeight).toBe(406);

    scope.stop();
    trigger.remove();
    overlay.remove();
    arrow.remove();
  });

  it("closes on body scroll when onClose is provided", () => {
    const onClose = vi.fn();
    const trigger = document.createElement("div");
    trigger.style.left = "10px";
    trigger.style.top = "250px";
    trigger.style.width = "100px";
    trigger.style.height = "100px";

    const overlay = document.createElement("div");
    overlay.style.width = "300px";
    overlay.style.height = "200px";

    document.body.append(trigger, overlay);

    const scope = effectScope();
    scope.run(() => {
      useOverlayPosition({
        targetRef: { current: trigger },
        overlayRef: { current: overlay },
        onClose,
        isOpen: true,
      });
    });

    document.body.dispatchEvent(new Event("scroll", { bubbles: true }));
    expect(onClose).toHaveBeenCalledTimes(1);

    scope.stop();
    trigger.remove();
    overlay.remove();
  });
});
