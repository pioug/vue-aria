import { computed, toValue } from "vue";
import { useId } from "@vue-aria/ssr";
import { nodeContains, mergeProps } from "@vue-aria/utils";
import { useTextField } from "@vue-aria/textfield";
import { useListBox } from "@vue-aria/listbox";
import type { ListBoxItem } from "@vue-aria/listbox";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type {
  FocusStrategy,
  UseComboBoxStateResult,
} from "@vue-aria/combobox-state";

interface PressLikeEvent {
  pointerType: string;
}

export interface UseComboBoxOptions {
  id?: MaybeReactive<string | undefined>;
  label?: MaybeReactive<string | undefined>;
  description?: MaybeReactive<string | undefined>;
  errorMessage?: MaybeReactive<string | undefined>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  isReadOnly?: MaybeReactive<boolean | undefined>;
  isRequired?: MaybeReactive<boolean | undefined>;
  shouldFocusWrap?: MaybeReactive<boolean | undefined>;
  inputRef: MaybeReactive<HTMLInputElement | null | undefined>;
  popoverRef: MaybeReactive<Element | null | undefined>;
  listBoxRef: MaybeReactive<HTMLElement | null | undefined>;
  buttonRef?: MaybeReactive<HTMLElement | null | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  "aria-labelledby"?: MaybeReactive<string | undefined>;
  "aria-describedby"?: MaybeReactive<string | undefined>;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onKeydown?: (event: KeyboardEvent) => void;
}

export interface UseComboBoxResult {
  labelProps: ReadonlyRef<Record<string, unknown>>;
  inputProps: ReadonlyRef<Record<string, unknown>>;
  listBoxProps: ReadonlyRef<Record<string, unknown>>;
  buttonProps: ReadonlyRef<Record<string, unknown>>;
  descriptionProps: ReadonlyRef<Record<string, unknown>>;
  errorMessageProps: ReadonlyRef<Record<string, unknown>>;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

function normalizeKey(key: string | number): string {
  if (typeof key === "string") {
    return key.replace(/\s*/g, "");
  }

  return String(key);
}

function focusInput(inputRef: MaybeReactive<HTMLInputElement | null | undefined>): void {
  const input = toValue(inputRef);
  input?.focus();
}

export function useComboBox<T extends ListBoxItem>(
  options: UseComboBoxOptions,
  state: UseComboBoxStateResult<T>
): UseComboBoxResult {
  const buttonId = useId(undefined, "v-aria-combobox-button");
  const listBoxId = useId(undefined, "v-aria-combobox-listbox");

  const isDisabled = computed(() => resolveBoolean(options.isDisabled));
  const isReadOnly = computed(() => resolveBoolean(options.isReadOnly));

  const focusBoundaryItem = (strategy: Exclude<FocusStrategy, null>): void => {
    const disabledKeys = state.disabledKeys.value;
    const collection =
      strategy === "last"
        ? [...state.collection.value].reverse()
        : state.collection.value;
    const target = collection.find((item) => !disabledKeys.has(item.key));
    state.setFocusedKey(target?.key ?? null);
  };

  const onKeydown = (event: KeyboardEvent): void => {
    options.onKeydown?.(event);
    if (event.defaultPrevented || isDisabled.value || isReadOnly.value) {
      return;
    }

    switch (event.key) {
      case "Enter":
      case "Tab":
        if (state.isOpen.value && event.key === "Enter") {
          event.preventDefault();
        }
        state.commit();
        break;
      case "Escape":
        state.revert();
        break;
      case "ArrowDown":
        event.preventDefault();
        state.open("first", "manual");
        focusBoundaryItem("first");
        break;
      case "ArrowUp":
        event.preventDefault();
        state.open("last", "manual");
        focusBoundaryItem("last");
        break;
      case "ArrowLeft":
      case "ArrowRight":
        state.setFocusedKey(null);
        break;
      default:
        break;
    }
  };

  const onFocus = (event: FocusEvent): void => {
    options.onFocus?.(event);
    state.setFocused(true);
  };

  const onBlur = (event: FocusEvent): void => {
    const button = options.buttonRef === undefined ? null : toValue(options.buttonRef);
    const blurFromButton = button !== null && event.relatedTarget === button;
    const blurIntoPopover = nodeContains(toValue(options.popoverRef), event.relatedTarget);
    if (blurFromButton || blurIntoPopover) {
      return;
    }

    options.onBlur?.(event);
    state.setFocused(false);
  };

  const { labelProps, inputProps: baseInputProps, descriptionProps, errorMessageProps } =
    useTextField({
      id: options.id,
      label: options.label,
      description: options.description,
      errorMessage: options.errorMessage,
      isDisabled: options.isDisabled,
      isReadOnly: options.isReadOnly,
      isRequired: options.isRequired,
      value: state.inputValue,
      defaultValue: state.defaultInputValue,
      onChange: state.setInputValue,
      onFocus,
      onBlur,
      onKeydown,
      "aria-label": options["aria-label"],
      "aria-labelledby": options["aria-labelledby"],
      "aria-describedby": options["aria-describedby"],
      "aria-autocomplete": "list",
      "aria-haspopup": "listbox",
    });

  const { listBoxProps: baseListBoxProps } = useListBox(
    {
      id: listBoxId,
      "aria-label": options["aria-label"],
      "aria-labelledby":
        options["aria-labelledby"] === undefined
          ? (labelProps.value.id as string | undefined)
          : options["aria-labelledby"],
      shouldUseVirtualFocus: true,
      shouldFocusOnHover: true,
      onAction: (key) => {
        state.setSelectedKey(key);
        state.commit();
      },
    },
    state,
    options.listBoxRef
  );

  const inputProps = computed<Record<string, unknown>>(() => {
    const focusedKey = state.focusedKey.value;
    const isFocusedKeyDisabled =
      focusedKey !== null && state.isDisabledKey(focusedKey);
    const activeDescendant =
      state.isOpen.value && focusedKey !== null && !isFocusedKeyDisabled
        ? `${listBoxId.value}-option-${normalizeKey(focusedKey)}`
        : undefined;

    return mergeProps(baseInputProps.value, {
      role: "combobox",
      "aria-expanded": state.isOpen.value,
      "aria-controls": state.isOpen.value ? listBoxId.value : undefined,
      "aria-activedescendant": activeDescendant,
    });
  });

  const listBoxProps = computed<Record<string, unknown>>(() =>
    mergeProps(baseListBoxProps.value, {
      id: listBoxId.value,
    })
  );

  const buttonProps = computed<Record<string, unknown>>(() => ({
    id: buttonId.value,
    tabIndex: -1,
    "aria-haspopup": "listbox",
    "aria-expanded": state.isOpen.value,
    "aria-controls": state.isOpen.value ? listBoxId.value : undefined,
    "aria-labelledby":
      options["aria-labelledby"] === undefined
        ? (labelProps.value.id as string | undefined)
        : toValue(options["aria-labelledby"]),
    "aria-label": "Show suggestions",
    isDisabled: isDisabled.value || isReadOnly.value || undefined,
    onPressStart: (event: PressLikeEvent) => {
      if (isDisabled.value || isReadOnly.value) {
        return;
      }

      if (event.pointerType !== "touch") {
        focusInput(options.inputRef);
        const focusStrategy: FocusStrategy =
          event.pointerType === "keyboard" || event.pointerType === "virtual"
            ? "first"
            : null;
        state.toggle(focusStrategy, "manual");
      }
    },
    onPress: (event: PressLikeEvent) => {
      if (isDisabled.value || isReadOnly.value) {
        return;
      }

      if (event.pointerType === "touch") {
        focusInput(options.inputRef);
        state.toggle(null, "manual");
      }
    },
  }));

  return {
    labelProps,
    inputProps,
    listBoxProps,
    buttonProps,
    descriptionProps,
    errorMessageProps,
  };
}
