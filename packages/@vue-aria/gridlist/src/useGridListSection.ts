import { useLabels, useSlotId } from "@vue-aria/utils";
import type { ListState } from "@vue-aria/list-state";

export interface AriaGridListSectionProps {
  "aria-label"?: string;
}

export interface GridListSectionAria {
  rowProps: Record<string, unknown>;
  rowHeaderProps: Record<string, unknown>;
  rowGroupProps: Record<string, unknown>;
}

/**
 * Provides section row/header/rowgroup semantics for grid list sections.
 */
export function useGridListSection<T>(
  props: AriaGridListSectionProps,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  state: ListState<T>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ref: { current: HTMLElement | null }
): GridListSectionAria {
  const { "aria-label": ariaLabel } = props;
  const headingId = useSlotId();
  const labelProps = useLabels({
    "aria-label": ariaLabel,
    "aria-labelledby": headingId,
  });

  return {
    rowProps: {
      role: "row",
    },
    rowHeaderProps: {
      id: headingId,
      role: "rowheader",
    },
    rowGroupProps: {
      role: "rowgroup",
      ...labelProps,
    },
  };
}
