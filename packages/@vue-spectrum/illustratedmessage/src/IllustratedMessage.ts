import { defineComponent, h, ref, type PropType } from "vue";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { Flex } from "@vue-spectrum/layout";
import {
  classNames,
  ClearSlots,
  SlotProvider,
  useSlotProps,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";

export interface SpectrumIllustratedMessageProps {
  slot?: string | undefined;
  isHidden?: boolean | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export const IllustratedMessage = defineComponent({
  name: "IllustratedMessage",
  inheritAttrs: false,
  props: {
    slot: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    isHidden: {
      type: Boolean as PropType<boolean | undefined>,
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
    const elementRef = ref<HTMLElement | null>(null);

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
    });

    return () => {
      const slotProps = useSlotProps(
        {
          ...(attrs as Record<string, unknown>),
          slot: props.slot,
          isHidden: props.isHidden,
          UNSAFE_className: props.UNSAFE_className,
          UNSAFE_style: props.UNSAFE_style,
        } as Record<string, unknown> & { id?: string; slot?: string },
        "illustration"
      );

      const { styleProps } = useStyleProps(
        slotProps as {
          isHidden?: boolean;
          UNSAFE_className?: string;
          UNSAFE_style?: Record<string, string | number>;
        } & Record<string, unknown>
      );
      const domProps = filterDOMProps(slotProps as Record<string, unknown>);

      return h(
        Flex,
        mergeProps(domProps, {
          ref: (value: unknown) => {
            elementRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "spectrum-IllustratedMessage",
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined
          ),
          style: styleProps.style,
          hidden: styleProps.hidden,
        }),
        {
          default: () =>
            h(
              ClearSlots,
              null,
              {
                default: () =>
                  h(
                    SlotProvider,
                    {
                      slots: {
                        heading: {
                          UNSAFE_className: classNames(
                            "spectrum-IllustratedMessage-heading"
                          ),
                        },
                        content: {
                          UNSAFE_className: classNames(
                            "spectrum-IllustratedMessage-description"
                          ),
                        },
                      },
                    },
                    {
                      default: () => slots.default?.(),
                    }
                  ),
              }
            ),
        }
      );
    };
  },
});
