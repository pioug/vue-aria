import { chain, filterDOMProps, isMac, isWebKit, mergeProps, useLinkProps, useSlotId } from "@vue-aria/utils";
import { getItemCount, getItemId, listData } from "./utils";
import { isFocusVisible, useHover } from "@vue-aria/interactions";
import { useSelectableItem, type SelectableItemStates } from "@vue-aria/selection";
import type { Key } from "@vue-aria/collections";
import type { ListState } from "./types";

export interface OptionAria extends SelectableItemStates {
  optionProps: Record<string, unknown>;
  labelProps: Record<string, unknown>;
  descriptionProps: Record<string, unknown>;
  isFocused: boolean;
  isFocusVisible: boolean;
}

export interface AriaOptionProps {
  isDisabled?: boolean;
  isSelected?: boolean;
  "aria-label"?: string;
  key: Key;
  shouldSelectOnPressUp?: boolean;
  shouldFocusOnHover?: boolean;
  isVirtualized?: boolean;
  shouldUseVirtualFocus?: boolean;
}

export function useOption<T>(
  props: AriaOptionProps,
  state: ListState<T>,
  ref: { current: HTMLElement | null }
): OptionAria {
  const { key } = props;
  const data = listData.get(state as ListState<unknown>);

  const isDisabled = props.isDisabled ?? state.selectionManager.isDisabled(key);
  const isSelected = props.isSelected ?? state.selectionManager.isSelected(key);
  const shouldSelectOnPressUp = props.shouldSelectOnPressUp ?? data?.shouldSelectOnPressUp;
  const shouldFocusOnHover = props.shouldFocusOnHover ?? data?.shouldFocusOnHover;
  const shouldUseVirtualFocus = props.shouldUseVirtualFocus ?? data?.shouldUseVirtualFocus;
  const isVirtualized = props.isVirtualized ?? data?.isVirtualized;

  const labelId = useSlotId();
  const descriptionId = useSlotId();

  const optionProps: Record<string, unknown> = {
    role: "option",
    "aria-disabled": isDisabled || undefined,
    "aria-selected": state.selectionManager.selectionMode !== "none" ? isSelected : undefined,
  };

  if (!(isMac() && isWebKit())) {
    optionProps["aria-label"] = props["aria-label"];
    optionProps["aria-labelledby"] = labelId;
    optionProps["aria-describedby"] = descriptionId;
  }

  const item = state.collection.getItem(key);
  if (isVirtualized) {
    const index = Number(item?.index);
    optionProps["aria-posinset"] = Number.isNaN(index) ? undefined : index + 1;
    optionProps["aria-setsize"] = getItemCount(state.collection);
  }

  const id = getItemId(state, key);
  const itemHasLink = Boolean((item?.props as Record<string, unknown> | undefined)?.href);
  const itemHasAction = typeof (item?.props as Record<string, unknown> | undefined)?.onAction === "function";
  const onAction =
    data?.onAction && (itemHasAction || itemHasLink)
      ? () => data.onAction?.(key)
      : undefined;
  const { itemProps, isPressed, isFocused, hasAction, allowsSelection } = useSelectableItem({
    selectionManager: state.selectionManager,
    key,
    ref,
    shouldSelectOnPressUp,
    allowsDifferentPressOrigin: shouldSelectOnPressUp && shouldFocusOnHover,
    isVirtualized,
    shouldUseVirtualFocus,
    isDisabled,
    onAction: onAction || item?.props?.onAction ? chain(item?.props?.onAction, onAction) : undefined,
    linkBehavior: data?.linkBehavior,
    UNSTABLE_itemBehavior: data?.UNSTABLE_itemBehavior,
    id,
  });

  const { hoverProps } = useHover({
    isDisabled: isDisabled || !shouldFocusOnHover,
    onHoverStart() {
      if (!isFocusVisible()) {
        state.selectionManager.setFocused(true);
        state.selectionManager.setFocusedKey(key);
      }
    },
  });

  const domProps = filterDOMProps(item?.props);
  delete (domProps as Record<string, unknown>).id;
  const linkProps = useLinkProps(item?.props);

  return {
    optionProps: {
      ...optionProps,
      ...mergeProps(domProps, itemProps, hoverProps, linkProps),
      id,
    },
    labelProps: {
      id: labelId,
    },
    descriptionProps: {
      id: descriptionId,
    },
    isFocused,
    isFocusVisible: isFocused && state.selectionManager.isFocused && isFocusVisible(),
    isSelected,
    isDisabled,
    isPressed,
    allowsSelection,
    hasAction,
  };
}
