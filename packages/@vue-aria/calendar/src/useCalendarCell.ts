import { computed, toValue, watchEffect } from "vue";
import { usePress } from "@vue-aria/interactions";
import { mergeProps, useDescription } from "@vue-aria/utils";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { CalendarDateLike, UseCalendarState } from "./types";
import { compareDates, hookData, isDateInRange, isSameDate } from "./utils";

export interface UseCalendarCellOptions {
  date: CalendarDateLike;
  isDisabled?: boolean;
  isOutsideMonth?: boolean;
}

export interface UseCalendarCellResult {
  cellProps: ReadonlyRef<Record<string, unknown>>;
  buttonProps: ReadonlyRef<Record<string, unknown>>;
  isPressed: ReadonlyRef<boolean>;
  isSelected: ReadonlyRef<boolean>;
  isFocused: ReadonlyRef<boolean>;
  isDisabled: ReadonlyRef<boolean>;
  isUnavailable: ReadonlyRef<boolean>;
  isOutsideVisibleRange: ReadonlyRef<boolean>;
  isInvalid: ReadonlyRef<boolean>;
  formattedDate: ReadonlyRef<string>;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | boolean | undefined): boolean {
  if (value === undefined) {
    return false;
  }
  return Boolean(typeof value === "boolean" ? value : toValue(value));
}

function dateLabel(date: CalendarDateLike): string {
  return date.toString();
}

function formatDay(date: CalendarDateLike): string {
  if (typeof date.day === "number") {
    return String(date.day);
  }

  const value = date.toString();
  const match = value.match(/(\d{1,2})(?!.*\d)/);
  if (match) {
    return match[1];
  }
  return value;
}

function resolveIsInvalid(options: {
  date: CalendarDateLike;
  state: UseCalendarState;
  isSelected: boolean;
}): boolean {
  const { date, state, isSelected } = options;
  const valueInvalid =
    state.isValueInvalid === undefined ? false : Boolean(toValue(state.isValueInvalid));
  if (!valueInvalid) {
    return false;
  }

  const anchorDate = state.anchorDate === undefined ? undefined : toValue(state.anchorDate);
  const highlighted =
    state.highlightedRange === undefined ? undefined : toValue(state.highlightedRange);
  if (highlighted && !anchorDate && isDateInRange(date, highlighted)) {
    return true;
  }

  return isSelected;
}

export function useCalendarCell(
  options: UseCalendarCellOptions,
  state: UseCalendarState,
  cellRef: MaybeReactive<HTMLElement | null | undefined>
): UseCalendarCellResult {
  const data = hookData.get(state as object);

  const isSelected = computed(() => state.isSelected(options.date));
  const isFocused = computed(
    () => state.isCellFocused(options.date) && !resolveBoolean(options.isOutsideMonth)
  );
  const isDisabled = computed(
    () => resolveBoolean(options.isDisabled) || state.isCellDisabled(options.date)
  );
  const isUnavailable = computed(() => state.isCellUnavailable(options.date));
  const isSelectable = computed(() => !isDisabled.value && !isUnavailable.value);

  const isInvalid = computed(() =>
    resolveIsInvalid({
      date: options.date,
      state,
      isSelected: isSelected.value,
    })
  );

  const rangeSelectionPrompt = computed(() => {
    const hasRangeBehavior = state.anchorDate !== undefined;
    if (!hasRangeBehavior || !isFocused.value || !isSelectable.value) {
      return "";
    }

    if (resolveBoolean(state.isReadOnly)) {
      return "";
    }

    const anchorDate = toValue(state.anchorDate);
    if (anchorDate) {
      return "Press to finish selecting range";
    }

    return "Press to start selecting range";
  });

  const description = useDescription(rangeSelectionPrompt);

  const { pressProps, isPressed } = usePress({
    isDisabled: computed(() => !isSelectable.value || resolveBoolean(state.isReadOnly)),
    onPressStart: (event) => {
      if (resolveBoolean(state.isReadOnly)) {
        state.setFocusedDate(options.date);
        state.setFocused(true);
        return;
      }

      if (state.setDragging && (event.pointerType === "mouse" || event.pointerType === "touch")) {
        state.setDragging(true);
      }
    },
    onPressEnd: () => {
      if (state.setDragging) {
        state.setDragging(false);
      }
    },
    onPress: () => {
      if (resolveBoolean(state.isReadOnly)) {
        return;
      }

      state.selectDate(options.date);
      state.setFocusedDate(options.date);
      state.setFocused(true);
    },
  });

  const tabIndex = computed<number | undefined>(() => {
    if (isDisabled.value) {
      return undefined;
    }

    const focusedDate = toValue(state.focusedDate);
    return isSameDate(options.date, focusedDate) ? 0 : -1;
  });

  watchEffect(() => {
    if (!isFocused.value) {
      return;
    }

    const element = toValue(cellRef);
    element?.focus();
  });

  const label = computed(() => {
    const base = dateLabel(options.date);
    if (isSelected.value) {
      return `Selected date, ${base}`;
    }
    return base;
  });

  const visibleRange = computed(() => toValue(state.visibleRange));
  const isOutsideVisibleRange = computed(() => {
    const range = visibleRange.value;
    return (
      compareDates(options.date, range.start) < 0 ||
      compareDates(options.date, range.end) > 0
    );
  });

  const ariaDescribedBy = computed(() => {
    const values = [
      isInvalid.value ? data?.errorMessageId : undefined,
      description.descriptionProps.value["aria-describedby"],
    ].filter(Boolean);

    return values.join(" ") || undefined;
  });

  const cellProps = computed<Record<string, unknown>>(() => ({
    role: "gridcell",
    "aria-disabled": !isSelectable.value || undefined,
    "aria-selected": isSelected.value || undefined,
    "aria-invalid": isInvalid.value || undefined,
  }));

  const buttonProps = computed<Record<string, unknown>>(() =>
    mergeProps(pressProps, {
      onFocus: () => {
        if (!isDisabled.value) {
          state.setFocusedDate(options.date);
          state.setFocused(true);
        }
      },
      tabIndex: tabIndex.value,
      role: "button",
      "aria-disabled": !isSelectable.value || undefined,
      "aria-label": label.value,
      "aria-invalid": isInvalid.value || undefined,
      "aria-describedby": ariaDescribedBy.value,
      onPointerenter: (event: PointerEvent) => {
        if (
          state.highlightDate &&
          (event.pointerType !== "touch" || resolveBoolean(state.isDragging)) &&
          isSelectable.value
        ) {
          state.highlightDate(options.date);
        }
      },
      onPointerdown: (event: PointerEvent) => {
        const target = event.target as {
          releasePointerCapture?: (pointerId: number) => void;
          hasPointerCapture?: (pointerId: number) => boolean;
        } | null;

        if (!target) {
          return;
        }

        if (typeof target.releasePointerCapture === "function") {
          if (
            typeof target.hasPointerCapture === "function" &&
            target.hasPointerCapture(event.pointerId)
          ) {
            target.releasePointerCapture(event.pointerId);
          }
        }
      },
      onContextmenu: (event: MouseEvent) => {
        event.preventDefault();
      },
    })
  );

  const formattedDate = computed(() => formatDay(options.date));

  return {
    cellProps,
    buttonProps,
    isPressed,
    isSelected,
    isFocused,
    isDisabled,
    isUnavailable,
    isOutsideVisibleRange,
    isInvalid,
    formattedDate,
  };
}
