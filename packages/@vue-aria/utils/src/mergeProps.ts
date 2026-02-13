type Props = Record<string, unknown>;

const EVENT_HANDLER = /^on[A-Z]/;

const isFunction = (value: unknown): value is (...args: unknown[]) => void =>
  typeof value === "function";

export function mergeProps<T extends Props>(...allProps: T[]): T {
  const merged: Props = {};

  for (const props of allProps) {
    for (const [key, value] of Object.entries(props ?? {})) {
      if (value === undefined) {
        continue;
      }

      const existing = merged[key];

      if (EVENT_HANDLER.test(key) && isFunction(existing) && isFunction(value)) {
        merged[key] = (...args: unknown[]) => {
          existing(...args);
          value(...args);
        };
        continue;
      }

      if (key === "class" && existing && value) {
        merged[key] = [existing, value];
        continue;
      }

      if (key === "UNSAFE_className" && existing && value) {
        merged[key] = `${String(existing)} ${String(value)}`.trim();
        continue;
      }

      if (
        key === "style" &&
        existing &&
        value &&
        typeof existing === "object" &&
        typeof value === "object"
      ) {
        merged[key] = { ...(existing as Props), ...(value as Props) };
        continue;
      }

      if (
        key === "UNSAFE_style" &&
        existing &&
        value &&
        typeof existing === "object" &&
        typeof value === "object"
      ) {
        merged[key] = { ...(existing as Props), ...(value as Props) };
        continue;
      }

      merged[key] = value;
    }
  }

  return merged as T;
}
