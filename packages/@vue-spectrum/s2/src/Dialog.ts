import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  AlertDialog as SpectrumAlertDialog,
  Dialog as SpectrumDialog,
  DialogContainer as SpectrumDialogContainer,
  DialogTrigger as SpectrumDialogTrigger,
  useDialogContainer as spectrumUseDialogContainer,
  type DialogContainerValue,
  type DialogType,
  type SpectrumAlertDialogProps,
  type SpectrumDialogContainerProps,
  type SpectrumDialogProps,
  type SpectrumDialogTriggerProps,
} from "@vue-spectrum/dialog";
import { useProviderProps } from "@vue-spectrum/provider";

export interface S2AlertDialogProps extends SpectrumAlertDialogProps {}
export interface S2DialogProps extends SpectrumDialogProps {}
export interface S2CustomDialogProps extends SpectrumDialogProps {
  size?: "S" | "M" | "L" | "fullscreen" | "fullscreenTakeover" | undefined;
  isDismissible?: boolean | undefined;
  isKeyboardDismissDisabled?: boolean | undefined;
  padding?: "default" | "none" | undefined;
}
export interface S2FullscreenDialogProps extends SpectrumDialogProps {
  variant?: "fullscreen" | "fullscreenTakeover" | undefined;
  isKeyboardDismissDisabled?: boolean | undefined;
}
export interface S2DialogTriggerProps extends SpectrumDialogTriggerProps {}
export interface S2DialogContainerProps extends SpectrumDialogContainerProps {}
export type S2DialogContainerValue = DialogContainerValue;
export type S2DialogType = DialogType;

const styledProps = {
  UNSAFE_className: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  UNSAFE_style: {
    type: Object as PropType<Record<string, string | number> | undefined>,
    default: undefined,
  },
} as const;

function resolveStyledForwardedProps(
  attrs: Record<string, unknown>,
  className: string,
  props: {
    UNSAFE_className?: string | undefined;
    UNSAFE_style?: Record<string, string | number> | undefined;
  }
) {
  const attrsClassName =
    typeof attrs.UNSAFE_className === "string" ? (attrs.UNSAFE_className as string) : undefined;
  const attrsStyle =
    (attrs.UNSAFE_style as Record<string, string | number> | undefined) ?? undefined;

  return useProviderProps({
    ...attrs,
    UNSAFE_className: clsx(className, attrsClassName, props.UNSAFE_className),
    UNSAFE_style: {
      ...(attrsStyle ?? {}),
      ...(props.UNSAFE_style ?? {}),
    },
  });
}

export const AlertDialog = defineComponent({
  name: "S2AlertDialog",
  inheritAttrs: false,
  props: styledProps,
  setup(props, { attrs, slots }) {
    const forwardedProps = computed(() =>
      resolveStyledForwardedProps(
        attrs as Record<string, unknown>,
        "s2-AlertDialog",
        props
      )
    );

    return () =>
      h(SpectrumAlertDialog as any, forwardedProps.value as Record<string, unknown>, slots);
  },
});

export const Dialog = defineComponent({
  name: "S2Dialog",
  inheritAttrs: false,
  props: styledProps,
  setup(props, { attrs, slots }) {
    const forwardedProps = computed(() =>
      resolveStyledForwardedProps(attrs as Record<string, unknown>, "s2-Dialog", props)
    );

    return () => h(SpectrumDialog as any, forwardedProps.value as Record<string, unknown>, slots);
  },
});

export const CustomDialog = defineComponent({
  name: "S2CustomDialog",
  inheritAttrs: false,
  props: {
    ...styledProps,
    size: {
      type: String as PropType<
        "S" | "M" | "L" | "fullscreen" | "fullscreenTakeover" | undefined
      >,
      default: undefined,
    },
    isDismissible: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isKeyboardDismissDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    padding: {
      type: String as PropType<"default" | "none" | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const forwardedProps = computed(() => {
      const attrsRecord = attrs as Record<string, unknown>;
      const merged = resolveStyledForwardedProps(
        attrsRecord,
        clsx(
          "s2-CustomDialog",
          props.size ? `s2-CustomDialog--${props.size}` : null,
          props.padding ? `s2-CustomDialog--padding-${props.padding}` : null
        ),
        props
      ) as Record<string, unknown>;
      merged.size = props.size;
      merged.isDismissable = props.isDismissible;
      merged["data-s2-keyboard-dismiss-disabled"] = props.isKeyboardDismissDisabled
        ? "true"
        : undefined;
      return merged;
    });

    return () =>
      h(SpectrumDialog as any, forwardedProps.value as Record<string, unknown>, slots);
  },
});

export const FullscreenDialog = defineComponent({
  name: "S2FullscreenDialog",
  inheritAttrs: false,
  props: {
    ...styledProps,
    variant: {
      type: String as PropType<"fullscreen" | "fullscreenTakeover" | undefined>,
      default: undefined,
    },
    isKeyboardDismissDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const forwardedProps = computed(() => {
      const attrsRecord = attrs as Record<string, unknown>;
      const merged = resolveStyledForwardedProps(
        attrsRecord,
        clsx(
          "s2-FullscreenDialog",
          props.variant ? `s2-FullscreenDialog--${props.variant}` : null
        ),
        props
      ) as Record<string, unknown>;
      merged.size = props.variant ?? "fullscreen";
      merged["data-s2-keyboard-dismiss-disabled"] = props.isKeyboardDismissDisabled
        ? "true"
        : undefined;
      return merged;
    });

    return () =>
      h(SpectrumDialog as any, forwardedProps.value as Record<string, unknown>, slots);
  },
});

export const DialogTrigger = defineComponent({
  name: "S2DialogTrigger",
  inheritAttrs: false,
  props: {
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const forwardedProps = computed(() => {
      const attrsRecord = attrs as Record<string, unknown>;
      const attrsClassName =
        typeof attrsRecord.UNSAFE_className === "string"
          ? (attrsRecord.UNSAFE_className as string)
          : undefined;

      return useProviderProps({
        ...attrsRecord,
        UNSAFE_className: clsx(
          "s2-DialogTrigger",
          attrsClassName,
          props.UNSAFE_className
        ),
      });
    });

    return () =>
      h(SpectrumDialogTrigger as any, forwardedProps.value as Record<string, unknown>, slots);
  },
});

export const DialogContainer = defineComponent({
  name: "S2DialogContainer",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const forwardedProps = computed(() =>
      useProviderProps(attrs as Record<string, unknown>)
    );

    return () =>
      h(SpectrumDialogContainer as any, forwardedProps.value as Record<string, unknown>, slots);
  },
});

export function useDialogContainer(): S2DialogContainerValue {
  return spectrumUseDialogContainer();
}
