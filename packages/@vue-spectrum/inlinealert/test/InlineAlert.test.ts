import { mount } from "@vue/test-utils";
import { DEFAULT_SPECTRUM_THEME_CLASS_MAP, Provider } from "@vue-spectrum/provider";
import { Content, Header } from "@vue-spectrum/view";
import { h, nextTick } from "vue";
import { describe, expect, it } from "vitest";
import { InlineAlert } from "../src";

describe("InlineAlert", () => {
  it("has alert role", () => {
    const wrapper = mount(InlineAlert, {
      slots: {
        default: [
          "<Header>Title</Header>",
          "<Content>Content</Content>",
        ],
      },
      global: {
        components: {
          Header,
          Content,
        },
      },
    });

    const alert = wrapper.get("[role=\"alert\"]");
    expect(alert.attributes("role")).toBe("alert");
  });

  it("has a header", () => {
    const wrapper = mount(InlineAlert, {
      slots: {
        default: [
          "<Header data-testid=\"testid1\">Test Title</Header>",
          "<Content>Content</Content>",
        ],
      },
      global: {
        components: {
          Header,
          Content,
        },
      },
    });

    const header = wrapper.get("[data-testid=\"testid1\"]");
    expect(header.text()).toBe("Test Title");
  });

  it("has body content", () => {
    const wrapper = mount(InlineAlert, {
      slots: {
        default: [
          "<Header>Title</Header>",
          "<Content data-testid=\"testid1\">Test Content</Content>",
        ],
      },
      global: {
        components: {
          Header,
          Content,
        },
      },
    });

    const content = wrapper.get("[data-testid=\"testid1\"]");
    expect(content.text()).toBe("Test Content");
  });

  it.each(["neutral", "info", "positive", "notice", "negative"] as const)(
    "%s variant renders correctly",
    (variant) => {
      const wrapper = mount(InlineAlert, {
        props: {
          variant,
          "data-testid": "testid1",
        } as Record<string, unknown>,
        slots: {
          default: [
            "<Header>Title</Header>",
            "<Content>Content</Content>",
          ],
        },
        global: {
          components: {
            Header,
            Content,
          },
        },
      });

      const alert = wrapper.get("[data-testid=\"testid1\"]");
      expect(alert.classes()).toContain(`spectrum-InLineAlert--${variant}`);
    }
  );

  it("does not render an icon for neutral variant", () => {
    const wrapper = mount(InlineAlert, {
      props: {
        variant: "neutral",
      },
      slots: {
        default: [
          "<Header>Title</Header>",
          "<Content>Content</Content>",
        ],
      },
      global: {
        components: {
          Header,
          Content,
        },
      },
    });

    expect(wrapper.find(".spectrum-InLineAlert-icon").exists()).toBe(false);
  });

  it.each([
    ["info", "Information"],
    ["positive", "Success"],
    ["notice", "Warning"],
    ["negative", "Error"],
  ] as const)(
    "renders variant icon with %s label",
    (variant, label) => {
      const wrapper = mount(InlineAlert, {
        props: {
          variant,
        },
        slots: {
          default: [
            "<Header>Title</Header>",
            "<Content>Content</Content>",
          ],
        },
        global: {
          components: {
            Header,
            Content,
          },
        },
      });

      const icon = wrapper.get(".spectrum-InLineAlert-icon");
      expect(icon.attributes("role")).toBe("img");
      expect(icon.attributes("aria-label")).toBe(label);
    }
  );

  it("localizes variant icon label from provider locale", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
        locale: "fr-FR",
      },
      slots: {
        default: () =>
          h(
            InlineAlert,
            {
              variant: "info",
            },
            {
              default: () => [
                h(Header, null, () => "Title"),
                h(Content, null, () => "Content"),
              ],
            }
          ),
      },
    });

    const icon = wrapper.get(".spectrum-InLineAlert-icon");
    expect(icon.attributes("aria-label")).toBe("Informations");
  });

  it("supports autoFocus", async () => {
    const wrapper = mount(InlineAlert, {
      attachTo: document.body,
      props: {
        autoFocus: true,
      },
      slots: {
        default: [
          "<Header>Title</Header>",
          "<Content>Content</Content>",
        ],
      },
      global: {
        components: {
          Header,
          Content,
        },
      },
    });

    await nextTick();
    await Promise.resolve();

    const alert = wrapper.get("[role=\"alert\"]").element as HTMLElement;
    expect(alert.getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(alert);

    wrapper.unmount();
  });
});
