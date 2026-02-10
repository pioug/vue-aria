import { defineComponent, h, ref, type PropType } from "vue";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { useProviderProps } from "@vue-spectrum/provider";
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";

export interface SpectrumActionBarContainerProps {
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export const ActionBarContainer = defineComponent({
  name: "ActionBarContainer",
  inheritAttrs: false,
  props: {
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
    const domRef = ref<HTMLElement | null>(null);

    expose({
      UNSAFE_getDOMNode: () => domRef.value,
    });

    return () => {
      const attrsRecord = attrs as Record<string, unknown>;
      const resolvedProps = useProviderProps({
        ...attrsRecord,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      });

      const { styleProps } = useStyleProps(resolvedProps);
      const domProps = filterDOMProps(resolvedProps as Record<string, unknown>);

      return h(
        "div",
        mergeProps(domProps, styleProps, {
          ref: (value: unknown) => {
            domRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "ActionBarContainer",
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
        slots.default?.() ?? []
      );
    };
  },
});
