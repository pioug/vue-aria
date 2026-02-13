import { describe, expect, it, vi } from "vitest";
import { effectScope } from "vue";
import { useComboBox } from "../src/useComboBox";
import { useComboBoxState } from "@vue-aria/combobox-state";

interface Item {
  id: number;
  name: string;
}

function createStateProps(overrides: Record<string, unknown> = {}) {
  const items: Item[] = [{ id: 1, name: "one" }];
  return {
    items,
    getKey: (item: Item) => item.id,
    getTextValue: (item: Item) => item.name,
    ...overrides,
  };
}

function createComboBoxProps(overrides: Record<string, unknown> = {}) {
  return {
    label: "test label",
    popoverRef: { current: document.createElement("div") },
    buttonRef: { current: document.createElement("button") },
    inputRef: { current: document.createElement("input") },
    listBoxRef: { current: document.createElement("div") },
    ...overrides,
  };
}

function event(partial: Record<string, unknown> = {}) {
  return {
    nativeEvent: { isComposing: false },
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    continuePropagation: vi.fn(),
    ...partial,
  } as any;
}

function createScopedComboBox(
  stateOverrides: Record<string, unknown> = {},
  comboOverrides: Record<string, unknown> = {}
) {
  const scope = effectScope();
  let state!: ReturnType<typeof useComboBoxState<Item>>;
  let aria!: ReturnType<typeof useComboBox<Item>>;
  let props!: ReturnType<typeof createComboBoxProps>;
  scope.run(() => {
    state = useComboBoxState(createStateProps(stateOverrides));
    props = createComboBoxProps(comboOverrides);
    aria = useComboBox(props as any, state as any);
  });

  return {
    state,
    aria,
    props,
    stop: () => scope.stop(),
    refresh() {
      scope.run(() => {
        aria = useComboBox(props as any, state as any);
      });
      return aria;
    },
  };
}

describe("useComboBox", () => {
  it("returns default aria props", () => {
    const { aria, stop } = createScopedComboBox();

    expect(aria.labelProps.id).toBeTruthy();
    expect(aria.inputProps.id).toBeTruthy();
    expect(aria.inputProps.role).toBe("combobox");
    expect(aria.inputProps["aria-autocomplete"]).toBe("list");
    expect(aria.inputProps["aria-controls"]).toBeFalsy();
    expect(aria.inputProps["aria-activedescendant"]).toBeFalsy();
    expect(aria.listBoxProps.id).toBeTruthy();
    expect(aria.listBoxProps["aria-labelledby"]).toBe(
      `${aria.listBoxProps.id} ${aria.labelProps.id}`
    );
    expect(aria.buttonProps.id).toBeTruthy();
    expect(aria.buttonProps.excludeFromTabOrder).toBe(true);
    expect(aria.buttonProps["aria-haspopup"]).toBeTruthy();
    expect(aria.buttonProps["aria-expanded"]).toBe(false);
    expect(aria.buttonProps["aria-controls"]).toBeFalsy();
    expect(aria.buttonProps.onPress).toBeTypeOf("function");
    expect(aria.buttonProps.onPressStart).toBeTypeOf("function");
    expect(aria.buttonProps.onKeyDown).toBeTypeOf("function");
    stop();
  });

  it("prevents default on Enter when open", () => {
    const { state, refresh, stop } = createScopedComboBox({
      allowsEmptyCollection: true,
    });

    state.open();
    let aria = refresh();
    const enterEvent = event({ key: "Enter" });
    aria.inputProps.onKeyDown(enterEvent);
    expect(enterEvent.preventDefault).toHaveBeenCalledTimes(1);

    state.close();
    aria = refresh();
    aria.inputProps.onKeyDown(event({ key: "Enter" }));
    expect(enterEvent.preventDefault).toHaveBeenCalledTimes(1);
    stop();
  });

  it("opens and toggles with arrow keys and trigger button", () => {
    const { state, aria, stop } = createScopedComboBox();
    const openSpy = vi.fn();
    const toggleSpy = vi.fn();

    (state as any).open = openSpy;
    (state as any).toggle = toggleSpy;

    aria.inputProps.onKeyDown(event({ key: "ArrowDown" }));
    expect(openSpy).toHaveBeenCalledWith("first", "manual");
    aria.inputProps.onKeyDown(event({ key: "ArrowUp" }));
    expect(openSpy).toHaveBeenCalledWith("last", "manual");

    aria.buttonProps.onPress(event({ pointerType: "touch" }));
    expect(toggleSpy).toHaveBeenCalledWith(null, "manual");

    aria.buttonProps.onPressStart(event({ pointerType: "mouse" }));
    expect(toggleSpy).toHaveBeenCalledWith(null, "manual");
    stop();
  });

  it("calls onBlur when no button is provided and focus leaves", () => {
    const onBlur = vi.fn();
    const { aria, stop } = createScopedComboBox(
      {},
      {
        buttonRef: { current: null },
        onBlur,
      }
    );
    aria.inputProps.onBlur(event({ relatedTarget: null }));

    expect(onBlur).toHaveBeenCalledTimes(1);
    stop();
  });

  it.each([
    { name: "disabled", value: { isDisabled: true } },
    { name: "readonly", value: { isReadOnly: true } },
  ])(
    "does not open/toggle from button keyboard when $name",
    ({ value }) => {
      const state = useComboBoxState(createStateProps(value));
      const props = createComboBoxProps(value);
      const openSpy = vi.fn();
      const toggleSpy = vi.fn();

      (state as any).open = openSpy;
      (state as any).toggle = toggleSpy;
      const scope = effectScope();
      const aria = scope.run(() => useComboBox(props as any, state as any)) as ReturnType<
        typeof useComboBox<Item>
      >;
      aria.buttonProps.onKeyDown(event({ key: "ArrowDown" }));
      aria.buttonProps.onKeyDown(event({ key: "ArrowUp" }));

      expect(openSpy).toHaveBeenCalledTimes(0);
      expect(toggleSpy).toHaveBeenCalledTimes(0);
      expect(aria.buttonProps.isDisabled).toBe(true);
      scope.stop();
    }
  );
});
