import { effectScope, h } from "vue";
import { describe, expect, it } from "vitest";
import { useBreadcrumbItem } from "../src";

describe("useBreadcrumbItem", () => {
  const run = (props: Record<string, unknown>) => {
    const scope = effectScope();
    const result = scope.run(() => useBreadcrumbItem(props, { current: document.createElement("a") }))!;
    scope.stop();
    return result;
  };

  it("handles span elements", () => {
    const { itemProps } = run({ elementType: "span" });
    expect(itemProps.tabIndex).toBe(0);
    expect(itemProps.role).toBe("link");
    expect(itemProps["aria-disabled"]).toBeUndefined();
    expect(typeof itemProps.onKeydown).toBe("function");
  });

  it("handles isCurrent", () => {
    const { itemProps } = run({ elementType: "span", isCurrent: true });
    expect(itemProps.tabIndex).toBeUndefined();
    expect(itemProps.role).toBe("link");
    expect(itemProps["aria-current"]).toBe("page");
  });

  it("handles isDisabled", () => {
    const { itemProps } = run({ elementType: "span", isDisabled: true });
    expect(itemProps.tabIndex).toBeUndefined();
    expect(itemProps.role).toBe("link");
    expect(itemProps["aria-disabled"]).toBe(true);
  });

  it("handles descendant link with href", () => {
    const { itemProps } = run({ children: h("a", { href: "https://example.com" }, "Breadcrumb Item") });
    expect(itemProps.tabIndex).toBe(0);
    expect(itemProps.role).toBeUndefined();
    expect(itemProps["aria-disabled"]).toBeUndefined();
    expect(typeof itemProps.onKeydown).toBe("function");
  });
});
