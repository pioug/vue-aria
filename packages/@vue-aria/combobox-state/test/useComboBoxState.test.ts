import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useComboBoxState } from "../src";

const items = [
  { key: "one", textValue: "One" },
  { key: "two", textValue: "Two" },
  { key: "three", textValue: "Three" },
];

describe("useComboBoxState", () => {
  it("uses selected item text as default input value", () => {
    const state = useComboBoxState({
      collection: items,
      defaultSelectedKey: "two",
    });

    expect(state.selectedKey.value).toBe("two");
    expect(state.inputValue.value).toBe("Two");
    expect(state.defaultInputValue.value).toBe("Two");
  });

  it("filters collection and opens on input changes while focused", () => {
    const state = useComboBoxState({
      collection: items,
      defaultFilter: (textValue, inputValue) =>
        textValue.toLowerCase().startsWith(inputValue.toLowerCase()),
    });

    state.setFocused(true);
    state.setInputValue("tw");

    expect(state.isOpen.value).toBe(true);
    expect(state.collection.value.map((item) => item.key)).toEqual(["two"]);
  });

  it("commits the currently focused item when open", () => {
    const state = useComboBoxState({
      collection: items,
    });

    state.open("first", "manual");
    state.setFocusedKey("three");
    state.commit();

    expect(state.selectedKey.value).toBe("three");
    expect(state.inputValue.value).toBe("Three");
    expect(state.isOpen.value).toBe(false);
  });

  it("reverts to selected item text and closes", () => {
    const state = useComboBoxState({
      collection: items,
      defaultSelectedKey: "one",
    });

    state.setFocused(true);
    state.setInputValue("custom");
    state.open();
    state.revert();

    expect(state.inputValue.value).toBe("One");
    expect(state.isOpen.value).toBe(false);
  });

  it("supports controlled selected key and input value callbacks", () => {
    const selectedKey = ref<string | number | null>("one");
    const inputValue = ref("One");
    const onSelectionChange = vi.fn((nextKey: string | number | null) => {
      selectedKey.value = nextKey;
    });
    const onInputChange = vi.fn((nextInputValue: string) => {
      inputValue.value = nextInputValue;
    });

    const state = useComboBoxState({
      collection: items,
      selectedKey,
      inputValue,
      onSelectionChange,
      onInputChange,
    });

    state.setSelectedKey("two");
    state.setInputValue("Two");

    expect(onSelectionChange).toHaveBeenCalledWith("two");
    expect(onInputChange).toHaveBeenCalledWith("Two");
    expect(state.selectedKey.value).toBe("two");
    expect(state.inputValue.value).toBe("Two");
  });

  it("opens with all items on manual trigger even when filtered list is empty", () => {
    const state = useComboBoxState({
      collection: items,
      defaultFilter: (textValue, inputValue) =>
        textValue.toLowerCase().startsWith(inputValue.toLowerCase()),
    });

    state.setFocused(true);
    state.setInputValue("zzz");
    expect(state.isOpen.value).toBe(false);

    state.open(null, "manual");

    expect(state.isOpen.value).toBe(true);
    expect(state.collection.value.map((item) => item.key)).toEqual([
      "one",
      "two",
      "three",
    ]);
  });

  it("clears selection on custom commit when value does not match selected item", () => {
    const state = useComboBoxState({
      collection: items,
      defaultSelectedKey: "one",
      allowsCustomValue: true,
    });

    state.setInputValue("My custom value");
    state.commit();

    expect(state.selectedKey.value).toBeNull();
    expect(state.isOpen.value).toBe(false);
  });

  it("reports open trigger reason", () => {
    const onOpenChange = vi.fn();
    const state = useComboBoxState({
      collection: items,
      onOpenChange,
    });

    state.open("first", "manual");
    state.close();

    expect(onOpenChange).toHaveBeenNthCalledWith(1, true, "manual");
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false, undefined);
  });
});
