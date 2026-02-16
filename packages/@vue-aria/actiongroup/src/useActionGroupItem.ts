import type { Key } from "@vue-aria/collections";
import type { ListState } from "@vue-stately/list";
import { useEffectEvent } from "@vue-aria/utils";
import { onScopeDispose } from "vue";

export interface AriaActionGroupItemProps {
  key: Key;
}

export interface ActionGroupItemAria {
  buttonProps: Record<string, unknown>;
}

type SelectionMode = "none" | "single" | "multiple";

const BUTTON_ROLES: Record<SelectionMode, "radio" | "checkbox" | undefined> = {
  none: undefined,
  single: "radio",
  multiple: "checkbox",
};

export function useActionGroupItem<T>(
  props: AriaActionGroupItemProps,
  state: ListState<T>,
  _ref?: { current: Element | null }
): ActionGroupItemAria {
  const selectionMode = state.selectionManager.selectionMode as SelectionMode;
  const buttonProps: Record<string, unknown> = {
    role: BUTTON_ROLES[selectionMode],
  };

  if (selectionMode !== "none") {
    Object.defineProperty(buttonProps, "aria-checked", {
      enumerable: true,
      configurable: true,
      get: () => state.selectionManager.isSelected(props.key),
    });
  }

  const onRemovedWithFocus = useEffectEvent(() => {
    if (state.selectionManager.focusedKey === props.key) {
      state.selectionManager.setFocusedKey(null);
    }
  });

  onScopeDispose(() => {
    onRemovedWithFocus();
  });

  const getTabIndex = () =>
    state.selectionManager.focusedKey == null || state.selectionManager.focusedKey === props.key
      ? 0
      : -1;

  Object.defineProperty(buttonProps, "tabIndex", {
    enumerable: true,
    configurable: true,
    get: getTabIndex,
  });

  Object.defineProperty(buttonProps, "onFocus", {
    enumerable: true,
    configurable: true,
    value: () => {
      state.selectionManager.setFocusedKey(props.key);
    },
  });

  Object.defineProperty(buttonProps, "onPress", {
    enumerable: true,
    configurable: true,
    value: () => {
      state.selectionManager.select(props.key);
    },
  });

  return {
    buttonProps,
  };
}
