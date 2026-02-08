import { computed, ref, toValue, watchEffect } from "vue";
import { useKeyboard, useMove } from "@vue-aria/interactions";
import { useLabel } from "@vue-aria/label";
import { mergeProps } from "@vue-aria/utils";
import { getSliderThumbId, sliderData } from "./utils";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

type Orientation = "horizontal" | "vertical";
type Direction = "ltr" | "rtl";

export interface UseSliderThumbState {
  values: MaybeReactive<readonly number[]>;
  defaultValues?: MaybeReactive<readonly number[] | undefined>;
  orientation?: MaybeReactive<Orientation | undefined>;
  step?: MaybeReactive<number | undefined>;
  pageSize?: MaybeReactive<number | undefined>;
  focusedThumb?: MaybeReactive<number | undefined>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  isThumbDragging: (index: number) => boolean;
  setThumbDragging: (index: number, isDragging: boolean) => void;
  getThumbPercent: (index: number) => number;
  setThumbPercent: (index: number, percent: number) => void;
  setThumbValue: (index: number, value: number) => void;
  getThumbValueLabel: (index: number) => string;
  getThumbMinValue: (index: number) => number;
  getThumbMaxValue: (index: number) => number;
  decrementThumb: (index: number, amount?: number) => void;
  incrementThumb: (index: number, amount?: number) => void;
  setFocusedThumb: (index: number | undefined) => void;
  setThumbEditable?: (index: number, isEditable: boolean) => void;
}

export interface UseSliderThumbOptions {
  index?: MaybeReactive<number | undefined>;
  trackRef: MaybeReactive<Element | null | undefined>;
  inputRef?: MaybeReactive<HTMLInputElement | null | undefined>;
  orientation?: MaybeReactive<Orientation | undefined>;
  direction?: MaybeReactive<Direction | undefined>;
  name?: MaybeReactive<string | undefined>;
  form?: MaybeReactive<string | undefined>;
  label?: MaybeReactive<string | undefined>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  isRequired?: MaybeReactive<boolean | undefined>;
  isInvalid?: MaybeReactive<boolean | undefined>;
  validationState?: MaybeReactive<"valid" | "invalid" | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  "aria-labelledby"?: MaybeReactive<string | undefined>;
  "aria-describedby"?: MaybeReactive<string | undefined>;
  "aria-details"?: MaybeReactive<string | undefined>;
  "aria-errormessage"?: MaybeReactive<string | undefined>;
}

export interface UseSliderThumbResult {
  thumbProps: ReadonlyRef<Record<string, unknown>>;
  inputProps: ReadonlyRef<Record<string, unknown>>;
  labelProps: ReadonlyRef<Record<string, unknown>>;
  isDragging: ReadonlyRef<boolean>;
  isFocused: ReadonlyRef<boolean>;
  isDisabled: ReadonlyRef<boolean>;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }
  return Boolean(toValue(value));
}

function resolveOrientation(
  optionValue: MaybeReactive<Orientation | undefined> | undefined,
  stateValue: MaybeReactive<Orientation | undefined> | undefined
): Orientation {
  if (optionValue !== undefined) {
    return toValue(optionValue) ?? "horizontal";
  }
  if (stateValue !== undefined) {
    return toValue(stateValue) ?? "horizontal";
  }
  return "horizontal";
}

function resolveDirection(value: MaybeReactive<Direction | undefined> | undefined): Direction {
  if (value === undefined) {
    return "ltr";
  }
  return toValue(value) ?? "ltr";
}

export function useSliderThumb(
  options: UseSliderThumbOptions,
  state: UseSliderThumbState
): UseSliderThumbResult {
  const index = computed(() =>
    options.index === undefined ? 0 : (toValue(options.index) ?? 0)
  );
  const orientation = computed(() =>
    resolveOrientation(options.orientation, state.orientation)
  );
  const direction = computed(() => resolveDirection(options.direction));
  const isVertical = computed(() => orientation.value === "vertical");
  const reverseX = computed(() => direction.value === "rtl");
  const isDisabled = computed(
    () => resolveBoolean(options.isDisabled) || resolveBoolean(state.isDisabled)
  );

  watchEffect(() => {
    state.setThumbEditable?.(index.value, !isDisabled.value);
  });

  const data = sliderData.get(state as object);
  if (!data) {
    throw new Error("Unknown slider state");
  }

  const thumbId = computed(() => getSliderThumbId(state as object, index.value));
  const labelledBy = computed(() => {
    const additional =
      options["aria-labelledby"] === undefined
        ? ""
        : (toValue(options["aria-labelledby"]) ?? "");
    return `${data.id} ${additional}`.trim();
  });

  const { labelProps, fieldProps } = useLabel({
    id: thumbId,
    label: options.label,
    "aria-label": options["aria-label"],
    "aria-labelledby": labelledBy,
  });

  const focusInput = () => {
    const input = options.inputRef === undefined ? undefined : toValue(options.inputRef);
    input?.focus();
  };

  const isFocused = computed(
    () => toValue(state.focusedThumb) === index.value
  );
  const isDragging = computed(() => state.isThumbDragging(index.value));

  watchEffect(() => {
    if (isFocused.value) {
      focusInput();
    }
  });

  const currentPosition = ref<number | null>(null);
  const currentPointer = ref<number | undefined>(undefined);

  const { keyboardProps } = useKeyboard({
    isDisabled,
    onKeydown: (event) => {
      if (!/^(PageUp|PageDown|Home|End)$/.test(event.key)) {
        event.continuePropagation?.();
        return;
      }

      event.preventDefault();
      state.setThumbDragging(index.value, true);
      const pageSize = toValue(state.pageSize) ?? 10;

      switch (event.key) {
        case "PageUp":
          state.incrementThumb(index.value, pageSize);
          break;
        case "PageDown":
          state.decrementThumb(index.value, pageSize);
          break;
        case "Home":
          state.setThumbValue(index.value, state.getThumbMinValue(index.value));
          break;
        case "End":
          state.setThumbValue(index.value, state.getThumbMaxValue(index.value));
          break;
      }

      state.setThumbDragging(index.value, false);
    },
  });

  const { moveProps } = useMove({
    onMoveStart: () => {
      currentPosition.value = null;
      state.setThumbDragging(index.value, true);
    },
    onMove: ({ deltaX = 0, deltaY = 0, pointerType, shiftKey }) => {
      const trackElement = toValue(options.trackRef);
      if (!trackElement) {
        return;
      }

      const rect = trackElement.getBoundingClientRect();
      const size = isVertical.value ? rect.height : rect.width;
      if (size <= 0) {
        return;
      }

      if (currentPosition.value === null) {
        currentPosition.value = state.getThumbPercent(index.value) * size;
      }

      if (pointerType === "keyboard") {
        const step = toValue(state.step) ?? 1;
        const pageSize = toValue(state.pageSize) ?? step * 10;
        if ((deltaX > 0 && reverseX.value) || (deltaX < 0 && !reverseX.value) || deltaY > 0) {
          state.decrementThumb(index.value, shiftKey ? pageSize : step);
        } else {
          state.incrementThumb(index.value, shiftKey ? pageSize : step);
        }
      } else {
        let delta = isVertical.value ? deltaY : deltaX;
        if (isVertical.value || reverseX.value) {
          delta = -delta;
        }
        currentPosition.value += delta;
        state.setThumbPercent(index.value, clamp(currentPosition.value / size, 0, 1));
      }
    },
    onMoveEnd: () => {
      state.setThumbDragging(index.value, false);
    },
  });

  const onDown = (pointerId?: number) => {
    focusInput();
    currentPointer.value = pointerId;
    state.setThumbDragging(index.value, true);
  };

  const onUp = (pointerId?: number | null) => {
    if (
      currentPointer.value !== undefined &&
      pointerId !== currentPointer.value
    ) {
      return;
    }
    focusInput();
    state.setThumbDragging(index.value, false);
  };

  const thumbPosition = computed(() => {
    let position = state.getThumbPercent(index.value);
    if (isVertical.value || reverseX.value) {
      position = 1 - position;
    }
    return position;
  });

  const thumbProps = computed<Record<string, unknown>>(() => {
    if (isDisabled.value) {
      return {
        style: {
          position: "absolute",
          [isVertical.value ? "top" : "left"]: `${thumbPosition.value * 100}%`,
          transform: "translate(-50%, -50%)",
          touchAction: "none",
        },
      };
    }

    return mergeProps(moveProps, {
      onMousedown: (event: MouseEvent) => {
        if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey) {
          return;
        }
        onDown();
      },
      onPointerdown: (event: PointerEvent) => {
        if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey) {
          return;
        }
        onDown(event.pointerId);
      },
      onPointerup: (event: PointerEvent) => onUp(event.pointerId),
      onPointercancel: (event: PointerEvent) => onUp(event.pointerId),
      onMouseup: () => onUp(undefined),
      onTouchstart: (event: TouchEvent) => onDown(event.changedTouches[0]?.identifier),
      onTouchend: (event: TouchEvent) => onUp(event.changedTouches[0]?.identifier),
      style: {
        position: "absolute",
        [isVertical.value ? "top" : "left"]: `${thumbPosition.value * 100}%`,
        transform: "translate(-50%, -50%)",
        touchAction: "none",
      },
    });
  });

  const inputProps = computed<Record<string, unknown>>(() => {
    const values = toValue(state.values);
    const value = values[index.value];

    return mergeProps(keyboardProps, fieldProps.value, {
      type: "range",
      tabIndex: !isDisabled.value ? 0 : undefined,
      min: state.getThumbMinValue(index.value),
      max: state.getThumbMaxValue(index.value),
      step: toValue(state.step) ?? 1,
      value,
      name: options.name === undefined ? undefined : toValue(options.name),
      form: options.form === undefined ? undefined : toValue(options.form),
      disabled: isDisabled.value,
      "aria-orientation": orientation.value,
      "aria-valuetext": state.getThumbValueLabel(index.value),
      "aria-required": resolveBoolean(options.isRequired) || undefined,
      "aria-invalid":
        resolveBoolean(options.isInvalid) ||
        toValue(options.validationState) === "invalid" ||
        undefined,
      "aria-errormessage":
        options["aria-errormessage"] === undefined
          ? undefined
          : toValue(options["aria-errormessage"]),
      "aria-describedby": [
        data["aria-describedby"],
        options["aria-describedby"] === undefined
          ? undefined
          : toValue(options["aria-describedby"]),
      ]
        .filter(Boolean)
        .join(" "),
      "aria-details": [
        data["aria-details"],
        options["aria-details"] === undefined ? undefined : toValue(options["aria-details"]),
      ]
        .filter(Boolean)
        .join(" "),
      onFocus: () => state.setFocusedThumb(index.value),
      onBlur: () => state.setFocusedThumb(undefined),
      onChange: (event: Event) => {
        const target = event.target as HTMLInputElement | null;
        state.setThumbValue(index.value, Number(target?.value ?? 0));
      },
    });
  });

  return {
    thumbProps,
    inputProps,
    labelProps,
    isDragging,
    isFocused,
    isDisabled,
  };
}
