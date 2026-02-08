import { computed, toValue } from "vue";
import { useId } from "@vue-aria/ssr";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

type LabelElementType = "label" | "span" | "div";

export interface UseLabelOptions {
  id?: MaybeReactive<string | undefined>;
  label?: MaybeReactive<string | undefined>;
  labelElementType?: MaybeReactive<LabelElementType>;
  "aria-label"?: MaybeReactive<string | undefined>;
  "aria-labelledby"?: MaybeReactive<string | undefined>;
}

export interface UseLabelResult {
  labelProps: ReadonlyRef<Record<string, unknown>>;
  fieldProps: ReadonlyRef<Record<string, unknown>>;
}

let hasWarnedMissingLabel = false;

function withLabelledByFieldId(
  fieldId: string,
  ariaLabel: string | undefined,
  ariaLabelledby: string | undefined
): string | undefined {
  if (!ariaLabelledby) {
    return undefined;
  }

  if (!ariaLabel) {
    return ariaLabelledby;
  }

  return `${fieldId} ${ariaLabelledby}`;
}

export function useLabel(options: UseLabelOptions = {}): UseLabelResult {
  const fieldId = useId(options.id, "v-aria-field");
  const labelId = useId(undefined, "v-aria-label");

  const labelProps = computed<Record<string, unknown>>(() => {
    const label = options.label === undefined ? undefined : toValue(options.label);
    const labelElementType =
      options.labelElementType === undefined
        ? "label"
        : toValue(options.labelElementType);

    if (!label) {
      return {};
    }

    const isLabelElement = labelElementType === "label";
    return {
      id: labelId.value,
      for: isLabelElement ? fieldId.value : undefined,
      htmlFor: isLabelElement ? fieldId.value : undefined,
    };
  });

  const fieldProps = computed<Record<string, unknown>>(() => {
    const label = options.label === undefined ? undefined : toValue(options.label);
    const ariaLabel =
      options["aria-label"] === undefined ? undefined : toValue(options["aria-label"]);
    let ariaLabelledby =
      options["aria-labelledby"] === undefined
        ? undefined
        : toValue(options["aria-labelledby"]);

    if (label) {
      ariaLabelledby = ariaLabelledby
        ? `${labelId.value} ${ariaLabelledby}`
        : labelId.value;
    } else if (!ariaLabel && !ariaLabelledby && !hasWarnedMissingLabel) {
      // Align with React Aria guidance: controls need either visible label or aria label.
      console.warn(
        "If you do not provide a visible label, you must specify an aria-label or aria-labelledby attribute for accessibility"
      );
      hasWarnedMissingLabel = true;
    }

    return {
      id: fieldId.value,
      "aria-label": ariaLabel,
      "aria-labelledby": withLabelledByFieldId(
        fieldId.value,
        ariaLabel,
        ariaLabelledby
      ),
    };
  });

  return {
    labelProps,
    fieldProps,
  };
}
