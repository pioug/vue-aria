import { filterDOMProps, handleLinkClick, mergeProps, useLinkProps, useRouter, useSlotId } from "@vue-aria/utils";
import { isFocusVisible, useFocusable, useHover, useKeyboard, usePress } from "@vue-aria/interactions";
import { menuData } from "./utils";
import { useSelectableItem } from "@vue-aria/selection";
import type { Key } from "@vue-aria/collections";
import type { MenuState } from "./useMenu";

export interface MenuItemAria {
  menuItemProps: Record<string, unknown>;
  labelProps: Record<string, unknown>;
  descriptionProps: Record<string, unknown>;
  keyboardShortcutProps: Record<string, unknown>;
  isFocused: boolean;
  isFocusVisible: boolean;
  isSelected: boolean;
  isPressed: boolean;
  isDisabled: boolean;
}

export interface AriaMenuItemProps {
  id?: string;
  key: Key;
  isDisabled?: boolean;
  isSelected?: boolean;
  "aria-label"?: string;
  onClose?: () => void;
  closeOnSelect?: boolean;
  shouldCloseOnSelect?: boolean;
  isVirtualized?: boolean;
  onAction?: (key: Key) => void;
  "aria-haspopup"?: "menu" | "dialog";
  "aria-expanded"?: boolean | "true" | "false";
  "aria-controls"?: string;
  selectionManager?: any;
  onPressStart?: (event: any) => void;
  onPressUp?: (event: any) => void;
  onPress?: (event: any) => void;
  onPressChange?: (isPressed: boolean) => void;
  onPressEnd?: (event: any) => void;
  onClick?: (event: MouseEvent) => void;
  onHoverStart?: (event: any) => void;
  onHoverChange?: (isHovering: boolean) => void;
  onHoverEnd?: (event: any) => void;
  onKeyDown?: (event: any) => void;
  onKeyUp?: (event: any) => void;
  onFocus?: (event: FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;
  onBlur?: (event: FocusEvent) => void;
}

function getItemCount(collection: { getKeys(): Iterable<Key>; getItem(key: Key): { type?: string } | null }) {
  let count = 0;
  for (const key of collection.getKeys()) {
    const item = collection.getItem(key);
    if (item?.type === "item") {
      count += 1;
    }
  }
  return count;
}

export function useMenuItem<T>(
  props: AriaMenuItemProps,
  state: MenuState<T>,
  ref: { current: HTMLElement | null }
): MenuItemAria {
  const {
    id,
    key,
    closeOnSelect,
    shouldCloseOnSelect,
    isVirtualized,
    "aria-haspopup": hasPopup,
    onPressStart,
    onPressUp: pressUpProp,
    onPress,
    onPressChange: pressChangeProp,
    onPressEnd,
    onClick: onClickProp,
    onHoverStart: hoverStartProp,
    onHoverChange,
    onHoverEnd,
    onKeyDown,
    onKeyUp,
    onFocus,
    onFocusChange,
    onBlur,
    selectionManager = state.selectionManager,
  } = props;

  const isTrigger = !!hasPopup;
  const isTriggerExpanded = isTrigger && props["aria-expanded"] === "true";
  const isDisabled = props.isDisabled ?? selectionManager.isDisabled(key);
  const isSelected = props.isSelected ?? selectionManager.isSelected(key);
  const data = menuData.get(state as object) ?? {};
  const item = state.collection.getItem(key);
  const onClose = props.onClose || data.onClose;
  const router = useRouter();

  const performAction = () => {
    if (isTrigger) {
      return;
    }

    if (item?.props?.onAction) {
      item.props.onAction();
    } else if (props.onAction) {
      props.onAction(key);
    }

    data.onAction?.(key);
  };

  let role: "menuitem" | "menuitemradio" | "menuitemcheckbox" = "menuitem";
  if (!isTrigger) {
    if (selectionManager.selectionMode === "single") {
      role = "menuitemradio";
    } else if (selectionManager.selectionMode === "multiple") {
      role = "menuitemcheckbox";
    }
  }

  const labelId = useSlotId();
  const descriptionId = useSlotId();
  const keyboardId = useSlotId();

  const ariaProps: Record<string, unknown> = {
    id,
    "aria-disabled": isDisabled || undefined,
    role,
    "aria-label": props["aria-label"],
    "aria-labelledby": labelId,
    "aria-describedby": [descriptionId, keyboardId].filter(Boolean).join(" ") || undefined,
    "aria-controls": props["aria-controls"],
    "aria-haspopup": hasPopup,
    "aria-expanded": props["aria-expanded"],
  };

  if (selectionManager.selectionMode !== "none" && !isTrigger) {
    ariaProps["aria-checked"] = isSelected;
  }

  if (isVirtualized) {
    const index = Number(item?.index);
    ariaProps["aria-posinset"] = Number.isNaN(index) ? undefined : index + 1;
    ariaProps["aria-setsize"] = getItemCount(state.collection as any);
  }

  let isPressedRef = false;
  let interaction: { pointerType: string; key?: string } | null = null;

  const onPressChange = (isPressed: boolean) => {
    pressChangeProp?.(isPressed);
    isPressedRef = isPressed;
  };

  const onPressUp = (event: any) => {
    if (event.pointerType !== "keyboard") {
      interaction = { pointerType: event.pointerType };
    }

    if (event.pointerType === "mouse" && !isPressedRef) {
      (event.target as HTMLElement).click();
    }

    pressUpProp?.(event);
  };

  const onClick = (event: MouseEvent) => {
    onClickProp?.(event);
    performAction();
    if (item?.props?.href) {
      handleLinkClick(event as any, router, item.props.href, item.props.routerOptions);
    }

    let shouldClose =
      interaction?.pointerType === "keyboard"
        ? interaction?.key === "Enter" || selectionManager.selectionMode === "none" || selectionManager.isLink(key)
        : selectionManager.selectionMode !== "multiple" || selectionManager.isLink(key);
    shouldClose = shouldCloseOnSelect ?? closeOnSelect ?? shouldClose;

    if (onClose && !isTrigger && shouldClose) {
      onClose();
    }

    interaction = null;
  };

  const { itemProps, isFocused } = useSelectableItem({
    id,
    selectionManager,
    key,
    ref,
    shouldSelectOnPressUp: true,
    allowsDifferentPressOrigin: true,
    linkBehavior: "none" as any,
    shouldUseVirtualFocus: data.shouldUseVirtualFocus,
    isDisabled,
  });

  const { pressProps, isPressed } = usePress({
    onPressStart,
    onPress,
    onPressUp,
    onPressChange,
    onPressEnd,
    isDisabled,
  });

  const { hoverProps } = useHover({
    isDisabled,
    onHoverStart(event) {
      if (!isFocusVisible() && !(isTriggerExpanded && hasPopup)) {
        selectionManager.setFocused(true);
        selectionManager.setFocusedKey(key);
      }
      hoverStartProp?.(event);
    },
    onHoverChange,
    onHoverEnd,
  });

  const { keyboardProps } = useKeyboard({
    onKeyDown(event) {
      const eventAny = event as any;
      if (eventAny.repeat) {
        event.continuePropagation();
        return;
      }

      switch (eventAny.key) {
        case " ":
          interaction = { pointerType: "keyboard", key: " " };
          (eventAny.target as HTMLElement).click();
          break;
        case "Enter":
          interaction = { pointerType: "keyboard", key: "Enter" };
          if ((eventAny.target as HTMLElement).tagName !== "A") {
            (eventAny.target as HTMLElement).click();
          }
          break;
        default:
          if (!isTrigger) {
            event.continuePropagation();
          }
          onKeyDown?.(event);
          break;
      }
    },
    onKeyUp,
  });

  const { focusableProps } = useFocusable({ onBlur, onFocus, onFocusChange }, ref as any);
  const domProps = filterDOMProps((item?.props ?? {}) as Record<string, unknown>);
  delete (domProps as Record<string, unknown>).id;
  const linkProps = useLinkProps(item?.props);

  return {
    menuItemProps: {
      ...ariaProps,
      ...mergeProps(
        domProps,
        linkProps,
        isTrigger
          ? { onFocus: itemProps.onFocus, "data-collection": itemProps["data-collection"], "data-key": itemProps["data-key"] }
          : itemProps,
        pressProps,
        hoverProps,
        keyboardProps,
        focusableProps,
        data.shouldUseVirtualFocus || isTrigger ? { onMousedown: (event: MouseEvent) => event.preventDefault() } : undefined,
        isDisabled ? undefined : { onClick }
      ),
      tabIndex: itemProps.tabIndex != null && isTriggerExpanded && !data.shouldUseVirtualFocus ? -1 : itemProps.tabIndex,
    },
    labelProps: {
      id: labelId,
    },
    descriptionProps: {
      id: descriptionId,
    },
    keyboardShortcutProps: {
      id: keyboardId,
    },
    isFocused,
    isFocusVisible: isFocused && selectionManager.isFocused && isFocusVisible() && !isTriggerExpanded,
    isSelected,
    isPressed,
    isDisabled,
  };
}
