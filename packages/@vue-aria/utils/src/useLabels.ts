import { useId } from "./useId";

interface AriaLabelingProps {
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

interface DOMProps {
  id?: string;
}

export function useLabels(
  props: DOMProps & AriaLabelingProps,
  defaultLabel?: string
): DOMProps & AriaLabelingProps {
  let {
    id,
    "aria-label": label,
    "aria-labelledby": labelledBy,
  } = props;

  id = useId(id);

  if (labelledBy && label) {
    const ids = new Set([id, ...labelledBy.trim().split(/\s+/)]);
    labelledBy = [...ids].join(" ");
  } else if (labelledBy) {
    labelledBy = labelledBy.trim().split(/\s+/).join(" ");
  }

  if (!label && !labelledBy && defaultLabel) {
    label = defaultLabel;
  }

  return {
    id,
    "aria-label": label,
    "aria-labelledby": labelledBy,
  };
}
