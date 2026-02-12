import { computed, defineComponent, h, ref, type PropType } from "vue";
import { useFocusRing } from "@vue-aria/focus";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { useToast } from "@vue-aria/toast";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import type { QueuedToast, UseToastStateResult } from "@vue-aria/toast-state";
import { Button, ClearButton } from "@vue-spectrum/button";
import { classNames } from "@vue-spectrum/utils";

export interface SpectrumToastValue {
  children: string;
  variant: "positive" | "negative" | "info" | "neutral";
  actionLabel?: string | undefined;
  onAction?: (() => void) | undefined;
  shouldCloseOnAction?: boolean | undefined;
  [key: string]: unknown;
}

export interface SpectrumToastProps {
  toast: QueuedToast<SpectrumToastValue>;
  state: UseToastStateResult<SpectrumToastValue>;
}

const TOAST_INTL_MESSAGES = {
  "en-US": {
    info: "Info",
    negative: "Error",
    positive: "Success",
  },
  "fr-FR": {
    info: "Infos",
    negative: "Erreur",
    positive: "Succès",
  },
} as const;

const ICON_LABEL_KEYS = {
  info: "info",
  negative: "negative",
  positive: "positive",
} as const satisfies Record<Exclude<SpectrumToastValue["variant"], "neutral">, keyof typeof TOAST_INTL_MESSAGES["en-US"]>;

const ICON_SYMBOLS: Record<
  Exclude<SpectrumToastValue["variant"], "neutral">,
  string
> = {
  info: "i",
  negative: "!",
  positive: "✓",
};

export const Toast = defineComponent({
  name: "Toast",
  props: {
    toast: {
      type: Object as PropType<QueuedToast<SpectrumToastValue>>,
      required: true,
    },
    state: {
      type: Object as PropType<UseToastStateResult<SpectrumToastValue>>,
      required: true,
    },
  },
  setup(props) {
    const toastRef = ref<HTMLElement | null>(null);
    const { toastProps, contentProps, titleProps, closeButtonProps } = useToast(
      {
        toast: computed(() => props.toast),
      },
      props.state,
      toastRef
    );
    const { focusProps, isFocusVisible } = useFocusRing();
    const stringFormatter = useLocalizedStringFormatter(TOAST_INTL_MESSAGES);

    const onAction = (): void => {
      const { key, content } = props.toast;
      content.onAction?.();
      if (content.shouldCloseOnAction) {
        props.state.close(key);
      }
    };

    return () => {
      const toast = props.toast;
      const variant = toast.content.variant;
      const iconLabel =
        variant === "neutral"
          ? undefined
          : stringFormatter.value.format(ICON_LABEL_KEYS[variant]);
      const iconSymbol = variant === "neutral" ? undefined : ICON_SYMBOLS[variant];
      const domProps = filterDOMProps(toast.content as Record<string, unknown>);

      return h(
        "div",
        mergeProps(
          toastProps.value as Record<string, unknown>,
          focusProps,
          domProps,
          {
            ref: toastRef,
            class: classNames(
              "spectrum-Toast",
              "react-spectrum-Toast",
              variant ? `spectrum-Toast--${variant}` : undefined,
              {
                "focus-ring": isFocusVisible.value,
              }
            ),
          }
        ),
        [
          h(
            "div",
            mergeProps(contentProps.value as Record<string, unknown>, {
              class: classNames("spectrum-Toast-contentWrapper"),
            }),
            [
              iconSymbol
                ? h(
                  "span",
                  {
                    class: classNames("spectrum-Toast-typeIcon"),
                    role: "img",
                    "aria-label": iconLabel,
                  },
                  iconSymbol
                )
                : null,
              h("div", { class: classNames("spectrum-Toast-body"), role: "presentation" }, [
                h(
                  "div",
                  mergeProps(titleProps.value as Record<string, unknown>, {
                    class: classNames("spectrum-Toast-content"),
                    role: "presentation",
                  }),
                  toast.content.children
                ),
                toast.content.actionLabel
                  ? h(
                    Button,
                    {
                      onPress: onAction,
                      variant: "secondary",
                      staticColor: "white",
                      "data-testid": "rsp-Toast-secondaryButton",
                    },
                    {
                      default: () => toast.content.actionLabel,
                    }
                  )
                  : null,
              ]),
            ]
          ),
          h("div", { class: classNames("spectrum-Toast-buttons") }, [
            h(
              ClearButton,
              mergeProps(closeButtonProps.value as Record<string, unknown>, {
                variant: "overBackground",
                "data-testid": "rsp-Toast-closeButton",
              }),
              {
                default: () => "×",
              }
            ),
          ]),
        ]
      );
    };
  },
});
