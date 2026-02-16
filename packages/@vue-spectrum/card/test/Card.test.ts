import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Card, CardView, GalleryLayout, GridLayout, WaterfallLayout } from "../src";

describe("Card", () => {
  it("renders a card article with default classes", () => {
    const wrapper = mount(Card, {
      attrs: {
        "data-testid": "card",
      },
    });

    const card = wrapper.get('[data-testid="card"]');
    expect(card.element.tagName).toBe("ARTICLE");
    expect(card.classes()).toContain("spectrum-Card");
    expect(card.classes()).toContain("spectrum-Card--default");
    expect(card.classes()).toContain("spectrum-Card--noLayout");
  });

  it("supports quiet and horizontal variants", () => {
    const wrapper = mount(Card, {
      props: {
        isQuiet: true,
        orientation: "horizontal",
      },
      attrs: {
        "data-testid": "card",
      },
    });

    const card = wrapper.get('[data-testid="card"]');
    expect(card.classes()).toContain("spectrum-Card");
    expect(card.classes()).toContain("spectrum-Card--horizontal");
    expect(card.classes()).not.toContain("spectrum-Card--default");
    expect(card.classes()).not.toContain("spectrum-Card--isQuiet");
  });

  it("supports layout classes", () => {
    const wrapper = mount(Card, {
      props: {
        layout: "grid",
      },
      attrs: {
        "data-testid": "card",
      },
    });

    expect(wrapper.get('[data-testid="card"]').classes()).toContain("spectrum-Card--grid");
  });

  it("supports UNSAFE_className", () => {
    const wrapper = mount(Card, {
      props: {
        UNSAFE_className: "my-card",
      },
      attrs: {
        "data-testid": "card",
      },
    });

    expect(wrapper.get('[data-testid="card"]').classes()).toContain("my-card");
  });
});

describe("Card layouts", () => {
  it("renders gallery layout", () => {
    const wrapper = mount(GalleryLayout, {
      slots: {
        default: () => "gallery",
      },
      attrs: {
        "data-testid": "gallery",
      },
    });

    expect(wrapper.get('[data-testid="gallery"]').classes()).toContain("spectrum-GalleryLayout");
  });

  it("renders grid layout", () => {
    const wrapper = mount(GridLayout, {
      slots: {
        default: () => "grid",
      },
      attrs: {
        "data-testid": "grid",
      },
    });

    expect(wrapper.get('[data-testid="grid"]').classes()).toContain("spectrum-GridLayout");
  });

  it("renders waterfall layout", () => {
    const wrapper = mount(WaterfallLayout, {
      slots: {
        default: () => "waterfall",
      },
      attrs: {
        "data-testid": "waterfall",
      },
    });

    expect(wrapper.get('[data-testid="waterfall"]').classes()).toContain("spectrum-WaterfallLayout");
  });
});

describe("CardView", () => {
  it("renders a card view container", () => {
    const wrapper = mount(CardView, {
      slots: {
        default: () => "items",
      },
      attrs: {
        "data-testid": "card-view",
      },
    });

    expect(wrapper.get('[data-testid="card-view"]').element.tagName).toBe("DIV");
    expect(wrapper.get('[data-testid="card-view"]').classes()).toContain("spectrum-CardView");
  });
});
