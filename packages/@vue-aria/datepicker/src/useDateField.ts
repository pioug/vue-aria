import { createFocusManager, type FocusManager } from "@vue-aria/focus";
import { useFormValidation } from "@vue-aria/form";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { useFocusWithin } from "@vue-aria/interactions";
import { useField } from "@vue-aria/label";
import {
  filterDOMProps,
  mergeProps,
  useDescription,
  useFormReset,
  useLayoutEffect,
} from "@vue-aria/utils";
import { ref as vueRef } from "vue";
import { useDatePickerGroup } from "./useDatePickerGroup";
import { intlMessages } from "./intlMessages";
import type { ValidationResult } from "@vue-aria/form-state";
import type {
  DateFieldState,
  TimeFieldState,
  TimeValue,
} from "@vue-aria/datepicker-state";
import type {
  AriaDateFieldProps,
  AriaTimeFieldProps,
  DateValue,
  DOMAttributes,
  GroupDOMAttributes,
  RefObject,
} from "./types";

type InputElementRef =
  | { current: HTMLInputElement | null }
  | { value: HTMLInputElement | null };

export interface AriaDateFieldOptions<T extends DateValue>
  extends Omit<
    AriaDateFieldProps<T>,
    | "value"
    | "defaultValue"
    | "onChange"
    | "minValue"
    | "maxValue"
    | "placeholderValue"
    | "validate"
  > {
  inputRef?: InputElementRef;
}

export interface DateFieldAria extends ValidationResult {
  labelProps: DOMAttributes;
  fieldProps: GroupDOMAttributes;
  inputProps: Record<string, unknown>;
  descriptionProps: DOMAttributes;
  errorMessageProps: DOMAttributes;
}

interface HookData {
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  focusManager: FocusManager;
}

export const hookData: WeakMap<DateFieldState, HookData> = new WeakMap();

// Private props passed by higher-level picker hooks.
export const roleSymbol = `__role_${Date.now()}`;
export const focusManagerSymbol = `__focusManager_${Date.now()}`;

export function useDateField<T extends DateValue>(
  props: AriaDateFieldOptions<T>,
  state: DateFieldState,
  ref: RefObject<Element>
): DateFieldAria {
  const { isInvalid, validationErrors, validationDetails } = state.displayValidation;
  const { labelProps, fieldProps, descriptionProps, errorMessageProps } = useField({
    ...props,
    labelElementType: "span",
    isInvalid,
    errorMessage: (props as any).errorMessage || validationErrors,
  });

  const valueOnFocus = vueRef<DateValue | null>(null);
  const { focusWithinProps } = useFocusWithin({
    ...props,
    onFocusWithin(event) {
      valueOnFocus.value = state.value;
      (props.onFocus as ((event: FocusEvent) => void) | undefined)?.(
        event as FocusEvent
      );
    },
    onBlurWithin(event) {
      state.confirmPlaceholder();
      if (state.value !== valueOnFocus.value) {
        state.commitValidation();
      }
      (props.onBlur as ((event: FocusEvent) => void) | undefined)?.(
        event as FocusEvent
      );
    },
    onFocusWithinChange: props.onFocusChange as
      | ((isFocusWithin: boolean) => void)
      | undefined,
  });

  const stringFormatter = useLocalizedStringFormatter(
    intlMessages as any,
    "@react-aria/datepicker"
  );
  const message =
    state.maxGranularity === "hour"
      ? "selectedTimeDescription"
      : "selectedDateDescription";
  const field = state.maxGranularity === "hour" ? "time" : "date";
  const selectedDescription = state.value
    ? stringFormatter.format(message, { [field]: state.formatValue({ month: "long" }) })
    : "";
  const { descriptionProps: selectedDescriptionProps } =
    useDescription(selectedDescription);

  const describedBy =
    (props as any)[roleSymbol] === "presentation"
      ? (fieldProps as any)["aria-describedby"]
      : [
        selectedDescriptionProps.value["aria-describedby"],
        (fieldProps as any)["aria-describedby"],
      ]
        .filter(Boolean)
        .join(" ") || undefined;

  const propsFocusManager = (props as any)[focusManagerSymbol] as FocusManager | undefined;
  const focusManager = propsFocusManager || createFocusManager(ref as any);
  const groupProps = useDatePickerGroup(
    state,
    ref,
    (props as any)[roleSymbol] === "presentation"
  );

  hookData.set(state, {
    ariaLabel: props["aria-label"] as string | undefined,
    ariaLabelledBy:
      [labelProps.id as string | undefined, props["aria-labelledby"]]
        .filter(Boolean)
        .join(" ") || undefined,
    ariaDescribedBy: describedBy,
    focusManager,
  });

  const autoFocusPending = vueRef(Boolean(props.autoFocus));
  useLayoutEffect(() => {
    if (autoFocusPending.value) {
      focusManager.focusFirst();
      autoFocusPending.value = false;
    }
  });

  const fieldDOMProps: GroupDOMAttributes =
    (props as any)[roleSymbol] === "presentation"
      ? { role: "presentation" }
      : (mergeProps(fieldProps, {
        role: "group",
        "aria-disabled": props.isDisabled || undefined,
        "aria-describedby": describedBy,
      }) as unknown as GroupDOMAttributes);

  const inputRef = toInputRef(props.inputRef);

  useFormReset(inputRef as any, state.defaultValue, state.setValue);
  useFormValidation(
    {
      ...props,
      focus() {
        focusManager.focusFirst();
      },
    },
    state,
    inputRef as any
  );

  const inputProps: Record<string, unknown> = {
    type: "hidden",
    name: props.name,
    form: props.form,
    value: state.value?.toString() || "",
    disabled: props.isDisabled,
  };

  if (props.validationBehavior === "native") {
    inputProps.type = "text";
    inputProps.hidden = true;
    inputProps.required = props.isRequired;
    inputProps.onChange = () => {};
  }

  const domProps = filterDOMProps(props as Record<string, unknown>);
  return {
    labelProps: {
      ...labelProps,
      onClick: () => {
        focusManager.focusFirst();
      },
    },
    fieldProps: mergeProps(
      domProps,
      fieldDOMProps,
      groupProps,
      focusWithinProps,
      {
        onKeyDown(event: KeyboardEvent) {
          (props.onKeyDown as ((event: KeyboardEvent) => void) | undefined)?.(
            event
          );
        },
        onKeyUp(event: KeyboardEvent) {
          (props.onKeyUp as ((event: KeyboardEvent) => void) | undefined)?.(
            event
          );
        },
        style: {
          unicodeBidi: "isolate",
        },
      }
    ) as GroupDOMAttributes,
    inputProps,
    descriptionProps: descriptionProps as DOMAttributes,
    errorMessageProps: errorMessageProps as DOMAttributes,
    isInvalid,
    validationErrors,
    validationDetails,
  };
}

export interface AriaTimeFieldOptions<T extends TimeValue>
  extends AriaTimeFieldProps<T> {
  inputRef?: InputElementRef;
}

export function useTimeField<T extends TimeValue>(
  props: AriaTimeFieldOptions<T>,
  state: TimeFieldState,
  ref: RefObject<Element>
): DateFieldAria {
  const result = useDateField(props as any, state as any, ref);
  result.inputProps.value = state.timeValue?.toString() || "";
  return result;
}

function toInputRef(ref?: InputElementRef) {
  return {
    get value(): HTMLInputElement | null {
      if (!ref) {
        return null;
      }
      return "value" in ref ? ref.value : ref.current;
    },
    set value(value: HTMLInputElement | null) {
      if (!ref) {
        return;
      }
      if ("value" in ref) {
        ref.value = value;
      } else {
        ref.current = value;
      }
    },
  };
}
