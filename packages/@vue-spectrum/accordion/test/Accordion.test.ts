import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import {
  Accordion,
  Disclosure,
  DisclosureHeader,
  DisclosurePanel,
  DisclosureTitle,
} from "../src";

interface AccordionItem {
  id: string;
  title: string;
  renderChildren: () => string | ReturnType<typeof h>;
}

const items: AccordionItem[] = [
  {
    id: "one",
    title: "one title",
    renderChildren: () => "one children",
  },
  {
    id: "two",
    title: "two title",
    renderChildren: () => "two children",
  },
  {
    id: "three",
    title: "three title",
    renderChildren: () => h("input", { type: "text" }),
  },
];

function renderAccordion(
  props: Record<string, unknown> = {},
  getDisclosureProps?: (item: AccordionItem) => Record<string, unknown>
) {
  return mount(Accordion, {
    attachTo: document.body,
    props,
    slots: {
      default: () =>
        items.map((item) =>
          h(
            Disclosure,
            {
              id: item.id,
              ...(getDisclosureProps?.(item) ?? {}),
            },
            {
              default: () => [
                h(DisclosureTitle, () => item.title),
                h(DisclosurePanel, () => item.renderChildren()),
              ],
            }
          )
        ),
    },
  });
}

describe("Accordion", () => {
  it("renders disclosure headings and region relationships", () => {
    const wrapper = renderAccordion();
    const headings = wrapper.findAll("h3");
    const buttons = wrapper.findAll("button");
    const panels = wrapper.findAll(".spectrum-Accordion-itemContent");

    expect(headings).toHaveLength(items.length);
    expect(buttons).toHaveLength(items.length);
    expect(panels).toHaveLength(items.length);

    for (const button of buttons) {
      expect(button.attributes("aria-expanded")).toBeDefined();
      expect(button.attributes("aria-controls")).toBeDefined();
    }

    const firstButton = buttons[0];
    const firstPanel = panels[0];
    expect(firstButton.attributes("aria-expanded")).toBe("false");
    expect(firstPanel.attributes("role")).toBe("region");
    expect(firstPanel.attributes("aria-labelledby")).toBe(firstButton.attributes("id"));
    expect(firstPanel.attributes("aria-hidden")).toBe("true");
    expect(firstPanel.attributes("hidden")).toBe("until-found");
  });

  it("toggles disclosure on mouse click", async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    const wrapper = renderAccordion({ onExpandedChange });
    const selectedItem = wrapper.findAll("button")[0];

    expect(selectedItem.attributes("aria-expanded")).toBe("false");

    await user.click(selectedItem.element);
    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    expect(selectedItem.attributes("aria-expanded")).toBe("true");

    await user.click(selectedItem.element);
    expect(selectedItem.attributes("aria-expanded")).toBe("false");
    expect(onExpandedChange).toHaveBeenCalledTimes(2);
  });

  it("allows users to open and close disclosures with Enter", async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    const wrapper = renderAccordion({ onExpandedChange });
    const selectedItem = wrapper.findAll("button")[0];

    selectedItem.element.focus();
    expect(document.activeElement).toBe(selectedItem.element);

    await user.keyboard("{Enter}");
    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    expect(selectedItem.attributes("aria-expanded")).toBe("true");

    await user.keyboard("{Enter}");
    expect(onExpandedChange).toHaveBeenCalledTimes(2);
    expect(selectedItem.attributes("aria-expanded")).toBe("false");

  });

  it("allows users to navigate accordion headers through the tab key", async () => {
    const user = userEvent.setup();
    const wrapper = renderAccordion();
    const [firstItem, secondItem, thirdItem] = wrapper.findAll("button");

    firstItem.element.focus();
    expect(document.activeElement).toBe(firstItem.element);

    await user.tab();
    expect(document.activeElement).toBe(secondItem.element);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(firstItem.element);

    await user.tab();
    expect(document.activeElement).toBe(secondItem.element);

    await user.tab();
    expect(document.activeElement).toBe(thirdItem.element);

    await user.tab();
    expect(document.activeElement).not.toBe(firstItem.element);
    expect(document.activeElement).not.toBe(secondItem.element);
    expect(document.activeElement).not.toBe(thirdItem.element);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(thirdItem.element);
  });

  it("allows users to type inside disclosures", async () => {
    const user = userEvent.setup();
    const wrapper = renderAccordion();
    const itemWithInputHeader = wrapper.findAll("button")[2];

    await user.click(itemWithInputHeader.element);

    const input = wrapper.get("input").element as HTMLInputElement;
    input.focus();
    await user.type(input, "Type example");
    expect(input.value).toBe("Type example");
  });

  it("supports defaultExpandedKeys", () => {
    const wrapper = renderAccordion({ defaultExpandedKeys: ["one"] });
    const selectedItem = wrapper.findAll("button")[0];
    expect(selectedItem.attributes("aria-expanded")).toBe("true");
  });

  it("supports controlled expandedKeys", async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    const wrapper = renderAccordion({ expandedKeys: ["one"], onExpandedChange });
    const selectedItem = wrapper.findAll("button")[0];

    expect(selectedItem.attributes("aria-expanded")).toBe("true");
    await user.click(selectedItem.element);

    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    expect(selectedItem.attributes("aria-expanded")).toBe("true");
  });

  it("supports isDisabled on Accordion", () => {
    const wrapper = renderAccordion({ isDisabled: true });
    const buttons = wrapper.findAll("button");

    for (const button of buttons) {
      expect(button.attributes("disabled")).toBeDefined();
    }
  });

  it("supports isDisabled on individual Disclosures", () => {
    const wrapper = renderAccordion(
      {},
      (item) => ({
        isDisabled: item.id === "two",
      })
    );
    const buttons = wrapper.findAll("button");

    for (const button of buttons) {
      if (button.text() === "two title") {
        expect(button.attributes("disabled")).toBeDefined();
      } else {
        expect(button.attributes("disabled")).toBeUndefined();
      }
    }
  });

  it("supports DisclosureHeader alias export", async () => {
    const user = userEvent.setup();
    const wrapper = mount(Accordion, {
      attachTo: document.body,
      slots: {
        default: () =>
          items.map((item) =>
            h(
              Disclosure,
              { id: item.id },
              {
                default: () => [
                  h(DisclosureHeader, () => item.title),
                  h(DisclosurePanel, () => item.renderChildren()),
                ],
              }
            )
          ),
      },
    });

    const buttons = wrapper.findAll("button");
    expect(buttons).toHaveLength(items.length);

    await user.click(buttons[0]!.element);
    expect(buttons[0]!.attributes("aria-expanded")).toBe("true");
  });
});
