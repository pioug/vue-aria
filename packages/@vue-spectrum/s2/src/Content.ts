import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  Heading as SpectrumHeading,
  Keyboard as SpectrumKeyboard,
  Text as SpectrumText,
  type HeadingProps,
  type KeyboardProps,
  type TextProps,
} from "@vue-spectrum/text";
import {
  Content as SpectrumContent,
  Footer as SpectrumFooter,
  Header as SpectrumHeader,
  type ContentProps,
  type FooterProps,
  type HeaderProps,
} from "@vue-spectrum/view";
import { useProviderProps } from "@vue-spectrum/provider";

interface S2BaseContentProps {
  isHidden?: boolean | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export interface S2HeadingProps extends HeadingProps, S2BaseContentProps {}
export interface S2HeaderProps extends HeaderProps, S2BaseContentProps {}
export interface S2ContentProps extends ContentProps, S2BaseContentProps {}
export interface S2TextProps extends TextProps, S2BaseContentProps {}
export interface S2KeyboardProps extends KeyboardProps, S2BaseContentProps {}
export interface S2FooterProps extends FooterProps, S2BaseContentProps {}

function resolveForwardedProps(
  attrs: Record<string, unknown>,
  className: string,
  props: S2BaseContentProps
) {
  const attrsClassName = attrs.class as string | undefined;
  const attrsUnsafeClassName =
    typeof attrs.UNSAFE_className === "string" ? (attrs.UNSAFE_className as string) : undefined;
  const attrsStyle =
    (attrs.style as Record<string, string | number> | undefined) ?? undefined;
  const attrsUnsafeStyle =
    (attrs.UNSAFE_style as Record<string, string | number> | undefined) ?? undefined;

  return useProviderProps({
    ...attrs,
    class: clsx(className, attrsClassName, attrsUnsafeClassName, props.UNSAFE_className),
    style: {
      ...(attrsStyle ?? {}),
      ...(attrsUnsafeStyle ?? {}),
      ...(props.UNSAFE_style ?? {}),
    },
  });
}

const baseContentProps = {
  isHidden: {
    type: Boolean as PropType<boolean | undefined>,
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
} as const;

export const Heading = defineComponent({
  name: "S2Heading",
  inheritAttrs: false,
  props: baseContentProps,
  setup(props, { attrs, slots }) {
    const forwardedProps = computed(() =>
      resolveForwardedProps(attrs as Record<string, unknown>, "s2-Heading", props)
    );

    return () => {
      if (props.isHidden) {
        return null;
      }

      return h(SpectrumHeading, forwardedProps.value as Record<string, unknown>, slots);
    };
  },
});

export const Header = defineComponent({
  name: "S2Header",
  inheritAttrs: false,
  props: baseContentProps,
  setup(props, { attrs, slots }) {
    const forwardedProps = computed(() =>
      resolveForwardedProps(attrs as Record<string, unknown>, "s2-Header", props)
    );

    return () => {
      if (props.isHidden) {
        return null;
      }

      return h(SpectrumHeader, forwardedProps.value as Record<string, unknown>, slots);
    };
  },
});

export const Content = defineComponent({
  name: "S2Content",
  inheritAttrs: false,
  props: baseContentProps,
  setup(props, { attrs, slots }) {
    const forwardedProps = computed(() =>
      resolveForwardedProps(attrs as Record<string, unknown>, "s2-Content", props)
    );

    return () => {
      if (props.isHidden) {
        return null;
      }

      return h(SpectrumContent, forwardedProps.value as Record<string, unknown>, slots);
    };
  },
});

export const Text = defineComponent({
  name: "S2Text",
  inheritAttrs: false,
  props: baseContentProps,
  setup(props, { attrs, slots }) {
    const forwardedProps = computed(() =>
      resolveForwardedProps(attrs as Record<string, unknown>, "s2-Text", props)
    );

    return () => {
      if (props.isHidden) {
        return null;
      }

      return h(SpectrumText, forwardedProps.value as Record<string, unknown>, slots);
    };
  },
});

export const Keyboard = defineComponent({
  name: "S2Keyboard",
  inheritAttrs: false,
  props: baseContentProps,
  setup(props, { attrs, slots }) {
    const forwardedProps = computed(() =>
      resolveForwardedProps(attrs as Record<string, unknown>, "s2-Keyboard", props)
    );

    return () => {
      if (props.isHidden) {
        return null;
      }

      return h(SpectrumKeyboard, forwardedProps.value as Record<string, unknown>, slots);
    };
  },
});

export const Footer = defineComponent({
  name: "S2Footer",
  inheritAttrs: false,
  props: baseContentProps,
  setup(props, { attrs, slots }) {
    const forwardedProps = computed(() =>
      resolveForwardedProps(attrs as Record<string, unknown>, "s2-Footer", props)
    );

    return () => {
      if (props.isHidden) {
        return null;
      }

      return h(SpectrumFooter, forwardedProps.value as Record<string, unknown>, slots);
    };
  },
});
