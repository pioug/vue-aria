import clsx from "clsx";
import {
  cloneVNode,
  computed,
  defineComponent,
  h,
  isVNode,
  type PropType,
  type VNode,
} from "vue";
import {
  ButtonGroup as SpectrumButtonGroup,
  type SpectrumButtonGroupProps,
} from "@vue-spectrum/buttongroup";
import { useProviderProps } from "@vue-spectrum/provider";

export type ActionButtonGroupSize = "XS" | "S" | "M" | "L" | "XL";
export type ActionButtonGroupDensity = "compact" | "regular";

export interface S2ActionButtonGroupProps
  extends Omit<SpectrumButtonGroupProps, "align"> {
  size?: ActionButtonGroupSize | undefined;
  density?: ActionButtonGroupDensity | undefined;
  isQuiet?: boolean | undefined;
  isJustified?: boolean | undefined;
  staticColor?: "white" | "black" | "auto" | undefined;
}

function withGroupChildProps(children: VNode[], props: S2ActionButtonGroupProps): VNode[] {
  const inheritedStaticColor =
    props.staticColor === "auto" ? undefined : props.staticColor;

  return children.map((child) => {
    if (!isVNode(child)) {
      return child;
    }

    const childProps = (child.props ?? {}) as Record<string, unknown>;
    const nextProps: Record<string, unknown> = {};

    if (props.size !== undefined && childProps.size === undefined) {
      nextProps.size = props.size;
    }

    if (props.isQuiet !== undefined && childProps.isQuiet === undefined) {
      nextProps.isQuiet = props.isQuiet;
    }

    if (
      inheritedStaticColor !== undefined &&
      childProps.staticColor === undefined
    ) {
      nextProps.staticColor = inheritedStaticColor;
    }

    if (props.isDisabled !== undefined && childProps.isDisabled === undefined) {
      nextProps.isDisabled = props.isDisabled;
    }

    if (Object.keys(nextProps).length === 0) {
      return child;
    }

    return cloneVNode(child, nextProps);
  });
}

export const ActionButtonGroup = defineComponent({
  name: "S2ActionButtonGroup",
  inheritAttrs: false,
  props: {
    size: {
      type: String as PropType<ActionButtonGroupSize | undefined>,
      default: undefined,
    },
    density: {
      type: String as PropType<ActionButtonGroupDensity | undefined>,
      default: undefined,
    },
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isJustified: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    staticColor: {
      type: String as PropType<"white" | "black" | "auto" | undefined>,
      default: undefined,
    },
    orientation: {
      type: String as PropType<"horizontal" | "vertical" | undefined>,
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
  setup(props, { attrs, slots }) {
    const forwardedProps = computed(() => {
      const merged = useProviderProps({
        ...(attrs as Record<string, unknown>),
        orientation: props.orientation,
        isDisabled: props.isDisabled,
        slot: props.slot,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      });

      return {
        ...merged,
        UNSAFE_className: clsx("s2-ActionButtonGroup", merged.UNSAFE_className),
        "data-s2-size": props.size,
        "data-s2-density": props.density,
        "data-s2-justified": props.isJustified ? "true" : undefined,
      };
    });

    return () =>
      h(SpectrumButtonGroup, forwardedProps.value as Record<string, unknown>, {
        default: () =>
          withGroupChildProps(
            slots.default?.() ?? [],
            props as S2ActionButtonGroupProps
          ),
      });
  },
});
