import { describe, expect, it, vi } from "vitest";
import { useBreadcrumbItem } from "../src";

describe("useBreadcrumbItem", () => {
  it("returns link semantics for non-current breadcrumb items", () => {
    const { itemProps } = useBreadcrumbItem({
      href: "/docs",
      elementType: "a",
    });

    expect(itemProps.value.href).toBe("/docs");
    expect(itemProps.value.tabindex).toBe(0);
    expect(itemProps.value["aria-disabled"]).toBeUndefined();
  });

  it("marks current breadcrumbs as aria-current and non-interactive", () => {
    const { itemProps } = useBreadcrumbItem({
      href: "/docs/current",
      isCurrent: true,
      autoFocus: true,
    });

    expect(itemProps.value["aria-current"]).toBe("page");
    expect(itemProps.value.tabIndex).toBe(-1);
    expect(itemProps.value["aria-disabled"]).toBe(true);

    const preventDefault = vi.fn();
    (itemProps.value.onClick as ((event: MouseEvent) => void) | undefined)?.(
      {
        preventDefault,
      } as unknown as MouseEvent
    );

    expect(preventDefault).toHaveBeenCalled();
  });

  it("omits link props for heading breadcrumbs", () => {
    const { itemProps } = useBreadcrumbItem({
      elementType: "h2",
      isCurrent: true,
    });

    expect(itemProps.value.href).toBeUndefined();
    expect(itemProps.value.role).toBeUndefined();
    expect(itemProps.value["aria-current"]).toBe("page");
  });
});
