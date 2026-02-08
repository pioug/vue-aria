import { computed, toValue } from "vue";
import { mergeProps } from "@vue-aria/utils";
import { useCalendarBase } from "./useCalendarBase";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { UseCalendarBaseResult } from "./useCalendarBase";
import type { UseCalendarBaseOptions, UseRangeCalendarState } from "./types";

function nodeContains(parent: Element | null | undefined, target: EventTarget | null): boolean {
  return target instanceof Node ? Boolean(parent?.contains(target)) : false;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }
  return Boolean(toValue(value));
}

export interface UseRangeCalendarResult extends UseCalendarBaseResult {
  calendarProps: ReadonlyRef<Record<string, unknown>>;
}

export function useRangeCalendar(
  options: UseCalendarBaseOptions,
  state: UseRangeCalendarState,
  calendarRef: MaybeReactive<Element | null | undefined>
): UseRangeCalendarResult {
  const base = useCalendarBase(options, state);

  const calendarProps = computed<Record<string, unknown>>(() =>
    mergeProps(base.calendarProps.value, {
      onBlur: (event: FocusEvent) => {
        const root = toValue(calendarRef);
        const anchorDate = state.anchorDate === undefined ? undefined : toValue(state.anchorDate);

        if (!anchorDate || !root) {
          return;
        }

        if (!event.relatedTarget || !nodeContains(root, event.relatedTarget)) {
          state.selectFocusedDate?.();
        }
      },
      onPointerup: () => {
        if (!state.setDragging) {
          return;
        }

        state.setDragging(false);
      },
      onTouchmove: (event: TouchEvent) => {
        if (resolveBoolean(state.isDragging)) {
          event.preventDefault();
        }
      },
    })
  );

  return {
    ...base,
    calendarProps,
  };
}
