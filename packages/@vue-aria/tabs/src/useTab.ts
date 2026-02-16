import { filterDOMProps, mergeProps, useLinkProps } from "@vue-aria/utils";
import { useFocusable } from "@vue-aria/interactions";
import { useSelectableItem } from "@vue-aria/selection";
import type { Key } from "@vue-aria/collections";
import type { TabListState } from "@vue-stately/tabs";
import { generateId } from "./utils";

export interface AriaTabProps {
  key: Key;
  isDisabled?: boolean;
  shouldSelectOnPressUp?: boolean;
}

export interface TabAria {
  tabProps: Record<string, unknown>;
  isSelected: boolean;
  isDisabled: boolean;
  isPressed: boolean;
}

export function useTab<T>(
  props: AriaTabProps,
  state: TabListState<T>,
  ref: { current: HTMLElement | null }
): TabAria {
  const { key, isDisabled: propsDisabled, shouldSelectOnPressUp } = props;
  const manager = state.selectionManager;
  const isSelected = key === state.selectedKey;

  const isDisabled = Boolean(
    propsDisabled || state.isDisabled || state.selectionManager.isDisabled(key)
  );
  const { itemProps, isPressed } = useSelectableItem({
    selectionManager: manager,
    key,
    ref,
    isDisabled,
    shouldSelectOnPressUp,
    linkBehavior: "selection",
  });

  const tabId = generateId(state, key, "tab");
  const tabPanelId = generateId(state, key, "tabpanel");
  const tabIndex = itemProps.tabIndex as number | undefined;

  const item = state.collection.getItem(key as any) as any;
  const domProps = filterDOMProps(item?.props, { labelable: true });
  delete (domProps as { id?: unknown }).id;
  const linkProps = useLinkProps(item?.props);
  const focusRef = {
    get value() {
      return ref.current;
    },
    set value(value: HTMLElement | null) {
      ref.current = value;
    },
  };
  const { focusableProps } = useFocusable(
    {
      ...item?.props,
      isDisabled,
    } as any,
    focusRef as any
  );

  return {
    tabProps: mergeProps(domProps, focusableProps, linkProps, itemProps, {
      id: tabId,
      "aria-selected": isSelected,
      "aria-disabled": isDisabled || undefined,
      "aria-controls": isSelected ? tabPanelId : undefined,
      tabIndex: isDisabled ? undefined : tabIndex,
      role: "tab",
    }),
    isSelected,
    isDisabled,
    isPressed,
  };
}
