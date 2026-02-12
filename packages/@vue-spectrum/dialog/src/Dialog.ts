import {
  cloneVNode,
  computed,
  defineComponent,
  h,
  isVNode,
  nextTick,
  onMounted,
  ref,
  type PropType,
  type VNode,
} from "vue";
import { useDialog } from "@vue-aria/dialog";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { useId } from "@vue-aria/ssr";
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

const DIALOG_INTL_MESSAGES = {
  "en-US": {
    dismiss: "Dismiss",
  },
  "fr-FR": {
    dismiss: "Rejeter",
  },
} as const;

function isHeadingNode(node: VNode): boolean {
  if (typeof node.type === "string") {
    return /^h[1-6]$/i.test(node.type);
  }

  if (typeof node.type === "object" && node.type !== null) {
    const componentType = node.type as { name?: string };
    return componentType.name === "Heading";
  }

  return false;
}

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
    const generatedHeadingId = useId(undefined, "v-spectrum-dialog-heading");
    const stringFormatter = useLocalizedStringFormatter(DIALOG_INTL_MESSAGES);

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
      const explicitAriaLabel = ariaLabel.value;
      const explicitAriaLabelledby = ariaLabelledby.value;
      let renderedChildren = slots.default?.() ?? [];
      let autoHeadingLabelledby: string | undefined;

      if (!explicitAriaLabel && !explicitAriaLabelledby) {
        renderedChildren = renderedChildren.map((child) => child);
        const headingIndex = renderedChildren.findIndex(
          (child) => isVNode(child) && isHeadingNode(child)
        );

        if (headingIndex >= 0) {
          const headingNode = renderedChildren[headingIndex] as VNode;
          const headingProps =
            (headingNode.props as Record<string, unknown> | null) ?? {};
          const headingId =
            (headingProps.id as string | undefined) ?? generatedHeadingId.value;
          autoHeadingLabelledby = headingId;

          if (!headingProps.id) {
            renderedChildren[headingIndex] = cloneVNode(
              headingNode,
              {
                id: headingId,
              },
              true
            );
          }
        }
      }

      const mergedDialogProps = {
        ...dialogProps.value,
      } as Record<string, unknown>;
      if (!explicitAriaLabelledby || explicitAriaLabel) {
        delete mergedDialogProps["aria-labelledby"];
      }
      const resolvedRole =
        props.role ??
        (domProps.role as "dialog" | "alertdialog" | undefined) ??
        (mergedDialogProps.role as "dialog" | "alertdialog" | undefined) ??
        "dialog";
      const resolvedAriaLabelledby =
        explicitAriaLabelledby ?? (explicitAriaLabel ? undefined : autoHeadingLabelledby);

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
          "aria-label": explicitAriaLabel,
          "aria-labelledby": resolvedAriaLabelledby,
        }),
        [
          h(
            "div",
            {
              class: classNames("spectrum-Dialog-grid"),
            },
            [
              ...renderedChildren,
              resolvedDismissable.value
                ? h(
                    "button",
                    {
                      type: "button",
                      class: classNames("spectrum-Dialog-closeButton"),
                      "aria-label": stringFormatter.value.format("dismiss"),
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
