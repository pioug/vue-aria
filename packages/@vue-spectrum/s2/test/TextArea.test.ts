import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { TextArea } from "../src/TextField";

describe("@vue-spectrum/s2 TextArea", () => {
  it("renders baseline attrs", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(TextArea, {
            label: "Details",
            defaultValue: "Hello",
            size: "M",
            rows: 4,
          }),
      },
    });

    const root = wrapper.get(".s2-TextArea");
    expect(root.classes()).toContain("s2-TextArea--M");
    const input = wrapper.get("textarea");
    expect((input.element as HTMLTextAreaElement).value).toBe("Hello");
    expect(input.attributes("rows")).toBe("4");
  });

  it("emits change values", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(TextArea, {
            label: "Details",
            onChange,
          }),
      },
    });

    const input = wrapper.get("textarea");
    await input.setValue("Updated text");
    expect(onChange).toHaveBeenCalledWith("Updated text");
  });
});
