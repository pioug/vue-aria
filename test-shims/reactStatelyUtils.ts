export function useControlledState<T>(value: T, defaultValue: T) {
  return [value ?? defaultValue, () => {}] as const;
}
