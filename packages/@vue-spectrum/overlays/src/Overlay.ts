import {
  Teleport,
  defineComponent,
  h,
  ref,
  type PropType,
} from "vue";
import { OpenTransition } from "./OpenTransition";

export interface SpectrumOverlayProps {
  isOpen?: boolean | undefined;
  disableFocusManagement?: boolean | undefined;
  shouldContainFocus?: boolean | undefined;
  container?: HTMLElement | undefined;
  onEnter?: (() => void) | undefined;
  onEntering?: (() => void) | undefined;
  onEntered?: (() => void) | undefined;
  onExit?: (() => void) | undefined;
  onExiting?: (() => void) | undefined;
  onExited?: (() => void) | undefined;
}

export const Overlay = defineComponent({
  name: "Overlay",
  props: {
    isOpen: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    disableFocusManagement: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    shouldContainFocus: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    container: {
      type: null as unknown as PropType<HTMLElement | undefined>,
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
  setup(props, { slots, expose }) {
    const overlayRef = ref<HTMLElement | null>(null);
    const exited = ref(!props.isOpen);

    const handleEntered = () => {
      exited.value = false;
      props.onEntered?.();
    };

    const handleExited = () => {
      exited.value = true;
      props.onExited?.();
    };

    expose({
      UNSAFE_getDOMNode: () => overlayRef.value,
    });

    return () => {
      const mountOverlay = Boolean(props.isOpen || !exited.value);
      if (!mountOverlay) {
        return null;
      }

      const transition = h(
        OpenTransition,
        {
          in: Boolean(props.isOpen),
          onEnter: props.onEnter,
          onEntering: props.onEntering,
          onEntered: handleEntered,
          onExit: props.onExit,
          onExiting: props.onExiting,
          onExited: handleExited,
        },
        {
          default: (transitionProps: { isOpen: boolean }) =>
            slots.default?.(transitionProps),
        }
      );

      const overlayNode = h(
        "div",
        {
          ref: (value: unknown) => {
            overlayRef.value = value as HTMLElement | null;
          },
          style: {
            background: "transparent",
            isolation: "isolate",
          },
          class: "spectrum-Overlay",
        },
        [transition]
      );

      if (typeof document === "undefined" && !props.container) {
        return overlayNode;
      }

      return h(
        Teleport,
        { to: props.container ?? "body" },
        overlayNode
      );
    };
  },
});
