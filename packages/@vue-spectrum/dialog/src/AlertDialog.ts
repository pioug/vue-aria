import { Button } from "@vue-spectrum/button";
import { computed, defineComponent, h, type PropType } from "vue";
import { Dialog } from "./Dialog";
import { useDialogContainer } from "./useDialogContainer";

/**
 * AlertDialog is a confirmation/destructive dialog preset.
 */
export const AlertDialog = defineComponent({
  name: "SpectrumAlertDialog",
  inheritAttrs: false,
  props: {
    variant: {
      type: String as () => "confirmation" | "destructive" | "error" | "warning" | undefined,
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    primaryActionLabel: {
      type: String,
      required: true,
    },
    secondaryActionLabel: {
      type: String,
      required: false,
    },
    cancelLabel: {
      type: String,
      required: false,
    },
    autoFocusButton: {
      type: String as () => "primary" | "secondary" | "cancel" | undefined,
      required: false,
    },
    isPrimaryActionDisabled: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    isSecondaryActionDisabled: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    onCancel: {
      type: Function as PropType<(() => void) | undefined>,
      required: false,
    },
    onPrimaryAction: {
      type: Function as PropType<(() => void) | undefined>,
      required: false,
    },
    onSecondaryAction: {
      type: Function as PropType<(() => void) | undefined>,
      required: false,
    },
  },
  setup(props, { slots, attrs }) {
    const container = (() => {
      try {
        return useDialogContainer();
      } catch {
        return {
          dismiss: () => {},
        };
      }
    })();

    const confirmVariant = computed(() => {
      if (props.variant === "confirmation") {
        return "cta";
      }
      if (props.variant === "destructive") {
        return "negative";
      }
      return "primary";
    });

    const dismissThen = (cb?: () => void) => {
      container.dismiss();
      cb?.();
    };

    return () =>
      h(
        Dialog as any,
        {
          ...attrs,
          size: "M",
          role: "alertdialog",
          UNSAFE_className: props.variant ? `spectrum-Dialog--${props.variant}` : undefined,
        },
        {
          default: () => [
            h("h2", null, props.title),
            h("div", null, slots.default?.()),
            h("div", { class: "spectrum-Dialog-buttonGroup" }, [
              props.cancelLabel
                ? h(
                    Button as any,
                    {
                      variant: "secondary",
                      onPress: () => dismissThen(props.onCancel),
                      autoFocus: props.autoFocusButton === "cancel",
                      "data-testid": "rsp-AlertDialog-cancelButton",
                    },
                    { default: () => props.cancelLabel }
                  )
                : null,
              props.secondaryActionLabel
                ? h(
                    Button as any,
                    {
                      variant: "secondary",
                      onPress: () => dismissThen(props.onSecondaryAction),
                      isDisabled: props.isSecondaryActionDisabled,
                      autoFocus: props.autoFocusButton === "secondary",
                      "data-testid": "rsp-AlertDialog-secondaryButton",
                    },
                    { default: () => props.secondaryActionLabel }
                  )
                : null,
              h(
                Button as any,
                {
                  variant: confirmVariant.value,
                  onPress: () => dismissThen(props.onPrimaryAction),
                  isDisabled: props.isPrimaryActionDisabled,
                  autoFocus: props.autoFocusButton === "primary",
                  "data-testid": "rsp-AlertDialog-confirmButton",
                },
                { default: () => props.primaryActionLabel }
              ),
            ]),
          ],
        }
      );
  },
});
