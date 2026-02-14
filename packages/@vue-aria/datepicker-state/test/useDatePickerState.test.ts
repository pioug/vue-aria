import { CalendarDate, Time } from "@internationalized/date";
import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { useDatePickerState } from "../src/useDatePickerState";
import { useDateRangePickerState } from "../src/useDateRangePickerState";

describe("useDatePickerState", () => {
  it("commits date values and closes the overlay by default", () => {
    const scope = effectScope();
    let state!: ReturnType<typeof useDatePickerState>;

    scope.run(() => {
      state = useDatePickerState({
        defaultOpen: true,
      });
    });

    state.setDateValue(new CalendarDate(2024, 2, 20));

    expect(state.value?.toString()).toBe("2024-02-20");
    expect(state.isOpen).toBe(false);

    scope.stop();
  });

  it("stores partial date and time values before commit when time is enabled", () => {
    const scope = effectScope();
    let state!: ReturnType<typeof useDatePickerState>;

    scope.run(() => {
      state = useDatePickerState({
        granularity: "minute",
        shouldCloseOnSelect: false,
      });
    });

    state.setDateValue(new CalendarDate(2024, 7, 4));

    expect(state.value).toBeNull();
    expect(state.dateValue?.toString()).toBe("2024-07-04");

    state.setTimeValue(new Time(9, 30));

    expect(state.value?.toString()).toBe("2024-07-04T09:30:00");
    expect(state.dateValue).toBeNull();
    expect(state.timeValue).toBeNull();

    scope.stop();
  });
});

describe("useDateRangePickerState", () => {
  it("commits complete date ranges without time granularity", () => {
    const scope = effectScope();
    let state!: ReturnType<typeof useDateRangePickerState>;

    scope.run(() => {
      state = useDateRangePickerState({
        defaultOpen: true,
      });
    });

    state.setDateRange({
      start: new CalendarDate(2024, 5, 1),
      end: new CalendarDate(2024, 5, 8),
    });

    expect(state.value.start?.toString()).toBe("2024-05-01");
    expect(state.value.end?.toString()).toBe("2024-05-08");
    expect(state.isOpen).toBe(false);

    scope.stop();
  });

  it("waits for a time range before committing when time granularity is enabled", () => {
    const scope = effectScope();
    let state!: ReturnType<typeof useDateRangePickerState>;

    scope.run(() => {
      state = useDateRangePickerState({
        granularity: "minute",
        shouldCloseOnSelect: false,
      });
    });

    state.setDateRange({
      start: new CalendarDate(2024, 8, 10),
      end: new CalendarDate(2024, 8, 12),
    });

    expect(state.value.start).toBeNull();
    expect(state.value.end).toBeNull();

    state.setTimeRange({
      start: new Time(8, 15),
      end: new Time(17, 45),
    });

    expect(state.value.start?.toString()).toBe("2024-08-10T08:15:00");
    expect(state.value.end?.toString()).toBe("2024-08-12T17:45:00");

    scope.stop();
  });

  it("marks reversed ranges as invalid", () => {
    const scope = effectScope();
    let state!: ReturnType<typeof useDateRangePickerState>;

    scope.run(() => {
      state = useDateRangePickerState({
        defaultValue: {
          start: new CalendarDate(2024, 9, 20),
          end: new CalendarDate(2024, 9, 10),
        },
      });
    });

    expect(state.isInvalid).toBe(true);

    scope.stop();
  });
});
