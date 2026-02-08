import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useSelectState } from "../src";

const items = [{ key: "one" }, { key: "two" }, { key: "three" }];

describe("useSelectState", () => {
  it("initializes selected key and item", () => {
    const state = useSelectState({
      collection: items,
      defaultSelectedKey: "two",
    });

    expect(state.selectedKey.value).toBe("two");
    expect(state.selectedItem.value?.key).toBe("two");
    expect(state.value.value).toBe("two");
  });

  it("supports open/close/toggle", () => {
    const state = useSelectState({
      collection: items,
    });

    expect(state.isOpen.value).toBe(false);

    state.open("first");
    expect(state.isOpen.value).toBe(true);
    expect(state.focusStrategy.value).toBe("first");

    state.toggle();
    expect(state.isOpen.value).toBe(false);
  });

  it("closes after selection change", () => {
    const state = useSelectState({
      collection: items,
    });

    state.open();
    expect(state.isOpen.value).toBe(true);

    state.setSelectedKey("three");
    expect(state.selectedKey.value).toBe("three");
    expect(state.isOpen.value).toBe(false);
  });

  it("supports controlled selected key", () => {
    const selectedKey = ref<string | null>("one");
    const onSelectionChange = vi.fn((key: string | number | null) => {
      selectedKey.value = key === null ? null : String(key);
    });

    const state = useSelectState({
      collection: items,
      selectedKey,
      onSelectionChange,
    });

    state.setSelectedKey("two");

    expect(onSelectionChange).toHaveBeenCalledWith("two");
    expect(state.selectedKey.value).toBe("two");
  });
});
