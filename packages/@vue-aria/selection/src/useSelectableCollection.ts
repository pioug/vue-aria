import { dispatchVirtualFocus, getFocusableTreeWalker, moveVirtualFocus } from "@vue-aria/focus";
import { useLocale } from "@vue-aria/i18n";
import { focusSafely } from "@vue-aria/interactions";
import type { FocusStrategy, Key, MultipleSelectionManager } from "@vue-aria/selection-state";
import { onScopeDispose, watch } from "vue";
import {
  CLEAR_FOCUS_EVENT,
  FOCUS_EVENT,
  focusWithoutScrolling,
  isCtrlKeyPressed,
  isTabbable,
  mergeProps,
  nodeContains,
  getActiveElement,
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
    autoFocus = false,
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
  let scrollPosition = { top: 0, left: 0 };
  let lastFocusedKey = manager.focusedKey;
  let shouldVirtualFocusFirst = false;
  let shouldAutoFocus = autoFocus;
  let didAutoFocus = false;

  const onScroll = () => {
    scrollPosition = {
      top: scrollRef.current?.scrollTop ?? 0,
      left: scrollRef.current?.scrollLeft ?? 0,
    };
  };

  scrollRef.current?.addEventListener("scroll", onScroll);
  onScopeDispose(() => {
    scrollRef.current?.removeEventListener("scroll", onScroll);
  });

  watch(
    [() => manager.focusedKey, () => manager.isFocused],
    () => {
      if (
        manager.isFocused &&
        manager.focusedKey != null &&
        (manager.focusedKey !== lastFocusedKey || didAutoFocus) &&
        scrollRef.current &&
        ref.current
      ) {
        const element = getItemElement(ref, manager.focusedKey);
        if (
          element instanceof HTMLElement &&
          (getInteractionModality() === "keyboard" || didAutoFocus)
        ) {
          element.scrollIntoView({ block: "nearest" });
        }
      }

      if (
        !shouldUseVirtualFocus &&
        manager.isFocused &&
        manager.focusedKey == null &&
        lastFocusedKey != null &&
        ref.current
      ) {
        focusSafely(ref.current);
      }

      lastFocusedKey = manager.focusedKey;
      didAutoFocus = false;
    },
    { flush: "post" }
  );

  const resolveVirtualFocusFirst = () => {
    if (!shouldUseVirtualFocus || !ref.current || !shouldVirtualFocusFirst) {
      return;
    }

    const keyToFocus = delegate.getFirstKey?.() ?? null;
    if (keyToFocus == null) {
      const previousActiveElement = getActiveElement();
      moveVirtualFocus(ref.current);
      if (previousActiveElement instanceof Element) {
        dispatchVirtualFocus(previousActiveElement, null);
      }

      const collectionSize = (manager.collection as { size?: number } | undefined)?.size;
      if (typeof collectionSize === "number" && collectionSize > 0) {
        shouldVirtualFocusFirst = false;
      }
      return;
    }

    manager.setFocusedKey(keyToFocus);
    shouldVirtualFocusFirst = false;
  };

  watch(
    () => manager.collection,
    () => {
      resolveVirtualFocusFirst();
    },
    { flush: "post" }
  );

  watch(
    () => manager.focusedKey,
    () => {
      const collectionSize = (manager.collection as { size?: number } | undefined)?.size;
      if (typeof collectionSize === "number" && collectionSize > 0) {
        shouldVirtualFocusFirst = false;
      }
    },
    { flush: "post" }
  );

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
        if (manager.focusedKey === null && event.shiftKey) {
          return;
        }

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
        if (manager.focusedKey === null && event.shiftKey) {
          return;
        }

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
        if (!allowsTabNavigation && ref.current) {
          if (event.shiftKey) {
            ref.current.focus();
            break;
          }

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
      let nextFocusedKey: Key | null | undefined;
      const relatedTarget = event.relatedTarget as Element | null;
      if (
        relatedTarget &&
        ((event.currentTarget as Node).compareDocumentPosition(relatedTarget) &
          Node.DOCUMENT_POSITION_FOLLOWING)
      ) {
        nextFocusedKey = manager.lastSelectedKey ?? delegate.getLastKey();
      } else {
        nextFocusedKey = manager.firstSelectedKey ?? delegate.getFirstKey();
      }

      if (nextFocusedKey != null) {
        manager.setFocusedKey(nextFocusedKey);
        if (selectOnFocus && !manager.isSelected(nextFocusedKey)) {
          manager.replaceSelection(nextFocusedKey);
        }
      }
    } else if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollPosition.top;
      scrollRef.current.scrollLeft = scrollPosition.left;
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

  const applyAutoFocus = () => {
    if (!shouldAutoFocus) {
      return;
    }

    let focusedKey: Key | null = null;
    if (autoFocus === "first") {
      focusedKey = delegate.getFirstKey?.() ?? null;
    } else if (autoFocus === "last") {
      focusedKey = delegate.getLastKey?.() ?? null;
    }

    if (manager.selectedKeys.size > 0) {
      for (const key of manager.selectedKeys) {
        if (manager.canSelectItem(key)) {
          focusedKey = key;
          break;
        }
      }
    }

    manager.setFocused(true);
    manager.setFocusedKey(focusedKey);
    if (focusedKey == null && !shouldUseVirtualFocus && ref.current) {
      focusSafely(ref.current);
    }
    const collectionSize = (manager.collection as { size?: number } | undefined)?.size;
    if (collectionSize == null || collectionSize > 0) {
      shouldAutoFocus = false;
      didAutoFocus = true;
    }
  };

  applyAutoFocus();

  watch(
    () => manager.collection,
    () => {
      applyAutoFocus();
    },
    { flush: "post" }
  );

  if (shouldUseVirtualFocus && ref.current) {
    const onVirtualFocus = ((event: Event) => {
      const customEvent = event as CustomEvent<{ focusStrategy?: FocusStrategy }>;
      event.stopPropagation();
      manager.setFocused(true);
      if (customEvent.detail?.focusStrategy === "first") {
        shouldVirtualFocusFirst = true;
        resolveVirtualFocusFirst();
      }
    }) as EventListener;

    const onVirtualClearFocus = ((event: Event) => {
      const customEvent = event as CustomEvent<{ clearFocusKey?: boolean }>;
      event.stopPropagation();
      manager.setFocused(false);
      if (customEvent.detail?.clearFocusKey) {
        manager.setFocusedKey(null);
      }
    }) as EventListener;

    ref.current.addEventListener(FOCUS_EVENT, onVirtualFocus);
    ref.current.addEventListener(CLEAR_FOCUS_EVENT, onVirtualClearFocus);
    onScopeDispose(() => {
      ref.current?.removeEventListener(FOCUS_EVENT, onVirtualFocus);
      ref.current?.removeEventListener(CLEAR_FOCUS_EVENT, onVirtualClearFocus);
    });
  }

  if (ref.current) {
    const onFocusScopeRestore = ((event: Event) => {
      event.preventDefault();
      manager.setFocused(true);
    }) as EventListener;

    ref.current.addEventListener("react-aria-focus-scope-restore", onFocusScopeRestore);
    onScopeDispose(() => {
      ref.current?.removeEventListener("react-aria-focus-scope-restore", onFocusScopeRestore);
    });
  }

  return {
    collectionProps: mergeProps(mergedHandlers, {
      tabIndex,
      "data-collection": collectionId,
    }),
  };
}
