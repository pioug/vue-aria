import { ref as vueRef, watchEffect } from "vue";
import { mergeProps, useEffectEvent } from "@vue-aria/utils";
import { useTextField, type AriaTextFieldOptions, type TextFieldAria } from "./useTextField";

interface FormattedTextFieldState {
  validate: (value: string) => boolean;
  setInputValue: (value: string) => void;
}

function supportsNativeBeforeInputEvent() {
  return (
    typeof window !== "undefined"
    && typeof (window as any).InputEvent !== "undefined"
    && typeof (InputEvent as any).prototype.getTargetRanges === "function"
  );
}

export function useFormattedTextField(
  props: AriaTextFieldOptions,
  state: FormattedTextFieldState,
  inputRef: { current: HTMLInputElement | null }
): TextFieldAria {
  const onBeforeInputFallback = useEffectEvent((event: InputEvent) => {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    let nextValue: string | null = null;
    switch (event.inputType) {
      case "historyUndo":
      case "historyRedo":
      case "insertLineBreak":
        return;
      case "deleteContent":
      case "deleteByCut":
      case "deleteByDrag":
        nextValue = input.value.slice(0, input.selectionStart ?? 0) + input.value.slice(input.selectionEnd ?? 0);
        break;
      case "deleteContentForward":
        nextValue =
          input.selectionEnd === input.selectionStart
            ? input.value.slice(0, input.selectionStart ?? 0) + input.value.slice((input.selectionEnd ?? 0) + 1)
            : input.value.slice(0, input.selectionStart ?? 0) + input.value.slice(input.selectionEnd ?? 0);
        break;
      case "deleteContentBackward":
        nextValue =
          input.selectionEnd === input.selectionStart
            ? input.value.slice(0, (input.selectionStart ?? 0) - 1) + input.value.slice(input.selectionStart ?? 0)
            : input.value.slice(0, input.selectionStart ?? 0) + input.value.slice(input.selectionEnd ?? 0);
        break;
      case "deleteSoftLineBackward":
      case "deleteHardLineBackward":
        nextValue = input.value.slice(input.selectionStart ?? 0);
        break;
      default:
        if (event.data != null) {
          nextValue =
            input.value.slice(0, input.selectionStart ?? 0)
            + event.data
            + input.value.slice(input.selectionEnd ?? 0);
        }
        break;
    }

    if (nextValue == null || !state.validate(nextValue)) {
      event.preventDefault();
    }
  });

  watchEffect((onCleanup) => {
    if (!supportsNativeBeforeInputEvent() || !inputRef.current) {
      return;
    }

    const input = inputRef.current;
    input.addEventListener("beforeinput", onBeforeInputFallback as EventListener, false);
    onCleanup(() => {
      input.removeEventListener("beforeinput", onBeforeInputFallback as EventListener, false);
    });
  });

  const onBeforeInput = !supportsNativeBeforeInputEvent()
    ? (event: InputEvent & { target: HTMLInputElement; data: string }) => {
      const nextValue =
        event.target.value.slice(0, event.target.selectionStart ?? 0)
        + event.data
        + event.target.value.slice(event.target.selectionEnd ?? 0);

      if (!state.validate(nextValue)) {
        event.preventDefault();
      }
    }
    : undefined;

  const { labelProps, inputProps: textFieldProps, descriptionProps, errorMessageProps, ...validation } =
    useTextField(props, inputRef);

  const compositionStartState = vueRef<{
    value: string;
    selectionStart: number | null;
    selectionEnd: number | null;
  } | null>(null);
  const handleCompositionStart = () => {
    if (!inputRef.current) {
      return;
    }

    const { value, selectionStart, selectionEnd } = inputRef.current;
    compositionStartState.value = { value, selectionStart, selectionEnd };
  };
  const handleCompositionEnd = () => {
    if (inputRef.current && !state.validate(inputRef.current.value) && compositionStartState.value) {
      const { value, selectionStart, selectionEnd } = compositionStartState.value;
      inputRef.current.value = value;
      inputRef.current.setSelectionRange(selectionStart, selectionEnd);
      state.setInputValue(value);
    }
  };

  return {
    inputProps: mergeProps(textFieldProps, {
      onBeforeInput,
      onCompositionStart: handleCompositionStart,
      onCompositionstart: handleCompositionStart,
      onCompositionEnd: handleCompositionEnd,
      onCompositionend: handleCompositionEnd,
    }),
    labelProps,
    descriptionProps,
    errorMessageProps,
    ...validation,
  };
}
