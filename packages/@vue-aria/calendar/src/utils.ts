import {
  type CalendarDate,
  DateFormatter,
  endOfMonth,
  isSameDay,
  startOfMonth,
} from "@internationalized/date";
import { useDateFormatter, useLocalizedStringFormatter } from "@vue-aria/i18n";
import type {
  CalendarState,
  RangeCalendarState,
} from "@vue-stately/calendar";
import type { LocalizedStringFormatter } from "@internationalized/string";
import { intlMessages } from "./intlMessages";

interface HookData {
  ariaLabel?: string;
  ariaLabelledBy?: string;
  errorMessageId?: string;
  selectedDateDescription: string;
}

export const hookData = new WeakMap<CalendarState | RangeCalendarState, HookData>();

export function getEraFormat(date: CalendarDate | undefined): "short" | undefined {
  return date?.calendar.identifier === "gregory" && date.era === "BC" ? "short" : undefined;
}

export function useSelectedDateDescription(
  state: CalendarState | RangeCalendarState
): string {
  const stringFormatter = useLocalizedStringFormatter(
    intlMessages as any,
    "@react-aria/calendar"
  );

  let start: CalendarDate | undefined;
  let end: CalendarDate | undefined;
  if ("highlightedRange" in state) {
    ({ start, end } = state.highlightedRange || {});
  } else {
    start = end = state.value ?? undefined;
  }

  const dateFormatter = useDateFormatter({
    weekday: "long",
    month: "long",
    year: "numeric",
    day: "numeric",
    era: getEraFormat(start) || getEraFormat(end),
    timeZone: state.timeZone,
  });

  const anchorDate = "anchorDate" in state ? state.anchorDate : null;

  if (!anchorDate && start && end) {
    if (isSameDay(start as any, end as any)) {
      const date = dateFormatter.format((start as any).toDate(state.timeZone));
      return stringFormatter.format("selectedDateDescription", { date });
    }

    const dateRange = formatRange(
      dateFormatter,
      stringFormatter,
      start,
      end,
      state.timeZone
    );

    return stringFormatter.format("selectedRangeDescription", { dateRange });
  }

  return "";
}

export function useVisibleRangeDescription(
  startDate: CalendarDate,
  endDate: CalendarDate,
  timeZone: string,
  isAria: boolean
): string {
  const stringFormatter = useLocalizedStringFormatter(
    intlMessages as any,
    "@react-aria/calendar"
  );
  const era = getEraFormat(startDate) || getEraFormat(endDate);

  const monthFormatter = useDateFormatter({
    month: "long",
    year: "numeric",
    era,
    calendar: startDate.calendar.identifier,
    timeZone,
  });

  const dateFormatter = useDateFormatter({
    month: "long",
    year: "numeric",
    day: "numeric",
    era,
    calendar: startDate.calendar.identifier,
    timeZone,
  });

  if (isSameDay(startDate as any, startOfMonth(startDate) as any)) {
    let startMonth = startDate;
    let endMonth = endDate;

    const formattableStart = (startDate.calendar as any).getFormattableMonth?.(startDate);
    const formattableEnd = (endDate.calendar as any).getFormattableMonth?.(endDate);
    if (formattableStart) {
      startMonth = formattableStart;
    }

    if (formattableEnd) {
      endMonth = formattableEnd;
    }

    if (isSameDay(endDate as any, endOfMonth(startDate) as any)) {
      return monthFormatter.format((startMonth as any).toDate(timeZone));
    }

    if (isSameDay(endDate as any, endOfMonth(endDate) as any)) {
      if (isAria) {
        return formatRange(monthFormatter, stringFormatter, startMonth, endMonth, timeZone);
      }

      return monthFormatter.formatRange(
        (startMonth as any).toDate(timeZone),
        (endMonth as any).toDate(timeZone)
      );
    }
  }

  if (isAria) {
    return formatRange(dateFormatter, stringFormatter, startDate, endDate, timeZone);
  }

  return dateFormatter.formatRange(
    (startDate as any).toDate(timeZone),
    (endDate as any).toDate(timeZone)
  );
}

function formatRange(
  dateFormatter: DateFormatter,
  stringFormatter: LocalizedStringFormatter,
  start: CalendarDate,
  end: CalendarDate,
  timeZone: string
): string {
  const parts = dateFormatter.formatRangeToParts(
    (start as any).toDate(timeZone),
    (end as any).toDate(timeZone)
  );

  let separatorIndex = -1;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.source === "shared" && part.type === "literal") {
      separatorIndex = i;
    } else if (part.source === "endRange") {
      break;
    }
  }

  let startValue = "";
  let endValue = "";
  for (let i = 0; i < parts.length; i++) {
    if (i < separatorIndex) {
      startValue += parts[i].value;
    } else if (i > separatorIndex) {
      endValue += parts[i].value;
    }
  }

  return stringFormatter.format("dateRange", {
    startDate: startValue,
    endDate: endValue,
  });
}
