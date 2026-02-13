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

  it("updates selected key on left/right arrow keys", () => {
    const state = createState();
    const ref = { current: document.createElement("button") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const scope = effectScope();
    let result: any = null;
    scope.run(() => {
      result = useSelect(
        {
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

    const onKeyDown = result.triggerProps.onKeyDown as ((event: KeyboardEvent) => void) | undefined;
    onKeyDown?.({
      key: "ArrowLeft",
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);
    onKeyDown?.({
      key: "ArrowRight",
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(state.setSelectedKey).toHaveBeenNthCalledWith(1, "a");
    expect(state.setSelectedKey).toHaveBeenNthCalledWith(2, "b");

    scope.stop();
    ref.current?.remove();
  });

  it("wires focus and blur lifecycle callbacks", () => {
    const state = createState();
    const onFocusChange = vi.fn();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const ref = { current: document.createElement("button") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const scope = effectScope();
    let result: any = null;
    scope.run(() => {
      result = useSelect(
        {
          onFocus,
          onBlur,
          onFocusChange,
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

    const onFocusHandler = result.triggerProps.onFocus as ((event: FocusEvent) => void) | undefined;
    onFocusHandler?.({} as FocusEvent);
    expect(onFocus).toHaveBeenCalled();
    expect(onFocusChange).toHaveBeenCalledWith(true);
    expect(state.setFocused).toHaveBeenCalledWith(true);

    state.isOpen = false;
    const onBlurHandler = result.triggerProps.onBlur as ((event: FocusEvent) => void) | undefined;
    onBlurHandler?.({} as FocusEvent);
    expect(onBlur).toHaveBeenCalled();
    expect(onFocusChange).toHaveBeenCalledWith(false);
    expect(state.setFocused).toHaveBeenCalledWith(false);

    scope.stop();
    ref.current?.remove();
  });

  it("does not propagate menu blur when focus stays within menu", () => {
    const state = createState();
    const onBlur = vi.fn();
    const onFocusChange = vi.fn();
    const ref = { current: document.createElement("button") as HTMLElement | null };
    const menu = document.createElement("div");
    const inner = document.createElement("div");
    menu.appendChild(inner);

    const scope = effectScope();
    let result: any = null;
    scope.run(() => {
      result = useSelect(
        {
          onBlur,
          onFocusChange,
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

    const onMenuBlur = result.menuProps.onBlur as ((event: FocusEvent) => void) | undefined;
    onMenuBlur?.({
      currentTarget: menu,
      relatedTarget: inner,
    } as unknown as FocusEvent);
    expect(onBlur).not.toHaveBeenCalled();
    expect(onFocusChange).not.toHaveBeenCalledWith(false);

    onMenuBlur?.({
      currentTarget: menu,
      relatedTarget: document.createElement("div"),
    } as unknown as FocusEvent);
    expect(onBlur).toHaveBeenCalled();
    expect(onFocusChange).toHaveBeenCalledWith(false);

    scope.stop();
  });

  it("does not change selected key with arrow keys in multiple selection mode", () => {
    const state = createState();
    state.selectionManager.selectionMode = "multiple";
    const ref = { current: document.createElement("button") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const scope = effectScope();
    let result: any = null;
    scope.run(() => {
      result = useSelect(
        {
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

    const onKeyDown = result.triggerProps.onKeyDown as ((event: KeyboardEvent) => void) | undefined;
    onKeyDown?.({
      key: "ArrowLeft",
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);
    onKeyDown?.({
      key: "ArrowRight",
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(state.setSelectedKey).not.toHaveBeenCalled();

    scope.stop();
    ref.current?.remove();
  });
});
