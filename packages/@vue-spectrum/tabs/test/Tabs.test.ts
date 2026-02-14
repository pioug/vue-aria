import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";
import { Item } from "../src/Item";
import { TabList, TabPanels, Tabs } from "../src/Tabs";

const items = [
  { key: "tab-1", title: "Tab 1", children: "Tab 1 body" },
  { key: "tab-2", title: "Tab 2", children: "Tab 2 body" },
  { key: "tab-3", title: "Tab 3", children: "Tab 3 body" },
];

function renderTabs(props: Record<string, unknown> = {}) {
  return mount(Tabs as any, {
    props: {
      ariaLabel: "Tab sample",
      items,
      ...props,
    },
    slots: {
      default: () => [h(TabList as any), h(TabPanels as any)],
    },
    attachTo: document.body,
  });
}

describe("Tabs", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders tablist and selected tab panel", () => {
    const wrapper = renderTabs();

    const tablist = wrapper.get('[role="tablist"]');
    const tabs = wrapper.findAll('[role="tab"]');
    const panel = wrapper.get('[role="tabpanel"]');

    expect(tablist.attributes("aria-orientation")).toBe("horizontal");
    expect(tabs).toHaveLength(3);
    expect(tabs[0]?.attributes("aria-selected")).toBe("true");
    expect(panel.text()).toContain("Tab 1 body");
  });

  it("supports click selection", async () => {
    const wrapper = renderTabs();

    const tabs = wrapper.findAll('[role="tab"]');
    await tabs[2]?.trigger("click");
    await nextTick();

    const updatedTabs = wrapper.findAll('[role="tab"]');
    const panel = wrapper.get('[role="tabpanel"]');
    expect(updatedTabs[2]?.attributes("aria-selected")).toBe("true");
    expect(panel.text()).toContain("Tab 3 body");
  });

  it("supports vertical arrow key navigation", async () => {
    const wrapper = renderTabs({
      orientation: "vertical",
    });

    const tabs = wrapper.findAll('[role="tab"]');
    await tabs[0]?.trigger("keydown", { key: "ArrowDown" });
    await nextTick();

    const updatedTabs = wrapper.findAll('[role="tab"]');
    expect(updatedTabs[1]?.attributes("aria-selected")).toBe("true");
  });

  it("supports manual keyboard activation", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTabs({
      keyboardActivation: "manual",
      defaultSelectedKey: "tab-1",
      onSelectionChange,
    });

    const tabs = wrapper.findAll('[role="tab"]');
    (tabs[0]?.element as HTMLElement).focus();

    await tabs[0]?.trigger("keydown", { key: "ArrowRight" });
    await nextTick();

    let updatedTabs = wrapper.findAll('[role="tab"]');
    expect(updatedTabs[0]?.attributes("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(updatedTabs[1]?.element);

    await updatedTabs[1]?.trigger("keydown", { key: "Enter" });
    await nextTick();

    updatedTabs = wrapper.findAll('[role="tab"]');
    expect(updatedTabs[1]?.attributes("aria-selected")).toBe("true");
    expect(onSelectionChange).toHaveBeenCalledWith("tab-2");
  });

  it("supports manual keyboard activation with space key", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTabs({
      keyboardActivation: "manual",
      defaultSelectedKey: "tab-1",
      onSelectionChange,
    });

    const tabs = wrapper.findAll('[role="tab"]');
    (tabs[0]?.element as HTMLElement).focus();

    await tabs[0]?.trigger("keydown", { key: "ArrowRight" });
    await nextTick();

    let updatedTabs = wrapper.findAll('[role="tab"]');
    expect(updatedTabs[0]?.attributes("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(updatedTabs[1]?.element);

    await updatedTabs[1]?.trigger("keydown", { key: " " });
    await nextTick();

    updatedTabs = wrapper.findAll('[role="tab"]');
    expect(updatedTabs[1]?.attributes("aria-selected")).toBe("true");
    expect(onSelectionChange).toHaveBeenCalledWith("tab-2");
  });

  it("does not auto-select on home/end in manual keyboard activation", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTabs({
      keyboardActivation: "manual",
      defaultSelectedKey: "tab-1",
      onSelectionChange,
    });

    const tabs = wrapper.findAll('[role="tab"]');
    (tabs[0]?.element as HTMLElement).focus();

    await tabs[0]?.trigger("keydown", { key: "End" });
    await nextTick();

    let updatedTabs = wrapper.findAll('[role="tab"]');
    expect(updatedTabs[0]?.attributes("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(updatedTabs[2]?.element);

    await updatedTabs[2]?.trigger("keydown", { key: "Enter" });
    await nextTick();

    updatedTabs = wrapper.findAll('[role="tab"]');
    expect(updatedTabs[2]?.attributes("aria-selected")).toBe("true");
    expect(onSelectionChange).toHaveBeenCalledWith("tab-3");
  });

  it("wraps horizontal keyboard navigation from first to last tab", async () => {
    const wrapper = renderTabs({
      defaultSelectedKey: "tab-1",
    });

    const tabs = wrapper.findAll('[role="tab"]');
    (tabs[0]?.element as HTMLElement).focus();

    await tabs[0]?.trigger("keydown", { key: "ArrowLeft" });
    await nextTick();

    const updatedTabs = wrapper.findAll('[role="tab"]');
    expect(updatedTabs[2]?.attributes("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(updatedTabs[2]?.element);
  });

  it("wraps vertical keyboard navigation from first to last tab", async () => {
    const wrapper = renderTabs({
      orientation: "vertical",
      defaultSelectedKey: "tab-1",
    });

    const tabs = wrapper.findAll('[role="tab"]');
    (tabs[0]?.element as HTMLElement).focus();

    await tabs[0]?.trigger("keydown", { key: "ArrowUp" });
    await nextTick();

    const updatedTabs = wrapper.findAll('[role="tab"]');
    expect(updatedTabs[2]?.attributes("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(updatedTabs[2]?.element);
  });

  it("supports home and end keyboard navigation", async () => {
    const wrapper = renderTabs({
      defaultSelectedKey: "tab-2",
    });

    const tabs = wrapper.findAll('[role="tab"]');
    (tabs[1]?.element as HTMLElement).focus();

    await tabs[1]?.trigger("keydown", { key: "End" });
    await nextTick();

    let updatedTabs = wrapper.findAll('[role="tab"]');
    expect(updatedTabs[2]?.attributes("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(updatedTabs[2]?.element);

    await updatedTabs[2]?.trigger("keydown", { key: "Home" });
    await nextTick();

    updatedTabs = wrapper.findAll('[role="tab"]');
    expect(updatedTabs[0]?.attributes("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(updatedTabs[0]?.element);
  });

  it("skips disabled tabs during keyboard navigation", async () => {
    const wrapper = renderTabs({
      defaultSelectedKey: "tab-1",
      disabledKeys: ["tab-2"],
    });

    const tabs = wrapper.findAll('[role="tab"]');
    (tabs[0]?.element as HTMLElement).focus();

    await tabs[0]?.trigger("keydown", { key: "ArrowRight" });
    await nextTick();

    const updatedTabs = wrapper.findAll('[role="tab"]');
    expect(updatedTabs[1]?.attributes("aria-selected")).toBe("false");
    expect(updatedTabs[2]?.attributes("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(updatedTabs[2]?.element);
  });

  it("respects disabledKeys", async () => {
    const wrapper = renderTabs({
      disabledKeys: ["tab-2"],
      defaultSelectedKey: "tab-1",
    });

    const tabs = wrapper.findAll('[role="tab"]');
    await tabs[1]?.trigger("click");
    await nextTick();

    expect(tabs[1]?.attributes("aria-disabled")).toBe("true");
    expect(tabs[0]?.attributes("aria-selected")).toBe("true");
  });

  it("supports controlled selectedKey updates", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = renderTabs({
      selectedKey: "tab-1",
      onSelectionChange,
    });

    const tabs = wrapper.findAll('[role="tab"]');
    await tabs[1]?.trigger("click");
    await nextTick();

    expect(onSelectionChange).toHaveBeenCalledWith("tab-2");
    expect(tabs[0]?.attributes("aria-selected")).toBe("true");

    await wrapper.setProps({
      selectedKey: "tab-3",
    });
    await nextTick();

    const updatedTabs = wrapper.findAll('[role="tab"]');
    expect(updatedTabs[2]?.attributes("aria-selected")).toBe("true");
    expect(wrapper.get('[role="tabpanel"]').text()).toContain("Tab 3 body");
  });

  it("supports static item composition in TabList and TabPanels", async () => {
    const wrapper = mount(Tabs as any, {
      props: {
        ariaLabel: "Tab sample",
      },
      slots: {
        default: () => [
          h(TabList as any, null, {
            default: () => [
              h(Item as any, { id: "a", title: "A" }),
              h(Item as any, { id: "b", title: "B" }),
            ],
          }),
          h(TabPanels as any, null, {
            default: () => [
              h(Item as any, { id: "a" }, { default: () => "Panel A" }),
              h(Item as any, { id: "b" }, { default: () => "Panel B" }),
            ],
          }),
        ],
      },
      attachTo: document.body,
    });

    const tabs = wrapper.findAll('[role="tab"]');
    expect(tabs).toHaveLength(2);
    expect(wrapper.get('[role="tabpanel"]').text()).toContain("Panel A");
  });
});
