import { computed, defineComponent, h, ref, type PropType } from "vue";
import { useCalendarCell } from "@vue-aria/calendar";
import type {
  DateValue,
  UseCalendarStateResult,
  UseRangeCalendarStateResult,
} from "@vue-aria/calendar-state";
import { mergeProps } from "@vue-aria/utils";
import { classNames } from "@vue-spectrum/utils";

export const CalendarCell = defineComponent({
  name: "CalendarCell",
  props: {
    date: {
      type: Object as PropType<DateValue>,
      required: true,
    },
    state: {
      type: Object as PropType<UseCalendarStateResult | UseRangeCalendarStateResult>,
      required: true,
    },
  },
  setup(props) {
    const cellRef = ref<HTMLButtonElement | null>(null);

    const cell = useCalendarCell(
      {
        date: props.date as unknown as Parameters<typeof useCalendarCell>[0]["date"],
      },
      props.state as unknown as Parameters<typeof useCalendarCell>[1],
      cellRef
    );

    const cellClassName = computed(() =>
      classNames("react-spectrum-CalendarCell", {
        "is-selected": cell.isSelected.value,
        "is-focused": cell.isFocused.value,
        "is-disabled": cell.isDisabled.value,
        "is-unavailable": cell.isUnavailable.value,
        "is-invalid": cell.isInvalid.value,
      })
    );

    return () =>
      h(
        "td",
        mergeProps(cell.cellProps.value, {
          class: cellClassName.value,
        }),
        [
          h(
            "button",
            mergeProps(cell.buttonProps.value, {
              ref: (value: unknown) => {
                cellRef.value = value as HTMLButtonElement | null;
              },
              type: "button",
              class: classNames("react-spectrum-CalendarCell-button"),
            }),
            cell.formattedDate.value
          ),
        ]
      );
  },
});
