import { computed, ref, toValue, watch, watchEffect } from "vue";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { announce } from "@vue-aria/live-announcer";
import { filterDOMProps } from "@vue-aria/utils";
import { mergeProps } from "@vue-aria/utils";
import { useId } from "@vue-aria/ssr";
import type { ReadonlyRef } from "@vue-aria/types";
import type { UseCalendarBaseOptions, UseCalendarBaseState } from "./types";
import { hookData, useSelectedDateDescription, useVisibleRangeDescription } from "./utils";

export interface UseCalendarBaseResult {
  calendarProps: ReadonlyRef<Record<string, unknown>>;
  nextButtonProps: ReadonlyRef<Record<string, unknown>>;
  prevButtonProps: ReadonlyRef<Record<string, unknown>>;
  errorMessageProps: ReadonlyRef<Record<string, unknown>>;
  title: ReadonlyRef<string>;
}

function resolveBoolean(value: unknown): boolean {
  return Boolean(value);
}

const CALENDAR_BASE_INTL_MESSAGES = {
  "en-US": {
    next: "Next",
    previous: "Previous",
  },
  "fr-FR": {
    next: "Suivant",
    previous: "Précédent",
  },
} as const;

export function useCalendarBase(
  options: UseCalendarBaseOptions,
  state: UseCalendarBaseState
): UseCalendarBaseResult {
  const errorMessageId = useId(undefined, "v-aria-calendar-error");
  const visibleRangeDescription = useVisibleRangeDescription(state);
  const selectedDateDescription = useSelectedDateDescription(state);
  const stringFormatter = useLocalizedStringFormatter(CALENDAR_BASE_INTL_MESSAGES);

  watchEffect(() => {
    hookData.set(state as object, {
      ariaLabel:
        options["aria-label"] === undefined
          ? undefined
          : (toValue(options["aria-label"]) ?? undefined),
      ariaLabelledBy:
        options["aria-labelledby"] === undefined
          ? undefined
          : (toValue(options["aria-labelledby"]) ?? undefined),
      errorMessageId: errorMessageId.value,
      selectedDateDescription: selectedDateDescription.value,
    });
  });

  const nextFocused = ref(false);
  const previousFocused = ref(false);

  const isDisabled = computed(() =>
    options.isDisabled === undefined ? false : Boolean(toValue(options.isDisabled))
  );
  const isFocused = computed(() =>
    state.isFocused === undefined ? false : Boolean(toValue(state.isFocused))
  );
  const nextDisabled = computed(
    () => isDisabled.value || Boolean(state.isNextVisibleRangeInvalid())
  );
  const previousDisabled = computed(
    () => isDisabled.value || Boolean(state.isPreviousVisibleRangeInvalid())
  );

  watchEffect(() => {
    if (nextDisabled.value && nextFocused.value) {
      nextFocused.value = false;
      state.setFocused(true);
    }
  });

  watchEffect(() => {
    if (previousDisabled.value && previousFocused.value) {
      previousFocused.value = false;
      state.setFocused(true);
    }
  });

  watch(visibleRangeDescription, (value, previous) => {
    if (previous === undefined) {
      return;
    }
    if (!isFocused.value && value) {
      announce(value, "polite");
    }
  });

  watch(selectedDateDescription, (value, previous) => {
    if (!value || value === previous) {
      return;
    }
    announce(value, "polite", 4000);
  });

  const title = computed(() => visibleRangeDescription.value);
  const domProps = filterDOMProps(options as Record<string, unknown>);
  const calendarProps = computed<Record<string, unknown>>(() => {
    const labelledBy =
      options["aria-labelledby"] === undefined
        ? undefined
        : toValue(options["aria-labelledby"]);
    const explicitLabel =
      options["aria-label"] === undefined
        ? undefined
        : toValue(options["aria-label"]);

    const ariaLabel = [explicitLabel, visibleRangeDescription.value]
      .filter(Boolean)
      .join(", ");

    return mergeProps(domProps, {
      id: options.id === undefined ? undefined : toValue(options.id),
      role: "application",
      "aria-label": ariaLabel || undefined,
      "aria-labelledby": labelledBy,
      "aria-details":
        options["aria-details"] === undefined
          ? undefined
          : toValue(options["aria-details"]),
      "aria-describedby":
        options["aria-describedby"] === undefined
          ? undefined
          : toValue(options["aria-describedby"]),
      "data-selected-description": selectedDateDescription.value || undefined,
    });
  });

  const nextButtonProps = computed<Record<string, unknown>>(() => ({
    onPress: () => state.focusNextPage(),
    "aria-label": stringFormatter.value.format("next"),
    isDisabled: nextDisabled.value,
    onFocusChange: (isFocused: boolean) => {
      nextFocused.value = isFocused;
    },
  }));

  const prevButtonProps = computed<Record<string, unknown>>(() => ({
    onPress: () => state.focusPreviousPage(),
    "aria-label": stringFormatter.value.format("previous"),
    isDisabled: previousDisabled.value,
    onFocusChange: (isFocused: boolean) => {
      previousFocused.value = isFocused;
    },
  }));

  const errorMessageProps = computed<Record<string, unknown>>(() => {
    const hasErrorMessage =
      options.errorMessage !== undefined && String(toValue(options.errorMessage) ?? "") !== "";
    const isInvalid =
      resolveBoolean(options.isInvalid === undefined ? false : toValue(options.isInvalid)) ||
      (options.validationState !== undefined && toValue(options.validationState) === "invalid");

    return {
      id: hasErrorMessage && isInvalid ? errorMessageId.value : undefined,
    };
  });

  return {
    calendarProps,
    nextButtonProps,
    prevButtonProps,
    errorMessageProps,
    title,
  };
}
