import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { hookData } from "../src/useDateField";
import { useDateSegment } from "../src/useDateSegment";
import type { DateFieldSegment, FocusManager, UseDateSegmentState } from "../src/types";

interface SegmentHandlers {
  onBeforeinput?: (event: InputEvent) => void;
  onKeydown?: (event: KeyboardEvent) => void;
}

function createState(
  segments: DateFieldSegment[]
): UseDateSegmentState & {
  increment: ReturnType<typeof vi.fn>;
  decrement: ReturnType<typeof vi.fn>;
  incrementPage: ReturnType<typeof vi.fn>;
  decrementPage: ReturnType<typeof vi.fn>;
  incrementToMax: ReturnType<typeof vi.fn>;
  decrementToMin: ReturnType<typeof vi.fn>;
  clearSegment: ReturnType<typeof vi.fn>;
  setSegment: ReturnType<typeof vi.fn>;
  focusManager: FocusManager;
} {
  const focusManager = {
    focusFirst: vi.fn(() => true),
    focusNext: vi.fn(() => true),
    focusPrevious: vi.fn(() => true),
  };

  const state: UseDateSegmentState & {
    increment: ReturnType<typeof vi.fn>;
    decrement: ReturnType<typeof vi.fn>;
    incrementPage: ReturnType<typeof vi.fn>;
    decrementPage: ReturnType<typeof vi.fn>;
    incrementToMax: ReturnType<typeof vi.fn>;
    decrementToMin: ReturnType<typeof vi.fn>;
    clearSegment: ReturnType<typeof vi.fn>;
    setSegment: ReturnType<typeof vi.fn>;
    focusManager: FocusManager;
  } = {
    segments: ref(segments),
    isDisabled: ref(false),
    isReadOnly: ref(false),
    isRequired: ref(false),
    isInvalid: ref(false),
    validationState: ref(undefined),
    increment: vi.fn(),
    decrement: vi.fn(),
    incrementPage: vi.fn(),
    decrementPage: vi.fn(),
    incrementToMax: vi.fn(),
    decrementToMin: vi.fn(),
    clearSegment: vi.fn(),
    setSegment: vi.fn(),
    focusManager,
  };

  hookData.set(state as object, {
    ariaLabel: "Start date",
    ariaLabelledBy: "field-label-id",
    ariaDescribedBy: "field-description-id",
    focusManager,
  });

  return state;
}

describe("useDateSegment", () => {
  it("returns aria-hidden for literal segments", () => {
    const literal: DateFieldSegment = {
      type: "literal",
      text: "/",
      isEditable: false,
    };
    const state = createState([literal]);
    const { segmentProps } = useDateSegment(literal, state);

    expect(segmentProps.value["aria-hidden"]).toBe(true);
  });

  it("returns editable segment semantics", () => {
    const month: DateFieldSegment = {
      type: "month",
      text: "02",
      value: 2,
      minValue: 1,
      maxValue: 12,
      isEditable: true,
    };
    const state = createState([month]);
    const { segmentProps } = useDateSegment(month, state);

    expect(segmentProps.value.contentEditable).toBe(true);
    expect(segmentProps.value.tabIndex).toBe(0);
    expect(segmentProps.value.inputMode).toBe("numeric");
    expect(segmentProps.value["aria-label"]).toContain("month");
    expect(segmentProps.value["aria-labelledby"]).toBe("field-label-id");
  });

  it("handles numeric beforeinput and advances focus on completed segment", () => {
    const month: DateFieldSegment = {
      type: "month",
      text: "",
      value: 0,
      minValue: 1,
      maxValue: 12,
      isEditable: true,
    };
    const state = createState([month]);
    const { segmentProps } = useDateSegment(month, state);
    const handlers = segmentProps.value as SegmentHandlers;

    handlers.onBeforeinput?.({
      preventDefault: vi.fn(),
      inputType: "insertText",
      data: "1",
    } as unknown as InputEvent);

    handlers.onBeforeinput?.({
      preventDefault: vi.fn(),
      inputType: "insertText",
      data: "3",
    } as unknown as InputEvent);

    expect(state.setSegment).toHaveBeenNthCalledWith(1, "month", 1);
    expect(state.setSegment).toHaveBeenNthCalledWith(2, "month", 3);
    expect(state.focusManager.focusNext).toHaveBeenCalledTimes(1);
  });

  it("handles backspace/delete segment clearing", () => {
    const day: DateFieldSegment = {
      type: "day",
      text: "8",
      value: 8,
      minValue: 1,
      maxValue: 31,
      isEditable: true,
    };
    const state = createState([day]);
    const { segmentProps } = useDateSegment(day, state);
    const handlers = segmentProps.value as SegmentHandlers;

    handlers.onKeydown?.(
      {
        key: "Backspace",
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as KeyboardEvent
    );

    expect(state.clearSegment).toHaveBeenCalledWith("day");
  });

  it("routes arrow keys through spinbutton increment/decrement handlers", () => {
    const day: DateFieldSegment = {
      type: "day",
      text: "8",
      value: 8,
      minValue: 1,
      maxValue: 31,
      isEditable: true,
    };
    const state = createState([day]);
    const { segmentProps } = useDateSegment(day, state);
    const handlers = segmentProps.value as SegmentHandlers;

    handlers.onKeydown?.(
      new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, cancelable: true })
    );
    handlers.onKeydown?.(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true })
    );

    expect(state.increment).toHaveBeenCalledWith("day");
    expect(state.decrement).toHaveBeenCalledWith("day");
  });

  it("only applies aria-describedby on first segment unless invalid", () => {
    const month: DateFieldSegment = {
      type: "month",
      text: "02",
      value: 2,
      minValue: 1,
      maxValue: 12,
      isEditable: true,
    };
    const day: DateFieldSegment = {
      type: "day",
      text: "08",
      value: 8,
      minValue: 1,
      maxValue: 31,
      isEditable: true,
    };
    const state = createState([month, day]);
    const { segmentProps } = useDateSegment(day, state);

    expect(segmentProps.value["aria-describedby"]).toBeUndefined();

    (state.isInvalid as ReturnType<typeof ref<boolean>>).value = true;
    expect(segmentProps.value["aria-describedby"]).toBe("field-description-id");
  });
});
