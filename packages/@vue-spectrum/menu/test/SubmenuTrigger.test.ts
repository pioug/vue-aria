import { mount } from "@vue/test-utils";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { Item } from "../src/Item";
import { Menu } from "../src/Menu";
import { MenuTrigger } from "../src/MenuTrigger";
import { SubmenuTrigger } from "../src/SubmenuTrigger";

describe("SubmenuTrigger", () => {
  const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
  const mountedWrappers: Array<{ unmount: () => void }> = [];
  const mountTracked = (...args: Parameters<typeof mount>) => {
    const wrapper = mount(...args);
    mountedWrappers.push(wrapper as unknown as { unmount: () => void });
    return wrapper;
  };

  beforeAll(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterAll(() => {
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  afterEach(() => {
    while (mountedWrappers.length > 0) {
      mountedWrappers.pop()?.unmount();
    }
    document.body.innerHTML = "";
  });

  it("opens a nested submenu with keyboard ArrowRight", async () => {
    const wrapper = mountTracked(MenuTrigger as any, {
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
    const wrapper = mountTracked(MenuTrigger as any, {
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
    expect(submenuTriggerItem?.getAttribute("aria-haspopup")).toBe("menu");
    expect(submenuTriggerItem?.getAttribute("aria-disabled")).toBe("true");

    submenuTriggerItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    submenuTriggerItem?.click();
    submenuTriggerItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await wrapper.vm.$nextTick();

    const allMenus = document.body.querySelectorAll('[role="menu"]');
    expect(allMenus).toHaveLength(1);
    expect(document.body.textContent).not.toContain("Sub item");
  });

  it("skips disabled submenu triggers during keyboard navigation", async () => {
    const wrapper = mountTracked(MenuTrigger as any, {
      props: {
        defaultOpen: true,
      },
      slots: {
        default: () => [
          h("button", { "data-testid": "trigger" }, "Menu Button"),
          h(Menu as any, { ariaLabel: "Menu", disabledKeys: ["more"] }, {
            default: () => [
              h(Item as any, { key: "first" }, { default: () => "First" }),
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
              h(Item as any, { key: "last" }, { default: () => "Last" }),
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    const rootItems = Array.from(document.body.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
    const firstItem = rootItems.find((item) => item.textContent?.includes("First"));
    const disabledSubmenuTrigger = rootItems.find((item) => item.textContent?.includes("More"));
    const lastItem = rootItems.find((item) => item.textContent?.includes("Last"));

    expect(firstItem).toBeTruthy();
    expect(disabledSubmenuTrigger).toBeTruthy();
    expect(lastItem).toBeTruthy();
    expect(disabledSubmenuTrigger?.getAttribute("aria-disabled")).toBe("true");

    firstItem?.focus();
    firstItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(document.activeElement).toBe(lastItem);

    lastItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(document.activeElement).toBe(firstItem);
  });

  it("only keeps one sibling submenu open at a time", async () => {
    const wrapper = mountTracked(MenuTrigger as any, {
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

  it("does not trigger root onAction when pressing a submenu trigger item", async () => {
    const onAction = vi.fn();
    const wrapper = mountTracked(MenuTrigger as any, {
      props: {
        defaultOpen: true,
      },
      slots: {
        default: () => [
          h("button", { "data-testid": "trigger" }, "Menu Button"),
          h(Menu as any, { ariaLabel: "Menu", onAction }, {
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
    const rootItem = rootItems.find((item) => item.textContent?.includes("Alpha"));
    expect(submenuTriggerItem).toBeTruthy();
    expect(rootItem).toBeTruthy();

    submenuTriggerItem?.click();
    await wrapper.vm.$nextTick();
    submenuTriggerItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(onAction).toHaveBeenCalledTimes(0);

    rootItem?.click();
    await wrapper.vm.$nextTick();
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenLastCalledWith("alpha");
  });

  it("does not trigger selection when pressing a submenu trigger item", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = mountTracked(MenuTrigger as any, {
      props: {
        defaultOpen: true,
      },
      slots: {
        default: () => [
          h("button", { "data-testid": "trigger" }, "Menu Button"),
          h(Menu as any, { ariaLabel: "Menu", selectionMode: "single", onSelectionChange }, {
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

    const submenuTriggerItem = document.body.querySelector('[role="menuitem"]') as HTMLElement | null;
    expect(submenuTriggerItem).toBeTruthy();

    submenuTriggerItem?.click();
    await wrapper.vm.$nextTick();

    expect(onSelectionChange).toHaveBeenCalledTimes(0);
  });

  it("supports independent selection callbacks on root menu and submenu", async () => {
    const onRootSelectionChange = vi.fn();
    const onSubmenuSelectionChange = vi.fn();
    const wrapper = mountTracked(MenuTrigger as any, {
      props: {
        defaultOpen: true,
        closeOnSelect: false,
      },
      slots: {
        default: () => [
          h("button", { "data-testid": "trigger" }, "Menu Button"),
          h(Menu as any, {
            ariaLabel: "Menu",
            selectionMode: "multiple",
            onSelectionChange: onRootSelectionChange,
          }, {
            default: () => [
              h(Item as any, { key: "alpha" }, { default: () => "Alpha" }),
              h(SubmenuTrigger as any, null, {
                default: () => [
                  h(Item as any, { key: "more" }, { default: () => "More" }),
                  h(Menu as any, {
                    ariaLabel: "Submenu",
                    selectionMode: "single",
                    onSelectionChange: onSubmenuSelectionChange,
                  }, {
                    default: () => [
                      h(Item as any, { key: "sub-1" }, { default: () => "Sub item 1" }),
                      h(Item as any, { key: "sub-2" }, { default: () => "Sub item 2" }),
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

    const alphaItem = Array.from(document.body.querySelectorAll('[role="menuitemcheckbox"]'))
      .find((item) => item.textContent?.includes("Alpha")) as HTMLElement | undefined;
    expect(alphaItem).toBeTruthy();

    alphaItem?.click();
    await wrapper.vm.$nextTick();
    expect(onRootSelectionChange).toHaveBeenCalledTimes(1);
    expect(new Set(onRootSelectionChange.mock.calls[0]?.[0] as Iterable<string>)).toEqual(new Set(["alpha"]));

    const submenuTriggerItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("More")) as HTMLElement | undefined;
    expect(submenuTriggerItem).toBeTruthy();
    submenuTriggerItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await wrapper.vm.$nextTick();

    const submenuFirstItem = Array.from(document.body.querySelectorAll('[role="menuitemradio"]'))
      .find((item) => item.textContent?.includes("Sub item 1")) as HTMLElement | undefined;
    expect(submenuFirstItem).toBeTruthy();
    submenuFirstItem?.click();
    await wrapper.vm.$nextTick();

    expect(onSubmenuSelectionChange).toHaveBeenCalledTimes(1);
    expect(new Set(onSubmenuSelectionChange.mock.calls[0]?.[0] as Iterable<string>)).toEqual(new Set(["sub-1"]));
    expect(onRootSelectionChange).toHaveBeenCalledTimes(1);
  });

  it("calls submenu onAction/onClose without triggering root callbacks", async () => {
    const onRootAction = vi.fn();
    const onRootClose = vi.fn();
    const onSubmenuAction = vi.fn();
    const onSubmenuClose = vi.fn();
    const wrapper = mountTracked(MenuTrigger as any, {
      props: {
        defaultOpen: true,
      },
      slots: {
        default: () => [
          h("button", { "data-testid": "trigger" }, "Menu Button"),
          h(Menu as any, { ariaLabel: "Menu", onAction: onRootAction, onClose: onRootClose }, {
            default: () => [
              h(SubmenuTrigger as any, null, {
                default: () => [
                  h(Item as any, { key: "more" }, { default: () => "More" }),
                  h(Menu as any, {
                    ariaLabel: "Submenu",
                    onAction: onSubmenuAction,
                    onClose: onSubmenuClose,
                  }, {
                    default: () => [
                      h(Item as any, { key: "sub-1" }, { default: () => "Sub item 1" }),
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

    const submenuTriggerItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("More")) as HTMLElement | undefined;
    expect(submenuTriggerItem).toBeTruthy();
    submenuTriggerItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(2);

    const submenuItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("Sub item 1")) as HTMLElement | undefined;
    expect(submenuItem).toBeTruthy();
    submenuItem?.click();
    await wrapper.vm.$nextTick();

    expect(onSubmenuAction).toHaveBeenCalledTimes(1);
    expect(onSubmenuAction).toHaveBeenLastCalledWith("sub-1");
    expect(onSubmenuClose).toHaveBeenCalledTimes(1);
    expect(onRootAction).toHaveBeenCalledTimes(0);
    expect(onRootClose).toHaveBeenCalledTimes(0);
    expect(document.body.querySelectorAll('[role="menu"]')).toHaveLength(0);
  });

  it("closes submenu when focus moves to a sibling item in the parent menu", async () => {
    const wrapper = mountTracked(MenuTrigger as any, {
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

    const submenuTriggerItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("More")) as HTMLElement | undefined;
    const siblingItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("Alpha")) as HTMLElement | undefined;
    expect(submenuTriggerItem).toBeTruthy();
    expect(siblingItem).toBeTruthy();

    submenuTriggerItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(2);

    siblingItem?.focus();
    siblingItem?.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(document.body.querySelectorAll('[role="menu"]')).toHaveLength(1);
    expect(document.body.textContent).not.toContain("Sub item");
  });

  it("closes submenu on Escape without closing root menu", async () => {
    const onRootClose = vi.fn();
    const onSubmenuClose = vi.fn();
    const wrapper = mountTracked(MenuTrigger as any, {
      props: {
        defaultOpen: true,
      },
      slots: {
        default: () => [
          h("button", { "data-testid": "trigger" }, "Menu Button"),
          h(Menu as any, { ariaLabel: "Menu", onClose: onRootClose }, {
            default: () => [
              h(SubmenuTrigger as any, null, {
                default: () => [
                  h(Item as any, { key: "more" }, { default: () => "More" }),
                  h(Menu as any, { ariaLabel: "Submenu", onClose: onSubmenuClose }, {
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
    expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(2);
    await wrapper.vm.$nextTick();

    const submenuPopover = Array.from(document.body.querySelectorAll(".spectrum-Menu-popover"))
      .find((popover) => popover.textContent?.includes("Sub item")) as HTMLElement | undefined;
    expect(submenuPopover).toBeTruthy();
    await wrapper.vm.$nextTick();

    submenuPopover?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(document.body.querySelectorAll('[role="menu"]')).toHaveLength(1);
    expect(document.body.textContent).not.toContain("Sub item");
    expect(onRootClose).toHaveBeenCalledTimes(0);
    expect(onSubmenuClose).toHaveBeenCalledTimes(0);
  });

  it("does not select submenu triggers even when selectedKeys includes the trigger key", async () => {
    const wrapper = mountTracked(MenuTrigger as any, {
      props: {
        defaultOpen: true,
      },
      slots: {
        default: () => [
          h("button", { "data-testid": "trigger" }, "Menu Button"),
          h(Menu as any, {
            ariaLabel: "Menu",
            selectionMode: "multiple",
            selectedKeys: ["alpha", "more"],
          }, {
            default: () => [
              h(Item as any, { key: "alpha" }, { default: () => "Alpha" }),
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
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    const checkedItems = Array.from(document.body.querySelectorAll('[role="menuitemcheckbox"]')) as HTMLElement[];
    expect(checkedItems).toHaveLength(1);
    expect(checkedItems[0]?.textContent).toContain("Alpha");
    expect(checkedItems[0]?.getAttribute("aria-checked")).toBe("true");

    const submenuTriggerItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("More")) as HTMLElement | undefined;
    expect(submenuTriggerItem).toBeTruthy();
    expect(submenuTriggerItem?.getAttribute("aria-checked")).toBeNull();
    expect(submenuTriggerItem?.getAttribute("aria-expanded")).toBe("false");

    await wrapper.vm.$nextTick();
  });
});
