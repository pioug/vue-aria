import { defineComponent, h, ref, type PropType } from "vue";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { classNames, type ClassValue } from "@vue-spectrum/utils";

export interface SpectrumWellProps {
  role?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export const Well = defineComponent({
  name: "Well",
  inheritAttrs: false,
  props: {
    role: {
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
    const elementRef = ref<HTMLElement | null>(null);
    const isProduction =
      typeof process !== "undefined" && process.env.NODE_ENV === "production";

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
    });

    return () => {
      const ariaLabel = attrs["aria-label"];
      const ariaLabelledby = attrs["aria-labelledby"];
      if (!isProduction && !props.role && (ariaLabel || ariaLabelledby)) {
        console.warn("A labelled Well must have a role.");
      }

      const domProps = filterDOMProps(attrs as Record<string, unknown>, {
        labelable: Boolean(props.role),
      });

      const className = classNames(
        "spectrum-Well",
        props.UNSAFE_className as ClassValue | undefined,
        domProps.class as ClassValue | undefined
      );

      const elementProps = mergeProps(domProps, {
        role: props.role,
        class: className,
        style: props.UNSAFE_style as Record<string, string | number> | undefined,
        ref: elementRef,
      });

      return h("div", elementProps, slots.default?.());
    };
  },
});
