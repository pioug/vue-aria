export const style = (name: string, style: string) => `${name} { ${style} }`;
export const baseColor = (value: string) => value;
export const lightDark = (light: string, dark: string) => ({ light, dark });
export const focusRing = (condition = true) =>
  condition
    ? {
        outline: "2px solid currentColor",
      }
    : {};

export const raw = (strings: TemplateStringsArray, ...values: unknown[]) =>
  String.raw(strings, ...values);
export const keyframes = (name: string, _definition: Record<string, unknown>) => `@keyframes ${name} {}`;
