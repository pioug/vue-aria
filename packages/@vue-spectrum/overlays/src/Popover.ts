import { computed, defineComponent, h, ref, type PropType } from "vue";
import { usePopover, type Placement } from "@vue-aria/overlays";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";
import { Overlay } from "./Overlay";
import type { ReadonlyRef } from "@vue-aria/types";

export interface SpectrumPopoverProps {
  isOpen?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((isOpen: boolean) => void) | undefined;
  triggerRef?: HTMLElement | undefined;
  placement?: Placement | undefined;
  offset?: number | undefined;
  isNonModal?: boolean | undefined;
  hideArrow?: boolean | undefined;
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

export const Popover = defineComponent({
  name: "Popover",
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
    triggerRef: {
      type: null as unknown as PropType<HTMLElement | undefined>,
      default: undefined,
    },
    placement: {
      type: String as PropType<Placement | undefined>,
      default: undefined,
    },
    offset: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    isNonModal: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    hideArrow: {
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
    const popoverRef = ref<HTMLDivElement | null>(null);
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

    const { popoverProps, underlayProps, placement } = usePopover(
      {
        triggerRef: computed(() => props.triggerRef ?? null),
        popoverRef: computed(() => popoverRef.value),
        placement: computed(() => props.placement ?? "bottom"),
        offset: computed(() => props.offset ?? 8),
        isNonModal: computed(() => props.isNonModal),
      },
      state
    );

    expose({
      UNSAFE_getDOMNode: () => popoverRef.value,
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

      return h(
        Overlay,
        {
          isOpen: isOpen.value,
          container: props.container,
        },
        {
          default: () =>
            h("div", { class: classNames("spectrum-Popover-wrapper") }, [
              !props.isNonModal
                ? h(
                    "div",
                    mergeProps(underlayProps.value, {
                      class: classNames("spectrum-Underlay", "is-open"),
                      "data-testid": "popover-underlay",
                    })
                  )
                : null,
              h(
                "div",
                mergeProps(domProps, popoverProps.value, {
                  ref: (value: unknown) => {
                    popoverRef.value = value as HTMLDivElement | null;
                  },
                  class: classNames(
                    "spectrum-Popover",
                    `spectrum-Popover--${placement.value ?? props.placement ?? "bottom"}`,
                    {
                      "spectrum-Popover--withTip": !props.hideArrow,
                      "is-open": isOpen.value,
                    },
                    styleProps.class as ClassValue | undefined,
                    domProps.class as ClassValue | undefined,
                    props.UNSAFE_className as ClassValue | undefined
                  ),
                  style: {
                    ...(styleProps.style ?? {}),
                    ...(props.UNSAFE_style ?? {}),
                    ...(popoverProps.value.style as Record<string, unknown> | undefined),
                  },
                  role: "presentation",
                  "data-testid": "popover",
                }),
                [
                  slots.default?.(),
                  !props.hideArrow
                    ? h("span", {
                        class: classNames("spectrum-Popover-tip"),
                        "aria-hidden": "true",
                        "data-testid": "popover-arrow",
                      })
                    : null,
                ]
              ),
            ]),
        }
      );
    };
  },
});
