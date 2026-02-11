import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { TextField } from "../src/TextField";

describe("@vue-spectrum/s2 TextField", () => {
  it("renders baseline attrs", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(TextField, {
            label: "Name",
            defaultValue: "Ada",
            size: "M",
          }),
      },
    });

    const root = wrapper.get(".s2-TextField");
    expect(root.classes()).toContain("s2-TextField--M");
    expect((wrapper.get("input").element as HTMLInputElement).value).toBe("Ada");
  });

  it("emits change values", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(TextField, {
            label: "Name",
            onChange,
          }),
      },
    });

    const input = wrapper.get("input");
    await input.setValue("Grace");
    expect(onChange).toHaveBeenCalled();
  });
});
