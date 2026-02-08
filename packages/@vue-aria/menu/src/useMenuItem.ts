import { computed, ref, toValue, watchEffect } from "vue";
import { useId } from "@vue-aria/ssr";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { UseListBoxStateResult } from "@vue-aria/listbox";
import type { MenuItem } from "./useMenu";
import { getMenuItemId, menuData } from "./utils";

export interface UseMenuItemOptions {
  key: Key;
  isDisabled?: MaybeReactive<boolean | undefined>;
  isSelected?: MaybeReactive<boolean | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  isVirtualized?: MaybeReactive<boolean | undefined>;
  closeOnSelect?: MaybeReactive<boolean | undefined>;
  shouldCloseOnSelect?: MaybeReactive<boolean | undefined>;
  "aria-haspopup"?: MaybeReactive<"menu" | "dialog" | undefined>;
  "aria-expanded"?: MaybeReactive<boolean | "true" | "false" | undefined>;
  "aria-controls"?: MaybeReactive<string | undefined>;
  onAction?: (key: Key) => void;
  onClose?: () => void;
  onKeydown?: (event: KeyboardEvent) => void;
  onKeyup?: (event: KeyboardEvent) => void;
}

export interface UseMenuItemResult {
  menuItemProps: ReadonlyRef<Record<string, unknown>>;
  labelProps: ReadonlyRef<Record<string, unknown>>;
  descriptionProps: ReadonlyRef<Record<string, unknown>>;
  keyboardShortcutProps: ReadonlyRef<Record<string, unknown>>;
  isFocused: ReadonlyRef<boolean>;
  isFocusVisible: ReadonlyRef<boolean>;
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

export function useMenuItem<T extends MenuItem>(
  options: UseMenuItemOptions,
  state: UseListBoxStateResult<T>,
  itemRef: MaybeReactive<HTMLElement | null | undefined>
): UseMenuItemResult {
  const labelId = useId(undefined, "v-aria-menuitem-label");
  const descriptionId = useId(undefined, "v-aria-menuitem-description");
  const keyboardShortcutId = useId(undefined, "v-aria-menuitem-shortcut");
  const isPressed = ref(false);

  const data = computed(() => menuData.get(state as object));
  const item = computed(() => state.getItem(options.key));

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

  const isVirtualized = computed(() =>
    options.isVirtualized !== undefined
      ? resolveBoolean(options.isVirtualized)
      : Boolean(data.value?.isVirtualized)
  );

  const hasPopup = computed(() =>
    options["aria-haspopup"] === undefined
      ? undefined
      : toValue(options["aria-haspopup"])
  );
  const isTrigger = computed(() => Boolean(hasPopup.value));

  const isFocused = computed(
    () => state.isFocused.value && state.focusedKey.value === options.key
  );
  const isFocusVisible = computed(() => isFocused.value);

  const role = computed(() => {
    if (isTrigger.value) {
      return "menuitem";
    }

    if (state.selectionMode.value === "single") {
      return "menuitemradio";
    }

    if (state.selectionMode.value === "multiple") {
      return "menuitemcheckbox";
    }

    return "menuitem";
  });

  const shouldCloseOnSelect = computed<boolean>(() => {
    if (options.shouldCloseOnSelect !== undefined) {
      return resolveBoolean(options.shouldCloseOnSelect);
    }

    if (options.closeOnSelect !== undefined) {
      return resolveBoolean(options.closeOnSelect);
    }

    return state.selectionMode.value !== "multiple";
  });

  const isLink = computed(() => Boolean(item.value?.href));

  const performAction = (): void => {
    if (isDisabled.value) {
      return;
    }

    state.setFocusedKey(options.key);

    if (isTrigger.value) {
      return;
    }

    if (state.selectionMode.value === "single") {
      state.selectKey(options.key, "replace");
    } else if (state.selectionMode.value === "multiple") {
      state.selectKey(options.key, "toggle");
    }

    item.value?.onAction?.();
    options.onAction?.(options.key);
    data.value?.onAction?.(options.key);
  };

  const closeMenu = (): void => {
    options.onClose?.();
    data.value?.onClose?.();
  };

  const shouldCloseForInteraction = (
    pointerType: "keyboard" | "mouse" | "touch",
    key?: "Enter" | " "
  ): boolean => {
    if (options.shouldCloseOnSelect !== undefined || options.closeOnSelect !== undefined) {
      return shouldCloseOnSelect.value;
    }

    if (isLink.value) {
      return true;
    }

    if (pointerType === "keyboard" && key === "Enter") {
      return true;
    }

    if (state.selectionMode.value === "none") {
      return true;
    }

    return state.selectionMode.value !== "multiple";
  };

  watchEffect((onCleanup) => {
    const element = toValue(itemRef);
    if (!element) {
      return;
    }

    state.registerOption(options.key, element);
    onCleanup(() => {
      state.unregisterOption(options.key, element);
    });
  });

  const menuItemProps = computed<Record<string, unknown>>(() => {
    const descriptionIds = [descriptionId.value, keyboardShortcutId.value].join(" ");
    const resolvedControls =
      options["aria-controls"] === undefined
        ? undefined
        : toValue(options["aria-controls"]);
    const resolvedExpanded =
      options["aria-expanded"] === undefined
        ? undefined
        : toValue(options["aria-expanded"]);

    const props: Record<string, unknown> = {
      id: getMenuItemId(state, options.key),
      role: role.value,
      tabIndex: isFocused.value ? 0 : -1,
      "aria-disabled": isDisabled.value || undefined,
      "aria-label":
        options["aria-label"] === undefined ? undefined : toValue(options["aria-label"]),
      "aria-labelledby": labelId.value,
      "aria-describedby": descriptionIds || undefined,
      "aria-haspopup": hasPopup.value,
      "aria-expanded": resolvedExpanded,
      "aria-controls": resolvedControls,
      onFocus: () => {
        state.setFocused(true);
        state.setFocusedKey(options.key);
      },
      onMouseEnter: () => {
        if (isDisabled.value) {
          return;
        }

        state.setFocused(true);
        state.setFocusedKey(options.key);
      },
      onMouseDown: (event: MouseEvent) => {
        if (isDisabled.value) {
          event.preventDefault();
          return;
        }

        isPressed.value = true;
      },
      onMouseUp: () => {
        isPressed.value = false;
      },
      onMouseLeave: () => {
        isPressed.value = false;
      },
      onClick: () => {
        isPressed.value = false;
        performAction();

        if (!isTrigger.value && shouldCloseForInteraction("mouse")) {
          closeMenu();
        }
      },
      onKeydown: (event: KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          performAction();

          const interactionKey = event.key as "Enter" | " ";
          if (!isTrigger.value && shouldCloseForInteraction("keyboard", interactionKey)) {
            closeMenu();
          }
          return;
        }

        options.onKeydown?.(event);
      },
      onKeyup: options.onKeyup,
    };

    if (state.selectionMode.value !== "none" && !isTrigger.value) {
      props["aria-checked"] = isSelected.value;
    }

    if (isVirtualized.value) {
      const index = state.getItemIndex(options.key);
      props["aria-posinset"] = index >= 0 ? index + 1 : undefined;
      props["aria-setsize"] = state.collection.value.length;
    }

    return props;
  });

  return {
    menuItemProps,
    labelProps: computed(() => ({ id: labelId.value })),
    descriptionProps: computed(() => ({ id: descriptionId.value })),
    keyboardShortcutProps: computed(() => ({ id: keyboardShortcutId.value })),
    isFocused,
    isFocusVisible,
    isSelected,
    isDisabled,
    isPressed,
  };
}
