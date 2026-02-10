import {
  cloneVNode,
  defineComponent,
  h,
  isVNode,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from "vue";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import {
  classNames,
  SlotProvider,
  useResizeObserver,
  useSlotProps,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import {
  useProviderContext,
  useProviderProps,
} from "@vue-spectrum/provider";

export type ButtonGroupOrientation = "horizontal" | "vertical";
export type ButtonGroupAlign = "start" | "center" | "end";

export interface SpectrumButtonGroupProps {
  orientation?: ButtonGroupOrientation | undefined;
  align?: ButtonGroupAlign | undefined;
  isDisabled?: boolean | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export const ButtonGroup = defineComponent({
  name: "ButtonGroup",
  inheritAttrs: false,
  props: {
    orientation: {
      type: String as PropType<ButtonGroupOrientation | undefined>,
      default: undefined,
    },
    align: {
      type: String as PropType<ButtonGroupAlign | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    slot: {
      type: String as PropType<string | undefined>,
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
    const provider = useProviderContext();
    const elementRef = ref<HTMLElement | null>(null);
    const parentRef = ref<HTMLElement | null>(null);
    const hasOverflow = ref(false);
    const isHorizontal = () => (props.orientation ?? "horizontal") === "horizontal";

    const computeHasOverflow = (): boolean => {
      const element = elementRef.value;
      if (!element || !isHorizontal()) {
        return false;
      }

      const maxClientWidth = element.clientWidth + 1;
      if (element.scrollWidth > maxClientWidth) {
        return true;
      }

      const buttonGroupChildren = Array.from(element.children) as HTMLElement[];
      const maxX = element.offsetWidth + 1;

      return buttonGroupChildren.some(
        (child) => child.offsetLeft < 0 || child.offsetLeft + child.offsetWidth > maxX
      );
    };

    const checkForOverflow = () => {
      if (!isHorizontal()) {
        hasOverflow.value = false;
        return;
      }

      // Force horizontal for measurement first, then compute overflow.
      hasOverflow.value = false;
      void nextTick(() => {
        hasOverflow.value = computeHasOverflow();
      });
    };

    watch(
      [() => props.orientation, () => provider?.value.scale],
      () => {
        checkForOverflow();
      },
      { immediate: true }
    );

    onMounted(() => {
      parentRef.value = elementRef.value?.parentElement ?? null;
      if (typeof window !== "undefined") {
        window.addEventListener("resize", checkForOverflow);
      }
      checkForOverflow();
    });

    onBeforeUnmount(() => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", checkForOverflow);
      }
    });

    useResizeObserver({
      ref: parentRef,
      onResize: checkForOverflow,
    });

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
      UNSAFE_remeasure: () => {
        checkForOverflow();
      },
    });

    return () => {
      const slotProps = useSlotProps(
        {
          ...(attrs as Record<string, unknown>),
          orientation: props.orientation,
          align: props.align,
          isDisabled: props.isDisabled,
          slot: props.slot,
          UNSAFE_className: props.UNSAFE_className,
          UNSAFE_style: props.UNSAFE_style,
        } as Record<string, unknown> & { id?: string; slot?: string },
        "buttonGroup"
      );

      const resolvedProps = useProviderProps(slotProps);
      const orientation =
        (resolvedProps.orientation as ButtonGroupOrientation | undefined) ??
        "horizontal";
      const align = (resolvedProps.align as ButtonGroupAlign | undefined) ?? "start";
      const { styleProps } = useStyleProps(resolvedProps);
      const domProps = filterDOMProps(resolvedProps as Record<string, unknown>);
      const children = (slots.default?.() ?? []).map((child) => {
        if (!resolvedProps.isDisabled || !isVNode(child)) {
          return child;
        }

        const childProps = (child.props ?? {}) as Record<string, unknown>;
        if (childProps.isDisabled !== undefined) {
          return child;
        }

        return cloneVNode(child, {
          isDisabled: true,
        });
      });

      return h(
        "div",
        mergeProps(domProps, styleProps, {
          ref: (value: unknown) => {
            elementRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "spectrum-ButtonGroup",
            {
              "spectrum-ButtonGroup--vertical":
                orientation === "vertical" || hasOverflow.value,
              "spectrum-ButtonGroup--alignEnd": align === "end",
              "spectrum-ButtonGroup--alignCenter": align === "center",
            },
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined,
            resolvedProps.UNSAFE_className as ClassValue | undefined
          ),
          style: {
            ...(styleProps.style ?? {}),
            ...((resolvedProps.UNSAFE_style as
              | Record<string, string | number>
              | undefined) ?? {}),
          },
        }),
        [
          h(
            SlotProvider,
            {
              slots: {
                button: {
                  isDisabled: resolvedProps.isDisabled as boolean | undefined,
                  UNSAFE_className: classNames("spectrum-ButtonGroup-Button"),
                },
              },
            },
            {
              default: () => children,
            }
          ),
        ]
      );
    };
  },
});
