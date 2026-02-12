import { computed, defineComponent, h, ref, type PropType } from "vue";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { useModalOverlay } from "@vue-aria/overlays";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";
import { Overlay } from "./Overlay";
import type { ReadonlyRef } from "@vue-aria/types";

export interface SpectrumTrayProps {
  isOpen?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((isOpen: boolean) => void) | undefined;
  isKeyboardDismissDisabled?: boolean | undefined;
  shouldCloseOnBlur?: boolean | undefined;
  isFixedHeight?: boolean | undefined;
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

const DISMISS_BUTTON_STYLE: Record<string, string> = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: "0",
};

const OVERLAYS_INTL_MESSAGES = {
  "en-US": {
    dismiss: "Dismiss",
  },
  "fr-FR": {
    dismiss: "Rejeter",
  },
} as const;

export const Tray = defineComponent({
  name: "Tray",
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
    isKeyboardDismissDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    shouldCloseOnBlur: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isFixedHeight: {
      type: Boolean as PropType<boolean | undefined>,
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
    const stringFormatter = useLocalizedStringFormatter(OVERLAYS_INTL_MESSAGES);
    const trayRef = ref<HTMLDivElement | null>(null);
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
        isDismissable: computed(() => true),
        isKeyboardDismissDisabled: computed(() => props.isKeyboardDismissDisabled),
        shouldCloseOnBlur: computed(() => props.shouldCloseOnBlur),
      },
      state,
      computed(() => trayRef.value)
    );

    expose({
      UNSAFE_getDOMNode: () => trayRef.value,
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
      const dismissLabel = stringFormatter.value.format("dismiss");

      return h(
        Overlay,
        {
          isOpen: isOpen.value,
          container: props.container,
        },
        {
          default: () =>
            h("div", [
              h(
                "div",
                mergeProps(underlayProps.value, {
                  class: classNames("spectrum-Underlay", "is-open"),
                  "data-testid": "tray-underlay",
                })
              ),
              h(
                "div",
                {
                  class: classNames("spectrum-Tray-wrapper"),
                  style: {
                    "--spectrum-visual-viewport-height":
                      typeof window === "undefined"
                        ? "100vh"
                        : `${window.innerHeight}px`,
                    top:
                      typeof window === "undefined" ? "0px" : `${window.scrollY}px`,
                  },
                },
                [
                  h(
                    "div",
                    mergeProps(domProps, modalProps.value, {
                      ref: (value: unknown) => {
                        trayRef.value = value as HTMLDivElement | null;
                      },
                      class: classNames(
                        "spectrum-Tray",
                        {
                          "is-open": isOpen.value,
                          "spectrum-Tray--fixedHeight": Boolean(props.isFixedHeight),
                        },
                        styleProps.class as ClassValue | undefined,
                        domProps.class as ClassValue | undefined,
                        props.UNSAFE_className as ClassValue | undefined
                      ),
                      style: {
                        ...(styleProps.style ?? {}),
                        ...(props.UNSAFE_style ?? {}),
                      },
                      "data-testid": "tray",
                    }),
                    [
                      h(
                        "button",
                        {
                          type: "button",
                          "aria-label": dismissLabel,
                          style: DISMISS_BUTTON_STYLE,
                          onClick: () => {
                            state.close();
                          },
                        },
                        dismissLabel
                      ),
                      slots.default?.(),
                      h(
                        "button",
                        {
                          type: "button",
                          "aria-label": dismissLabel,
                          style: DISMISS_BUTTON_STYLE,
                          onClick: () => {
                            state.close();
                          },
                        },
                        dismissLabel
                      ),
                    ]
                  ),
                ]
              ),
            ]),
        }
      );
    };
  },
});
