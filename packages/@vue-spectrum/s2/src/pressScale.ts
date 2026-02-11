import type { CSSProperties, Ref } from "vue";

export interface PressScaleRenderProps {
  isPressed: boolean;
}

export type PressScaleStyle<R extends PressScaleRenderProps> =
  | CSSProperties
  | ((renderProps: R) => CSSProperties | undefined)
  | undefined;

export function pressScale<R extends PressScaleRenderProps>(
  ref: Ref<HTMLElement | null>,
  style?: PressScaleStyle<R>
): (renderProps: R) => CSSProperties {
  return (renderProps: R) => {
    const resolvedStyle =
      typeof style === "function"
        ? (style(renderProps) ?? {})
        : (style ?? {});

    if (renderProps.isPressed && ref.value) {
      const { width = 0, height = 0 } = ref.value.getBoundingClientRect() ?? {};
      return {
        ...resolvedStyle,
        willChange: `${resolvedStyle.willChange ?? ""} transform`.trim(),
        transform: `${resolvedStyle.transform ?? ""} perspective(${Math.max(
          height,
          width / 3,
          24
        )}px) translate3d(0, 0, -2px)`.trim(),
      };
    }

    return {
      ...resolvedStyle,
      willChange: `${resolvedStyle.willChange ?? ""} transform`.trim(),
    };
  };
}
