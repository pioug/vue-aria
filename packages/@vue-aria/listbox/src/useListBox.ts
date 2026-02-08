import { computed, toValue, watchEffect } from "vue";
import { useId } from "@vue-aria/ssr";
import { useLabel } from "@vue-aria/label";
import {
  useListKeyboardDelegate,
  useTypeSelect,
} from "@vue-aria/selection";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type {
  ListBoxItem,
  SelectionBehavior,
  UseListBoxStateResult,
} from "./useListBoxState";
import { listData } from "./utils";

type Orientation = "vertical" | "horizontal";
type Direction = "ltr" | "rtl";

export interface UseListBoxOptions {
  id?: MaybeReactive<string | undefined>;
  label?: MaybeReactive<string | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  "aria-labelledby"?: MaybeReactive<string | undefined>;
  orientation?: MaybeReactive<Orientation | undefined>;
  direction?: MaybeReactive<Direction | undefined>;
  selectionBehavior?: MaybeReactive<SelectionBehavior | undefined>;
  shouldSelectOnPressUp?: MaybeReactive<boolean | undefined>;
  shouldFocusOnHover?: MaybeReactive<boolean | undefined>;
  shouldUseVirtualFocus?: MaybeReactive<boolean | undefined>;
  isVirtualized?: MaybeReactive<boolean | undefined>;
  onAction?: (key: Key) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;
  [key: string]: unknown;
}

export interface UseListBoxResult {
  listBoxProps: ReadonlyRef<Record<string, unknown>>;
  labelProps: ReadonlyRef<Record<string, unknown>>;
}

function resolveSelectionBehavior(
  value: MaybeReactive<SelectionBehavior | undefined> | undefined
): SelectionBehavior {
  if (value === undefined) {
    return "toggle";
  }

  return toValue(value) ?? "toggle";
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

export function useListBox<T extends ListBoxItem>(
  options: UseListBoxOptions,
  state: UseListBoxStateResult<T>,
  listRef: MaybeReactive<HTMLElement | null | undefined>
): UseListBoxResult {
  const selectionBehavior = computed(() =>
    resolveSelectionBehavior(options.selectionBehavior)
  );
  const id = useId(options.id, "v-aria-listbox");
  const domProps = filterDOMProps(options, { labelable: true });

  watchEffect(() => {
    listData.set(state as object, {
      id: id.value,
      shouldUseVirtualFocus: resolveBoolean(options.shouldUseVirtualFocus),
      shouldSelectOnPressUp: resolveBoolean(options.shouldSelectOnPressUp),
      shouldFocusOnHover: resolveBoolean(options.shouldFocusOnHover),
      isVirtualized: resolveBoolean(options.isVirtualized),
      onAction: options.onAction,
      selectionBehavior: selectionBehavior.value,
    });
  });

  const { labelProps, fieldProps } = useLabel({
    id,
    label: options.label,
    labelElementType: "span",
    "aria-label": options["aria-label"],
    "aria-labelledby": options["aria-labelledby"],
  });
  const keyboardDelegate = useListKeyboardDelegate<T>({
    collection: state.collection,
    disabledKeys: state.disabledKeys,
    orientation: options.orientation,
    direction: options.direction,
  });

  const focusKey = (key: Key | null) => {
    if (key === null) {
      return;
    }
    state.setFocusedKey(key);
    state.getOptionElement(key)?.focus();
  };
  const { typeSelectProps } = useTypeSelect({
    keyboardDelegate,
    focusedKey: state.focusedKey,
    setFocusedKey: (key) => {
      focusKey(key);
    },
  });

  const onKeydown = (event: KeyboardEvent) => {
    if (state.isDisabled.value) {
      return;
    }

    const currentKey = state.focusedKey.value ?? keyboardDelegate.getFirstKey?.() ?? null;
    if (currentKey === null) {
      return;
    }

    let nextKey: Key | null = null;
    switch (event.key) {
      case "ArrowDown":
        nextKey = keyboardDelegate.getKeyBelow?.(currentKey) ?? null;
        break;
      case "ArrowUp":
        nextKey = keyboardDelegate.getKeyAbove?.(currentKey) ?? null;
        break;
      case "ArrowRight":
        nextKey = keyboardDelegate.getKeyRightOf?.(currentKey) ?? null;
        break;
      case "ArrowLeft":
        nextKey = keyboardDelegate.getKeyLeftOf?.(currentKey) ?? null;
        break;
      case "Home":
        nextKey = keyboardDelegate.getFirstKey?.() ?? null;
        break;
      case "End":
        nextKey = keyboardDelegate.getLastKey?.() ?? null;
        break;
      case "Enter":
      case " ":
        if (state.focusedKey.value !== null) {
          event.preventDefault();
          state.selectKey(
            state.focusedKey.value,
            selectionBehavior.value
          );
        }
        return;
      default:
        return;
    }

    if (nextKey === null) {
      return;
    }

    event.preventDefault();
    focusKey(nextKey);
    if (state.selectionMode.value === "single") {
      state.selectKey(nextKey, "replace");
    }
  };

  const onFocus = (event: FocusEvent) => {
    state.setFocused(true);
    options.onFocusChange?.(true);
    options.onFocus?.(event);

    if (state.focusedKey.value === null) {
      focusKey(keyboardDelegate.getFirstKey?.() ?? null);
    }
  };

  const onBlur = (event: FocusEvent) => {
    state.setFocused(false);
    options.onFocusChange?.(false);
    options.onBlur?.(event);
  };

  const listBoxProps = computed<Record<string, unknown>>(() =>
    mergeProps(
      domProps,
      fieldProps.value,
      typeSelectProps,
      {
        id: id.value,
        role: "listbox",
        tabIndex: 0,
        onKeydown,
        onFocus,
        onBlur,
        "aria-multiselectable":
          state.selectionMode.value === "multiple" ? "true" : undefined,
      }
    )
  );

  return {
    listBoxProps,
    labelProps,
  };
}
