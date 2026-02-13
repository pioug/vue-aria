import { describe, expect, it, vi } from "vitest";
import { useOverlayTriggerState } from "../src";

describe("useOverlayTriggerState", () => {
  it("handles defaults and state transitions", () => {
    const onOpenChange = vi.fn();
    const state = useOverlayTriggerState({ onOpenChange });

    expect(state.isOpen).toBe(false);
    state.open();
    expect(state.isOpen).toBe(true);
    state.toggle();
    expect(state.isOpen).toBe(false);
    state.setOpen(true);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
