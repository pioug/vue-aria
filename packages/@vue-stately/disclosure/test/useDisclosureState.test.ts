import { describe, expect, it, vi } from "vitest";
import { useDisclosureState } from "../src";

describe("useDisclosureState", () => {
  it("handles toggling", () => {
    const onExpandedChange = vi.fn();
    const state = useDisclosureState({ onExpandedChange });

    expect(state.isExpanded).toBe(false);
    state.toggle();
    expect(state.isExpanded).toBe(true);
    state.collapse();
    expect(state.isExpanded).toBe(false);
    expect(onExpandedChange).toHaveBeenCalled();
  });
});
