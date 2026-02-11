import { computed, defineComponent, h, type PropType } from "vue";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { useId } from "@vue-aria/ssr";
import { VisuallyHidden } from "@vue-aria/visually-hidden";
import { classNames, type ClassValue } from "@vue-spectrum/utils";
import {
  type StepKey,
  useStepListContext,
  type SpectrumStepListItemData,
} from "./StepListContext";
import { stepListMessages } from "./intlMessages";

export interface SpectrumStepListItemProps {
  id?: StepKey | undefined;
  isDisabled?: boolean | undefined;
}

export const StepListItem = defineComponent({
  name: "StepListItem",
  props: {
    item: {
      type: Object as PropType<SpectrumStepListItemData>,
      default: undefined,
    },
    id: {
      type: [String, Number] as PropType<StepKey | undefined>,
      default: undefined,
    },
    isEmphasized: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
  },
  setup(props) {
    if (!props.item) {
      return () => null;
    }

    const state = useStepListContext();
    const stringFormatter = useLocalizedStringFormatter(stepListMessages);

    const markerId = useId(undefined, "v-spectrum-step-marker");
    const labelId = useId(undefined, "v-spectrum-step-label");

    const isSelected = computed(
      () => state.selectedKey.value === props.item?.key
    );
    const isCompleted = computed(() => state.isCompleted(props.item!.key));
    const isSelectable = computed(() => state.isSelectable(props.item!.key));
    const isItemDisabled = computed(
      () =>
        !isSelectable.value ||
        state.isDisabled.value ||
        state.isReadOnly.value ||
        Boolean(props.isDisabled)
    );

    const stateText = computed(() => {
      if (isSelected.value) {
        return stringFormatter.value.format("current");
      }

      if (isCompleted.value) {
        return stringFormatter.value.format("completed");
      }

      return stringFormatter.value.format("notCompleted");
    });

    const onSelect = () => {
      if (!isSelectable.value) {
        return;
      }

      state.selectStep(props.item!.key);
    };

    return () =>
      h("li", { class: classNames("spectrum-Steplist-item") }, [
        h(
          "a",
          {
            href: "#",
            "aria-labelledby": `${markerId.value} ${labelId.value}`,
            "aria-current": isSelected.value ? "step" : undefined,
            "aria-disabled": isItemDisabled.value ? "true" : undefined,
            tabindex: isSelected.value ? 0 : undefined,
            class: classNames(
              "spectrum-Steplist-link",
              {
                "is-selected": isSelected.value && !isItemDisabled.value,
                "is-disabled": isItemDisabled.value,
                "is-completed": isCompleted.value,
                "is-selectable": isSelectable.value && !isSelected.value,
                "spectrum-Steplist-link--emphasized": Boolean(props.isEmphasized),
              },
              (isSelected.value ? "focus-ring" : undefined) as ClassValue | undefined
            ),
            onClick: (event: MouseEvent) => {
              event.preventDefault();
              onSelect();
            },
            onKeydown: (event: KeyboardEvent) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect();
              }
            },
          },
          [
            h(VisuallyHidden as any, null, {
              default: () => stateText.value,
            }),
            h(
              "div",
              {
                id: labelId.value,
                "aria-hidden": "true",
                class: classNames("spectrum-Steplist-label"),
              },
              props.item!.label
            ),
            h(
              "div",
              {
                "aria-hidden": "true",
                class: classNames("spectrum-Steplist-markerWrapper"),
              },
              [
                h(
                  "div",
                  {
                    id: markerId.value,
                    class: classNames("spectrum-Steplist-marker"),
                  },
                  String(state.getItemIndex(props.item!.key) + 1)
                ),
              ]
            ),
          ]
        ),
      ]);
  },
});
