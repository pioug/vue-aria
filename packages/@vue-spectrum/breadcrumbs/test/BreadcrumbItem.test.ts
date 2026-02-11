import userEvent from "@testing-library/user-event";
import { render } from "@testing-library/vue";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { BreadcrumbItem } from "../src";

describe("BreadcrumbItem", () => {
  it("handles defaults", () => {
    const { getByText } = render(BreadcrumbItem, {
      slots: {
        default: () => "Breadcrumb item",
      },
    });

    const breadcrumbItem = getByText("Breadcrumb item");
    expect(breadcrumbItem.getAttribute("id")).toBeTruthy();
    expect(breadcrumbItem.tabIndex).toBe(0);
  });

  it("handles current", () => {
    const { getByText } = render(BreadcrumbItem, {
      props: {
        isCurrent: true,
      },
      slots: {
        default: () => "Breadcrumb item",
      },
    });

    const breadcrumbItem = getByText("Breadcrumb item");
    expect(breadcrumbItem.tabIndex).toBe(-1);
    expect(breadcrumbItem.getAttribute("aria-current")).toBe("page");
  });

  it("handles disabled", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    const { getByText } = render(BreadcrumbItem, {
      props: {
        onPress,
        isDisabled: true,
      },
      slots: {
        default: () => "Breadcrumb item",
      },
    });

    const breadcrumbItem = getByText("Breadcrumb item");
    expect(breadcrumbItem.tabIndex).toBe(-1);
    expect(breadcrumbItem.getAttribute("aria-disabled")).toBe("true");
    await user.click(breadcrumbItem);
    expect(onPress).toHaveBeenCalledTimes(0);
  });

  it("handles onPress", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    const { getByText } = render(BreadcrumbItem, {
      props: {
        onPress,
      },
      slots: {
        default: () => "Breadcrumb item",
      },
    });

    const breadcrumbItem = getByText("Breadcrumb item");
    await user.click(breadcrumbItem);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("handles custom element type via slotted anchor", () => {
    const { getByRole } = render(BreadcrumbItem, {
      slots: {
        default: () => h("a", { href: "http://example.com/" }, "Breadcrumb item"),
      },
    });

    const link = getByRole("link", { name: "Breadcrumb item" }) as HTMLAnchorElement;
    expect(link.getAttribute("href")).toContain("http://example.com/");
    expect(link.tabIndex).toBe(0);
  });
});
