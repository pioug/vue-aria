import { useId } from "@vue-aria/utils";

export interface AriaListBoxSectionProps {
  heading?: unknown;
  "aria-label"?: string;
}

export interface ListBoxSectionAria {
  itemProps: Record<string, unknown>;
  headingProps: Record<string, unknown>;
  groupProps: Record<string, unknown>;
}

export function useListBoxSection(props: AriaListBoxSectionProps): ListBoxSectionAria {
  const { heading, "aria-label": ariaLabel } = props;
  const headingId = useId();

  return {
    itemProps: {
      role: "presentation",
    },
    headingProps: heading
      ? {
          id: headingId,
          role: "presentation",
          onMousedown: (e: MouseEvent) => {
            e.preventDefault();
          },
        }
      : {},
    groupProps: {
      role: "group",
      "aria-label": ariaLabel,
      "aria-labelledby": heading ? headingId : undefined,
    },
  };
}
