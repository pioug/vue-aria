import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
} from "vue";
import { useDatePicker } from "@vue-aria/datepicker";
import {
  useDatePickerState,
  type DatePickerGranularity,
  type TimeValue,
} from "@vue-aria/datepicker-state";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import type { DateValue } from "@vue-aria/calendar-state";
import {
  classNames,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import { Calendar } from "@vue-spectrum/calendar";
import { TimeField } from "./TimeField";
import { datePickerPropOptions } from "./types";
import { formatDateValue, parseDateValue } from "./utils";

function normalizeGranularity(value: DatePickerGranularity | undefined): DatePickerGranularity {
  if (value === "day" || value === "hour" || value === "minute" || value === "second") {
    return value;
  }

  return "day";
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

export const DatePicker = defineComponent({
  name: "DatePicker",
  inheritAttrs: false,
  props: {
    ...datePickerPropOptions,
  },
  setup(props, { attrs, expose }) {
    const rootRef = ref<HTMLElement | null>(null);
    const groupRef = ref<HTMLElement | null>(null);
    const controlledValue =
      props.value === undefined ? undefined : computed(() => props.value);
    const controlledOpen =
      props.isOpen === undefined ? undefined : computed(() => props.isOpen);
    const controlledGranularity =
      props.granularity === undefined
        ? undefined
        : computed(() => normalizeGranularity(props.granularity));
    const controlledMinValue =
      props.minValue === undefined ? undefined : computed(() => props.minValue);
    const controlledMaxValue =
      props.maxValue === undefined ? undefined : computed(() => props.maxValue);
    const controlledValidationState =
      props.validationState === undefined
        ? undefined
        : computed(() => props.validationState);
    const controlledIsInvalid =
      props.isInvalid === undefined ? undefined : computed(() => props.isInvalid);

    const state = useDatePickerState<DateValue>({
      value: controlledValue,
      defaultValue: props.defaultValue,
      onChange: props.onChange,
      isOpen: controlledOpen,
      defaultOpen: props.defaultOpen,
      onOpenChange: props.onOpenChange,
      shouldCloseOnSelect: props.shouldCloseOnSelect,
      placeholderValue: props.placeholderValue,
      granularity: controlledGranularity,
      minValue: controlledMinValue,
      maxValue: controlledMaxValue,
      isDateUnavailable: props.isDateUnavailable,
      validationState: controlledValidationState,
      isInvalid: controlledIsInvalid,
    });

    const datePicker = useDatePicker(
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
        name: props.name,
        form: props.form,
        autoFocus: props.autoFocus,
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
        locale: props.locale,
        calendarAriaLabel: props.calendarAriaLabel,
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

    const dateInputValue = computed(() =>
      formatDateValue(state.dateValue.value ?? state.value.value)
    );

    const isInvalid = computed(
      () =>
        datePicker.isInvalid.value ||
        Boolean(props.isInvalid) ||
        props.validationState === "invalid"
    );

    const buttonDisabled = computed(() => {
      const value = datePicker.buttonProps.value.isDisabled;
      return Boolean(value);
    });

    const onInput = (event: Event) => {
      if (props.isDisabled || props.isReadOnly) {
        return;
      }

      const target = event.target as HTMLInputElement | null;
      const parsed = parseDateValue(target?.value ?? "");
      state.setDateValue(parsed);
    };

    const onButtonClick = () => {
      const onPress = datePicker.buttonProps.value.onPress as
        | (() => void)
        | undefined;
      if (onPress) {
        onPress();
        return;
      }

      state.setOpen(!state.isOpen.value);
    };

    const onDocumentMouseDown = (event: MouseEvent) => {
      if (!state.isOpen.value) {
        return;
      }

      const target = event.target as Node | null;
      if (!target) {
        return;
      }

      if (rootRef.value?.contains(target)) {
        return;
      }

      state.setOpen(false);
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
        const input = groupRef.value?.querySelector<HTMLInputElement>("input[type=\"date\"]");
        input?.focus();
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
            "react-spectrum-DatePicker",
            {
              "is-open": state.isOpen.value,
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
                mergeProps(datePicker.labelProps.value, {
                  class: classNames("spectrum-FieldLabel"),
                }),
                props.label
              )
            : null,
          h(
            "div",
            mergeProps(datePicker.groupProps.value, {
              ref: (value: unknown) => {
                groupRef.value = value as HTMLElement | null;
              },
              class: classNames("react-spectrum-DatePicker-group"),
            }),
            [
              h("input", {
                type: "date",
                class: classNames("react-spectrum-DatePicker-input"),
                value: dateInputValue.value,
                disabled: props.isDisabled,
                readonly: props.isReadOnly,
                required: props.isRequired,
                min: formatDateValue(props.minValue),
                max: formatDateValue(props.maxValue),
                name: props.name,
                form: props.form,
                "aria-label": datePicker.fieldProps.value["aria-label"] as
                  | string
                  | undefined,
                "aria-labelledby": datePicker.fieldProps.value[
                  "aria-labelledby"
                ] as string | undefined,
                "aria-describedby": datePicker.fieldProps.value[
                  "aria-describedby"
                ] as string | undefined,
                onInput,
              }),
              h(
                "button",
                {
                  type: "button",
                  class: classNames("react-spectrum-DatePicker-button"),
                  disabled: buttonDisabled.value,
                  "aria-haspopup": datePicker.buttonProps.value[
                    "aria-haspopup"
                  ] as string | undefined,
                  "aria-label": datePicker.buttonProps.value["aria-label"] as
                    | string
                    | undefined,
                  "aria-labelledby": datePicker.buttonProps.value[
                    "aria-labelledby"
                  ] as string | undefined,
                  "aria-describedby": datePicker.buttonProps.value[
                    "aria-describedby"
                  ] as string | undefined,
                  "aria-expanded": datePicker.buttonProps.value[
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
                mergeProps(datePicker.descriptionProps.value, {
                  class: classNames("spectrum-FieldDescription"),
                }),
                props.description
              )
            : null,
          props.errorMessage
            ? h(
                "div",
                mergeProps(datePicker.errorMessageProps.value, {
                  class: classNames("spectrum-FieldError"),
                }),
                props.errorMessage
              )
            : null,
          state.isOpen.value
            ? h(
                "div",
                mergeProps(datePicker.dialogProps.value, {
                  role: "dialog",
                  class: classNames("react-spectrum-DatePicker-popover"),
                }),
                [
                  h(Calendar as any, {
                    ...(datePicker.calendarProps.value as Record<string, unknown>),
                  }),
                  state.hasTime.value
                    ? h(TimeField as any, {
                        label: "Time",
                        value: state.timeValue.value as TimeValue | null,
                        onChange: (nextValue: TimeValue | null) => {
                          state.setTimeValue(nextValue);
                        },
                        granularity: state.granularity.value,
                      })
                    : null,
                ]
              )
            : null,
        ]
      );
    };
  },
});
