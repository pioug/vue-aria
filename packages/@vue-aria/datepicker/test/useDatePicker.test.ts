import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { roleSymbol } from "@vue-aria/datefield";
import { privateValidationStateSymbol, useDatePicker } from "../src";
import type { UseDatePickerState } from "../src/types";

interface GroupHandlers {
  onFocusin?: (event: FocusEvent) => void;
  onFocusout?: (event: FocusEvent) => void;
  onKeydown?: (event: KeyboardEvent) => void;
}

function createDateValue(value: string): { toString: () => string } {
  return {
    toString: () => value,
  };
}

function createFocusEvent(
  type: "focus" | "blur",
  target: EventTarget | null,
  currentTarget: EventTarget | null,
  relatedTarget: EventTarget | null = null
): FocusEvent {
  const event = new FocusEvent(type, { bubbles: true, relatedTarget });
  Object.defineProperty(event, "target", { value: target });
  Object.defineProperty(event, "currentTarget", { value: currentTarget });
  return event;
}

function createState(): UseDatePickerState<{ toString: () => string }> & {
  setOpen: ReturnType<typeof vi.fn>;
  setValue: ReturnType<typeof vi.fn>;
  setDateValue: ReturnType<typeof vi.fn>;
} {
  return {
    value: ref(createDateValue("2026-02-08")),
    defaultValue: ref(createDateValue("2026-01-01")),
    dateValue: ref(createDateValue("2026-02-08")),
    isOpen: ref(false),
    isInvalid: ref(false),
    displayValidation: ref({
      isInvalid: false,
      validationErrors: [],
      validationDetails: null,
    }),
    setOpen: vi.fn(),
    setValue: vi.fn(),
    setDateValue: vi.fn(),
    formatValue: () => "February 2026",
  };
}

describe("useDatePicker", () => {
  it("returns group, field, button, and calendar semantics", () => {
    const root = document.createElement("div");
    const segment = document.createElement("div");
    segment.tabIndex = 0;
    root.appendChild(segment);
    document.body.appendChild(root);

    const state = createState();
    const onKeydown = vi.fn();
    const { groupProps, fieldProps, buttonProps, calendarProps } = useDatePicker(
      {
        label: "Date",
        onKeydown,
      },
      state,
      root
    );

    expect(groupProps.value.role).toBe("group");
    expect(fieldProps.value[roleSymbol]).toBe("presentation");
    expect(fieldProps.value[privateValidationStateSymbol]).toBe(state);
    expect(buttonProps.value["aria-haspopup"]).toBe("dialog");
    expect(
      (calendarProps.value.value as { toString: () => string } | undefined)?.toString()
    ).toBe("2026-02-08");

    (buttonProps.value.onPress as (() => void) | undefined)?.();
    expect(state.setOpen).toHaveBeenCalledWith(true);

    (groupProps.value as GroupHandlers).onKeydown?.(
      new KeyboardEvent("keydown", { key: "Enter" })
    );
    expect(onKeydown).toHaveBeenCalledTimes(1);
  });

  it("suppresses group keydown callbacks when the popover is open", () => {
    const root = document.createElement("div");
    const segment = document.createElement("div");
    segment.tabIndex = 0;
    root.appendChild(segment);
    document.body.appendChild(root);

    const state = createState();
    (state.isOpen as ReturnType<typeof ref<boolean>>).value = true;
    const onKeydown = vi.fn();

    const { groupProps } = useDatePicker(
      {
        label: "Date",
        onKeydown,
      },
      state,
      root
    );

    (groupProps.value as GroupHandlers).onKeydown?.(
      new KeyboardEvent("keydown", { key: "Enter" })
    );
    expect(onKeydown).toHaveBeenCalledTimes(0);
  });

  it("ignores blur when focus moves into the dialog", () => {
    const root = document.createElement("div");
    const segment = document.createElement("div");
    segment.tabIndex = 0;
    root.appendChild(segment);
    document.body.appendChild(root);

    const state = createState();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const onFocusChange = vi.fn();

    const { groupProps, dialogProps } = useDatePicker(
      {
        label: "Date",
        onFocus,
        onBlur,
        onFocusChange,
      },
      state,
      root
    );

    const handlers = groupProps.value as GroupHandlers;
    handlers.onFocusin?.(createFocusEvent("focus", segment, root));

    const dialog = document.createElement("div");
    dialog.id = dialogProps.value.id as string;
    const insideDialog = document.createElement("button");
    dialog.appendChild(insideDialog);
    document.body.appendChild(dialog);

    handlers.onFocusout?.(createFocusEvent("blur", segment, root, insideDialog));

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(0);
    expect(onFocusChange).toHaveBeenCalledWith(true);

    handlers.onFocusout?.(createFocusEvent("blur", segment, root, null));
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(onFocusChange).toHaveBeenCalledWith(false);
  });
});
