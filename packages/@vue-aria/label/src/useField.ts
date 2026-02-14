import { mergeProps, useSlotId } from "@vue-aria/utils";
import { useLabel, type LabelAria, type LabelAriaProps } from "./useLabel";

export interface AriaFieldProps extends LabelAriaProps {
  description?: string;
  errorMessage?: string | string[];
  isInvalid?: boolean;
  validationState?: "valid" | "invalid";
  "aria-describedby"?: string;
}

export interface FieldAria extends LabelAria {
  descriptionProps: Record<string, unknown>;
  errorMessageProps: Record<string, unknown>;
}

export function useField(props: AriaFieldProps): FieldAria {
  const { description, errorMessage, isInvalid, validationState } = props;
  const { labelProps, fieldProps: baseFieldProps } = useLabel(props);

  const descriptionId = useSlotId([
    Boolean(description),
    Boolean(errorMessage),
    isInvalid,
    validationState,
  ]);
  const errorMessageId = useSlotId([
    Boolean(description),
    Boolean(errorMessage),
    isInvalid,
    validationState,
  ]);

  const fieldProps = mergeProps(baseFieldProps, {
    "aria-describedby": [
      descriptionId,
      errorMessageId,
      props["aria-describedby"],
    ]
      .filter(Boolean)
      .join(" ") || undefined,
  });

  return {
    labelProps,
    fieldProps,
    descriptionProps: {
      id: descriptionId,
    },
    errorMessageProps: {
      id: errorMessageId,
    },
  };
}
