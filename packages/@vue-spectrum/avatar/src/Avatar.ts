import { defineComponent, h, ref, type PropType } from "vue";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { useProviderProps } from "@vue-spectrum/provider";
import {
  classNames,
  dimensionValue,
  useSlotProps,
  useStyleProps,
  type ClassValue,
  type DimensionValue,
} from "@vue-spectrum/utils";

const DEFAULT_SIZE = "avatar-size-100";
const SIZE_RE = /^size-\d+/;

export type AvatarSize =
  | "avatar-size-50"
  | "avatar-size-75"
  | "avatar-size-100"
  | "avatar-size-200"
  | "avatar-size-300"
  | "avatar-size-400"
  | "avatar-size-500"
  | "avatar-size-600"
  | "avatar-size-700"
  | (string & {})
  | number;

export interface SpectrumAvatarProps {
  alt?: string | undefined;
  src?: string | undefined;
  size?: AvatarSize | undefined;
  isDisabled?: boolean | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

function resolveSizeValue(size: AvatarSize | undefined): string | undefined {
  const value = size ?? DEFAULT_SIZE;
  const isInvalidToken =
    typeof value !== "number" &&
    typeof value === "string" &&
    (SIZE_RE.test(value) || !Number.isNaN(Number(value)));

  return dimensionValue(isInvalidToken ? DEFAULT_SIZE : (value as DimensionValue));
}

export const Avatar = defineComponent({
  name: "Avatar",
  inheritAttrs: false,
  props: {
    alt: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    src: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    size: {
      type: [String, Number] as PropType<AvatarSize | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
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
    const elementRef = ref<HTMLImageElement | null>(null);

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
    });

    return () => {
      const slotProps = useSlotProps(
        {
          ...(attrs as Record<string, unknown>),
          alt: props.alt,
          src: props.src,
          size: props.size,
          isDisabled: props.isDisabled,
          slot: props.slot,
          UNSAFE_className: props.UNSAFE_className,
          UNSAFE_style: props.UNSAFE_style,
        } as Record<string, unknown> & { slot?: string; id?: string },
        "avatar"
      );

      const resolvedProps = useProviderProps(slotProps);
      const { styleProps } = useStyleProps(resolvedProps);
      const domProps = filterDOMProps(resolvedProps as Record<string, unknown>);
      const sizeValue = resolveSizeValue(resolvedProps.size as AvatarSize | undefined);

      const className = classNames(
        "spectrum-Avatar",
        { "is-disabled": Boolean(resolvedProps.isDisabled) },
        styleProps.class as ClassValue | undefined,
        domProps.class as ClassValue | undefined
      );

      const elementProps = mergeProps(domProps, styleProps, {
        ref: elementRef,
        src: resolvedProps.src as string | undefined,
        alt: (resolvedProps.alt as string | undefined) ?? "",
        class: className,
        style: {
          ...(styleProps.style ?? {}),
          ...(sizeValue ? { height: sizeValue, width: sizeValue } : {}),
        },
      });

      return h("img", elementProps);
    };
  },
});
