import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import { Image } from "@vue-spectrum/image";
import { Heading, Text } from "@vue-spectrum/text";
import { Content } from "@vue-spectrum/view";
import { Card, CardView, GalleryLayout, GridLayout, WaterfallLayout } from "../src";

interface DynamicCardItem {
  src: string;
  title: string;
}

const dynamicItems: DynamicCardItem[] = [
  { src: "https://i.imgur.com/Z7AzH2c.jpg", title: "Title 1" },
  { src: "https://i.imgur.com/DhygPot.jpg", title: "Title 2" },
  { src: "https://i.imgur.com/L7RTlvI.png", title: "Title 3" },
];

const falsyIdItems = [
  { id: 0, src: "https://i.imgur.com/Z7AzH2c.jpg", title: "Title 1" },
  { id: "", src: "https://i.imgur.com/DhygPot.jpg", title: "Title 2" },
  { id: false, src: "https://i.imgur.com/L7RTlvI.png", title: "Title 3" },
  { id: null, src: "https://i.imgur.com/1nScMIH.jpg", title: "Title 4" },
];

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
            {},
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
            {},
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
});
