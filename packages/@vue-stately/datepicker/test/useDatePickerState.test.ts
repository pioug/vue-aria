import { CalendarDate, Time } from "@internationalized/date";
import { effectScope, nextTick, ref } from "vue";
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

  it("syncs uncontrolled value when defaultValue changes", async () => {
    const scope = effectScope();
    let state!: ReturnType<typeof useDatePickerState>;
    const defaultValue = ref<CalendarDate | null>(new CalendarDate(2024, 3, 1));

    scope.run(() => {
      state = useDatePickerState({
        get defaultValue() {
          return defaultValue.value;
        },
      } as any);
    });

    expect(state.value?.toString()).toBe("2024-03-01");

    defaultValue.value = new CalendarDate(2024, 3, 10);
    await nextTick();

    expect(state.value?.toString()).toBe("2024-03-10");

    scope.stop();
  });

  it("does not override controlled value when defaultValue changes", async () => {
    const scope = effectScope();
    let state!: ReturnType<typeof useDatePickerState>;
    const value = ref<CalendarDate | null>(new CalendarDate(2024, 4, 2));
    const defaultValue = ref<CalendarDate | null>(new CalendarDate(2024, 4, 1));

    scope.run(() => {
      state = useDatePickerState({
        get value() {
          return value.value;
        },
        get defaultValue() {
          return defaultValue.value;
        },
      } as any);
    });

    expect(state.value?.toString()).toBe("2024-04-02");

    defaultValue.value = new CalendarDate(2024, 4, 10);
    await nextTick();

    expect(state.value?.toString()).toBe("2024-04-02");

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

  it("syncs uncontrolled range when defaultValue changes", async () => {
    const scope = effectScope();
    let state!: ReturnType<typeof useDateRangePickerState>;
    const defaultValue = ref({
      start: new CalendarDate(2024, 9, 1),
      end: new CalendarDate(2024, 9, 5),
    });

    scope.run(() => {
      state = useDateRangePickerState({
        get defaultValue() {
          return defaultValue.value;
        },
      } as any);
    });

    expect(state.value.start?.toString()).toBe("2024-09-01");
    expect(state.value.end?.toString()).toBe("2024-09-05");

    defaultValue.value = {
      start: new CalendarDate(2024, 9, 10),
      end: new CalendarDate(2024, 9, 15),
    };
    await nextTick();

    expect(state.value.start?.toString()).toBe("2024-09-10");
    expect(state.value.end?.toString()).toBe("2024-09-15");

    scope.stop();
  });

  it("does not override controlled range when defaultValue changes", async () => {
    const scope = effectScope();
    let state!: ReturnType<typeof useDateRangePickerState>;
    const value = ref({
      start: new CalendarDate(2024, 10, 2),
      end: new CalendarDate(2024, 10, 4),
    });
    const defaultValue = ref({
      start: new CalendarDate(2024, 10, 1),
      end: new CalendarDate(2024, 10, 3),
    });

    scope.run(() => {
      state = useDateRangePickerState({
        get value() {
          return value.value;
        },
        get defaultValue() {
          return defaultValue.value;
        },
      } as any);
    });

    expect(state.value.start?.toString()).toBe("2024-10-02");
    expect(state.value.end?.toString()).toBe("2024-10-04");

    defaultValue.value = {
      start: new CalendarDate(2024, 10, 10),
      end: new CalendarDate(2024, 10, 12),
    };
    await nextTick();

    expect(state.value.start?.toString()).toBe("2024-10-02");
    expect(state.value.end?.toString()).toBe("2024-10-04");

    scope.stop();
  });
});
