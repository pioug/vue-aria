import { CalendarDate, createCalendar } from "@internationalized/date";
import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useDateFieldState } from "../src/useDateFieldState";

describe("useDateFieldState", () => {
  it("commits completed segment edits to a date value", () => {
    const onChange = vi.fn();
    const scope = effectScope();
    let state!: ReturnType<typeof useDateFieldState>;

    scope.run(() => {
      state = useDateFieldState({
        locale: "en-US",
        createCalendar,
        onChange,
      });
    });

    state.setSegment("month", 7);
    state.setSegment("day", 4);
    state.setSegment("year", 2025);

    expect(state.value?.toString()).toBe("2025-07-04");
    expect(onChange).toHaveBeenCalled();
    scope.stop();
  });

  it("keeps cleared segments as placeholders until a full value is committed", () => {
    const scope = effectScope();
    let state!: ReturnType<typeof useDateFieldState>;

    scope.run(() => {
      state = useDateFieldState({
        locale: "en-US",
        createCalendar,
        defaultValue: new CalendarDate(2024, 2, 10),
      });
    });

    state.clearSegment("day");

    const daySegment = state.segments.find((segment) => segment.type === "day");
    expect(daySegment?.isPlaceholder).toBe(true);
    expect(state.value?.toString()).toBe("2024-02-10");
    scope.stop();
  });

  it("adds unicode isolate literals around time segments", () => {
    const scope = effectScope();
    let state!: ReturnType<typeof useDateFieldState>;

    scope.run(() => {
      state = useDateFieldState({
        locale: "ar-EG",
        createCalendar,
        granularity: "minute",
      });
    });

    const literals = state.segments
      .filter((segment) => segment.type === "literal")
      .map((segment) => segment.text);
    expect(literals).toContain("\u2066");
    expect(literals).toContain("\u2069");
    scope.stop();
  });

  it("marks values outside min/max as invalid", () => {
    const scope = effectScope();
    let state!: ReturnType<typeof useDateFieldState>;

    scope.run(() => {
      state = useDateFieldState({
        locale: "en-US",
        createCalendar,
        defaultValue: new CalendarDate(2024, 1, 1),
        minValue: new CalendarDate(2024, 2, 1),
      });
    });

    expect(state.isInvalid).toBe(true);
    expect(state.validationState).toBe("invalid");
    scope.stop();
  });
});
