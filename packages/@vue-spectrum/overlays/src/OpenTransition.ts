import { defineComponent, nextTick, watch, type PropType } from "vue";

export interface OpenTransitionProps {
  in?: boolean | undefined;
  onEnter?: (() => void) | undefined;
  onEntering?: (() => void) | undefined;
  onEntered?: (() => void) | undefined;
  onExit?: (() => void) | undefined;
  onExiting?: (() => void) | undefined;
  onExited?: (() => void) | undefined;
}

export const OpenTransition = defineComponent({
  name: "OpenTransition",
  props: {
    in: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    onEnter: {
      type: Function as PropType<(() => void) | undefined>,
      default: undefined,
    },
    onEntering: {
      type: Function as PropType<(() => void) | undefined>,
      default: undefined,
    },
    onEntered: {
      type: Function as PropType<(() => void) | undefined>,
      default: undefined,
    },
    onExit: {
      type: Function as PropType<(() => void) | undefined>,
      default: undefined,
    },
    onExiting: {
      type: Function as PropType<(() => void) | undefined>,
      default: undefined,
    },
    onExited: {
      type: Function as PropType<(() => void) | undefined>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    watch(
      () => Boolean(props.in),
      (isOpen, wasOpen) => {
        if (isOpen) {
          if (!wasOpen) {
            props.onEnter?.();
            props.onEntering?.();
          }

          void nextTick(() => {
            props.onEntered?.();
          });
          return;
        }

        if (wasOpen) {
          props.onExit?.();
          props.onExiting?.();
          void nextTick(() => {
            props.onExited?.();
          });
        }
      },
      { immediate: true }
    );

    return () => slots.default?.({ isOpen: Boolean(props.in) });
  },
});
