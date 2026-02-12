import { defineComponent, h, nextTick, onMounted, ref, type PropType } from "vue";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { filterDOMProps } from "@vue-aria/utils";
import { classNames, type ClassValue } from "@vue-spectrum/utils";
import { Button } from "@vue-spectrum/button";
import { ButtonGroup } from "@vue-spectrum/buttongroup";
import { Content } from "@vue-spectrum/view";
import { Divider } from "@vue-spectrum/divider";
import { Heading } from "@vue-spectrum/text";
import { useDialogContext } from "./context";
import { Dialog } from "./Dialog";

export type AlertDialogVariant =
  | "confirmation"
  | "destructive"
  | "error"
  | "warning";

export interface SpectrumAlertDialogProps {
  variant?: AlertDialogVariant | undefined;
  title: string;
  primaryActionLabel: string;
  secondaryActionLabel?: string | undefined;
  cancelLabel?: string | undefined;
  autoFocusButton?: "primary" | "secondary" | "cancel" | undefined;
  isPrimaryActionDisabled?: boolean | undefined;
  isSecondaryActionDisabled?: boolean | undefined;
  onCancel?: (() => void) | undefined;
  onPrimaryAction?: (() => void) | undefined;
  onSecondaryAction?: (() => void) | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

const ALERT_DIALOG_INTL_MESSAGES = {
  "en-US": {
    alert: "Alert",
  },
  "fr-FR": {
    alert: "Alerte",
  },
} as const;

function resolveConfirmVariant(
  variant: AlertDialogVariant | undefined
): "primary" | "cta" | "negative" {
  if (variant === "confirmation") {
    return "cta";
  }

  if (variant === "destructive") {
    return "negative";
  }

  return "primary";
}

export const AlertDialog = defineComponent({
  name: "AlertDialog",
  inheritAttrs: false,
  props: {
    variant: {
      type: String as PropType<AlertDialogVariant | undefined>,
      default: undefined,
    },
    title: {
      type: String as PropType<string>,
      required: true,
    },
    primaryActionLabel: {
      type: String as PropType<string>,
      required: true,
    },
    secondaryActionLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    cancelLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    autoFocusButton: {
      type: String as PropType<"primary" | "secondary" | "cancel" | undefined>,
      default: undefined,
    },
    isPrimaryActionDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isSecondaryActionDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    onCancel: {
      type: Function as PropType<(() => void) | undefined>,
      default: undefined,
    },
    onPrimaryAction: {
      type: Function as PropType<(() => void) | undefined>,
      default: undefined,
    },
    onSecondaryAction: {
      type: Function as PropType<(() => void) | undefined>,
      default: undefined,
    },
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, string | number> | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots, expose }) {
    const context = useDialogContext();
    const dialogRef = ref<{ UNSAFE_getDOMNode?: () => HTMLElement | null } | null>(null);
    const stringFormatter = useLocalizedStringFormatter(ALERT_DIALOG_INTL_MESSAGES);

    const close = (): void => {
      context?.onClose?.();
    };

    const runAction = (action: (() => void) | undefined): void => {
      close();
      action?.();
    };

    onMounted(() => {
      void nextTick(() => {
        const autoFocusSelector =
          props.autoFocusButton === "primary"
            ? "[data-testid=\"rsp-AlertDialog-confirmButton\"]"
            : props.autoFocusButton === "secondary"
              ? "[data-testid=\"rsp-AlertDialog-secondaryButton\"]"
              : props.autoFocusButton === "cancel"
                ? "[data-testid=\"rsp-AlertDialog-cancelButton\"]"
                : null;
        const dialogElement = dialogRef.value?.UNSAFE_getDOMNode?.() ?? null;
        const autoFocusTarget =
          autoFocusSelector && dialogElement
            ? (dialogElement.querySelector(autoFocusSelector) as HTMLElement | null)
            : null;
        autoFocusTarget?.focus();
      });
    });

    expose({
      UNSAFE_getDOMNode: () => null,
    });

    return () => {
      const domProps = filterDOMProps(attrs as Record<string, unknown>, { labelable: true });
      const confirmVariant = resolveConfirmVariant(props.variant);

      return h(
        Dialog,
        {
          ...domProps,
          ref: (value: unknown) => {
            dialogRef.value = value as { UNSAFE_getDOMNode?: () => HTMLElement | null } | null;
          },
          role: "alertdialog",
          size: "M",
          UNSAFE_className: classNames(
            {
              [`spectrum-Dialog--${props.variant}`]: Boolean(props.variant),
            },
            props.UNSAFE_className as ClassValue | undefined
          ),
          UNSAFE_style: props.UNSAFE_style,
        },
        {
          default: () => [
            h(Heading, null, () => props.title),
            props.variant === "error" || props.variant === "warning"
                ? h(
                  "span",
                  {
                    class: classNames("spectrum-Dialog-typeIcon"),
                    role: "img",
                    "aria-label": stringFormatter.value.format("alert"),
                  },
                  "!"
                )
              : null,
            h(Divider, null),
            h(Content, null, {
              default: () => (slots.default ? slots.default() : []),
            }),
            h(
              ButtonGroup,
              { align: "end" },
              {
                default: () => [
                  props.cancelLabel
                    ? h(
                        Button,
                        {
                          variant: "secondary",
                          autoFocus: props.autoFocusButton === "cancel" ? true : undefined,
                          onPress: () => runAction(props.onCancel),
                          "data-testid": "rsp-AlertDialog-cancelButton",
                        },
                        {
                          default: () => props.cancelLabel,
                        }
                      )
                    : null,
                  props.secondaryActionLabel
                    ? h(
                        Button,
                        {
                          variant: "secondary",
                          isDisabled: props.isSecondaryActionDisabled,
                          autoFocus:
                            props.autoFocusButton === "secondary" ? true : undefined,
                          onPress: () => runAction(props.onSecondaryAction),
                          "data-testid": "rsp-AlertDialog-secondaryButton",
                        },
                        {
                          default: () => props.secondaryActionLabel,
                        }
                      )
                    : null,
                  h(
                    Button,
                    {
                      variant: confirmVariant,
                      isDisabled: props.isPrimaryActionDisabled,
                      autoFocus: props.autoFocusButton === "primary" ? true : undefined,
                      onPress: () => runAction(props.onPrimaryAction),
                      "data-testid": "rsp-AlertDialog-confirmButton",
                    },
                    {
                      default: () => props.primaryActionLabel,
                    }
                  ),
                ],
              }
            ),
          ],
        }
      );
    };
  },
});
