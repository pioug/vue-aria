import { ariaHideOutside } from "@vue-aria/overlays";
import { useMenuTrigger } from "@vue-aria/menu";
import { useTextField } from "@vue-aria/textfield";
import { privateValidationStateProp } from "@vue-aria/form-state";
import { dispatchVirtualFocus } from "@vue-aria/focus";
import { listData, getItemId, type AriaListBoxOptions } from "@vue-aria/listbox";
import { ListKeyboardDelegate, useSelectableCollection } from "@vue-aria/selection";
import {
  chain,
  getActiveElement,
  getOwnerDocument,
  isAppleDevice,
  mergeProps,
  nodeContains,
  useEvent,
  useFormReset,
  useLabels,
  useRouter,
} from "@vue-aria/utils";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import type { ComboBoxState } from "@vue-aria/combobox-state";
import type { Key } from "@vue-aria/collections";
import { computed, ref, watchEffect } from "vue";
import { intlMessages } from "./intlMessages";

export interface AriaComboBoxOptions<T> {
  inputRef: { current: HTMLInputElement | null };
  popoverRef: { current: Element | null };
  listBoxRef: { current: HTMLElement | null };
  buttonRef?: { current: Element | null };
  keyboardDelegate?: any;
  layoutDelegate?: any;
  shouldFocusWrap?: boolean;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  allowsCustomValue?: boolean;
  label?: string;
  name?: string;
  form?: string;
  [key: string]: unknown;
}

export interface ComboBoxAria<T> {
  labelProps: Record<string, unknown>;
  inputProps: Record<string, unknown>;
  listBoxProps: AriaListBoxOptions<T> & Record<string, unknown>;
  buttonProps: Record<string, unknown>;
  descriptionProps: Record<string, unknown>;
  errorMessageProps: Record<string, unknown>;
  isInvalid: boolean;
  validationErrors: string[];
  validationDetails: ValidityState | null;
}

export function useComboBox<T>(
  props: AriaComboBoxOptions<T>,
  state: ComboBoxState<T>
): ComboBoxAria<T> {
  const {
    popoverRef,
    inputRef,
    listBoxRef,
    keyboardDelegate,
    layoutDelegate,
    shouldFocusWrap,
    isReadOnly,
    isDisabled,
  } = props;

  const fallbackButtonRef = { current: null as Element | null };
  const buttonRef = props.buttonRef ?? fallbackButtonRef;

  const stringFormatter = useLocalizedStringFormatter(intlMessages as any);
  const { menuTriggerProps, menuProps } = useMenuTrigger<T>(
    {
      type: "listbox",
      isDisabled: isDisabled || isReadOnly,
    },
    state as any,
    buttonRef
  );

  listData.set(state as any, { id: menuProps.id as string });

  const delegate =
    keyboardDelegate ??
    new ListKeyboardDelegate({
      collection: state.collection as any,
      disabledKeys: state.selectionManager.disabledKeys as Set<Key>,
      ref: listBoxRef,
      layoutDelegate,
    });

  const { collectionProps } = useSelectableCollection({
    selectionManager: state.selectionManager,
    keyboardDelegate: delegate,
    disallowTypeAhead: true,
    disallowEmptySelection: true,
    shouldFocusWrap,
    ref: inputRef as any,
    isVirtualized: true,
  } as any);

  const router = useRouter();
  const onKeyDown = (e: KeyboardEvent & { continuePropagation?: () => void }) => {
    const nativeEvent = (e as any).nativeEvent;
    if (nativeEvent?.isComposing) {
      return;
    }

    switch (e.key) {
      case "Enter":
      case "Tab": {
        if (state.isOpen && e.key === "Enter") {
          e.preventDefault();
        }

        if (
          state.isOpen
          && listBoxRef.current
          && state.selectionManager.focusedKey != null
        ) {
          const focusedKey = state.selectionManager.focusedKey;
          const collectionItem = state.collection.getItem(focusedKey as Key) as
            | { props?: Record<string, unknown> | undefined }
            | null;
          if (collectionItem?.props?.href) {
            const item = listBoxRef.current.querySelector(
              `[data-key="${String(focusedKey).replace(/"/g, '\\"')}"]`
            );
            if (e.key === "Enter" && item instanceof HTMLAnchorElement) {
              router.open(
                item,
                e,
                collectionItem.props.href as string,
                collectionItem.props.routerOptions as any
              );
            }
            state.close();
            break;
          } else if (collectionItem?.props?.onAction) {
            (collectionItem.props.onAction as () => void)();
            state.close();
            break;
          }
        }

        state.commit();
        break;
      }
      case "Escape":
        if (state.selectedKey !== null || state.inputValue === "" || props.allowsCustomValue) {
          e.continuePropagation?.();
        }
        state.revert();
        break;
      case "ArrowDown":
        state.open("first", "manual");
        break;
      case "ArrowUp":
        state.open("last", "manual");
        break;
      case "ArrowLeft":
      case "ArrowRight":
        state.selectionManager.setFocusedKey(null);
        break;
    }
  };

  const onBlur = (e: FocusEvent) => {
    const blurFromButton = !!(buttonRef?.current && buttonRef.current === e.relatedTarget);
    const blurIntoPopover = nodeContains(
      popoverRef.current as Node | null,
      e.relatedTarget as Node | null
    );
    if (blurFromButton || blurIntoPopover) {
      return;
    }

    (props.onBlur as ((event: FocusEvent) => void) | undefined)?.(e);
    state.setFocused(false);
  };

  const onFocus = (e: FocusEvent) => {
    if (state.isFocused) {
      return;
    }

    (props.onFocus as ((event: FocusEvent) => void) | undefined)?.(e);
    state.setFocused(true);
  };

  const { isInvalid, validationErrors, validationDetails } = state.displayValidation;
  const { labelProps, inputProps, descriptionProps, errorMessageProps } = useTextField(
    {
      ...props,
      onChange: state.setInputValue,
      onKeyDown: !isReadOnly
        ? chain(
          collectionProps.onKeyDown as ((event: KeyboardEvent) => void) | undefined,
          onKeyDown,
          props.onKeyDown as ((event: KeyboardEvent) => void) | undefined
        )
        : (props.onKeyDown as ((event: KeyboardEvent) => void) | undefined),
      onBlur,
      value: state.inputValue,
      defaultValue: state.defaultInputValue,
      onFocus,
      autoComplete: "off",
      validate: undefined,
      [privateValidationStateProp]: state,
    },
    inputRef
  );

  const inputDomRef = computed(() => inputRef.current);
  useFormReset(
    inputDomRef as any,
    state.defaultSelectedKey,
    state.setSelectedKey as (value: Key | null) => void
  );

  const onPress = (e: { pointerType?: string }) => {
    if (e.pointerType === "touch") {
      inputRef.current?.focus();
      state.toggle(null, "manual");
    }
  };

  const onPressStart = (e: { pointerType?: string }) => {
    if (e.pointerType !== "touch") {
      inputRef.current?.focus();
      state.toggle(
        e.pointerType === "keyboard" || e.pointerType === "virtual" ? "first" : null,
        "manual"
      );
    }
  };

  const triggerLabelProps = useLabels({
    id: menuTriggerProps.id as string | undefined,
    "aria-label": stringFormatter.format("buttonLabel"),
    "aria-labelledby":
      (props["aria-labelledby"] as string | undefined) || (labelProps.id as string | undefined),
  });

  const listBoxLabelProps = useLabels({
    id: menuProps.id as string | undefined,
    "aria-label": stringFormatter.format("listboxLabel"),
    "aria-labelledby":
      (props["aria-labelledby"] as string | undefined) || (labelProps.id as string | undefined),
  });

  const lastEventTime = ref(0);
  const onTouchEnd = (e: TouchEvent) => {
    if (isDisabled || isReadOnly) {
      return;
    }

    if (e.timeStamp - lastEventTime.value < 500) {
      e.preventDefault();
      inputRef.current?.focus();
      return;
    }

    const target = e.target as Element | null;
    if (!target) {
      return;
    }
    const rect = target.getBoundingClientRect();
    const touch = e.changedTouches[0];

    const centerX = Math.ceil(rect.left + 0.5 * rect.width);
    const centerY = Math.ceil(rect.top + 0.5 * rect.height);

    if (touch.clientX === centerX && touch.clientY === centerY) {
      e.preventDefault();
      inputRef.current?.focus();
      state.toggle(null, "manual");
      lastEventTime.value = e.timeStamp;
    }
  };

  const listBoxEventRef = computed(() => listBoxRef.current as EventTarget | null);
  useEvent(
    listBoxEventRef as any,
    "react-aria-item-action",
    state.isOpen
      ? () => {
        state.close();
      }
      : undefined
  );

  watchEffect((onCleanup) => {
    if (!state.isOpen) {
      return;
    }

    const cleanup = ariaHideOutside(
      [inputRef.current, popoverRef.current].filter(Boolean) as Element[]
    );
    onCleanup(() => {
      cleanup?.();
    });
  });

  watchEffect(() => {
    const focusedKey = state.selectionManager.focusedKey;
    if (
      focusedKey == null
      && inputRef.current
      && getActiveElement(getOwnerDocument(inputRef.current)) === inputRef.current
    ) {
      dispatchVirtualFocus(inputRef.current, null);
    }
  });

  return {
    labelProps,
    buttonProps: {
      ...menuTriggerProps,
      ...triggerLabelProps,
      excludeFromTabOrder: true,
      preventFocusOnPress: true,
      onPress,
      onPressStart,
      isDisabled: isDisabled || isReadOnly,
    },
    inputProps: mergeProps(inputProps, {
      role: "combobox",
      "aria-expanded": menuTriggerProps["aria-expanded"],
      "aria-controls": state.isOpen ? menuProps.id : undefined,
      "aria-autocomplete": "list",
      "aria-activedescendant":
        state.selectionManager.focusedKey != null
          ? getItemId(state as any, state.selectionManager.focusedKey)
          : undefined,
      onTouchEnd,
      autoCorrect: "off",
      spellCheck: "false",
    }),
    listBoxProps: mergeProps(menuProps, listBoxLabelProps, {
      autoFocus: state.focusStrategy || true,
      shouldUseVirtualFocus: true,
      shouldSelectOnPressUp: true,
      shouldFocusOnHover: true,
      linkBehavior: "selection" as const,
      UNSTABLE_itemBehavior: "action",
    }) as any,
    descriptionProps,
    errorMessageProps,
    isInvalid,
    validationErrors,
    validationDetails: (validationDetails ?? null) as ValidityState | null,
  };
}

function getItemCount(
  collection: { getKeys(): Iterable<Key>; getItem(key: Key): { type?: string } | null }
) {
  let count = 0;
  for (const key of collection.getKeys()) {
    if (collection.getItem(key)?.type === "item") {
      count += 1;
    }
  }

  return count;
}

export function getComboBoxCountAnnouncement(
  state: { collection: { getKeys(): Iterable<Key>; getItem(key: Key): { type?: string } | null } },
  formatter = useLocalizedStringFormatter(intlMessages as any)
) {
  return formatter.format("countAnnouncement", {
    optionCount: getItemCount(state.collection),
  } as any);
}

export function shouldAnnounceAppleSelection() {
  return isAppleDevice();
}
