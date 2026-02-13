import { useLocale } from "@vue-aria/i18n";
import { useLabel } from "@vue-aria/label";
import { useFocusable, useKeyboard, useMove } from "@vue-aria/interactions";
import {
  clamp,
  focusWithoutScrolling,
  mergeProps,
  useFormReset,
  useGlobalListeners,
} from "@vue-aria/utils";
import { computed, toRaw, watchEffect, type Ref } from "vue";
import { getSliderData, getSliderThumbId } from "./utils";

export interface SliderThumbState {
  values: number[];
  defaultValues: number[];
  orientation: "horizontal" | "vertical";
  step: number;
  pageSize: number;
  isDisabled?: boolean;
  focusedThumb?: number;
  isThumbDragging: (index: number) => boolean;
  setThumbDragging: (index: number, isDragging: boolean) => void;
  setThumbPercent: (index: number, percent: number) => void;
  getThumbPercent: (index: number) => number;
  setThumbValue: (index: number, value: number) => void;
  getThumbMinValue: (index: number) => number;
  getThumbMaxValue: (index: number) => number;
  getThumbValueLabel: (index: number) => string;
  decrementThumb: (index: number, amount?: number) => void;
  incrementThumb: (index: number, amount?: number) => void;
  setFocusedThumb: (index?: number) => void;
  setThumbEditable: (index: number, editable: boolean) => void;
}

export interface AriaSliderThumbOptions {
  index?: number;
  isRequired?: boolean;
  validationState?: "valid" | "invalid";
  isInvalid?: boolean;
  isDisabled?: boolean;
  orientation?: "horizontal" | "vertical";
  name?: string;
  form?: string;
  label?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-details"?: string;
  "aria-errormessage"?: string;
  trackRef: { current: Element | null };
  inputRef: Ref<HTMLInputElement | null>;
}

export interface SliderThumbAria {
  thumbProps: Record<string, unknown>;
  inputProps: Record<string, unknown>;
  labelProps: Record<string, unknown>;
  isDragging: boolean;
  isFocused: boolean;
  isDisabled: boolean;
}

export function useSliderThumb(
  options: AriaSliderThumbOptions,
  state: SliderThumbState
): SliderThumbAria {
  const index = options.index ?? 0;
  const orientation = options.orientation ?? state.orientation;
  const isDisabled = Boolean(options.isDisabled || state.isDisabled);
  const isVertical = orientation === "vertical";
  const locale = useLocale();
  const reverseX = locale.value.direction === "rtl";
  const { addGlobalListener, removeGlobalListener } = useGlobalListeners();

  const stateObject = (toRaw(state as object) as object) ?? (state as object);
  const data = getSliderData(stateObject);
  if (!data) {
    throw new Error("Unknown slider state");
  }

  const thumbId = getSliderThumbId(stateObject, index);
  const { labelProps, fieldProps } = useLabel({
    ...options,
    id: thumbId,
    "aria-labelledby": `${data.id} ${options["aria-labelledby"] ?? ""}`.trim(),
  });

  const focusInput = () => {
    if (options.inputRef.value) {
      focusWithoutScrolling(options.inputRef.value);
    }
  };

  watchEffect(() => {
    if (state.focusedThumb === index) {
      focusInput();
    }
  });

  let currentPosition: number | null = null;
  const { keyboardProps } = useKeyboard({
    onKeyDown(event) {
      const key = (event as unknown as KeyboardEvent).key;
      if (!/^(PageUp|PageDown|Home|End)$/.test(key)) {
        event.continuePropagation();
        return;
      }

      event.preventDefault();
      state.setThumbDragging(index, true);
      switch (key) {
        case "PageUp":
          state.incrementThumb(index, state.pageSize);
          break;
        case "PageDown":
          state.decrementThumb(index, state.pageSize);
          break;
        case "Home":
          state.setThumbValue(index, state.getThumbMinValue(index));
          break;
        case "End":
          state.setThumbValue(index, state.getThumbMaxValue(index));
          break;
      }
      state.setThumbDragging(index, false);
    },
  });

  const { moveProps } = useMove({
    onMoveStart() {
      currentPosition = null;
      state.setThumbDragging(index, true);
    },
    onMove({ deltaX, deltaY, pointerType, shiftKey }) {
      if (!options.trackRef.current) {
        return;
      }

      const { width, height } = options.trackRef.current.getBoundingClientRect();
      const size = isVertical ? height : width;

      if (currentPosition == null) {
        currentPosition = state.getThumbPercent(index) * size;
      }

      if (pointerType === "keyboard") {
        if ((deltaX > 0 && reverseX) || (deltaX < 0 && !reverseX) || deltaY > 0) {
          state.decrementThumb(index, shiftKey ? state.pageSize : state.step);
        } else {
          state.incrementThumb(index, shiftKey ? state.pageSize : state.step);
        }
      } else {
        let delta = isVertical ? deltaY : deltaX;
        if (isVertical || reverseX) {
          delta = -delta;
        }

        currentPosition += delta;
        state.setThumbPercent(index, clamp(currentPosition / size, 0, 1));
      }
    },
    onMoveEnd() {
      state.setThumbDragging(index, false);
    },
  });

  state.setThumbEditable(index, !isDisabled);

  const { focusableProps } = useFocusable(
    mergeProps(options as unknown as Record<string, unknown>, {
      onFocus: () => state.setFocusedThumb(index),
      onBlur: () => state.setFocusedThumb(undefined),
    }),
    options.inputRef as Ref<Element | null>
  );

  let currentPointer: number | undefined;
  const onDown = (id?: number) => {
    focusInput();
    currentPointer = id;
    state.setThumbDragging(index, true);

    addGlobalListener(window, "mouseup", onUp as EventListener, false);
    addGlobalListener(window, "touchend", onUp as EventListener, false);
    addGlobalListener(window, "pointerup", onUp as EventListener, false);
  };

  const onUp = (event: any) => {
    const id = event.pointerId ?? event.changedTouches?.[0]?.identifier;
    if (id === currentPointer) {
      focusInput();
      state.setThumbDragging(index, false);
      removeGlobalListener(window, "mouseup", onUp as EventListener, false);
      removeGlobalListener(window, "touchend", onUp as EventListener, false);
      removeGlobalListener(window, "pointerup", onUp as EventListener, false);
    }
  };

  let thumbPosition = state.getThumbPercent(index);
  if (isVertical || reverseX) {
    thumbPosition = 1 - thumbPosition;
  }

  const interactions = !isDisabled
    ? mergeProps(keyboardProps, moveProps, {
        onMousedown(event: MouseEvent) {
          if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey) {
            return;
          }
          onDown();
        },
        onPointerdown(event: PointerEvent) {
          if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey) {
            return;
          }
          onDown(event.pointerId);
        },
        onTouchstart(event: TouchEvent) {
          onDown(event.changedTouches[0]?.identifier);
        },
      })
    : {};

  useFormReset(options.inputRef, state.defaultValues[index], (value) => {
    state.setThumbValue(index, value);
  });

  const isFocused = computed(() => state.focusedThumb === index);

  return {
    inputProps: mergeProps(focusableProps, fieldProps, {
      type: "range",
      tabIndex: !isDisabled ? 0 : undefined,
      min: state.getThumbMinValue(index),
      max: state.getThumbMaxValue(index),
      step: state.step,
      value: state.values[index],
      name: options.name,
      form: options.form,
      disabled: isDisabled,
      "aria-orientation": orientation,
      "aria-valuetext": state.getThumbValueLabel(index),
      "aria-required": options.isRequired || undefined,
      "aria-invalid": options.isInvalid || options.validationState === "invalid" || undefined,
      "aria-errormessage": options["aria-errormessage"],
      "aria-describedby": [data["aria-describedby"], options["aria-describedby"]]
        .filter(Boolean)
        .join(" "),
      "aria-details": [data["aria-details"], options["aria-details"]].filter(Boolean).join(" "),
      onChange: (event: Event) => {
        const target = event.target as HTMLInputElement;
        state.setThumbValue(index, Number.parseFloat(target.value));
      },
    }),
    thumbProps: {
      ...interactions,
      style: {
        position: "absolute",
        [isVertical ? "top" : "left"]: `${thumbPosition * 100}%`,
        transform: "translate(-50%, -50%)",
        touchAction: "none",
      },
    },
    labelProps,
    isDragging: state.isThumbDragging(index),
    isDisabled,
    isFocused: isFocused.value,
  };
}
