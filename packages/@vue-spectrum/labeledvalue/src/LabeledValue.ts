import {
  CalendarDate,
  CalendarDateTime,
  getLocalTimeZone,
  Time,
  toCalendarDateTime,
  today,
  ZonedDateTime,
} from "@internationalized/date";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import {
  Field,
  type LabelAlign,
  type LabelPosition,
  type NecessityIndicator,
} from "@vue-spectrum/label";
import { classNames } from "@vue-spectrum/utils";
import {
  defineComponent,
  h,
  isVNode,
  onMounted,
  ref,
  type PropType,
  type VNode,
  type VNodeChild,
} from "vue";

interface RangeValue<T> {
  start: T;
  end: T;
}

export type DateTime = Date | CalendarDate | CalendarDateTime | ZonedDateTime | Time;
type NumberValue = number | RangeValue<number>;
type DateTimeValue = DateTime | RangeValue<DateTime>;

export type SpectrumLabeledValueValue =
  | string[]
  | string
  | Date
  | CalendarDate
  | CalendarDateTime
  | ZonedDateTime
  | Time
  | number
  | RangeValue<number>
  | RangeValue<DateTime>
  | VNode;

interface ErrorMessageContext {
  isInvalid: boolean;
  validationErrors: string[];
  validationDetails: unknown;
}

type ErrorMessageValue = string | ((context: ErrorMessageContext) => unknown);

export interface SpectrumLabeledValueProps {
  value?: SpectrumLabeledValueValue | undefined;
  formatOptions?:
    | Intl.NumberFormatOptions
    | Intl.DateTimeFormatOptions
    | Intl.ListFormatOptions
    | undefined;
  label?: string | undefined;
  labelPosition?: LabelPosition | undefined;
  labelAlign?: LabelAlign | null | undefined;
  isRequired?: boolean | undefined;
  necessityIndicator?: NecessityIndicator | null | undefined;
  includeNecessityIndicatorInAccessibilityName?: boolean | undefined;
  validationState?: "valid" | "invalid" | undefined;
  isInvalid?: boolean | undefined;
  description?: string | undefined;
  errorMessage?: ErrorMessageValue | undefined;
  validationErrors?: string[] | undefined;
  validationDetails?: unknown;
  isDisabled?: boolean | undefined;
  showErrorIcon?: boolean | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRangeValue<T>(value: unknown): value is RangeValue<T> {
  return isObjectRecord(value) && "start" in value && "end" in value;
}

function isNumberRangeValue(value: unknown): value is RangeValue<number> {
  return (
    isRangeValue(value) &&
    typeof value.start === "number" &&
    typeof value.end === "number"
  );
}

function isDateTimeValue(value: unknown): value is DateTime {
  if (value instanceof Date) {
    return true;
  }

  if (!isObjectRecord(value)) {
    return false;
  }

  return "calendar" in value || "hour" in value || "timeZone" in value;
}

function isDateRangeValue(value: unknown): value is RangeValue<DateTime> {
  return isRangeValue(value) && isDateTimeValue(value.start) && isDateTimeValue(value.end);
}

function formatStringList(value: string[], formatOptions?: Intl.ListFormatOptions): string {
  return new Intl.ListFormat(undefined, formatOptions).format(value);
}

function formatNumber(value: NumberValue, formatOptions?: Intl.NumberFormatOptions): string {
  const formatter = new Intl.NumberFormat(undefined, formatOptions);
  if (isRangeValue(value)) {
    const formatRange = (
      formatter as Intl.NumberFormat & {
        formatRange?: (start: number, end: number) => string;
      }
    ).formatRange;

    if (formatRange) {
      return formatRange.call(formatter, value.start, value.end);
    }

    return `${formatter.format(value.start)}\u2013${formatter.format(value.end)}`;
  }

  return formatter.format(value);
}

function convertDateTime(value: DateTime, timeZone: string): Date {
  if (value instanceof Date) {
    return value;
  }

  if ("timeZone" in value) {
    return value.toDate();
  }

  if ("calendar" in value) {
    return value.toDate(timeZone);
  }

  const date = today(getLocalTimeZone());
  return toCalendarDateTime(date, value).toDate(timeZone);
}

function getDefaultFormatOptions(value: DateTime): Intl.DateTimeFormatOptions {
  if (value instanceof Date) {
    return { dateStyle: "long", timeStyle: "short" };
  }

  if ("timeZone" in value) {
    return {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      timeZone: value.timeZone,
      timeZoneName: "short",
    };
  }

  if ("hour" in value && "year" in value) {
    return { dateStyle: "long", timeStyle: "short" };
  }

  if ("hour" in value) {
    return { timeStyle: "short" };
  }

  return { dateStyle: "long" };
}

function formatDate(
  value: DateTimeValue,
  formatOptions?: Intl.DateTimeFormatOptions
): string {
  let resolvedFormatOptions = formatOptions;
  if (!resolvedFormatOptions) {
    resolvedFormatOptions = getDefaultFormatOptions(
      isRangeValue(value) ? value.start : value
    );
  }

  const dateFormatter = new Intl.DateTimeFormat(undefined, resolvedFormatOptions);
  const timeZone = dateFormatter.resolvedOptions().timeZone || getLocalTimeZone();
  const formatRange = (
    dateFormatter as Intl.DateTimeFormat & {
      formatRange?: (startDate: Date, endDate: Date) => string;
    }
  ).formatRange;

  if (isRangeValue(value)) {
    const start = convertDateTime(value.start, timeZone);
    const end = convertDateTime(value.end, timeZone);

    if (formatRange) {
      return formatRange.call(dateFormatter, start, end);
    }

    return `${dateFormatter.format(start)} \u2013 ${dateFormatter.format(end)}`;
  }

  return dateFormatter.format(convertDateTime(value, timeZone));
}

export const LabeledValue = defineComponent({
  name: "LabeledValue",
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Number, Array, Object, Date] as unknown as PropType<
        SpectrumLabeledValueValue | undefined
      >,
      default: undefined,
    },
    formatOptions: {
      type: Object as PropType<
        | Intl.NumberFormatOptions
        | Intl.DateTimeFormatOptions
        | Intl.ListFormatOptions
        | undefined
      >,
      default: undefined,
    },
    label: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    labelPosition: {
      type: String as PropType<LabelPosition | undefined>,
      default: undefined,
    },
    labelAlign: {
      type: String as PropType<LabelAlign | null | undefined>,
      default: undefined,
    },
    isRequired: {
      type: null as unknown as PropType<boolean | undefined>,
      default: undefined,
    },
    necessityIndicator: {
      type: String as PropType<NecessityIndicator | null | undefined>,
      default: undefined,
    },
    includeNecessityIndicatorInAccessibilityName: {
      type: Boolean,
      default: false,
    },
    validationState: {
      type: String as PropType<"valid" | "invalid" | undefined>,
      default: undefined,
    },
    isInvalid: {
      type: null as unknown as PropType<boolean | undefined>,
      default: undefined,
    },
    description: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    errorMessage: {
      type: [String, Function] as PropType<ErrorMessageValue | undefined>,
      default: undefined,
    },
    validationErrors: {
      type: Array as PropType<string[] | undefined>,
      default: undefined,
    },
    validationDetails: {
      type: null as unknown as PropType<unknown>,
      default: undefined,
    },
    isDisabled: {
      type: null as unknown as PropType<boolean | undefined>,
      default: undefined,
    },
    showErrorIcon: {
      type: Boolean,
      default: false,
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
      type: Object as PropType<Record<string, string | number> | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, expose }) {
    const elementRef = ref<HTMLElement | null>(null);

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
    });

    onMounted(() => {
      if (
        elementRef.value &&
        elementRef.value.querySelectorAll("input, [contenteditable], textarea").length > 0
      ) {
        throw new Error("LabeledValue cannot contain an editable value.");
      }
    });

    return () => {
      const value = props.value;
      let children: VNodeChild = "";

      if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
        children = formatStringList(
          value,
          props.formatOptions as Intl.ListFormatOptions | undefined
        );
      }

      if (isNumberRangeValue(value)) {
        children = formatNumber(
          value,
          props.formatOptions as Intl.NumberFormatOptions | undefined
        );
      }

      if (isDateRangeValue(value)) {
        children = formatDate(
          value,
          props.formatOptions as Intl.DateTimeFormatOptions | undefined
        );
      }

      if (typeof value === "number") {
        children = formatNumber(
          value,
          props.formatOptions as Intl.NumberFormatOptions | undefined
        );
      }

      if (isDateTimeValue(value)) {
        children = formatDate(
          value,
          props.formatOptions as Intl.DateTimeFormatOptions | undefined
        );
      }

      if (typeof value === "string") {
        children = value;
      }

      if (isVNode(value)) {
        children = value;
      }

      const domProps = filterDOMProps(attrs as Record<string, unknown>);
      const wrapperProps = mergeProps(domProps, {
        ref: elementRef,
        style: props.UNSAFE_style,
        "aria-label":
          props.ariaLabel ??
          ((attrs as Record<string, unknown>)["aria-label"] as string | undefined),
        "aria-labelledby":
          props.ariaLabelledby ??
          ((attrs as Record<string, unknown>)["aria-labelledby"] as string | undefined),
      });

      return h(
        Field,
        {
          label: props.label,
          labelPosition: props.labelPosition,
          labelAlign: props.labelAlign,
          isRequired: props.isRequired,
          necessityIndicator: props.necessityIndicator,
          includeNecessityIndicatorInAccessibilityName:
            props.includeNecessityIndicatorInAccessibilityName,
          validationState: props.validationState,
          isInvalid: props.isInvalid,
          description: props.description,
          errorMessage: props.errorMessage,
          validationErrors: props.validationErrors,
          validationDetails: props.validationDetails,
          isDisabled: props.isDisabled,
          showErrorIcon: props.showErrorIcon,
          elementType: "span",
          wrapperClassName: classNames(
            "spectrum-LabeledValue",
            props.UNSAFE_className
          ),
          wrapperProps,
        } as Record<string, unknown>,
        {
          default: () => [h("span", [children])],
        }
      );
    };
  },
});
