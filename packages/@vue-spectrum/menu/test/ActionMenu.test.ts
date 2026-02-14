import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { ActionMenu } from "../src/ActionMenu";
import { Item } from "../src/Item";

describe("ActionMenu", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders default aria-label and handles action", async () => {
    const onAction = vi.fn();
    const wrapper = mount(ActionMenu as any, {
      props: {
        onAction,
      },
      slots: {
        default: () => [
          h(Item as any, { key: "Foo" }, { default: () => "Foo" }),
          h(Item as any, { key: "Bar" }, { default: () => "Bar" }),
          h(Item as any, { key: "Baz" }, { default: () => "Baz" }),
        ],
      },
      attachTo: document.body,
    });

    const button = wrapper.get("button");
    expect(button.attributes("aria-label")).toBe("More actions");

    await button.trigger("click");

    const menuItem = document.body.querySelector('[role="menuitem"]') as HTMLElement | null;
    expect(menuItem?.textContent).toContain("Foo");

    menuItem?.click();
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("supports custom aria-label", () => {
    const wrapper = mount(ActionMenu as any, {
      props: {
        ariaLabel: "Custom Aria Label",
      },
      slots: {
        default: () => [
          h(Item as any, { key: "Foo" }, { default: () => "Foo" }),
        ],
      },
      attachTo: document.body,
    });

    expect(wrapper.get("button").attributes("aria-label")).toBe("Custom Aria Label");
  });
});
