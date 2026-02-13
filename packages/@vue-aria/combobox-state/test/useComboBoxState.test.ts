import { describe, expect, it, vi } from "vitest";
import { useComboBoxState, type ComboBoxStateOptions } from "../src/useComboBoxState";

interface Item {
  id: string;
  name: string;
}

function createProps(
  overrides: Partial<ComboBoxStateOptions<Item>> = {}
): ComboBoxStateOptions<Item> {
  const items: Item[] = [
    { id: "0", name: "one" },
    { id: "1", name: "onomatopoeia" },
  ];

  return {
    items,
    getKey: (item) => item.id,
    getTextValue: (item) => item.name,
    ...overrides,
  };
}

describe("useComboBoxState", () => {
  it("is closed by default and toggles open/close", () => {
    const onOpenChange = vi.fn();
    const state = useComboBoxState(createProps({ onOpenChange }));

    expect(state.isOpen).toBe(false);

    state.open();
    expect(state.isOpen).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(true, undefined);

    state.close();
    expect(state.isOpen).toBe(false);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("reports open trigger reasons for open/toggle", () => {
    const onOpenChange = vi.fn();
    const state = useComboBoxState(createProps({ onOpenChange }));

    state.open(undefined, "focus");
    expect(onOpenChange).toHaveBeenLastCalledWith(true, "focus");
    state.close();

    state.open(undefined, "input");
    expect(onOpenChange).toHaveBeenLastCalledWith(true, "input");
    state.close();

    state.toggle(undefined, "manual");
    expect(onOpenChange).toHaveBeenLastCalledWith(true, "manual");
    state.toggle();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("supports default input value and uncontrolled updates", () => {
    const onInputChange = vi.fn();
    const state = useComboBoxState(
      createProps({ defaultInputValue: "hello", onInputChange })
    );

    expect(state.inputValue).toBe("hello");
    state.setInputValue("hellow");
    expect(state.inputValue).toBe("hellow");
    expect(onInputChange).toHaveBeenCalledWith("hellow");
  });

  it("supports controlled input value", () => {
    const onInputChange = vi.fn();
    const state = useComboBoxState(
      createProps({ inputValue: "hello", onInputChange })
    );

    state.setInputValue("hellow");
    expect(state.inputValue).toBe("hello");
    expect(onInputChange).toHaveBeenCalledWith("hellow");
  });

  it("does not change selection when closing", () => {
    const state = useComboBoxState(createProps());

    state.open();
    state.selectionManager.setFocusedKey("1");
    state.close();

    expect(state.selectedKey).not.toBe("1");
  });

  it("supports controlled selected key", () => {
    const onSelectionChange = vi.fn();
    const state = useComboBoxState(
      createProps({ selectedKey: "0", onSelectionChange })
    );

    expect(state.selectionManager.selectedKeys.has("0")).toBe(true);
    state.selectionManager.replaceSelection("1");
    expect(state.selectionManager.selectedKeys.has("0")).toBe(true);
    expect(state.selectionManager.selectedKeys.has("1")).toBe(false);
    expect(onSelectionChange).toHaveBeenCalledWith("1");
  });

  it("supports defaultSelectedKey", () => {
    const onSelectionChange = vi.fn();
    const state = useComboBoxState(
      createProps({ defaultSelectedKey: "0", onSelectionChange })
    );

    expect(state.selectionManager.selectedKeys.has("0")).toBe(true);
    const targetKey = Array.from(state.collection.getKeys())[1] as string;
    state.selectionManager.replaceSelection(targetKey);
    expect(state.selectedKey).toBe(targetKey);
    expect(onSelectionChange).toHaveBeenCalledWith(targetKey);
  });

  it("supports default empty selection", () => {
    const state = useComboBoxState(createProps());

    expect(state.selectionManager.selectedKeys.size).toBe(0);
    const targetKey = Array.from(state.collection.getKeys())[1] as string;
    state.selectionManager.replaceSelection(targetKey);
    expect(state.selectedKey).toBe(targetKey);
  });

  it("freezes filtered collection while closed and restores on reopen", () => {
    const contains = (text: string, value: string) =>
      text.toLowerCase().includes(value.toLowerCase());
    const state = useComboBoxState(
      createProps({
        items: undefined,
        defaultItems: [
          { id: "0", name: "one" },
          { id: "1", name: "onomatopoeia" },
        ],
        defaultInputValue: "",
        defaultFilter: contains,
      })
    );

    expect(state.collection.size).toBe(2);
    state.open();
    state.setInputValue("onom");
    expect(state.inputValue).toBe("onom");
    expect(state.collection.size).toBe(1);
    expect(state.collection.getItem("1")?.rendered).toBe("onomatopoeia");

    state.setFocused(false);
    expect(state.collection.size).toBe(1);
    expect(state.inputValue).toBe("");

    state.open();
    expect(state.collection.size).toBe(2);
  });
});
