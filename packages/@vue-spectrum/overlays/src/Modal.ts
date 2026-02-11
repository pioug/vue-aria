import { computed, defineComponent, h, ref, type PropType } from "vue";
import { useModalOverlay } from "@vue-aria/overlays";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";
import { Overlay } from "./Overlay";
import type { ReadonlyRef } from "@vue-aria/types";

export type SpectrumModalType = "modal" | "fullscreen" | "fullscreenTakeover";

export interface SpectrumModalProps {
  isOpen?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((isOpen: boolean) => void) | undefined;
  isDismissable?: boolean | undefined;
  isKeyboardDismissDisabled?: boolean | undefined;
  type?: SpectrumModalType | undefined;
  container?: HTMLElement | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

interface OverlayStateLike {
  isOpen: ReadonlyRef<boolean>;
  setOpen: (isOpen: boolean) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const TYPE_VARIANT_MAP: Record<Exclude<SpectrumModalType, "modal">, string> = {
  fullscreen: "fullscreen",
  fullscreenTakeover: "fullscreenTakeover",
};

export const Modal = defineComponent({
  name: "Modal",
  inheritAttrs: false,
  props: {
    isOpen: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    defaultOpen: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    onOpenChange: {
      type: Function as PropType<((isOpen: boolean) => void) | undefined>,
      default: undefined,
    },
    isDismissable: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isKeyboardDismissDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    type: {
      type: String as PropType<SpectrumModalType | undefined>,
      default: undefined,
    },
    container: {
      type: null as unknown as PropType<HTMLElement | undefined>,
      default: undefined,
    },
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, string | number> | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots, expose }) {
    const modalRef = ref<HTMLDivElement | null>(null);
    const wrapperRef = ref<HTMLDivElement | null>(null);
    const uncontrolledOpen = ref(Boolean(props.defaultOpen));
    const isOpen = computed<boolean>(() =>
      props.isOpen !== undefined ? props.isOpen : uncontrolledOpen.value
    );

    const setOpen = (nextOpen: boolean): void => {
      if (props.isOpen === undefined) {
        uncontrolledOpen.value = nextOpen;
      }

      props.onOpenChange?.(nextOpen);
    };

    const state: OverlayStateLike = {
      isOpen,
      setOpen,
      open: () => {
        setOpen(true);
      },
      close: () => {
        setOpen(false);
      },
      toggle: () => {
        setOpen(!isOpen.value);
      },
    };

    const { modalProps, underlayProps } = useModalOverlay(
      {
        isDismissable: computed(() => props.isDismissable),
        isKeyboardDismissDisabled: computed(() => props.isKeyboardDismissDisabled),
      },
      state,
      computed(() => modalRef.value)
    );

    expose({
      UNSAFE_getDOMNode: () => modalRef.value,
      open: state.open,
      close: state.close,
    });

    return () => {
      const attrsRecord = attrs as Record<string, unknown>;
      const styleInput = {
        ...attrsRecord,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      } as Record<string, unknown>;
      const { styleProps } = useStyleProps(styleInput);
      const domProps = filterDOMProps(attrsRecord, { labelable: false });

      const typeVariant =
        props.type && props.type !== "modal" ? TYPE_VARIANT_MAP[props.type] : undefined;

      return h(
        Overlay,
        {
          isOpen: isOpen.value,
          container: props.container,
        },
        {
          default: () =>
            h("div", { ref: wrapperRef }, [
              h(
                "div",
                mergeProps(underlayProps.value, {
                  class: classNames("spectrum-Underlay", "is-open"),
                  "data-testid": "modal-underlay",
                })
              ),
              h(
                "div",
                {
                  class: classNames("spectrum-Modal-wrapper"),
                  style: {
                    "--spectrum-visual-viewport-height":
                      typeof window === "undefined"
                        ? "100vh"
                        : `${window.innerHeight}px`,
                  },
                },
                [
                  h(
                    "div",
                    mergeProps(domProps, modalProps.value, {
                      ref: (value: unknown) => {
                        modalRef.value = value as HTMLDivElement | null;
                      },
                      class: classNames(
                        "spectrum-Modal",
                        {
                          "is-open": isOpen.value,
                        },
                        typeVariant ? `spectrum-Modal--${typeVariant}` : undefined,
                        styleProps.class as ClassValue | undefined,
                        domProps.class as ClassValue | undefined,
                        props.UNSAFE_className as ClassValue | undefined
                      ),
                      style: {
                        ...(styleProps.style ?? {}),
                        ...(props.UNSAFE_style ?? {}),
                      },
                      "data-testid": "modal",
                    }),
                    slots.default?.()
                  ),
                ]
              ),
            ]),
        }
      );
    };
  },
});
