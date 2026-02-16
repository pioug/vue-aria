import { CalendarDate, Time, createCalendar } from "@internationalized/date";
import { effectScope, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import {
  useDateFieldState,
  useDatePickerState,
  useDateRangePickerState,
  useTimeFieldState,
} from "@vue-stately/datepicker";
import { useDateField, useTimeField } from "../src/useDateField";
import { useDatePicker } from "../src/useDatePicker";
import { useDateRangePicker } from "../src/useDateRangePicker";

describe("useDatePicker", () => {
  it("commits a programmatically set value when the field starts empty", () => {
    const scope = effectScope();
    let pickerState!: ReturnType<typeof useDatePickerState>;
    let aria!: ReturnType<typeof useDatePicker>;

    scope.run(() => {
      pickerState = useDatePickerState({});
      aria = useDatePicker(
        {
          "aria-label": "Date",
        },
        pickerState,
        { current: document.createElement("div") }
      );
    });

    expect((aria.fieldProps as any).value).toBeNull();
    (aria.fieldProps as any).onChange(new CalendarDate(2020, 1, 20));
    expect(pickerState.value?.toString()).toBe("2020-01-20");
    scope.stop();
  });

  it("ignores blur callbacks when focus moves into the dialog", () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const onFocusChange = vi.fn();
    const scope = effectScope();
    let aria!: ReturnType<typeof useDatePicker>;

    const group = document.createElement("div");
    const segment = document.createElement("button");
    group.append(segment);
    document.body.append(group);

    scope.run(() => {
      const pickerState = useDatePickerState({});
      aria = useDatePicker(
        {
          "aria-label": "Date",
          onFocus,
          onBlur,
          onFocusChange,
        },
        pickerState,
        { current: group }
      );
    });

    const dialog = document.createElement("div");
    dialog.id = aria.dialogProps.id as string;
    const dialogTarget = document.createElement("button");
    dialog.append(dialogTarget);
    document.body.append(dialog);

    (aria.groupProps as any).onFocus({
      currentTarget: group,
      target: segment,
      relatedTarget: null,
    });
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onFocusChange).toHaveBeenCalledWith(true);

    (aria.groupProps as any).onBlur({
      currentTarget: group,
      target: segment,
      relatedTarget: dialogTarget,
    });
    expect(onBlur).not.toHaveBeenCalled();
    expect(onFocusChange).not.toHaveBeenCalledWith(false);

    (aria.groupProps as any).onFocus({
      currentTarget: group,
      target: segment,
      relatedTarget: dialogTarget,
    });

    (aria.groupProps as any).onBlur({
      currentTarget: group,
      target: segment,
      relatedTarget: document.body,
    });
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(onFocusChange).toHaveBeenCalledWith(false);

    dialog.remove();
    group.remove();
    scope.stop();
  });
});

describe("useDateRangePicker", () => {
  it("updates start and end values through field props", () => {
    const scope = effectScope();
    let rangeState!: ReturnType<typeof useDateRangePickerState>;
    let aria!: ReturnType<typeof useDateRangePicker>;

    scope.run(() => {
      rangeState = useDateRangePickerState({});
      aria = useDateRangePicker(
        {
          "aria-label": "Range",
        },
        rangeState,
        { current: document.createElement("div") }
      );
    });

    (aria.startFieldProps as any).onChange(new CalendarDate(2024, 5, 1));
    (aria.endFieldProps as any).onChange(new CalendarDate(2024, 5, 8));

    expect(rangeState.value.start?.toString()).toBe("2024-05-01");
    expect(rangeState.value.end?.toString()).toBe("2024-05-08");
    scope.stop();
  });
});

describe("useDateField/useTimeField", () => {
  it("switches hidden input behavior for native validation mode", () => {
    const scope = effectScope();
    let aria!: ReturnType<typeof useDateField>;

    scope.run(() => {
      const fieldState = useDateFieldState({
        locale: "en-US",
        createCalendar,
      });

      aria = useDateField(
        {
          "aria-label": "Date",
          validationBehavior: "native",
          isRequired: true,
          inputRef: ref(document.createElement("input")),
        },
        fieldState,
        { current: document.createElement("div") }
      );
    });

    expect(aria.inputProps.type).toBe("text");
    expect(aria.inputProps.hidden).toBe(true);
    expect(aria.inputProps.required).toBe(true);
    scope.stop();
  });

  it("serializes time field hidden input from timeValue", () => {
    const scope = effectScope();
    let aria!: ReturnType<typeof useTimeField>;

    scope.run(() => {
      const fieldState = useTimeFieldState({
        locale: "en-US",
        defaultValue: new Time(9, 15),
      });

      aria = useTimeField(
        {
          "aria-label": "Time",
          inputRef: ref(document.createElement("input")),
        },
        fieldState,
        { current: document.createElement("div") }
      );
    });

    expect(aria.inputProps.value).toBe("09:15:00");
    scope.stop();
  });
});
