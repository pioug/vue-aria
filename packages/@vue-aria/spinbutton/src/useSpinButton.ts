import { computed, getCurrentInstance, onBeforeUnmount, ref, toValue } from "vue";
import type { MaybeReactive, PressEvent, ReadonlyRef } from "@vue-aria/types";

export interface UseSpinButtonOptions {
  value?: MaybeReactive<number | undefined>;
  textValue?: MaybeReactive<string | undefined>;
  minValue?: MaybeReactive<number | undefined>;
  maxValue?: MaybeReactive<number | undefined>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  isReadOnly?: MaybeReactive<boolean | undefined>;
  isRequired?: MaybeReactive<boolean | undefined>;
  onIncrement?: () => void;
  onIncrementPage?: () => void;
  onDecrement?: () => void;
  onDecrementPage?: () => void;
  onDecrementToMin?: () => void;
  onIncrementToMax?: () => void;
}

export interface UseSpinButtonResult {
  spinButtonProps: ReadonlyRef<Record<string, unknown>>;
  incrementButtonProps: ReadonlyRef<Record<string, unknown>>;
  decrementButtonProps: ReadonlyRef<Record<string, unknown>>;
}

function getNumber(value: MaybeReactive<number | undefined> | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  const resolved = toValue(value);
  if (typeof resolved !== "number" || Number.isNaN(resolved)) {
    return undefined;
  }
  return resolved;
}

export function useSpinButton(
  options: UseSpinButtonOptions = {}
): UseSpinButtonResult {
  const isFocused = ref(false);
  const isDisabled = computed(() =>
    options.isDisabled === undefined ? false : Boolean(toValue(options.isDisabled))
  );
  const isReadOnly = computed(() =>
    options.isReadOnly === undefined ? false : Boolean(toValue(options.isReadOnly))
  );
  const value = computed(() => getNumber(options.value));
  const minValue = computed(() => getNumber(options.minValue));
  const maxValue = computed(() => getNumber(options.maxValue));
  const repeatTimer = ref<ReturnType<typeof setTimeout> | null>(null);
  const touchPressReleased = ref(false);
  const didRepeatStep = ref(false);

  const textValue = computed(() => {
    const explicit = options.textValue === undefined ? undefined : toValue(options.textValue);
    const resolved = explicit ?? (value.value === undefined ? "" : String(value.value));
    if (resolved === "") {
      return "Empty";
    }
    return resolved.replace("-", "\u2212");
  });

  const onKeydown = (event: KeyboardEvent) => {
    if (
      isDisabled.value ||
      isReadOnly.value ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    switch (event.key) {
      case "PageUp":
        if (options.onIncrementPage) {
          event.preventDefault();
          options.onIncrementPage();
          return;
        }
        if (options.onIncrement) {
          event.preventDefault();
          options.onIncrement();
        }
        return;
      case "ArrowUp":
      case "Up":
        if (options.onIncrement) {
          event.preventDefault();
          options.onIncrement();
        }
        return;
      case "PageDown":
        if (options.onDecrementPage) {
          event.preventDefault();
          options.onDecrementPage();
          return;
        }
        if (options.onDecrement) {
          event.preventDefault();
          options.onDecrement();
        }
        return;
      case "ArrowDown":
      case "Down":
        if (options.onDecrement) {
          event.preventDefault();
          options.onDecrement();
        }
        return;
      case "Home":
        if (options.onDecrementToMin) {
          event.preventDefault();
          options.onDecrementToMin();
        }
        return;
      case "End":
        if (options.onIncrementToMax) {
          event.preventDefault();
          options.onIncrementToMax();
        }
        return;
      default:
        return;
    }
  };

  const onFocus = () => {
    isFocused.value = true;
  };

  const onBlur = () => {
    isFocused.value = false;
  };

  const clearRepeatTimer = () => {
    if (repeatTimer.value !== null) {
      clearTimeout(repeatTimer.value);
      repeatTimer.value = null;
    }
  };

  const canIncrement = () => {
    if (isDisabled.value || isReadOnly.value) {
      return false;
    }

    const current = value.value;
    const max = maxValue.value;
    return max === undefined || current === undefined || current < max;
  };

  const canDecrement = () => {
    if (isDisabled.value || isReadOnly.value) {
      return false;
    }

    const current = value.value;
    const min = minValue.value;
    return min === undefined || current === undefined || current > min;
  };

  const performIncrement = () => {
    if (!canIncrement()) {
      return false;
    }

    options.onIncrement?.();
    return true;
  };

  const performDecrement = () => {
    if (!canDecrement()) {
      return false;
    }

    options.onDecrement?.();
    return true;
  };

  const startRepeat = (direction: "increment" | "decrement", initialDelay: number) => {
    clearRepeatTimer();

    const repeat = () => {
      const stepped =
        direction === "increment" ? performIncrement() : performDecrement();
      if (!stepped) {
        clearRepeatTimer();
        return;
      }

      didRepeatStep.value = true;
      repeatTimer.value = setTimeout(repeat, 60);
    };

    repeatTimer.value = setTimeout(repeat, initialDelay);
  };

  const resetPressState = () => {
    clearRepeatTimer();
    touchPressReleased.value = false;
    didRepeatStep.value = false;
  };

  if (getCurrentInstance()) {
    onBeforeUnmount(() => {
      clearRepeatTimer();
    });
  }

  const onStepperPressStart = (
    event: PressEvent | undefined,
    direction: "increment" | "decrement"
  ) => {
    const pointerType = event?.pointerType ?? "mouse";
    touchPressReleased.value = false;
    didRepeatStep.value = false;
    clearRepeatTimer();

    if (pointerType === "touch") {
      startRepeat(direction, 600);
      return;
    }

    const stepped =
      direction === "increment" ? performIncrement() : performDecrement();
    if (stepped) {
      startRepeat(direction, 400);
    }
  };

  const onStepperPressUp = (event: PressEvent | undefined) => {
    const pointerType = event?.pointerType ?? "mouse";
    if (pointerType === "touch") {
      touchPressReleased.value = true;
    }

    clearRepeatTimer();
  };

  const onStepperPressEnd = (
    event: PressEvent | undefined,
    direction: "increment" | "decrement"
  ) => {
    const pointerType = event?.pointerType ?? "mouse";

    clearRepeatTimer();

    if (
      pointerType === "touch" &&
      touchPressReleased.value &&
      didRepeatStep.value === false
    ) {
      if (direction === "increment") {
        performIncrement();
      } else {
        performDecrement();
      }
    }

    resetPressState();
  };

  const spinButtonProps = computed<Record<string, unknown>>(() => ({
    role: "spinbutton",
    "aria-valuenow": value.value,
    "aria-valuetext": textValue.value,
    "aria-valuemin": minValue.value,
    "aria-valuemax": maxValue.value,
    "aria-disabled": isDisabled.value || undefined,
    "aria-readonly": isReadOnly.value || undefined,
    "aria-required":
      options.isRequired === undefined ? undefined : Boolean(toValue(options.isRequired)),
    onKeydown,
    onFocus,
    onBlur,
  }));

  const incrementButtonProps = computed<Record<string, unknown>>(() => ({
    onPressStart: (event: PressEvent) =>
      onStepperPressStart(event, "increment"),
    onPressUp: (event: PressEvent) => onStepperPressUp(event),
    onPressEnd: (event: PressEvent) => onStepperPressEnd(event, "increment"),
    onFocus,
    onBlur,
  }));

  const decrementButtonProps = computed<Record<string, unknown>>(() => ({
    onPressStart: (event: PressEvent) =>
      onStepperPressStart(event, "decrement"),
    onPressUp: (event: PressEvent) => onStepperPressUp(event),
    onPressEnd: (event: PressEvent) => onStepperPressEnd(event, "decrement"),
    onFocus,
    onBlur,
  }));

  return {
    spinButtonProps,
    incrementButtonProps,
    decrementButtonProps,
  };
}
