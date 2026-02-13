import { getFocusableTreeWalker } from "@vue-aria/focus";
import { useLocale } from "@vue-aria/i18n";
import type { FocusStrategy, Key, MultipleSelectionManager } from "@vue-aria/selection-state";
import {
  focusWithoutScrolling,
  isCtrlKeyPressed,
  isTabbable,
  mergeProps,
  nodeContains,
  useRouter,
} from "@vue-aria/utils";
import { getInteractionModality } from "@vue-aria/interactions";
import { useTypeSelect } from "./useTypeSelect";
import { getItemElement, isNonContiguousSelectionModifier, useCollectionId } from "./utils";
import type { KeyboardDelegate } from "./types";

export interface AriaSelectableCollectionOptions {
  selectionManager: MultipleSelectionManager;
  keyboardDelegate: KeyboardDelegate;
  ref: { current: HTMLElement | null };
  autoFocus?: boolean | FocusStrategy;
  shouldFocusWrap?: boolean;
  disallowEmptySelection?: boolean;
  disallowSelectAll?: boolean;
  escapeKeyBehavior?: "clearSelection" | "none";
  selectOnFocus?: boolean;
  disallowTypeAhead?: boolean;
  shouldUseVirtualFocus?: boolean;
  allowsTabNavigation?: boolean;
  isVirtualized?: boolean;
  scrollRef?: { current: HTMLElement | null };
  linkBehavior?: "action" | "selection" | "override";
}

export interface SelectableCollectionAria {
  collectionProps: Record<string, unknown>;
}

export function useSelectableCollection(
  options: AriaSelectableCollectionOptions
): SelectableCollectionAria {
  const {
    selectionManager: manager,
    keyboardDelegate: delegate,
    ref,
    shouldFocusWrap = false,
    disallowEmptySelection = false,
    disallowSelectAll = false,
    escapeKeyBehavior = "clearSelection",
    selectOnFocus = manager.selectionBehavior === "replace",
    disallowTypeAhead = false,
    shouldUseVirtualFocus,
    allowsTabNavigation = false,
    scrollRef = ref,
    linkBehavior = "action",
  } = options;

  const router = useRouter();
  const locale = useLocale();

  const navigateToKey = (
    key: Key | null | undefined,
    event: KeyboardEvent,
    childFocus?: FocusStrategy
  ) => {
    if (key == null) {
      return;
    }

    if (
      manager.isLink(key) &&
      linkBehavior === "selection" &&
      selectOnFocus &&
      !isNonContiguousSelectionModifier(event)
    ) {
      manager.setFocusedKey(key, childFocus);
      const item = getItemElement(ref, key);
      const itemProps = manager.getItemProps(key);
      if (item) {
        router.open(item, event, itemProps.href, itemProps.routerOptions);
      }
      return;
    }

    manager.setFocusedKey(key, childFocus);
    if (manager.isLink(key) && linkBehavior === "override") {
      return;
    }

    if (event.shiftKey && manager.selectionMode === "multiple") {
      manager.extendSelection(key);
    } else if (selectOnFocus && !isNonContiguousSelectionModifier(event)) {
      manager.replaceSelection(key);
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.altKey && event.key === "Tab") {
      event.preventDefault();
    }

    if (!ref.current || !nodeContains(ref.current, event.target as Element | null)) {
      return;
    }

    switch (event.key) {
      case "ArrowDown": {
        let nextKey =
          manager.focusedKey != null
            ? delegate.getKeyBelow?.(manager.focusedKey)
            : delegate.getFirstKey?.();
        if (nextKey == null && shouldFocusWrap) {
          nextKey = delegate.getFirstKey?.();
        }

        if (nextKey != null) {
          event.preventDefault();
          navigateToKey(nextKey, event);
        }
        break;
      }
      case "ArrowUp": {
        let nextKey =
          manager.focusedKey != null
            ? delegate.getKeyAbove?.(manager.focusedKey)
            : delegate.getLastKey?.();
        if (nextKey == null && shouldFocusWrap) {
          nextKey = delegate.getLastKey?.();
        }

        if (nextKey != null) {
          event.preventDefault();
          navigateToKey(nextKey, event);
        }
        break;
      }
      case "ArrowLeft": {
        if (!delegate.getKeyLeftOf) {
          break;
        }

        let nextKey = manager.focusedKey != null ? delegate.getKeyLeftOf(manager.focusedKey) : null;
        if (nextKey == null && shouldFocusWrap) {
          nextKey = locale.value.direction === "rtl" ? delegate.getFirstKey() : delegate.getLastKey();
        }

        if (nextKey != null) {
          event.preventDefault();
          navigateToKey(nextKey, event, locale.value.direction === "rtl" ? "first" : "last");
        }
        break;
      }
      case "ArrowRight": {
        if (!delegate.getKeyRightOf) {
          break;
        }

        let nextKey = manager.focusedKey != null ? delegate.getKeyRightOf(manager.focusedKey) : null;
        if (nextKey == null && shouldFocusWrap) {
          nextKey = locale.value.direction === "rtl" ? delegate.getLastKey() : delegate.getFirstKey();
        }

        if (nextKey != null) {
          event.preventDefault();
          navigateToKey(nextKey, event, locale.value.direction === "rtl" ? "last" : "first");
        }
        break;
      }
      case "Home": {
        const firstKey = delegate.getFirstKey();
        if (firstKey != null) {
          event.preventDefault();
          manager.setFocusedKey(firstKey);
          if (isCtrlKeyPressed(event) && event.shiftKey && manager.selectionMode === "multiple") {
            manager.extendSelection(firstKey);
          } else if (selectOnFocus) {
            manager.replaceSelection(firstKey);
          }
        }
        break;
      }
      case "End": {
        const lastKey = delegate.getLastKey();
        if (lastKey != null) {
          event.preventDefault();
          manager.setFocusedKey(lastKey);
          if (isCtrlKeyPressed(event) && event.shiftKey && manager.selectionMode === "multiple") {
            manager.extendSelection(lastKey);
          } else if (selectOnFocus) {
            manager.replaceSelection(lastKey);
          }
        }
        break;
      }
      case "PageDown": {
        if (manager.focusedKey != null) {
          const nextKey = delegate.getKeyPageBelow(manager.focusedKey);
          if (nextKey != null) {
            event.preventDefault();
            navigateToKey(nextKey, event);
          }
        }
        break;
      }
      case "PageUp": {
        if (manager.focusedKey != null) {
          const nextKey = delegate.getKeyPageAbove(manager.focusedKey);
          if (nextKey != null) {
            event.preventDefault();
            navigateToKey(nextKey, event);
          }
        }
        break;
      }
      case "a": {
        if (isCtrlKeyPressed(event) && manager.selectionMode === "multiple" && !disallowSelectAll) {
          event.preventDefault();
          manager.selectAll();
        }
        break;
      }
      case "Escape": {
        if (
          escapeKeyBehavior === "clearSelection" &&
          !disallowEmptySelection &&
          !manager.isEmpty
        ) {
          event.stopPropagation();
          event.preventDefault();
          manager.clearSelection();
        }
        break;
      }
      case "Tab": {
        if (!allowsTabNavigation && !event.shiftKey && ref.current) {
          const walker = getFocusableTreeWalker(ref.current, { tabbable: true });
          let next: HTMLElement | null = null;
          let last: HTMLElement | null = null;

          do {
            last = walker.lastChild() as HTMLElement | null;
            if (last) {
              next = last;
            }
          } while (last);

          if (
            next &&
            (!nodeContains(next, document.activeElement) ||
              (document.activeElement && !isTabbable(document.activeElement)))
          ) {
            focusWithoutScrolling(next);
          }
        }
        break;
      }
    }
  };

  const onFocus = (event: FocusEvent) => {
    if (manager.isFocused) {
      if (!nodeContains(event.currentTarget as Node | null, event.target as Node | null)) {
        manager.setFocused(false);
      }
      return;
    }

    if (!nodeContains(event.currentTarget as Node | null, event.target as Node | null)) {
      return;
    }

    manager.setFocused(true);
    if (manager.focusedKey == null) {
      const relatedTarget = event.relatedTarget as Element | null;
      if (
        relatedTarget &&
        ((event.currentTarget as Node).compareDocumentPosition(relatedTarget) &
          Node.DOCUMENT_POSITION_FOLLOWING)
      ) {
        manager.setFocusedKey(manager.lastSelectedKey ?? delegate.getLastKey());
      } else {
        manager.setFocusedKey(manager.firstSelectedKey ?? delegate.getFirstKey());
      }
    }

    if (manager.focusedKey != null && scrollRef.current) {
      const element = getItemElement(ref, manager.focusedKey);
      if (element instanceof HTMLElement) {
        if (!nodeContains(element, document.activeElement) && !shouldUseVirtualFocus) {
          focusWithoutScrolling(element);
        }

        if (getInteractionModality() === "keyboard") {
          element.scrollIntoView({ block: "nearest" });
        }
      }
    }
  };

  const onBlur = (event: FocusEvent) => {
    if (!nodeContains(event.currentTarget as Node | null, event.relatedTarget as Node | null)) {
      manager.setFocused(false);
    }
  };

  const handlers: Record<string, unknown> = {
    onKeydown: onKeyDown,
    onFocus,
    onBlur,
    onMousedown(event: MouseEvent) {
      if (scrollRef.current === event.target) {
        event.preventDefault();
      }
    },
  };

  const { typeSelectProps } = useTypeSelect({
    keyboardDelegate: delegate,
    selectionManager: manager,
  });

  const mergedHandlers = disallowTypeAhead ? handlers : mergeProps(typeSelectProps, handlers);
  const tabIndex = shouldUseVirtualFocus ? undefined : manager.focusedKey == null ? 0 : -1;
  const collectionId = useCollectionId(manager.collection as object);

  return {
    collectionProps: mergeProps(mergedHandlers, {
      tabIndex,
      "data-collection": collectionId,
    }),
  };
}
