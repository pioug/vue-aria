import { describe, expect, it } from "vitest";
import { useBreadcrumbs } from "../src";

describe("useBreadcrumbs", () => {
  it("handles defaults", () => {
    const { navProps } = useBreadcrumbs();

    expect(navProps.value["aria-label"]).toBe("Breadcrumbs");
  });

  it("handles a custom aria label", () => {
    const { navProps } = useBreadcrumbs({
      "aria-label": "Navigation path",
    });

    expect(navProps.value["aria-label"]).toBe("Navigation path");
  });

  it("passes through supported DOM props", () => {
    const { navProps } = useBreadcrumbs({
      id: "breadcrumbs-id",
      "data-testid": "breadcrumbs",
    });

    expect(navProps.value.id).toBe("breadcrumbs-id");
    expect(navProps.value["data-testid"]).toBe("breadcrumbs");
  });
});
