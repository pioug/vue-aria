import type { RadioGroupProps, RadioGroupState, ValidationResult } from "@vue-aria/radio-state";
import { useField } from "@vue-aria/label";
import { useFocusWithin } from "@vue-aria/interactions";
import { getFocusableTreeWalker } from "@vue-aria/focus";
import { useLocale } from "@vue-aria/i18n";
import { filterDOMProps, getOwnerWindow, mergeProps, useId } from "@vue-aria/utils";
import { radioGroupData } from "./utils";

export interface AriaRadioGroupProps extends RadioGroupProps {
  label?: string;
  form?: string;
  isReadOnly?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  orientation?: "horizontal" | "vertical";
  validationBehavior?: "aria" | "native";
  description?: string;
  errorMessage?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-errormessage"?: string;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;
  [key: string]: unknown;
}

export interface RadioGroupAria extends ValidationResult {
  radioGroupProps: Record<string, unknown>;
  labelProps: Record<string, unknown>;
  descriptionProps: Record<string, unknown>;
  errorMessageProps: Record<string, unknown>;
}

export function useRadioGroup(props: AriaRadioGroupProps, state: RadioGroupState): RadioGroupAria {
  const {
    name,
    form,
    isReadOnly,
    isRequired,
    isDisabled,
    orientation = "vertical",
    validationBehavior = "aria",
  } = props;
  const locale = useLocale();
  const direction = locale.value.direction;

  const { isInvalid, validationErrors, validationDetails } = state.displayValidation;
  const { labelProps, fieldProps, descriptionProps, errorMessageProps } = useField({
    ...props,
    labelElementType: "span",
    isInvalid: state.isInvalid,
    errorMessage: props.errorMessage || validationErrors.join(", "),
  });
  const domProps = filterDOMProps(props, { labelable: true });

  const { focusWithinProps } = useFocusWithin({
    onBlurWithin(event) {
      props.onBlur?.(event);
      if (!state.selectedValue) {
        state.setLastFocusedValue(null);
      }
    },
    onFocusWithin: props.onFocus,
    onFocusWithinChange: props.onFocusChange,
  });

  const onKeydown = (event: KeyboardEvent) => {
    let nextDir: "next" | "prev" | null = null;
    switch (event.key) {
      case "ArrowRight":
        nextDir = direction === "rtl" && orientation !== "vertical" ? "prev" : "next";
        break;
      case "ArrowLeft":
        nextDir = direction === "rtl" && orientation !== "vertical" ? "next" : "prev";
        break;
      case "ArrowDown":
        nextDir = "next";
        break;
      case "ArrowUp":
        nextDir = "prev";
        break;
      default:
        return;
    }

    event.preventDefault();
    const walker = getFocusableTreeWalker(event.currentTarget as Element, {
      from: event.target as Element,
      accept: (node) =>
        node instanceof getOwnerWindow(node).HTMLInputElement
        && (node as HTMLInputElement).type === "radio",
    });

    let nextElem: Element | null = null;
    if (nextDir === "next") {
      nextElem = walker.nextNode() as Element | null;
      if (!nextElem) {
        walker.currentNode = event.currentTarget as Node;
        nextElem = walker.firstChild() as Element | null;
      }
    } else {
      nextElem = walker.previousNode() as Element | null;
      if (!nextElem) {
        walker.currentNode = event.currentTarget as Node;
        nextElem = walker.lastChild() as Element | null;
      }
    }

    if (nextElem && nextElem instanceof HTMLInputElement) {
      nextElem.focus();
      state.setSelectedValue(nextElem.value);
    }
  };

  const groupName = useId(name);
  radioGroupData.set(state, {
    name: groupName,
    form,
    descriptionId: descriptionProps.id as string | undefined,
    errorMessageId: errorMessageProps.id as string | undefined,
    validationBehavior,
  });

  return {
    radioGroupProps: mergeProps(domProps, {
      role: "radiogroup",
      onKeydown,
      "aria-invalid": state.isInvalid || undefined,
      "aria-errormessage": props["aria-errormessage"],
      "aria-readonly": isReadOnly || undefined,
      "aria-required": isRequired || undefined,
      "aria-disabled": isDisabled || undefined,
      "aria-orientation": orientation,
      ...fieldProps,
      ...focusWithinProps,
    }),
    labelProps,
    descriptionProps,
    errorMessageProps,
    isInvalid,
    validationErrors,
    validationDetails,
  };
}
