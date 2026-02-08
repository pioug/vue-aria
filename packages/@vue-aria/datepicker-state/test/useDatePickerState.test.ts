import { describe, expect, it } from "vitest";
import { parseDate, parseTime } from "@internationalized/date";
import { ref } from "vue";
import { useDatePickerState } from "../src";
import type { DateValue } from "@vue-aria/calendar-state";

describe("useDatePickerState", () => {
  it("supports uncontrolled date-only selection", () => {
    const state = useDatePickerState({
      defaultOpen: true,
    });

    state.setDateValue(parseDate("2026-02-08") as unknown as DateValue);

    expect(state.value.value?.toString()).toBe("2026-02-08");
    expect(state.isOpen.value).toBe(false);
  });

  it("supports controlled values", () => {
    const controlled = ref<DateValue | null>(
      parseDate("2026-02-01") as unknown as DateValue
    );
    const state = useDatePickerState({
      value: controlled,
      onChange: (nextValue) => {
        controlled.value = nextValue;
      },
    });

    state.setDateValue(parseDate("2026-02-05") as unknown as DateValue);

    expect(controlled.value?.toString()).toBe("2026-02-05");
    expect(state.value.value?.toString()).toBe("2026-02-05");
  });

  it("keeps partial date selection until time is selected", () => {
    const state = useDatePickerState({
      granularity: "minute",
      shouldCloseOnSelect: false,
    });

    state.setDateValue(parseDate("2026-02-08") as unknown as DateValue);
    expect(state.value.value).toBeNull();
    expect(state.dateValue.value?.toString()).toBe("2026-02-08");

    state.setTimeValue(parseTime("10:45:00"));
    expect(state.value.value?.toString()).toContain("2026-02-08");
    expect(state.value.value?.toString()).toContain("10:45");
  });

  it("commits selected date with placeholder time when popover closes", () => {
    const state = useDatePickerState({
      granularity: "minute",
      shouldCloseOnSelect: false,
    });

    state.setDateValue(parseDate("2026-02-08") as unknown as DateValue);
    state.setOpen(false);

    expect(state.value.value?.toString()).toContain("2026-02-08");
    expect(state.value.value?.toString()).toContain("00:00");
  });

  it("reports invalid when current value is out of bounds", () => {
    const state = useDatePickerState({
      defaultValue: parseDate("2026-02-08") as unknown as DateValue,
      minValue: parseDate("2026-02-10") as unknown as DateValue,
    });

    expect(state.isInvalid.value).toBe(true);
    expect(state.validationState.value).toBe("invalid");
    expect(state.displayValidation.value.isInvalid).toBe(true);
  });

  it("formats values using Intl date formatting", () => {
    const state = useDatePickerState({
      defaultValue: parseDate("2026-02-08") as unknown as DateValue,
    });

    const formatted = state.formatValue("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    expect(formatted).toContain("2026");
    expect(formatted.length).toBeGreaterThan(0);
  });
});
