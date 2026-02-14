import { mount } from "@vue/test-utils";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { Item } from "../src/Item";
import { Menu } from "../src/Menu";
import { MenuTrigger } from "../src/MenuTrigger";

function renderMenuTrigger(props: Record<string, unknown> = {}) {
  return mount(MenuTrigger as any, {
    props,
    slots: {
      default: () => [
        h("button", { "data-testid": "trigger" }, "Menu Button"),
        h(Menu as any, { ariaLabel: "Menu" }, {
          default: () => [
            h(Item as any, { key: "Foo" }, { default: () => "Foo" }),
            h(Item as any, { key: "Bar" }, { default: () => "Bar" }),
            h(Item as any, { key: "Baz" }, { default: () => "Baz" }),
          ],
        }),
      ],
    },
    attachTo: document.body,
  });
}

describe("MenuTrigger", () => {
  const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;

  beforeAll(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterAll(() => {
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("opens and closes menu on trigger click", async () => {
    const wrapper = renderMenuTrigger();
    const trigger = wrapper.get('[data-testid="trigger"]');

    expect(document.body.querySelector('[role="menu"]')).toBeNull();

    await trigger.trigger("click");
    const menu = document.body.querySelector('[role="menu"]');
    expect(menu).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");

    await trigger.trigger("click");
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
    expect(trigger.attributes("aria-expanded")).toBe("false");
  });

  it("supports controlled open state", async () => {
    const onOpenChange = vi.fn();
    const wrapper = renderMenuTrigger({
      isOpen: true,
      onOpenChange,
    });

    const trigger = wrapper.get('[data-testid="trigger"]');
    expect(document.body.querySelector('[role="menu"]')).toBeTruthy();

    await trigger.trigger("click");

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(document.body.querySelector('[role="menu"]')).toBeTruthy();
    expect(trigger.attributes("aria-expanded")).toBe("true");
  });
});
