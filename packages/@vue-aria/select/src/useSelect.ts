import { useMenuTrigger } from "@vue-aria/menu";
import { ListKeyboardDelegate, useTypeSelect } from "@vue-aria/selection";
import { useCollator } from "@vue-aria/i18n";
import { useField } from "@vue-aria/label";
import { chain, filterDOMProps, mergeProps, nodeContains, useId } from "@vue-aria/utils";
import { setInteractionModality } from "@vue-aria/interactions";
import type { KeyboardDelegate } from "@vue-aria/selection";
import type { Key } from "@vue-aria/collections";
import type { HiddenSelectProps } from "./HiddenSelect";

export interface SelectState {
  collection: any;
  disabledKeys: Set<Key>;
  selectionManager: any;
  selectedKey: Key | null;
  setSelectedKey: (key: Key) => void;
  isOpen: boolean;
  focusStrategy?: "first" | "last" | null;
  close: () => void;
  open: (strategy?: "first" | "last" | null) => void;
  toggle: (strategy?: "first" | "last" | null) => void;
  isFocused: boolean;
  setFocused: (isFocused: boolean) => void;
  displayValidation: {
    isInvalid: boolean;
    validationErrors: string[];
    validationDetails: ValidityState | null;
  };
  value?: string | string[] | null;
  defaultValue?: string | string[] | null;
  setValue?: (value: string | string[]) => void;
}

export interface AriaSelectOptions {
  keyboardDelegate?: KeyboardDelegate;
  isDisabled?: boolean;
  isRequired?: boolean;
  name?: string;
  form?: string;
  validationBehavior?: "aria" | "native";
  label?: string;
  errorMessage?: string;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  [key: string]: unknown;
}

export interface SelectAria {
  labelProps: Record<string, unknown>;
  triggerProps: Record<string, unknown>;
  valueProps: Record<string, unknown>;
  menuProps: Record<string, unknown>;
  descriptionProps: Record<string, unknown>;
  errorMessageProps: Record<string, unknown>;
  isInvalid: boolean;
  validationErrors: string[];
  validationDetails: ValidityState | null;
  hiddenSelectProps: HiddenSelectProps;
}

interface SelectData {
  isDisabled?: boolean;
  isRequired?: boolean;
  name?: string;
  form?: string;
  validationBehavior?: "aria" | "native";
}

export const selectData: WeakMap<object, SelectData> = new WeakMap();

export function useSelect(
  props: AriaSelectOptions,
  state: SelectState,
  ref: { current: HTMLElement | null }
): SelectAria {
  const { keyboardDelegate, isDisabled, isRequired, name, form, validationBehavior = "aria" } = props;

  const collator = useCollator({ usage: "search", sensitivity: "base" });
  const delegate =
    keyboardDelegate ??
    new ListKeyboardDelegate(state.collection, state.disabledKeys, ref, collator);

  const { menuTriggerProps, menuProps } = useMenuTrigger(
    {
      isDisabled,
      type: "listbox",
    },
    state as any,
    ref
  );

  const onArrowKeyDown = (event: KeyboardEvent) => {
    if (state.selectionManager.selectionMode === "multiple") {
      return;
    }

    switch (event.key) {
      case "ArrowLeft": {
        event.preventDefault();
        const key = state.selectedKey != null ? delegate.getKeyAbove?.(state.selectedKey) : delegate.getFirstKey?.();
        if (key) {
          state.setSelectedKey(key);
        }
        break;
      }
      case "ArrowRight": {
        event.preventDefault();
        const key = state.selectedKey != null ? delegate.getKeyBelow?.(state.selectedKey) : delegate.getFirstKey?.();
        if (key) {
          state.setSelectedKey(key);
        }
        break;
      }
    }
  };

  const { typeSelectProps } = useTypeSelect({
    keyboardDelegate: delegate,
    selectionManager: state.selectionManager,
    onTypeSelect(key) {
      state.setSelectedKey(key);
    },
  });

  const { isInvalid, validationErrors, validationDetails } = state.displayValidation;
  const { labelProps, fieldProps, descriptionProps, errorMessageProps } = useField({
    ...(props as any),
    labelElementType: "span",
    isInvalid,
    errorMessage: props.errorMessage || validationErrors.join(", "),
  });

  const id = useId();
  let typeaheadProps = { ...typeSelectProps } as Record<string, unknown>;
  typeaheadProps.onKeyDown = typeaheadProps.onKeyDownCapture ?? typeaheadProps.onKeydownCapture;
  delete typeaheadProps.onKeyDownCapture;
  delete typeaheadProps.onKeydownCapture;
  if (state.selectionManager.selectionMode === "multiple") {
    typeaheadProps = {};
  }

  const domProps = filterDOMProps(props, { labelable: true });
  const triggerPropsBase = mergeProps(typeaheadProps, menuTriggerProps, fieldProps);

  selectData.set(state as object, {
    isDisabled,
    isRequired,
    name,
    form,
    validationBehavior,
  });

  return {
    labelProps: {
      ...labelProps,
      onClick: () => {
        if (!props.isDisabled) {
          ref.current?.focus();
          setInteractionModality("keyboard");
        }
      },
    },
    triggerProps: mergeProps(domProps, {
      ...triggerPropsBase,
      isDisabled,
      onKeyDown: chain(
        triggerPropsBase.onKeyDown as ((...args: any[]) => void) | undefined,
        onArrowKeyDown,
        props.onKeyDown
      ),
      onKeyUp: props.onKeyUp,
      "aria-labelledby": [
        id,
        triggerPropsBase["aria-labelledby"],
        triggerPropsBase["aria-label"] && !triggerPropsBase["aria-labelledby"] ? triggerPropsBase.id : null,
      ]
        .filter(Boolean)
        .join(" "),
      onFocus(event: FocusEvent) {
        if (state.isFocused) {
          return;
        }
        props.onFocus?.(event);
        props.onFocusChange?.(true);
        state.setFocused(true);
      },
      onBlur(event: FocusEvent) {
        if (state.isOpen) {
          return;
        }
        props.onBlur?.(event);
        props.onFocusChange?.(false);
        state.setFocused(false);
      },
    }),
    valueProps: {
      id,
    },
    menuProps: {
      ...menuProps,
      autoFocus: state.focusStrategy || true,
      shouldSelectOnPressUp: true,
      shouldFocusOnHover: true,
      disallowEmptySelection: true,
      linkBehavior: "selection",
      onBlur: (event: FocusEvent) => {
        if (nodeContains(event.currentTarget as Node | null, event.relatedTarget as Node | null)) {
          return;
        }
        props.onBlur?.(event);
        props.onFocusChange?.(false);
        state.setFocused(false);
      },
      "aria-labelledby": [
        fieldProps["aria-labelledby"],
        triggerPropsBase["aria-label"] && !fieldProps["aria-labelledby"] ? triggerPropsBase.id : null,
      ]
        .filter(Boolean)
        .join(" "),
    },
    descriptionProps,
    errorMessageProps,
    isInvalid,
    validationErrors,
    validationDetails,
    hiddenSelectProps: {
      isDisabled,
      name,
      label: props.label as string | undefined,
      state,
      triggerRef: ref,
      form,
    },
  };
}
