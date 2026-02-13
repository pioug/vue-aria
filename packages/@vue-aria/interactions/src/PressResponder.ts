import { mergeProps } from "@vue-aria/utils";
import {
  defineComponent,
  inject,
  onMounted,
  provide,
  ref,
  type PropType,
  type VNode,
} from "vue";
import { PressResponderContext, type PressResponderContextValue } from "./context";
import type { PressProps } from "./usePress";

const pressResponderProps = {
  onPress: Function as PropType<PressProps["onPress"]>,
  onPressStart: Function as PropType<PressProps["onPressStart"]>,
  onPressEnd: Function as PropType<PressProps["onPressEnd"]>,
  onPressUp: Function as PropType<PressProps["onPressUp"]>,
  onPressChange: Function as PropType<PressProps["onPressChange"]>,
  onClick: Function as PropType<PressProps["onClick"]>,
  isPressed: Boolean,
  isDisabled: Boolean,
  preventFocusOnPress: Boolean,
  shouldCancelOnPointerExit: Boolean,
  allowTextSelectionOnPress: Boolean,
} as const;

export const PressResponder = defineComponent({
  name: "PressResponder",
  props: pressResponderProps,
  setup(props, { slots }) {
    const isRegistered = ref(false);
    const prevContext = inject(PressResponderContext, null);

    const context: PressResponderContextValue = mergeProps(prevContext ?? {}, {
      ...props,
      register() {
        isRegistered.value = true;
        prevContext?.register();
      },
    }) as PressResponderContextValue;

    context.ref = prevContext?.ref ?? ref<Element | null>(null);
    provide(PressResponderContext, context);

    onMounted(() => {
      if (isRegistered.value || process.env.NODE_ENV === "production") {
        return;
      }

      console.warn(
        "A PressResponder was rendered without a pressable child. Either call the usePress hook, or wrap your DOM node with <Pressable> component."
      );
      isRegistered.value = true;
    });

    return () => (slots.default?.() ?? []) as VNode[];
  },
});

export const ClearPressResponder = defineComponent({
  name: "ClearPressResponder",
  setup(_, { slots }) {
    provide(PressResponderContext, { register: () => {} });
    return () => (slots.default?.() ?? []) as VNode[];
  },
});
