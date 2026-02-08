import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { hookData, roleSymbol, useDateField } from "../src/useDateField";
import type { DateFieldSegment, UseDateFieldState } from "../src/types";

interface DateFieldHandlers {
  onFocusin?: (event: FocusEvent) => void;
  onFocusout?: (event: FocusEvent) => void;
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

function createState(value = "2026-02-08"): UseDateFieldState & {
  valueRef: ReturnType<typeof ref<{ toString: () => string } | null>>;
  confirmPlaceholder: ReturnType<typeof vi.fn>;
  commitValidation: ReturnType<typeof vi.fn>;
} {
  const valueRef = ref<{ toString: () => string } | null>(createDateValue(value));
  const segments = ref<readonly DateFieldSegment[]>([
    {
      type: "month",
      text: "02",
      value: 2,
      minValue: 1,
      maxValue: 12,
      isEditable: true,
    },
  ]);
  const confirmPlaceholder = vi.fn();
  const commitValidation = vi.fn();

  return {
    value: valueRef,
    valueRef,
    defaultValue: ref(createDateValue(value)),
    dateValue: valueRef,
    maxGranularity: ref("day"),
    segments,
    isDisabled: ref(false),
    isReadOnly: ref(false),
    isRequired: ref(false),
    displayValidation: ref({
      isInvalid: false,
      validationErrors: [],
      validationDetails: null,
    }),
    confirmPlaceholder,
    commitValidation,
    setValue: vi.fn(),
  };
}

describe("useDateField", () => {
  it("returns group semantics and hidden input defaults", () => {
    const root = document.createElement("div");
    const firstSegment = document.createElement("div");
    firstSegment.tabIndex = 0;
    root.appendChild(firstSegment);
    document.body.appendChild(root);

    const state = createState();
    const { labelProps, fieldProps, inputProps } = useDateField(
      {
        label: "Date",
        name: "startDate",
      },
      state,
      root
    );

    expect(fieldProps.value.role).toBe("group");
    expect(inputProps.value.type).toBe("hidden");
    expect(inputProps.value.name).toBe("startDate");
    expect(inputProps.value.value).toBe("2026-02-08");

    const onClick = labelProps.value.onClick as (() => void) | undefined;
    onClick?.();
    expect(document.activeElement).toBe(firstSegment);
  });

  it("supports native validation behavior hidden text input mode", () => {
    const root = document.createElement("div");
    const state = createState();
    const { inputProps } = useDateField(
      {
        validationBehavior: "native",
        isRequired: true,
        "aria-label": "Date field",
      },
      state,
      root
    );

    expect(inputProps.value.type).toBe("text");
    expect(inputProps.value.hidden).toBe(true);
    expect(inputProps.value.required).toBe(true);
    expect(typeof inputProps.value.onChange).toBe("function");
  });

  it("confirms placeholders and commits validation on value change blur", () => {
    const root = document.createElement("div");
    const segment = document.createElement("div");
    root.appendChild(segment);
    document.body.appendChild(root);

    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const state = createState("2026-02-08");
    const { fieldProps } = useDateField(
      {
        onFocus,
        onBlur,
        "aria-label": "Date field",
      },
      state,
      root
    );
    const handlers = fieldProps.value as DateFieldHandlers;

    handlers.onFocusin?.(createFocusEvent("focus", segment, root));
    state.valueRef.value = createDateValue("2026-03-01");
    handlers.onFocusout?.(createFocusEvent("blur", segment, root));

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(state.confirmPlaceholder).toHaveBeenCalledTimes(1);
    expect(state.commitValidation).toHaveBeenCalledTimes(1);
  });

  it("supports presentation role passthrough", () => {
    const root = document.createElement("div");
    const state = createState();
    const { fieldProps } = useDateField(
      {
        [roleSymbol]: "presentation",
        "aria-label": "Date field",
      },
      state,
      root
    );

    expect(fieldProps.value.role).toBe("presentation");
  });

  it("stores segment hook data for date segments", () => {
    const root = document.createElement("div");
    const state = createState();
    const { labelProps } = useDateField(
      {
        label: "Date",
        "aria-label": "Start date",
      },
      state,
      root
    );

    const data = hookData.get(state as object);
    expect(data).toBeDefined();
    expect(data?.ariaLabel).toBe("Start date");
    expect(data?.ariaLabelledBy).toContain(labelProps.value.id as string);
    expect(typeof data?.focusManager.focusFirst).toBe("function");
  });
});
