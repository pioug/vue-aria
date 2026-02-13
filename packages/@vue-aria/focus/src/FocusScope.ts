import {
  createShadowTreeWalker,
  getActiveElement,
  getOwnerDocument,
  isFocusable,
  isTabbable,
  nodeContains,
} from "@vue-aria/utils";
import { defineComponent, h, inject, onBeforeMount, onBeforeUnmount, onMounted, provide, shallowRef, type InjectionKey } from "vue";

export interface FocusManagerOptions {
  from?: Element | null;
  tabbable?: boolean;
  wrap?: boolean;
  accept?: (node: Element) => boolean;
}

export interface FocusManager {
  focusNext(opts?: FocusManagerOptions): Element | null;
  focusPrevious(opts?: FocusManagerOptions): Element | null;
  focusFirst(opts?: FocusManagerOptions): Element | null;
  focusLast(opts?: FocusManagerOptions): Element | null;
}

export interface FocusScopeProps {
  children?: unknown;
  contain?: boolean;
  restoreFocus?: boolean;
  autoFocus?: boolean;
}

export function getFocusableTreeWalker(
  root: Element,
  opts?: FocusManagerOptions,
  _scope?: Element[]
): TreeWalker {
  const filter = opts?.tabbable ? isTabbable : isFocusable;
  const rootElement = root?.nodeType === Node.ELEMENT_NODE ? root : null;
  const doc = getOwnerDocument(rootElement);

  const walker = createShadowTreeWalker(doc, root || doc, NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      if (nodeContains(opts?.from, node)) {
        return NodeFilter.FILTER_REJECT;
      }

      if (filter(node as Element) && (!opts?.accept || opts.accept(node as Element))) {
        return NodeFilter.FILTER_ACCEPT;
      }

      return NodeFilter.FILTER_SKIP;
    },
  }) as unknown as TreeWalker;

  if (opts?.from) {
    walker.currentNode = opts.from;
  }

  return walker;
}

function focusElement(element: Element | null): Element | null {
  if (element instanceof HTMLElement) {
    element.focus();
    return element;
  }

  return null;
}

export function createFocusManager(
  ref: { current: Element | null },
  defaultOptions: FocusManagerOptions = {}
): FocusManager {
  return {
    focusNext(opts: FocusManagerOptions = {}) {
      const root = ref.current;
      if (!root) {
        return null;
      }

      const {
        from,
        tabbable = defaultOptions.tabbable,
        wrap = defaultOptions.wrap,
        accept = defaultOptions.accept,
      } = opts;
      const node = from || getActiveElement(getOwnerDocument(root));
      const walker = getFocusableTreeWalker(root, { tabbable, accept });
      if (nodeContains(root, node)) {
        walker.currentNode = node as Node;
      }

      let nextNode = walker.nextNode() as Element | null;
      if (!nextNode && wrap) {
        walker.currentNode = root;
        nextNode = walker.nextNode() as Element | null;
      }

      return focusElement(nextNode);
    },

    focusPrevious(opts: FocusManagerOptions = {}) {
      const root = ref.current;
      if (!root) {
        return null;
      }

      const {
        from,
        tabbable = defaultOptions.tabbable,
        wrap = defaultOptions.wrap,
        accept = defaultOptions.accept,
      } = opts;
      const node = from || getActiveElement(getOwnerDocument(root));
      const walker = getFocusableTreeWalker(root, { tabbable, accept });
      if (nodeContains(root, node)) {
        walker.currentNode = node as Node;
      }

      let previousNode = walker.previousNode() as Element | null;
      if (!previousNode && wrap) {
        walker.currentNode = root;
        let next: Element | null = null;
        do {
          next = walker.nextNode() as Element | null;
          if (next) {
            previousNode = next;
          }
        } while (next);
      }

      return focusElement(previousNode);
    },

    focusFirst(opts: FocusManagerOptions = {}) {
      const root = ref.current;
      if (!root) {
        return null;
      }

      const { tabbable = defaultOptions.tabbable, accept = defaultOptions.accept } = opts;
      const walker = getFocusableTreeWalker(root, { tabbable, accept });
      walker.currentNode = root;
      return focusElement(walker.nextNode() as Element | null);
    },

    focusLast(opts: FocusManagerOptions = {}) {
      const root = ref.current;
      if (!root) {
        return null;
      }

      const { tabbable = defaultOptions.tabbable, accept = defaultOptions.accept } = opts;
      const walker = getFocusableTreeWalker(root, { tabbable, accept });
      walker.currentNode = root;

      let current: Element | null = null;
      let next: Element | null = null;
      do {
        next = walker.nextNode() as Element | null;
        if (next) {
          current = next;
        }
      } while (next);

      return focusElement(current);
    },
  };
}

const activeScopeRef = shallowRef<Element | null>(null);
const FocusManagerContext: InjectionKey<FocusManager> = Symbol("FocusManagerContext");

export const FocusScope = defineComponent({
  name: "FocusScope",
  props: {
    contain: Boolean,
    restoreFocus: Boolean,
    autoFocus: Boolean,
  },
  setup(props, { slots }) {
    const scopeRootRef = shallowRef<Element | null>(null);
    const previousFocused = shallowRef<Element | null>(null);
    const lastFocusedInScope = shallowRef<Element | null>(null);
    let keydownListener: ((event: KeyboardEvent) => void) | null = null;
    let scopeFocusInListener: ((event: FocusEvent) => void) | null = null;
    let documentFocusInListener: ((event: FocusEvent) => void) | null = null;
    let restoringFocus = false;

    const focusManager = createFocusManager({
      get current() {
        return scopeRootRef.value;
      },
      set current(value: Element | null) {
        scopeRootRef.value = value;
      },
    });

    provide(FocusManagerContext, focusManager);

    onBeforeMount(() => {
      if (typeof document !== "undefined") {
        previousFocused.value = getActiveElement(document);
      }
    });

    onMounted(() => {
      if (!(scopeRootRef.value instanceof HTMLElement)) {
        return;
      }

      const root = scopeRootRef.value;
      const ownerDocument = getOwnerDocument(root);
      if (!previousFocused.value) {
        previousFocused.value = getActiveElement(ownerDocument);
      }
      if (!activeScopeRef.value) {
        activeScopeRef.value = root;
      }

      scopeFocusInListener = (event: FocusEvent) => {
        const target = event.target as Element | null;
        if (!(scopeRootRef.value instanceof HTMLElement) || !nodeContains(scopeRootRef.value, target)) {
          return;
        }

        const currentActiveScope = activeScopeRef.value;
        if (
          currentActiveScope
          && currentActiveScope !== scopeRootRef.value
          && nodeContains(scopeRootRef.value, currentActiveScope)
          && nodeContains(currentActiveScope, target)
        ) {
          return;
        }

        activeScopeRef.value = scopeRootRef.value;
        lastFocusedInScope.value = target;
      };

      root.addEventListener("focusin", scopeFocusInListener);

      const activeElement = getActiveElement(ownerDocument);
      if (nodeContains(root, activeElement)) {
        activeScopeRef.value = root;
        lastFocusedInScope.value = activeElement;
      } else if (props.autoFocus) {
        focusManager.focusFirst({ tabbable: true });
      }

      if (props.contain) {
        keydownListener = (event: KeyboardEvent) => {
          const scopeRoot = scopeRootRef.value;
          if (
            event.key !== "Tab"
            || event.altKey
            || event.ctrlKey
            || event.metaKey
            || !(scopeRoot instanceof HTMLElement)
            || activeScopeRef.value !== scopeRoot
            || !nodeContains(scopeRoot, getOwnerDocument(scopeRoot).activeElement)
          ) {
            return;
          }

          if (event.shiftKey) {
            const previous = focusManager.focusPrevious({ tabbable: true });
            if (!previous) {
              event.preventDefault();
              focusManager.focusLast({ tabbable: true });
            }
          } else {
            const next = focusManager.focusNext({ tabbable: true });
            if (!next) {
              event.preventDefault();
              focusManager.focusFirst({ tabbable: true });
            }
          }
        };

        root.addEventListener("keydown", keydownListener);

        documentFocusInListener = (event: FocusEvent) => {
          const scopeRoot = scopeRootRef.value;
          const target = event.target as Element | null;
          if (
            restoringFocus
            || !(scopeRoot instanceof HTMLElement)
            || activeScopeRef.value !== scopeRoot
            || !target
            || nodeContains(scopeRoot, target)
          ) {
            return;
          }

          restoringFocus = true;
          try {
            const fallback = lastFocusedInScope.value && nodeContains(scopeRoot, lastFocusedInScope.value)
              ? lastFocusedInScope.value
              : null;
            if (fallback instanceof HTMLElement) {
              fallback.focus();
            } else {
              focusManager.focusFirst({ tabbable: true });
            }
          } finally {
            restoringFocus = false;
          }
        };

        ownerDocument.addEventListener("focusin", documentFocusInListener, true);
      }
    });

    onBeforeUnmount(() => {
      if (scopeFocusInListener && scopeRootRef.value instanceof HTMLElement) {
        scopeRootRef.value.removeEventListener("focusin", scopeFocusInListener);
      }

      if (keydownListener && scopeRootRef.value instanceof HTMLElement) {
        scopeRootRef.value.removeEventListener("keydown", keydownListener);
      }

      if (documentFocusInListener && scopeRootRef.value instanceof HTMLElement) {
        getOwnerDocument(scopeRootRef.value).removeEventListener("focusin", documentFocusInListener, true);
      }

      if (activeScopeRef.value === scopeRootRef.value) {
        activeScopeRef.value = null;
      }

      if (props.restoreFocus && previousFocused.value instanceof HTMLElement) {
        previousFocused.value.focus();
      }
    });

    return () =>
      h(
        "div",
        {
          "data-focus-scope": "",
          ref: ((el: Element | null) => {
            scopeRootRef.value = el;
          }) as any,
        },
        slots.default?.() ?? []
      );
  },
});

export function useFocusManager(): FocusManager | undefined {
  return inject(FocusManagerContext, undefined);
}

export function isElementInChildOfActiveScope(element: Element | null): boolean {
  return nodeContains(activeScopeRef.value, element);
}
