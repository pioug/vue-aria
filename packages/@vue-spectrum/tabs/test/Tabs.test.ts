import userEvent from "@testing-library/user-event";
import { fireEvent, render, within } from "@testing-library/vue";
import { defineComponent, h, nextTick, type VNodeChild } from "vue";
import { describe, expect, it, vi } from "vitest";
import { TabList, TabPanels, Tabs, type SpectrumTabItem } from "../src";

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

      const picker = getByRole("button", { name: "Tab 1" });
      expect(picker).toBeTruthy();
      const pickerContainer = picker.closest(".spectrum-Tabs-picker");
      expect(pickerContainer).not.toBeNull();
      const pickerId = pickerContainer?.getAttribute("id");
      expect(pickerId).not.toBeNull();
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
});
