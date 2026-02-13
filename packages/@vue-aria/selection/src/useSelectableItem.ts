import { focusSafely } from "@vue-aria/interactions";
import { moveVirtualFocus } from "@vue-aria/focus";
import type { Key, MultipleSelectionManager } from "@vue-aria/selection-state";
import { isCtrlKeyPressed, useRouter } from "@vue-aria/utils";
import { isNonContiguousSelectionModifier } from "./utils";

export interface SelectableItemOptions {
  id?: string;
  selectionManager: MultipleSelectionManager;
  key: Key;
  ref: { current: HTMLElement | null };
  shouldSelectOnPressUp?: boolean;
  allowsDifferentPressOrigin?: boolean;
  isVirtualized?: boolean;
  focus?: () => void;
  shouldUseVirtualFocus?: boolean;
  isDisabled?: boolean;
  onAction?: () => void;
  linkBehavior?: "action" | "selection" | "override" | "none";
  UNSTABLE_itemBehavior?: "action" | "option";
}

export interface SelectableItemStates {
  isPressed: boolean;
  isSelected: boolean;
  isFocused: boolean;
  isDisabled: boolean;
  allowsSelection: boolean;
  hasAction: boolean;
}

export interface SelectableItemAria extends SelectableItemStates {
  itemProps: Record<string, unknown>;
}

export function useSelectableItem(options: SelectableItemOptions): SelectableItemAria {
  const {
    selectionManager: manager,
    key,
    ref,
    shouldUseVirtualFocus,
    focus,
    onAction,
    linkBehavior = "action",
  } = options;

  const router = useRouter();

  const isDisabled = Boolean(options.isDisabled || manager.isDisabled(key));
  const isLinkOverride = manager.isLink(key) && linkBehavior === "override";
  const isActionOverride = onAction && options.UNSTABLE_itemBehavior === "action";
  const hasLinkAction = manager.isLink(key) && linkBehavior !== "selection" && linkBehavior !== "none";
  const allowsSelection = !isDisabled && manager.canSelectItem(key) && !isLinkOverride && !isActionOverride;
  const allowsActions = (onAction || hasLinkAction) && !isDisabled;
  const hasPrimaryAction =
    allowsActions &&
    (manager.selectionBehavior === "replace" ? !allowsSelection : !allowsSelection || manager.isEmpty);
  const hasSecondaryAction =
    allowsActions && allowsSelection && manager.selectionBehavior === "replace";
  const hasAction = hasPrimaryAction || hasSecondaryAction;
  const shouldSelectOnMouseDown = !shouldUseVirtualFocus && !options.shouldSelectOnPressUp;
  const shouldSelectOnMouseUp =
    !shouldUseVirtualFocus && Boolean(options.shouldSelectOnPressUp && options.allowsDifferentPressOrigin);
  const canSelectViaMousePress = allowsSelection && !hasPrimaryAction;
  let selectedOnMouseDown = false;
  let selectedOnMouseUp = false;

  const performAction = (event: MouseEvent | KeyboardEvent) => {
    if (onAction) {
      onAction();
      ref.current?.dispatchEvent(new CustomEvent("react-aria-item-action", { bubbles: true }));
    }

    if (hasLinkAction && ref.current) {
      const itemProps = manager.getItemProps(key);
      router.open(ref.current, event, itemProps.href, itemProps.routerOptions);
    }
  };

  const onSelect = (event: MouseEvent | KeyboardEvent) => {
    if (isDisabled) {
      return;
    }

    if (event instanceof KeyboardEvent && isNonContiguousSelectionModifier(event)) {
      manager.toggleSelection(key);
      return;
    }

    if (manager.selectionMode === "none") {
      return;
    }

    if (manager.isLink(key)) {
      if (linkBehavior === "selection" && ref.current) {
        const itemProps = manager.getItemProps(key);
        router.open(ref.current, event, itemProps.href, itemProps.routerOptions);
        manager.setSelectedKeys(manager.selectedKeys);
        return;
      }

      if (linkBehavior === "override" || linkBehavior === "none") {
        return;
      }
    }

    if (manager.selectionMode === "single") {
      if (manager.isSelected(key) && !manager.disallowEmptySelection) {
        manager.toggleSelection(key);
      } else {
        manager.replaceSelection(key);
      }
      return;
    }

    if (event.shiftKey) {
      manager.extendSelection(key);
    } else if (
      manager.selectionBehavior === "toggle" ||
      isCtrlKeyPressed(event) ||
      (event as PointerEvent).pointerType === "touch" ||
      (event as PointerEvent).pointerType === "virtual"
    ) {
      manager.toggleSelection(key);
    } else {
      manager.replaceSelection(key);
    }
  };

  if (manager.focusedKey === key && manager.isFocused && !shouldUseVirtualFocus) {
    if (focus) {
      focus();
    } else if (document.activeElement !== ref.current && ref.current) {
      focusSafely(ref.current);
    }
  } else if (manager.focusedKey === key && manager.isFocused && shouldUseVirtualFocus) {
    moveVirtualFocus(ref.current);
  }

  const itemProps: Record<string, unknown> = {};

  if (!shouldUseVirtualFocus && !isDisabled) {
    itemProps.tabIndex = key === manager.focusedKey ? 0 : -1;
    itemProps.onFocus = (event: FocusEvent) => {
      if (event.target === ref.current) {
        manager.setFocusedKey(key);
      }
    };
  } else if (isDisabled) {
    itemProps.onMousedown = (event: MouseEvent) => {
      event.preventDefault();
    };
  }

  itemProps.onClick = (event: MouseEvent) => {
    if (selectedOnMouseDown || selectedOnMouseUp) {
      selectedOnMouseDown = false;
      selectedOnMouseUp = false;
      return;
    }

    if (shouldUseVirtualFocus && !isDisabled) {
      manager.setFocused(true);
      manager.setFocusedKey(key);
    }

    if (!allowsSelection && hasAction) {
      performAction(event);
      return;
    }

    onSelect(event);
    if (hasPrimaryAction) {
      performAction(event);
    }
  };

  if (shouldUseVirtualFocus && !isDisabled) {
    itemProps.onMousedown = (event: MouseEvent) => {
      event.preventDefault();
    };
  } else if (shouldSelectOnMouseDown && canSelectViaMousePress && !isDisabled) {
    itemProps.onMousedown = (event: MouseEvent) => {
      if (event.button !== 0) {
        return;
      }

      onSelect(event);
      selectedOnMouseDown = true;
    };
  }

  if (shouldSelectOnMouseUp && canSelectViaMousePress && !isDisabled) {
    itemProps.onMouseup = (event: MouseEvent) => {
      if (event.button !== 0) {
        return;
      }

      onSelect(event);
      selectedOnMouseUp = true;
    };
  }

  itemProps.onDoubleClick = (event: MouseEvent) => {
    if (hasSecondaryAction) {
      performAction(event);
    }
  };

  itemProps.onKeydown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      if (hasAction) {
        performAction(event);
      } else {
        onSelect(event);
      }
      return;
    }

    if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      onSelect(event);
    }
  };

  if (isDisabled && manager.focusedKey === key) {
    manager.setFocusedKey(null);
  }

  return {
    itemProps,
    isPressed: false,
    isSelected: manager.isSelected(key),
    isFocused: manager.isFocused && manager.focusedKey === key,
    isDisabled,
    allowsSelection,
    hasAction,
  };
}
