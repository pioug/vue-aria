import { describe, expect, it, vi } from "vitest";
import { effectScope } from "vue";
import { useComboBoxState } from "@vue-aria/combobox-state";
import { useComboBox } from "../src";

const items = [
  { key: "one", textValue: "One" },
  { key: "two", textValue: "Two" },
  { key: "three", textValue: "Three" },
];

describe("useComboBox", () => {
  it("returns combobox input and listbox wiring", () => {
    const input = document.createElement("input");
    const listBox = document.createElement("ul");
    const popover = document.createElement("div");
    const button = document.createElement("button");

    const scope = effectScope();
    let inputProps!: ReturnType<typeof useComboBox>["inputProps"];
    let listBoxProps!: ReturnType<typeof useComboBox>["listBoxProps"];
    let buttonProps!: ReturnType<typeof useComboBox>["buttonProps"];
    scope.run(() => {
      const state = useComboBoxState({
        collection: items,
      });

      const result = useComboBox(
        {
          label: "Animals",
          inputRef: input,
          listBoxRef: listBox,
          popoverRef: popover,
          buttonRef: button,
        },
        state
      );
      inputProps = result.inputProps;
      listBoxProps = result.listBoxProps;
      buttonProps = result.buttonProps;
    });

    expect(inputProps.value.role).toBe("combobox");
    expect(inputProps.value["aria-haspopup"]).toBe("listbox");
    expect(inputProps.value["aria-expanded"]).toBe(false);
    expect(listBoxProps.value.id).toBeTypeOf("string");
    expect(buttonProps.value["aria-controls"]).toBeUndefined();
    scope.stop();
  });

  it("sets aria-invalid when validationState is invalid", () => {
    const scope = effectScope();
    let inputProps!: ReturnType<typeof useComboBox>["inputProps"];
    scope.run(() => {
      const state = useComboBoxState({
        collection: items,
      });

      inputProps = useComboBox(
        {
          validationState: "invalid",
          inputRef: document.createElement("input"),
          listBoxRef: document.createElement("ul"),
          popoverRef: document.createElement("div"),
          "aria-label": "Animals",
        },
        state
      ).inputProps;
    });

    expect(inputProps.value["aria-invalid"]).toBe(true);
    scope.stop();
  });

  it("sets aria-invalid when isInvalid is true", () => {
    const scope = effectScope();
    let inputProps!: ReturnType<typeof useComboBox>["inputProps"];
    scope.run(() => {
      const state = useComboBoxState({
        collection: items,
      });

      inputProps = useComboBox(
        {
          isInvalid: true,
          inputRef: document.createElement("input"),
          listBoxRef: document.createElement("ul"),
          popoverRef: document.createElement("div"),
          "aria-label": "Animals",
        },
        state
      ).inputProps;
    });

    expect(inputProps.value["aria-invalid"]).toBe(true);
    scope.stop();
  });

  it("opens with arrow keys and sets focus strategy", () => {
    const scope = effectScope();
    let inputProps!: ReturnType<typeof useComboBox>["inputProps"];
    let state!: ReturnType<typeof useComboBoxState>;
    scope.run(() => {
      state = useComboBoxState({
        collection: items,
      });
      inputProps = useComboBox(
        {
          inputRef: document.createElement("input"),
          listBoxRef: document.createElement("ul"),
          popoverRef: document.createElement("div"),
          "aria-label": "Animals",
        },
        state
      ).inputProps;
    });

    (
      inputProps.value.onKeydown as (event: KeyboardEvent) => void
    )({
      key: "ArrowDown",
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(state.isOpen.value).toBe(true);
    expect(state.focusStrategy.value).toBe("first");

    (
      inputProps.value.onKeydown as (event: KeyboardEvent) => void
    )({
      key: "ArrowUp",
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(state.focusStrategy.value).toBe("last");
    scope.stop();
  });

  it("commits focused item on Enter", () => {
    const scope = effectScope();
    let inputProps!: ReturnType<typeof useComboBox>["inputProps"];
    let state!: ReturnType<typeof useComboBoxState>;
    scope.run(() => {
      state = useComboBoxState({
        collection: items,
      });
      inputProps = useComboBox(
        {
          inputRef: document.createElement("input"),
          listBoxRef: document.createElement("ul"),
          popoverRef: document.createElement("div"),
          "aria-label": "Animals",
        },
        state
      ).inputProps;
    });

    state.open("first", "manual");
    state.setFocusedKey("two");

    (
      inputProps.value.onKeydown as (event: KeyboardEvent) => void
    )({
      key: "Enter",
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(state.selectedKey.value).toBe("two");
    expect(state.inputValue.value).toBe("Two");
    expect(state.isOpen.value).toBe(false);
    scope.stop();
  });

  it("button press toggles menu in manual mode and focuses input", () => {
    const input = document.createElement("input");
    document.body.appendChild(input);
    const scope = effectScope();
    let buttonProps!: ReturnType<typeof useComboBox>["buttonProps"];
    let state!: ReturnType<typeof useComboBoxState>;
    scope.run(() => {
      state = useComboBoxState({
        collection: items,
      });
      buttonProps = useComboBox(
        {
          inputRef: input,
          listBoxRef: document.createElement("ul"),
          popoverRef: document.createElement("div"),
          "aria-label": "Animals",
        },
        state
      ).buttonProps;
    });

    (
      buttonProps.value.onPressStart as (event: { pointerType: string }) => void
    )({
      pointerType: "mouse",
    });

    expect(document.activeElement).toBe(input);
    expect(state.isOpen.value).toBe(true);

    (
      buttonProps.value.onPressStart as (event: { pointerType: string }) => void
    )({
      pointerType: "mouse",
    });

    expect(state.isOpen.value).toBe(false);
    scope.stop();
    input.remove();
  });

  it("ignores blur when focus moves to the button or popover", () => {
    const button = document.createElement("button");
    const popover = document.createElement("div");
    const scope = effectScope();
    let inputProps!: ReturnType<typeof useComboBox>["inputProps"];
    let state!: ReturnType<typeof useComboBoxState>;
    scope.run(() => {
      state = useComboBoxState({
        collection: items,
      });
      inputProps = useComboBox(
        {
          inputRef: document.createElement("input"),
          listBoxRef: document.createElement("ul"),
          popoverRef: popover,
          buttonRef: button,
          "aria-label": "Animals",
        },
        state
      ).inputProps;
    });

    state.setFocused(true);

    (
      inputProps.value.onBlur as (event: FocusEvent) => void
    )({
      relatedTarget: button,
    } as unknown as FocusEvent);
    expect(state.isFocused.value).toBe(true);

    const child = document.createElement("div");
    popover.appendChild(child);
    (
      inputProps.value.onBlur as (event: FocusEvent) => void
    )({
      relatedTarget: child,
    } as unknown as FocusEvent);
    expect(state.isFocused.value).toBe(true);

    (
      inputProps.value.onBlur as (event: FocusEvent) => void
    )({
      relatedTarget: document.body,
    } as unknown as FocusEvent);
    expect(state.isFocused.value).toBe(false);
    scope.stop();
  });
});
