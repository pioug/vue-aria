import { effectScope, h } from "vue";
import { describe, expect, it } from "vitest";
import { useLink } from "../src";

describe("useLink", () => {
  const run = (props: Record<string, unknown>) => {
    const scope = effectScope();
    const result = scope.run(() => useLink(props))!;
    scope.stop();
    return result;
  };

  it("handles defaults", () => {
    const { linkProps } = run({ children: "Test Link" });
    expect(linkProps.role).toBeUndefined();
    expect(linkProps.tabIndex).toBe(0);
    expect(typeof linkProps.onKeydown).toBe("function");
  });

  it("handles custom element type", () => {
    const { linkProps } = run({ children: h("div", "Test Link"), elementType: "div" });
    expect(linkProps.role).toBe("link");
    expect(linkProps.tabIndex).toBe(0);
  });

  it("handles isDisabled", () => {
    const { linkProps } = run({ children: "Test Link", elementType: "span", isDisabled: true });
    expect(linkProps.role).toBe("link");
    expect(linkProps["aria-disabled"]).toBe(true);
    expect(linkProps.tabIndex).toBeUndefined();
    expect(typeof linkProps.onKeydown).toBe("function");
  });
});
