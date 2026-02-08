import { computed, toValue, watchEffect } from "vue";
import { useLabel } from "@vue-aria/label";
import { useListKeyboardDelegate, useTypeSelect } from "@vue-aria/selection";
import { useId } from "@vue-aria/ssr";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { ListBoxItem, UseListBoxStateResult } from "@vue-aria/listbox";
import { menuData } from "./utils";

type Orientation = "vertical" | "horizontal";
type Direction = "ltr" | "rtl";

export interface MenuItem extends ListBoxItem {
  onAction?: () => void;
  href?: string;
  routerOptions?: Record<string, unknown>;
}

export interface UseMenuOptions {
  id?: MaybeReactive<string | undefined>;
  label?: MaybeReactive<string | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  "aria-labelledby"?: MaybeReactive<string | undefined>;
  "aria-describedby"?: MaybeReactive<string | undefined>;
  shouldFocusWrap?: MaybeReactive<boolean | undefined>;
  shouldUseVirtualFocus?: MaybeReactive<boolean | undefined>;
  isVirtualized?: MaybeReactive<boolean | undefined>;
  orientation?: MaybeReactive<Orientation | undefined>;
  direction?: MaybeReactive<Direction | undefined>;
  onAction?: (key: Key) => void;
  onClose?: () => void;
  onKeydown?: (event: KeyboardEvent) => void;
  onKeyup?: (event: KeyboardEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;
  [key: string]: unknown;
}

export interface UseMenuResult {
  menuProps: ReadonlyRef<Record<string, unknown>>;
  labelProps: ReadonlyRef<Record<string, unknown>>;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

export function useMenu<T extends MenuItem>(
  options: UseMenuOptions,
  state: UseListBoxStateResult<T>,
  menuRef: MaybeReactive<HTMLElement | null | undefined>
): UseMenuResult {
  const shouldFocusWrap = computed(() => resolveBoolean(options.shouldFocusWrap));
  const id = useId(options.id, "v-aria-menu");
  const domProps = filterDOMProps(options, { labelable: true });

  watchEffect(() => {
    menuData.set(state as object, {
      id: id.value,
      onClose: options.onClose,
      onAction: options.onAction,
      shouldUseVirtualFocus: resolveBoolean(options.shouldUseVirtualFocus),
      isVirtualized: resolveBoolean(options.isVirtualized),
    });
  });

  const keyboardDelegate = useListKeyboardDelegate<T>({
    collection: state.collection,
    disabledKeys: state.disabledKeys,
    orientation: options.orientation,
    direction: options.direction,
  });

  const { labelProps, fieldProps } = useLabel({
    id,
    label: options.label,
    labelElementType: "span",
    "aria-label": options["aria-label"],
    "aria-labelledby": options["aria-labelledby"],
  });

  const focusKey = (key: Key | null): void => {
    if (key === null) {
      return;
    }

    state.setFocusedKey(key);

    if (!resolveBoolean(options.shouldUseVirtualFocus)) {
      state.getOptionElement(key)?.focus();
    }
  };

  const activateKey = (key: Key | null): void => {
    if (key === null) {
      return;
    }

    const element = state.getOptionElement(key);
    if (element) {
      element.click();
      return;
    }

    const item = state.getItem(key);
    if (!item || state.isDisabledKey(key)) {
      return;
    }

    if (state.selectionMode.value === "single") {
      state.selectKey(key, "replace");
    } else if (state.selectionMode.value === "multiple") {
      state.selectKey(key, "toggle");
    }

    item.onAction?.();
    options.onAction?.(key);

    if (state.selectionMode.value !== "multiple") {
      options.onClose?.();
    }
  };

  const resolveWrappedKey = (
    key: Key | null,
    fallback: () => Key | null
  ): Key | null => {
    if (key !== null) {
      return key;
    }

    if (!shouldFocusWrap.value) {
      return null;
    }

    return fallback();
  };

  const { typeSelectProps } = useTypeSelect({
    keyboardDelegate,
    focusedKey: state.focusedKey,
    setFocusedKey: (key) => {
      focusKey(key);
    },
  });

  const onKeydown = (event: KeyboardEvent): void => {
    options.onKeydown?.(event);
    if (state.isDisabled.value) {
      return;
    }

    const currentKey = state.focusedKey.value ?? keyboardDelegate.getFirstKey?.() ?? null;

    let nextKey: Key | null = null;
    switch (event.key) {
      case "ArrowDown":
        nextKey = currentKey === null
          ? keyboardDelegate.getFirstKey?.() ?? null
          : resolveWrappedKey(
            keyboardDelegate.getKeyBelow?.(currentKey) ?? null,
            () => keyboardDelegate.getFirstKey?.() ?? null
          );
        break;
      case "ArrowUp":
        nextKey = currentKey === null
          ? keyboardDelegate.getLastKey?.() ?? null
          : resolveWrappedKey(
            keyboardDelegate.getKeyAbove?.(currentKey) ?? null,
            () => keyboardDelegate.getLastKey?.() ?? null
          );
        break;
      case "ArrowRight":
        if (currentKey !== null) {
          nextKey = resolveWrappedKey(
            keyboardDelegate.getKeyRightOf?.(currentKey) ?? null,
            () => keyboardDelegate.getFirstKey?.() ?? null
          );
        }
        break;
      case "ArrowLeft":
        if (currentKey !== null) {
          nextKey = resolveWrappedKey(
            keyboardDelegate.getKeyLeftOf?.(currentKey) ?? null,
            () => keyboardDelegate.getLastKey?.() ?? null
          );
        }
        break;
      case "Home":
        nextKey = keyboardDelegate.getFirstKey?.() ?? null;
        break;
      case "End":
        nextKey = keyboardDelegate.getLastKey?.() ?? null;
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        activateKey(state.focusedKey.value);
        return;
      case "Escape":
        options.onClose?.();
        return;
      default:
        return;
    }

    if (nextKey !== null) {
      event.preventDefault();
      focusKey(nextKey);
    }
  };

  const onFocus = (event: FocusEvent): void => {
    state.setFocused(true);
    options.onFocusChange?.(true);
    options.onFocus?.(event);

    if (state.focusedKey.value === null) {
      focusKey(keyboardDelegate.getFirstKey?.() ?? null);
    }
  };

  const onBlur = (event: FocusEvent): void => {
    state.setFocused(false);
    options.onFocusChange?.(false);
    options.onBlur?.(event);
  };

  const menuProps = computed<Record<string, unknown>>(() =>
    mergeProps(domProps, fieldProps.value, typeSelectProps, {
      id: id.value,
      role: "menu",
      tabIndex: 0,
      onKeydown,
      onKeyup: options.onKeyup,
      onFocus,
      onBlur,
      "aria-describedby":
        options["aria-describedby"] === undefined
          ? undefined
          : toValue(options["aria-describedby"]),
    })
  );

  watchEffect(() => {
    const element = toValue(menuRef);
    if (!element) {
      return;
    }

    if (resolveBoolean(options.shouldUseVirtualFocus)) {
      return;
    }

    if (state.isFocused.value && state.focusedKey.value !== null) {
      state.getOptionElement(state.focusedKey.value)?.focus();
    }
  });

  return {
    menuProps,
    labelProps,
  };
}
