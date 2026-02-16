import { useHasTabbableChild } from "@vue-aria/focus";
import { useGridSelectionAnnouncement, useHighlightSelectionDescription } from "@vue-aria/grid";
import { useSelectableList, type KeyboardDelegate, type LayoutDelegate } from "@vue-aria/selection";
import type { Key } from "@vue-aria/collections";
import type { DisabledBehavior, FocusStrategy } from "@vue-stately/selection";
import type { ListState } from "@vue-stately/list";
import type { TreeState } from "@vue-stately/tree";
import { filterDOMProps, mergeProps, useId } from "@vue-aria/utils";
import { listMap } from "./utils";

export interface GridListProps<T> {
  autoFocus?: boolean | FocusStrategy;
  onAction?: (key: Key) => void;
  disabledBehavior?: DisabledBehavior;
  shouldSelectOnPressUp?: boolean;
}

export interface AriaGridListProps<T> extends GridListProps<T> {
  id?: string;
  keyboardNavigationBehavior?: "arrow" | "tab";
  escapeKeyBehavior?: "clearSelection" | "none";
  "aria-label"?: string;
  "aria-labelledby"?: string;
  [key: string]: unknown;
}

export interface AriaGridListOptions<T> extends Omit<AriaGridListProps<T>, "children"> {
  isVirtualized?: boolean;
  disallowTypeAhead?: boolean;
  keyboardDelegate?: KeyboardDelegate;
  layoutDelegate?: LayoutDelegate;
  shouldFocusWrap?: boolean;
  linkBehavior?: "action" | "selection" | "override";
}

export interface GridListAria {
  gridProps: Record<string, unknown>;
}

/**
 * Provides grid-list semantics for single-column interactive collections.
 */
export function useGridList<T>(
  props: AriaGridListOptions<T>,
  state: ListState<T> | TreeState<T>,
  ref: { current: HTMLElement | null }
): GridListAria {
  const {
    isVirtualized,
    keyboardDelegate,
    layoutDelegate,
    onAction,
    disallowTypeAhead,
    linkBehavior = "action",
    keyboardNavigationBehavior = "arrow",
    escapeKeyBehavior = "clearSelection",
    shouldSelectOnPressUp,
  } = props;

  if (!props["aria-label"] && !props["aria-labelledby"]) {
    console.warn("An aria-label or aria-labelledby prop is required for accessibility.");
  }

  const { listProps } = useSelectableList({
    selectionManager: state.selectionManager,
    collection: state.collection as any,
    disabledKeys: state.disabledKeys,
    ref,
    keyboardDelegate: keyboardDelegate as KeyboardDelegate | undefined,
    layoutDelegate: layoutDelegate as LayoutDelegate | undefined,
    isVirtualized: isVirtualized as boolean | undefined,
    selectOnFocus: state.selectionManager.selectionBehavior === "replace",
    shouldFocusWrap: props.shouldFocusWrap as boolean | undefined,
    linkBehavior: linkBehavior as "action" | "selection" | "override" | undefined,
    disallowTypeAhead: disallowTypeAhead as boolean | undefined,
    autoFocus: props.autoFocus as boolean | FocusStrategy | undefined,
    escapeKeyBehavior: escapeKeyBehavior as "clearSelection" | "none" | undefined,
  });

  const id = useId(props.id as string | undefined);
  listMap.set(state as object, {
    id,
    onAction: onAction as ((key: Key) => void) | undefined,
    linkBehavior: linkBehavior as "action" | "selection" | "override" | undefined,
    keyboardNavigationBehavior: keyboardNavigationBehavior as "arrow" | "tab",
    shouldSelectOnPressUp: shouldSelectOnPressUp as boolean | undefined,
  });

  const descriptionProps = useHighlightSelectionDescription({
    selectionManager: state.selectionManager,
    hasItemActions: !!onAction,
  });

  const collectionSize = (state.collection as { size?: number }).size ?? 0;
  const hasTabbableChild = useHasTabbableChild(ref, {
    isDisabled: collectionSize !== 0,
  });

  const domProps = filterDOMProps(props, { labelable: true });
  const gridProps = mergeProps(
    domProps,
    {
      role: "grid",
      id,
      "aria-multiselectable":
        state.selectionManager.selectionMode === "multiple" ? "true" : undefined,
    },
    collectionSize === 0 ? { tabIndex: hasTabbableChild ? -1 : 0 } : listProps,
    descriptionProps
  ) as Record<string, unknown>;

  if (isVirtualized) {
    gridProps["aria-rowcount"] = collectionSize;
    gridProps["aria-colcount"] = 1;
  }

  useGridSelectionAnnouncement({}, state as any);

  return {
    gridProps,
  };
}
