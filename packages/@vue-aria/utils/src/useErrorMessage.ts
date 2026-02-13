import { computed, toValue } from "vue";
import { useId } from "@vue-aria/ssr";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export interface UseErrorMessageOptions {
  errorMessage?: MaybeReactive<string | undefined>;
  isInvalid?: MaybeReactive<boolean | undefined>;
  validationState?: MaybeReactive<"valid" | "invalid" | undefined>;
}

export interface UseErrorMessageResult {
  errorMessageProps: ReadonlyRef<Record<string, unknown>>;
  errorMessageId: ReadonlyRef<string | undefined>;
  isInvalid: ReadonlyRef<boolean>;
}

export function useErrorMessage(
  options: UseErrorMessageOptions = {}
): UseErrorMessageResult {
  const generatedId = useId(undefined, "v-aria-error");

  const hasErrorMessage = computed(() => {
    if (options.errorMessage === undefined) {
      return false;
    }
    return Boolean(toValue(options.errorMessage));
  });

  const isInvalid = computed(() => {
    const invalid =
      options.isInvalid === undefined ? false : Boolean(toValue(options.isInvalid));
    const validationState =
      options.validationState === undefined
        ? undefined
        : toValue(options.validationState);
    return invalid || validationState === "invalid";
  });

  const errorMessageId = computed<string | undefined>(() =>
    hasErrorMessage.value ? generatedId.value : undefined
  );

  const errorMessageProps = computed<Record<string, unknown>>(() => ({
    id: errorMessageId.value,
  }));

  return {
    errorMessageProps,
    errorMessageId,
    isInvalid,
  };
}
