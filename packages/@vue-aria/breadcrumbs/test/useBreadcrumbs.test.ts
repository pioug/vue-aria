import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { useBreadcrumbs } from "../src";

describe("useBreadcrumbs", () => {
  const run = (props: Record<string, unknown>) => {
    const scope = effectScope();
    const result = scope.run(() => useBreadcrumbs(props))!;
    scope.stop();
    return result;
  };

  it("handles defaults", () => {
    const { navProps } = run({});
    expect(navProps["aria-label"]).toBe("Breadcrumbs");
  });

  it("handles custom aria-label", () => {
    const { navProps } = run({ "aria-label": "test-label" });
    expect(navProps["aria-label"]).toBe("test-label");
  });
});
