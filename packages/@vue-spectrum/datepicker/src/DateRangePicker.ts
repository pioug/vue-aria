import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useDateRangePicker } from "@vue-aria/datepicker";
import type { DateRangeValue, UseDateRangePickerState } from "@vue-aria/datepicker";
import type { DateFieldDisplayValidation } from "@vue-aria/datefield";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import type { DateValue } from "@vue-aria/calendar-state";
import {
  classNames,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import { RangeCalendar } from "@vue-spectrum/calendar";
import { dateRangePickerPropOptions } from "./types";
import { formatDateValue, parseDateValue } from "./utils";

function toRangeValue(
  value: DateRangeValue<DateValue> | null | undefined
): DateRangeValue<DateValue> | null {
  if (!value) {
    return null;
  }

  const start = value.start ?? null;
  const end = value.end ?? null;

  if (value.start === start && value.end === end) {
    return value;
  }

  return {
    start,
    end,
  };
}

function resolveShouldCloseOnSelect(
  value: boolean | (() => boolean) | undefined
): boolean {
  if (value === undefined) {
    return true;
  }

  if (typeof value === "function") {
    return value();
  }

  return Boolean(value);
}

function resolveFirstDayOfWeek(value: number | string | undefined): number | undefined {
  if (typeof value === "number") {
    return value;
  }

  switch (value) {
    case "sun":
      return 0;
    case "mon":
      return 1;
    case "tue":
      return 2;
    case "wed":
      return 3;
    case "thu":
      return 4;
    case "fri":
      return 5;
    case "sat":
      return 6;
    default:
      return undefined;
  }
}

function formatRangePart(
  value: DateValue,
  locale: string,
  options: Intl.DateTimeFormatOptions
): string {
  const timeZone = value.timeZone ?? "UTC";
  return new Intl.DateTimeFormat(locale, options).format(value.toDate(timeZone));
}

function createBaseValidation(
  isInvalid: boolean | undefined,
  validationState: "valid" | "invalid" | undefined
): DateFieldDisplayValidation {
  return {
    isInvalid: Boolean(isInvalid) || validationState === "invalid",
    validationErrors: [],
    validationDetails: undefined,
  };
}

export const DateRangePicker = defineComponent({
  name: "DateRangePicker",
  inheritAttrs: false,
  props: {
    ...dateRangePickerPropOptions,
  },
  setup(props, { attrs, expose }) {
    const rootRef = ref<HTMLElement | null>(null);
    const groupRef = ref<HTMLElement | null>(null);
    const startInputRef = ref<HTMLInputElement | null>(null);

    const isValueControlled = computed(() => props.value !== undefined);
    const uncontrolledValue = ref<DateRangeValue<DateValue> | null>(
      toRangeValue(props.defaultValue)
    );

    watch(
      () => props.defaultValue,
      (nextValue) => {
        if (!isValueControlled.value) {
          uncontrolledValue.value = toRangeValue(nextValue);
        }
      }
    );

    const currentValue = computed<DateRangeValue<DateValue> | null>(() =>
      isValueControlled.value
        ? toRangeValue(props.value)
        : toRangeValue(uncontrolledValue.value)
    );

    const dateRange = ref<DateRangeValue<DateValue> | null>(currentValue.value);

    watch(currentValue, (nextValue) => {
      dateRange.value = toRangeValue(nextValue);
    });

    const isOpenControlled = computed(() => props.isOpen !== undefined);
    const uncontrolledOpen = ref(Boolean(props.defaultOpen));

    watch(
      () => props.defaultOpen,
      (nextValue) => {
        if (!isOpenControlled.value) {
          uncontrolledOpen.value = Boolean(nextValue);
        }
      }
    );

    const isOpen = computed<boolean>(() =>
      isOpenControlled.value ? Boolean(props.isOpen) : uncontrolledOpen.value
    );

    const displayValidation = ref<DateFieldDisplayValidation>(
      createBaseValidation(props.isInvalid, props.validationState)
    );

    watch(
      () => [props.isInvalid, props.validationState],
      () => {
        displayValidation.value = createBaseValidation(
          props.isInvalid,
          props.validationState
        );
      }
    );

    const setOpen = (nextOpen: boolean) => {
      if (!isOpenControlled.value) {
        uncontrolledOpen.value = nextOpen;
      }

      props.onOpenChange?.(nextOpen);
    };

    const setValue = (nextValue: DateRangeValue<DateValue> | null) => {
      const normalized = toRangeValue(nextValue);

      if (!isValueControlled.value) {
        uncontrolledValue.value = normalized;
      }

      dateRange.value = normalized;
      props.onChange?.(normalized);
    };

    const setDateTime: UseDateRangePickerState<DateValue>["setDateTime"] = (
      part,
      nextValue
    ) => {
      const previous = dateRange.value ?? currentValue.value;
      const nextRange: DateRangeValue<DateValue> = {
        start:
          part === "start"
            ? nextValue ?? null
            : previous?.start ?? null,
        end:
          part === "end"
            ? nextValue ?? null
            : previous?.end ?? null,
      };

      setValue(nextRange);

      if (
        nextRange.start &&
        nextRange.end &&
        resolveShouldCloseOnSelect(props.shouldCloseOnSelect)
      ) {
        setOpen(false);
      }
    };

    const setDateRange: UseDateRangePickerState<DateValue>["setDateRange"] = (
      nextValue
    ) => {
      const normalized = toRangeValue(nextValue);
      setValue(normalized);

      if (
        normalized?.start &&
        normalized?.end &&
        resolveShouldCloseOnSelect(props.shouldCloseOnSelect)
      ) {
        setOpen(false);
      }
    };

    const state: UseDateRangePickerState<DateValue> = {
      value: currentValue,
      defaultValue: computed(() => toRangeValue(props.defaultValue)),
      dateRange,
      isOpen,
      isInvalid: computed(
        () =>
          Boolean(props.isInvalid) ||
          props.validationState === "invalid" ||
          Boolean(displayValidation.value.isInvalid)
      ),
      displayValidation,
      realtimeValidation: {},
      setOpen,
      setDateTime,
      setDateRange,
      updateValidation: (result: DateFieldDisplayValidation) => {
        displayValidation.value = result;
      },
      resetValidation: () => {
        displayValidation.value = createBaseValidation(
          props.isInvalid,
          props.validationState
        );
      },
      commitValidation: () => {
        // no-op baseline placeholder for parity API
      },
      formatValue: (
        locale: string,
        options: Intl.DateTimeFormatOptions = {}
      ) => {
        const value = dateRange.value ?? currentValue.value;
        if (!value?.start || !value?.end) {
          return undefined;
        }

        return {
          start: formatRangePart(value.start, locale, options),
          end: formatRangePart(value.end, locale, options),
        };
      },
    };

    const dateRangePicker = useDateRangePicker(
      {
        id: props.id,
        label: props.label,
        description: props.description,
        errorMessage: props.errorMessage,
        isDisabled: props.isDisabled,
        isReadOnly: props.isReadOnly,
        isRequired: props.isRequired,
        isInvalid: props.isInvalid,
        validationState: props.validationState,
        placeholderValue: props.placeholderValue,
        hideTimeZone: props.hideTimeZone,
        hourCycle: props.hourCycle,
        shouldForceLeadingZeros: props.shouldForceLeadingZeros,
        granularity: props.granularity,
        minValue: props.minValue,
        maxValue: props.maxValue,
        isDateUnavailable: props.isDateUnavailable
          ? (value) => props.isDateUnavailable!(value as DateValue)
          : undefined,
        firstDayOfWeek: resolveFirstDayOfWeek(props.firstDayOfWeek),
        pageBehavior: props.pageBehavior,
        allowsNonContiguousRanges: props.allowsNonContiguousRanges,
        locale: props.locale,
        calendarAriaLabel: props.calendarAriaLabel,
        startAriaLabel: props.startAriaLabel,
        endAriaLabel: props.endAriaLabel,
        startName: props.startName,
        endName: props.endName,
        form: props.form,
        autoFocus: props.autoFocus,
        "aria-label": props["aria-label"] ?? props.ariaLabel,
        "aria-labelledby": props["aria-labelledby"] ?? props.ariaLabelledby,
        "aria-describedby": props["aria-describedby"] ?? props.ariaDescribedby,
        onFocus: props.onFocus,
        onBlur: props.onBlur,
        onFocusChange: props.onFocusChange,
        onKeydown: props.onKeydown,
        onKeyup: props.onKeyup,
      },
      state,
      groupRef
    );

    const isInvalid = computed(
      () =>
        dateRangePicker.isInvalid.value ||
        Boolean(props.isInvalid) ||
        props.validationState === "invalid"
    );

    const startInputValue = computed(() =>
      formatDateValue((currentValue.value?.start ?? null) as DateValue | null)
    );
    const endInputValue = computed(() =>
      formatDateValue((currentValue.value?.end ?? null) as DateValue | null)
    );

    const onStartInput = (event: Event) => {
      if (props.isDisabled || props.isReadOnly) {
        return;
      }

      const target = event.target as HTMLInputElement | null;
      const nextValue = parseDateValue(target?.value ?? "");
      state.setDateTime("start", nextValue);
    };

    const onEndInput = (event: Event) => {
      if (props.isDisabled || props.isReadOnly) {
        return;
      }

      const target = event.target as HTMLInputElement | null;
      const nextValue = parseDateValue(target?.value ?? "");
      state.setDateTime("end", nextValue);
    };

    const onButtonClick = () => {
      const onPress = dateRangePicker.buttonProps.value.onPress as
        | (() => void)
        | undefined;

      if (onPress) {
        onPress();
        return;
      }

      setOpen(true);
    };

    const onDocumentMouseDown = (event: MouseEvent) => {
      if (!isOpen.value) {
        return;
      }

      const target = event.target as Node | null;
      if (!target) {
        return;
      }

      if (rootRef.value?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    onMounted(() => {
      if (typeof document !== "undefined") {
        document.addEventListener("mousedown", onDocumentMouseDown, true);
      }
    });

    onBeforeUnmount(() => {
      if (typeof document !== "undefined") {
        document.removeEventListener("mousedown", onDocumentMouseDown, true);
      }
    });

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
      focus: () => {
        startInputRef.value?.focus();
      },
    });

    return () => {
      const domProps = filterDOMProps(attrs as Record<string, unknown>, {
        labelable: true,
      });
      const { styleProps } = useStyleProps({
        isHidden: props.isHidden,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      });

      return h(
        "div",
        mergeProps(domProps, {
          ref: (value: unknown) => {
            rootRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "react-spectrum-DateRangePicker",
            {
              "is-open": isOpen.value,
              "is-disabled": Boolean(props.isDisabled),
              "is-invalid": isInvalid.value,
            },
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined
          ),
          style: styleProps.style,
          hidden: styleProps.hidden,
        }),
        [
          props.label
            ? h(
                "label",
                mergeProps(dateRangePicker.labelProps.value, {
                  class: classNames("spectrum-FieldLabel"),
                }),
                props.label
              )
            : null,
          h(
            "div",
            mergeProps(dateRangePicker.groupProps.value, {
              ref: (value: unknown) => {
                groupRef.value = value as HTMLElement | null;
              },
              class: classNames("react-spectrum-DateRangePicker-group"),
            }),
            [
              h("input", {
                ref: (value: unknown) => {
                  startInputRef.value = value as HTMLInputElement | null;
                },
                type: "date",
                value: startInputValue.value,
                min: formatDateValue(props.minValue),
                max: formatDateValue(props.maxValue),
                disabled: props.isDisabled,
                readonly: props.isReadOnly,
                required: props.isRequired,
                autofocus: props.autoFocus,
                name: props.startName,
                form: props.form,
                class: classNames("react-spectrum-DateRangePicker-input", "is-start"),
                "aria-label": dateRangePicker.startFieldProps.value["aria-label"] as
                  | string
                  | undefined,
                "aria-labelledby": dateRangePicker.startFieldProps.value[
                  "aria-labelledby"
                ] as string | undefined,
                "aria-describedby": dateRangePicker.startFieldProps.value[
                  "aria-describedby"
                ] as string | undefined,
                "aria-invalid": isInvalid.value ? "true" : undefined,
                onInput: onStartInput,
              }),
              h(
                "span",
                {
                  "aria-hidden": "true",
                  "data-testid": "date-range-dash",
                  class: classNames("react-spectrum-DateRangePicker-dash"),
                },
                "–"
              ),
              h("input", {
                type: "date",
                value: endInputValue.value,
                min: formatDateValue(props.minValue),
                max: formatDateValue(props.maxValue),
                disabled: props.isDisabled,
                readonly: props.isReadOnly,
                required: props.isRequired,
                name: props.endName,
                form: props.form,
                class: classNames("react-spectrum-DateRangePicker-input", "is-end"),
                "aria-label": dateRangePicker.endFieldProps.value["aria-label"] as
                  | string
                  | undefined,
                "aria-labelledby": dateRangePicker.endFieldProps.value[
                  "aria-labelledby"
                ] as string | undefined,
                "aria-describedby": dateRangePicker.endFieldProps.value[
                  "aria-describedby"
                ] as string | undefined,
                "aria-invalid": isInvalid.value ? "true" : undefined,
                onInput: onEndInput,
              }),
              h(
                "button",
                {
                  type: "button",
                  class: classNames("react-spectrum-DateRangePicker-button"),
                  disabled: Boolean(dateRangePicker.buttonProps.value.isDisabled),
                  "aria-haspopup": dateRangePicker.buttonProps.value[
                    "aria-haspopup"
                  ] as string | undefined,
                  "aria-label": dateRangePicker.buttonProps.value["aria-label"] as
                    | string
                    | undefined,
                  "aria-labelledby": dateRangePicker.buttonProps.value[
                    "aria-labelledby"
                  ] as string | undefined,
                  "aria-describedby": dateRangePicker.buttonProps.value[
                    "aria-describedby"
                  ] as string | undefined,
                  "aria-expanded": dateRangePicker.buttonProps.value[
                    "aria-expanded"
                  ] as boolean | undefined,
                  onClick: onButtonClick,
                },
                "📅"
              ),
            ]
          ),
          props.description
            ? h(
                "div",
                mergeProps(dateRangePicker.descriptionProps.value, {
                  class: classNames("spectrum-FieldDescription"),
                }),
                props.description
              )
            : null,
          props.errorMessage
            ? h(
                "div",
                mergeProps(dateRangePicker.errorMessageProps.value, {
                  class: classNames("spectrum-FieldError"),
                }),
                props.errorMessage
              )
            : null,
          isOpen.value
            ? h(
                "div",
                mergeProps(dateRangePicker.dialogProps.value, {
                  role: "dialog",
                  class: classNames("react-spectrum-DateRangePicker-popover"),
                }),
                [
                  h(RangeCalendar as any, {
                    ...(dateRangePicker.calendarProps.value as Record<string, unknown>),
                  }),
                ]
              )
            : null,
        ]
      );
    };
  },
});
