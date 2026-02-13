import { announce, clearAnnouncer } from "@vue-aria/live-announcer";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { useEffectEvent, useGlobalListeners } from "@vue-aria/utils";
import { computed, onScopeDispose, ref, watch } from "vue";

const intlMessages = {
  "en-US": {
    Empty: "Empty",
  },
};

const noop = () => {};

export interface SpinButtonProps {
  value?: number;
  textValue?: string;
  minValue?: number;
  maxValue?: number;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  onIncrement?: () => void;
  onIncrementPage?: () => void;
  onDecrement?: () => void;
  onDecrementPage?: () => void;
  onDecrementToMin?: () => void;
  onIncrementToMax?: () => void;
}

export interface PressEvent {
  pointerType: "mouse" | "touch" | "keyboard" | "pen" | "virtual";
  target: HTMLElement;
}

export interface SpinbuttonAria {
  spinButtonProps: Record<string, unknown>;
  incrementButtonProps: Record<string, unknown>;
  decrementButtonProps: Record<string, unknown>;
}

export function useSpinButton(props: SpinButtonProps): SpinbuttonAria {
  const asyncTimer = ref<number | undefined>(undefined);
  const isSpinning = ref(false);
  const isFocused = ref(false);
  const isUp = ref(false);
  const isIncrementPressed = ref<"touch" | "mouse" | null>(null);
  const isDecrementPressed = ref<"touch" | "mouse" | null>(null);

  const stringFormatter = useLocalizedStringFormatter(intlMessages as any, "@react-aria/spinbutton");
  const { addGlobalListener, removeAllGlobalListeners } = useGlobalListeners();

  const clearAsync = () => {
    if (asyncTimer.value !== undefined) {
      clearTimeout(asyncTimer.value);
    }
    isSpinning.value = false;
  };
  const clearAsyncEvent = useEffectEvent(() => {
    clearAsync();
  });

  onScopeDispose(() => {
    clearAsyncEvent();
  });

  const onIncrementEvent = useEffectEvent(props.onIncrement ?? noop);
  const onDecrementEvent = useEffectEvent(props.onDecrement ?? noop);

  const onIncrementPressStartEvent = useEffectEvent((initialStepDelay: number) => {
    clearAsyncEvent();
    isSpinning.value = true;
    asyncTimer.value = window.setTimeout(stepUpEvent, initialStepDelay);
  });

  const onDecrementPressStartEvent = useEffectEvent((initialStepDelay: number) => {
    clearAsyncEvent();
    isSpinning.value = true;
    asyncTimer.value = window.setTimeout(stepDownEvent, initialStepDelay);
  });

  const stepUpEvent = useEffectEvent(() => {
    const { value, maxValue } = props;
    if (
      maxValue === undefined ||
      Number.isNaN(maxValue) ||
      value === undefined ||
      Number.isNaN(value) ||
      value < maxValue
    ) {
      onIncrementEvent();
      onIncrementPressStartEvent(60);
    }
  });

  const stepDownEvent = useEffectEvent(() => {
    const { value, minValue } = props;
    if (
      minValue === undefined ||
      Number.isNaN(minValue) ||
      value === undefined ||
      Number.isNaN(value) ||
      value > minValue
    ) {
      onDecrementEvent();
      onDecrementPressStartEvent(60);
    }
  });

  const onPointerCancel = useEffectEvent(() => {
    clearAsync();
  });

  watch(isIncrementPressed, (value) => {
    if (value === "touch") {
      onIncrementPressStartEvent(600);
    } else if (value) {
      onIncrementPressStartEvent(400);
    }
  });

  watch(isDecrementPressed, (value) => {
    if (value === "touch") {
      onDecrementPressStartEvent(600);
    } else if (value) {
      onDecrementPressStartEvent(400);
    }
  });

  const ariaTextValue = computed(() =>
    props.textValue === ""
      ? stringFormatter.format("Empty")
      : (props.textValue || `${props.value}`).replace("-", "\u2212")
  );

  watch(ariaTextValue, (value) => {
    if (isFocused.value) {
      clearAnnouncer("assertive");
      announce(value, "assertive");
    }
  });

  const onFocus = () => {
    isFocused.value = true;
  };

  const onBlur = () => {
    isFocused.value = false;
  };

  const onKeyDown = (e: KeyboardEvent & { continuePropagation?: () => void; nativeEvent?: { isComposing?: boolean } }) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || props.isReadOnly || e.nativeEvent?.isComposing) {
      return;
    }

    switch (e.key) {
      case "PageUp":
        if (props.onIncrementPage) {
          e.preventDefault();
          props.onIncrementPage();
          return;
        }
      case "ArrowUp":
      case "Up":
        if (props.onIncrement) {
          e.preventDefault();
          props.onIncrement();
          return;
        }
        break;
      case "PageDown":
        if (props.onDecrementPage) {
          e.preventDefault();
          props.onDecrementPage();
          return;
        }
      case "ArrowDown":
      case "Down":
        if (props.onDecrement) {
          e.preventDefault();
          props.onDecrement();
          return;
        }
        break;
      case "Home":
        if (props.onDecrementToMin) {
          e.preventDefault();
          props.onDecrementToMin();
          return;
        }
        break;
      case "End":
        if (props.onIncrementToMax) {
          e.preventDefault();
          props.onIncrementToMax();
          return;
        }
        break;
    }

    e.continuePropagation?.();
  };

  const cancelContextMenu = (e: Event) => {
    e.preventDefault();
  };

  return {
    spinButtonProps: {
      role: "spinbutton",
      "aria-valuenow":
        props.value !== undefined && !Number.isNaN(props.value) ? props.value : undefined,
      "aria-valuetext": ariaTextValue.value,
      "aria-valuemin": props.minValue,
      "aria-valuemax": props.maxValue,
      "aria-disabled": props.isDisabled || undefined,
      "aria-readonly": props.isReadOnly || undefined,
      "aria-required": props.isRequired || undefined,
      onKeyDown,
      onFocus,
      onBlur,
    },
    incrementButtonProps: {
      onPressStart: (e: PressEvent) => {
        clearAsync();
        if (e.pointerType !== "touch") {
          props.onIncrement?.();
          isIncrementPressed.value = "mouse";
        } else {
          addGlobalListener(window, "pointercancel", onPointerCancel as EventListener, { capture: true });
          isUp.value = false;
          isIncrementPressed.value = "touch";
        }
        addGlobalListener(window, "contextmenu", cancelContextMenu as EventListener);
      },
      onPressUp: (e: PressEvent) => {
        clearAsync();
        if (e.pointerType === "touch") {
          isUp.value = true;
        }
        removeAllGlobalListeners();
        isIncrementPressed.value = null;
      },
      onPressEnd: (e: PressEvent) => {
        clearAsync();
        if (e.pointerType === "touch" && !isSpinning.value && isUp.value) {
          props.onIncrement?.();
        }
        isUp.value = false;
        isIncrementPressed.value = null;
      },
      onFocus,
      onBlur,
    },
    decrementButtonProps: {
      onPressStart: (e: PressEvent) => {
        clearAsync();
        if (e.pointerType !== "touch") {
          props.onDecrement?.();
          isDecrementPressed.value = "mouse";
        } else {
          addGlobalListener(window, "pointercancel", onPointerCancel as EventListener, { capture: true });
          isUp.value = false;
          isDecrementPressed.value = "touch";
        }
      },
      onPressUp: (e: PressEvent) => {
        clearAsync();
        if (e.pointerType === "touch") {
          isUp.value = true;
        }
        removeAllGlobalListeners();
        isDecrementPressed.value = null;
      },
      onPressEnd: (e: PressEvent) => {
        clearAsync();
        if (e.pointerType === "touch" && !isSpinning.value && isUp.value) {
          props.onDecrement?.();
        }
        isUp.value = false;
        isDecrementPressed.value = null;
      },
      onFocus,
      onBlur,
    },
  };
}
