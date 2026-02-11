import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { Link } from "../src/Link";

describe("@vue-spectrum/s2 Link", () => {
  it("renders anchor baseline attrs when href is provided", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            Link,
            {
              href: "https://example.com",
            },
            {
              default: () => "Visit",
            }
          ),
      },
    });

    const link = wrapper.get(".s2-Link");
    expect(link.element.tagName).toBe("A");
    expect(link.attributes("href")).toContain("https://example.com");
    expect(link.text()).toContain("Visit");
  });

  it("renders span baseline attrs without href", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            Link,
            null,
            {
              default: () => "Inline action",
            }
          ),
      },
    });

    const link = wrapper.get(".s2-Link");
    expect(link.element.tagName).toBe("SPAN");
    expect(link.attributes("role")).toBe("link");
    expect(link.attributes("tabindex")).toBe("0");
  });
});
