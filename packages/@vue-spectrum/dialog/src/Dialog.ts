import {
  computed,
  defineComponent,
  h,
  nextTick,
  onMounted,
  ref,
  type PropType,
} from "vue";
import { useDialog } from "@vue-aria/dialog";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";
import { useDialogContext, type DialogType } from "./context";

export type DialogSize = "S" | "M" | "L" | "fullscreen" | "fullscreenTakeover";

export interface SpectrumDialogProps {
  role?: "dialog" | "alertdialog" | undefined;
  type?: DialogType | undefined;
  size?: DialogSize | undefined;
  isDismissable?: boolean | undefined;
  onDismiss?: (() => void) | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

const sizeMap: Record<DialogSize, string> = {
  S: "small",
  M: "medium",
  L: "large",
  fullscreen: "fullscreen",
  fullscreenTakeover: "fullscreenTakeover",
};

const typeSizeMap: Record<DialogType, string | undefined> = {
  modal: undefined,
  popover: "small",
  tray: undefined,
  fullscreen: "fullscreen",
  fullscreenTakeover: "fullscreenTakeover",
};

export const Dialog = defineComponent({
  name: "Dialog",
  inheritAttrs: false,
  props: {
    role: {
      type: String as PropType<"dialog" | "alertdialog" | undefined>,
      default: undefined,
    },
    type: {
      type: String as PropType<DialogType | undefined>,
      default: undefined,
    },
    size: {
      type: String as PropType<DialogSize | undefined>,
      default: undefined,
    },
    isDismissable: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    onDismiss: {
      type: Function as PropType<(() => void) | undefined>,
      default: undefined,
    },
    ariaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaLabelledby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-label": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-labelledby": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    slot: {
      type: String as PropType<string | undefined>,
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
    const elementRef = ref<HTMLElement | null>(null);

    const resolvedType = computed<DialogType>(() => props.type ?? context?.type ?? "modal");
    const resolvedDismissable = computed<boolean>(
      () => props.isDismissable ?? context?.isDismissable ?? false
    );
    const resolvedSize = computed<DialogSize>(() => {
      if (resolvedType.value === "popover") {
        return props.size ?? "S";
      }

      return props.size ?? "L";
    });

    const ariaLabel = computed<string | undefined>(() => {
      const attrsRecord = attrs as Record<string, unknown>;
      return (
        props.ariaLabel ??
        props["aria-label"] ??
        (attrsRecord["aria-label"] as string | undefined)
      );
    });

    const ariaLabelledby = computed<string | undefined>(() => {
      const attrsRecord = attrs as Record<string, unknown>;
      return (
        props.ariaLabelledby ??
        props["aria-labelledby"] ??
        (attrsRecord["aria-labelledby"] as string | undefined)
      );
    });

    const { dialogProps } = useDialog({}, computed(() => elementRef.value));

    const onDismiss = (): void => {
      props.onDismiss?.();
      context?.onClose?.();
    };

    onMounted(() => {
      void nextTick(() => {
        const root = elementRef.value;
        if (!root) {
          return;
        }

        const autoFocusTarget = root.querySelector<HTMLElement>("[autofocus]");
        autoFocusTarget?.focus();
      });
    });

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
    });

    return () => {
      const attrsRecord = attrs as Record<string, unknown>;
      const styleInput = {
        ...attrsRecord,
        slot: props.slot,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      } as Record<string, unknown>;
      const { styleProps } = useStyleProps(styleInput);
      const domProps = filterDOMProps(attrsRecord, { labelable: true });
      const sizeVariant = typeSizeMap[resolvedType.value] ?? sizeMap[resolvedSize.value];
      const mergedDialogProps = {
        ...dialogProps.value,
      } as Record<string, unknown>;
      if (!ariaLabelledby.value || ariaLabel.value) {
        delete mergedDialogProps["aria-labelledby"];
      }
      const resolvedRole =
        props.role ??
        (domProps.role as "dialog" | "alertdialog" | undefined) ??
        (mergedDialogProps.role as "dialog" | "alertdialog" | undefined) ??
        "dialog";
      const resolvedAriaLabelledby =
        ariaLabelledby.value;

      return h(
        "section",
        mergeProps(domProps, mergedDialogProps, {
          ref: (value: unknown) => {
            elementRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "spectrum-Dialog",
            {
              [`spectrum-Dialog--${sizeVariant}`]: Boolean(sizeVariant),
              "spectrum-Dialog--dismissable": resolvedDismissable.value,
            },
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined,
            props.UNSAFE_className as ClassValue | undefined
          ),
          style: {
            ...(styleProps.style ?? {}),
            ...(props.UNSAFE_style ?? {}),
          },
          role: resolvedRole,
          "aria-label": ariaLabel.value,
          "aria-labelledby": resolvedAriaLabelledby,
        }),
        [
          h(
            "div",
            {
              class: classNames("spectrum-Dialog-grid"),
            },
            [
              ...(slots.default?.() ?? []),
              resolvedDismissable.value
                ? h(
                    "button",
                    {
                      type: "button",
                      class: classNames("spectrum-Dialog-closeButton"),
                      "aria-label": "Dismiss",
                      onClick: onDismiss,
                    },
                    "×"
                  )
                : null,
            ]
          ),
        ]
      );
    };
  },
});
