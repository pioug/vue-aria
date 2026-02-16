import { useId } from "@vue-aria/utils";

export interface AriaMenuSectionProps {
  heading?: unknown;
  "aria-label"?: string;
}

export interface MenuSectionAria {
  itemProps: Record<string, unknown>;
  headingProps: Record<string, unknown>;
  groupProps: Record<string, unknown>;
}

export function useMenuSection(props: AriaMenuSectionProps): MenuSectionAria {
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
        }
      : {},
    groupProps: {
      role: "group",
      "aria-label": ariaLabel,
      "aria-labelledby": heading ? headingId : undefined,
    },
  };
}
