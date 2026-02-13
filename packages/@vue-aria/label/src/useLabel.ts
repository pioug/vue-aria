import { useId, useLabels } from "@vue-aria/utils";

export interface LabelAriaProps {
  id?: string;
  label?: string;
  "aria-labelledby"?: string;
  "aria-label"?: string;
  labelElementType?: string;
}

export interface LabelAria {
  labelProps: Record<string, unknown>;
  fieldProps: ReturnType<typeof useLabels>;
}

export function useLabel(props: LabelAriaProps): LabelAria {
  let {
    id,
    label,
    "aria-labelledby": ariaLabelledby,
    "aria-label": ariaLabel,
    labelElementType = "label",
  } = props;

  id = useId(id);
  const labelId = useId();

  let labelProps: Record<string, unknown> = {};
  if (label) {
    ariaLabelledby = ariaLabelledby ? `${labelId} ${ariaLabelledby}` : labelId;
    labelProps = {
      id: labelId,
      htmlFor: labelElementType === "label" ? id : undefined,
    };
  } else if (!ariaLabelledby && !ariaLabel && process.env.NODE_ENV !== "production") {
    console.warn(
      "If you do not provide a visible label, you must specify an aria-label or aria-labelledby attribute for accessibility"
    );
  }

  const fieldProps = useLabels({
    id,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
  });

  return {
    labelProps,
    fieldProps,
  };
}
