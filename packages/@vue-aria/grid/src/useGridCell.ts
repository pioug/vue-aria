import { getFocusableTreeWalker } from "@vue-aria/focus";
import { focusSafely, isFocusVisible } from "@vue-aria/interactions";
import { useLocale } from "@vue-aria/i18n";
import { useSelectableItem } from "@vue-aria/selection";
import { getScrollParent, mergeProps, nodeContains, scrollIntoViewport } from "@vue-aria/utils";
import type { Key } from "@vue-aria/collections";
import type { GridCollectionType, GridNode, GridState } from "@vue-aria/grid-state";
import { gridMap } from "./utils";

export interface GridCellProps {
  node: GridNode<unknown>;
  isVirtualized?: boolean;
  focusMode?: "child" | "cell";
  shouldSelectOnPressUp?: boolean;
  colSpan?: number;
  onAction?: () => void;
}

export interface GridCellAria {
  gridCellProps: Record<string, unknown>;
  isPressed: boolean;
}

export function useGridCell<T, C extends GridCollectionType<T>>(
  props: GridCellProps,
  state: GridState<T, C>,
  ref: { current: HTMLElement | null }
): GridCellAria {
  const {
    node,
    isVirtualized,
    focusMode = "child",
    shouldSelectOnPressUp,
    onAction,
  } = props;
  const { direction } = useLocale().value;
  const shared = gridMap.get(state as unknown as GridState<unknown, GridCollectionType<unknown>>);
  const keyboardDelegate = shared?.keyboardDelegate;
  const onCellAction = shared?.actions.onCellAction;

  const keyWhenFocused = { current: null as Key | null };

  const focus = () => {
    if (!ref.current) {
      return;
    }

    const treeWalker = getFocusableTreeWalker(ref.current);
    if (focusMode === "child") {
      if (
        nodeContains(ref.current, document.activeElement)
        && ref.current !== document.activeElement
      ) {
        return;
      }

      const focusable =
        state.selectionManager.childFocusStrategy === "last"
          ? last(treeWalker)
          : (treeWalker.firstChild() as HTMLElement | null);
      if (focusable) {
        focusSafely(focusable);
        return;
      }
    }

    if (
      (keyWhenFocused.current != null && node.key !== keyWhenFocused.current)
      || !nodeContains(ref.current, document.activeElement)
    ) {
      focusSafely(ref.current);
    }
  };

  const { itemProps, isPressed } = useSelectableItem({
    selectionManager: state.selectionManager,
    key: node.key,
    ref,
    isVirtualized,
    focus,
    shouldSelectOnPressUp,
    onAction: onCellAction ? () => onCellAction(node.key) : onAction,
    isDisabled: state.collection.size === 0,
  });

  const onKeydownCapture = (event: KeyboardEvent) => {
    if (
      !nodeContains(event.currentTarget as Node | null, event.target as Node | null)
      || state.isKeyboardNavigationDisabled
      || !ref.current
      || !document.activeElement
    ) {
      return;
    }

    const walker = getFocusableTreeWalker(ref.current);
    walker.currentNode = document.activeElement;

    switch (event.key) {
      case "ArrowLeft": {
        let focusable: HTMLElement | null =
          direction === "rtl"
            ? (walker.nextNode() as HTMLElement | null)
            : (walker.previousNode() as HTMLElement | null);

        if (focusMode === "child" && focusable === ref.current) {
          focusable = null;
        }

        event.preventDefault();
        event.stopPropagation();
        if (focusable) {
          focusSafely(focusable);
          scrollIntoViewport(focusable, { containingElement: getScrollParent(ref.current) });
        } else {
          const prev = keyboardDelegate?.getKeyLeftOf?.(node.key);
          if (prev !== node.key) {
            redispatchKeyboardEvent(event, ref.current.parentElement);
            break;
          }

          if (focusMode === "cell" && direction === "rtl") {
            focusSafely(ref.current);
            scrollIntoViewport(ref.current, { containingElement: getScrollParent(ref.current) });
          } else {
            walker.currentNode = ref.current;
            focusable =
              direction === "rtl"
                ? (walker.firstChild() as HTMLElement | null)
                : last(walker);
            if (focusable) {
              focusSafely(focusable);
              scrollIntoViewport(focusable, { containingElement: getScrollParent(ref.current) });
            }
          }
        }
        break;
      }
      case "ArrowRight": {
        let focusable: HTMLElement | null =
          direction === "rtl"
            ? (walker.previousNode() as HTMLElement | null)
            : (walker.nextNode() as HTMLElement | null);

        if (focusMode === "child" && focusable === ref.current) {
          focusable = null;
        }

        event.preventDefault();
        event.stopPropagation();
        if (focusable) {
          focusSafely(focusable);
          scrollIntoViewport(focusable, { containingElement: getScrollParent(ref.current) });
        } else {
          const next = keyboardDelegate?.getKeyRightOf?.(node.key);
          if (next !== node.key) {
            redispatchKeyboardEvent(event, ref.current.parentElement);
            break;
          }

          if (focusMode === "cell" && direction === "ltr") {
            focusSafely(ref.current);
            scrollIntoViewport(ref.current, { containingElement: getScrollParent(ref.current) });
          } else {
            walker.currentNode = ref.current;
            focusable =
              direction === "rtl"
                ? last(walker)
                : (walker.firstChild() as HTMLElement | null);
            if (focusable) {
              focusSafely(focusable);
              scrollIntoViewport(focusable, { containingElement: getScrollParent(ref.current) });
            }
          }
        }
        break;
      }
      case "ArrowUp":
      case "ArrowDown":
        if (!event.altKey && nodeContains(ref.current, event.target as Node | null)) {
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

    requestAnimationFrame(() => {
      if (focusMode === "child" && document.activeElement === ref.current) {
        focus();
      }
    });
  };

  const gridCellProps = mergeProps(itemProps, {
    role: "gridcell",
    onKeydownCapture,
    "aria-colspan": node.colSpan,
    "aria-colindex": node.colIndex != null ? node.colIndex + 1 : undefined,
    colSpan: isVirtualized ? undefined : node.colSpan,
    onFocus,
  }) as Record<string, unknown>;

  if (isVirtualized) {
    gridCellProps["aria-colindex"] = (node.colIndex ?? node.index) + 1;
  }

  if (
    shouldSelectOnPressUp
    && gridCellProps.tabIndex != null
    && gridCellProps.onPointerdown == null
  ) {
    gridCellProps.onPointerdown = (event: PointerEvent) => {
      const element = event.currentTarget as HTMLElement | null;
      if (!element) {
        return;
      }

      const tabIndex = element.getAttribute("tabindex");
      element.removeAttribute("tabindex");
      requestAnimationFrame(() => {
        if (tabIndex != null) {
          element.setAttribute("tabindex", tabIndex);
        }
      });
    };
  }

  return {
    gridCellProps,
    isPressed,
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
