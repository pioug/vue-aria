import {
  type CalendarDate,
  isEqualDay,
  isSameDay,
  isToday,
} from "@internationalized/date";
import { useDateFormatter, useLocalizedStringFormatter } from "@vue-aria/i18n";
import { getInteractionModality, usePress } from "@vue-aria/interactions";
import {
  focusWithoutScrolling,
  getScrollParent,
  mergeProps,
  scrollIntoViewport,
  useDeepMemo,
  useDescription,
} from "@vue-aria/utils";
import type {
  CalendarState,
  RangeCalendarState,
} from "@vue-stately/calendar";
import { watchEffect } from "vue";
import { intlMessages } from "./intlMessages";
import { getEraFormat, hookData } from "./utils";

export interface AriaCalendarCellProps {
  date: CalendarDate;
  isDisabled?: boolean;
  isOutsideMonth?: boolean;
}

export interface CalendarCellAria {
  cellProps: Record<string, unknown>;
  buttonProps: Record<string, unknown>;
  isPressed: boolean;
  isSelected: boolean;
  isFocused: boolean;
  isDisabled: boolean;
  isUnavailable: boolean;
  isOutsideVisibleRange: boolean;
  isInvalid: boolean;
  formattedDate: string;
}

/**
 * Provides the behavior and accessibility implementation for a calendar cell component.
 */
export function useCalendarCell(
  props: AriaCalendarCellProps,
  state: CalendarState | RangeCalendarState,
  ref: { current: HTMLElement | null }
): CalendarCellAria {
  let { date, isDisabled } = props;
  const data = hookData.get(state);
  const errorMessageId = data?.errorMessageId;
  const selectedDateDescription = data?.selectedDateDescription ?? "";

  const stringFormatter = useLocalizedStringFormatter(
    intlMessages as any,
    "@react-aria/calendar"
  );

  const dateFormatter = useDateFormatter({
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    era: getEraFormat(date),
    timeZone: state.timeZone,
  });

  let isSelected = state.isSelected(date);
  const isFocused = state.isCellFocused(date) && !props.isOutsideMonth;
  isDisabled = Boolean(isDisabled || state.isCellDisabled(date));
  const isUnavailable = state.isCellUnavailable(date);
  const isSelectable = !isDisabled && !isUnavailable;

  const isInvalid =
    state.isValueInvalid
    && Boolean(
      "highlightedRange" in state
        ? !state.anchorDate
          && state.highlightedRange
          && date.compare(state.highlightedRange.start) >= 0
          && date.compare(state.highlightedRange.end) <= 0
        : state.value && isSameDay(state.value as any, date as any)
    );

  if (isInvalid) {
    isSelected = true;
  }

  date = useDeepMemo<CalendarDate>(date, isEqualDay);
  const nativeDate = (date as any).toDate(state.timeZone);

  const isDateToday = isToday(date as any, state.timeZone);
  let label = "";

  if (
    "highlightedRange" in state
    && state.value
    && !state.anchorDate
    && (isSameDay(date as any, state.value.start as any)
      || isSameDay(date as any, state.value.end as any))
  ) {
    label = `${selectedDateDescription}, `;
  }

  label += dateFormatter.format(nativeDate);

  if (isDateToday) {
    label = stringFormatter.format(isSelected ? "todayDateSelected" : "todayDate", {
      date: label,
    });
  } else if (isSelected) {
    label = stringFormatter.format("dateSelected", {
      date: label,
    });
  }

  if (state.minValue && isSameDay(date as any, state.minValue as any)) {
    label += `, ${stringFormatter.format("minimumDate")}`;
  } else if (state.maxValue && isSameDay(date as any, state.maxValue as any)) {
    label += `, ${stringFormatter.format("maximumDate")}`;
  }

  let rangeSelectionPrompt = "";
  if ("anchorDate" in state && isFocused && !state.isReadOnly && isSelectable) {
    if (state.anchorDate) {
      rangeSelectionPrompt = stringFormatter.format("finishRangeSelectionPrompt");
    } else {
      rangeSelectionPrompt = stringFormatter.format("startRangeSelectionPrompt");
    }
  }

  const { descriptionProps } = useDescription(rangeSelectionPrompt);

  let isAnchorPressed = false;
  let isRangeBoundaryPressed = false;
  let touchDragTimer: ReturnType<typeof setTimeout> | undefined;

  const { pressProps, isPressed } = usePress({
    shouldCancelOnPointerExit: "anchorDate" in state && Boolean(state.anchorDate),
    preventFocusOnPress: true,
    isDisabled: !isSelectable || state.isReadOnly,
    onPressStart(event) {
      if (state.isReadOnly) {
        state.setFocusedDate(date);
        state.setFocused(true);
        return;
      }

      if (
        "highlightedRange" in state
        && !state.anchorDate
        && (event.pointerType === "mouse" || event.pointerType === "touch")
      ) {
        if (state.highlightedRange && !isInvalid) {
          if (isSameDay(date as any, state.highlightedRange.start as any)) {
            state.setAnchorDate(state.highlightedRange.end);
            state.setFocusedDate(date);
            state.setFocused(true);
            state.setDragging(true);
            isRangeBoundaryPressed = true;
            return;
          }

          if (isSameDay(date as any, state.highlightedRange.end as any)) {
            state.setAnchorDate(state.highlightedRange.start);
            state.setFocusedDate(date);
            state.setFocused(true);
            state.setDragging(true);
            isRangeBoundaryPressed = true;
            return;
          }
        }

        const startDragging = () => {
          state.setDragging(true);
          touchDragTimer = undefined;
          state.selectDate(date);
          state.setFocusedDate(date);
          state.setFocused(true);
          isAnchorPressed = true;
        };

        if (event.pointerType === "touch") {
          touchDragTimer = setTimeout(startDragging, 200);
        } else {
          startDragging();
        }
      }
    },
    onPressEnd() {
      isRangeBoundaryPressed = false;
      isAnchorPressed = false;
      if (touchDragTimer) {
        clearTimeout(touchDragTimer);
      }
      touchDragTimer = undefined;
    },
    onPress() {
      if (!("anchorDate" in state) && !state.isReadOnly) {
        state.selectDate(date);
        state.setFocusedDate(date);
        state.setFocused(true);
      }
    },
    onPressUp(event) {
      if (state.isReadOnly) {
        return;
      }

      if ("anchorDate" in state && touchDragTimer) {
        state.selectDate(date);
        state.setFocusedDate(date);
        state.setFocused(true);
      }

      if ("anchorDate" in state) {
        if (isRangeBoundaryPressed) {
          state.setAnchorDate(date);
        } else if (state.anchorDate && !isAnchorPressed) {
          state.selectDate(date);
          state.setFocusedDate(date);
          state.setFocused(true);
        } else if (event.pointerType === "keyboard" && !state.anchorDate) {
          state.selectDate(date);
          let nextDay = date.add({ days: 1 });
          if (state.isInvalid(nextDay)) {
            nextDay = date.subtract({ days: 1 });
          }
          if (!state.isInvalid(nextDay)) {
            state.setFocusedDate(nextDay);
            state.setFocused(true);
          }
        } else if (event.pointerType === "virtual") {
          state.selectDate(date);
          state.setFocusedDate(date);
          state.setFocused(true);
        }
      }
    },
  });

  let tabIndex: number | undefined;
  if (!isDisabled) {
    tabIndex = isSameDay(date as any, state.focusedDate as any) ? 0 : -1;
  }

  watchEffect(() => {
    if (isFocused && ref.current) {
      focusWithoutScrolling(ref.current);

      if (
        getInteractionModality() !== "pointer"
        && document.activeElement === ref.current
      ) {
        scrollIntoViewport(ref.current, {
          containingElement: getScrollParent(ref.current),
        });
      }
    }
  });

  const cellDateFormatter = useDateFormatter({
    day: "numeric",
    timeZone: state.timeZone,
    calendar: date.calendar.identifier,
  });

  const formattedDate = cellDateFormatter
    .formatToParts(nativeDate)
    .find((part) => part.type === "day")?.value ?? "";

  return {
    cellProps: {
      role: "gridcell",
      "aria-disabled": !isSelectable || undefined,
      "aria-selected": isSelected || undefined,
      "aria-invalid": isInvalid || undefined,
    },
    buttonProps: mergeProps(pressProps as any, {
      onFocus() {
        if (!isDisabled) {
          state.setFocusedDate(date);
          state.setFocused(true);
        }
      },
      tabIndex,
      role: "button",
      "aria-disabled": !isSelectable || undefined,
      "aria-label": label,
      "aria-invalid": isInvalid || undefined,
      "aria-describedby": [
        isInvalid ? errorMessageId : undefined,
        (descriptionProps.value["aria-describedby"] as string | undefined),
      ]
        .filter(Boolean)
        .join(" ") || undefined,
      onPointerenter(event: PointerEvent) {
        if (
          "highlightDate" in state
          && (event.pointerType !== "touch" || state.isDragging)
          && isSelectable
        ) {
          state.highlightDate(date);
        }
      },
      onPointerdown(event: PointerEvent) {
        const target = event.target as {
          releasePointerCapture?: (pointerId: number) => void;
          hasPointerCapture?: (pointerId: number) => boolean;
        };

        if (!target.releasePointerCapture) {
          return;
        }

        if (target.hasPointerCapture) {
          if (target.hasPointerCapture(event.pointerId)) {
            target.releasePointerCapture(event.pointerId);
          }
        } else {
          target.releasePointerCapture(event.pointerId);
        }
      },
      onContextmenu(event: Event) {
        event.preventDefault();
      },
    }) as Record<string, unknown>,
    isPressed,
    isFocused,
    isSelected,
    isDisabled,
    isUnavailable,
    isOutsideVisibleRange:
      date.compare(state.visibleRange.start) < 0 || date.compare(state.visibleRange.end) > 0,
    isInvalid,
    formattedDate,
  };
}
