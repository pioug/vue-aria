import { defineComponent, h, ref, type PropType } from "vue";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { useProviderProps } from "@vue-spectrum/provider";
import { classNames, type ClassValue } from "@vue-spectrum/utils";

export type StatusLightVariant =
  | "positive"
  | "negative"
  | "notice"
  | "info"
  | "neutral"
  | "celery"
  | "chartreuse"
  | "yellow"
  | "magenta"
  | "fuchsia"
  | "purple"
  | "indigo"
  | "seafoam";

export interface SpectrumStatusLightProps {
  variant?: StatusLightVariant | undefined;
  isDisabled?: boolean | undefined;
  role?: "status" | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export const StatusLight = defineComponent({
  name: "StatusLight",
  inheritAttrs: false,
  props: {
    variant: {
      type: String as PropType<StatusLightVariant | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    role: {
      type: String as PropType<"status" | undefined>,
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
      const resolvedProps = useProviderProps({
        variant: props.variant,
        isDisabled: props.isDisabled,
        role: props.role,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      });
      const children = slots.default?.();
      const hasChildren = Boolean(children && children.length > 0);
      const ariaLabel = attrs["aria-label"];
      const ariaLabelledby = attrs["aria-labelledby"];

      if (!isProduction && !hasChildren && !ariaLabel) {
        console.warn("If no children are provided, an aria-label must be specified");
      }

      if (!isProduction && !resolvedProps.role && (ariaLabel || ariaLabelledby)) {
        console.warn("A labelled StatusLight must have a role.");
      }

      const domProps = filterDOMProps(attrs as Record<string, unknown>, {
        labelable: Boolean(resolvedProps.role),
      });

      const className = classNames(
        "spectrum-StatusLight",
        resolvedProps.variant
          ? (`spectrum-StatusLight--${resolvedProps.variant}` as ClassValue)
          : undefined,
        { "is-disabled": Boolean(resolvedProps.isDisabled) },
        resolvedProps.UNSAFE_className as ClassValue | undefined,
        domProps.class as ClassValue | undefined
      );

      const elementProps = mergeProps(domProps, {
        role: resolvedProps.role,
        class: className,
        style: resolvedProps.UNSAFE_style as
          | Record<string, string | number>
          | undefined,
        ref: elementRef,
      });

      return h("div", elementProps, children);
    };
  },
});
