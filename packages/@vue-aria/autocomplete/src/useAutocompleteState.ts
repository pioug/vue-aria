import { useControlledState } from "@vue-stately/utils";

export interface AutocompleteState {
  /** The current value of the autocomplete input. */
  readonly inputValue: string;
  /** Sets the value of the autocomplete input. */
  setInputValue(value: string): void;
  /** The id of the current aria-activedescendant of the autocomplete input. */
  focusedNodeId: string | null;
  /** Sets the id of the current aria-activedescendant of the autocomplete input. */
  setFocusedNodeId(value: string | null): void;
}

export interface AutocompleteProps {
  /** The value of the autocomplete input (controlled). */
  inputValue?: string;
  /** The default value of the autocomplete input (uncontrolled). */
  defaultInputValue?: string;
  /** Handler that is called when the autocomplete input value changes. */
  onInputChange?: (value: string) => void;
  /** The children wrapped by the autocomplete. Consists of at least an input element and a collection element to filter. */
  children: unknown;
}

// Emulate our other stately hooks which accept all "base" props even if not used.
export interface AutocompleteStateOptions extends Omit<AutocompleteProps, "children"> {}

/**
 * Provides state management for an autocomplete component.
 */
export function useAutocompleteState(props: AutocompleteStateOptions): AutocompleteState {
  const {
    onInputChange: propsOnInputChange,
    inputValue: propsInputValue,
    defaultInputValue: propsDefaultInputValue = "",
  } = props;

  const [inputValue, setInputValue] = useControlledState(
    () => propsInputValue,
    () => propsDefaultInputValue,
    propsOnInputChange
  );

  const [focusedNodeIdRef, setFocusedNodeId] = useControlledState(
    () => undefined as string | null | undefined,
    () => null
  );

  return {
    get inputValue() {
      return inputValue.value;
    },
    setInputValue,
    get focusedNodeId() {
      return focusedNodeIdRef.value;
    },
    setFocusedNodeId,
  };
}
