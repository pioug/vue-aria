import { describe, expect, it, vi } from "vitest";
import { effectScope } from "vue";
import { useOverlayTriggerState } from "@vue-aria/overlays-state";
import { useOverlayTrigger, usePopover } from "../src";

function mockRect(
  element: Element,
  rect: Partial<DOMRectReadOnly>
): void {
  Object.defineProperty(element, "getBoundingClientRect", {
    value: () => ({
      x: rect.left ?? 0,
      y: rect.top ?? 0,
      top: rect.top ?? 0,
      left: rect.left ?? 0,
      right: rect.right ?? ((rect.left ?? 0) + (rect.width ?? 0)),
      bottom: rect.bottom ?? ((rect.top ?? 0) + (rect.height ?? 0)),
      width: rect.width ?? 0,
      height: rect.height ?? 0,
      toJSON: () => ({}),
    }),
    configurable: true,
  });
}

describe("usePopover", () => {
  it("does not close popover on scroll by default", () => {
    const trigger = document.createElement("button");
    const popover = document.createElement("div");
    popover.style.width = "200px";
    popover.style.height = "120px";

    document.body.append(trigger, popover);

    mockRect(trigger, { left: 10, top: 250, width: 100, height: 40 });
    mockRect(popover, { left: 0, top: 0, width: 200, height: 120 });

    const onOpenChange = vi.fn();

    const scope = effectScope();
    scope.run(() => {
      const state = useOverlayTriggerState({
        isOpen: true,
        onOpenChange,
      });

      useOverlayTrigger(
        {
          type: "listbox",
        },
        state,
        trigger
      );

      usePopover(
        {
          triggerRef: trigger,
          popoverRef: popover,
        },
        state
      );
    });

    document.body.dispatchEvent(new Event("scroll"));

    expect(onOpenChange).not.toHaveBeenCalled();

    scope.stop();
  });
});
