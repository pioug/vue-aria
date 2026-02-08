import { describe, expect, it } from "vitest";
import { useOverlayTriggerState } from "@vue-aria/overlays-state";
import { useOverlayTrigger } from "../src";

describe("useOverlayTrigger", () => {
  it("returns default trigger and overlay props", () => {
    const state = useOverlayTriggerState();
    const { triggerProps, overlayProps } = useOverlayTrigger(
      {
        type: "menu",
      },
      state
    );

    expect(triggerProps.value["aria-haspopup"]).toBe(true);
    expect(triggerProps.value["aria-expanded"]).toBe(false);
    expect(triggerProps.value["aria-controls"]).toBeUndefined();
    expect(overlayProps.value.id).toBeTypeOf("string");
  });

  it("supports listbox haspopup and toggles open", () => {
    const state = useOverlayTriggerState();
    const { triggerProps, overlayProps } = useOverlayTrigger(
      {
        type: "listbox",
      },
      state
    );

    expect(triggerProps.value["aria-haspopup"]).toBe("listbox");

    (triggerProps.value.onPress as () => void)();

    expect(state.isOpen.value).toBe(true);
    expect(triggerProps.value["aria-expanded"]).toBe(true);
    expect(triggerProps.value["aria-controls"]).toBe(overlayProps.value.id);
  });

  it("supports trigger click fallback", () => {
    const state = useOverlayTriggerState();
    const { triggerProps } = useOverlayTrigger(
      {
        type: "dialog",
      },
      state
    );

    expect(triggerProps.value["aria-haspopup"]).toBeUndefined();

    (triggerProps.value.onClick as () => void)();
    expect(state.isOpen.value).toBe(true);

    (triggerProps.value.onClick as () => void)();
    expect(state.isOpen.value).toBe(false);
  });
});
