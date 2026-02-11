import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { BreadcrumbItem, Breadcrumbs } from "../src/Breadcrumbs";

describe("@vue-spectrum/s2 Breadcrumbs", () => {
  it("renders baseline attrs and breadcrumb items", async () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            Breadcrumbs,
            {
              size: "M",
              "aria-label": "Path",
            },
            {
              default: () => [
                h(BreadcrumbItem, { key: "home" }, { default: () => "Home" }),
                h(BreadcrumbItem, { key: "docs" }, { default: () => "Docs" }),
                h(BreadcrumbItem, { key: "api" }, { default: () => "API" }),
              ],
            }
          ),
      },
    });

    await wrapper.vm.$nextTick();

    const nav = wrapper.get('nav[aria-label="Path"]');
    expect(nav.attributes("aria-label")).toBe("Path");
    expect(wrapper.get(".s2-Breadcrumbs").classes()).toContain(
      "spectrum-Breadcrumbs--medium"
    );
    expect(wrapper.findAll(".s2-BreadcrumbItem").length).toBeGreaterThan(0);
  });

  it("emits onAction when a breadcrumb is pressed", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const wrapper = mount(Provider, {
      attachTo: document.body,
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            Breadcrumbs,
            {
              "aria-label": "Path",
              onAction,
            },
            {
              default: () => [
                h(BreadcrumbItem, { key: "home" }, { default: () => "Home" }),
                h(BreadcrumbItem, { key: "docs" }, { default: () => "Docs" }),
                h(BreadcrumbItem, { key: "api" }, { default: () => "API" }),
              ],
            }
          ),
      },
    });

    await wrapper.vm.$nextTick();
    await user.click(wrapper.get(".s2-BreadcrumbItem").element);
    expect(onAction).toHaveBeenCalledWith("home");
  });
});
