import {
  createShadowTreeWalker,
  getActiveElement,
  getOwnerDocument,
  getOwnerWindow,
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

const RESTORE_FOCUS_EVENT = "react-aria-focus-scope-restore";

function isHTMLElement(element: Element | null | undefined): element is HTMLElement {
  return !!element
    && (element instanceof HTMLElement || element instanceof getOwnerWindow(element).HTMLElement);
}

function isHTMLInputElement(element: Element | null | undefined): element is HTMLInputElement {
  return !!element
    && (element instanceof HTMLInputElement || element instanceof getOwnerWindow(element).HTMLInputElement);
}

function isRadioInput(element: Element): element is HTMLInputElement {
  return isHTMLInputElement(element) && element.type === "radio";
}

function getRadioGroup(node: HTMLInputElement): HTMLInputElement[] {
  if (!node.name) {
    return [node];
  }

  if (node.form) {
    const namedItem = node.form.elements.namedItem(node.name);
    const ownerWindow = getOwnerWindow(node);
    if (namedItem instanceof ownerWindow.RadioNodeList) {
      return Array.from(namedItem).filter(
        (element): element is HTMLInputElement => isHTMLInputElement(element)
      );
    }

    if (namedItem instanceof ownerWindow.HTMLInputElement) {
      return [namedItem];
    }
  }

  return Array.from(node.ownerDocument.querySelectorAll("input[type=\"radio\"]")).filter(
    (element): element is HTMLInputElement =>
      isHTMLInputElement(element) && element.name === node.name && !element.form
  );
}

function isTabbableRadio(node: HTMLInputElement): boolean {
  if (!node.name) {
    return true;
  }

  const group = getRadioGroup(node);
  const checked = group.find((radio) => radio.checked);

  return !checked || checked === node;
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

      if (opts?.tabbable && isRadioInput(node as Element) && !isTabbableRadio(node as HTMLInputElement)) {
        return NodeFilter.FILTER_SKIP;
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
  if (isHTMLElement(element)) {
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
const ScopeParentContext: InjectionKey<{ current: Element | null }> = Symbol("FocusScopeParentContext");
const scopeParentMap = new WeakMap<Element, Element | null>();

function isDescendantScope(scope: Element | null, ancestor: Element | null): boolean {
  if (!scope || !ancestor) {
    return false;
  }

  let parent = scopeParentMap.get(scope) ?? null;
  while (parent) {
    if (parent === ancestor) {
      return true;
    }
    parent = scopeParentMap.get(parent) ?? null;
  }

  return false;
}

export const FocusScope = defineComponent({
  name: "FocusScope",
  props: {
    contain: Boolean,
    restoreFocus: Boolean,
    autoFocus: Boolean,
  },
  setup(props, { slots }) {
    const scopeRootRef = shallowRef<Element | null>(null);
    const parentScopeRef = inject(ScopeParentContext, null);
    const previousFocused = shallowRef<Element | null>(null);
    const lastFocusedInScope = shallowRef<Element | null>(null);
    let keydownListener: ((event: KeyboardEvent) => void) | null = null;
    let scopeFocusInListener: ((event: FocusEvent) => void) | null = null;
    let documentFocusInListener: ((event: FocusEvent) => void) | null = null;
    let restoreEventListener: ((event: Event) => void) | null = null;
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
    provide(ScopeParentContext, {
      get current() {
        return scopeRootRef.value;
      },
    });

    onBeforeMount(() => {
      if (typeof document !== "undefined") {
        previousFocused.value = getActiveElement(document);
      }
    });

    onMounted(() => {
      let initialized = false;
      const initializeScope = () => {
        if (initialized || !scopeRootRef.value) {
          return;
        }
        initialized = true;

        const root = scopeRootRef.value;
        scopeParentMap.set(root, parentScopeRef?.current ?? null);
        const ownerDocument = getOwnerDocument(root);
        if (!previousFocused.value) {
          previousFocused.value = getActiveElement(ownerDocument);
        }
        if (!activeScopeRef.value && !parentScopeRef) {
          activeScopeRef.value = root;
        }
        scopeFocusInListener = (event: FocusEvent) => {
          const target = event.target as Element | null;
          if (!scopeRootRef.value || !nodeContains(scopeRootRef.value, target)) {
            return;
          }

          const currentActiveScope = activeScopeRef.value;
          const scopeRoot = scopeRootRef.value;
          const canActivateScope = !currentActiveScope
            || currentActiveScope === scopeRoot
            || isDescendantScope(scopeRoot, currentActiveScope)
            || nodeContains(currentActiveScope, scopeRoot);

          if (!canActivateScope) {
            return;
          }

          activeScopeRef.value = scopeRoot;
          lastFocusedInScope.value = target;
        };

        root.addEventListener("focusin", scopeFocusInListener as EventListener);
        restoreEventListener = (event: Event) => {
          const target = event.target as Element | null;
          if (target && target !== root && nodeContains(root, target)) {
            event.stopPropagation();
          }
        };
        root.addEventListener(RESTORE_FOCUS_EVENT, restoreEventListener);

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
              || !scopeRoot
              || activeScopeRef.value !== scopeRoot
              || !nodeContains(scopeRoot, getActiveElement(getOwnerDocument(scopeRoot)))
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

          root.addEventListener("keydown", keydownListener as EventListener);

          documentFocusInListener = (event: FocusEvent) => {
            const scopeRoot = scopeRootRef.value;
            const target = event.target as Element | null;
            if (
              restoringFocus
              || !scopeRoot
              || activeScopeRef.value !== scopeRoot
              || !target
              || nodeContains(scopeRoot, target)
            ) {
              return;
            }

            const targetScope = target.closest("[data-focus-scope]");
            if (targetScope && targetScope !== scopeRoot && isDescendantScope(targetScope, scopeRoot)) {
              return;
            }

            restoringFocus = true;
            try {
              const fallback = lastFocusedInScope.value && nodeContains(scopeRoot, lastFocusedInScope.value)
                ? lastFocusedInScope.value
                : null;
              if (isHTMLElement(fallback)) {
                fallback.focus();
              } else {
                focusManager.focusFirst({ tabbable: true });
              }
            } finally {
              restoringFocus = false;
            }
          };

          ownerDocument.addEventListener("focusin", documentFocusInListener as EventListener, true);
        }
      };

      initializeScope();
      if (!initialized) {
        queueMicrotask(initializeScope);
      }
    });

    onBeforeUnmount(() => {
      if (scopeFocusInListener && scopeRootRef.value) {
        scopeRootRef.value.removeEventListener("focusin", scopeFocusInListener as EventListener);
      }

      if (restoreEventListener && scopeRootRef.value) {
        scopeRootRef.value.removeEventListener(RESTORE_FOCUS_EVENT, restoreEventListener);
      }

      if (keydownListener && scopeRootRef.value) {
        scopeRootRef.value.removeEventListener("keydown", keydownListener as EventListener);
      }

      if (documentFocusInListener && scopeRootRef.value) {
        getOwnerDocument(scopeRootRef.value).removeEventListener("focusin", documentFocusInListener as EventListener, true);
      }

      if (activeScopeRef.value === scopeRootRef.value) {
        activeScopeRef.value = null;
      }

      if (scopeRootRef.value) {
        scopeParentMap.delete(scopeRootRef.value);
      }

      let canRestoreFocus = true;
      if (scopeRootRef.value) {
        const ownerDocument = getOwnerDocument(scopeRootRef.value);
        const activeElement = getActiveElement(ownerDocument);
        if (
          activeElement
          && activeElement !== ownerDocument.body
          && !nodeContains(scopeRootRef.value, activeElement)
        ) {
          canRestoreFocus = false;
        }
      }

      if (canRestoreFocus && props.restoreFocus && isHTMLElement(previousFocused.value)) {
        let shouldRestore = true;
        if (scopeRootRef.value) {
          const ownerWindow = getOwnerWindow(scopeRootRef.value);
          const restoreEvent = new ownerWindow.CustomEvent(RESTORE_FOCUS_EVENT, {
            bubbles: true,
            cancelable: true,
            detail: { nodeToRestore: previousFocused.value },
          });
          shouldRestore = scopeRootRef.value.dispatchEvent(restoreEvent);
        }

        if (shouldRestore) {
          previousFocused.value.focus();
        }
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
