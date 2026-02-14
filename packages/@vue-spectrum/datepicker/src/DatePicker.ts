import { useDatePicker, useDateRangePicker } from "@vue-aria/datepicker";
import { useDatePickerState, useDateRangePickerState } from "@vue-aria/datepicker-state";
import { useLocale } from "@vue-aria/i18n";
import { defineComponent, h, computed, ref, useAttrs, onMounted, nextTick, type PropType } from "vue";
import { Calendar, RangeCalendar } from "@vue-spectrum/calendar";
import { Popover } from "@vue-spectrum/menu";
import { useProviderProps } from "@vue-spectrum/provider";

type DateValue = any;
export type DateRangeValue = { start: DateValue; end: DateValue } | null;

export interface SpectrumDatePickerProps {
  value?: DateValue | null | undefined;
  defaultValue?: DateValue | null | undefined;
  onChange?: ((value: DateValue | null) => void) | undefined;
  isOpen?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((isOpen: boolean) => void) | undefined;
  onFocus?: ((event: FocusEvent) => void) | undefined;
  onBlur?: ((event: FocusEvent) => void) | undefined;
  onFocusChange?: ((isFocused: boolean) => void) | undefined;
  onKeyDown?: ((event: KeyboardEvent) => void) | undefined;
  onKeyUp?: ((event: KeyboardEvent) => void) | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  isRequired?: boolean | undefined;
  isQuiet?: boolean | undefined;
  isInvalid?: boolean | undefined;
  validationState?: "valid" | "invalid" | null | undefined;
  errorMessage?: string | undefined;
  minValue?: DateValue | null | undefined;
  maxValue?: DateValue | null | undefined;
  isDateUnavailable?: ((date: DateValue) => boolean) | undefined;
  firstDayOfWeek?: "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | undefined;
  pageBehavior?: "visible" | "single" | undefined;
  visibleMonths?: number | undefined;
  placeholderValue?: DateValue | undefined;
  placeholder?: string | undefined;
  autoFocus?: boolean | undefined;
  label?: string | undefined;
  description?: string | undefined;
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

function createMergedProps<T extends Record<string, unknown>>(
  props: T,
  attrs: Record<string, unknown>
): T & Record<string, unknown> {
  const providerDefaults = useProviderProps({} as Record<string, unknown>) as Record<string, unknown>;
  return new Proxy({} as T & Record<string, unknown>, {
    get(_, key) {
      if (typeof key !== "string") {
        return undefined;
      }

      const propValue = props[key];
      if (propValue !== undefined) {
        return propValue;
      }

      const attrValue = attrs[key];
      if (attrValue !== undefined) {
        return attrValue;
      }

      return providerDefaults[key];
    },
  });
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
    onFocus: {
      type: Function as PropType<((event: FocusEvent) => void) | undefined>,
      default: undefined,
    },
    onBlur: {
      type: Function as PropType<((event: FocusEvent) => void) | undefined>,
      default: undefined,
    },
    onFocusChange: {
      type: Function as PropType<((isFocused: boolean) => void) | undefined>,
      default: undefined,
    },
    onKeyDown: {
      type: Function as PropType<((event: KeyboardEvent) => void) | undefined>,
      default: undefined,
    },
    onKeyUp: {
      type: Function as PropType<((event: KeyboardEvent) => void) | undefined>,
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
    isQuiet: {
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
    visibleMonths: {
      type: Number as PropType<number | undefined>,
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
    description: {
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
    const merged = createMergedProps(
      props as Record<string, unknown>,
      attrs as Record<string, unknown>
    ) as SpectrumDatePickerProps & Record<string, unknown>;
    const locale = useLocale();
    const group = createDomRef<HTMLElement>();
    const triggerRef = ref<HTMLElement | null>(null);

    const state = useDatePickerState({
      get value() {
        return merged.value;
      },
      get defaultValue() {
        return merged.defaultValue;
      },
      onChange: merged.onChange,
      get isOpen() {
        return merged.isOpen;
      },
      get defaultOpen() {
        return merged.defaultOpen;
      },
      onOpenChange: merged.onOpenChange,
      get isDisabled() {
        return merged.isDisabled;
      },
      get isReadOnly() {
        return merged.isReadOnly;
      },
      get isRequired() {
        return merged.isRequired;
      },
      get isInvalid() {
        return merged.isInvalid;
      },
      get validationState() {
        return merged.validationState;
      },
      get minValue() {
        return merged.minValue;
      },
      get maxValue() {
        return merged.maxValue;
      },
      isDateUnavailable: merged.isDateUnavailable,
      get firstDayOfWeek() {
        return merged.firstDayOfWeek;
      },
      get pageBehavior() {
        return merged.pageBehavior;
      },
      get placeholderValue() {
        return merged.placeholderValue;
      },
    } as any);

    const pickerAria = useDatePicker(
      {
        get label() {
          return merged.label;
        },
        get description() {
          return merged.description;
        },
        get "aria-label"() {
          return merged["aria-label"] ?? merged.ariaLabel ?? (attrs["aria-label"] as string | undefined);
        },
        get "aria-labelledby"() {
          return merged["aria-labelledby"] ?? merged.ariaLabelledby ?? (attrs["aria-labelledby"] as string | undefined);
        },
        get isDisabled() {
          return merged.isDisabled;
        },
        get isReadOnly() {
          return merged.isReadOnly;
        },
        get isRequired() {
          return merged.isRequired;
        },
        get validationState() {
          return merged.validationState;
        },
        get errorMessage() {
          return merged.errorMessage;
        },
        get minValue() {
          return merged.minValue;
        },
        get maxValue() {
          return merged.maxValue;
        },
        isDateUnavailable: merged.isDateUnavailable,
        get firstDayOfWeek() {
          return merged.firstDayOfWeek;
        },
        get pageBehavior() {
          return merged.pageBehavior;
        },
        get placeholderValue() {
          return merged.placeholderValue;
        },
        get autoFocus() {
          return merged.autoFocus;
        },
        get name() {
          return merged.name;
        },
        get form() {
          return merged.form;
        },
        get onFocus() {
          return merged.onFocus;
        },
        get onBlur() {
          return merged.onBlur;
        },
        get onFocusChange() {
          return merged.onFocusChange;
        },
        get onKeyDown() {
          return merged.onKeyDown;
        },
        get onKeyUp() {
          return merged.onKeyUp;
        },
      } as any,
      state as any,
      group.refObject as any
    );

    const displayValue = computed(() => {
      if (!state.value) {
        return merged.placeholder ?? "Select date";
      }

      return state.formatValue(locale.value.locale, {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    });

    const errorText = computed(() => {
      if (merged.errorMessage) {
        return merged.errorMessage;
      }

      return state.displayValidation.validationErrors.join(", ");
    });

    const showError = computed(() =>
      Boolean(errorText.value)
      && Boolean(
        merged.isInvalid
        || merged.validationState === "invalid"
        || state.isInvalid
        || state.displayValidation.validationErrors.length > 0
      )
    );

    onMounted(() => {
      if (!merged.autoFocus || merged.isDisabled || merged.isReadOnly) {
        return;
      }

      void nextTick(() => {
        triggerRef.value?.focus();
      });
    });

    return () => {
      const calendarAriaLabel = merged["aria-label"] ?? merged.ariaLabel ?? merged.label ?? "Calendar";
      const buttonProps = pickerAria.buttonProps as Record<string, unknown>;
      const isButtonDisabled = Boolean(buttonProps.isDisabled);

      return h(
        "div",
        {
          class: [
            "react-spectrum-DatePicker",
            {
              "is-invalid": Boolean(
                merged.isInvalid
                || merged.validationState === "invalid"
                || state.isInvalid
              ),
              "is-disabled": Boolean(merged.isDisabled),
              "is-quiet": Boolean(merged.isQuiet),
            },
            merged.UNSAFE_className,
          ],
          style: merged.UNSAFE_style,
        },
        [
          merged.name
            ? h("input", {
              type: "hidden",
              name: merged.name,
              form: merged.form,
              value: state.value ? state.value.toString() : "",
            })
            : null,
          merged.label
            ? h(
              "span",
              {
                ...pickerAria.labelProps,
                class: "react-spectrum-DatePicker-label",
              },
              merged.label
            )
            : null,
          h(
            "div",
            {
              ...pickerAria.groupProps,
              ref: group.elementRef,
              class: "react-spectrum-DatePicker-group",
              "aria-required": merged.isRequired ? "true" : undefined,
              onKeydown: (pickerAria.groupProps as Record<string, unknown>).onKeyDown as ((event: KeyboardEvent) => void) | undefined,
              onKeyup: (pickerAria.groupProps as Record<string, unknown>).onKeyUp as ((event: KeyboardEvent) => void) | undefined,
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
                  ref: triggerRef,
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
          showError.value
            ? h(
              "div",
              {
                ...pickerAria.errorMessageProps,
                class: "react-spectrum-DatePicker-error",
              },
              errorText.value
            )
            : null,
          h("div", {
            ...pickerAria.descriptionProps,
            class: "react-spectrum-DatePicker-description",
            style: merged.description ? undefined : { display: "none" },
          }, merged.description),
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
                  visibleMonths: merged.visibleMonths,
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
    onFocus: {
      type: Function as PropType<((event: FocusEvent) => void) | undefined>,
      default: undefined,
    },
    onBlur: {
      type: Function as PropType<((event: FocusEvent) => void) | undefined>,
      default: undefined,
    },
    onFocusChange: {
      type: Function as PropType<((isFocused: boolean) => void) | undefined>,
      default: undefined,
    },
    onKeyDown: {
      type: Function as PropType<((event: KeyboardEvent) => void) | undefined>,
      default: undefined,
    },
    onKeyUp: {
      type: Function as PropType<((event: KeyboardEvent) => void) | undefined>,
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
    isQuiet: {
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
    visibleMonths: {
      type: Number as PropType<number | undefined>,
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
    description: {
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
    const merged = createMergedProps(
      props as Record<string, unknown>,
      attrs as Record<string, unknown>
    ) as SpectrumDateRangePickerProps & Record<string, unknown>;
    const locale = useLocale();
    const group = createDomRef<HTMLElement>();
    const triggerRef = ref<HTMLElement | null>(null);

    const state = useDateRangePickerState({
      get value() {
        return merged.value as any;
      },
      get defaultValue() {
        return merged.defaultValue as any;
      },
      onChange: merged.onChange as any,
      get isOpen() {
        return merged.isOpen;
      },
      get defaultOpen() {
        return merged.defaultOpen;
      },
      onOpenChange: merged.onOpenChange,
      get isDisabled() {
        return merged.isDisabled;
      },
      get isReadOnly() {
        return merged.isReadOnly;
      },
      get isRequired() {
        return merged.isRequired;
      },
      get isInvalid() {
        return merged.isInvalid;
      },
      get validationState() {
        return merged.validationState;
      },
      get minValue() {
        return merged.minValue;
      },
      get maxValue() {
        return merged.maxValue;
      },
      isDateUnavailable: merged.isDateUnavailable,
      get firstDayOfWeek() {
        return merged.firstDayOfWeek;
      },
      get pageBehavior() {
        return merged.pageBehavior;
      },
      get placeholderValue() {
        return merged.placeholderValue;
      },
      get allowsNonContiguousRanges() {
        return merged.allowsNonContiguousRanges;
      },
    } as any);

    const pickerAria = useDateRangePicker(
      {
        get label() {
          return merged.label;
        },
        get description() {
          return merged.description;
        },
        get "aria-label"() {
          return merged["aria-label"] ?? merged.ariaLabel ?? (attrs["aria-label"] as string | undefined);
        },
        get "aria-labelledby"() {
          return merged["aria-labelledby"] ?? merged.ariaLabelledby ?? (attrs["aria-labelledby"] as string | undefined);
        },
        get isDisabled() {
          return merged.isDisabled;
        },
        get isReadOnly() {
          return merged.isReadOnly;
        },
        get isRequired() {
          return merged.isRequired;
        },
        get validationState() {
          return merged.validationState;
        },
        get errorMessage() {
          return merged.errorMessage;
        },
        get minValue() {
          return merged.minValue;
        },
        get maxValue() {
          return merged.maxValue;
        },
        isDateUnavailable: merged.isDateUnavailable,
        get firstDayOfWeek() {
          return merged.firstDayOfWeek;
        },
        get pageBehavior() {
          return merged.pageBehavior;
        },
        get placeholderValue() {
          return merged.placeholderValue;
        },
        get autoFocus() {
          return merged.autoFocus;
        },
        get startName() {
          return merged.startName;
        },
        get endName() {
          return merged.endName;
        },
        get form() {
          return merged.form;
        },
        get allowsNonContiguousRanges() {
          return merged.allowsNonContiguousRanges;
        },
        get onFocus() {
          return merged.onFocus;
        },
        get onBlur() {
          return merged.onBlur;
        },
        get onFocusChange() {
          return merged.onFocusChange;
        },
        get onKeyDown() {
          return merged.onKeyDown;
        },
        get onKeyUp() {
          return merged.onKeyUp;
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
        return merged.placeholder ?? "Select date range";
      }

      return `${range.start} - ${range.end}`;
    });

    const errorText = computed(() => {
      if (merged.errorMessage) {
        return merged.errorMessage;
      }

      return state.displayValidation.validationErrors.join(", ");
    });

    const showError = computed(() =>
      Boolean(errorText.value)
      && Boolean(
        merged.isInvalid
        || merged.validationState === "invalid"
        || state.isInvalid
        || state.displayValidation.validationErrors.length > 0
      )
    );

    onMounted(() => {
      if (!merged.autoFocus || merged.isDisabled || merged.isReadOnly) {
        return;
      }

      void nextTick(() => {
        triggerRef.value?.focus();
      });
    });

    return () => {
      const calendarAriaLabel = merged["aria-label"] ?? merged.ariaLabel ?? merged.label ?? "Range calendar";
      const buttonProps = pickerAria.buttonProps as Record<string, unknown>;
      const isButtonDisabled = Boolean(buttonProps.isDisabled);

      return h(
        "div",
        {
          class: [
            "react-spectrum-DateRangePicker",
            {
              "is-invalid": Boolean(
                merged.isInvalid
                || merged.validationState === "invalid"
                || state.isInvalid
              ),
              "is-disabled": Boolean(merged.isDisabled),
              "is-quiet": Boolean(merged.isQuiet),
            },
            merged.UNSAFE_className,
          ],
          style: merged.UNSAFE_style,
        },
        [
          merged.startName
            ? h("input", {
              type: "hidden",
              name: merged.startName,
              form: merged.form,
              value: state.value.start ? state.value.start.toString() : "",
            })
            : null,
          merged.endName
            ? h("input", {
              type: "hidden",
              name: merged.endName,
              form: merged.form,
              value: state.value.end ? state.value.end.toString() : "",
            })
            : null,
          merged.label
            ? h(
              "span",
              {
                ...pickerAria.labelProps,
                class: "react-spectrum-DateRangePicker-label",
              },
              merged.label
            )
            : null,
          h(
            "div",
            {
              ...pickerAria.groupProps,
              ref: group.elementRef,
              class: "react-spectrum-DateRangePicker-group",
              "aria-required": merged.isRequired ? "true" : undefined,
              onKeydown: (pickerAria.groupProps as Record<string, unknown>).onKeyDown as ((event: KeyboardEvent) => void) | undefined,
              onKeyup: (pickerAria.groupProps as Record<string, unknown>).onKeyUp as ((event: KeyboardEvent) => void) | undefined,
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
                  ref: triggerRef,
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
          showError.value
            ? h(
              "div",
              {
                ...pickerAria.errorMessageProps,
                class: "react-spectrum-DateRangePicker-error",
              },
              errorText.value
            )
            : null,
          h("div", {
            ...pickerAria.descriptionProps,
            class: "react-spectrum-DateRangePicker-description",
            style: merged.description ? undefined : { display: "none" },
          }, merged.description),
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
                  visibleMonths: merged.visibleMonths,
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
