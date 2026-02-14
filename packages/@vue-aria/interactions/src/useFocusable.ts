import {
  getOwnerWindow,
  isFocusable,
  mergeProps,
  useObjectRef,
  useSyncRef,
} from "@vue-aria/utils";
import {
  cloneVNode,
  defineComponent,
  getCurrentInstance,
  h,
  inject,
  onMounted,
  provide,
  ref,
  type InjectionKey,
  type PropType,
  type Ref,
  type VNode,
} from "vue";
import { focusSafely } from "./focusSafely";
import { useFocus, type FocusProps } from "./useFocus";
import { useKeyboard, type KeyboardProps } from "./useKeyboard";

export interface FocusableOptions<Target extends Element = Element>
  extends FocusProps<Target>,
    KeyboardProps {
  isDisabled?: boolean;
  autoFocus?: boolean;
  excludeFromTabOrder?: boolean;
}

export interface FocusableProviderProps {
  children?: unknown;
}

export interface FocusableAria {
  focusableProps: Record<string, unknown>;
}

export interface FocusableContextValue {
  ref?: Ref<Element | null>;
  props?: Record<string, unknown>;
}

export const FocusableContext: InjectionKey<FocusableContextValue> = Symbol("FocusableContext");

function useFocusableContext(refObject: Ref<Element | null>): Record<string, unknown> {
  if (!getCurrentInstance()) {
    return {};
  }

  const context = inject(FocusableContext, null);
  useSyncRef(context ?? undefined, refObject);
  return context?.props ?? {};
}

const focusableProps = {
  isDisabled: Boolean,
  autoFocus: Boolean,
  excludeFromTabOrder: Boolean,
  onFocus: Function as PropType<FocusableOptions["onFocus"]>,
  onBlur: Function as PropType<FocusableOptions["onBlur"]>,
  onFocusChange: Function as PropType<FocusableOptions["onFocusChange"]>,
  onKeyDown: Function as PropType<FocusableOptions["onKeyDown"]>,
  onKeyUp: Function as PropType<FocusableOptions["onKeyUp"]>,
} as const;

function callVNodeRef(vnode: VNode, value: Element | null) {
  const childRef = vnode.ref as any;
  if (!childRef) {
    return;
  }

  if (typeof childRef === "function") {
    childRef(value, undefined);
    return;
  }

  if (typeof childRef === "object" && "value" in childRef) {
    (childRef as { value: Element | null }).value = value;
  }
}

function hasInteractiveRole(el: Element) {
  const role = el.getAttribute("role");
  if (!role) {
    return { valid: false, role: undefined };
  }

  const interactiveRoles = new Set([
    "application",
    "button",
    "checkbox",
    "combobox",
    "gridcell",
    "link",
    "menuitem",
    "menuitemcheckbox",
    "menuitemradio",
    "option",
    "radio",
    "searchbox",
    "separator",
    "slider",
    "spinbutton",
    "switch",
    "tab",
    "tabpanel",
    "textbox",
    "treeitem",
    "img",
    "meter",
    "progressbar",
  ]);

  return { valid: interactiveRoles.has(role), role };
}

export function useFocusable<Target extends Element = Element>(
  props: FocusableOptions<Target>,
  domRef: Ref<Element | null>
): FocusableAria {
  const { focusProps } = useFocus(props as FocusProps<Element>);
  const { keyboardProps } = useKeyboard(props as KeyboardProps);
  const interactions = mergeProps(focusProps, keyboardProps);
  const domProps = useFocusableContext(domRef);
  const interactionProps = props.isDisabled ? {} : domProps;

  if (getCurrentInstance()) {
    onMounted(() => {
      if (props.autoFocus && domRef.value) {
        focusSafely(domRef.value as HTMLElement);
      }
    });
  }

  let tabIndex: number | undefined = props.excludeFromTabOrder ? -1 : 0;
  if (props.isDisabled) {
    tabIndex = undefined;
  }

  return {
    focusableProps: mergeProps(
      {
        ...interactions,
        tabIndex,
      },
      interactionProps
    ),
  };
}

export const FocusableProvider = defineComponent({
  name: "FocusableProvider",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const providerRef = ref<Element | null>(null);
    provide(FocusableContext, {
      ref: providerRef,
      props: attrs,
    });

    return () => slots.default?.() ?? h("span");
  },
});

export const Focusable = defineComponent({
  name: "Focusable",
  props: focusableProps,
  setup(props, { slots }) {
    const innerRef = useObjectRef<Element>();
    const { focusableProps: resolvedFocusableProps } = useFocusable(
      props as unknown as FocusableOptions<Element>,
      innerRef as Ref<Element | null>
    );

    onMounted(() => {
      if (process.env.NODE_ENV === "production") {
        return;
      }

      const el = innerRef.value;
      if (!el || !(el instanceof getOwnerWindow(el).Element)) {
        console.error("<Focusable> child must forward its ref to a DOM element.");
        return;
      }

      if (!props.isDisabled && !isFocusable(el)) {
        console.warn("<Focusable> child must be focusable. Please ensure the tabIndex prop is passed through.");
        return;
      }

      const semanticElements = new Set([
        "button",
        "input",
        "select",
        "textarea",
        "a",
        "area",
        "summary",
        "img",
        "svg",
      ]);

      if (!semanticElements.has(el.localName)) {
        const { valid, role } = hasInteractiveRole(el);
        if (!role) {
          console.warn("<Focusable> child must have an interactive ARIA role.");
        } else if (!valid) {
          console.warn(`<Focusable> child must have an interactive ARIA role. Got "${role}".`);
        }
      }
    });

    return () => {
      const children = slots.default?.();
      const child = children?.[0];
      if (!child) {
        return null;
      }

      return cloneVNode(child, {
        ...mergeProps(resolvedFocusableProps, child.props ?? {}),
        ref: (value: Element | null) => {
          innerRef.value = value;
          callVNodeRef(child, value);
        },
      } as any);
    };
  },
});
