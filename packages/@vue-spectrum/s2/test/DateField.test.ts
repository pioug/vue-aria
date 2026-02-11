import { parseDate } from "@internationalized/date";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { DateField } from "../src/DateField";

describe("@vue-spectrum/s2 DateField", () => {
  it("renders baseline attrs and default date value", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(DateField, {
            label: "Date",
            defaultValue: parseDate("2020-02-03"),
            size: "L",
          }),
      },
    });

    const root = wrapper.get(".s2-DateField");
    expect(root.classes()).toContain("s2-DateField--L");

    const input = wrapper.get('input[type="date"]');
    expect((input.element as HTMLInputElement).value).toBe("2020-02-03");
  });

  it("emits parsed date changes", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(DateField, {
            label: "Date",
            defaultValue: parseDate("2020-02-03"),
            onChange,
          }),
      },
    });

    const input = wrapper.get('input[type="date"]');
    await input.setValue("2020-02-10");

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]?.toString?.()).toBe("2020-02-10");
  });
});
