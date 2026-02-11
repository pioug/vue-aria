import clsx from "clsx";
import type { PressEvent } from "@vue-aria/types";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  Button as SpectrumButton,
  type SpectrumButtonProps,
} from "@vue-spectrum/button";
import { useProviderProps } from "@vue-spectrum/provider";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "negative"
  | "premium"
  | "genai";
export type ButtonFillStyle = "fill" | "outline";
export type ButtonSize = "S" | "M" | "L" | "XL";

export interface S2ButtonProps
  extends Omit<SpectrumButtonProps, "variant" | "style"> {
  variant?: ButtonVariant | undefined;
  fillStyle?: ButtonFillStyle | undefined;
  size?: ButtonSize | undefined;
}

export interface S2LinkButtonProps
  extends Omit<S2ButtonProps, "elementType"> {}

const variantMap: Record<ButtonVariant, SpectrumButtonProps["variant"]> = {
  primary: "primary",
  secondary: "secondary",
  accent: "accent",
  negative: "negative",
  premium: "accent",
  genai: "accent",
};

function createSharedButtonProps(props: S2ButtonProps, attrs: Record<string, unknown>) {
  const mappedVariant = props.variant ? variantMap[props.variant] : undefined;
  const providerMerged = useProviderProps({
    ...attrs,
    elementType: props.elementType,
    variant: mappedVariant,
    style: props.fillStyle,
    staticColor: props.staticColor,
    isDisabled: props.isDisabled,
    isPending: props.isPending,
    autoFocus: props.autoFocus,
    href: props.href,
    target: props.target,
    rel: props.rel,
    type: props.type,
    onPressStart: props.onPressStart,
    onPressEnd: props.onPressEnd,
    onPressChange: props.onPressChange,
    onPressUp: props.onPressUp,
    onPress: props.onPress,
    slot: props.slot,
    UNSAFE_className: props.UNSAFE_className,
    UNSAFE_style: props.UNSAFE_style,
  });

  return {
    ...providerMerged,
    UNSAFE_className: clsx("s2-Button", providerMerged.UNSAFE_className),
    "data-s2-variant": props.variant,
    "data-s2-fill-style": props.fillStyle,
    "data-s2-size": props.size,
  };
}

function defineS2Button(name: string, linkMode: boolean) {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: {
      elementType: {
        type: String as PropType<"button" | "a" | undefined>,
        default: undefined,
      },
      variant: {
        type: String as PropType<ButtonVariant | undefined>,
        default: undefined,
      },
      fillStyle: {
        type: String as PropType<ButtonFillStyle | undefined>,
        default: undefined,
      },
      size: {
        type: String as PropType<ButtonSize | undefined>,
        default: undefined,
      },
      staticColor: {
        type: String as PropType<"white" | "black" | undefined>,
        default: undefined,
      },
      isDisabled: {
        type: Boolean as PropType<boolean | undefined>,
        default: undefined,
      },
      isPending: {
        type: Boolean as PropType<boolean | undefined>,
        default: undefined,
      },
      autoFocus: {
        type: Boolean as PropType<boolean | undefined>,
        default: undefined,
      },
      href: {
        type: String as PropType<string | undefined>,
        default: undefined,
      },
      target: {
        type: String as PropType<string | undefined>,
        default: undefined,
      },
      rel: {
        type: String as PropType<string | undefined>,
        default: undefined,
      },
      type: {
        type: String as PropType<"button" | "submit" | "reset" | undefined>,
        default: undefined,
      },
      onPressStart: {
        type: Function as PropType<((event: PressEvent) => void) | undefined>,
        default: undefined,
      },
      onPressEnd: {
        type: Function as PropType<((event: PressEvent) => void) | undefined>,
        default: undefined,
      },
      onPressChange: {
        type: Function as PropType<((isPressed: boolean) => void) | undefined>,
        default: undefined,
      },
      onPressUp: {
        type: Function as PropType<((event: PressEvent) => void) | undefined>,
        default: undefined,
      },
      onPress: {
        type: Function as PropType<((event: PressEvent) => void) | undefined>,
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
    setup(props, { attrs, slots }) {
      const forwardedProps = computed(() => {
        const base = createSharedButtonProps(
          props as unknown as S2ButtonProps,
          attrs as Record<string, unknown>
        );
        const elementType = linkMode ? "a" : props.elementType;

        return {
          ...base,
          elementType,
        };
      });

      return () =>
        h(SpectrumButton, forwardedProps.value as Record<string, unknown>, {
          default: () => slots.default?.() ?? [],
        });
    },
  });
}

export const Button = defineS2Button("S2Button", false);
export const LinkButton = defineS2Button("S2LinkButton", true);
