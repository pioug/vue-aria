import { CalendarDate, createCalendar } from "@internationalized/date";
import { effectScope, nextTick } from "vue";
import { describe, expect, it } from "vitest";
import { useRangeCalendarState } from "@vue-aria/calendar-state";
import { useRangeCalendar } from "../src/useRangeCalendar";

async function flush() {
  await nextTick();
  await nextTick();
}

function createPointerEvent(
  type: "pointerdown" | "pointerup",
  init: { pointerType?: string; width?: number; height?: number } = {}
): PointerEvent {
  if (typeof PointerEvent !== "undefined") {
    return new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      pointerType: init.pointerType ?? "mouse",
      width: init.width ?? 1,
      height: init.height ?? 1,
    });
  }

  const event = new Event(type, {
    bubbles: true,
    cancelable: true,
  }) as PointerEvent;

  Object.defineProperties(event, {
    pointerType: { value: init.pointerType ?? "mouse" },
    width: { value: init.width ?? 1 },
    height: { value: init.height ?? 1 },
  });

  return event;
}

describe("useRangeCalendar", () => {
  it("commits anchor selection when calendar blurs", () => {
    const scope = effectScope();
    let state!: ReturnType<typeof useRangeCalendarState>;
    let aria!: ReturnType<typeof useRangeCalendar>;

    const root = document.createElement("div");
    document.body.appendChild(root);

    scope.run(() => {
      state = useRangeCalendarState({
        locale: "en-US",
        createCalendar,
        defaultFocusedValue: new CalendarDate(2024, 5, 10),
      });

      state.selectDate(new CalendarDate(2024, 5, 10));
      aria = useRangeCalendar({ "aria-label": "Trip dates" }, state, {
        current: root,
      });
    });

    expect(state.anchorDate?.toString()).toBe("2024-05-10");

    const onBlur = aria.calendarProps.onBlur as ((event: FocusEvent) => void) | undefined;
    onBlur?.({ relatedTarget: null } as FocusEvent);

    const value = state.value as any;
    expect(state.anchorDate).toBeNull();
    expect(value?.start.toString()).toBe("2024-05-10");
    expect(value?.end.toString()).toBe("2024-05-10");

    scope.stop();
    root.remove();
  });

  it("commits dragged selection when pointerup happens outside calendar buttons", async () => {
    const scope = effectScope();
    const root = document.createElement("div");
    const insideButton = document.createElement("button");
    root.appendChild(insideButton);

    const outside = document.createElement("div");
    document.body.appendChild(root);
    document.body.appendChild(outside);

    let state!: ReturnType<typeof useRangeCalendarState>;

    scope.run(() => {
      state = useRangeCalendarState({
        locale: "en-US",
        createCalendar,
        defaultFocusedValue: new CalendarDate(2024, 5, 10),
      });

      state.selectDate(new CalendarDate(2024, 5, 10));
      state.highlightDate(new CalendarDate(2024, 5, 12));
      state.setDragging(true);

      useRangeCalendar({ "aria-label": "Trip dates" }, state, {
        current: root,
      });
    });

    await flush();
    insideButton.focus();
    outside.dispatchEvent(createPointerEvent("pointerup"));

    const value = state.value as any;
    expect(state.isDragging).toBe(false);
    expect(state.anchorDate).toBeNull();
    expect(value?.start.toString()).toBe("2024-05-10");
    expect(value?.end.toString()).toBe("2024-05-12");

    scope.stop();
    root.remove();
    outside.remove();
  });

  it("ignores virtual click pointerups while dragging range selection", async () => {
    const scope = effectScope();
    const root = document.createElement("div");
    const insideButton = document.createElement("button");
    root.appendChild(insideButton);

    const outside = document.createElement("div");
    document.body.appendChild(root);
    document.body.appendChild(outside);

    let state!: ReturnType<typeof useRangeCalendarState>;

    scope.run(() => {
      state = useRangeCalendarState({
        locale: "en-US",
        createCalendar,
        defaultFocusedValue: new CalendarDate(2024, 5, 10),
      });

      state.selectDate(new CalendarDate(2024, 5, 10));
      state.highlightDate(new CalendarDate(2024, 5, 12));
      state.setDragging(true);

      useRangeCalendar({ "aria-label": "Trip dates" }, state, {
        current: root,
      });
    });

    await flush();
    insideButton.focus();
    outside.dispatchEvent(createPointerEvent("pointerdown", { width: 0, height: 0 }));
    outside.dispatchEvent(createPointerEvent("pointerup", { width: 0, height: 0 }));

    expect(state.anchorDate?.toString()).toBe("2024-05-10");
    expect(state.value).toBeNull();
    expect(state.isDragging).toBe(true);

    scope.stop();
    root.remove();
    outside.remove();
  });

  it("prevents touch scrolling while actively dragging", async () => {
    const scope = effectScope();
    const root = document.createElement("div");
    document.body.appendChild(root);

    let state!: ReturnType<typeof useRangeCalendarState>;

    scope.run(() => {
      state = useRangeCalendarState({
        locale: "en-US",
        createCalendar,
        defaultFocusedValue: new CalendarDate(2024, 5, 10),
      });

      useRangeCalendar({ "aria-label": "Trip dates" }, state, {
        current: root,
      });
    });

    await flush();
    state.setDragging(true);

    const draggingMove = new Event("touchmove", { bubbles: true, cancelable: true });
    root.dispatchEvent(draggingMove);
    expect(draggingMove.defaultPrevented).toBe(true);

    state.setDragging(false);
    const idleMove = new Event("touchmove", { bubbles: true, cancelable: true });
    root.dispatchEvent(idleMove);
    expect(idleMove.defaultPrevented).toBe(false);

    scope.stop();
    root.remove();
  });
});
