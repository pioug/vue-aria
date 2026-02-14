import { CalendarDateTime } from "@internationalized/date";
import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useTimeFieldState } from "../src/useTimeFieldState";

describe("useTimeFieldState", () => {
  it("emits plain Time values when no date context is present", () => {
    const onChange = vi.fn();
    const scope = effectScope();
    let state!: ReturnType<typeof useTimeFieldState>;

    scope.run(() => {
      state = useTimeFieldState({
        locale: "en-US",
        granularity: "minute",
        onChange,
      });
    });

    state.setSegment("hour", 9);
    state.setSegment("minute", 30);

    const emitted = onChange.mock.lastCall?.[0] as any;
    expect(emitted?.toString()).toBe("09:30:00");
    expect("day" in emitted).toBe(false);
    expect(state.timeValue?.toString()).toBe("09:30:00");
    scope.stop();
  });

  it("preserves day information when default value includes a date", () => {
    const onChange = vi.fn();
    const scope = effectScope();
    let state!: ReturnType<typeof useTimeFieldState>;

    scope.run(() => {
      state = useTimeFieldState({
        locale: "en-US",
        granularity: "minute",
        defaultValue: new CalendarDateTime(2024, 4, 10, 8, 0),
        onChange,
      });
    });

    state.setSegment("minute", 45);

    const emitted = onChange.mock.lastCall?.[0] as any;
    expect(emitted?.toString()).toBe("2024-04-10T08:45:00");
    expect(state.timeValue?.toString()).toBe("08:45:00");
    scope.stop();
  });
});
