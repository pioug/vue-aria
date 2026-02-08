import { afterEach, describe, expect, it } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { usePreventScroll } from "../src";

function resetDocumentStyles(): void {
  document.documentElement.style.overflow = "";
  document.documentElement.style.paddingRight = "";
  (document.documentElement.style as CSSStyleDeclaration & Record<string, string>).scrollbarGutter = "";
}

afterEach(() => {
  resetDocumentStyles();
});

describe("usePreventScroll", () => {
  it("sets overflow hidden on mount and removes on unmount", () => {
    expect(document.documentElement.style.overflow).not.toBe("hidden");

    const scope = effectScope();
    scope.run(() => {
      usePreventScroll();
    });

    expect(document.documentElement.style.overflow).toBe("hidden");

    scope.stop();

    expect(document.documentElement.style.overflow).not.toBe("hidden");
  });

  it("works with nested overlays", () => {
    const firstScope = effectScope();
    firstScope.run(() => {
      usePreventScroll();
    });

    expect(document.documentElement.style.overflow).toBe("hidden");

    const secondScope = effectScope();
    secondScope.run(() => {
      usePreventScroll();
    });

    expect(document.documentElement.style.overflow).toBe("hidden");

    secondScope.stop();
    expect(document.documentElement.style.overflow).toBe("hidden");

    firstScope.stop();
    expect(document.documentElement.style.overflow).not.toBe("hidden");
  });

  it("works with nested overlays regardless of unmount order", () => {
    const firstScope = effectScope();
    firstScope.run(() => {
      usePreventScroll();
    });

    const secondScope = effectScope();
    secondScope.run(() => {
      usePreventScroll();
    });

    expect(document.documentElement.style.overflow).toBe("hidden");

    firstScope.stop();
    expect(document.documentElement.style.overflow).toBe("hidden");

    secondScope.stop();
    expect(document.documentElement.style.overflow).not.toBe("hidden");
  });

  it("removes overflow hidden when isDisabled becomes true", async () => {
    const isDisabled = ref(false);

    const scope = effectScope();
    scope.run(() => {
      usePreventScroll({
        isDisabled,
      });
    });

    expect(document.documentElement.style.overflow).toBe("hidden");

    isDisabled.value = true;
    await nextTick();

    expect(document.documentElement.style.overflow).not.toBe("hidden");

    scope.stop();
  });
});
