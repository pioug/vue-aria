import {
  DateFormatter,
  type CalendarDate,
  getWeeksInMonth,
  startOfWeek,
  today,
} from "@internationalized/date";
import { isRTL, useDateFormatter, useLocale } from "@vue-aria/i18n";
import { mergeProps, useLabels } from "@vue-aria/utils";
import type {
  CalendarState,
  FirstDayOfWeek,
  RangeCalendarState,
} from "@vue-stately/calendar";
import { hookData, useVisibleRangeDescription } from "./utils";

export interface AriaCalendarGridProps {
  startDate?: CalendarDate;
  endDate?: CalendarDate;
  weekdayStyle?: "narrow" | "short" | "long";
  firstDayOfWeek?: FirstDayOfWeek;
  locale?: string;
}

export interface CalendarGridAria {
  gridProps: Record<string, unknown>;
  headerProps: Record<string, unknown>;
  weekDays: string[];
  weeksInMonth: number;
}

/**
 * Provides the behavior and accessibility implementation for a calendar grid component.
 */
export function useCalendarGrid(
  props: AriaCalendarGridProps,
  state: CalendarState | RangeCalendarState
): CalendarGridAria {
  const {
    startDate = state.visibleRange.start,
    endDate = state.visibleRange.end,
    firstDayOfWeek,
    locale: localeOverride,
  } = props;

  const localeInfo = useLocale().value;
  const locale = localeOverride ?? localeInfo.locale;
  const direction = localeOverride
    ? (isRTL(locale) ? "rtl" : "ltr")
    : localeInfo.direction;

  const onKeydown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        state.selectFocusedDate();
        break;
      case "PageUp":
        event.preventDefault();
        event.stopPropagation();
        state.focusPreviousSection(event.shiftKey);
        break;
      case "PageDown":
        event.preventDefault();
        event.stopPropagation();
        state.focusNextSection(event.shiftKey);
        break;
      case "End":
        event.preventDefault();
        event.stopPropagation();
        state.focusSectionEnd();
        break;
      case "Home":
        event.preventDefault();
        event.stopPropagation();
        state.focusSectionStart();
        break;
      case "ArrowLeft":
        event.preventDefault();
        event.stopPropagation();
        if (direction === "rtl") {
          state.focusNextDay();
        } else {
          state.focusPreviousDay();
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        event.stopPropagation();
        state.focusPreviousRow();
        break;
      case "ArrowRight":
        event.preventDefault();
        event.stopPropagation();
        if (direction === "rtl") {
          state.focusPreviousDay();
        } else {
          state.focusNextDay();
        }
        break;
      case "ArrowDown":
        event.preventDefault();
        event.stopPropagation();
        state.focusNextRow();
        break;
      case "Escape":
        if ("setAnchorDate" in state) {
          event.preventDefault();
          state.setAnchorDate(null);
        }
        break;
      default:
        break;
    }
  };

  const visibleRangeDescription = useVisibleRangeDescription(
    startDate,
    endDate,
    state.timeZone,
    true
  );

  const data = hookData.get(state);

  const labelProps = useLabels({
    "aria-label": [data?.ariaLabel, visibleRangeDescription].filter(Boolean).join(", "),
    "aria-labelledby": data?.ariaLabelledBy,
  });

  const dayFormatter = localeOverride
    ? new DateFormatter(locale, {
      weekday: props.weekdayStyle || "narrow",
      timeZone: state.timeZone,
    })
    : useDateFormatter({
      weekday: props.weekdayStyle || "narrow",
      timeZone: state.timeZone,
    });

  const weekStart = startOfWeek(today(state.timeZone), locale, firstDayOfWeek);
  const weekDays = [...new Array(7).keys()].map((index) => {
    const date = weekStart.add({ days: index });
    return dayFormatter.format((date as any).toDate(state.timeZone));
  });

  const weeksInMonth = getWeeksInMonth(startDate as any, locale, firstDayOfWeek);

  return {
    gridProps: mergeProps(labelProps, {
      role: "grid",
      "aria-readonly": state.isReadOnly || undefined,
      "aria-disabled": state.isDisabled || undefined,
      "aria-multiselectable": ("highlightedRange" in state) || undefined,
      onKeydown,
      onFocus: () => state.setFocused(true),
      onBlur: () => state.setFocused(false),
    }) as unknown as Record<string, unknown>,
    headerProps: {
      "aria-hidden": true,
    },
    weekDays,
    weeksInMonth,
  };
}
