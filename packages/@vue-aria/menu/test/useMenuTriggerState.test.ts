import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useMenuTriggerState } from "../src";

describe("useMenuTriggerState", () => {
  it("manages open state and focus strategy", () => {
    const state = useMenuTriggerState();

    expect(state.isOpen.value).toBe(false);
    expect(state.focusStrategy.value).toBeNull();

    state.open("first");
    expect(state.isOpen.value).toBe(true);
    expect(state.focusStrategy.value).toBe("first");

    state.toggle("last");
    expect(state.isOpen.value).toBe(false);
    expect(state.focusStrategy.value).toBe("last");
  });

  it("supports controlled mode", () => {
    const isOpen = ref(false);
    const onOpenChange = vi.fn((nextOpen: boolean) => {
      isOpen.value = nextOpen;
    });

    const state = useMenuTriggerState({
      isOpen,
      onOpenChange,
    });

    state.open("first");
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(state.isOpen.value).toBe(true);

    state.close();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(state.isOpen.value).toBe(false);
  });

  it("tracks submenu stack", () => {
    const state = useMenuTriggerState();

    state.openSubmenu("file", 0);
    state.openSubmenu("recent", 1);
    expect(state.expandedKeysStack.value).toEqual(["file", "recent"]);

    state.closeSubmenu("recent", 1);
    expect(state.expandedKeysStack.value).toEqual(["file"]);

    state.close();
    expect(state.expandedKeysStack.value).toEqual([]);
  });
});
