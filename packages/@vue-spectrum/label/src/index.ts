import { useId } from "@vue-aria/utils";
import { filterDOMProps } from "@vue-aria/utils";
import { useField, useLabel } from "@vue-aria/label";
import type { AriaFieldProps, FieldAria, LabelAria, LabelAriaProps } from "@vue-aria/label";
import type { SpectrumFieldProps, SpectrumLabelProps, SpectrumFieldValidation, SpectrumHelpTextProps } from "@vue-types/label";
import { useProviderProps } from "@vue-spectrum/provider";
import { SlotProvider, useSlotProps, useStyleProps } from "@vue-spectrum/utils";
import { defineComponent, h } from "vue";

export { useField, useLabel };

export type { AriaFieldProps, FieldAria } from "@vue-aria/label";
export type { LabelAriaProps, LabelAria } from "@vue-aria/label";

export const Label = defineComponent({
  name: "SpectrumLabel",
  inheritAttrs: false,
  props: {
    htmlFor: {
      type: String,
      required: false,
      default: undefined,
    },
    for: {
      type: String,
      required: false,
      default: undefined,
    },
    elementType: {
      type: String as () => SpectrumLabelProps["elementType"],
      required: false,
      default: "label",
    },
    labelPosition: {
      type: String as () => SpectrumLabelProps["labelPosition"],
      required: false,
      default: undefined,
    },
    labelAlign: {
      type: String as () => SpectrumLabelProps["labelAlign"],
      required: false,
      default: undefined,
    },
    isRequired: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    necessityIndicator: {
      type: String as () => SpectrumLabelProps["necessityIndicator"],
      required: false,
      default: undefined,
    },
    includeNecessityIndicatorInAccessibilityName: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    UNSAFE_className: {
      type: String,
      required: false,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as () => Record<string, unknown> | undefined,
      required: false,
      default: undefined,
    },
  },
  setup(props, { slots, attrs }) {
    const merged = useProviderProps({
      ...props,
      ...attrs,
    } as Record<string, unknown>) as SpectrumLabelProps & Record<string, unknown>;
    const slotProps = useSlotProps(merged, "label");
    const { styleProps } = useStyleProps(slotProps);

    const elementType = slotProps.elementType ?? "label";
    const htmlFor = slotProps.for ?? slotProps.htmlFor;
    const necessityIndicator = slotProps.necessityIndicator ?? (slotProps.isRequired ? "icon" : undefined);
    const domProps = filterDOMProps(slotProps);

    return () => {
      const labelChildren = slots.default ? slots.default() : [];
      return h(
        elementType,
        {
          ...domProps,
          ...styleProps.value,
          class: [
            "spectrum-FieldLabel",
            {
              "spectrum-FieldLabel--positionSide": slotProps.labelPosition === "side",
              "spectrum-FieldLabel--alignEnd": slotProps.labelAlign === "end",
            },
            styleProps.value.class,
          ],
          htmlFor: elementType === "label" ? htmlFor : undefined,
        },
        [
          ...(Array.isArray(labelChildren) ? labelChildren : [labelChildren]),
          ...(slotProps.isRequired && necessityIndicator === "label"
            ? [
                h(
                  "span",
                  {
                    class: "spectrum-FieldLabel-necessity",
                    "aria-hidden": slotProps.includeNecessityIndicatorInAccessibilityName ? undefined : "true",
                  },
                  "(required)"
                ),
              ]
            : []),
          ...(slotProps.isRequired && necessityIndicator === "icon"
            ? [
                h(
                  "span",
                  {
                    class: "spectrum-FieldLabel-requiredIcon",
                    "aria-label": slotProps.includeNecessityIndicatorInAccessibilityName
                      ? "(required)"
                      : undefined,
                  },
                  "*"
                ),
              ]
            : []),
        ]
      );
    };
  },
});

export const HelpText = defineComponent({
  name: "SpectrumHelpText",
  inheritAttrs: false,
  props: {
    description: {
      type: [String, Number, Object] as () => SpectrumHelpTextProps["description"],
      required: false,
      default: undefined,
    },
    errorMessage: {
      type: [String, Number, Object] as () => SpectrumHelpTextProps["errorMessage"],
      required: false,
      default: undefined,
    },
    validationState: {
      type: String as () => SpectrumFieldValidation["validationState"],
      required: false,
      default: undefined,
    },
    isInvalid: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    isDisabled: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    showErrorIcon: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    UNSAFE_className: {
      type: String,
      required: false,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as () => Record<string, unknown> | undefined,
      required: false,
      default: undefined,
    },
    descriptionProps: {
      type: Object as () => Record<string, unknown> | undefined,
      required: false,
      default: undefined,
    },
    errorMessageProps: {
      type: Object as () => Record<string, unknown> | undefined,
      required: false,
      default: undefined,
    },
  },
  setup(props, { attrs }) {
    const merged = useProviderProps({
      ...props,
      ...attrs,
    } as SpectrumHelpTextProps & SpectrumFieldValidation & Record<string, unknown>);
    const mergedSlot = useSlotProps(merged as Record<string, unknown>, "helpText");
    const { styleProps } = useStyleProps(mergedSlot);

    const isErrorMessage =
      Boolean(mergedSlot.errorMessage) && (Boolean(mergedSlot.isInvalid) || mergedSlot.validationState === "invalid");
    const message = isErrorMessage ? mergedSlot.errorMessage : mergedSlot.description;

    if (!message) {
      return () => null;
    }

    return () =>
      h(
        "div",
        {
          ...styleProps.value,
          class: [
            "spectrum-HelpText",
            `spectrum-HelpText--${isErrorMessage ? "negative" : "neutral"}`,
            { "is-disabled": mergedSlot.isDisabled },
            styleProps.value.class,
          ],
        },
        [
          mergedSlot.showErrorIcon && isErrorMessage
            ? h("span", {
                class: "spectrum-HelpText-validationIcon",
                "aria-hidden": "true",
              })
            : null,
          h(
            "div",
            {
              ...(isErrorMessage
                ? mergedSlot.errorMessageProps
                : mergedSlot.descriptionProps),
              class: "spectrum-HelpText-text",
            },
            message
          ),
        ]
      );
  },
});

export const Field = defineComponent({
  name: "SpectrumField",
  inheritAttrs: false,
  props: {
    label: {
      type: [String, Number, Object] as () => SpectrumFieldProps["label"],
      required: false,
      default: undefined,
    },
    labelPosition: {
      type: String as () => SpectrumFieldProps["labelPosition"],
      required: false,
      default: "top",
    },
    labelAlign: {
      type: String as () => SpectrumFieldProps["labelAlign"],
      required: false,
      default: undefined,
    },
    isRequired: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    necessityIndicator: {
      type: String as () => SpectrumLabelProps["necessityIndicator"],
      required: false,
      default: undefined,
    },
    includeNecessityIndicatorInAccessibilityName: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    validationState: {
      type: String as () => SpectrumFieldValidation["validationState"],
      required: false,
      default: undefined,
    },
    isInvalid: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    description: {
      type: [String, Number, Object] as () => SpectrumFieldProps["description"],
      required: false,
      default: undefined,
    },
    errorMessage: {
      type: [String, Number, Object] as () => SpectrumFieldProps["errorMessage"],
      required: false,
      default: undefined,
    },
    contextualHelp: {
      type: [String, Number, Object] as () => SpectrumFieldProps["contextualHelp"],
      required: false,
      default: undefined,
    },
    wrapperClassName: {
      type: String,
      required: false,
      default: undefined,
    },
    wrapperProps: {
      type: Object as () => Record<string, unknown> | undefined,
      required: false,
      default: undefined,
    },
    labelProps: {
      type: Object as () => Record<string, unknown> | undefined,
      required: false,
      default: undefined,
    },
    descriptionProps: {
      type: Object as () => Record<string, unknown> | undefined,
      required: false,
      default: undefined,
    },
    errorMessageProps: {
      type: Object as () => Record<string, unknown> | undefined,
      required: false,
      default: undefined,
    },
    elementType: {
      type: String as () => SpectrumFieldProps["elementType"],
      required: false,
      default: "label",
    },
    UNSAFE_className: {
      type: String,
      required: false,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as () => Record<string, unknown> | undefined,
      required: false,
      default: undefined,
    },
    isDisabled: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    showErrorIcon: {
      type: Boolean,
      required: false,
      default: undefined,
    },
  },
  setup(props, { slots, attrs }) {
    const merged = useProviderProps({
      ...props,
      ...attrs,
    } as SpectrumFieldProps & Record<string, unknown>);
    const mergedSlot = useSlotProps(merged, "field");
    const { styleProps } = useStyleProps(mergedSlot as Record<string, unknown>);

    const contextualHelpId = useId();
    const fallbackLabelPropsId = useId();

    const hasHelpText = Boolean(mergedSlot.description) ||
      (Boolean(mergedSlot.errorMessage) && (Boolean(mergedSlot.isInvalid) || mergedSlot.validationState === "invalid"));

    const fieldLabelProps: Record<string, unknown> = {
      ...(mergedSlot.labelProps ?? {}),
      id: mergedSlot.label
        ? (mergedSlot.labelProps?.id ?? (mergedSlot.contextualHelp ? fallbackLabelPropsId : undefined))
        : mergedSlot.labelProps?.id,
    };

    const renderHelpText = () =>
      h(HelpText, {
        description: mergedSlot.description,
        errorMessage: mergedSlot.errorMessage,
        validationState: mergedSlot.validationState,
        isInvalid: mergedSlot.isInvalid,
        isDisabled: mergedSlot.isDisabled,
        showErrorIcon: mergedSlot.showErrorIcon,
        descriptionProps: mergedSlot.descriptionProps,
        errorMessageProps: mergedSlot.errorMessageProps,
        "data-testid": "spectrum-Field-helpText",
      });

    const renderedChildren = () => {
      const content = slots.default ? slots.default() : [];
      if (mergedSlot.labelPosition === "side") {
        return h(
          "div",
          {
            class: "spectrum-Field-wrapper",
          },
          [content, ...(hasHelpText ? [renderHelpText()] : [])]
        );
      }

      return h("div", null, [content, ...(hasHelpText ? [renderHelpText()] : [])]);
    };

    return () =>
      h(
        "div",
        {
          ...styleProps.value,
          ...(mergedSlot.wrapperProps ?? {}),
          class: [
            "spectrum-Field",
            {
              "spectrum-Field--positionTop": mergedSlot.labelPosition === "top",
              "spectrum-Field--positionSide": mergedSlot.labelPosition === "side",
              "spectrum-Field--alignEnd": mergedSlot.labelAlign === "end",
              "spectrum-Field--hasContextualHelp": Boolean(mergedSlot.contextualHelp && mergedSlot.label),
            },
            styleProps.value.class,
            mergedSlot.wrapperClassName,
          ],
        },
        [
          ...(
            mergedSlot.label
              ? [
                  h(
                    Label,
                    {
                      ...fieldLabelProps,
                      labelPosition: mergedSlot.labelPosition,
                      labelAlign: mergedSlot.labelAlign,
                      isRequired: mergedSlot.isRequired,
                      necessityIndicator: mergedSlot.necessityIndicator,
                      includeNecessityIndicatorInAccessibilityName: mergedSlot.includeNecessityIndicatorInAccessibilityName,
                      elementType: mergedSlot.elementType,
                    },
                    {
                      default: () => [mergedSlot.label],
                    }
                  ),
                  mergedSlot.label && mergedSlot.contextualHelp
                    ? h(
                      SlotProvider,
                      {
                        slots: {
                          actionButton: {
                            UNSAFE_className: "spectrum-Field-contextualHelp",
                            id: contextualHelpId,
                            "aria-labelledby": fieldLabelProps.id
                              ? `${String(fieldLabelProps.id)} ${contextualHelpId}`
                              : undefined,
                          },
                        },
                      },
                      {
                        default: () => [mergedSlot.contextualHelp],
                      }
                    )
                    : null,
                ]
              : []
          ),
          renderedChildren(),
        ]
      );
  },
});
