import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { focusManagerSymbol, roleSymbol } from "@vue-aria/datefield";
import { privateValidationStateSymbol, useDateRangePicker } from "../src";
import type {
  DatePickerPrivateValidationState,
  DateRangeValue,
  UseDateRangePickerState,
} from "../src/types";

interface GroupHandlers {
  onKeydown?: (event: KeyboardEvent) => void;
}

function createDateValue(value: string): { toString: () => string } {
  return {
    toString: () => value,
  };
}

function createState(): UseDateRangePickerState<{ toString: () => string }> & {
  setOpen: ReturnType<typeof vi.fn>;
  setDateTime: ReturnType<typeof vi.fn>;
  setDateRange: ReturnType<typeof vi.fn>;
  updateValidation: ReturnType<typeof vi.fn>;
  resetValidation: ReturnType<typeof vi.fn>;
  commitValidation: ReturnType<typeof vi.fn>;
} {
  const value: DateRangeValue<{ toString: () => string }> = {
    start: createDateValue("2026-02-01"),
    end: createDateValue("2026-02-08"),
  };

  return {
    value: ref(value),
    defaultValue: ref(value),
    dateRange: ref(value),
    isOpen: ref(false),
    isInvalid: ref(false),
    realtimeValidation: {},
    displayValidation: ref({
      isInvalid: false,
      validationErrors: [],
      validationDetails: null,
    }),
    setOpen: vi.fn(),
    setDateTime: vi.fn(),
    setDateRange: vi.fn(),
    updateValidation: vi.fn(),
    resetValidation: vi.fn(),
    commitValidation: vi.fn(),
    formatValue: () => ({ start: "Feb 1", end: "Feb 8" }),
  };
}

describe("useDateRangePicker", () => {
  it("returns range field props and calendar trigger semantics", () => {
    const root = document.createElement("div");
    const first = document.createElement("div");
    const second = document.createElement("div");
    first.tabIndex = 0;
    second.tabIndex = 0;
    root.append(first, second);
    document.body.appendChild(root);

    const state = createState();
    const { groupProps, startFieldProps, endFieldProps, buttonProps } = useDateRangePicker(
      {
        label: "Date range",
      },
      state,
      root
    );

    expect(groupProps.value.role).toBe("group");
    expect(startFieldProps.value[roleSymbol]).toBe("presentation");
    expect(endFieldProps.value[roleSymbol]).toBe("presentation");
    expect(startFieldProps.value[focusManagerSymbol]).toBeDefined();
    expect(endFieldProps.value[focusManagerSymbol]).toBeDefined();

    (startFieldProps.value.onChange as ((value: unknown) => void) | undefined)?.(
      createDateValue("2026-02-02")
    );
    (endFieldProps.value.onChange as ((value: unknown) => void) | undefined)?.(
      createDateValue("2026-02-09")
    );

    const [firstPart, firstValue] = state.setDateTime.mock.calls[0] as [
      string,
      { toString: () => string } | undefined,
    ];
    const [secondPart, secondValue] = state.setDateTime.mock.calls[1] as [
      string,
      { toString: () => string } | undefined,
    ];

    expect(firstPart).toBe("start");
    expect(firstValue?.toString()).toBe("2026-02-02");
    expect(secondPart).toBe("end");
    expect(secondValue?.toString()).toBe("2026-02-09");

    (buttonProps.value.onPress as (() => void) | undefined)?.();
    expect(state.setOpen).toHaveBeenCalledWith(true);
  });

  it("merges start and end validation updates through private state", () => {
    const root = document.createElement("div");
    const first = document.createElement("div");
    const second = document.createElement("div");
    first.tabIndex = 0;
    second.tabIndex = 0;
    root.append(first, second);
    document.body.appendChild(root);

    const state = createState();
    const { startFieldProps, endFieldProps } = useDateRangePicker(
      {
        label: "Date range",
      },
      state,
      root
    );

    const startValidation = startFieldProps.value[
      privateValidationStateSymbol
    ] as DatePickerPrivateValidationState;
    const endValidation = endFieldProps.value[
      privateValidationStateSymbol
    ] as DatePickerPrivateValidationState;

    startValidation.updateValidation?.({
      isInvalid: true,
      validationErrors: ["Start invalid"],
      validationDetails: { start: true },
    });

    endValidation.updateValidation?.({
      isInvalid: true,
      validationErrors: ["End invalid"],
      validationDetails: { end: true },
    });

    expect(state.updateValidation).toHaveBeenNthCalledWith(1, {
      isInvalid: true,
      validationErrors: ["Start invalid"],
      validationDetails: { start: true },
    });

    expect(state.updateValidation).toHaveBeenNthCalledWith(2, {
      isInvalid: true,
      validationErrors: ["Start invalid", "End invalid"],
      validationDetails: { end: true },
    });
  });

  it("does not call key handlers when open", () => {
    const root = document.createElement("div");
    const first = document.createElement("div");
    const second = document.createElement("div");
    first.tabIndex = 0;
    second.tabIndex = 0;
    root.append(first, second);
    document.body.appendChild(root);

    const state = createState();
    (state.isOpen as ReturnType<typeof ref<boolean>>).value = true;
    const onKeydown = vi.fn();

    const { groupProps } = useDateRangePicker(
      {
        label: "Date range",
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
});
