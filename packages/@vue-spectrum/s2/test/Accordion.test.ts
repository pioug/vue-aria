import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import {
  AccordionItem,
  AccordionItemHeader,
  AccordionItemPanel,
  AccordionItemTitle,
  Accordion,
  Disclosure,
  DisclosurePanel,
  DisclosureTitle,
} from "../src";

describe("@vue-spectrum/s2 Accordion", () => {
  it("re-exports accordion item aliases", () => {
    expect(AccordionItem).toBe(Disclosure);
    expect(AccordionItemHeader).toBe(DisclosureTitle);
    expect(AccordionItemTitle).toBe(DisclosureTitle);
    expect(AccordionItemPanel).toBe(DisclosurePanel);
  });

  it("renders baseline attrs and toggles disclosure state", async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    const wrapper = mount(Provider, {
      attachTo: document.body,
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            Accordion,
            {
              onExpandedChange,
            },
            {
              default: () => [
                h(
                  Disclosure,
                  { id: "a" },
                  {
                    default: () => [
                      h(DisclosureTitle, null, { default: () => "Section A" }),
                      h(DisclosurePanel, null, { default: () => "Panel A" }),
                    ],
                  }
                ),
              ],
            }
          ),
      },
    });

    const accordion = wrapper.get(".s2-Accordion");
    expect(accordion.classes()).toContain("spectrum-Accordion");

    const disclosure = wrapper.get(".s2-Disclosure");
    expect(disclosure.classes()).toContain("spectrum-Accordion-item");

    const button = wrapper.get("button");
    expect(button.attributes("aria-expanded")).toBe("false");

    await user.click(button.element);
    expect(button.attributes("aria-expanded")).toBe("true");
    expect(onExpandedChange).toHaveBeenCalledTimes(1);
  });
});
