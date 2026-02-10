import {
  defineComponent,
  Fragment,
  h,
  type PropType,
} from "vue";
import { mergeProps } from "@vue-aria/utils";
import { useListBoxSection, type UseListBoxStateResult } from "@vue-aria/listbox";
import { classNames } from "@vue-spectrum/utils";
import { ListBoxOption } from "./ListBoxOption";
import type {
  NormalizedListBoxItemData,
  NormalizedListBoxSectionData,
} from "./types";

export interface SpectrumListBoxSectionProps {
  section: NormalizedListBoxSectionData;
  state: UseListBoxStateResult<NormalizedListBoxItemData>;
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
      required: true,
    },
    state: {
      type: Object as PropType<UseListBoxStateResult<NormalizedListBoxItemData>>,
      required: true,
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
    const sectionState = useListBoxSection({
      heading: () => props.section.heading,
      "aria-label": () => props.section["aria-label"],
    });

    return () => {
      const optionNodes = props.section.items.map((item) =>
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
            sectionKey: props.section.key,
          },
          state: props.state,
          shouldSelectOnPressUp: props.shouldSelectOnPressUp,
          shouldFocusOnHover: props.shouldFocusOnHover,
          shouldUseVirtualFocus: props.shouldUseVirtualFocus,
        })
      );

      if (props.section.implicit) {
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
          props.section.heading
            ? h(
              "div",
              mergeProps(sectionState.headingProps.value, {
                class: classNames("spectrum-Menu-sectionHeading"),
              }),
              props.section.heading
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
