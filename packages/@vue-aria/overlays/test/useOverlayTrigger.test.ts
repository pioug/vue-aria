import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useOverlayTriggerState } from "@vue-aria/overlays-state";
import { useCloseOnScroll } from "../src/useCloseOnScroll";
import { useOverlayTrigger } from "../src/useOverlayTrigger";

describe("useOverlayTrigger", () => {
  it("closes overlay when trigger scrolls for backward compatibility", () => {
    const onOpenChange = vi.fn();
    const trigger = document.createElement("button");
    const scrollable = document.createElement("div");
    scrollable.appendChild(trigger);
    document.body.appendChild(scrollable);

    const ref = { current: trigger as Element | null };

    const scope = effectScope();
    scope.run(() => {
      const state = useOverlayTriggerState({ isOpen: true, onOpenChange });
      useOverlayTrigger({ type: "dialog" }, state, ref);
      useCloseOnScroll({ triggerRef: ref, isOpen: true });
    });

    scrollable.dispatchEvent(new Event("scroll", { bubbles: true }));

    expect(onOpenChange).toHaveBeenCalledWith(false);

    scope.stop();
    scrollable.remove();
  });

  it("sets menu and listbox aria-haspopup semantics", () => {
    const menuState = useOverlayTriggerState({ isOpen: false });
    const listboxState = useOverlayTriggerState({ isOpen: false });

    const { triggerProps: menuTriggerProps } = useOverlayTrigger({ type: "menu" }, menuState);
    const { triggerProps: listboxTriggerProps } = useOverlayTrigger({ type: "listbox" }, listboxState);

    expect(menuTriggerProps["aria-haspopup"]).toBe(true);
    expect(listboxTriggerProps["aria-haspopup"]).toBe("listbox");
  });

  it("wires aria-expanded and aria-controls based on open state", () => {
    const state = useOverlayTriggerState({ isOpen: true });
    const { triggerProps } = useOverlayTrigger({ type: "dialog" }, state);

    expect(triggerProps["aria-expanded"]).toBe(true);
    expect(typeof triggerProps["aria-controls"]).toBe("string");
  });
});
