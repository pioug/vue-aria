import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  Tag as SpectrumTag,
  TagGroup as SpectrumTagGroup,
  type SpectrumTagGroupProps,
  type SpectrumTagProps,
} from "@vue-spectrum/tag";
import { useProviderProps } from "@vue-spectrum/provider";

export interface S2TagGroupProps extends SpectrumTagGroupProps {}
export interface S2TagProps extends SpectrumTagProps {}

const baseTagProps = {
  UNSAFE_className: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  UNSAFE_style: {
    type: Object as PropType<Record<string, string | number> | undefined>,
    default: undefined,
  },
} as const;

function useTagForwardedProps(
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

export const TagGroup = defineComponent({
  name: "S2TagGroup",
  inheritAttrs: false,
  props: baseTagProps,
  setup(props, { attrs, slots }) {
    const forwardedProps = computed(() =>
      useTagForwardedProps(attrs as Record<string, unknown>, "s2-TagGroup", props)
    );

    return () =>
      h(SpectrumTagGroup, forwardedProps.value as Record<string, unknown>, slots);
  },
});

export const Tag = defineComponent({
  name: "S2Tag",
  inheritAttrs: false,
  props: baseTagProps,
  setup(props, { attrs, slots }) {
    const forwardedProps = computed(() =>
      useTagForwardedProps(attrs as Record<string, unknown>, "s2-Tag", props)
    );

    return () => h(SpectrumTag as any, forwardedProps.value as Record<string, unknown>, slots);
  },
});
