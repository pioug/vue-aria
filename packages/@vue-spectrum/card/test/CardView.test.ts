import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { provideI18n } from "@vue-aria/i18n";
import { Image } from "@vue-spectrum/image";
import { Heading, Text } from "@vue-spectrum/text";
import { Content } from "@vue-spectrum/view";
import { Card, CardView, GalleryLayout, GridLayout, WaterfallLayout } from "../src";

interface DynamicCardItem {
  id?: string | number | boolean | null;
  src: string;
  title: string;
}

const dynamicItems: DynamicCardItem[] = [
  { id: "card-1", src: "https://i.imgur.com/Z7AzH2c.jpg", title: "Title 1" },
  { id: "card-2", src: "https://i.imgur.com/DhygPot.jpg", title: "Title 2" },
  { id: "card-3", src: "https://i.imgur.com/L7RTlvI.png", title: "Title 3" },
];

const longDynamicItems: DynamicCardItem[] = Array.from({ length: 12 }, (_, index) => ({
  id: `card-${index + 1}`,
  src: dynamicItems[index % dynamicItems.length].src,
  title: `Title ${index + 1}`,
}));

const falsyIdItems = [
  { id: 0, src: "https://i.imgur.com/Z7AzH2c.jpg", title: "Title 1" },
  { id: "", src: "https://i.imgur.com/DhygPot.jpg", title: "Title 2" },
  { id: false, src: "https://i.imgur.com/L7RTlvI.png", title: "Title 3" },
  { id: null, src: "https://i.imgur.com/1nScMIH.jpg", title: "Title 4" },
];

function toCardItemKey(
  item: DynamicCardItem
): string | number | boolean | null | undefined {
  return Object.prototype.hasOwnProperty.call(item, "id") ? item.id : undefined;
}

function createCardNode(index: number) {
  return h(
    Card,
    {},
    {
      default: () => [
        h(Image, { src: dynamicItems[index].src }),
        h(Heading, () => dynamicItems[index].title),
        h(Text, { slot: "detail" }, () => "PNG"),
        h(Content, () => "Description"),
      ],
    }
  );
}

function createDynamicCard(item: DynamicCardItem) {
  return h(
    Card,
    { itemKey: toCardItemKey(item) },
    {
      default: () => [
        h(Image, { src: item.src }),
        h(Heading, () => item.title),
        h(Text, { slot: "detail" }, () => "PNG"),
        h(Content, () => "Description"),
      ],
    }
  );
}

function mountRTLCardView() {
  const RTLCardView = defineComponent({
    name: "RTLCardViewTest",
    setup() {
      provideI18n({ locale: "ar-AE" });

      return () =>
        h(
          CardView,
          {
            layout: new GridLayout(),
            items: dynamicItems,
            ariaLabel: "Test CardView",
          },
          {
            default: ({ item }: { item: DynamicCardItem }) =>
              h(
                Card,
                { itemKey: toCardItemKey(item) },
                {
                  default: () => [
                    h(Image, { src: item.src }),
                    h(Heading, () => item.title),
                    h(Text, { slot: "detail" }, () => "PNG"),
                    h(Content, () => "Description"),
                  ],
                }
              ),
          }
        );
    },
  });

  return mount(RTLCardView, { attachTo: document.body });
}

const layoutCases = [
  ["Grid layout", GridLayout],
  ["Gallery layout", GalleryLayout],
  ["Waterfall layout", WaterfallLayout],
] as const;

describe("CardView", () => {
  it.each(layoutCases)("%s supports static cards", (_name, Layout) => {
    const wrapper = mount(CardView, {
      props: {
        layout: new Layout(),
        ariaLabel: "Test CardView",
      },
      slots: {
        default: () => [createCardNode(0), createCardNode(1), createCardNode(2)],
      },
    });

    const grid = wrapper.get("[role=\"grid\"]");
    expect(grid.attributes("aria-label")).toBe("Test CardView");
    expect(grid.attributes("aria-rowcount")).toBe("3");
    expect(grid.attributes("aria-colcount")).toBe("1");

    const rows = wrapper.findAll("[role=\"row\"]");
    expect(rows).toHaveLength(3);
    for (const [index, row] of rows.entries()) {
      expect(row.attributes("aria-rowindex")).toBe(String(index + 1));
      const cell = row.get("[role=\"gridcell\"]");
      expect(cell.find("img").exists()).toBe(true);
      expect(cell.text()).toContain("Description");
      expect(cell.text()).toContain("PNG");
      expect(cell.text()).toContain("Title");
    }
  });

  it.each(layoutCases)("%s supports dynamic cards", (_name, Layout) => {
    const wrapper = mount(CardView, {
      props: {
        layout: new Layout(),
        items: dynamicItems,
        ariaLabel: "Test CardView",
      },
      slots: {
        default: ({ item }: { item: DynamicCardItem }) =>
          h(
            Card,
            { itemKey: toCardItemKey(item) },
            {
              default: () => [
                h(Image, { src: item.src }),
                h(Heading, () => item.title),
                h(Text, { slot: "detail" }, () => "PNG"),
                h(Content, () => "Description"),
              ],
            }
          ),
      },
    });

    const grid = wrapper.get("[role=\"grid\"]");
    expect(grid.attributes("aria-label")).toBe("Test CardView");
    expect(grid.attributes("aria-rowcount")).toBe(String(dynamicItems.length));
    expect(grid.attributes("aria-colcount")).toBe("1");

    const rows = wrapper.findAll("[role=\"row\"]");
    expect(rows).toHaveLength(dynamicItems.length);
    for (const [index, row] of rows.entries()) {
      expect(row.attributes("aria-rowindex")).toBe(String(index + 1));
      const cell = row.get("[role=\"gridcell\"]");
      expect(cell.find("img").exists()).toBe(true);
      expect(cell.text()).toContain("Description");
      expect(cell.text()).toContain("PNG");
      expect(cell.text()).toContain("Title");
    }
  });

  it.each(layoutCases)("%s supports falsy ids", (_name, Layout) => {
    const wrapper = mount(CardView, {
      props: {
        layout: new Layout(),
        items: falsyIdItems,
        ariaLabel: "Test CardView",
      },
      slots: {
        default: ({ item }: { item: DynamicCardItem }) =>
          h(
            Card,
            { itemKey: toCardItemKey(item) },
            {
              default: () => [
                h(Image, { src: item.src }),
                h(Heading, () => item.title),
                h(Text, { slot: "detail" }, () => "PNG"),
                h(Content, () => "Description"),
              ],
            }
          ),
      },
    });

    const grid = wrapper.get("[role=\"grid\"]");
    expect(grid.attributes("aria-rowcount")).toBe(String(falsyIdItems.length));

    const rows = wrapper.findAll("[role=\"row\"]");
    expect(rows).toHaveLength(falsyIdItems.length);
    for (const row of rows) {
      const cell = row.get("[role=\"gridcell\"]");
      expect(cell.find("img").exists()).toBe(true);
      expect(cell.text()).toContain("Description");
      expect(cell.text()).toContain("PNG");
      expect(cell.text()).toContain("Title");
    }
  });

  it("moves focus via ArrowDown", async () => {
    const wrapper = mount(CardView, {
      attachTo: document.body,
      props: {
        layout: new GridLayout(),
        items: dynamicItems,
        ariaLabel: "Test CardView",
      },
      slots: {
        default: ({ item }: { item: DynamicCardItem }) =>
          h(
            Card,
            { itemKey: toCardItemKey(item) },
            {
              default: () => [
                h(Image, { src: item.src }),
                h(Heading, () => item.title),
                h(Text, { slot: "detail" }, () => "PNG"),
                h(Content, () => "Description"),
              ],
            }
          ),
      },
    });

    const cells = wrapper.findAll("[role=\"gridcell\"]");
    const user = userEvent.setup();
    await user.click(cells[1].element);
    expect(document.activeElement).toBe(cells[1].element);

    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(cells[2].element);
  });

  it("moves focus via ArrowUp", async () => {
    const wrapper = mount(CardView, {
      attachTo: document.body,
      props: {
        layout: new GridLayout(),
        items: dynamicItems,
        ariaLabel: "Test CardView",
      },
      slots: {
        default: ({ item }: { item: DynamicCardItem }) =>
          h(
            Card,
            { itemKey: toCardItemKey(item) },
            {
              default: () => [
                h(Image, { src: item.src }),
                h(Heading, () => item.title),
                h(Text, { slot: "detail" }, () => "PNG"),
                h(Content, () => "Description"),
              ],
            }
          ),
      },
    });

    const cells = wrapper.findAll("[role=\"gridcell\"]");
    const user = userEvent.setup();
    await user.click(cells[2].element);
    expect(document.activeElement).toBe(cells[2].element);

    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(cells[1].element);
  });

  it("moves focus to first and last cells via Home/End", async () => {
    const wrapper = mount(CardView, {
      attachTo: document.body,
      props: {
        layout: new GridLayout(),
        items: dynamicItems,
        ariaLabel: "Test CardView",
      },
      slots: {
        default: ({ item }: { item: DynamicCardItem }) =>
          h(
            Card,
            { itemKey: toCardItemKey(item) },
            {
              default: () => [
                h(Image, { src: item.src }),
                h(Heading, () => item.title),
                h(Text, { slot: "detail" }, () => "PNG"),
                h(Content, () => "Description"),
              ],
            }
          ),
      },
    });

    const cells = wrapper.findAll("[role=\"gridcell\"]");
    const user = userEvent.setup();
    await user.click(cells[1].element);
    expect(document.activeElement).toBe(cells[1].element);

    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(cells[0].element);

    await user.keyboard("{End}");
    expect(document.activeElement).toBe(cells[2].element);
  });

  it("moves focus via ArrowLeft", async () => {
    const wrapper = mount(CardView, {
      attachTo: document.body,
      props: {
        layout: new GridLayout(),
        items: dynamicItems,
        ariaLabel: "Test CardView",
      },
      slots: {
        default: ({ item }: { item: DynamicCardItem }) =>
          h(
            Card,
            { itemKey: toCardItemKey(item) },
            {
              default: () => [
                h(Image, { src: item.src }),
                h(Heading, () => item.title),
                h(Text, { slot: "detail" }, () => "PNG"),
                h(Content, () => "Description"),
              ],
            }
          ),
      },
    });

    const cells = wrapper.findAll("[role=\"gridcell\"]");
    const user = userEvent.setup();
    await user.click(cells[2].element);
    expect(document.activeElement).toBe(cells[2].element);

    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(cells[1].element);
  });

  it("moves focus via ArrowRight", async () => {
    const wrapper = mount(CardView, {
      attachTo: document.body,
      props: {
        layout: new GridLayout(),
        items: dynamicItems,
        ariaLabel: "Test CardView",
      },
      slots: {
        default: ({ item }: { item: DynamicCardItem }) =>
          h(
            Card,
            { itemKey: toCardItemKey(item) },
            {
              default: () => [
                h(Image, { src: item.src }),
                h(Heading, () => item.title),
                h(Text, { slot: "detail" }, () => "PNG"),
                h(Content, () => "Description"),
              ],
            }
          ),
      },
    });

    const cells = wrapper.findAll("[role=\"gridcell\"]");
    const user = userEvent.setup();
    await user.click(cells[0].element);
    expect(document.activeElement).toBe(cells[0].element);

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(cells[1].element);
  });

  it("moves focus via ArrowLeft in RTL", async () => {
    const wrapper = mountRTLCardView();
    const cells = wrapper.findAll("[role=\"gridcell\"]");
    const user = userEvent.setup();
    await user.click(cells[0].element);
    expect(document.activeElement).toBe(cells[0].element);

    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(cells[1].element);
  });

  it("moves focus via ArrowRight in RTL", async () => {
    const wrapper = mountRTLCardView();
    const cells = wrapper.findAll("[role=\"gridcell\"]");
    const user = userEvent.setup();
    await user.click(cells[1].element);
    expect(document.activeElement).toBe(cells[1].element);

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(cells[0].element);
  });

  it("moves focus via PageDown", async () => {
    const offsetHeightSpy = vi
      .spyOn(HTMLElement.prototype, "offsetHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        const role = this.getAttribute("role");
        if (role === "grid") {
          return 120;
        }
        if (role === "gridcell") {
          return 20;
        }
        return 0;
      });
    const clientHeightSpy = vi
      .spyOn(HTMLElement.prototype, "clientHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "grid") {
          return 120;
        }
        return 0;
      });

    try {
      const wrapper = mount(CardView, {
        attachTo: document.body,
        props: {
          layout: new GridLayout(),
          items: longDynamicItems,
          ariaLabel: "Test CardView",
        },
        slots: {
          default: ({ item }: { item: DynamicCardItem }) =>
            h(
              Card,
              { itemKey: toCardItemKey(item) },
              {
                default: () => [
                  h(Image, { src: item.src }),
                  h(Heading, () => item.title),
                  h(Text, { slot: "detail" }, () => "PNG"),
                  h(Content, () => "Description"),
                ],
              }
            ),
        },
      });

      const cells = wrapper.findAll("[role=\"gridcell\"]");
      const user = userEvent.setup();
      await user.click(cells[0].element);
      expect(document.activeElement).toBe(cells[0].element);

      await user.keyboard("{PageDown}");
      expect(document.activeElement).toBe(cells[6].element);
    } finally {
      offsetHeightSpy.mockRestore();
      clientHeightSpy.mockRestore();
    }
  });

  it("moves focus via PageUp", async () => {
    const offsetHeightSpy = vi
      .spyOn(HTMLElement.prototype, "offsetHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        const role = this.getAttribute("role");
        if (role === "grid") {
          return 120;
        }
        if (role === "gridcell") {
          return 20;
        }
        return 0;
      });
    const clientHeightSpy = vi
      .spyOn(HTMLElement.prototype, "clientHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "grid") {
          return 120;
        }
        return 0;
      });

    try {
      const wrapper = mount(CardView, {
        attachTo: document.body,
        props: {
          layout: new GridLayout(),
          items: longDynamicItems,
          ariaLabel: "Test CardView",
        },
        slots: {
          default: ({ item }: { item: DynamicCardItem }) =>
            h(
              Card,
              { itemKey: toCardItemKey(item) },
              {
                default: () => [
                  h(Image, { src: item.src }),
                  h(Heading, () => item.title),
                  h(Text, { slot: "detail" }, () => "PNG"),
                  h(Content, () => "Description"),
                ],
              }
            ),
        },
      });

      const cells = wrapper.findAll("[role=\"gridcell\"]");
      const user = userEvent.setup();
      await user.click(cells[8].element);
      expect(document.activeElement).toBe(cells[8].element);

      await user.keyboard("{PageUp}");
      expect(document.activeElement).toBe(cells[2].element);
    } finally {
      offsetHeightSpy.mockRestore();
      clientHeightSpy.mockRestore();
    }
  });

  it("supports uncontrolled multiple selection and emits selected keys", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = mount(CardView, {
      props: {
        items: dynamicItems,
        layout: new GridLayout(),
        selectionMode: "multiple",
        onSelectionChange,
        ariaLabel: "Test CardView",
      },
      slots: {
        default: ({ item }: { item: DynamicCardItem }) =>
          h(
            Card,
            { itemKey: toCardItemKey(item) },
            {
              default: () => [
                h(Image, { src: item.src }),
                h(Heading, () => item.title),
                h(Text, { slot: "detail" }, () => "PNG"),
                h(Content, () => "Description"),
              ],
            }
          ),
      },
    });

    const user = userEvent.setup();
    const cells = wrapper.findAll("[role=\"gridcell\"]");
    const cards = wrapper.findAll(".spectrum-Card");
    const checkboxes = wrapper.findAll("input[type=\"checkbox\"][aria-label=\"select\"]");

    expect(checkboxes).toHaveLength(dynamicItems.length);
    expect(cards[0].classes()).not.toContain("is-selected");
    expect(cells[0].attributes("aria-selected")).toBe("false");

    await user.click(cells[0].element);
    expect(cards[0].classes()).toContain("is-selected");
    expect(cells[0].attributes("aria-selected")).toBe("true");
    expect((checkboxes[0].element as HTMLInputElement).checked).toBe(true);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(Array.from(onSelectionChange.mock.calls[0][0] as Set<unknown>)).toEqual([
      "card-1",
    ]);

    await user.click(cells[0].element);
    expect(cards[0].classes()).not.toContain("is-selected");
    expect(cells[0].attributes("aria-selected")).toBe("false");
    expect((checkboxes[0].element as HTMLInputElement).checked).toBe(false);
    expect(onSelectionChange).toHaveBeenCalledTimes(2);
    expect(Array.from(onSelectionChange.mock.calls[1][0] as Set<unknown>)).toEqual([]);
  });

  it("supports controlled selectedKeys", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = mount(CardView, {
      props: {
        items: dynamicItems,
        layout: new GridLayout(),
        selectionMode: "multiple",
        selectedKeys: new Set(["card-2"]),
        onSelectionChange,
        ariaLabel: "Test CardView",
      },
      slots: {
        default: ({ item }: { item: DynamicCardItem }) =>
          h(
            Card,
            { itemKey: toCardItemKey(item) },
            {
              default: () => [
                h(Image, { src: item.src }),
                h(Heading, () => item.title),
                h(Text, { slot: "detail" }, () => "PNG"),
                h(Content, () => "Description"),
              ],
            }
          ),
      },
    });

    const user = userEvent.setup();
    const cells = wrapper.findAll("[role=\"gridcell\"]");
    const cards = wrapper.findAll(".spectrum-Card");

    expect(cards[1].classes()).toContain("is-selected");
    expect(cells[1].attributes("aria-selected")).toBe("true");
    expect(cards[0].classes()).not.toContain("is-selected");

    await user.click(cells[0].element);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(
      new Set(Array.from(onSelectionChange.mock.calls[0][0] as Set<unknown>))
    ).toEqual(new Set(["card-1", "card-2"]));

    // controlled: visual selection remains driven by selectedKeys prop
    expect(cards[1].classes()).toContain("is-selected");
    expect(cards[0].classes()).not.toContain("is-selected");

    await wrapper.setProps({ selectedKeys: new Set(["card-1"]) });
    expect(cards[0].classes()).toContain("is-selected");
    expect(cards[1].classes()).not.toContain("is-selected");
  });

  it("supports controlled selection with falsy keys", () => {
    const wrapper = mount(CardView, {
      props: {
        items: falsyIdItems,
        layout: new GridLayout(),
        selectionMode: "multiple",
        selectedKeys: new Set([false, null]),
        ariaLabel: "Test CardView",
      },
      slots: {
        default: ({ item }: { item: DynamicCardItem }) =>
          h(
            Card,
            { itemKey: toCardItemKey(item) },
            {
              default: () => [
                h(Image, { src: item.src }),
                h(Heading, () => item.title),
                h(Text, { slot: "detail" }, () => "PNG"),
                h(Content, () => "Description"),
              ],
            }
          ),
      },
    });

    const cards = wrapper.findAll(".spectrum-Card");
    // id false and id null should both resolve as selected keys
    expect(cards[2].classes()).toContain("is-selected");
    expect(cards[3].classes()).toContain("is-selected");
  });

  it("does not select disabled card keys", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = mount(CardView, {
      props: {
        items: dynamicItems,
        layout: new GridLayout(),
        selectionMode: "multiple",
        disabledKeys: ["card-2"],
        onSelectionChange,
        ariaLabel: "Test CardView",
      },
      slots: {
        default: ({ item }: { item: DynamicCardItem }) =>
          h(
            Card,
            { itemKey: toCardItemKey(item) },
            {
              default: () => [
                h(Image, { src: item.src }),
                h(Heading, () => item.title),
                h(Text, { slot: "detail" }, () => "PNG"),
                h(Content, () => "Description"),
              ],
            }
          ),
      },
    });

    const user = userEvent.setup();
    const cards = wrapper.findAll(".spectrum-Card");
    const cells = wrapper.findAll("[role=\"gridcell\"]");
    const checkboxes = wrapper.findAll("input[type=\"checkbox\"][aria-label=\"select\"]");

    expect(cards[1].classes()).toContain("is-disabled");
    expect((checkboxes[1].element as HTMLInputElement).disabled).toBe(true);
    await user.click(cells[1].element);
    expect(cards[1].classes()).not.toContain("is-selected");
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("selectionMode none hides checkboxes and omits aria-selected", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = mount(CardView, {
      props: {
        items: dynamicItems,
        layout: new GridLayout(),
        selectionMode: "none",
        onSelectionChange,
        ariaLabel: "Test CardView",
      },
      slots: {
        default: ({ item }: { item: DynamicCardItem }) =>
          h(
            Card,
            { itemKey: toCardItemKey(item) },
            {
              default: () => [
                h(Image, { src: item.src }),
                h(Heading, () => item.title),
                h(Text, { slot: "detail" }, () => "PNG"),
                h(Content, () => "Description"),
              ],
            }
          ),
      },
    });

    const user = userEvent.setup();
    const cells = wrapper.findAll("[role=\"gridcell\"]");

    expect(wrapper.findAll("input[type=\"checkbox\"][aria-label=\"select\"]")).toHaveLength(
      0
    );
    expect(cells[0].attributes("aria-selected")).toBeUndefined();

    await user.click(cells[0].element);
    expect(wrapper.findAll(".spectrum-Card")[0].classes()).not.toContain("is-selected");
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("toggles selection with Enter key", async () => {
    const wrapper = mount(CardView, {
      attachTo: document.body,
      props: {
        items: dynamicItems,
        layout: new GridLayout(),
        selectionMode: "multiple",
        ariaLabel: "Test CardView",
      },
      slots: {
        default: ({ item }: { item: DynamicCardItem }) =>
          h(
            Card,
            { itemKey: toCardItemKey(item) },
            {
              default: () => [
                h(Image, { src: item.src }),
                h(Heading, () => item.title),
                h(Text, { slot: "detail" }, () => "PNG"),
                h(Content, () => "Description"),
              ],
            }
          ),
      },
    });

    const user = userEvent.setup();
    const cells = wrapper.findAll("[role=\"gridcell\"]");
    const cards = wrapper.findAll(".spectrum-Card");

    (cells[0].element as HTMLElement).focus();
    await user.keyboard("{Enter}");
    expect(cards[0].classes()).toContain("is-selected");

    await user.keyboard("{Enter}");
    expect(cards[0].classes()).not.toContain("is-selected");
  });

  it("toggles selection with Space key", async () => {
    const wrapper = mount(CardView, {
      attachTo: document.body,
      props: {
        items: dynamicItems,
        layout: new GridLayout(),
        selectionMode: "multiple",
        ariaLabel: "Test CardView",
      },
      slots: {
        default: ({ item }: { item: DynamicCardItem }) =>
          h(
            Card,
            { itemKey: toCardItemKey(item) },
            {
              default: () => [
                h(Image, { src: item.src }),
                h(Heading, () => item.title),
                h(Text, { slot: "detail" }, () => "PNG"),
                h(Content, () => "Description"),
              ],
            }
          ),
      },
    });

    const user = userEvent.setup();
    const cells = wrapper.findAll("[role=\"gridcell\"]");
    const cards = wrapper.findAll(".spectrum-Card");

    (cells[0].element as HTMLElement).focus();
    await user.keyboard("{Space}");
    expect(cards[0].classes()).toContain("is-selected");

    await user.keyboard("{Space}");
    expect(cards[0].classes()).not.toContain("is-selected");
  });

  it("supports single selection mode", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = mount(CardView, {
      props: {
        items: dynamicItems,
        layout: new GridLayout(),
        selectionMode: "single",
        onSelectionChange,
        ariaLabel: "Test CardView",
      },
      slots: {
        default: ({ item }: { item: DynamicCardItem }) =>
          h(
            Card,
            { itemKey: toCardItemKey(item) },
            {
              default: () => [
                h(Image, { src: item.src }),
                h(Heading, () => item.title),
                h(Text, { slot: "detail" }, () => "PNG"),
                h(Content, () => "Description"),
              ],
            }
          ),
      },
    });

    const user = userEvent.setup();
    const cells = wrapper.findAll("[role=\"gridcell\"]");
    const cards = wrapper.findAll(".spectrum-Card");

    await user.click(cells[0].element);
    expect(cards[0].classes()).toContain("is-selected");
    expect(cards[1].classes()).not.toContain("is-selected");
    expect(
      new Set(Array.from(onSelectionChange.mock.calls[0][0] as Set<unknown>))
    ).toEqual(new Set(["card-1"]));

    await user.click(cells[1].element);
    expect(cards[0].classes()).not.toContain("is-selected");
    expect(cards[1].classes()).toContain("is-selected");
    expect(
      new Set(Array.from(onSelectionChange.mock.calls[1][0] as Set<unknown>))
    ).toEqual(new Set(["card-2"]));

    await user.click(cells[1].element);
    expect(cards[0].classes()).not.toContain("is-selected");
    expect(cards[1].classes()).not.toContain("is-selected");
    expect(
      new Set(Array.from(onSelectionChange.mock.calls[2][0] as Set<unknown>))
    ).toEqual(new Set());
  });

  it("calls onLoadMore when scrolling to the bottom", async () => {
    const onLoadMore = vi.fn();
    const scrollHeightSpy = vi
      .spyOn(HTMLElement.prototype, "scrollHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "grid") {
          return 3000;
        }
        return 0;
      });
    const clientHeightSpy = vi
      .spyOn(HTMLElement.prototype, "clientHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "grid") {
          return 500;
        }
        return 0;
      });

    try {
      const wrapper = mount(CardView, {
        props: {
          items: longDynamicItems,
          layout: new GridLayout(),
          onLoadMore,
          ariaLabel: "Test CardView",
        },
        slots: {
          default: ({ item }: { item: DynamicCardItem }) =>
            h(
              Card,
              { itemKey: toCardItemKey(item) },
              {
                default: () => [
                  h(Image, { src: item.src }),
                  h(Heading, () => item.title),
                  h(Text, { slot: "detail" }, () => "PNG"),
                  h(Content, () => "Description"),
                ],
              }
            ),
        },
      });

      const grid = wrapper.get("[role=\"grid\"]");
      (grid.element as HTMLElement).scrollTop = 3000;
      await grid.trigger("scroll");

      expect(onLoadMore).toHaveBeenCalledTimes(1);
    } finally {
      scrollHeightSpy.mockRestore();
      clientHeightSpy.mockRestore();
    }
  });

  it("renders a loading row when loading with no items", async () => {
    const wrapper = mount(CardView, {
      props: {
        items: [],
        layout: new GridLayout(),
        loadingState: "loading",
        ariaLabel: "Test CardView",
      },
      slots: {
        default: ({ item }: { item: DynamicCardItem }) => createDynamicCard(item),
      },
    });

    const loadingRow = wrapper.get("[role=\"row\"]");
    expect(loadingRow.attributes("aria-rowindex")).toBe("1");

    const loadingSpinner = wrapper.get("[role=\"progressbar\"]");
    expect(loadingSpinner.attributes("aria-label")).toBe("Loading…");

    await wrapper.setProps({
      items: dynamicItems,
      loadingState: "idle",
    });

    expect(wrapper.find("[role=\"progressbar\"]").exists()).toBe(false);
    expect(wrapper.get("[role=\"grid\"]").attributes("aria-rowcount")).toBe(
      String(dynamicItems.length)
    );
  });

  it("renders loading more row when loading more", () => {
    const wrapper = mount(CardView, {
      props: {
        items: longDynamicItems,
        layout: new GridLayout(),
        loadingState: "loadingMore",
        ariaLabel: "Test CardView",
      },
      slots: {
        default: ({ item }: { item: DynamicCardItem }) => createDynamicCard(item),
      },
    });

    const grid = wrapper.get("[role=\"grid\"]");
    expect(grid.attributes("aria-rowcount")).toBe(String(longDynamicItems.length));

    const loadingSpinner = wrapper.get("[role=\"progressbar\"]");
    expect(loadingSpinner.attributes("aria-label")).toBe("Loading more…");

    const allRows = wrapper.findAll("[role=\"row\"]");
    expect(allRows[allRows.length - 1].attributes("aria-rowindex")).toBe(
      String(longDynamicItems.length + 1)
    );
  });

  it("does not render loading row when filtering", () => {
    const wrapper = mount(CardView, {
      props: {
        items: dynamicItems,
        layout: new GridLayout(),
        loadingState: "filtering",
        ariaLabel: "Test CardView",
      },
      slots: {
        default: ({ item }: { item: DynamicCardItem }) => createDynamicCard(item),
      },
    });

    expect(wrapper.find("[role=\"progressbar\"]").exists()).toBe(false);
  });

  it("renders empty state when there are no items", () => {
    const wrapper = mount(CardView, {
      props: {
        items: [],
        layout: new GridLayout(),
        renderEmptyState: () => h("div", "empty"),
        ariaLabel: "Test CardView",
      },
      slots: {
        default: ({ item }: { item: DynamicCardItem }) => createDynamicCard(item),
      },
    });

    const row = wrapper.get("[role=\"row\"]");
    expect(row.attributes("aria-rowindex")).toBe("1");
    expect(wrapper.get("[role=\"gridcell\"]").text()).toContain("empty");
  });

  it("checkbox interaction toggles selection once", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = mount(CardView, {
      props: {
        items: dynamicItems,
        layout: new GridLayout(),
        selectionMode: "multiple",
        onSelectionChange,
        ariaLabel: "Test CardView",
      },
      slots: {
        default: ({ item }: { item: DynamicCardItem }) =>
          h(
            Card,
            { itemKey: toCardItemKey(item) },
            {
              default: () => [
                h(Image, { src: item.src }),
                h(Heading, () => item.title),
                h(Text, { slot: "detail" }, () => "PNG"),
                h(Content, () => "Description"),
              ],
            }
          ),
      },
    });

    const user = userEvent.setup();
    const checkbox = wrapper.get("input[type=\"checkbox\"][aria-label=\"select\"]");

    await user.click(checkbox.element);
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll(".spectrum-Card")[0].classes()).toContain("is-selected");
    expect(onSelectionChange).toHaveBeenCalledTimes(1);

    await user.click(checkbox.element);
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll(".spectrum-Card")[0].classes()).not.toContain("is-selected");
    expect(onSelectionChange).toHaveBeenCalledTimes(2);
  });

  it("does not warn for internal checkbox focusable control", () => {
    const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    mount(CardView, {
      props: {
        items: dynamicItems,
        layout: new GridLayout(),
        selectionMode: "multiple",
        ariaLabel: "Test CardView",
      },
      slots: {
        default: ({ item }: { item: DynamicCardItem }) =>
          h(
            Card,
            { itemKey: toCardItemKey(item) },
            {
              default: () => [
                h(Image, { src: item.src }),
                h(Heading, () => item.title),
                h(Text, { slot: "detail" }, () => "PNG"),
                h(Content, () => "Description"),
              ],
            }
          ),
      },
    });

    expect(spyWarn).not.toHaveBeenCalledWith(
      "Card does not support focusable elements, please contact the team regarding your use case."
    );
    spyWarn.mockRestore();
  });
});
