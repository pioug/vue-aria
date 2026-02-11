import { defineComponent, h, type PropType } from "vue";
import { classNames, type ClassValue } from "@vue-spectrum/utils";

export type TagKey = string | number;

export interface SpectrumTagItemData {
  key: TagKey;
  label: string;
  "aria-label"?: string | undefined;
  isDisabled?: boolean | undefined;
}

export interface SpectrumTagProps {
  item?: SpectrumTagItemData | undefined;
  id?: TagKey | undefined;
  tabIndex?: number | undefined;
  isFocused?: boolean | undefined;
  isDisabled?: boolean | undefined;
  allowsRemoving?: boolean | undefined;
  removeButtonLabel?: string | undefined;
  onFocus?: (() => void) | undefined;
  onKeydown?: ((event: KeyboardEvent) => void) | undefined;
  onRemove?: (() => void) | undefined;
  UNSAFE_className?: string | undefined;
}

export const Tag = defineComponent({
  name: "Tag",
  props: {
    item: {
      type: Object as PropType<SpectrumTagItemData>,
      default: undefined,
    },
    id: {
      type: [String, Number] as PropType<TagKey | undefined>,
      default: undefined,
    },
    tabIndex: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    isFocused: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    allowsRemoving: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    removeButtonLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    onFocus: {
      type: Function as PropType<(() => void) | undefined>,
      default: undefined,
    },
    onKeydown: {
      type: Function as PropType<((event: KeyboardEvent) => void) | undefined>,
      default: undefined,
    },
    onRemove: {
      type: Function as PropType<(() => void) | undefined>,
      default: undefined,
    },
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  setup(props) {
    return () => {
      if (!props.item) {
        return null;
      }

      const disabled = Boolean(props.isDisabled || props.item.isDisabled);
      const removable = Boolean(props.allowsRemoving) && !disabled;

      return h(
        "div",
        {
          role: "row",
          tabindex: props.tabIndex ?? -1,
          "aria-disabled": disabled ? "true" : undefined,
          class: classNames(
            "spectrum-Tag",
            {
              "is-focused": Boolean(props.isFocused),
              "focus-ring": Boolean(props.isFocused),
              "is-disabled": disabled,
              "spectrum-Tag--removable": removable,
            },
            props.UNSAFE_className as ClassValue | undefined
          ),
          onFocus: () => {
            props.onFocus?.();
          },
          onKeydown: (event: KeyboardEvent) => {
            props.onKeydown?.(event);
          },
        },
        [
          h(
            "div",
            {
              role: "gridcell",
              class: classNames("spectrum-Tag-cell"),
              "aria-label": props.item["aria-label"],
            },
            [
              h("span", { class: classNames("spectrum-Tag-content") }, props.item.label),
              removable
                ? h(
                    "button",
                    {
                      type: "button",
                      class: classNames("spectrum-Tag-removeButton"),
                      "aria-label":
                        props.removeButtonLabel ?? `Remove ${props.item.label}`,
                      onClick: (event: MouseEvent) => {
                        event.stopPropagation();
                        props.onRemove?.();
                      },
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
