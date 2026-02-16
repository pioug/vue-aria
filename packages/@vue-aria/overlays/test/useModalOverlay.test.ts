import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useOverlayTriggerState } from "@vue-stately/overlays";
import { useModalOverlay } from "../src/useModalOverlay";

describe("useModalOverlay", () => {
  it("closes when clicking outside and predicate returns true", () => {
    const onOpenChange = vi.fn();
    const overlay = document.createElement("div");
    document.body.appendChild(overlay);

    const scope = effectScope();
    scope.run(() => {
      const state = useOverlayTriggerState({ isOpen: true, onOpenChange });
      useModalOverlay(
        {
          isDismissable: true,
          shouldCloseOnInteractOutside: (target) => target === document.body,
        },
        state,
        { current: overlay }
      );
    });

    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
    document.body.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, button: 0 }));
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }));

    expect(onOpenChange).toHaveBeenCalledWith(false);

    scope.stop();
    overlay.remove();
  });

  it("does not close when clicking outside and predicate returns false", () => {
    const onOpenChange = vi.fn();
    const overlay = document.createElement("div");
    document.body.appendChild(overlay);

    const scope = effectScope();
    scope.run(() => {
      const state = useOverlayTriggerState({ isOpen: true, onOpenChange });
      useModalOverlay(
        {
          isDismissable: true,
          shouldCloseOnInteractOutside: (target) => target !== document.body,
        },
        state,
        { current: overlay }
      );
    });

    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
    document.body.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, button: 0 }));
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }));

    expect(onOpenChange).not.toHaveBeenCalled();

    scope.stop();
    overlay.remove();
  });
});
