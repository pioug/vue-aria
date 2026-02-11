import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Card, CardView } from "../src";
import { Provider } from "../src/Provider";

describe("@vue-spectrum/s2 Card", () => {
  it("renders Card with S2 baseline classes", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            Card,
            {
              size: "M",
              variant: "secondary",
              "aria-label": "Asset card",
            },
            {
              default: () => [
                h("h3", null, "Card title"),
                h("section", null, "Card description"),
              ],
            }
          ),
      },
    });

    const card = wrapper.get(".s2-Card");
    expect(card.classes()).toContain("s2-Card--M");
    expect(card.classes()).toContain("s2-Card--secondary");
    expect(card.attributes("data-s2-size")).toBe("M");
    expect(card.attributes("data-s2-variant")).toBe("secondary");
  });

  it("renders CardView with card items", () => {
    const items = [
      { id: "one", title: "One" },
      { id: "two", title: "Two" },
    ];

    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            CardView,
            {
              "aria-label": "Cards",
              items,
              size: "S",
            },
            {
              default: ({ item }: { item: { id: string; title: string } }) =>
                h(
                  Card,
                  {
                    itemKey: item.id,
                  },
                  {
                    default: () => [
                      h("h3", null, item.title),
                      h("section", null, `Description for ${item.title}`),
                    ],
                  }
                ),
            }
          ),
      },
    });

    const cardView = wrapper.get(".s2-CardView");
    expect(cardView.classes()).toContain("s2-CardView--S");
    expect(cardView.attributes("role")).toBe("grid");
    expect(wrapper.findAll(".s2-Card")).toHaveLength(2);
  });
});
