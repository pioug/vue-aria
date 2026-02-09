import { defineComponent, h, type PropType } from "vue";
import { filterDOMProps } from "@vue-aria/utils";
import { dimensionValue, readStyleObject, type DimensionValue } from "./utils";

export type GridTemplateValue = DimensionValue | DimensionValue[];

export interface GridProps {
  autoFlow?: string;
  autoColumns?: DimensionValue;
  autoRows?: DimensionValue;
  areas?: string[];
  columns?: GridTemplateValue;
  rows?: GridTemplateValue;
  gap?: DimensionValue;
  rowGap?: DimensionValue;
  columnGap?: DimensionValue;
  justifyItems?: string;
  justifyContent?: string;
  alignItems?: string;
  alignContent?: string;
}

function gridTemplateAreasValue(value: string[]): string {
  return value.map((row) => `"${row}"`).join("\n");
}

function gridDimensionValue(value: DimensionValue): string {
  if (
    typeof value === "string" &&
    /^(max-content|min-content|minmax|auto|fit-content|repeat|subgrid)/.test(value)
  ) {
    return value;
  }

  return dimensionValue(value);
}

function gridTemplateValue(value: GridTemplateValue): string {
  if (Array.isArray(value)) {
    return value.map((item) => gridDimensionValue(item)).join(" ");
  }

  return gridDimensionValue(value);
}

/**
 * Can be used to make a repeating fragment of the columns or rows list.
 */
export function repeat(
  count: number | "auto-fill" | "auto-fit",
  repeatValue: GridTemplateValue
): string {
  return `repeat(${count}, ${gridTemplateValue(repeatValue)})`;
}

/**
 * Defines a size range greater than or equal to min and less than or equal to max.
 */
export function minmax(min: DimensionValue, max: DimensionValue): string {
  return `minmax(${gridDimensionValue(min)}, ${gridDimensionValue(max)})`;
}

/**
 * Clamps a given size to an available size.
 */
export function fitContent(dimension: DimensionValue): string {
  return `fit-content(${gridDimensionValue(dimension)})`;
}

export const Grid = defineComponent({
  name: "Grid",
  inheritAttrs: false,
  props: {
    autoFlow: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    autoColumns: {
      type: [String, Number] as PropType<DimensionValue | undefined>,
      default: undefined,
    },
    autoRows: {
      type: [String, Number] as PropType<DimensionValue | undefined>,
      default: undefined,
    },
    areas: {
      type: Array as PropType<string[] | undefined>,
      default: undefined,
    },
    columns: {
      type: [String, Number, Array] as PropType<GridTemplateValue | undefined>,
      default: undefined,
    },
    rows: {
      type: [String, Number, Array] as PropType<GridTemplateValue | undefined>,
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
    justifyItems: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    justifyContent: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    alignItems: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    alignContent: {
      type: String as PropType<string | undefined>,
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
        display: "grid",
        gridAutoFlow: props.autoFlow,
        gridAutoColumns:
          props.autoColumns === undefined
            ? undefined
            : gridDimensionValue(props.autoColumns),
        gridAutoRows:
          props.autoRows === undefined
            ? undefined
            : gridDimensionValue(props.autoRows),
        gridTemplateAreas:
          props.areas === undefined ? undefined : gridTemplateAreasValue(props.areas),
        gridTemplateColumns:
          props.columns === undefined ? undefined : gridTemplateValue(props.columns),
        gridTemplateRows:
          props.rows === undefined ? undefined : gridTemplateValue(props.rows),
        gap: props.gap === undefined ? undefined : dimensionValue(props.gap),
        rowGap: props.rowGap === undefined ? undefined : dimensionValue(props.rowGap),
        columnGap:
          props.columnGap === undefined ? undefined : dimensionValue(props.columnGap),
        justifyItems: props.justifyItems,
        justifyContent: props.justifyContent,
        alignItems: props.alignItems,
        alignContent: props.alignContent,
      };

      return h(
        "div",
        {
          ...domProps,
          class: attrs.class,
          style,
        },
        slots.default?.()
      );
    };
  },
});
