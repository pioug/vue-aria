import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { usePreventScroll } from "../src/usePreventScroll";

describe("usePreventScroll", () => {
  it("sets overflow hidden on mount and restores on scope dispose", () => {
    document.documentElement.style.overflow = "";
    expect(document.documentElement.style.overflow).not.toBe("hidden");

    const scope = effectScope();
    scope.run(() => {
      usePreventScroll();
    });

    expect(document.documentElement.style.overflow).toBe("hidden");

    scope.stop();
    expect(document.documentElement.style.overflow).not.toBe("hidden");
  });

  it("supports nested usage", () => {
    document.documentElement.style.overflow = "";

    const one = effectScope();
    one.run(() => {
      usePreventScroll();
    });
    expect(document.documentElement.style.overflow).toBe("hidden");

    const two = effectScope();
    two.run(() => {
      usePreventScroll();
    });
    expect(document.documentElement.style.overflow).toBe("hidden");

    one.stop();
    expect(document.documentElement.style.overflow).toBe("hidden");

    two.stop();
    expect(document.documentElement.style.overflow).not.toBe("hidden");
  });

  it("does not apply overflow hidden when disabled", () => {
    document.documentElement.style.overflow = "";

    const scope = effectScope();
    scope.run(() => {
      usePreventScroll({ isDisabled: true });
    });

    expect(document.documentElement.style.overflow).not.toBe("hidden");

    scope.stop();
    expect(document.documentElement.style.overflow).not.toBe("hidden");
  });
});
