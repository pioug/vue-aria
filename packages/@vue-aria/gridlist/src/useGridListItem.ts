import { focusSafely, getFocusableTreeWalker } from "@vue-aria/focus";
import { isFocusVisible } from "@vue-aria/interactions";
import { useLocale } from "@vue-aria/i18n";
import { useSelectableItem, type SelectableItemStates } from "@vue-aria/selection";
import type { Key, Node as CollectionNode } from "@vue-aria/collections";
import type { ListState } from "@vue-stately/list";
import type { TreeState } from "@vue-stately/tree";
import {
  chain,
  getScrollParent,
  mergeProps,
  nodeContains,
  scrollIntoViewport,
  useSlotId,
  useSyntheticLinkProps,
} from "@vue-aria/utils";
import { getRowId, listMap } from "./utils";

export interface AriaGridListItemOptions {
  node: CollectionNode<unknown>;
  isVirtualized?: boolean;
  shouldSelectOnPressUp?: boolean;
  hasChildItems?: boolean;
}

export interface GridListItemAria extends SelectableItemStates {
  rowProps: Record<string, unknown>;
  gridCellProps: Record<string, unknown>;
  descriptionProps: Record<string, unknown>;
}

function getNodeRowProps(node: CollectionNode<unknown>): Record<string, unknown> {
  const props = node.props as Record<string, unknown> | undefined;
  const rowProps = props?.rowProps;
  if (!rowProps || typeof rowProps !== "object" || Array.isArray(rowProps)) {
    return {};
  }

  return rowProps as Record<string, unknown>;
}

function getNodeAriaLabel(node: CollectionNode<unknown>): string | undefined {
  const props = node.props as Record<string, unknown> | undefined;
  const ariaLabel = props?.["aria-label"] ?? props?.ariaLabel;
  if (typeof ariaLabel !== "string") {
    return undefined;
  }

  const trimmed = ariaLabel.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

const EXPANSION_KEYS = {
  expand: {
    ltr: "ArrowRight",
    rtl: "ArrowLeft",
  },
  collapse: {
    ltr: "ArrowLeft",
    rtl: "ArrowRight",
  },
} as const;

function isTreeState<T>(state: ListState<T> | TreeState<T>): state is TreeState<T> {
  return "expandedKeys" in state && typeof state.toggleKey === "function";
}

/**
 * Provides row and gridcell semantics for items rendered within a grid list.
 */
export function useGridListItem<T>(
  props: AriaGridListItemOptions,
  state: ListState<T> | TreeState<T>,
  ref: { current: HTMLElement | null }
): GridListItemAria {
  const { node, isVirtualized } = props;
  const { direction } = useLocale().value;
  const shared = listMap.get(state as object);
  if (!shared) {
    throw new Error("Unknown list");
  }

  let { onAction, linkBehavior, keyboardNavigationBehavior, shouldSelectOnPressUp } = shared;
  const descriptionId = useSlotId();

  const keyWhenFocused = { current: null as Key | null };
  const focus = () => {
    if (
      ref.current !== null &&
      ((keyWhenFocused.current != null && node.key !== keyWhenFocused.current)
        || !nodeContains(ref.current, document.activeElement))
    ) {
      focusSafely(ref.current);
    }
  };

  let treeGridRowProps: Record<string, unknown> = {};
  let hasChildRows = props.hasChildItems;
  const hasLink = state.selectionManager.isLink(node.key);
  if (isTreeState(state)) {
    const collection = state.collection as unknown as Iterable<CollectionNode<T>> & {
      getChildren?: (key: Key) => Iterable<CollectionNode<T>>;
      getItem: (key: Key) => CollectionNode<T> | null;
    };

    const loadedChildRows = [...(collection.getChildren?.(node.key) ?? [])].filter((row) => row.type === "item");
    const hasLoadedChildRows = loadedChildRows.length > 0;
    hasChildRows = hasChildRows || hasLoadedChildRows;

    if (onAction == null && !hasLink && state.selectionManager.selectionMode === "none" && hasChildRows) {
      onAction = () => state.toggleKey(node.key);
    }

    const isExpanded = hasLoadedChildRows ? state.expandedKeys.has(node.key) : undefined;
    let setSize = 1;
    let posInSet = 1;
    if (node.level > 0 && node.parentKey != null) {
      const parent = collection.getItem(node.parentKey);
      if (parent) {
        const siblings = [...(collection.getChildren?.(parent.key) ?? [])].filter((row) => row.type === "item");
        setSize = siblings.length;
        const siblingIndex = siblings.findIndex((row) => row.key === node.key);
        posInSet = siblingIndex >= 0 ? siblingIndex + 1 : 1;
      }
    } else {
      const rootItems = [...collection].filter((row) => row.level === 0 && row.type === "item");
      setSize = rootItems.length;
      const rootIndex = rootItems.findIndex((row) => row.key === node.key);
      posInSet = rootIndex >= 0 ? rootIndex + 1 : 1;
    }

    treeGridRowProps = {
      "aria-expanded": isExpanded,
      "aria-level": node.level + 1,
      "aria-posinset": posInSet,
      "aria-setsize": setSize,
    };
  }

  const { itemProps, ...itemStates } = useSelectableItem({
    selectionManager: state.selectionManager,
    key: node.key,
    ref,
    isVirtualized,
    shouldSelectOnPressUp: props.shouldSelectOnPressUp || shouldSelectOnPressUp,
    onAction:
      onAction || node.props?.onAction
        ? chain(
            node.props?.onAction as (() => void) | undefined,
            onAction ? () => onAction(node.key) : undefined
          )
        : undefined,
    focus,
    linkBehavior,
  });

  const onKeydownCapture = (event: KeyboardEvent) => {
    if (
      !nodeContains(event.currentTarget as globalThis.Node | null, event.target as globalThis.Node | null)
      || !ref.current
      || !document.activeElement
    ) {
      return;
    }

    const walker = getFocusableTreeWalker(ref.current);
    walker.currentNode = document.activeElement;

    if (isTreeState(state) && document.activeElement === ref.current) {
      if (
        event.key === EXPANSION_KEYS.expand[direction]
        && state.selectionManager.focusedKey === node.key
        && hasChildRows
        && !state.expandedKeys.has(node.key)
      ) {
        state.toggleKey(node.key);
        event.stopPropagation();
        return;
      }

      if (
        event.key === EXPANSION_KEYS.collapse[direction]
        && state.selectionManager.focusedKey === node.key
        && hasChildRows
        && state.expandedKeys.has(node.key)
      ) {
        state.toggleKey(node.key);
        event.stopPropagation();
        return;
      }
    }

    switch (event.key) {
      case "ArrowLeft": {
        if (keyboardNavigationBehavior === "arrow") {
          const focusable = direction === "rtl"
            ? (walker.nextNode() as HTMLElement | null)
            : (walker.previousNode() as HTMLElement | null);

          if (focusable) {
            event.preventDefault();
            event.stopPropagation();
            focusSafely(focusable);
            scrollIntoViewport(focusable, { containingElement: getScrollParent(ref.current) });
          } else {
            event.preventDefault();
            event.stopPropagation();
            if (direction === "rtl") {
              focusSafely(ref.current);
              scrollIntoViewport(ref.current, { containingElement: getScrollParent(ref.current) });
            } else {
              walker.currentNode = ref.current;
              const lastElement = last(walker);
              if (lastElement) {
                focusSafely(lastElement);
                scrollIntoViewport(lastElement, { containingElement: getScrollParent(ref.current) });
              }
            }
          }
        }
        break;
      }
      case "ArrowRight": {
        if (keyboardNavigationBehavior === "arrow") {
          const focusable = direction === "rtl"
            ? (walker.previousNode() as HTMLElement | null)
            : (walker.nextNode() as HTMLElement | null);

          if (focusable) {
            event.preventDefault();
            event.stopPropagation();
            focusSafely(focusable);
            scrollIntoViewport(focusable, { containingElement: getScrollParent(ref.current) });
          } else {
            event.preventDefault();
            event.stopPropagation();
            if (direction === "ltr") {
              focusSafely(ref.current);
              scrollIntoViewport(ref.current, { containingElement: getScrollParent(ref.current) });
            } else {
              walker.currentNode = ref.current;
              const lastElement = last(walker);
              if (lastElement) {
                focusSafely(lastElement);
                scrollIntoViewport(lastElement, { containingElement: getScrollParent(ref.current) });
              }
            }
          }
        }
        break;
      }
      case "ArrowUp":
      case "ArrowDown":
        if (!event.altKey && nodeContains(ref.current, event.target as globalThis.Node | null)) {
          event.stopPropagation();
          event.preventDefault();
          redispatchKeyboardEvent(event, ref.current.parentElement);
        }
        break;
    }
  };

  const onFocus = (event: FocusEvent) => {
    keyWhenFocused.current = node.key;
    if (event.target !== ref.current) {
      if (!isFocusVisible()) {
        state.selectionManager.setFocusedKey(node.key);
      }
      return;
    }
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (
      !nodeContains(event.currentTarget as globalThis.Node | null, event.target as globalThis.Node | null)
      || !ref.current
      || !document.activeElement
    ) {
      return;
    }

    if (event.key === "Tab" && keyboardNavigationBehavior === "tab") {
      const walker = getFocusableTreeWalker(ref.current, { tabbable: true });
      walker.currentNode = document.activeElement;
      const next = event.shiftKey ? walker.previousNode() : walker.nextNode();
      if (next) {
        event.stopPropagation();
      }
    }
  };

  const syntheticLinkProps = useSyntheticLinkProps(node.props);
  const linkProps = state.selectionManager.isLink(node.key) ? syntheticLinkProps : {};
  const customRowProps = getNodeRowProps(node);
  const nodeAriaLabel = getNodeAriaLabel(node);
  const rowProps = mergeProps(itemProps, linkProps, customRowProps, {
    role: "row",
    onKeydownCapture,
    onKeydown,
    onFocus,
    "aria-label": (nodeAriaLabel ?? node["aria-label"] ?? node.textValue) || undefined,
    "aria-selected": state.selectionManager.canSelectItem(node.key)
      ? state.selectionManager.isSelected(node.key)
      : undefined,
    "aria-disabled": state.selectionManager.isDisabled(node.key) || undefined,
    "aria-labelledby":
      descriptionId && (node["aria-label"] || node.textValue)
        ? `${getRowId(state as object, node.key)} ${descriptionId}`
        : undefined,
    id: getRowId(state as object, node.key),
  }) as Record<string, unknown>;

  if (isVirtualized) {
    const collection = state.collection as unknown as Iterable<CollectionNode<T>> & {
      getKeys: () => IterableIterator<Key>;
      getItem: (key: Key) => CollectionNode<T> | null;
    };
    const nodes = [...collection];
    rowProps["aria-rowindex"] = nodes.some((entry) => entry.type === "section")
      ? [...collection.getKeys()]
          .filter((key) => collection.getItem(key)?.type !== "section")
          .findIndex((key) => key === node.key) + 1
      : node.index + 1;
  }

  const gridCellProps = {
    role: "gridcell",
    "aria-colindex": 1,
  };

  return {
    rowProps: mergeProps(rowProps, treeGridRowProps) as Record<string, unknown>,
    gridCellProps,
    descriptionProps: {
      id: descriptionId,
    },
    ...itemStates,
  };
}

function redispatchKeyboardEvent(event: KeyboardEvent, element: Element | null): void {
  element?.dispatchEvent(new KeyboardEvent(event.type, toKeyboardEventInit(event)));
}

function toKeyboardEventInit(event: KeyboardEvent): KeyboardEventInit {
  return {
    key: event.key,
    code: event.code,
    location: event.location,
    ctrlKey: event.ctrlKey,
    shiftKey: event.shiftKey,
    altKey: event.altKey,
    metaKey: event.metaKey,
    repeat: event.repeat,
    isComposing: event.isComposing,
    bubbles: event.bubbles,
    cancelable: event.cancelable,
    composed: event.composed,
  };
}

function last(walker: TreeWalker): HTMLElement | null {
  let next: HTMLElement | null = null;
  let current: HTMLElement | null = null;
  do {
    current = walker.lastChild() as HTMLElement | null;
    if (current) {
      next = current;
    }
  } while (current);
  return next;
}
