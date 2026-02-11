import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { Button, LinkButton } from "../src/Button";

describe("@vue-spectrum/s2 Button", () => {
  it("maps premium/genai variants to baseline spectrum button variants", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            Button,
            {
              variant: "premium",
              fillStyle: "outline",
              size: "L",
            },
            {
              default: () => "Create",
            }
          ),
      },
    });

    const button = wrapper.get("button");
    expect(button.classes()).toContain("s2-Button");
    expect(button.attributes("data-s2-variant")).toBe("premium");
    expect(button.attributes("data-s2-fill-style")).toBe("outline");
    expect(button.attributes("data-s2-size")).toBe("L");
    expect(button.attributes("data-variant")).toBe("accent");
    expect(button.attributes("data-style")).toBe("outline");
  });

  it("renders link buttons as anchor elements", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            LinkButton,
            {
              href: "https://example.com",
              variant: "secondary",
            },
            {
              default: () => "Visit",
            }
          ),
      },
    });

    const link = wrapper.get("a");
    expect(link.attributes("href")).toBe("https://example.com");
    expect(link.classes()).toContain("s2-Button");
    expect(link.attributes("data-s2-variant")).toBe("secondary");
  });
});
