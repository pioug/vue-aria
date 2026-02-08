import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useDisclosureState } from "../src";

describe("useDisclosureState", () => {
  it("supports uncontrolled disclosure state", () => {
    const onExpandedChange = vi.fn();
    const state = useDisclosureState({
      defaultExpanded: false,
      onExpandedChange,
    });

    expect(state.isExpanded.value).toBe(false);

    state.toggle();
    expect(state.isExpanded.value).toBe(true);
    expect(onExpandedChange).toHaveBeenCalledWith(true);

    state.setExpanded(false);
    expect(state.isExpanded.value).toBe(false);
    expect(onExpandedChange).toHaveBeenCalledWith(false);
  });

  it("supports controlled disclosure state", () => {
    const isExpanded = ref(false);
    const onExpandedChange = vi.fn((next: boolean) => {
      isExpanded.value = next;
    });

    const state = useDisclosureState({
      isExpanded,
      onExpandedChange,
    });

    expect(state.isExpanded.value).toBe(false);

    state.toggle();
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(state.isExpanded.value).toBe(true);
  });
});
