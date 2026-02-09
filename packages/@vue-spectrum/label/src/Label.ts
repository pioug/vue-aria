import {
  computed,
  defineComponent,
  h,
  type PropType,
  type VNodeChild,
} from "vue";
import { classNames, type ClassValue } from "@vue-spectrum/utils";

export type LabelPosition = "top" | "side";
export type LabelAlign = "start" | "end";
export type NecessityIndicator = "icon" | "label";
export type LabelElementType = "label" | "span" | "div";

export interface SpectrumLabelProps {
  labelPosition?: LabelPosition;
  labelAlign?: LabelAlign | null;
  isRequired?: boolean | undefined;
  necessityIndicator?: NecessityIndicator | null | undefined;
  includeNecessityIndicatorInAccessibilityName?: boolean | undefined;
  htmlFor?: string | undefined;
  for?: string | undefined;
  elementType?: LabelElementType | undefined;
}

export const Label = defineComponent({
  name: "Label",
  inheritAttrs: false,
  props: {
    labelPosition: {
      type: String as PropType<LabelPosition>,
      default: "top",
    },
    labelAlign: {
      type: String as PropType<LabelAlign | null | undefined>,
      default: undefined,
    },
    isRequired: {
      type: null as unknown as PropType<boolean | undefined>,
      default: undefined,
    },
    necessityIndicator: {
      type: String as PropType<NecessityIndicator | null | undefined>,
      default: undefined,
    },
    includeNecessityIndicatorInAccessibilityName: {
      type: Boolean,
      default: false,
    },
    htmlFor: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    for: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    elementType: {
      type: String as PropType<LabelElementType>,
      default: "label",
    },
  },
  setup(props, { attrs, slots }) {
    const resolvedLabelAlign = computed<LabelAlign | null>(() => {
      if (props.labelAlign !== undefined) {
        return props.labelAlign ?? null;
      }

      return props.labelPosition === "side" ? "start" : null;
    });

    const resolvedNecessityIndicator = computed<NecessityIndicator | null>(() => {
      if (props.necessityIndicator !== undefined) {
        return props.necessityIndicator ?? null;
      }

      return props.isRequired !== undefined ? "icon" : null;
    });

    const necessityLabel = computed(() =>
      props.isRequired ? "(required)" : "(optional)"
    );

    return () => {
      const elementType = props.elementType;
      const domProps: Record<string, unknown> = {
        ...(attrs as Record<string, unknown>),
      };

      const htmlFor =
        elementType === "label"
          ? props["for"] ?? props.htmlFor ?? (domProps.for as string | undefined)
          : undefined;

      delete domProps.class;
      delete domProps.for;
      delete domProps.htmlFor;

      const labelClass = classNames(
        "spectrum-FieldLabel",
        {
          "spectrum-FieldLabel--positionSide": props.labelPosition === "side",
          "spectrum-FieldLabel--alignEnd": resolvedLabelAlign.value === "end",
        },
        attrs.class as ClassValue | undefined
      );

      const children: VNodeChild[] = [...(slots.default?.() ?? [])];

      if (
        resolvedNecessityIndicator.value === "label" ||
        (resolvedNecessityIndicator.value === "icon" && props.isRequired)
      ) {
        children.push(" \u200b");
      }

      if (resolvedNecessityIndicator.value === "label") {
        children.push(
          h(
            "span",
            {
              "aria-hidden": !props.includeNecessityIndicatorInAccessibilityName
                ? props.isRequired || undefined
                : undefined,
            },
            necessityLabel.value
          )
        );
      }

      if (resolvedNecessityIndicator.value === "icon" && props.isRequired) {
        children.push(
          h(
            "span",
            {
              class: "spectrum-FieldLabel-requiredIcon",
              "aria-label": props.includeNecessityIndicatorInAccessibilityName
                ? "(required)"
                : undefined,
              "aria-hidden": props.includeNecessityIndicatorInAccessibilityName
                ? undefined
                : "true",
            },
            "*"
          )
        );
      }

      return h(
        elementType,
        {
          ...domProps,
          class: labelClass,
          for: htmlFor,
          htmlFor,
        },
        children
      );
    };
  },
});
