import { useSearchField } from "@vue-aria/searchfield";
import { useSearchFieldState } from "@vue-aria/searchfield-state";
import { useProviderProps } from "@vue-spectrum/provider";
import { useSlotProps } from "@vue-spectrum/utils";
import { ClearButton } from "@vue-spectrum/button";
import { TextFieldBase } from "@vue-spectrum/textfield";
import { computed, defineComponent, h, onMounted, ref, type PropType } from "vue";
import type { SpectrumSearchFieldProps } from "./types";

/**
 * A SearchField is a text field designed for searches.
 */
export const SearchField = defineComponent({
  name: "SpectrumSearchField",
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Number] as PropType<string | number | undefined>,
      required: false,
    },
    defaultValue: {
      type: [String, Number] as PropType<string | number | undefined>,
      required: false,
    },
    onChange: {
      type: Function as PropType<((value: string) => void) | undefined>,
      required: false,
    },
    onSubmit: {
      type: Function as PropType<((value: string) => void) | undefined>,
      required: false,
    },
    onClear: {
      type: Function as PropType<(() => void) | undefined>,
      required: false,
    },
    label: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    errorMessage: {
      type: String,
      required: false,
    },
    isQuiet: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    isReadOnly: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    validationState: {
      type: String as () => "valid" | "invalid" | undefined,
      required: false,
    },
    isInvalid: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    placeholder: {
      type: String,
      required: false,
    },
    autoFocus: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    excludeFromTabOrder: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    icon: {
      type: null as unknown as PropType<unknown>,
      required: false,
    },
    UNSAFE_className: {
      type: String,
      required: false,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      required: false,
    },
  },
  setup(props, { attrs, expose }) {
    const inputRef = ref<HTMLInputElement | null>(null);
    const mergedProvider = useProviderProps({
      ...props,
      ...attrs,
    } as Record<string, unknown>) as SpectrumSearchFieldProps & Record<string, unknown>;
    const merged = useSlotProps(mergedProvider, "searchfield") as SpectrumSearchFieldProps & Record<string, unknown>;
    const state = useSearchFieldState(merged);
    const { clearButtonProps, ...result } = useSearchField(merged, state, {
      get current() {
        return inputRef.value;
      },
      set current(value: HTMLInputElement | null) {
        inputRef.value = value;
      },
    });
    const validationState = computed(
      () => merged.validationState || (result.isInvalid ? "invalid" : undefined)
    );
    const icon = computed(() => {
      if (merged.icon === "") {
        return null;
      }

      if (merged.icon !== undefined) {
        return merged.icon;
      }

      return h("span", { "data-testid": "searchicon", class: "spectrum-Search-icon", "aria-hidden": "true" });
    });
    const clearButton = computed(() =>
      h(ClearButton as any, {
        ...clearButtonProps,
        preventFocus: true,
        UNSAFE_className: "spectrum-ClearButton",
        isDisabled: Boolean(merged.isDisabled || clearButtonProps.isDisabled),
      })
    );
    const wrapperChildren = computed(() =>
      state.value !== "" && !merged.isReadOnly ? clearButton.value : undefined
    );

    onMounted(() => {
      if (merged.placeholder && process.env.NODE_ENV !== "production") {
        console.warn(
          "Placeholders are deprecated due to accessibility issues. Please use help text instead. " +
            "See the docs for details: https://react-spectrum.adobe.com/react-spectrum/SearchField.html#help-text"
        );
      }
    });

    expose({
      focus: () => inputRef.value?.focus(),
      select: () => inputRef.value?.select(),
      getInputElement: () => inputRef.value,
      UNSAFE_getDOMNode: () => inputRef.value,
    });

    return () =>
      h(TextFieldBase as any, {
        ...merged,
        ...result,
        validationState: validationState.value,
        UNSAFE_className: [
          "spectrum-Search",
          "spectrum-Textfield",
          merged.isDisabled ? "is-disabled" : null,
          merged.isQuiet ? "is-quiet" : null,
          validationState.value === "invalid" && !merged.isDisabled ? "spectrum-Search--invalid" : null,
          validationState.value === "valid" && !merged.isDisabled ? "spectrum-Search--valid" : null,
          merged.UNSAFE_className ?? null,
        ]
          .filter(Boolean)
          .join(" "),
        inputClassName: "spectrum-Search-input",
        isDisabled: Boolean(merged.isDisabled),
        icon: icon.value,
        wrapperChildren: wrapperChildren.value,
        inputProps: {
          ...result.inputProps,
          ref: inputRef,
          tabIndex: merged.excludeFromTabOrder ? -1 : result.inputProps.tabIndex,
        },
      });
  },
});
