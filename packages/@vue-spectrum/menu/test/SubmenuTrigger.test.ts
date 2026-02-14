import { mount } from "@vue/test-utils";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { Item } from "../src/Item";
import { Menu } from "../src/Menu";
import { MenuTrigger } from "../src/MenuTrigger";
import { SubmenuTrigger } from "../src/SubmenuTrigger";

describe("SubmenuTrigger", () => {
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

  it("opens a nested submenu with keyboard ArrowRight", async () => {
    const wrapper = mount(MenuTrigger as any, {
      props: {
        defaultOpen: true,
      },
      slots: {
        default: () => [
          h("button", { "data-testid": "trigger" }, "Menu Button"),
          h(Menu as any, { ariaLabel: "Menu" }, {
            default: () => [
              h(SubmenuTrigger as any, null, {
                default: () => [
                  h(Item as any, { key: "more" }, { default: () => "More" }),
                  h(Menu as any, { ariaLabel: "Submenu" }, {
                    default: () => [
                      h(Item as any, { key: "sub-1" }, { default: () => "Sub item" }),
                    ],
                  }),
                ],
              }),
              h(Item as any, { key: "alpha" }, { default: () => "Alpha" }),
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    const rootItems = Array.from(document.body.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
    const submenuTriggerItem = rootItems.find((item) => item.textContent?.includes("More"));
    expect(submenuTriggerItem).toBeTruthy();

    submenuTriggerItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await wrapper.vm.$nextTick();

    const allMenus = document.body.querySelectorAll('[role=\"menu\"]');
    expect(allMenus.length).toBeGreaterThanOrEqual(2);
    expect(document.body.textContent).toContain("Sub item");
  });

  it("disables submenu triggers when their key is in disabledKeys", async () => {
    const wrapper = mount(MenuTrigger as any, {
      props: {
        defaultOpen: true,
      },
      slots: {
        default: () => [
          h("button", { "data-testid": "trigger" }, "Menu Button"),
          h(Menu as any, { ariaLabel: "Menu", disabledKeys: ["more"] }, {
            default: () => [
              h(SubmenuTrigger as any, null, {
                default: () => [
                  h(Item as any, { key: "more" }, { default: () => "More" }),
                  h(Menu as any, { ariaLabel: "Submenu" }, {
                    default: () => [
                      h(Item as any, { key: "sub-1" }, { default: () => "Sub item" }),
                    ],
                  }),
                ],
              }),
              h(Item as any, { key: "alpha" }, { default: () => "Alpha" }),
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    const rootItems = Array.from(document.body.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
    const submenuTriggerItem = rootItems.find((item) => item.textContent?.includes("More"));
    expect(submenuTriggerItem).toBeTruthy();
    expect(submenuTriggerItem?.getAttribute("aria-disabled")).toBe("true");

    submenuTriggerItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await wrapper.vm.$nextTick();

    const allMenus = document.body.querySelectorAll('[role="menu"]');
    expect(allMenus).toHaveLength(1);
    expect(document.body.textContent).not.toContain("Sub item");
  });

  it("only keeps one sibling submenu open at a time", async () => {
    const wrapper = mount(MenuTrigger as any, {
      props: {
        defaultOpen: true,
      },
      slots: {
        default: () => [
          h("button", { "data-testid": "trigger" }, "Menu Button"),
          h(Menu as any, { ariaLabel: "Menu" }, {
            default: () => [
              h(SubmenuTrigger as any, null, {
                default: () => [
                  h(Item as any, { key: "more-a" }, { default: () => "More A" }),
                  h(Menu as any, { ariaLabel: "Submenu A" }, {
                    default: () => [
                      h(Item as any, { key: "sub-a-1" }, { default: () => "Sub item A" }),
                    ],
                  }),
                ],
              }),
              h(SubmenuTrigger as any, null, {
                default: () => [
                  h(Item as any, { key: "more-b" }, { default: () => "More B" }),
                  h(Menu as any, { ariaLabel: "Submenu B" }, {
                    default: () => [
                      h(Item as any, { key: "sub-b-1" }, { default: () => "Sub item B" }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    const rootItems = Array.from(document.body.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
    const firstTrigger = rootItems.find((item) => item.textContent?.includes("More A"));
    const secondTrigger = rootItems.find((item) => item.textContent?.includes("More B"));
    expect(firstTrigger).toBeTruthy();
    expect(secondTrigger).toBeTruthy();

    firstTrigger?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(document.body.textContent).toContain("Sub item A");
    expect(document.body.textContent).not.toContain("Sub item B");

    secondTrigger?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(document.body.textContent).toContain("Sub item B");
    expect(document.body.textContent).not.toContain("Sub item A");

    const allMenus = document.body.querySelectorAll('[role="menu"]');
    expect(allMenus.length).toBeGreaterThanOrEqual(2);
  });
});
