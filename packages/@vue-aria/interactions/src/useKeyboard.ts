import { createEventHandler, type BaseEvent } from "./createEventHandler";

export interface KeyboardProps {
  isDisabled?: boolean;
  onKeyDown?: (e: BaseEvent<KeyboardEvent>) => void;
  onKeyUp?: (e: BaseEvent<KeyboardEvent>) => void;
}

export interface KeyboardResult {
  keyboardProps: Record<string, unknown>;
}

export function useKeyboard(props: KeyboardProps): KeyboardResult {
  return {
    keyboardProps: props.isDisabled
      ? {}
      : {
          onKeydown: createEventHandler(props.onKeyDown),
          onKeyup: createEventHandler(props.onKeyUp),
        },
  };
}
