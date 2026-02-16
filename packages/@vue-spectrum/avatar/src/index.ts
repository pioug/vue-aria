import { useProviderProps } from "@vue-spectrum/provider";
import { dimensionValue, useSlotProps, useStyleProps } from "@vue-spectrum/utils";
import { computed, defineComponent, h } from "vue";

export interface SpectrumAvatarProps {
  src?: string;
  alt?: string;
  isDisabled?: boolean;
  size?: string | number;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}

const DEFAULT_SIZE = "avatar-size-100";
const SIZE_RE = /^size-\d+/;

export const Avatar = defineComponent({
  name: "SpectrumAvatar",
  inheritAttrs: false,
  props: {
    src: {
      type: String,
      required: false,
    },
    alt: {
      type: String,
      required: false,
    },
    isDisabled: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    size: {
      type: [String, Number] as unknown as () => string | number | undefined,
      required: false,
      default: undefined,
    },
    UNSAFE_className: {
      type: String,
      required: false,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as () => Record<string, unknown> | undefined,
      required: false,
      default: undefined,
    },
  },
  setup(props, { attrs }) {
    const mergedProvider = useProviderProps({
      ...props,
      ...attrs,
    } as Record<string, unknown>) as SpectrumAvatarProps & Record<string, unknown>;
    const merged = useSlotProps(mergedProvider, "avatar");
    const { styleProps } = useStyleProps(merged);

    const sizeValue = computed(() => {
      const size = merged.size;
      if (typeof size !== "number" && (SIZE_RE.test(String(size)) || !isNaN(size as number))) {
        return dimensionValue(DEFAULT_SIZE);
      }
      return dimensionValue(size ?? DEFAULT_SIZE);
    });

    return () => {
      const { size: _size, ...domProps } = merged as Record<string, unknown>;
      return h("img", {
        ...domProps,
        ...styleProps.value,
        class: [
          "spectrum-Avatar",
          {
            "is-disabled": Boolean(merged.isDisabled),
          },
          styleProps.value.class,
        ],
        alt: merged.alt ?? "",
        style: {
          ...(styleProps.value.style as Record<string, unknown>),
          ...(sizeValue.value
            ? {
                height: sizeValue.value,
                width: sizeValue.value,
              }
            : {}),
        },
      });
    };
  },
});
