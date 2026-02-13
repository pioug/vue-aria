import {
  createShadowTreeWalker,
  getActiveElement,
  getOwnerDocument,
  isFocusable,
  isTabbable,
  nodeContains,
} from "@vue-aria/utils";
import { defineComponent, h, inject, onBeforeUnmount, onMounted, provide, shallowRef, type InjectionKey } from "vue";

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

    const focusManager = createFocusManager({
      get current() {
        return scopeRootRef.value;
      },
      set current(value: Element | null) {
        scopeRootRef.value = value;
      },
    });

    provide(FocusManagerContext, focusManager);

    onMounted(() => {
      previousFocused.value = getActiveElement(getOwnerDocument(scopeRootRef.value));
      activeScopeRef.value = scopeRootRef.value;

      if (props.autoFocus) {
        focusManager.focusFirst();
      }
    });

    onBeforeUnmount(() => {
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
