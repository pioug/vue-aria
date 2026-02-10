import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { Image } from "@vue-spectrum/image";
import { Heading, Text } from "@vue-spectrum/text";
import { Content } from "@vue-spectrum/view";
import { Card } from "../src";

interface CardContentOptions {
  includeDescription?: boolean;
  imageAlt?: string | undefined;
}

function createCardContent(options: CardContentOptions = {}) {
  const includeDescription = options.includeDescription ?? true;

  return [
    h(Image, {
      src: "https://i.imgur.com/Z7AzH2c.jpg",
      ...(options.imageAlt !== undefined ? { alt: options.imageAlt } : {}),
    }),
    h(Heading, () => "Title"),
    h(Text, { slot: "detail" }, () => "PNG"),
    includeDescription ? h(Content, () => "Description") : null,
  ];
}

describe("Card", () => {
  it("Default is labelled and described", async () => {
    const wrapper = mount(Card, {
      attachTo: document.body,
      slots: {
        default: () => createCardContent(),
      },
    });

    const card = wrapper.get("[role=\"article\"]");
    const heading = wrapper.get("h3");
    const section = wrapper.get("section");
    const image = wrapper.get("img");

    expect(card.attributes("aria-labelledby")).toBe(heading.attributes("id"));
    expect(card.attributes("aria-describedby")).toBe(section.attributes("id"));
    expect(image.attributes("alt")).toBe("");
    expect(section.text()).toBe("Description");

    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement).toBe(card.element);
    await user.tab();
    expect(document.activeElement).toBe(document.body);
  });

  it("NoDescription is labelled and not described", () => {
    const wrapper = mount(Card, {
      slots: {
        default: () => createCardContent({ includeDescription: false }),
      },
    });

    const card = wrapper.get("[role=\"article\"]");
    const heading = wrapper.get("h3");

    expect(wrapper.find("section").exists()).toBe(false);
    expect(card.attributes("aria-labelledby")).toBe(heading.attributes("id"));
    expect(card.attributes("aria-describedby")).toBeUndefined();
  });

  it("DefaultPreviewAlt has a labelled image", () => {
    const wrapper = mount(Card, {
      slots: {
        default: () => createCardContent({ imageAlt: "preview" }),
      },
    });

    const image = wrapper.get("img");
    expect(image.attributes("alt")).toBe("preview");
  });

  it("Quiet has no footer buttons", async () => {
    const wrapper = mount(Card, {
      attachTo: document.body,
      props: {
        isQuiet: true,
      },
      slots: {
        default: () => createCardContent(),
      },
    });

    const card = wrapper.get("[role=\"article\"]");
    expect(card.classes()).toContain("spectrum-Card--isQuiet");
    expect(wrapper.findAll("button")).toHaveLength(0);
    expect(wrapper.get("section").text()).toBe("Description");

    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement).toBe(card.element);
  });

  it("warns when card contains additional focusable elements", () => {
    const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    mount(Card, {
      slots: {
        default: () => [
          ...createCardContent(),
          h("a", { href: "https://example.com" }, "Focusable"),
        ],
      },
    });

    expect(spyWarn).toHaveBeenCalledWith(
      "Card does not support focusable elements, please contact the team regarding your use case."
    );
    spyWarn.mockRestore();
  });
});
