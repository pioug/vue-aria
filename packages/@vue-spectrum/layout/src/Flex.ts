import { defineComponent, h, type PropType } from "vue";
import { filterDOMProps } from "@vue-aria/utils";
import { classNames, type ClassValue } from "@vue-spectrum/utils";
import { dimensionValue, readStyleObject, type DimensionValue } from "./utils";

export type FlexDirection = "row" | "row-reverse" | "column" | "column-reverse";
export type FlexWrap = boolean | "nowrap" | "wrap" | "wrap-reverse";
export type FlexAlign = "start" | "end" | "center" | "flex-start" | "flex-end" | "space-between" | "space-around" | "space-evenly" | "stretch" | "baseline";

export interface FlexProps {
  direction?: FlexDirection;
  wrap?: FlexWrap;
  justifyContent?: FlexAlign;
  alignItems?: FlexAlign;
  alignContent?: FlexAlign;
  gap?: DimensionValue;
  rowGap?: DimensionValue;
  columnGap?: DimensionValue;
}

function flexAlignValue(value: FlexAlign | undefined): string | undefined {
  if (value === "start") {
    return "flex-start";
  }

  if (value === "end") {
    return "flex-end";
  }

  return value;
}

function flexWrapValue(value: FlexWrap | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value ? "wrap" : "nowrap";
  }

  return value;
}

export const Flex = defineComponent({
  name: "Flex",
  inheritAttrs: false,
  props: {
    direction: {
      type: String as PropType<FlexDirection | undefined>,
      default: undefined,
    },
    wrap: {
      type: [Boolean, String] as PropType<FlexWrap | undefined>,
      default: undefined,
    },
    justifyContent: {
      type: String as PropType<FlexAlign | undefined>,
      default: undefined,
    },
    alignItems: {
      type: String as PropType<FlexAlign | undefined>,
      default: undefined,
    },
    alignContent: {
      type: String as PropType<FlexAlign | undefined>,
      default: undefined,
    },
    gap: {
      type: [String, Number] as PropType<DimensionValue | undefined>,
      default: undefined,
    },
    rowGap: {
      type: [String, Number] as PropType<DimensionValue | undefined>,
      default: undefined,
    },
    columnGap: {
      type: [String, Number] as PropType<DimensionValue | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const domProps = filterDOMProps(attrs as Record<string, unknown>);
      delete domProps.style;
      delete domProps.class;

      const style = {
        ...readStyleObject((attrs as Record<string, unknown>).style),
        display: "flex",
        flexDirection: props.direction,
        flexWrap: flexWrapValue(props.wrap),
        justifyContent: flexAlignValue(props.justifyContent),
        alignItems: flexAlignValue(props.alignItems),
        alignContent: flexAlignValue(props.alignContent),
        gap: props.gap === undefined ? undefined : dimensionValue(props.gap),
        rowGap: props.rowGap === undefined ? undefined : dimensionValue(props.rowGap),
        columnGap:
          props.columnGap === undefined ? undefined : dimensionValue(props.columnGap),
      };

      return h(
        "div",
        {
          ...domProps,
          class: classNames("flex", attrs.class as ClassValue | undefined),
          style,
        },
        slots.default?.()
      );
    };
  },
});
