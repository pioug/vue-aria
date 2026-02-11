import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  SearchField as SpectrumSearchField,
  type SpectrumSearchFieldProps,
} from "@vue-spectrum/searchfield";
import { useProviderProps } from "@vue-spectrum/provider";

export type SearchFieldSize = "S" | "M" | "L" | "XL";

export interface S2SearchFieldProps extends SpectrumSearchFieldProps {
  size?: SearchFieldSize | undefined;
}

export const SearchField = defineComponent({
  name: "S2SearchField",
  inheritAttrs: false,
  props: {
    id: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    value: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    defaultValue: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    label: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    description: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    errorMessage: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    placeholder: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    icon: {
      type: null as unknown as PropType<SpectrumSearchFieldProps["icon"]>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isReadOnly: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isRequired: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    size: {
      type: String as PropType<SearchFieldSize | undefined>,
      default: undefined,
    },
    validationState: {
      type: String as PropType<"valid" | "invalid" | undefined>,
      default: undefined,
    },
    validationBehavior: {
      type: String as PropType<"native" | "aria" | undefined>,
      default: undefined,
    },
    onChange: {
      type: Function as PropType<((value: string) => void) | undefined>,
      default: undefined,
    },
    onInput: {
      type: Function as PropType<((value: string) => void) | undefined>,
      default: undefined,
    },
    onSubmit: {
      type: Function as PropType<((value: string) => void) | undefined>,
      default: undefined,
    },
    onClear: {
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
    ariaDescribedby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaErrormessage: {
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
  setup(props, { attrs }) {
    const forwardedProps = computed(() => {
      const merged = useProviderProps({
        ...(attrs as Record<string, unknown>),
        ...props,
        "aria-label": props.ariaLabel,
        "aria-labelledby": props.ariaLabelledby,
        "aria-describedby": props.ariaDescribedby,
        "aria-errormessage": props.ariaErrormessage,
      });

      return {
        ...merged,
        UNSAFE_className: clsx(
          "s2-SearchField",
          props.size ? `s2-SearchField--${props.size}` : null,
          merged.UNSAFE_className
        ),
      };
    });

    return () =>
      h(SpectrumSearchField, forwardedProps.value as Record<string, unknown>);
  },
});
