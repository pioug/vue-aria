import { mount } from "@vue/test-utils";
import { I18nProvider } from "@vue-aria/i18n";
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

  it.each([
    { name: "static", dynamic: false },
    { name: "dynamic", dynamic: true },
  ])("renders nested submenu content for $name composition", async ({ dynamic }) => {
    const level1Items = ["Lvl 1 Item 1", "Lvl 1 Item 3"];
    const level2Items = ["Lvl 2 Item 1", "Lvl 2 Item 2", "Lvl 2 Item 3"];
    const level3Items = ["Lvl 3 Item 1", "Lvl 3 Item 2", "Lvl 3 Item 3"];

    const renderLevel3Menu = () =>
      h(Menu as any, { ariaLabel: "Submenu 2" }, {
        default: () =>
          level3Items.map((label, index) =>
            h(Item as any, { key: `lvl3-${index + 1}` }, { default: () => label })
          ),
      });

    const renderLevel2Content = () => {
      if (!dynamic) {
        return [
          h(Item as any, { key: "lvl2-1" }, { default: () => "Lvl 2 Item 1" }),
          h(Item as any, { key: "lvl2-2" }, { default: () => "Lvl 2 Item 2" }),
          h(SubmenuTrigger as any, null, {
            default: () => [
              h(Item as any, { key: "lvl2-3" }, { default: () => "Lvl 2 Item 3" }),
              renderLevel3Menu(),
            ],
          }),
        ];
      }

      return level2Items.map((label, index) => {
        const key = `lvl2-${index + 1}`;
        if (index !== 2) {
          return h(Item as any, { key }, { default: () => label });
        }

        return h(SubmenuTrigger as any, null, {
          default: () => [
            h(Item as any, { key }, { default: () => label }),
            renderLevel3Menu(),
          ],
        });
      });
    };

    const wrapper = mountTracked(MenuTrigger as any, {
      props: {
        defaultOpen: true,
      },
      slots: {
        default: () => [
          h("button", { "data-testid": "trigger" }, "Menu Button"),
          h(Menu as any, { ariaLabel: "Menu" }, {
            default: () => [
              h(Item as any, { key: "lvl1-1" }, { default: () => level1Items[0] }),
              h(SubmenuTrigger as any, null, {
                default: () => [
                  h(Item as any, { key: "lvl1-2" }, { default: () => "Lvl 1 Item 2" }),
                  h(Menu as any, { ariaLabel: "Submenu 1" }, {
                    default: () => renderLevel2Content(),
                  }),
                ],
              }),
              h(Item as any, { key: "lvl1-3" }, { default: () => level1Items[1] }),
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    const rootTrigger = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("Lvl 1 Item 2")) as HTMLElement | undefined;
    expect(rootTrigger).toBeTruthy();
    expect(rootTrigger?.getAttribute("aria-haspopup")).toBe("menu");
    expect(rootTrigger?.getAttribute("aria-expanded")).toBe("false");

    rootTrigger?.click();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    let menus = Array.from(document.body.querySelectorAll('[role="menu"]')) as HTMLElement[];
    expect(menus.length).toBeGreaterThanOrEqual(2);
    const submenu1 = menus.find((menu) => menu.textContent?.includes("Lvl 2 Item 1"));
    expect(submenu1).toBeTruthy();
    expect(submenu1?.getAttribute("aria-labelledby")).toBe(rootTrigger?.id ?? null);

    const openedRootTrigger = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("Lvl 1 Item 2")) as HTMLElement | undefined;
    expect(openedRootTrigger?.getAttribute("aria-expanded")).toBe("true");
    expect(openedRootTrigger?.getAttribute("aria-controls")).toBe(submenu1?.id ?? null);

    const submenu1Items = Array.from(submenu1?.querySelectorAll('[role="menuitem"]') ?? []) as HTMLElement[];
    expect(submenu1Items).toHaveLength(3);
    expect(submenu1Items[2]?.textContent).toContain("Lvl 2 Item 3");

    const nestedTrigger = submenu1Items[2];
    expect(nestedTrigger?.getAttribute("aria-haspopup")).toBe("menu");
    expect(nestedTrigger?.getAttribute("aria-expanded")).toBe("false");

    nestedTrigger?.click();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    menus = Array.from(document.body.querySelectorAll('[role="menu"]')) as HTMLElement[];
    expect(menus.length).toBeGreaterThanOrEqual(3);
    const submenu2 = menus.find((menu) => menu.textContent?.includes("Lvl 3 Item 1"));
    expect(submenu2).toBeTruthy();
    expect(submenu2?.getAttribute("aria-labelledby")).toBe(nestedTrigger?.id ?? null);

    const openedNestedTrigger = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("Lvl 2 Item 3")) as HTMLElement | undefined;
    expect(openedNestedTrigger?.getAttribute("aria-expanded")).toBe("true");
    expect(openedNestedTrigger?.getAttribute("aria-controls")).toBe(submenu2?.id ?? null);

    const submenu2Items = Array.from(submenu2?.querySelectorAll('[role="menuitem"]') ?? []) as HTMLElement[];
    expect(submenu2Items).toHaveLength(3);
    expect(submenu2Items[2]?.textContent).toContain("Lvl 3 Item 3");
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

  it("opens and closes a nested submenu with rtl arrow keys", async () => {
    const wrapper = mountTracked(I18nProvider as any, {
      props: {
        locale: "ar-AE",
      },
      slots: {
        default: () =>
          h(MenuTrigger as any, { defaultOpen: true }, {
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
          }),
      },
      attachTo: document.body,
    });

    const submenuTriggerItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("More")) as HTMLElement | undefined;
    expect(submenuTriggerItem).toBeTruthy();
    submenuTriggerItem?.focus();
    submenuTriggerItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const openedTrigger = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("More")) as HTMLElement | undefined;
    expect(openedTrigger?.getAttribute("aria-expanded")).toBe("true");
    expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(2);

    const submenuItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("Sub item")) as HTMLElement | undefined;
    expect(submenuItem).toBeTruthy();
    submenuItem?.focus();
    submenuItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const collapsedTrigger = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("More")) as HTMLElement | undefined;
    expect(collapsedTrigger?.getAttribute("aria-expanded")).toBe("false");
    expect(document.body.querySelectorAll('[role="menu"]')).toHaveLength(1);
  });

  it("opens a nested submenu with keyboard Enter and closes on Escape", async () => {
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
    expect(submenuTriggerItem).toBeTruthy();
    submenuTriggerItem?.focus();
    submenuTriggerItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const openedTrigger = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("More")) as HTMLElement | undefined;
    expect(openedTrigger?.getAttribute("aria-expanded")).toBe("true");
    expect(openedTrigger?.getAttribute("aria-controls")).toBeTruthy();
    expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(2);

    const submenuPopover = Array.from(document.body.querySelectorAll(".spectrum-Menu-popover"))
      .find((popover) => popover.textContent?.includes("Sub item")) as HTMLElement | undefined;
    expect(submenuPopover).toBeTruthy();
    submenuPopover?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const collapsedTrigger = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("More")) as HTMLElement | undefined;
    expect(collapsedTrigger?.getAttribute("aria-expanded")).toBe("false");
    expect(collapsedTrigger?.getAttribute("aria-controls")).toBeNull();
    expect(document.body.querySelectorAll('[role="menu"]')).toHaveLength(1);
  });

  it("links submenu trigger aria-controls and submenu aria-labelledby when opened", async () => {
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
    expect(submenuTriggerItem).toBeTruthy();
    expect(submenuTriggerItem?.getAttribute("aria-haspopup")).toBe("menu");
    expect(submenuTriggerItem?.getAttribute("aria-expanded")).toBe("false");
    expect(submenuTriggerItem?.getAttribute("aria-controls")).toBeNull();

    submenuTriggerItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await wrapper.vm.$nextTick();

    const menus = Array.from(document.body.querySelectorAll('[role="menu"]')) as HTMLElement[];
    const submenu = menus.find((menu) => menu.textContent?.includes("Sub item"));
    const openedTrigger = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("More")) as HTMLElement | undefined;
    expect(submenu).toBeTruthy();
    expect(openedTrigger?.getAttribute("aria-expanded")).toBe("true");
    expect(openedTrigger?.getAttribute("aria-controls")).toBe(submenu?.id ?? null);
    expect(submenu?.getAttribute("aria-labelledby")).toBe(openedTrigger?.id ?? null);
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

  it("opens submenu when hovering a submenu trigger item", async () => {
    vi.useFakeTimers();
    try {
      const wrapper = mountTracked(MenuTrigger as any, {
        props: {
          defaultOpen: true,
        },
        slots: {
          default: () => [
            h("button", { "data-testid": "trigger" }, "Menu Button"),
            h(Menu as any, { ariaLabel: "Menu" }, {
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

      const submenuTriggerItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
        .find((item) => item.textContent?.includes("More")) as HTMLElement | undefined;
      expect(submenuTriggerItem).toBeTruthy();

      if (typeof PointerEvent !== "undefined") {
        submenuTriggerItem?.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse" }));
        submenuTriggerItem?.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
      } else {
        submenuTriggerItem?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
        submenuTriggerItem?.dispatchEvent(new Event("pointerover", { bubbles: true }));
      }

      vi.runAllTimers();
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      const openedTrigger = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
        .find((item) => item.textContent?.includes("More")) as HTMLElement | undefined;
      expect(openedTrigger?.getAttribute("aria-expanded")).toBe("true");
      expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(2);
      expect(document.body.textContent).toContain("Sub item");
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not open submenu on hover in small-screen tray mode", async () => {
    const screenWidthSpy = vi.spyOn(window.screen, "width", "get").mockImplementation(() => 700);
    vi.useFakeTimers();
    try {
      const wrapper = mountTracked(MenuTrigger as any, {
        props: {
          defaultOpen: true,
        },
        slots: {
          default: () => [
            h("button", { "data-testid": "trigger" }, "Menu Button"),
            h(Menu as any, { ariaLabel: "Menu" }, {
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

      const submenuTriggerItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
        .find((item) => item.textContent?.includes("More")) as HTMLElement | undefined;
      expect(submenuTriggerItem).toBeTruthy();

      if (typeof PointerEvent !== "undefined") {
        submenuTriggerItem?.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse" }));
        submenuTriggerItem?.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
      } else {
        submenuTriggerItem?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
        submenuTriggerItem?.dispatchEvent(new Event("pointerover", { bubbles: true }));
      }

      vi.runAllTimers();
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      const triggerAfterHover = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
        .find((item) => item.textContent?.includes("More")) as HTMLElement | undefined;
      expect(triggerAfterHover?.getAttribute("aria-expanded")).toBe("false");
      expect(document.body.querySelectorAll('[role="menu"]')).toHaveLength(1);
      expect(document.body.textContent).not.toContain("Sub item");
    } finally {
      screenWidthSpy.mockRestore();
      vi.useRealTimers();
    }
  });

  it("does not close an open submenu on hover in small-screen tray mode", async () => {
    const screenWidthSpy = vi.spyOn(window.screen, "width", "get").mockImplementation(() => 700);
    vi.useFakeTimers();
    try {
      const wrapper = mountTracked(MenuTrigger as any, {
        props: {
          defaultOpen: true,
        },
        slots: {
          default: () => [
            h("button", { "data-testid": "trigger" }, "Menu Button"),
            h(Menu as any, { ariaLabel: "Menu" }, {
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

      const rootItems = Array.from(document.body.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
      const siblingItem = rootItems.find((item) => item.textContent?.includes("Alpha"));
      const submenuTriggerItem = rootItems.find((item) => item.textContent?.includes("More"));
      expect(siblingItem).toBeTruthy();
      expect(submenuTriggerItem).toBeTruthy();

      submenuTriggerItem?.click();
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();
      expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(2);

      if (typeof PointerEvent !== "undefined") {
        siblingItem?.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse" }));
        siblingItem?.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
      } else {
        siblingItem?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
        siblingItem?.dispatchEvent(new Event("pointerover", { bubbles: true }));
      }

      vi.runAllTimers();
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      const triggerAfterHover = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
        .find((item) => item.textContent?.includes("More")) as HTMLElement | undefined;
      expect(triggerAfterHover?.getAttribute("aria-expanded")).toBe("true");
      expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(2);
      expect(document.body.textContent).toContain("Sub item");
    } finally {
      screenWidthSpy.mockRestore();
      vi.useRealTimers();
    }
  });

  it("opens submenu when pressing a submenu trigger item with pointer click", async () => {
    const wrapper = mountTracked(MenuTrigger as any, {
      props: {
        defaultOpen: true,
      },
      slots: {
        default: () => [
          h("button", { "data-testid": "trigger" }, "Menu Button"),
          h(Menu as any, { ariaLabel: "Menu" }, {
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

    const submenuTriggerItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("More")) as HTMLElement | undefined;
    expect(submenuTriggerItem).toBeTruthy();

    submenuTriggerItem?.click();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const openedTrigger = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("More")) as HTMLElement | undefined;
    expect(openedTrigger?.getAttribute("aria-expanded")).toBe("true");
    expect(openedTrigger?.getAttribute("aria-controls")).toBeTruthy();
    expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(2);
    expect(document.body.textContent).toContain("Sub item");
  });

  it("keeps submenu open when pointer moves from submenu content back to its trigger", async () => {
    const wrapper = mountTracked(MenuTrigger as any, {
      props: {
        defaultOpen: true,
      },
      slots: {
        default: () => [
          h("button", { "data-testid": "trigger" }, "Menu Button"),
          h(Menu as any, { ariaLabel: "Menu" }, {
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

    const rootItems = Array.from(document.body.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
    const submenuTriggerItem = rootItems.find((item) => item.textContent?.includes("More"));
    expect(submenuTriggerItem).toBeTruthy();

    submenuTriggerItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(2);

    const submenuItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("Sub item")) as HTMLElement | undefined;
    expect(submenuItem).toBeTruthy();

    const hover = (element: HTMLElement) => {
      if (typeof PointerEvent !== "undefined") {
        element.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse" }));
        element.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
        return;
      }

      element.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      element.dispatchEvent(new Event("pointerover", { bubbles: true }));
    };

    hover(submenuItem as HTMLElement);
    hover(submenuTriggerItem as HTMLElement);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(2);
  });

  it("closes submenu when pointer hover moves from submenu content to a sibling item", async () => {
    const wrapper = mountTracked(MenuTrigger as any, {
      props: {
        defaultOpen: true,
      },
      slots: {
        default: () => [
          h("button", { "data-testid": "trigger" }, "Menu Button"),
          h(Menu as any, { ariaLabel: "Menu" }, {
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

    const rootItems = Array.from(document.body.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
    const siblingItem = rootItems.find((item) => item.textContent?.includes("Alpha"));
    const submenuTriggerItem = rootItems.find((item) => item.textContent?.includes("More"));
    expect(siblingItem).toBeTruthy();
    expect(submenuTriggerItem).toBeTruthy();

    submenuTriggerItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(2);

    const submenuItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("Sub item")) as HTMLElement | undefined;
    expect(submenuItem).toBeTruthy();

    const hover = (element: HTMLElement) => {
      if (typeof PointerEvent !== "undefined") {
        element.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse" }));
        element.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
        return;
      }

      element.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      element.dispatchEvent(new Event("pointerover", { bubbles: true }));
    };

    hover(submenuItem as HTMLElement);
    hover(siblingItem as HTMLElement);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(document.body.querySelectorAll('[role="menu"]')).toHaveLength(1);
  });

  it("closes submenu when pointer hover moves from submenu trigger to a sibling item", async () => {
    const wrapper = mountTracked(MenuTrigger as any, {
      props: {
        defaultOpen: true,
      },
      slots: {
        default: () => [
          h("button", { "data-testid": "trigger" }, "Menu Button"),
          h(Menu as any, { ariaLabel: "Menu" }, {
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

    const rootItems = Array.from(document.body.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
    const siblingItem = rootItems.find((item) => item.textContent?.includes("Alpha"));
    const submenuTriggerItem = rootItems.find((item) => item.textContent?.includes("More"));
    expect(siblingItem).toBeTruthy();
    expect(submenuTriggerItem).toBeTruthy();

    submenuTriggerItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(2);

    const hover = (element: HTMLElement) => {
      if (typeof PointerEvent !== "undefined") {
        element.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse" }));
        element.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
        return;
      }

      element.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      element.dispatchEvent(new Event("pointerover", { bubbles: true }));
    };

    hover(submenuTriggerItem as HTMLElement);
    hover(siblingItem as HTMLElement);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(document.body.querySelectorAll('[role="menu"]')).toHaveLength(1);
  });

  it("updates submenu trigger aria-expanded when sibling hover closes an open submenu", async () => {
    const wrapper = mountTracked(MenuTrigger as any, {
      props: {
        defaultOpen: true,
      },
      slots: {
        default: () => [
          h("button", { "data-testid": "trigger" }, "Menu Button"),
          h(Menu as any, { ariaLabel: "Menu" }, {
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

    const rootItems = Array.from(document.body.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
    const siblingItem = rootItems.find((item) => item.textContent?.includes("Alpha"));
    const submenuTriggerItem = rootItems.find((item) => item.textContent?.includes("More"));
    expect(siblingItem).toBeTruthy();
    expect(submenuTriggerItem).toBeTruthy();

    submenuTriggerItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await wrapper.vm.$nextTick();
    const openedTrigger = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("More")) as HTMLElement | undefined;
    expect(openedTrigger?.getAttribute("aria-expanded")).toBe("true");
    expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(2);

    if (typeof PointerEvent !== "undefined") {
      siblingItem?.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse" }));
      siblingItem?.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
    } else {
      siblingItem?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      siblingItem?.dispatchEvent(new Event("pointerover", { bubbles: true }));
    }

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const closedTrigger = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("More")) as HTMLElement | undefined;
    expect(closedTrigger?.getAttribute("aria-expanded")).toBe("false");
    expect(closedTrigger?.getAttribute("aria-controls")).toBeNull();
    expect(document.body.querySelectorAll('[role="menu"]')).toHaveLength(1);
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

  it("does not trigger root onOpenChange when submenus open and close", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mountTracked(MenuTrigger as any, {
      props: {
        onOpenChange,
      },
      slots: {
        default: () => [
          h("button", { "data-testid": "trigger" }, "Menu Button"),
          h(Menu as any, { ariaLabel: "Menu" }, {
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

    const triggerButton = document.body.querySelector('[data-testid="trigger"]') as HTMLElement | null;
    expect(triggerButton).toBeTruthy();
    triggerButton?.click();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    const rootItems = Array.from(document.body.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
    const siblingItem = rootItems.find((item) => item.textContent?.includes("Alpha"));
    const submenuTriggerItem = rootItems.find((item) => item.textContent?.includes("More"));
    expect(siblingItem).toBeTruthy();
    expect(submenuTriggerItem).toBeTruthy();

    submenuTriggerItem?.click();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(2);
    expect(onOpenChange).toHaveBeenCalledTimes(1);

    const hover = (element: HTMLElement) => {
      if (typeof PointerEvent !== "undefined") {
        element.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse" }));
        element.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
        return;
      }

      element.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      element.dispatchEvent(new Event("pointerover", { bubbles: true }));
    };

    hover(siblingItem as HTMLElement);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(document.body.querySelectorAll('[role="menu"]')).toHaveLength(1);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });

  it("closes only the deepest submenu on ArrowLeft when nested trigger has focus", async () => {
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
                  h(Item as any, { key: "more-1" }, { default: () => "More 1" }),
                  h(Menu as any, { ariaLabel: "Submenu 1" }, {
                    default: () => [
                      h(Item as any, { key: "sub-1" }, { default: () => "Sub item 1" }),
                      h(SubmenuTrigger as any, null, {
                        default: () => [
                          h(Item as any, { key: "more-2" }, { default: () => "More 2" }),
                          h(Menu as any, { ariaLabel: "Submenu 2" }, {
                            default: () => [
                              h(Item as any, { key: "deep-1" }, { default: () => "Deep item" }),
                            ],
                          }),
                        ],
                      }),
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

    const firstTrigger = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("More 1")) as HTMLElement | undefined;
    expect(firstTrigger).toBeTruthy();
    firstTrigger?.focus();
    firstTrigger?.click();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(2);

    const secondTrigger = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("More 2")) as HTMLElement | undefined;
    expect(secondTrigger).toBeTruthy();
    secondTrigger?.focus();
    secondTrigger?.click();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(document.body.textContent).toContain("Deep item");
    expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(3);

    secondTrigger?.focus();
    secondTrigger?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(document.body.textContent).not.toContain("Deep item");
    expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(2);
  });

  it("closes only the deepest submenu on ArrowRight when nested trigger has focus in rtl", async () => {
    const wrapper = mountTracked(I18nProvider as any, {
      props: {
        locale: "ar-AE",
      },
      slots: {
        default: () =>
          h(MenuTrigger as any, { defaultOpen: true }, {
            default: () => [
              h("button", { "data-testid": "trigger" }, "Menu Button"),
              h(Menu as any, { ariaLabel: "Menu" }, {
                default: () => [
                  h(SubmenuTrigger as any, null, {
                    default: () => [
                      h(Item as any, { key: "more-1" }, { default: () => "More 1" }),
                      h(Menu as any, { ariaLabel: "Submenu 1" }, {
                        default: () => [
                          h(Item as any, { key: "sub-1" }, { default: () => "Sub item 1" }),
                          h(SubmenuTrigger as any, null, {
                            default: () => [
                              h(Item as any, { key: "more-2" }, { default: () => "More 2" }),
                              h(Menu as any, { ariaLabel: "Submenu 2" }, {
                                default: () => [
                                  h(Item as any, { key: "deep-1" }, { default: () => "Deep item" }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  h(Item as any, { key: "alpha" }, { default: () => "Alpha" }),
                ],
              }),
            ],
          }),
      },
      attachTo: document.body,
    });

    const firstTrigger = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("More 1")) as HTMLElement | undefined;
    expect(firstTrigger).toBeTruthy();
    firstTrigger?.focus();
    firstTrigger?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(2);

    const secondTrigger = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("More 2")) as HTMLElement | undefined;
    expect(secondTrigger).toBeTruthy();
    secondTrigger?.focus();
    secondTrigger?.click();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(document.body.textContent).toContain("Deep item");
    expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(3);

    secondTrigger?.focus();
    secondTrigger?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(document.body.textContent).not.toContain("Deep item");
    expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(2);
  });

  it("closes nested submenu stacks when hovering a root sibling from deepest submenu", async () => {
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
                  h(Item as any, { key: "more-1" }, { default: () => "More 1" }),
                  h(Menu as any, { ariaLabel: "Submenu 1" }, {
                    default: () => [
                      h(Item as any, { key: "sub-1" }, { default: () => "Sub item 1" }),
                      h(SubmenuTrigger as any, null, {
                        default: () => [
                          h(Item as any, { key: "more-2" }, { default: () => "More 2" }),
                          h(Menu as any, { ariaLabel: "Submenu 2" }, {
                            default: () => [
                              h(Item as any, { key: "deep-1" }, { default: () => "Deep item" }),
                            ],
                          }),
                        ],
                      }),
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

    const firstTrigger = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("More 1")) as HTMLElement | undefined;
    expect(firstTrigger).toBeTruthy();
    firstTrigger?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(2);

    const secondTrigger = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("More 2")) as HTMLElement | undefined;
    expect(secondTrigger).toBeTruthy();
    secondTrigger?.click();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(document.body.textContent).toContain("Deep item");
    expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(3);

    const deepItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("Deep item")) as HTMLElement | undefined;
    const rootSibling = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("Alpha")) as HTMLElement | undefined;
    expect(deepItem).toBeTruthy();
    expect(rootSibling).toBeTruthy();

    const hover = (element: HTMLElement) => {
      if (typeof PointerEvent !== "undefined") {
        element.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse" }));
        element.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
        return;
      }

      element.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      element.dispatchEvent(new Event("pointerover", { bubbles: true }));
    };

    hover(deepItem as HTMLElement);
    hover(rootSibling as HTMLElement);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(document.body.querySelectorAll('[role="menu"]')).toHaveLength(1);
    expect(document.body.textContent).not.toContain("Deep item");
  });

  it("keeps nested submenus open when pressing Tab", async () => {
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
                  h(Item as any, { key: "more-1" }, { default: () => "More 1" }),
                  h(Menu as any, { ariaLabel: "Submenu 1" }, {
                    default: () => [
                      h(Item as any, { key: "sub-1" }, { default: () => "Sub item 1" }),
                      h(SubmenuTrigger as any, null, {
                        default: () => [
                          h(Item as any, { key: "more-2" }, { default: () => "More 2" }),
                          h(Menu as any, { ariaLabel: "Submenu 2" }, {
                            default: () => [
                              h(Item as any, { key: "deep-1" }, { default: () => "Deep item" }),
                            ],
                          }),
                        ],
                      }),
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

    const firstTrigger = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("More 1")) as HTMLElement | undefined;
    expect(firstTrigger).toBeTruthy();
    firstTrigger?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await wrapper.vm.$nextTick();

    const secondTrigger = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("More 2")) as HTMLElement | undefined;
    expect(secondTrigger).toBeTruthy();
    secondTrigger?.focus();
    secondTrigger?.click();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(document.body.textContent).toContain("Deep item");
    expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(3);

    const focusedBeforeTab = document.activeElement as HTMLElement | null;
    expect(focusedBeforeTab).toBeTruthy();

    focusedBeforeTab?.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    focusedBeforeTab?.dispatchEvent(new KeyboardEvent("keyup", { key: "Tab", bubbles: true }));
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(document.body.textContent).toContain("Deep item");
    expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(3);
    expect(document.activeElement).toBe(focusedBeforeTab);
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
    submenuTriggerItem?.click();
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

  it("closes submenu when keyboard focus moves from trigger to a sibling item", async () => {
    const wrapper = mountTracked(MenuTrigger as any, {
      props: {
        defaultOpen: true,
      },
      slots: {
        default: () => [
          h("button", { "data-testid": "trigger" }, "Menu Button"),
          h(Menu as any, { ariaLabel: "Menu" }, {
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
    const submenuTriggerItem = rootItems.find((item) => item.textContent?.includes("More"));
    expect(firstItem).toBeTruthy();
    expect(submenuTriggerItem).toBeTruthy();

    submenuTriggerItem?.click();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(document.body.querySelectorAll('[role="menu"]').length).toBeGreaterThanOrEqual(2);

    submenuTriggerItem?.focus();
    submenuTriggerItem?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(document.activeElement).toBe(firstItem);
    expect(document.body.querySelectorAll('[role="menu"]')).toHaveLength(1);
    expect(document.body.textContent).not.toContain("Sub item");
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
    const expandedTrigger = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("More")) as HTMLElement | undefined;
    expect(expandedTrigger?.getAttribute("aria-expanded")).toBe("true");
    expect(expandedTrigger?.getAttribute("aria-controls")).toBeTruthy();

    const submenuPopover = Array.from(document.body.querySelectorAll(".spectrum-Menu-popover"))
      .find((popover) => popover.textContent?.includes("Sub item")) as HTMLElement | undefined;
    expect(submenuPopover).toBeTruthy();
    await wrapper.vm.$nextTick();

    submenuPopover?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const collapsedTrigger = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.includes("More")) as HTMLElement | undefined;
    expect(collapsedTrigger?.getAttribute("aria-expanded")).toBe("false");
    expect(collapsedTrigger?.getAttribute("aria-controls")).toBeNull();
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
