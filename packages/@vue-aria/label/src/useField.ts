import { computed, toValue } from "vue";
import { useId } from "@vue-aria/ssr";
import { useErrorMessage } from "@vue-aria/utils";
import { useLabel } from "./useLabel";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export interface UseFieldOptions {
  id?: MaybeReactive<string | undefined>;
  label?: MaybeReactive<string | undefined>;
  labelElementType?: MaybeReactive<"label" | "span" | "div">;
  description?: MaybeReactive<string | undefined>;
  errorMessage?: MaybeReactive<string | undefined>;
  isInvalid?: MaybeReactive<boolean | undefined>;
  validationState?: MaybeReactive<"valid" | "invalid" | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  "aria-labelledby"?: MaybeReactive<string | undefined>;
  "aria-describedby"?: MaybeReactive<string | undefined>;
}

export interface UseFieldResult {
  labelProps: ReadonlyRef<Record<string, unknown>>;
  fieldProps: ReadonlyRef<Record<string, unknown>>;
  descriptionProps: ReadonlyRef<Record<string, unknown>>;
  errorMessageProps: ReadonlyRef<Record<string, unknown>>;
}

export function useField(options: UseFieldOptions = {}): UseFieldResult {
  const { labelProps, fieldProps: baseFieldProps } = useLabel(options);

  const descriptionId = useId(undefined, "v-aria-description");
  const { errorMessageProps, errorMessageId, isInvalid } = useErrorMessage({
    errorMessage: options.errorMessage,
    isInvalid: options.isInvalid,
    validationState: options.validationState,
  });

  const descriptionProps = computed<Record<string, unknown>>(() => {
    const description =
      options.description === undefined ? undefined : toValue(options.description);
    return {
      id: description ? descriptionId.value : undefined,
    };
  });

  const fieldProps = computed<Record<string, unknown>>(() => {
    const describedBy =
      options["aria-describedby"] === undefined
        ? undefined
        : toValue(options["aria-describedby"]);
    const description =
      options.description === undefined ? undefined : toValue(options.description);

    const errorId = isInvalid.value ? errorMessageId.value : undefined;
    const descriptionIdValue = description ? descriptionId.value : undefined;

    const ariaDescribedBy = [descriptionIdValue, errorId, describedBy]
      .filter(Boolean)
      .join(" ");

    return {
      ...baseFieldProps.value,
      "aria-describedby": ariaDescribedBy || undefined,
    };
  });

  return {
    labelProps,
    fieldProps,
    descriptionProps,
    errorMessageProps,
  };
}
