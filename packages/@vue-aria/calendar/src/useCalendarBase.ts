import { announce } from "@vue-aria/live-announcer";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import {
  filterDOMProps,
  mergeProps,
  useLabels,
  useSlotId,
  useUpdateEffect,
} from "@vue-aria/utils";
import type {
  CalendarPropsBase,
  CalendarState,
  RangeCalendarState,
} from "@vue-stately/calendar";
import { computed, ref, watchEffect } from "vue";
import { intlMessages } from "./intlMessages";
import {
  hookData,
  useSelectedDateDescription,
  useVisibleRangeDescription,
} from "./utils";

export interface AriaButtonProps {
  onPress?: () => void;
  "aria-label"?: string;
  isDisabled?: boolean;
  onFocusChange?: (isFocused: boolean) => void;
}

export interface CalendarBaseProps extends CalendarPropsBase {
  id?: string;
  errorMessage?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-details"?: string;
  [key: string]: unknown;
}

export interface CalendarAria {
  calendarProps: Record<string, unknown>;
  nextButtonProps: AriaButtonProps;
  prevButtonProps: AriaButtonProps;
  errorMessageProps: Record<string, unknown>;
  readonly title: string;
}

export function useCalendarBase(
  props: CalendarBaseProps,
  state: CalendarState | RangeCalendarState
): CalendarAria {
  const stringFormatter = useLocalizedStringFormatter(
    intlMessages as any,
    "@react-aria/calendar"
  );
  const domProps = filterDOMProps(props as Record<string, unknown>);

  const title = computed(() =>
    useVisibleRangeDescription(
      state.visibleRange.start,
      state.visibleRange.end,
      state.timeZone,
      false
    )
  );

  const visibleRangeDescription = computed(() =>
    useVisibleRangeDescription(
      state.visibleRange.start,
      state.visibleRange.end,
      state.timeZone,
      true
    )
  );

  useUpdateEffect(
    () => {
      if (!state.isFocused) {
        announce(visibleRangeDescription.value);
      }
    },
    [visibleRangeDescription]
  );

  const selectedDateDescription = computed(() => useSelectedDateDescription(state));

  useUpdateEffect(
    () => {
      if (selectedDateDescription.value) {
        announce(selectedDateDescription.value, "polite", 4000);
      }
    },
    [selectedDateDescription]
  );

  const errorMessageId = useSlotId([
    Boolean(props.errorMessage),
    props.isInvalid,
    props.validationState,
  ]);

  watchEffect(() => {
    hookData.set(state, {
      ariaLabel: props["aria-label"],
      ariaLabelledBy: props["aria-labelledby"],
      errorMessageId,
      selectedDateDescription: selectedDateDescription.value,
    });
  });

  const nextFocused = ref(false);
  const nextDisabled = computed(
    () => Boolean(props.isDisabled || state.isNextVisibleRangeInvalid())
  );

  watchEffect(() => {
    if (nextDisabled.value && nextFocused.value) {
      nextFocused.value = false;
      state.setFocused(true);
    }
  });

  const previousFocused = ref(false);
  const previousDisabled = computed(
    () => Boolean(props.isDisabled || state.isPreviousVisibleRangeInvalid())
  );

  watchEffect(() => {
    if (previousDisabled.value && previousFocused.value) {
      previousFocused.value = false;
      state.setFocused(true);
    }
  });

  const labelProps = useLabels({
    id: props.id,
    "aria-label": [props["aria-label"], visibleRangeDescription.value]
      .filter(Boolean)
      .join(", "),
    "aria-labelledby": props["aria-labelledby"],
  });

  const calendarProps = mergeProps(domProps, labelProps, {
    role: "application",
    "aria-details": props["aria-details"] || undefined,
    "aria-describedby": props["aria-describedby"] || undefined,
  }) as Record<string, unknown>;

  Object.defineProperty(calendarProps, "aria-label", {
    configurable: true,
    get() {
      return [props["aria-label"], visibleRangeDescription.value].filter(Boolean).join(", ") || undefined;
    },
  });

  const nextButtonProps: AriaButtonProps = {
    onPress: () => state.focusNextPage(),
    "aria-label": stringFormatter.format("next"),
    onFocusChange: (isFocused) => {
      nextFocused.value = isFocused;
    },
  };
  Object.defineProperty(nextButtonProps, "isDisabled", {
    configurable: true,
    get() {
      return nextDisabled.value;
    },
  });

  const prevButtonProps: AriaButtonProps = {
    onPress: () => state.focusPreviousPage(),
    "aria-label": stringFormatter.format("previous"),
    onFocusChange: (isFocused) => {
      previousFocused.value = isFocused;
    },
  };
  Object.defineProperty(prevButtonProps, "isDisabled", {
    configurable: true,
    get() {
      return previousDisabled.value;
    },
  });

  return {
    calendarProps,
    nextButtonProps,
    prevButtonProps,
    errorMessageProps: {
      id: errorMessageId,
    },
    get title() {
      return title.value;
    },
  };
}
