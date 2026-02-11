import userEvent from "@testing-library/user-event";
import { fireEvent, render, waitFor, within } from "@testing-library/vue";
import { Fragment, defineComponent, h, nextTick, ref, type VNodeChild } from "vue";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_SPECTRUM_THEME_CLASS_MAP, Provider } from "@vue-spectrum/provider";
import { Item, TabList, TabPanels, Tabs, type SpectrumTabItem } from "../src";

const defaultItems: SpectrumTabItem[] = [
  { key: "tab-1", title: "Tab 1", children: "Tab 1 body" },
  { key: "tab-2", title: "Tab 2", children: "Tab 2 body" },
  { key: "tab-3", title: "Tab 3", children: "Tab 3 body" },
];

interface RenderTabsOptions {
  tabListSlot?: ((scope: { item: SpectrumTabItem }) => VNodeChild) | undefined;
  tabPanelsSlot?: ((scope: { item: SpectrumTabItem }) => VNodeChild) | undefined;
}

function renderTabs(
  props: Record<string, unknown> = {},
  items: SpectrumTabItem[] = defaultItems,
  options: RenderTabsOptions = {}
) {
  return render(Tabs, {
    props: {
      "aria-label": "Tab Sample",
      items,
      ...props,
    },
    slots: {
      default: () => [
        h(
          TabList,
          null,
          options.tabListSlot
            ? {
                default: options.tabListSlot,
              }
            : undefined
        ),
        h(
          TabPanels,
          null,
          options.tabPanelsSlot
            ? {
                default: options.tabPanelsSlot,
              }
            : undefined
        ),
      ],
    },
  });
}

async function flush(): Promise<void> {
  await nextTick();
  await nextTick();
}

describe("Tabs", () => {
  it("renders properly", async () => {
    const { getByRole } = renderTabs();
    await flush();

    const tablist = getByRole("tablist");
    const tabs = within(tablist).getAllByRole("tab");

    expect(tablist.getAttribute("aria-orientation")).toBe("horizontal");
    expect(tabs).toHaveLength(3);
    expect(tabs[0]?.getAttribute("aria-selected")).toBe("true");

    const tabpanel = getByRole("tabpanel");
    expect(tabpanel.textContent).toContain("Tab 1 body");
    expect(tabpanel.getAttribute("aria-labelledby")).toBe(tabs[0]?.id ?? null);
  });

  it("attaches a user provided ref to the outer tabs element", async () => {
    const tabsRef = ref<{ UNSAFE_getDOMNode: () => HTMLElement | null } | null>(null);
    const App = defineComponent({
      name: "TabsRefHarness",
      setup() {
        return () =>
          h(
            Tabs,
            {
              ref: tabsRef,
              "aria-label": "Tab Sample",
              items: defaultItems,
            },
            {
              default: () => [h(TabList), h(TabPanels)],
            }
          );
      },
    });
    const tree = render(App);
    await flush();

    const tablist = tree.getByRole("tablist");
    const root = tablist.closest(".spectrum-TabsPanel");
    expect(root).not.toBeNull();
    expect(tabsRef.value?.UNSAFE_getDOMNode()).toBe(root);
  });

  it("supports vertical orientation keyboard navigation", async () => {
    const { getByRole } = renderTabs({ orientation: "vertical" });
    await flush();

    const tablist = getByRole("tablist");
    const tabs = within(tablist).getAllByRole("tab");
    const firstTab = tabs[0] as HTMLElement;
    const secondTab = tabs[1] as HTMLElement;

    expect(tablist.getAttribute("aria-orientation")).toBe("vertical");

    firstTab.focus();
    fireEvent.keyDown(firstTab, { key: "ArrowDown" });
    await flush();

    expect(secondTab.getAttribute("aria-selected")).toBe("true");
  });

  it("supports horizontal arrow navigation and ignores vertical arrows", async () => {
    const { getByRole } = renderTabs({ orientation: "horizontal" });
    await flush();

    const tablist = getByRole("tablist");
    const tabs = within(tablist).getAllByRole("tab");
    const firstTab = tabs[0] as HTMLElement;
    const secondTab = tabs[1] as HTMLElement;

    firstTab.focus();
    fireEvent.keyDown(firstTab, { key: "ArrowRight" });
    await flush();
    expect(secondTab.getAttribute("aria-selected")).toBe("true");

    fireEvent.keyDown(secondTab, { key: "ArrowUp" });
    await flush();
    expect(secondTab.getAttribute("aria-selected")).toBe("true");
  });

  it("supports manual keyboard activation", async () => {
    const { getByRole } = renderTabs({
      keyboardActivation: "manual",
      defaultSelectedKey: "tab-1",
    });
    await flush();

    const tablist = getByRole("tablist");
    const tabs = within(tablist).getAllByRole("tab");
    const firstTab = tabs[0] as HTMLElement;
    const secondTab = tabs[1] as HTMLElement;

    firstTab.focus();
    fireEvent.keyDown(firstTab, { key: "ArrowRight" });
    await flush();

    expect(document.activeElement).toBe(secondTab);
    expect(secondTab.getAttribute("aria-selected")).toBe("false");

    fireEvent.keyDown(secondTab, { key: "Enter" });
    await flush();
    expect(secondTab.getAttribute("aria-selected")).toBe("true");

    const tabpanel = getByRole("tabpanel");
    expect(tabpanel.textContent).toContain("Tab 2 body");
  });

  it("supports click selection", async () => {
    const user = userEvent.setup();
    const { getByRole } = renderTabs();
    await flush();

    const tablist = getByRole("tablist");
    const tabs = within(tablist).getAllByRole("tab");

    await user.click(tabs[2] as HTMLElement);
    expect(tabs[2]?.getAttribute("aria-selected")).toBe("true");

    const tabpanel = getByRole("tabpanel");
    expect(tabpanel.textContent).toContain("Tab 3 body");
  });

  it("does not select disabled tabs and skips them on keyboard navigation", async () => {
    const user = userEvent.setup();
    const { getByRole } = renderTabs({
      disabledKeys: ["tab-2"],
      defaultSelectedKey: "tab-1",
    });
    await flush();

    const tablist = getByRole("tablist");
    const tabs = within(tablist).getAllByRole("tab");
    const firstTab = tabs[0] as HTMLElement;
    const secondTab = tabs[1] as HTMLElement;
    const thirdTab = tabs[2] as HTMLElement;

    await user.click(secondTab);
    await flush();
    expect(firstTab.getAttribute("aria-selected")).toBe("true");

    firstTab.focus();
    fireEvent.keyDown(firstTab, { key: "ArrowRight" });
    await flush();
    expect(thirdTab.getAttribute("aria-selected")).toBe("true");
  });

  it("supports controlled selected key", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const { getByRole } = renderTabs({
      selectedKey: "tab-1",
      onSelectionChange,
    });
    await flush();

    const tablist = getByRole("tablist");
    const tabs = within(tablist).getAllByRole("tab");

    await user.click(tabs[1] as HTMLElement);

    expect(onSelectionChange).toHaveBeenCalledWith("tab-2");
    expect(tabs[0]?.getAttribute("aria-selected")).toBe("true");
    expect(tabs[1]?.getAttribute("aria-selected")).toBe("false");
  });

  it("fires onSelectionChange when clicking on the current tab", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const { getByRole } = renderTabs({
      defaultSelectedKey: "tab-1",
      onSelectionChange,
    });
    await flush();

    const tablist = getByRole("tablist");
    const tabs = within(tablist).getAllByRole("tab");
    expect(tabs[0]?.getAttribute("aria-selected")).toBe("true");

    await user.click(tabs[0] as HTMLElement);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenCalledWith("tab-1");
  });

  it("supports custom props for the parent tabs element", async () => {
    const { getByTestId } = renderTabs({
      "data-testid": "tabs-root",
    });
    await flush();

    expect(getByTestId("tabs-root")).toBeTruthy();
  });

  it("supports custom props for tab items via Item slot rendering", async () => {
    const { getAllByTestId } = renderTabs(
      {},
      defaultItems,
      {
        tabListSlot: () =>
          h(Item, {
            title: "Custom label",
            "data-testid": "tab-item",
            "data-instance-id": "instance-id",
            id: "custom-id",
          }),
      }
    );
    await flush();

    const tabItems = getAllByTestId("tab-item");
    expect(tabItems).toHaveLength(3);
    for (const tabItem of tabItems) {
      expect(tabItem.getAttribute("data-instance-id")).toBe("instance-id");
      expect(tabItem.getAttribute("id")).not.toBe("custom-id");
    }
  });

  it("does not generate conflicting ids between multiple instances", async () => {
    const App = defineComponent({
      name: "TabsIdsApp",
      setup() {
        return () =>
          h("div", null, [
            h(
              Tabs,
              {
                items: defaultItems,
                "aria-label": "First tabs",
              },
              {
                default: () => [h(TabList), h(TabPanels)],
              }
            ),
            h(
              Tabs,
              {
                items: defaultItems,
                "aria-label": "Second tabs",
              },
              {
                default: () => [h(TabList), h(TabPanels)],
              }
            ),
          ]);
      },
    });

    const { getAllByRole } = render(App);
    await flush();

    const tablists = getAllByRole("tablist");
    const firstTabs = within(tablists[0] as HTMLElement).getAllByRole("tab");
    const secondTabs = within(tablists[1] as HTMLElement).getAllByRole("tab");

    expect(firstTabs).toHaveLength(secondTabs.length);
    firstTabs.forEach((tab, index) => {
      expect(tab.id).not.toBe((secondTabs[index] as HTMLElement).id);
    });
  });

  it("focuses the selected tab when tabbing in for the first time", async () => {
    const user = userEvent.setup();
    const App = defineComponent({
      name: "TabsFirstTabFocusHarness",
      setup() {
        return () =>
          h("div", null, [
            h("button", { type: "button" }, "Before"),
            h(
              Tabs,
              {
                "aria-label": "Tab Sample",
                items: defaultItems,
                defaultSelectedKey: "tab-2",
              },
              {
                default: () => [h(TabList), h(TabPanels)],
              }
            ),
          ]);
      },
    });

    const tree = render(App);
    await flush();
    await user.tab();
    await user.tab();

    const tablist = tree.getByRole("tablist");
    const tabs = within(tablist).getAllByRole("tab");
    expect(document.activeElement).toBe(tabs[1]);
  });

  it("does not focus tabs when disabled and tabbing in", async () => {
    const user = userEvent.setup();
    const App = defineComponent({
      name: "TabsDisabledTabFocusHarness",
      setup() {
        return () =>
          h("div", null, [
            h("button", { type: "button" }, "Before"),
            h(
              Tabs,
              {
                "aria-label": "Tab Sample",
                items: defaultItems,
                defaultSelectedKey: "tab-2",
                isDisabled: true,
              },
              {
                default: () => [h(TabList), h(TabPanels)],
              }
            ),
          ]);
      },
    });

    const tree = render(App);
    await flush();
    await user.tab();
    await user.tab();

    const tabpanel = tree.getByRole("tabpanel");
    expect(document.activeElement).toBe(tabpanel);
  });

  it("supports scoped slots for tab labels and panels", async () => {
    const { getByRole } = renderTabs(
      {},
      defaultItems,
      {
        tabListSlot: ({ item }) => h("span", null, `Label: ${item.title}`),
        tabPanelsSlot: ({ item }) => h("div", null, `Panel: ${item.key}`),
      }
    );

    await flush();

    const tablist = getByRole("tablist");
    expect(within(tablist).getByText("Label: Tab 1")).toBeTruthy();

    const tabpanel = getByRole("tabpanel");
    expect(tabpanel.textContent).toContain("Panel: tab-1");
  });

  it("supports Item compatibility in scoped tab slots", async () => {
    const { getByRole } = renderTabs(
      {},
      defaultItems,
      {
        tabListSlot: ({ item }) => h(Item, { title: `Item Label: ${item.title}` }),
        tabPanelsSlot: ({ item }) => h(Item, null, () => `Item Panel: ${item.key}`),
      }
    );

    await flush();

    const tablist = getByRole("tablist");
    expect(within(tablist).getByText("Item Label: Tab 1")).toBeTruthy();

    const tabpanel = getByRole("tabpanel");
    expect(tabpanel.textContent).toContain("Item Panel: tab-1");
  });

  it("supports static Item composition in TabList and TabPanels", async () => {
    const user = userEvent.setup();

    const tree = render(Tabs, {
      props: {
        "aria-label": "Static tabs",
      },
      slots: {
        default: () => [
          h(TabList, null, {
            default: () => [
              h(Item, { id: "first", title: "First tab" }),
              h(Item, { id: "second", title: "Second tab" }),
            ],
          }),
          h(TabPanels, null, {
            default: () => [
              h(Item, { id: "first" }, () => "First panel"),
              h(Item, { id: "second" }, () => "Second panel"),
            ],
          }),
        ],
      },
    });

    await flush();

    const tablist = tree.getByRole("tablist");
    const tabs = within(tablist).getAllByRole("tab");
    expect(tabs).toHaveLength(2);
    expect(tabs[0]?.getAttribute("aria-selected")).toBe("true");
    expect(tree.getByRole("tabpanel").textContent).toContain("First panel");

    await user.click(tabs[1] as HTMLElement);
    expect(tree.getByRole("tabpanel").textContent).toContain("Second panel");
  });

  it("supports aria-label on static Item tab entries", async () => {
    const tree = render(Tabs, {
      props: {
        "aria-label": "Aria tabs",
      },
      slots: {
        default: () => [
          h(TabList, null, {
            default: () => [h(Item, { id: "first", "aria-label": "Foo tab" }, () => "Tab 1"), h(Item, { id: "second" }, () => "Tab 2")],
          }),
          h(TabPanels, null, {
            default: () => [h(Item, { id: "first" }, () => "Panel 1"), h(Item, { id: "second" }, () => "Panel 2")],
          }),
        ],
      },
    });
    await flush();

    const tab = tree.getByLabelText("Foo tab");
    const tablist = tree.getByRole("tablist");
    expect(tab).toBe(within(tablist).getAllByRole("tab")[0]);
  });

  it("applies root class and tablist appearance modifiers", async () => {
    const { getByRole } = renderTabs({
      isQuiet: true,
      isEmphasized: true,
      density: "compact",
      UNSAFE_className: "custom-tabs",
    });

    await flush();

    const tabpanelContainer = getByRole("tabpanel").parentElement;
    expect(tabpanelContainer?.getAttribute("class") ?? "").toContain("custom-tabs");

    const tablist = getByRole("tablist");
    const className = tablist.getAttribute("class") ?? "";
    expect(className).toContain("spectrum-Tabs--quiet");
    expect(className).toContain("spectrum-Tabs--emphasized");
    expect(className).toContain("spectrum-Tabs--compact");
  });

  it("renders a selection indicator and repositions when selection changes", async () => {
    const user = userEvent.setup();
    const offsetLeftSpy = vi
      .spyOn(HTMLElement.prototype, "offsetLeft", "get")
      .mockImplementation(function (this: HTMLElement) {
        const key = this.getAttribute("data-v-aria-tab-key");
        if (key === "tab-2") {
          return 120;
        }

        return 0;
      });
    const offsetWidthSpy = vi
      .spyOn(HTMLElement.prototype, "offsetWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        const key = this.getAttribute("data-v-aria-tab-key");
        if (key === "tab-1") {
          return 80;
        }

        if (key === "tab-2") {
          return 140;
        }

        return 0;
      });

    try {
      const { getByRole, container } = renderTabs();
      await flush();

      const indicator = container.querySelector(
        ".spectrum-Tabs-selectionIndicator"
      ) as HTMLElement | null;
      expect(indicator).toBeTruthy();
      expect(indicator?.getAttribute("role")).toBe("presentation");
      expect(indicator?.style.width).toBe("80px");
      expect(indicator?.style.transform).toBe("translateX(0px)");

      await user.click(getByRole("tab", { name: "Tab 2" }));
      await flush();

      expect(indicator?.style.width).toBe("140px");
      expect(indicator?.style.transform).toBe("translateX(120px)");
    } finally {
      offsetLeftSpy.mockRestore();
      offsetWidthSpy.mockRestore();
    }
  });

  it("positions selection indicator from the right edge in RTL", async () => {
    const user = userEvent.setup();
    const offsetParentSpy = vi
      .spyOn(HTMLElement.prototype, "offsetParent", "get")
      .mockReturnValue({ offsetWidth: 400 } as unknown as HTMLElement);
    const offsetLeftSpy = vi
      .spyOn(HTMLElement.prototype, "offsetLeft", "get")
      .mockImplementation(function (this: HTMLElement) {
        const key = this.getAttribute("data-v-aria-tab-key");
        if (key === "tab-2") {
          return 120;
        }

        return 0;
      });
    const offsetWidthSpy = vi
      .spyOn(HTMLElement.prototype, "offsetWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        const key = this.getAttribute("data-v-aria-tab-key");
        if (key === "tab-1") {
          return 80;
        }

        if (key === "tab-2") {
          return 140;
        }

        return 0;
      });

    try {
      const App = defineComponent({
        name: "TabsRTLIndicatorHarness",
        setup() {
          return () =>
            h(
              Provider,
              {
                theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
                locale: "ar-AE",
              },
              {
                default: () =>
                  h(
                    Tabs,
                    {
                      "aria-label": "Tab Sample",
                      items: defaultItems,
                    },
                    {
                      default: () => [h(TabList), h(TabPanels)],
                    }
                  ),
              }
            );
        },
      });

      const { getByRole, container } = render(App);
      await flush();

      const indicator = container.querySelector(
        ".spectrum-Tabs-selectionIndicator"
      ) as HTMLElement | null;
      expect(indicator).toBeTruthy();

      await user.click(getByRole("tab", { name: "Tab 2" }));
      await flush();

      expect(indicator?.style.width).toBe("140px");
      expect(indicator?.style.transform).toBe("translateX(-140px)");
    } finally {
      offsetParentSpy.mockRestore();
      offsetLeftSpy.mockRestore();
      offsetWidthSpy.mockRestore();
    }
  });

  it("collapses to a picker when horizontal tabs overflow", async () => {
    const user = userEvent.setup();
    const clientWidthSpy = vi
      .spyOn(HTMLElement.prototype, "clientWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("spectrum-TabsPanel-collapseWrapper")) {
          return 320;
        }

        return 0;
      });
    const scrollWidthSpy = vi
      .spyOn(HTMLElement.prototype, "scrollWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "tablist") {
          return 1200;
        }

        return 0;
      });

    try {
      const { getByRole, queryByRole } = renderTabs();
      await flush();

      expect(queryByRole("tablist")).toBeNull();

      const picker = getByRole("button", { name: /Tab 1/i });
      expect(picker).toBeTruthy();
      const pickerContainer = picker.closest(".spectrum-Tabs-picker");
      expect(pickerContainer).not.toBeNull();
      const pickerId = pickerContainer?.getAttribute("id");
      expect(pickerId).not.toBeNull();
      expect(getByRole("tabpanel").getAttribute("aria-labelledby")).toBe(pickerId);
      expect(getByRole("tabpanel").getAttribute("aria-labelledby")).toBe(pickerId);

      await user.click(picker);
      const option = getByRole("option", { name: "Tab 2" });
      await user.click(option);
      await flush();

      const tabpanel = getByRole("tabpanel");
      expect(tabpanel.textContent).toContain("Tab 2 body");
    } finally {
      clientWidthSpy.mockRestore();
      scrollWidthSpy.mockRestore();
    }
  });

  it("composes collapsed picker aria-labelledby from aria-label and external aria-labelledby", async () => {
    const externalLabel = document.createElement("span");
    externalLabel.id = "external-label";
    externalLabel.textContent = "External label";
    document.body.append(externalLabel);

    const clientWidthSpy = vi
      .spyOn(HTMLElement.prototype, "clientWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("spectrum-TabsPanel-collapseWrapper")) {
          return 320;
        }

        return 0;
      });
    const scrollWidthSpy = vi
      .spyOn(HTMLElement.prototype, "scrollWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "tablist") {
          return 1200;
        }

        return 0;
      });

    try {
      const { getByRole } = renderTabs({
        "aria-label": "Test Tabs",
        "aria-labelledby": "external-label",
      });
      await flush();

      const picker = getByRole("button", { name: /Tab 1/i });
      expect(picker.getAttribute("aria-label")).toBeNull();
      const pickerContainer = picker.closest(".spectrum-Tabs-picker");
      expect(pickerContainer).not.toBeNull();
      const pickerId = pickerContainer?.getAttribute("id");
      expect(pickerId).not.toBeNull();

      const labelledby = picker.getAttribute("aria-labelledby");
      expect(labelledby).toBeTruthy();
      const labelledbyIds = (labelledby ?? "").split(" ");
      expect(labelledbyIds).toContain("external-label");
      expect(labelledbyIds).toContain(pickerId ?? "");

      const hiddenLabelId = labelledbyIds.find(
        (id) => id !== "external-label" && id !== pickerId
      );
      expect(hiddenLabelId).toBeTruthy();
      expect(document.getElementById(hiddenLabelId ?? "")?.textContent).toBe("Test Tabs");
    } finally {
      externalLabel.remove();
      clientWidthSpy.mockRestore();
      scrollWidthSpy.mockRestore();
    }
  });

  it("does not select disabled tabs via the collapsed picker", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const clientWidthSpy = vi
      .spyOn(HTMLElement.prototype, "clientWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("spectrum-TabsPanel-collapseWrapper")) {
          return 320;
        }

        return 0;
      });
    const scrollWidthSpy = vi
      .spyOn(HTMLElement.prototype, "scrollWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "tablist") {
          return 1200;
        }

        return 0;
      });

    try {
      const { getByRole, queryByRole } = renderTabs({
        defaultSelectedKey: "tab-1",
        disabledKeys: ["tab-3"],
        onSelectionChange,
      });
      await flush();
      expect(queryByRole("tablist")).toBeNull();

      const picker = getByRole("button", { name: /Tab 1/i });
      await user.click(picker);

      const disabledOption = getByRole("option", { name: "Tab 3" });
      expect(disabledOption.getAttribute("aria-disabled")).toBe("true");
      await user.click(disabledOption);
      expect(onSelectionChange).not.toHaveBeenCalled();

      const enabledOption = getByRole("option", { name: "Tab 2" });
      await user.click(enabledOption);
      await flush();

      expect(onSelectionChange).toHaveBeenCalledWith("tab-2");
      expect(getByRole("tabpanel").textContent).toContain("Tab 2 body");
    } finally {
      clientWidthSpy.mockRestore();
      scrollWidthSpy.mockRestore();
    }
  });

  it("does not collapse when all tabs fit horizontally", async () => {
    const clientWidthSpy = vi
      .spyOn(HTMLElement.prototype, "clientWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("spectrum-TabsPanel-collapseWrapper")) {
          return 1200;
        }

        return 0;
      });
    const scrollWidthSpy = vi
      .spyOn(HTMLElement.prototype, "scrollWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "tablist") {
          return 300;
        }

        return 0;
      });

    try {
      const { getByRole, queryByRole } = renderTabs();
      await flush();

      expect(getByRole("tablist")).toBeTruthy();
      expect(queryByRole("button", { name: /Tab 1/i })).toBeNull();
    } finally {
      clientWidthSpy.mockRestore();
      scrollWidthSpy.mockRestore();
    }
  });

  it("supports tabs as links", async () => {
    const user = userEvent.setup();
    const linkItems: SpectrumTabItem[] = [
      { key: "one", title: "One", href: "#one", children: "One panel" },
      { key: "two", title: "Two", href: "#two", children: "Two panel" },
      { key: "three", title: "Three", href: "#three", children: "Three panel" },
    ];

    const { getByRole } = renderTabs({}, linkItems);
    await flush();

    const tablist = getByRole("tablist");
    const tabs = within(tablist).getAllByRole("tab");
    expect((tabs[0] as HTMLElement).tagName).toBe("A");
    expect(tabs[0]?.getAttribute("href")).toBe("#one");
    expect((tabs[1] as HTMLElement).tagName).toBe("A");
    expect(tabs[1]?.getAttribute("href")).toBe("#two");
    expect((tabs[2] as HTMLElement).tagName).toBe("A");
    expect(tabs[2]?.getAttribute("href")).toBe("#three");

    await user.click(tabs[1] as HTMLElement);
    expect(tabs[1]?.getAttribute("aria-selected")).toBe("true");

    fireEvent.keyDown(tabs[1] as HTMLElement, { key: "ArrowRight" });
    await flush();
    expect(tabs[2]?.getAttribute("aria-selected")).toBe("true");
  });

  it("updates tab index when selected key changes programmatically", async () => {
    const App = defineComponent({
      name: "TabsControlledTabIndexHarness",
      props: {
        selectedKey: {
          type: String,
          required: true,
        },
      },
      setup(componentProps) {
        return () =>
          h(Tabs, {
            "aria-label": "Tab Sample",
            items: defaultItems,
            selectedKey: componentProps.selectedKey,
          }, {
            default: () => [h(TabList), h(TabPanels)],
          });
      },
    });

    const tree = render(App, {
      props: {
        selectedKey: "tab-3",
      },
    });
    await flush();

    let tabs = tree.getAllByRole("tab");
    expect(tabs[0]?.getAttribute("tabindex")).toBe("-1");
    expect(tabs[1]?.getAttribute("tabindex")).toBe("-1");
    expect(tabs[2]?.getAttribute("tabindex")).toBe("0");

    await tree.rerender({
      selectedKey: "tab-1",
    });
    await flush();

    tabs = tree.getAllByRole("tab");
    expect(tabs[0]?.getAttribute("tabindex")).toBe("0");
    expect(tabs[1]?.getAttribute("tabindex")).toBe("-1");
    expect(tabs[2]?.getAttribute("tabindex")).toBe("-1");
  });

  it("selects first tab when all tabs are disabled", async () => {
    const onSelectionChange = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = renderTabs({
      disabledKeys: defaultItems.map((item) => item.key),
      onSelectionChange,
    });
    await flush();

    await user.tab();

    const tablist = getByRole("tablist");
    const tabs = within(tablist).getAllByRole("tab");
    const tabpanel = getByRole("tabpanel");

    expect(tabs[0]?.getAttribute("aria-selected")).toBe("true");
    expect(onSelectionChange).toHaveBeenCalledWith("tab-1");
    expect(document.activeElement).toBe(tabpanel);
  });

  it("sets tabpanel tabIndex only when no focusable child exists", async () => {
    const user = userEvent.setup();
    const tree = render(Tabs, {
      props: {
        "aria-label": "Tab Example",
      },
      slots: {
        default: () => [
          h(TabList, null, {
            default: () => [h(Item, { id: "tab-1" }, () => "Tab 1"), h(Item, { id: "tab-2" }, () => "Tab 2")],
          }),
          h(TabPanels, null, {
            default: () => [
              h(Item, { id: "tab-1" }, () => h("input", { "data-testid": "panel-1-input" })),
              h(Item, { id: "tab-2" }, () => h("input", { disabled: true, "data-testid": "panel-2-input" })),
            ],
          }),
        ],
      },
    });
    await flush();

    let tabpanel = tree.getByRole("tabpanel");
    expect(tabpanel.getAttribute("tabindex")).toBeNull();

    const tabs = tree.getAllByRole("tab");
    await user.click(tabs[1] as HTMLElement);
    await flush();

    tabpanel = tree.getByRole("tabpanel");
    await waitFor(() => {
      expect(tabpanel.getAttribute("tabindex")).toBe("0");
    });

    await user.click(tabs[0] as HTMLElement);
    await flush();

    tabpanel = tree.getByRole("tabpanel");
    await waitFor(() => {
      expect(tabpanel.getAttribute("tabindex")).toBeNull();
    });
  });

  it("does not share input values between tabpanels", async () => {
    const user = userEvent.setup();
    const tree = render(Tabs, {
      props: {
        "aria-label": "Input tabs",
      },
      slots: {
        default: () => [
          h(TabList, null, {
            default: () => [h(Item, { id: "tab-1" }, () => "Tab 1"), h(Item, { id: "tab-2" }, () => "Tab 2")],
          }),
          h(TabPanels, null, {
            default: () => [
              h(Item, { id: "tab-1" }, () => h("input", { "data-testid": "panel1_input" })),
              h(Item, { id: "tab-2" }, () => h("input", { disabled: true, "data-testid": "panel2_input" })),
            ],
          }),
        ],
      },
    });
    await flush();

    const firstInput = tree.getByTestId("panel1_input") as HTMLInputElement;
    expect(firstInput.value).toBe("");
    firstInput.value = "A String";
    expect(firstInput.value).toBe("A String");

    const tabs = tree.getAllByRole("tab");
    await user.click(tabs[1] as HTMLElement);
    await flush();

    const secondInput = tree.getByTestId("panel2_input") as HTMLInputElement;
    expect(secondInput.value).toBe("");
  });

  it("supports static Item composition with fragment siblings", async () => {
    const user = userEvent.setup();
    const tree = render(Tabs, {
      props: {
        "aria-label": "Fragment tabs",
      },
      slots: {
        default: () => [
          h(TabList, null, {
            default: () => [
              h(Fragment, null, [h(Item, { id: "first" }, () => "Tab 1")]),
              h(Item, { id: "second" }, () => "Tab 2"),
            ],
          }),
          h(TabPanels, null, {
            default: () => [
              h(Item, { id: "first" }, () => "Tab 1 content"),
              h(Fragment, null, [h(Item, { id: "second" }, () => "Tab 2 content")]),
            ],
          }),
        ],
      },
    });
    await flush();

    const tablist = tree.getByRole("tablist");
    const tabs = within(tablist).getAllByRole("tab");
    expect(tabs).toHaveLength(2);
    expect(tree.getByRole("tabpanel").textContent).toContain("Tab 1 content");

    await user.click(tabs[1] as HTMLElement);
    await flush();
    expect(tree.getByRole("tabpanel").textContent).toContain("Tab 2 content");
  });
});
