import {
  focusSafely,
  useLongPress,
  usePress,
  type LongPressEvent,
  type PointerType,
  type PressEvent,
  type PressHookProps,
} from "@vue-aria/interactions";
import { moveVirtualFocus } from "@vue-aria/focus";
import type { Key, MultipleSelectionManager } from "@vue-aria/selection-state";
import { chain, isCtrlKeyPressed, mergeProps, openLink, useId, useRouter } from "@vue-aria/utils";
import type { RouterOptions } from "@vue-aria/utils";
import { watchEffect } from "vue";
import { getCollectionId, isNonContiguousSelectionModifier } from "./utils";

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

type SelectEvent =
  | PressEvent
  | LongPressEvent
  | (KeyboardEvent & { pointerType?: string })
  | (PointerEvent & { pointerType?: string })
  | (MouseEvent & { pointerType?: string });

export function useSelectableItem(options: SelectableItemOptions): SelectableItemAria {
  let {
    id,
    selectionManager: manager,
    key,
    ref,
    shouldSelectOnPressUp,
    shouldUseVirtualFocus,
    focus,
    isDisabled,
    onAction,
    allowsDifferentPressOrigin,
    linkBehavior = "action",
  } = options;

  const router = useRouter();
  id = useId(id);

  const onSelect = (event: SelectEvent) => {
    if (event.pointerType === "keyboard" && isNonContiguousSelectionModifier(event)) {
      manager.toggleSelection(key);
      return;
    }

    if (manager.selectionMode === "none") {
      return;
    }

    if (manager.isLink(key)) {
      if (linkBehavior === "selection" && ref.current) {
        const itemProps = manager.getItemProps(key);
        router.open(ref.current, event as KeyboardEvent, itemProps.href, itemProps.routerOptions);
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
      return;
    }

    if (
      manager.selectionBehavior === "toggle" ||
      isCtrlKeyPressed(event) ||
      event.pointerType === "touch" ||
      event.pointerType === "virtual"
    ) {
      manager.toggleSelection(key);
      return;
    }

    manager.replaceSelection(key);
  };

  watchEffect(() => {
    if (manager.focusedKey === key && manager.isFocused) {
      if (!shouldUseVirtualFocus) {
        if (focus) {
          focus();
        } else if (document.activeElement !== ref.current && ref.current) {
          focusSafely(ref.current);
        }
      } else {
        moveVirtualFocus(ref.current);
      }
    }
  });

  isDisabled = Boolean(isDisabled || manager.isDisabled(key));

  let itemProps: Record<string, unknown> = {};
  if (!shouldUseVirtualFocus && !isDisabled) {
    itemProps = {
      tabIndex: key === manager.focusedKey ? 0 : -1,
      onFocus(event: FocusEvent) {
        if (event.target === ref.current) {
          manager.setFocusedKey(key);
        }
      },
    };
  } else if (isDisabled) {
    itemProps.onMousedown = (event: MouseEvent) => {
      event.preventDefault();
    };
  }

  if (isDisabled && manager.focusedKey === key) {
    manager.setFocusedKey(null);
  }

  // With checkbox selection, action becomes primary. With highlight selection, action is secondary.
  const isLinkOverride = manager.isLink(key) && linkBehavior === "override";
  const isActionOverride = onAction && options.UNSTABLE_itemBehavior === "action";
  const allowsSelection = !isDisabled && manager.canSelectItem(key) && !isLinkOverride && !isActionOverride;
  const hasLinkAction =
    manager.isLink(key) &&
    linkBehavior !== "selection" &&
    linkBehavior !== "none" &&
    !(manager.selectionBehavior === "replace" && allowsSelection);
  const allowsActions = (onAction || hasLinkAction) && !isDisabled;
  const hasPrimaryAction =
    allowsActions &&
    (manager.selectionBehavior === "replace" ? !allowsSelection : !allowsSelection || manager.isEmpty);
  const hasSecondaryAction =
    allowsActions && allowsSelection && manager.selectionBehavior === "replace";
  const hasAction = hasPrimaryAction || hasSecondaryAction;
  const modality = { current: null as PointerType | null };
  const longPressEnabled = hasAction && allowsSelection;
  const longPressEnabledOnPressStart = { current: false };
  const hadPrimaryActionOnPressStart = { current: false };
  const collectionItemProps = (manager.getItemProps(key) ?? {}) as Record<string, unknown>;

  const performAction = (event: MouseEvent | KeyboardEvent | PressEvent | LongPressEvent) => {
    if (onAction) {
      onAction();
      ref.current?.dispatchEvent(new CustomEvent("react-aria-item-action", { bubbles: true }));
    }

    if (hasLinkAction && ref.current) {
      router.open(
        ref.current,
        event as KeyboardEvent,
        collectionItemProps.href as string,
        collectionItemProps.routerOptions as RouterOptions | undefined
      );
    }
  };

  // By default selection occurs on press start. When shouldSelectOnPressUp is true,
  // keyboard still selects on key down but pointer selection can move to press/click phase.
  let itemPressProps: PressHookProps = { ref };
  if (shouldSelectOnPressUp) {
    itemPressProps.onPressStart = (event) => {
      modality.current = event.pointerType;
      longPressEnabledOnPressStart.current = longPressEnabled;
      if (event.pointerType === "keyboard" && (!hasAction || isSelectionKey(event.key))) {
        onSelect(event);
      }
    };

    if (!allowsDifferentPressOrigin) {
      itemPressProps.onPress = (event) => {
        if (hasPrimaryAction || (hasSecondaryAction && event.pointerType !== "mouse")) {
          if (event.pointerType === "keyboard" && !isActionKey(event.key)) {
            return;
          }

          performAction(event);
        } else if (event.pointerType !== "keyboard" && allowsSelection) {
          onSelect(event);
        }
      };
    } else {
      itemPressProps.onPressUp = hasPrimaryAction
        ? undefined
        : (event) => {
            if (event.pointerType === "mouse" && allowsSelection) {
              onSelect(event);
            }
          };

      itemPressProps.onPress = hasPrimaryAction
        ? performAction
        : (event) => {
            if (event.pointerType !== "keyboard" && event.pointerType !== "mouse" && allowsSelection) {
              onSelect(event);
            }
          };
    }
  } else {
    itemPressProps.onPressStart = (event) => {
      modality.current = event.pointerType;
      longPressEnabledOnPressStart.current = longPressEnabled;
      hadPrimaryActionOnPressStart.current = hasPrimaryAction;

      if (
        allowsSelection &&
        ((event.pointerType === "mouse" && !hasPrimaryAction) ||
          (event.pointerType === "keyboard" && (!allowsActions || isSelectionKey(event.key))))
      ) {
        onSelect(event);
      }
    };

    itemPressProps.onPress = (event) => {
      if (
        event.pointerType === "touch" ||
        event.pointerType === "pen" ||
        event.pointerType === "virtual" ||
        (event.pointerType === "keyboard" && hasAction && isActionKey(event.key)) ||
        (event.pointerType === "mouse" && hadPrimaryActionOnPressStart.current)
      ) {
        if (hasAction) {
          performAction(event);
        } else if (allowsSelection) {
          onSelect(event);
        }
      }
    };
  }

  itemProps["data-collection"] = getCollectionId(manager.collection as object);
  itemProps["data-key"] = key;
  itemPressProps.preventFocusOnPress = shouldUseVirtualFocus;

  if (shouldUseVirtualFocus) {
    itemPressProps = mergeProps(itemPressProps, {
      onPressStart(event: PressEvent) {
        if (event.pointerType !== "touch") {
          manager.setFocused(true);
          manager.setFocusedKey(key);
        }
      },
      onPress(event: PressEvent) {
        if (event.pointerType === "touch") {
          manager.setFocused(true);
          manager.setFocusedKey(key);
        }
      },
    });
  }

  for (const handlerKey of [
    "onPressStart",
    "onPressEnd",
    "onPressChange",
    "onPress",
    "onPressUp",
    "onClick",
  ] as const) {
    const collectionHandler = collectionItemProps[handlerKey] as ((event: Event) => void) | undefined;
    if (typeof collectionHandler === "function") {
      itemPressProps[handlerKey] = chain(
        itemPressProps[handlerKey] as ((event: Event) => void) | undefined,
        collectionHandler
      );
    }
  }

  const { pressProps, isPressed } = usePress(itemPressProps);

  const onDoubleClick = hasSecondaryAction
    ? (event: MouseEvent) => {
        if (modality.current === "mouse") {
          event.stopPropagation();
          event.preventDefault();
          performAction(event);
        }
      }
    : undefined;

  const { longPressProps } = useLongPress({
    isDisabled: !longPressEnabled,
    onLongPress(event) {
      if (event.pointerType === "touch") {
        onSelect(event);
        manager.setSelectionBehavior("toggle");
      }
    },
  });

  const onDragstartCapture = (event: DragEvent) => {
    if (modality.current === "touch" && longPressEnabledOnPressStart.current) {
      event.preventDefault();
    }
  };

  const onClick =
    linkBehavior !== "none" && manager.isLink(key)
      ? (event: MouseEvent) => {
          if (!(openLink as { isOpening?: boolean }).isOpening) {
            event.preventDefault();
          }
        }
      : undefined;

  const mergedItemProps = mergeProps(
    itemProps,
    allowsSelection || hasPrimaryAction || (shouldUseVirtualFocus && !isDisabled) ? pressProps : {},
    longPressEnabled ? longPressProps : {},
    { onDoubleClick, onDragstartCapture, onClick, id },
    shouldUseVirtualFocus ? { onMousedown(event: MouseEvent) { event.preventDefault(); } } : undefined
  );

  for (const handlerKey of [
    "onFocus",
    "onMousedown",
    "onMouseup",
    "onTouchstart",
    "onTouchend",
    "onTouchcancel",
    "onPointerdown",
    "onPointerup",
    "onPointerenter",
    "onPointerleave",
    "onMouseenter",
    "onMouseleave",
    "onDragstart",
    "onDragstartCapture",
    "onDoubleClick",
    "onKeydown",
  ] as const) {
    const collectionHandler = collectionItemProps[handlerKey] as ((event: Event) => void) | undefined;
    if (typeof collectionHandler === "function") {
      mergedItemProps[handlerKey] = chain(
        mergedItemProps[handlerKey] as ((event: Event) => void) | undefined,
        collectionHandler
      );
    }
  }

  return {
    itemProps: mergedItemProps,
    isPressed,
    isSelected: manager.isSelected(key),
    isFocused: manager.isFocused && manager.focusedKey === key,
    isDisabled,
    allowsSelection,
    hasAction,
  };
}

function isActionKey(key: string | undefined) {
  return key === "Enter";
}

function isSelectionKey(key: string | undefined) {
  return key === " ";
}
