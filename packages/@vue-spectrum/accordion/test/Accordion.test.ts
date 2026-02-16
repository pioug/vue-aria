import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";
import { Accordion, Disclosure, DisclosurePanel, DisclosureTitle } from "../src";

const items = [
  { id: "one", title: "one title", children: "one children" },
  { id: "two", title: "two title", children: "two children" },
  { id: "three", title: "three title", children: "three children" },
];

function renderComponent(props: Record<string, any> = {}) {
  return mount(
    Accordion,
    {
      props,
      attrs: {
        "data-testid": "accordion",
      },
      slots: {
        default: () =>
          items.map((item) =>
            h(
              Disclosure,
              { id: item.id, key: item.id },
              {
                default: () => [
                  h(DisclosureTitle, null, { default: () => item.title }),
                  h(DisclosurePanel, null, { default: () => item.children }),
                ],
              }
            )
          ),
      },
      attachTo: document.body,
    } as any
  );
}

describe("Accordion", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders disclosures as headings and triggers", () => {
    const wrapper = renderComponent();
    const headings = wrapper.findAll("h3");
    expect(headings).toHaveLength(3);

    const buttons = wrapper.findAll("button");
    expect(buttons).toHaveLength(3);

    for (const button of buttons) {
      expect(button.attributes("aria-expanded")).toBeDefined();
      expect(button.attributes("aria-expanded")).toBe("false");
    }
  });

  it("toggles disclosure on mouse click", async () => {
    const onExpandedChange = vi.fn();
    const wrapper = renderComponent({ onExpandedChange });
    const [firstButton] = wrapper.findAll("button");

    expect(firstButton.attributes("aria-expanded")).toBe("false");
    await firstButton.trigger("click");
    await nextTick();
    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    expect(firstButton.attributes("aria-expanded")).toBe("true");

    await firstButton.trigger("click");
    await nextTick();
    expect(onExpandedChange).toHaveBeenCalledTimes(2);
    expect(firstButton.attributes("aria-expanded")).toBe("false");
  });

  it("supports defaultExpandedKeys", () => {
    const wrapper = renderComponent({ defaultExpandedKeys: ["one"] });
    const firstButton = wrapper.findAll("button")[0];
    expect(firstButton.attributes("aria-expanded")).toBe("true");
  });

  it("supports controlled expandedKeys", async () => {
    const onExpandedChange = vi.fn();
    const wrapper = renderComponent({ expandedKeys: ["one"], onExpandedChange });
    const firstButton = wrapper.findAll("button")[0];

    expect(firstButton.attributes("aria-expanded")).toBe("true");

    await firstButton.trigger("click");
    await nextTick();
    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    expect(firstButton.attributes("aria-expanded")).toBe("true");
  });

  it("supports disabled states", () => {
    const wrapper = mount(
      Accordion,
      {
        props: { isDisabled: true },
        slots: {
          default: () => items.map((item) =>
            h(Disclosure, { id: item.id }, {
              default: () => [
                h(DisclosureTitle, null, { default: () => item.title }),
                h(DisclosurePanel, null, { default: () => item.children }),
              ],
            })
          ),
        },
        attachTo: document.body,
      } as any
    );

    const buttons = wrapper.findAll("button");
    expect(buttons.every((button) => button.element.hasAttribute("disabled"))).toBe(true);
  });
});
