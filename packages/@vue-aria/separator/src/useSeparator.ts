import { filterDOMProps } from "@vue-aria/utils";

export interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  elementType?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  [key: string]: unknown;
}

export interface SeparatorAria {
  separatorProps: Record<string, unknown>;
}

export function useSeparator(props: SeparatorProps): SeparatorAria {
  const domProps = filterDOMProps(props, { labelable: true });
  const ariaOrientation = props.orientation === "vertical" ? "vertical" : undefined;

  if (props.elementType !== "hr") {
    return {
      separatorProps: {
        ...domProps,
        role: "separator",
        "aria-orientation": ariaOrientation,
      },
    };
  }

  return { separatorProps: domProps };
}
