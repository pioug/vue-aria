import { computed, ref as vueRef } from "vue";
import type {
  DateValue,
  RangeCalendarProps,
  RangeCalendarState,
} from "@vue-stately/calendar";
import { nodeContains, useEvent } from "@vue-aria/utils";
import type { CalendarAria } from "./useCalendarBase";
import { useCalendarBase } from "./useCalendarBase";

export interface AriaRangeCalendarProps<T extends DateValue = DateValue>
  extends RangeCalendarProps<T> {
  id?: string;
  errorMessage?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-details"?: string;
  [key: string]: unknown;
}

/**
 * Provides the behavior and accessibility implementation for a range calendar component.
 */
export function useRangeCalendar<T extends DateValue>(
  props: AriaRangeCalendarProps<T>,
  state: RangeCalendarState,
  domRef: { current: HTMLElement | null }
): CalendarAria {
  const result = useCalendarBase(props, state);

  const isVirtualClick = vueRef(false);
  const windowRef = vueRef<EventTarget | null>(
    typeof window !== "undefined" ? window : null
  );

  useEvent(windowRef as any, "pointerdown", (event) => {
    const e = event as PointerEvent;
    isVirtualClick.value = e.width === 0 && e.height === 0;
  });

  const endDragging = (event: PointerEvent) => {
    if (isVirtualClick.value) {
      isVirtualClick.value = false;
      return;
    }

    state.setDragging(false);
    if (!state.anchorDate) {
      return;
    }

    const target = event.target as Element | null;
    if (
      domRef.current
      && nodeContains(domRef.current, document.activeElement)
      && target
      && (!nodeContains(domRef.current, target) || !target.closest("button, [role='button']"))
    ) {
      state.selectFocusedDate();
    }
  };

  useEvent(windowRef as any, "pointerup", endDragging as any);

  const originalOnBlur = result.calendarProps.onBlur as
    | ((event: FocusEvent) => void)
    | undefined;

  result.calendarProps.onBlur = (event: FocusEvent) => {
    originalOnBlur?.(event);
    if (!domRef.current) {
      return;
    }

    if (
      (!event.relatedTarget || !nodeContains(domRef.current, event.relatedTarget as Node | null))
      && state.anchorDate
    ) {
      state.selectFocusedDate();
    }
  };

  const bodyRef = computed(() => domRef.current as EventTarget | null);
  useEvent(
    bodyRef as any,
    "touchmove",
    (event) => {
      if (state.isDragging) {
        event.preventDefault();
      }
    },
    { passive: false, capture: true }
  );

  return result;
}
