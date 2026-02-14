import { CalendarDate, toCalendar } from "@internationalized/date";
import { NumberParser } from "@internationalized/number";
import {
  getScrollParent,
  isIOS,
  isMac,
  mergeProps,
  nodeContains,
  scrollIntoViewport,
  useEvent,
  useId,
  useLabels,
  useLayoutEffect,
} from "@vue-aria/utils";
import { ref as vueRef } from "vue";
import { useDateFormatter, useFilter, useLocale } from "@vue-aria/i18n";
import { useDisplayNames } from "./useDisplayNames";
import { hookData } from "./useDateField";
import { useSpinButton } from "@vue-aria/spinbutton";
import type { DateFieldState, DateSegment } from "@vue-aria/datepicker-state";
import type { RefObject } from "./types";

export interface DateSegmentAria {
  segmentProps: Record<string, unknown>;
}

/**
 * Provides behavior and accessibility implementation for a date field segment.
 */
export function useDateSegment(
  segment: DateSegment,
  state: DateFieldState,
  ref: RefObject<HTMLElement>
): DateSegmentAria {
  const enteredKeys = vueRef("");
  const locale = useLocale();
  const displayNames = useDisplayNames();
  const hookDataValue = hookData.get(state);

  const ariaLabel = hookDataValue?.ariaLabel;
  const ariaLabelledBy = hookDataValue?.ariaLabelledBy;
  let ariaDescribedBy = hookDataValue?.ariaDescribedBy;
  const focusManager = hookDataValue?.focusManager ?? {
    focusNext: () => null,
    focusPrevious: () => null,
    focusFirst: () => null,
    focusLast: () => null,
  };

  let textValue = segment.isPlaceholder ? "" : segment.text;
  const options = state.dateFormatter.resolvedOptions();
  const monthDateFormatter = useDateFormatter({
    month: "long",
    timeZone: options.timeZone,
  });
  const hourDateFormatter = useDateFormatter({
    hour: "numeric",
    hour12: options.hour12,
    timeZone: options.timeZone,
  });

  if (segment.type === "month" && !segment.isPlaceholder) {
    const monthTextValue = monthDateFormatter.format(state.dateValue);
    textValue =
      monthTextValue !== textValue
        ? `${textValue} - ${monthTextValue}`
        : monthTextValue;
  } else if (segment.type === "hour" && !segment.isPlaceholder) {
    textValue = hourDateFormatter.format(state.dateValue);
  }

  const { spinButtonProps } = useSpinButton({
    value: segment.value ?? undefined,
    textValue,
    minValue: segment.minValue,
    maxValue: segment.maxValue,
    isDisabled: state.isDisabled,
    isReadOnly: state.isReadOnly || !segment.isEditable,
    isRequired: state.isRequired,
    onIncrement: () => {
      enteredKeys.value = "";
      state.increment(segment.type);
    },
    onDecrement: () => {
      enteredKeys.value = "";
      state.decrement(segment.type);
    },
    onIncrementPage: () => {
      enteredKeys.value = "";
      state.incrementPage(segment.type);
    },
    onDecrementPage: () => {
      enteredKeys.value = "";
      state.decrementPage(segment.type);
    },
    onIncrementToMax: () => {
      enteredKeys.value = "";
      state.incrementToMax(segment.type);
    },
    onDecrementToMin: () => {
      enteredKeys.value = "";
      state.decrementToMin(segment.type);
    },
  });

  const parser = new NumberParser(locale.value.locale, {
    maximumFractionDigits: 0,
  });

  const backspace = () => {
    if (segment.text === segment.placeholder) {
      focusManager.focusPrevious();
    }

    if (
      parser.isValidPartialNumber(segment.text)
      && !state.isReadOnly
      && !segment.isPlaceholder
    ) {
      let newValue = segment.text.slice(0, -1);
      const parsed = parser.parse(newValue);
      newValue = parsed === 0 ? "" : newValue;
      if (newValue.length === 0 || parsed === 0) {
        state.clearSegment(segment.type);
      } else {
        state.setSegment(segment.type as any, parsed);
      }
      enteredKeys.value = newValue;
    } else if (segment.type === "dayPeriod" || segment.type === "era") {
      state.clearSegment(segment.type);
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "a" && (isMac() ? event.metaKey : event.ctrlKey)) {
      event.preventDefault();
    }

    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return;
    }

    switch (event.key) {
      case "Backspace":
      case "Delete":
        event.preventDefault();
        event.stopPropagation();
        backspace();
        break;
    }
  };

  const { startsWith } = useFilter({ sensitivity: "base" });
  const amPmFormatter = useDateFormatter({ hour: "numeric", hour12: true });
  const am = (() => {
    const date = new Date();
    date.setHours(0);
    return (
      amPmFormatter
        .formatToParts(date)
        .find((part) => part.type === "dayPeriod")?.value || "AM"
    );
  })();
  const pm = (() => {
    const date = new Date();
    date.setHours(12);
    return (
      amPmFormatter
        .formatToParts(date)
        .find((part) => part.type === "dayPeriod")?.value || "PM"
    );
  })();

  const eraFormatter = useDateFormatter({
    year: "numeric",
    era: "narrow",
    timeZone: "UTC",
  });
  const eras =
    segment.type !== "era"
      ? []
      : (() => {
        const date = toCalendar(new CalendarDate(1, 1, 1), state.calendar as any);
        const values = state.calendar.getEras().map((era) => {
          const eraDate = date
            .set({ year: 1, month: 1, day: 1, era })
            .toDate("UTC");
          const parts = eraFormatter.formatToParts(eraDate);
          const formatted = parts.find((part) => part.type === "era")!.value;
          return { era, formatted };
        });

        const prefixLength = commonPrefixLength(
          values.map((value) => value.formatted)
        );
        if (prefixLength) {
          for (const value of values) {
            value.formatted = value.formatted.slice(prefixLength);
          }
        }

        return values;
      })();

  const onInput = (key: string) => {
    if (state.isDisabled || state.isReadOnly) {
      return;
    }

    const newValue = enteredKeys.value + key;
    switch (segment.type) {
      case "dayPeriod":
        if (startsWith(am, key)) {
          state.setSegment("dayPeriod", 0);
        } else if (startsWith(pm, key)) {
          state.setSegment("dayPeriod", 1);
        } else {
          break;
        }
        focusManager.focusNext();
        break;
      case "era": {
        const matched = eras.find((eraValue) => startsWith(eraValue.formatted, key));
        if (matched) {
          state.setSegment("era", matched.era);
          focusManager.focusNext();
        }
        break;
      }
      case "day":
      case "hour":
      case "minute":
      case "second":
      case "month":
      case "year": {
        if (!parser.isValidPartialNumber(newValue)) {
          return;
        }

        const numberValue = parser.parse(newValue);
        let segmentValue = numberValue;
        if (segment.maxValue !== undefined && numberValue > segment.maxValue) {
          segmentValue = parser.parse(key);
        }

        if (Number.isNaN(numberValue)) {
          return;
        }

        state.setSegment(segment.type as any, segmentValue);

        if (
          segment.maxValue !== undefined
          && (Number(`${numberValue}0`) > segment.maxValue
            || newValue.length >= String(segment.maxValue).length)
        ) {
          enteredKeys.value = "";
          focusManager.focusNext();
        } else {
          enteredKeys.value = newValue;
        }
        break;
      }
    }
  };

  const onFocus = () => {
    enteredKeys.value = "";

    if (ref.current) {
      scrollIntoViewport(ref.current, {
        containingElement: getScrollParent(ref.current),
      });
    }

    const selection = window.getSelection();
    selection?.collapse(ref.current);
  };

  const documentRef = vueRef<Document | null>(
    typeof document !== "undefined" ? document : null
  );
  useEvent(documentRef as any, "selectionchange", () => {
    const selection = window.getSelection();
    if (
      selection?.anchorNode
      && nodeContains(ref.current, selection.anchorNode as Node | null)
    ) {
      selection.collapse(ref.current);
    }
  });

  const segmentRef = toRefObject(ref);
  const compositionRef = vueRef<string | null>("");
  useEvent(segmentRef as any, "beforeinput", (event: InputEvent) => {
    if (!ref.current) {
      return;
    }

    event.preventDefault();
    switch (event.inputType) {
      case "deleteContentBackward":
      case "deleteContentForward":
        if (parser.isValidPartialNumber(segment.text) && !state.isReadOnly) {
          backspace();
        }
        break;
      case "insertCompositionText":
        compositionRef.value = ref.current.textContent;
        ref.current.textContent = ref.current.textContent;
        break;
      default:
        if (event.data != null) {
          onInput(event.data);
        }
        break;
    }
  });

  useEvent(segmentRef as any, "input", (event: Event) => {
    const { inputType, data } = event as InputEvent;
    if (inputType === "insertCompositionText") {
      if (ref.current) {
        ref.current.textContent = compositionRef.value;
      }
      if (data != null && (startsWith(am, data) || startsWith(pm, data))) {
        onInput(data);
      }
    }
  });

  useLayoutEffect(() => {
    const element = ref.current;
    return () => {
      if (document.activeElement === element) {
        const previous = focusManager.focusPrevious();
        if (!previous) {
          focusManager.focusNext();
        }
      }
    };
  }, [() => ref.current]);

  const touchPropOverrides =
    isIOS() || segment.type === "timeZoneName"
      ? {
        role: "textbox",
        "aria-valuemax": null,
        "aria-valuemin": null,
        "aria-valuetext": null,
        "aria-valuenow": null,
      }
      : {};

  const firstSegment = state.segments.find((entry) => entry.isEditable);
  if (segment !== firstSegment && !state.isInvalid) {
    ariaDescribedBy = undefined;
  }

  const id = useId();
  const isEditable = !state.isDisabled && !state.isReadOnly && segment.isEditable;

  const name = segment.type === "literal" ? "" : displayNames.of(segment.type as any);
  const labelProps = useLabels({
    "aria-label": `${name}${ariaLabel ? `, ${ariaLabel}` : ""}${ariaLabelledBy ? ", " : ""}`,
    "aria-labelledby": ariaLabelledBy,
  });

  if (segment.type === "literal") {
    return {
      segmentProps: {
        "aria-hidden": true,
      },
    };
  }

  const segmentStyle: Record<string, string> = { caretColor: "transparent" };
  if (locale.value.direction === "rtl") {
    segmentStyle.unicodeBidi = "embed";
    const format = (options as any)[segment.type];
    if (format === "numeric" || format === "2-digit") {
      segmentStyle.direction = "ltr";
    }
  }

  return {
    segmentProps: mergeProps(spinButtonProps, labelProps, {
      id,
      ...touchPropOverrides,
      "aria-invalid": state.isInvalid ? "true" : undefined,
      "aria-describedby": ariaDescribedBy,
      "aria-readonly": state.isReadOnly || !segment.isEditable ? "true" : undefined,
      "data-placeholder": segment.isPlaceholder || undefined,
      contentEditable: isEditable,
      suppressContentEditableWarning: isEditable,
      spellCheck: isEditable ? "false" : undefined,
      autoCorrect: isEditable ? "off" : undefined,
      enterKeyHint: isEditable ? "next" : undefined,
      inputMode:
        state.isDisabled
        || segment.type === "dayPeriod"
        || segment.type === "era"
        || !isEditable
          ? undefined
          : "numeric",
      tabIndex: state.isDisabled ? undefined : 0,
      onKeyDown,
      onFocus,
      style: segmentStyle,
      onPointerdown(event: PointerEvent) {
        event.stopPropagation();
      },
      onMousedown(event: MouseEvent) {
        event.stopPropagation();
      },
    }),
  };
}

function toRefObject<T>(ref: RefObject<T>) {
  return {
    get value(): T | null {
      return ref.current;
    },
    set value(value: T | null) {
      ref.current = value;
    },
  };
}

function commonPrefixLength(strings: string[]): number {
  strings.sort();
  const first = strings[0];
  const last = strings[strings.length - 1];
  for (let i = 0; i < first.length; i += 1) {
    if (first[i] !== last[i]) {
      return i;
    }
  }
  return 0;
}
