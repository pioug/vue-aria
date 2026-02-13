import { filterDOMProps, mergeProps, useId } from "@vue-aria/utils";
import { listData } from "./utils";
import { useFocusWithin } from "@vue-aria/interactions";
import { useLabel } from "@vue-aria/label";
import { useSelectableList } from "@vue-aria/selection";
import type { LayoutDelegate, KeyboardDelegate } from "@vue-aria/selection";
import type { AriaListBoxProps, ListState } from "./types";

export interface ListBoxAria {
  listBoxProps: Record<string, unknown>;
  labelProps: Record<string, unknown>;
}

export interface AriaListBoxOptions<T> extends Omit<AriaListBoxProps<T>, "children"> {
  isVirtualized?: boolean;
  keyboardDelegate?: KeyboardDelegate;
  layoutDelegate?: LayoutDelegate;
  shouldUseVirtualFocus?: boolean;
  linkBehavior?: "action" | "selection" | "override";
}

export function useListBox<T>(
  props: AriaListBoxOptions<T>,
  state: ListState<T>,
  ref: { current: HTMLElement | null }
): ListBoxAria {
  const domProps = filterDOMProps(props, { labelable: true });
  const selectionBehavior = props.selectionBehavior || "toggle";
  let linkBehavior = props.linkBehavior || (selectionBehavior === "replace" ? "action" : "override");
  if (selectionBehavior === "toggle" && linkBehavior === "action") {
    linkBehavior = "override";
  }

  const { listProps } = useSelectableList({
    ...props,
    ref,
    selectionManager: state.selectionManager,
    collection: state.collection,
    disabledKeys: state.disabledKeys,
    linkBehavior,
  });

  const { focusWithinProps } = useFocusWithin({
    onFocusWithin: props.onFocus as ((event: FocusEvent) => void) | undefined,
    onBlurWithin: props.onBlur as ((event: FocusEvent) => void) | undefined,
    onFocusWithinChange: props.onFocusChange as ((isFocused: boolean) => void) | undefined,
  });

  const id = useId(props.id as string | undefined);
  listData.set(state as ListState<unknown>, {
    id,
    shouldUseVirtualFocus: props.shouldUseVirtualFocus as boolean | undefined,
    shouldSelectOnPressUp: props.shouldSelectOnPressUp as boolean | undefined,
    shouldFocusOnHover: props.shouldFocusOnHover as boolean | undefined,
    isVirtualized: props.isVirtualized,
    onAction: props.onAction as ((key: import("@vue-aria/collections").Key) => void) | undefined,
    linkBehavior,
    UNSTABLE_itemBehavior: props.UNSTABLE_itemBehavior as "action" | "option" | undefined,
  });

  const { labelProps, fieldProps } = useLabel({
    ...props,
    id,
    labelElementType: "span",
  });

  return {
    labelProps,
    listBoxProps: mergeProps(
      domProps,
      focusWithinProps,
      state.selectionManager.selectionMode === "multiple" ? { "aria-multiselectable": "true" } : {},
      {
        role: "listbox",
        ...mergeProps(fieldProps, listProps),
      }
    ),
  };
}
