import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { Well } from "../src/Well";

describe("@vue-spectrum/s2 Well", () => {
  it("renders baseline attrs and content", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            Well,
            {
              role: "region",
            },
            {
              default: () => "Helpful content",
            }
          ),
      },
    });

    const well = wrapper.get(".s2-Well");
    expect(well.classes()).toContain("spectrum-Well");
    expect(well.attributes("role")).toBe("region");
    expect(well.text()).toContain("Helpful content");
  });
});
