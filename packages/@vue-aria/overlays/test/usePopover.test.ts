import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useOverlayTriggerState } from "@vue-stately/overlays";
import { useOverlayTrigger } from "../src/useOverlayTrigger";
import { usePopover } from "../src/usePopover";

describe("usePopover", () => {
  it("does not close popover on scroll", () => {
    const onOpenChange = vi.fn();
    const trigger = document.createElement("button");
    const popover = document.createElement("div");
    document.body.append(trigger, popover);

    const triggerRef = { current: trigger as Element | null };
    const popoverRef = { current: popover as Element | null };

    const scope = effectScope();
    scope.run(() => {
      const state = useOverlayTriggerState({ isOpen: true, onOpenChange });
      useOverlayTrigger({ type: "listbox" }, state, triggerRef);
      usePopover({ triggerRef, popoverRef }, state);
    });

    document.body.dispatchEvent(new Event("scroll", { bubbles: true }));
    expect(onOpenChange).not.toHaveBeenCalled();

    scope.stop();
    trigger.remove();
    popover.remove();
  });
});
