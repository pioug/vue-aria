import { computed, ref, toValue } from "vue";
import { useSpinButton } from "@vue-aria/spinbutton";
import { mergeProps } from "@vue-aria/utils";
import { useId } from "@vue-aria/ssr";
import { hookData } from "./useDateField";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { DateFieldSegment, UseDateSegmentState } from "./types";

export interface UseDateSegmentResult {
  segmentProps: ReadonlyRef<Record<string, unknown>>;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }
  return Boolean(toValue(value));
}

function isNumericSegment(type: string): boolean {
  return ["day", "hour", "minute", "second", "month", "year"].includes(type);
}

function normalizeSegmentValue(value: string | number): number | string {
  if (typeof value === "number") {
    return value;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
}

export function useDateSegment(
  segment: DateFieldSegment,
  state: UseDateSegmentState,
  segmentRef?: MaybeReactive<HTMLElement | null | undefined>
): UseDateSegmentResult {
  if (segment.type === "literal") {
    return {
      segmentProps: computed(() => ({
        "aria-hidden": true,
      })),
    };
  }

  const data = hookData.get(state as object);
  const focusManager = data?.focusManager;
  const enteredKeys = ref("");

  const isDisabled = computed(() => resolveBoolean(state.isDisabled));
  const isReadOnly = computed(() => resolveBoolean(state.isReadOnly));
  const isRequired = computed(() => resolveBoolean(state.isRequired));
  const isInvalid = computed(() => {
    const explicitInvalid = resolveBoolean(state.isInvalid);
    const validationState =
      state.validationState === undefined
        ? undefined
        : toValue(state.validationState);
    return explicitInvalid || validationState === "invalid";
  });
  const segmentIsEditable = computed(
    () => segment.isEditable !== false && !isDisabled.value && !isReadOnly.value
  );

  const { spinButtonProps } = useSpinButton({
    value: typeof segment.value === "number" ? segment.value : undefined,
    textValue: segment.isPlaceholder ? "" : segment.text,
    minValue: segment.minValue,
    maxValue: segment.maxValue,
    isDisabled,
    isReadOnly: computed(() => isReadOnly.value || segment.isEditable === false),
    isRequired,
    onIncrement: () => {
      enteredKeys.value = "";
      state.increment(segment.type);
    },
    onDecrement: () => {
      enteredKeys.value = "";
      state.decrement(segment.type);
    },
    onIncrementPage: () => {
      enteredKeys.value = "";
      state.incrementPage(segment.type);
    },
    onDecrementPage: () => {
      enteredKeys.value = "";
      state.decrementPage(segment.type);
    },
    onIncrementToMax: () => {
      enteredKeys.value = "";
      state.incrementToMax(segment.type);
    },
    onDecrementToMin: () => {
      enteredKeys.value = "";
      state.decrementToMin(segment.type);
    },
  });

  const backspace = () => {
    if (segment.text === segment.placeholder) {
      focusManager?.focusPrevious();
    }

    if (isReadOnly.value) {
      return;
    }

    if (isNumericSegment(segment.type) && !segment.isPlaceholder) {
      const nextValue = segment.text.slice(0, -1);
      if (nextValue.length === 0) {
        state.clearSegment(segment.type);
        enteredKeys.value = "";
        return;
      }

      const parsed = Number(nextValue);
      if (Number.isNaN(parsed) || parsed === 0) {
        state.clearSegment(segment.type);
        enteredKeys.value = "";
        return;
      }

      state.setSegment(segment.type, parsed);
      enteredKeys.value = nextValue;
      return;
    }

    if (segment.type === "dayPeriod" || segment.type === "era") {
      state.clearSegment(segment.type);
      enteredKeys.value = "";
    }
  };

  const onInput = (key: string) => {
    if (!segmentIsEditable.value) {
      return;
    }

    if (segment.type === "dayPeriod") {
      const lower = key.toLowerCase();
      if (lower.startsWith("a")) {
        state.setSegment("dayPeriod", 0);
        focusManager?.focusNext();
      } else if (lower.startsWith("p")) {
        state.setSegment("dayPeriod", 1);
        focusManager?.focusNext();
      }
      return;
    }

    if (segment.type === "era") {
      state.setSegment("era", key);
      focusManager?.focusNext();
      return;
    }

    if (!isNumericSegment(segment.type)) {
      return;
    }

    if (!/^\d$/.test(key)) {
      return;
    }

    const newValue = enteredKeys.value + key;
    if (!/^\d+$/.test(newValue)) {
      return;
    }

    let parsed = Number(newValue);
    if (Number.isNaN(parsed)) {
      return;
    }

    if (segment.maxValue !== undefined && parsed > segment.maxValue) {
      parsed = Number(key);
    }

    state.setSegment(segment.type, parsed);

    const maxDigits =
      segment.maxValue !== undefined ? String(segment.maxValue).length : 2;
    if (
      segment.maxValue !== undefined &&
      (Number(newValue + "0") > segment.maxValue || newValue.length >= maxDigits)
    ) {
      enteredKeys.value = "";
      focusManager?.focusNext();
      return;
    }

    enteredKeys.value = newValue;
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return;
    }

    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      event.stopPropagation();
      backspace();
    }
  };

  const onFocus = () => {
    enteredKeys.value = "";
    const element = segmentRef === undefined ? undefined : toValue(segmentRef);
    const selection = window.getSelection();
    if (element && selection) {
      selection.collapse(element);
    }
  };

  const editableSegments = computed(() =>
    toValue(state.segments).filter((item) => item.type !== "literal" && item.isEditable !== false)
  );
  const firstEditableSegment = computed(() => editableSegments.value[0]);

  const ariaDescribedBy = computed(() => {
    if (!isInvalid.value && firstEditableSegment.value !== segment) {
      return undefined;
    }
    return data?.ariaDescribedBy;
  });

  const id = useId(undefined, "v-aria-segment");
  const name = segment.type;
  const ariaLabel = `${name}${data?.ariaLabel ? `, ${data.ariaLabel}` : ""}${
    data?.ariaLabelledBy ? ", " : ""
  }`;

  const segmentStyle = {
    caretColor: "transparent",
  };

  const segmentProps = computed<Record<string, unknown>>(() =>
    mergeProps(spinButtonProps.value, {
      id: id.value,
      "aria-label": ariaLabel,
      "aria-labelledby": data?.ariaLabelledBy,
      "aria-invalid": isInvalid.value ? "true" : undefined,
      "aria-describedby": ariaDescribedBy.value,
      "aria-readonly": isReadOnly.value || segment.isEditable === false ? "true" : undefined,
      "data-placeholder": segment.isPlaceholder || undefined,
      contentEditable: segmentIsEditable.value,
      suppressContentEditableWarning: segmentIsEditable.value,
      spellCheck: segmentIsEditable.value ? "false" : undefined,
      autoCorrect: segmentIsEditable.value ? "off" : undefined,
      enterKeyHint: segmentIsEditable.value ? "next" : undefined,
      inputMode:
        !segmentIsEditable.value || segment.type === "dayPeriod" || segment.type === "era"
          ? undefined
          : "numeric",
      tabIndex: isDisabled.value ? undefined : 0,
      onKeydown,
      onFocus,
      onBeforeinput: (event: InputEvent) => {
        event.preventDefault();

        switch (event.inputType) {
          case "deleteContentBackward":
          case "deleteContentForward":
            backspace();
            return;
          default:
            if (event.data != null) {
              onInput(event.data);
            }
            return;
        }
      },
      onPointerdown: (event: PointerEvent) => {
        event.stopPropagation();
      },
      onMousedown: (event: MouseEvent) => {
        event.stopPropagation();
      },
      style: segmentStyle,
    })
  );

  return {
    segmentProps,
  };
}
