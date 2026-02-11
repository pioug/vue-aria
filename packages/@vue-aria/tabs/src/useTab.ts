import { computed, ref, toValue, watchEffect } from "vue";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { TabListItem, UseTabListStateResult } from "./useTabListState";
import { generateId } from "./utils";

export interface UseTabOptions {
  key: Key;
  id?: MaybeReactive<string | undefined>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  shouldSelectOnPressUp?: MaybeReactive<boolean | undefined>;
}

export interface UseTabResult {
  tabProps: ReadonlyRef<Record<string, unknown>>;
  isSelected: ReadonlyRef<boolean>;
  isDisabled: ReadonlyRef<boolean>;
  isPressed: ReadonlyRef<boolean>;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

export function useTab<T extends TabListItem>(
  options: UseTabOptions,
  state: UseTabListStateResult<T>,
  tabRef: MaybeReactive<HTMLElement | null | undefined>
): UseTabResult {
  const isPressed = ref(false);
  const shouldSelectOnPressUp = computed(() =>
    resolveBoolean(options.shouldSelectOnPressUp)
  );
  const isSelected = computed(() => state.selectedKey.value === options.key);
  const isDisabled = computed(
    () => resolveBoolean(options.isDisabled) || state.isKeyDisabled(options.key)
  );

  const tabId = computed(() => {
    if (options.id !== undefined) {
      return toValue(options.id) ?? generateId(state, options.key, "tab");
    }

    return generateId(state, options.key, "tab");
  });

  const tabPanelId = computed(() => generateId(state, options.key, "tabpanel"));

  watchEffect((onCleanup) => {
    const element = toValue(tabRef);
    if (!element) {
      return;
    }

    state.registerTab(options.key, element);
    onCleanup(() => {
      state.unregisterTab(options.key, element);
    });
  });

  const tabProps = computed<Record<string, unknown>>(() => {
    const isFocused = state.focusedKey.value === options.key;
    const tabIndex = isDisabled.value ? -1 : isFocused || isSelected.value ? 0 : -1;

    return {
      id: tabId.value,
      role: "tab",
      tabIndex,
      disabled: isDisabled.value || undefined,
      "aria-selected": isSelected.value,
      "aria-disabled": isDisabled.value || undefined,
      "aria-controls": isSelected.value ? tabPanelId.value : undefined,
      "data-v-aria-tab-key": String(options.key),
      onFocus: () => {
        state.setFocusedKey(options.key);
      },
      onMouseDown: () => {
        if (isDisabled.value) {
          return;
        }

        isPressed.value = true;
      },
      onMouseUp: () => {
        if (isDisabled.value) {
          isPressed.value = false;
          return;
        }

        isPressed.value = false;
        if (shouldSelectOnPressUp.value) {
          state.setSelectedKey(options.key);
        }
      },
      onMouseLeave: () => {
        isPressed.value = false;
      },
      onClick: () => {
        if (isDisabled.value || shouldSelectOnPressUp.value) {
          return;
        }

        state.setSelectedKey(options.key);
      },
    };
  });

  return {
    tabProps,
    isSelected,
    isDisabled,
    isPressed,
  };
}
