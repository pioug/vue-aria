import { ref } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import { isDocsEnv, pressScale } from "../src";

describe("@vue-spectrum/s2", () => {
  afterEach(() => {
    delete process.env.DOCS_ENV;
  });

  it("isDocsEnv reads DOCS_ENV", () => {
    expect(isDocsEnv()).toBe(false);
    process.env.DOCS_ENV = "1";
    expect(isDocsEnv()).toBe(true);
  });

  it("pressScale appends transform metadata when pressed", () => {
    const elementRef = ref({
      getBoundingClientRect: () => ({
        width: 90,
        height: 30,
      }),
    } as unknown as HTMLElement);

    const styleFn = pressScale(elementRef, {
      transform: "scale(1)",
      willChange: "opacity",
    });

    const pressedStyle = styleFn({ isPressed: true });
    expect(pressedStyle.willChange).toBe("opacity transform");
    expect(String(pressedStyle.transform)).toContain("scale(1)");
    expect(String(pressedStyle.transform)).toContain("perspective(30px)");
    expect(String(pressedStyle.transform)).toContain("translate3d(0, 0, -2px)");
  });

  it("pressScale still declares transform in willChange when not pressed", () => {
    const elementRef = ref(null as HTMLElement | null);
    const styleFn = pressScale(elementRef, () => ({
      willChange: "opacity",
    }));

    const style = styleFn({ isPressed: false });
    expect(style.willChange).toBe("opacity transform");
    expect(style.transform).toBeUndefined();
  });
});
