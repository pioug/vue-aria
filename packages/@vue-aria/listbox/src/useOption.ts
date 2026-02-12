import { computed, ref, toValue, watchEffect } from "vue";
import { useId } from "@vue-aria/ssr";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { ListBoxItem, UseListBoxStateResult } from "./useListBoxState";
import { getItemId, listData } from "./utils";

export interface UseOptionOptions {
  key: Key;
  isDisabled?: MaybeReactive<boolean | undefined>;
  isSelected?: MaybeReactive<boolean | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  shouldSelectOnPressUp?: MaybeReactive<boolean | undefined>;
  shouldFocusOnHover?: MaybeReactive<boolean | undefined>;
  isVirtualized?: MaybeReactive<boolean | undefined>;
  shouldUseVirtualFocus?: MaybeReactive<boolean | undefined>;
}

export interface UseOptionResult {
  optionProps: ReadonlyRef<Record<string, unknown>>;
  labelProps: ReadonlyRef<Record<string, unknown>>;
  descriptionProps: ReadonlyRef<Record<string, unknown>>;
  isFocused: ReadonlyRef<boolean>;
  isFocusVisible: ReadonlyRef<boolean>;
  isSelected: ReadonlyRef<boolean>;
  isDisabled: ReadonlyRef<boolean>;
  isPressed: ReadonlyRef<boolean>;
  allowsSelection: ReadonlyRef<boolean>;
  hasAction: ReadonlyRef<boolean>;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

export function useOption<T extends ListBoxItem>(
  options: UseOptionOptions,
  state: UseListBoxStateResult<T>,
  optionRef: MaybeReactive<HTMLElement | null | undefined>
): UseOptionResult {
  const labelId = useId(undefined, "v-aria-option-label");
  const descriptionId = useId(undefined, "v-aria-option-description");
  const isPressed = ref(false);
  const ignoreClickAfterPressUp = ref(false);

  const data = computed(() => listData.get(state as object));
  const isDisabled = computed(() => {
    if (options.isDisabled !== undefined) {
      return resolveBoolean(options.isDisabled);
    }

    return state.isDisabledKey(options.key);
  });
  const isSelected = computed(() => {
    if (options.isSelected !== undefined) {
      return resolveBoolean(options.isSelected);
    }

    return state.isSelected(options.key);
  });
  const shouldSelectOnPressUp = computed(() =>
    options.shouldSelectOnPressUp !== undefined
      ? resolveBoolean(options.shouldSelectOnPressUp)
      : Boolean(data.value?.shouldSelectOnPressUp)
  );
  const shouldFocusOnHover = computed(() =>
    options.shouldFocusOnHover !== undefined
      ? resolveBoolean(options.shouldFocusOnHover)
      : Boolean(data.value?.shouldFocusOnHover)
  );
  const isVirtualized = computed(() =>
    options.isVirtualized !== undefined
      ? resolveBoolean(options.isVirtualized)
      : Boolean(data.value?.isVirtualized)
  );

  const id = computed(() => getItemId(state, options.key));
  const hasAction = computed(() => Boolean(data.value?.onAction));
  const allowsSelection = computed(
    () => state.selectionMode.value !== "none" && !isDisabled.value
  );
  const isFocused = computed(
    () => state.isFocused.value && state.focusedKey.value === options.key
  );
  const isFocusVisible = computed(() => isFocused.value);

  const performSelectionAndAction = () => {
    if (isDisabled.value) {
      return;
    }

    state.setFocusedKey(options.key);
    if (state.selectionMode.value !== "none") {
      state.selectKey(options.key, data.value?.selectionBehavior);
    }

    data.value?.onAction?.(options.key);
  };

  watchEffect((onCleanup) => {
    const element = toValue(optionRef);
    if (!element) {
      return;
    }

    state.registerOption(options.key, element);
    onCleanup(() => {
      state.unregisterOption(options.key, element);
    });
  });

  const optionProps = computed<Record<string, unknown>>(() => {
    const optionState: Record<string, unknown> = {
      id: id.value,
      role: "option",
      tabIndex: isFocused.value ? 0 : -1,
      "aria-disabled": isDisabled.value || undefined,
      "aria-selected":
        state.selectionMode.value === "none" ? undefined : isSelected.value,
      "aria-label":
        options["aria-label"] === undefined
          ? undefined
          : toValue(options["aria-label"]),
      "aria-labelledby": labelId.value,
      "aria-describedby": descriptionId.value,
      onFocus: () => {
        state.setFocused(true);
        state.setFocusedKey(options.key);
      },
      onMouseEnter: () => {
        if (isDisabled.value || !shouldFocusOnHover.value) {
          return;
        }

        state.setFocused(true);
        state.setFocusedKey(options.key);
      },
      onMouseDown: () => {
        if (isDisabled.value) {
          return;
        }

        ignoreClickAfterPressUp.value = false;
        isPressed.value = true;
        if (!shouldSelectOnPressUp.value) {
          performSelectionAndAction();
        }
      },
      onMouseUp: () => {
        if (isDisabled.value) {
          isPressed.value = false;
          return;
        }

        if (shouldSelectOnPressUp.value) {
          performSelectionAndAction();
          ignoreClickAfterPressUp.value = true;
        }
        isPressed.value = false;
      },
      onMouseLeave: () => {
        isPressed.value = false;
      },
      onClick: () => {
        if (!shouldSelectOnPressUp.value) {
          return;
        }

        if (ignoreClickAfterPressUp.value) {
          ignoreClickAfterPressUp.value = false;
          return;
        }

        performSelectionAndAction();
      },
    };

    if (isVirtualized.value) {
      const index = state.getItemIndex(options.key);
      optionState["aria-posinset"] = index >= 0 ? index + 1 : undefined;
      optionState["aria-setsize"] = state.collection.value.length;
    }

    return optionState;
  });

  const labelProps = computed<Record<string, unknown>>(() => ({
    id: labelId.value,
  }));

  const descriptionProps = computed<Record<string, unknown>>(() => ({
    id: descriptionId.value,
  }));

  return {
    optionProps,
    labelProps,
    descriptionProps,
    isFocused,
    isFocusVisible,
    isSelected,
    isDisabled,
    isPressed,
    allowsSelection,
    hasAction,
  };
}
