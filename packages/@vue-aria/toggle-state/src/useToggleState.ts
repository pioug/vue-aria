import { ref } from "vue";
import { useControlledState } from "./useControlledState";

export interface ToggleStateOptions {
  isSelected?: boolean;
  defaultSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  isReadOnly?: boolean;
}

export interface ToggleState {
  readonly isSelected: boolean;
  readonly defaultSelected: boolean;
  setSelected(isSelected: boolean): void;
  toggle(): void;
}

export function useToggleState(props: ToggleStateOptions = {}): ToggleState {
  const { isReadOnly } = props;

  const [isSelectedRef, setSelected] = useControlledState(
    () => props.isSelected,
    () => props.defaultSelected || false,
    props.onChange
  );

  const initialValue = ref(isSelectedRef.value);

  function updateSelected(value: boolean) {
    if (!isReadOnly) {
      setSelected(value);
    }
  }

  function toggleState() {
    if (!isReadOnly) {
      setSelected(!isSelectedRef.value);
    }
  }

  return {
    get isSelected() {
      return isSelectedRef.value;
    },
    get defaultSelected() {
      return props.defaultSelected ?? initialValue.value;
    },
    setSelected: updateSelected,
    toggle: toggleState,
  };
}
