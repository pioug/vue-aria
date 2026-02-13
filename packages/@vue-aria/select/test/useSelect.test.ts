import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useSelect } from "../src/useSelect";

function createCollection() {
  const keys = ["a", "b"];
  return {
    size: keys.length,
    getKeys() {
      return keys.values();
    },
    getItem(key: string) {
      return {
        key,
        type: "item",
        textValue: key.toUpperCase(),
        index: keys.indexOf(key),
        props: {},
      } as any;
    },
    getFirstKey() {
      return keys[0];
    },
    getLastKey() {
      return keys[keys.length - 1];
    },
    getKeyBefore(key: string) {
      const i = keys.indexOf(key);
      return i > 0 ? keys[i - 1] : null;
    },
    getKeyAfter(key: string) {
      const i = keys.indexOf(key);
      return i >= 0 && i < keys.length - 1 ? keys[i + 1] : null;
    },
  };
}

function createState() {
  const collection = createCollection();
  return {
    collection,
    disabledKeys: new Set(),
    selectionManager: {
      selectionMode: "single",
      disabledBehavior: "all",
      focusedKey: null,
      setFocusedKey: () => {},
    },
    selectedKey: "a",
    setSelectedKey: vi.fn(),
    isOpen: false,
    focusStrategy: null,
    close: vi.fn(),
    open: vi.fn(),
    toggle: vi.fn(),
    isFocused: false,
    setFocused: vi.fn(),
    displayValidation: {
      isInvalid: false,
      validationErrors: [],
      validationDetails: null,
    },
    value: "a",
    defaultValue: "a",
    setValue: vi.fn(),
  } as any;
}

describe("useSelect", () => {
  it("returns trigger/menu props and hidden select props", () => {
    const state = createState();
    const ref = { current: document.createElement("button") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const scope = effectScope();
    let result: any = null;
    scope.run(() => {
      result = useSelect(
        {
          label: "Pick one",
          name: "choice",
          keyboardDelegate: {
            getKeyAbove: () => "a",
            getKeyBelow: () => "b",
            getFirstKey: () => "a",
            getKeyForSearch: () => null,
          } as any,
        },
        state,
        ref
      );
    });

    expect(result.triggerProps["aria-haspopup"]).toBe("listbox");
    expect(result.menuProps.shouldSelectOnPressUp).toBe(true);
    expect(result.hiddenSelectProps.name).toBe("choice");

    scope.stop();
    ref.current?.remove();
  });
});
