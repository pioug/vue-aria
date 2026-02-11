import {
  defineComponent,
  Fragment,
  h,
  type PropType,
} from "vue";
import { mergeProps } from "@vue-aria/utils";
import { useListBoxSection, type UseListBoxStateResult } from "@vue-aria/listbox";
import type { Key } from "@vue-aria/types";
import { classNames } from "@vue-spectrum/utils";
import { ListBoxOption } from "./ListBoxOption";
import type {
  NormalizedListBoxItemData,
  NormalizedListBoxSectionData,
} from "./types";

export interface SpectrumListBoxSectionProps {
  section?: NormalizedListBoxSectionData | undefined;
  state?: UseListBoxStateResult<NormalizedListBoxItemData> | undefined;
  id?: Key | undefined;
  heading?: string | undefined;
  "aria-label"?: string | undefined;
  isFirst?: boolean | undefined;
  shouldSelectOnPressUp?: boolean | undefined;
  shouldFocusOnHover?: boolean | undefined;
  shouldUseVirtualFocus?: boolean | undefined;
}

export const ListBoxSection = defineComponent({
  name: "ListBoxSection",
  props: {
    section: {
      type: Object as PropType<NormalizedListBoxSectionData>,
      default: undefined,
    },
    state: {
      type: Object as PropType<UseListBoxStateResult<NormalizedListBoxItemData>>,
      default: undefined,
    },
    id: {
      type: [String, Number] as PropType<Key | undefined>,
      default: undefined,
    },
    heading: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-label": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    isFirst: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    shouldSelectOnPressUp: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    shouldFocusOnHover: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    shouldUseVirtualFocus: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
  },
  setup(props) {
    if (!props.section || !props.state) {
      return () => null;
    }

    const sectionState = useListBoxSection({
      heading: () => props.section!.heading,
      "aria-label": () => props.section!["aria-label"],
    });

    return () => {
      const optionNodes = props.section!.items.map((item) =>
        h(ListBoxOption, {
          key: String(item.key),
          item: {
            key: item.key,
            label: item.label,
            description: item.description,
            textValue: item.textValue ?? item.label,
            isDisabled: item.isDisabled,
            href: item.href,
            "aria-label": item["aria-label"],
            sectionKey: props.section!.key,
          },
          state: props.state!,
          shouldSelectOnPressUp: props.shouldSelectOnPressUp,
          shouldFocusOnHover: props.shouldFocusOnHover,
          shouldUseVirtualFocus: props.shouldUseVirtualFocus,
        })
      );

      if (props.section!.implicit) {
        return h(Fragment, null, optionNodes);
      }

      return h(
        "div",
        mergeProps(sectionState.itemProps.value, {
          class: classNames("spectrum-Menu-section"),
        }),
        [
          props.isFirst
            ? null
            : h("div", {
              role: "presentation",
              class: classNames("spectrum-Menu-divider"),
            }),
          props.section!.heading
            ? h(
              "div",
              mergeProps(sectionState.headingProps.value, {
                class: classNames("spectrum-Menu-sectionHeading"),
              }),
              props.section!.heading
            )
            : null,
          h(
            "div",
            mergeProps(sectionState.groupProps.value, {
              class: classNames("spectrum-Menu"),
            }),
            optionNodes
          ),
        ]
      );
    };
  },
});
