import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { Breadcrumbs } from "../src/Breadcrumbs";
import { Item } from "../src/Item";

type TestItem = {
  key: string;
  label: string;
  href?: string;
};

function renderBreadcrumbs(
  props: Record<string, unknown> = {},
  items: TestItem[] = [{ key: "folder-1", label: "Folder 1" }],
  attrs: Record<string, unknown> = {}
) {
  return mount(Breadcrumbs as any, {
    props,
    attrs,
    slots: {
      default: () =>
        items.map((item) =>
          h(
            Item as any,
            {
              key: item.key,
              href: item.href,
            },
            {
              default: () => item.label,
            }
          )
        ),
    },
  });
}

describe("Breadcrumbs", () => {
  it("handles defaults", () => {
    const wrapper = renderBreadcrumbs(
      { id: "breadcrumbs-id" },
      [{ key: "folder-1", label: "Folder 1" }],
      { "aria-label": "breadcrumbs-test" }
    );

    const breadcrumbs = wrapper.get('[aria-label="breadcrumbs-test"]');
    expect(breadcrumbs.attributes("id")).toBe("breadcrumbs-id");
  });

  it("handles UNSAFE_className", () => {
    const wrapper = renderBreadcrumbs({ UNSAFE_className: "test-class" });
    expect(wrapper.get("ul").classes()).toContain("test-class");
  });

  it("handles multiple items", () => {
    const wrapper = renderBreadcrumbs(
      {},
      [
        { key: "folder-1", label: "Folder 1" },
        { key: "folder-2", label: "Folder 2" },
        { key: "folder-3", label: "Folder 3" },
      ]
    );

    const current = wrapper.get('[aria-current="page"]');
    expect(current.text()).toContain("Folder 3");
  });

  it("handles size variants", () => {
    const small = renderBreadcrumbs({ size: "S" });
    expect(small.get("ul").classes()).toContain("spectrum-Breadcrumbs--small");

    const medium = renderBreadcrumbs({ size: "M" });
    expect(medium.get("ul").classes()).toContain("spectrum-Breadcrumbs--medium");
  });

  it("handles showRoot and isMultiline class toggles", () => {
    const wrapper = renderBreadcrumbs({
      showRoot: true,
      isMultiline: true,
    });

    const list = wrapper.get("ul");
    expect(list.classes()).toContain("spectrum-Breadcrumbs--showRoot");
    expect(list.classes()).toContain("spectrum-Breadcrumbs--multiline");
  });

  it("handles isDisabled", () => {
    const wrapper = renderBreadcrumbs(
      { isDisabled: true },
      [
        { key: "folder-1", label: "Folder 1" },
        { key: "folder-2", label: "Folder 2" },
      ]
    );

    const items = wrapper.findAll('[aria-disabled="true"]');
    expect(items.length).toBeGreaterThan(0);
  });

  it("supports onAction", async () => {
    const onAction = vi.fn();
    const wrapper = renderBreadcrumbs(
      { onAction },
      [
        { key: "folder-1", label: "Folder 1", href: "#" },
        { key: "folder-2", label: "Folder 2", href: "#" },
      ]
    );

    const links = wrapper.findAll("a");
    await links[0].trigger("click");
    expect(onAction).toHaveBeenCalledWith("folder-1");
  });

  it("does not fire onAction when disabled", async () => {
    const onAction = vi.fn();
    const wrapper = renderBreadcrumbs(
      {
        isDisabled: true,
        onAction,
      },
      [
        { key: "folder-1", label: "Folder 1", href: "#" },
        { key: "folder-2", label: "Folder 2", href: "#" },
      ]
    );

    const links = wrapper.findAll("a");
    await links[0].trigger("click");
    expect(onAction).not.toHaveBeenCalled();
  });
});
