import {
  getOwnerWindow,
  isFocusable,
  mergeProps,
} from "@vue-aria/utils";
import {
  cloneVNode,
  defineComponent,
  onMounted,
  shallowRef,
  type VNode,
} from "vue";
import { usePress, type PressProps } from "./usePress";
import { useFocusable, type FocusableOptions } from "./useFocusable";

const pressableProps = {
  onPress: Function,
  onPressStart: Function,
  onPressEnd: Function,
  onPressUp: Function,
  onPressChange: Function,
  onClick: Function,
  isPressed: Boolean,
  isDisabled: Boolean,
  preventFocusOnPress: Boolean,
  shouldCancelOnPointerExit: Boolean,
  allowTextSelectionOnPress: Boolean,
  autoFocus: Boolean,
  excludeFromTabOrder: Boolean,
  onFocus: Function,
  onBlur: Function,
  onFocusChange: Function,
  onKeyDown: Function,
  onKeyUp: Function,
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

export const Pressable = defineComponent({
  name: "Pressable",
  props: pressableProps,
  setup(props, { slots }) {
    const innerRef = shallowRef<Element | null>(null);
    const { pressProps } = usePress(props as unknown as PressProps);
    const { focusableProps } = useFocusable(
      props as unknown as FocusableOptions<Element>,
      innerRef
    );

    onMounted(() => {
      if (process.env.NODE_ENV === "production") {
        return;
      }

      const el = innerRef.value;
      if (!el || !(el instanceof getOwnerWindow(el).Element)) {
        console.error("<Pressable> child must forward its ref to a DOM element.");
        return;
      }

      if (!props.isDisabled && !isFocusable(el)) {
        console.warn("<Pressable> child must be focusable. Please ensure the tabIndex prop is passed through.");
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
      ]);

      if (!semanticElements.has(el.localName)) {
        const role = el.getAttribute("role");
        if (!role) {
          console.warn("<Pressable> child must have an interactive ARIA role.");
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
        ...mergeProps(pressProps, focusableProps, child.props ?? {}),
        ref: (value: Element | null) => {
          innerRef.value = value;
          callVNodeRef(child, value);
        },
      } as any);
    };
  },
});
