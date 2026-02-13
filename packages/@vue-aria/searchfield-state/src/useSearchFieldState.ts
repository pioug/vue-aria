import { useControlledState } from "@vue-aria/utils-state";

export interface SearchFieldProps {
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string) => void;
}

export interface SearchFieldState {
  readonly value: string;
  setValue(value: string): void;
}

function toStringValue(value: unknown): string | undefined {
  if (value == null) {
    return undefined;
  }

  return String(value);
}

export function useSearchFieldState(props: SearchFieldProps): SearchFieldState {
  const [valueRef, setValue] = useControlledState<string, string>(
    () => toStringValue(props.value),
    () => toStringValue(props.defaultValue) || "",
    props.onChange
  );

  return {
    get value() {
      return valueRef.value;
    },
    setValue,
  };
}
