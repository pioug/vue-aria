import { useDatePicker, useDateRangePicker } from "@vue-aria/datepicker";
import { useDatePickerState, useDateRangePickerState } from "@vue-aria/datepicker-state";
import { useLocale } from "@vue-aria/i18n";
import { defineComponent, h, computed, ref, useAttrs, type PropType } from "vue";
import { Calendar, RangeCalendar } from "@vue-spectrum/calendar";
import { Popover } from "@vue-spectrum/menu";

type DateValue = any;
export type DateRangeValue = { start: DateValue; end: DateValue } | null;

export interface SpectrumDatePickerProps {
  value?: DateValue | null | undefined;
  defaultValue?: DateValue | null | undefined;
  onChange?: ((value: DateValue | null) => void) | undefined;
  isOpen?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((isOpen: boolean) => void) | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  isRequired?: boolean | undefined;
  isInvalid?: boolean | undefined;
  validationState?: "valid" | "invalid" | null | undefined;
  errorMessage?: string | undefined;
  minValue?: DateValue | null | undefined;
  maxValue?: DateValue | null | undefined;
  isDateUnavailable?: ((date: DateValue) => boolean) | undefined;
  firstDayOfWeek?: "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | undefined;
  pageBehavior?: "visible" | "single" | undefined;
  placeholderValue?: DateValue | undefined;
  placeholder?: string | undefined;
  autoFocus?: boolean | undefined;
  label?: string | undefined;
  name?: string | undefined;
  form?: string | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, unknown> | undefined;
}

export interface SpectrumDateRangePickerProps extends Omit<SpectrumDatePickerProps, "value" | "defaultValue" | "onChange" | "name"> {
  value?: DateRangeValue | undefined;
  defaultValue?: DateRangeValue | undefined;
  onChange?: ((value: DateRangeValue) => void) | undefined;
  startName?: string | undefined;
  endName?: string | undefined;
  allowsNonContiguousRanges?: boolean | undefined;
}

function createDomRef<T extends Element>() {
  const elementRef = ref<T | null>(null);
  return {
    elementRef,
    refObject: {
      get current() {
        return elementRef.value;
      },
      set current(value: T | null) {
        elementRef.value = value;
      },
    },
  };
}

export const DatePicker = defineComponent({
  name: "SpectrumDatePicker",
  props: {
    value: {
      type: Object as PropType<DateValue | null | undefined>,
      default: undefined,
    },
    defaultValue: {
      type: Object as PropType<DateValue | null | undefined>,
      default: undefined,
    },
    onChange: {
      type: Function as PropType<((value: DateValue | null) => void) | undefined>,
      default: undefined,
    },
    isOpen: {
      type: Boolean,
      default: undefined,
    },
    defaultOpen: {
      type: Boolean,
      default: undefined,
    },
    onOpenChange: {
      type: Function as PropType<((isOpen: boolean) => void) | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean,
      default: undefined,
    },
    isReadOnly: {
      type: Boolean,
      default: undefined,
    },
    isRequired: {
      type: Boolean,
      default: undefined,
    },
    isInvalid: {
      type: Boolean,
      default: undefined,
    },
    validationState: {
      type: String as PropType<"valid" | "invalid" | null | undefined>,
      default: undefined,
    },
    errorMessage: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    minValue: {
      type: Object as PropType<DateValue | null | undefined>,
      default: undefined,
    },
    maxValue: {
      type: Object as PropType<DateValue | null | undefined>,
      default: undefined,
    },
    isDateUnavailable: {
      type: Function as PropType<((date: DateValue) => boolean) | undefined>,
      default: undefined,
    },
    firstDayOfWeek: {
      type: String as PropType<SpectrumDatePickerProps["firstDayOfWeek"]>,
      default: undefined,
    },
    pageBehavior: {
      type: String as PropType<SpectrumDatePickerProps["pageBehavior"]>,
      default: undefined,
    },
    placeholderValue: {
      type: Object as PropType<DateValue | undefined>,
      default: undefined,
    },
    placeholder: {
      type: String as PropType<string | undefined>,
      default: "Select date",
    },
    autoFocus: {
      type: Boolean,
      default: undefined,
    },
    label: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    name: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    form: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-label": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-labelledby": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaLabelledby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      default: undefined,
    },
  },
  setup(props) {
    const attrs = useAttrs();
    const locale = useLocale();
    const group = createDomRef<HTMLElement>();

    const state = useDatePickerState({
      get value() {
        return props.value;
      },
      get defaultValue() {
        return props.defaultValue;
      },
      onChange: props.onChange,
      get isOpen() {
        return props.isOpen;
      },
      get defaultOpen() {
        return props.defaultOpen;
      },
      onOpenChange: props.onOpenChange,
      get isDisabled() {
        return props.isDisabled;
      },
      get isReadOnly() {
        return props.isReadOnly;
      },
      get isRequired() {
        return props.isRequired;
      },
      get isInvalid() {
        return props.isInvalid;
      },
      get validationState() {
        return props.validationState;
      },
      get minValue() {
        return props.minValue;
      },
      get maxValue() {
        return props.maxValue;
      },
      isDateUnavailable: props.isDateUnavailable,
      get firstDayOfWeek() {
        return props.firstDayOfWeek;
      },
      get pageBehavior() {
        return props.pageBehavior;
      },
      get placeholderValue() {
        return props.placeholderValue;
      },
    } as any);

    const pickerAria = useDatePicker(
      {
        get label() {
          return props.label;
        },
        get "aria-label"() {
          return props["aria-label"] ?? props.ariaLabel ?? (attrs["aria-label"] as string | undefined);
        },
        get "aria-labelledby"() {
          return props["aria-labelledby"] ?? props.ariaLabelledby ?? (attrs["aria-labelledby"] as string | undefined);
        },
        get isDisabled() {
          return props.isDisabled;
        },
        get isReadOnly() {
          return props.isReadOnly;
        },
        get isRequired() {
          return props.isRequired;
        },
        get validationState() {
          return props.validationState;
        },
        get errorMessage() {
          return props.errorMessage;
        },
        get minValue() {
          return props.minValue;
        },
        get maxValue() {
          return props.maxValue;
        },
        isDateUnavailable: props.isDateUnavailable,
        get firstDayOfWeek() {
          return props.firstDayOfWeek;
        },
        get pageBehavior() {
          return props.pageBehavior;
        },
        get placeholderValue() {
          return props.placeholderValue;
        },
        get autoFocus() {
          return props.autoFocus;
        },
        get name() {
          return props.name;
        },
        get form() {
          return props.form;
        },
      } as any,
      state as any,
      group.refObject as any
    );

    const displayValue = computed(() => {
      if (!state.value) {
        return props.placeholder ?? "Select date";
      }

      return state.formatValue(locale.value.locale, {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    });

    return () => {
      const calendarAriaLabel = props["aria-label"] ?? props.ariaLabel ?? props.label ?? "Calendar";
      const buttonProps = pickerAria.buttonProps as Record<string, unknown>;
      const isButtonDisabled = Boolean(buttonProps.isDisabled);

      return h(
        "div",
        {
          class: ["react-spectrum-DatePicker", props.UNSAFE_className],
          style: props.UNSAFE_style,
        },
        [
          props.label
            ? h(
              "span",
              {
                ...pickerAria.labelProps,
                class: "react-spectrum-DatePicker-label",
              },
              props.label
            )
            : null,
          h(
            "div",
            {
              ...pickerAria.groupProps,
              ref: group.elementRef,
              class: "react-spectrum-DatePicker-group",
            },
            [
              h(
                "span",
                {
                  class: ["react-spectrum-DatePicker-value", { "is-placeholder": !state.value }],
                },
                displayValue.value
              ),
              h(
                "button",
                {
                  id: buttonProps.id as string | undefined,
                  type: "button",
                  class: "react-spectrum-DatePicker-button",
                  disabled: isButtonDisabled || undefined,
                  "aria-haspopup": buttonProps["aria-haspopup"] as string | undefined,
                  "aria-label": buttonProps["aria-label"] as string | undefined,
                  "aria-labelledby": buttonProps["aria-labelledby"] as string | undefined,
                  "aria-describedby": buttonProps["aria-describedby"] as string | undefined,
                  "aria-expanded": state.isOpen ? "true" : "false",
                  onClick: () => {
                    (buttonProps.onPress as (() => void) | undefined)?.();
                  },
                },
                "📅"
              ),
            ]
          ),
          state.displayValidation.validationErrors.length > 0
            ? h(
              "div",
              {
                ...pickerAria.errorMessageProps,
                class: "react-spectrum-DatePicker-error",
              },
              state.displayValidation.validationErrors.join(", ")
            )
            : null,
          h("div", {
            ...pickerAria.descriptionProps,
            style: { display: "none" },
          }),
          h(
            Popover as any,
            {
              state,
              triggerRef: group.refObject,
              placement: "bottom start",
              shouldFlip: true,
              hideArrow: true,
              shouldContainFocus: true,
            },
            {
              default: () => [
                h(Calendar as any, {
                  "aria-label": calendarAriaLabel,
                  ...(pickerAria.calendarProps as Record<string, unknown>),
                }),
              ],
            }
          ),
        ]
      );
    };
  },
});

export const DateRangePicker = defineComponent({
  name: "SpectrumDateRangePicker",
  props: {
    value: {
      type: Object as PropType<DateRangeValue | undefined>,
      default: undefined,
    },
    defaultValue: {
      type: Object as PropType<DateRangeValue | undefined>,
      default: undefined,
    },
    onChange: {
      type: Function as PropType<((value: DateRangeValue) => void) | undefined>,
      default: undefined,
    },
    isOpen: {
      type: Boolean,
      default: undefined,
    },
    defaultOpen: {
      type: Boolean,
      default: undefined,
    },
    onOpenChange: {
      type: Function as PropType<((isOpen: boolean) => void) | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean,
      default: undefined,
    },
    isReadOnly: {
      type: Boolean,
      default: undefined,
    },
    isRequired: {
      type: Boolean,
      default: undefined,
    },
    isInvalid: {
      type: Boolean,
      default: undefined,
    },
    validationState: {
      type: String as PropType<"valid" | "invalid" | null | undefined>,
      default: undefined,
    },
    errorMessage: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    minValue: {
      type: Object as PropType<DateValue | null | undefined>,
      default: undefined,
    },
    maxValue: {
      type: Object as PropType<DateValue | null | undefined>,
      default: undefined,
    },
    isDateUnavailable: {
      type: Function as PropType<((date: DateValue) => boolean) | undefined>,
      default: undefined,
    },
    firstDayOfWeek: {
      type: String as PropType<SpectrumDatePickerProps["firstDayOfWeek"]>,
      default: undefined,
    },
    pageBehavior: {
      type: String as PropType<SpectrumDatePickerProps["pageBehavior"]>,
      default: undefined,
    },
    placeholderValue: {
      type: Object as PropType<DateValue | undefined>,
      default: undefined,
    },
    placeholder: {
      type: String as PropType<string | undefined>,
      default: "Select date range",
    },
    autoFocus: {
      type: Boolean,
      default: undefined,
    },
    label: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    startName: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    endName: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    form: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    allowsNonContiguousRanges: {
      type: Boolean,
      default: undefined,
    },
    "aria-label": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-labelledby": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaLabelledby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      default: undefined,
    },
  },
  setup(props) {
    const attrs = useAttrs();
    const locale = useLocale();
    const group = createDomRef<HTMLElement>();

    const state = useDateRangePickerState({
      get value() {
        return props.value as any;
      },
      get defaultValue() {
        return props.defaultValue as any;
      },
      onChange: props.onChange as any,
      get isOpen() {
        return props.isOpen;
      },
      get defaultOpen() {
        return props.defaultOpen;
      },
      onOpenChange: props.onOpenChange,
      get isDisabled() {
        return props.isDisabled;
      },
      get isReadOnly() {
        return props.isReadOnly;
      },
      get isRequired() {
        return props.isRequired;
      },
      get isInvalid() {
        return props.isInvalid;
      },
      get validationState() {
        return props.validationState;
      },
      get minValue() {
        return props.minValue;
      },
      get maxValue() {
        return props.maxValue;
      },
      isDateUnavailable: props.isDateUnavailable,
      get firstDayOfWeek() {
        return props.firstDayOfWeek;
      },
      get pageBehavior() {
        return props.pageBehavior;
      },
      get placeholderValue() {
        return props.placeholderValue;
      },
      get allowsNonContiguousRanges() {
        return props.allowsNonContiguousRanges;
      },
    } as any);

    const pickerAria = useDateRangePicker(
      {
        get label() {
          return props.label;
        },
        get "aria-label"() {
          return props["aria-label"] ?? props.ariaLabel ?? (attrs["aria-label"] as string | undefined);
        },
        get "aria-labelledby"() {
          return props["aria-labelledby"] ?? props.ariaLabelledby ?? (attrs["aria-labelledby"] as string | undefined);
        },
        get isDisabled() {
          return props.isDisabled;
        },
        get isReadOnly() {
          return props.isReadOnly;
        },
        get isRequired() {
          return props.isRequired;
        },
        get validationState() {
          return props.validationState;
        },
        get errorMessage() {
          return props.errorMessage;
        },
        get minValue() {
          return props.minValue;
        },
        get maxValue() {
          return props.maxValue;
        },
        isDateUnavailable: props.isDateUnavailable,
        get firstDayOfWeek() {
          return props.firstDayOfWeek;
        },
        get pageBehavior() {
          return props.pageBehavior;
        },
        get placeholderValue() {
          return props.placeholderValue;
        },
        get autoFocus() {
          return props.autoFocus;
        },
        get startName() {
          return props.startName;
        },
        get endName() {
          return props.endName;
        },
        get form() {
          return props.form;
        },
        get allowsNonContiguousRanges() {
          return props.allowsNonContiguousRanges;
        },
      } as any,
      state as any,
      group.refObject as any
    );

    const displayValue = computed(() => {
      const range = state.formatValue(locale.value.locale, {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      if (!range) {
        return props.placeholder ?? "Select date range";
      }

      return `${range.start} - ${range.end}`;
    });

    return () => {
      const calendarAriaLabel = props["aria-label"] ?? props.ariaLabel ?? props.label ?? "Range calendar";
      const buttonProps = pickerAria.buttonProps as Record<string, unknown>;
      const isButtonDisabled = Boolean(buttonProps.isDisabled);

      return h(
        "div",
        {
          class: ["react-spectrum-DateRangePicker", props.UNSAFE_className],
          style: props.UNSAFE_style,
        },
        [
          props.label
            ? h(
              "span",
              {
                ...pickerAria.labelProps,
                class: "react-spectrum-DateRangePicker-label",
              },
              props.label
            )
            : null,
          h(
            "div",
            {
              ...pickerAria.groupProps,
              ref: group.elementRef,
              class: "react-spectrum-DateRangePicker-group",
            },
            [
              h(
                "span",
                {
                  class: ["react-spectrum-DateRangePicker-value", { "is-placeholder": !(state.value.start && state.value.end) }],
                },
                displayValue.value
              ),
              h(
                "button",
                {
                  id: buttonProps.id as string | undefined,
                  type: "button",
                  class: "react-spectrum-DateRangePicker-button",
                  disabled: isButtonDisabled || undefined,
                  "aria-haspopup": buttonProps["aria-haspopup"] as string | undefined,
                  "aria-label": buttonProps["aria-label"] as string | undefined,
                  "aria-labelledby": buttonProps["aria-labelledby"] as string | undefined,
                  "aria-describedby": buttonProps["aria-describedby"] as string | undefined,
                  "aria-expanded": state.isOpen ? "true" : "false",
                  onClick: () => {
                    (buttonProps.onPress as (() => void) | undefined)?.();
                  },
                },
                "📅"
              ),
            ]
          ),
          state.displayValidation.validationErrors.length > 0
            ? h(
              "div",
              {
                ...pickerAria.errorMessageProps,
                class: "react-spectrum-DateRangePicker-error",
              },
              state.displayValidation.validationErrors.join(", ")
            )
            : null,
          h("div", {
            ...pickerAria.descriptionProps,
            style: { display: "none" },
          }),
          h(
            Popover as any,
            {
              state,
              triggerRef: group.refObject,
              placement: "bottom start",
              shouldFlip: true,
              hideArrow: true,
              shouldContainFocus: true,
            },
            {
              default: () => [
                h(RangeCalendar as any, {
                  "aria-label": calendarAriaLabel,
                  ...(pickerAria.calendarProps as Record<string, unknown>),
                }),
              ],
            }
          ),
        ]
      );
    };
  },
});
