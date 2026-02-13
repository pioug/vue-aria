import type { Key } from "@vue-aria/collections";
import type { ListState } from "@vue-aria/list-state";
import { mergeProps, useEffectEvent } from "@vue-aria/utils";
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
    const isSelected = state.selectionManager.isSelected(props.key);
    buttonProps["aria-checked"] = isSelected;
  }

  const isFocused = props.key === state.selectionManager.focusedKey;
  const onRemovedWithFocus = useEffectEvent(() => {
    if (isFocused) {
      state.selectionManager.setFocusedKey(null);
    }
  });

  onScopeDispose(() => {
    onRemovedWithFocus();
  });

  return {
    buttonProps: mergeProps(buttonProps, {
      tabIndex: isFocused || state.selectionManager.focusedKey == null ? 0 : -1,
      onFocus() {
        state.selectionManager.setFocusedKey(props.key);
      },
      onPress() {
        state.selectionManager.select(props.key);
      },
    }),
  };
}
