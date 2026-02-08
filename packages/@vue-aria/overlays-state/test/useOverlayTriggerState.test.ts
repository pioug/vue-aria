import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useOverlayTriggerState } from "../src";

describe("useOverlayTriggerState", () => {
  it("manages uncontrolled open state", () => {
    const state = useOverlayTriggerState();

    expect(state.isOpen.value).toBe(false);

    state.open();
    expect(state.isOpen.value).toBe(true);

    state.toggle();
    expect(state.isOpen.value).toBe(false);

    state.setOpen(true);
    expect(state.isOpen.value).toBe(true);

    state.close();
    expect(state.isOpen.value).toBe(false);
  });

  it("supports controlled open state", () => {
    const isOpen = ref(false);
    const onOpenChange = vi.fn((nextOpen: boolean) => {
      isOpen.value = nextOpen;
    });

    const state = useOverlayTriggerState({
      isOpen,
      onOpenChange,
    });

    state.open();
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(state.isOpen.value).toBe(true);

    state.toggle();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(state.isOpen.value).toBe(false);
  });
});
