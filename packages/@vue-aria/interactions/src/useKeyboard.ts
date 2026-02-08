import { createEventHandler } from "./createEventHandler";
import { toValue } from "vue";
import type { MaybeReactive } from "@vue-aria/types";

export type KeyboardEventHandler = (event: KeyboardEvent & {
  continuePropagation?: () => void;
}) => void;

export interface UseKeyboardOptions {
  isDisabled?: MaybeReactive<boolean>;
  onKeydown?: KeyboardEventHandler;
  onKeyup?: KeyboardEventHandler;
}

export interface UseKeyboardResult {
  keyboardProps: Record<string, unknown>;
}

export function useKeyboard(options: UseKeyboardOptions = {}): UseKeyboardResult {
  const isDisabled = () =>
    options.isDisabled ? Boolean(toValue(options.isDisabled)) : false;
  const onKeyDownHandler = createEventHandler(options.onKeydown);
  const onKeyUpHandler = createEventHandler(options.onKeyup);

  return {
    keyboardProps: {
      onKeydown: (event: KeyboardEvent) => {
        if (isDisabled()) {
          return;
        }
        onKeyDownHandler?.(event);
      },
      onKeyup: (event: KeyboardEvent) => {
        if (isDisabled()) {
          return;
        }
        onKeyUpHandler?.(event);
      },
    },
  };
}
