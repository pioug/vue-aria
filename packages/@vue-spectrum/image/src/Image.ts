import { defineComponent, h, ref, type PropType } from "vue";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { useProviderProps } from "@vue-spectrum/provider";
import { classNames, useSlotProps, useStyleProps, type ClassValue } from "@vue-spectrum/utils";

export type ImageCrossOrigin = "anonymous" | "use-credentials";

export interface SpectrumImageProps {
  src?: string | undefined;
  alt?: string | undefined;
  objectFit?: string | undefined;
  onError?: ((event: Event) => void) | undefined;
  onLoad?: ((event: Event) => void) | undefined;
  crossOrigin?: ImageCrossOrigin | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export const Image = defineComponent({
  name: "Image",
  inheritAttrs: false,
  props: {
    src: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    alt: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    objectFit: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    onError: {
      type: Function as PropType<((event: Event) => void) | undefined>,
      default: undefined,
    },
    onLoad: {
      type: Function as PropType<((event: Event) => void) | undefined>,
      default: undefined,
    },
    crossOrigin: {
      type: String as PropType<ImageCrossOrigin | undefined>,
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
  setup(props, { attrs, expose }) {
    const elementRef = ref<HTMLElement | null>(null);
    const isProduction =
      typeof process !== "undefined" && process.env.NODE_ENV === "production";

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
    });

    return () => {
      const userProvidedAlt = props.alt;
      const slotProps = useSlotProps(
        {
          ...(attrs as Record<string, unknown>),
          src: props.src,
          alt: props.alt,
          objectFit: props.objectFit,
          onError: props.onError,
          onLoad: props.onLoad,
          crossOrigin: props.crossOrigin,
          slot: props.slot,
          UNSAFE_className: props.UNSAFE_className,
          UNSAFE_style: props.UNSAFE_style,
        } as Record<string, unknown> & { slot?: string; id?: string },
        "image"
      );
      const resolvedProps = useProviderProps(slotProps);
      const { styleProps } = useStyleProps(resolvedProps);

      if (!isProduction && resolvedProps.alt == null) {
        console.warn(
          "The `alt` prop was not provided to an image. Add `alt` text for screen readers, or set `alt=\"\"` prop to indicate that the image is decorative or redundant with displayed text and should not be announced by screen readers."
        );
      }

      const domProps = filterDOMProps(resolvedProps as Record<string, unknown>);
      const wrapperClassName = classNames(
        "spectrum-Image",
        styleProps.class as ClassValue | undefined,
        domProps.class as ClassValue | undefined
      );

      return h(
        "div",
        mergeProps(domProps, styleProps, {
          ref: elementRef,
          class: wrapperClassName,
          style: {
            ...(styleProps.style ?? {}),
            overflow: "hidden",
          },
        }),
        [
          h("img", {
            src: resolvedProps.src as string | undefined,
            alt: (userProvidedAlt as string | undefined) ?? (resolvedProps.alt as string | undefined),
            style: { objectFit: resolvedProps.objectFit as string | undefined },
            class: classNames("spectrum-Image-img"),
            onError: resolvedProps.onError as ((event: Event) => void) | undefined,
            onLoad: resolvedProps.onLoad as ((event: Event) => void) | undefined,
            crossOrigin: resolvedProps.crossOrigin as ImageCrossOrigin | undefined,
          }),
        ]
      );
    };
  },
});
