import { parseDate, parseTime } from "@internationalized/date";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { DatePicker, DateRangePicker, TimeField } from "../src/DatePicker";
import { Provider } from "../src/Provider";

describe("@vue-spectrum/s2 DatePicker family", () => {
  it("renders DatePicker baseline attrs and emits date changes", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(DatePicker, {
            label: "Date",
            defaultValue: parseDate("2020-02-03"),
            size: "L",
            onChange,
          }),
      },
    });

    await wrapper.vm.$nextTick();

    const root = wrapper.get(".s2-DatePicker");
    expect(root.classes()).toContain("s2-DatePicker--L");
    const input = wrapper.get('input[type="date"]');
    expect((input.element as HTMLInputElement).value).toBe("2020-02-03");

    await input.setValue("2020-02-10");
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.at(-1)?.[0]?.toString?.()).toBe("2020-02-10");
  });

  it("renders DateRangePicker baseline attrs and both date inputs", async () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(DateRangePicker, {
            label: "Range",
            size: "S",
          }),
      },
    });

    await wrapper.vm.$nextTick();

    const root = wrapper.get(".s2-DateRangePicker");
    expect(root.classes()).toContain("s2-DateRangePicker--S");
    expect(wrapper.findAll('input[type="date"]').length).toBe(2);
  });

  it("renders TimeField baseline attrs and emits time changes", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(TimeField, {
            label: "Time",
            defaultValue: parseTime("12:23"),
            size: "M",
            onChange,
          }),
      },
    });

    await wrapper.vm.$nextTick();

    const root = wrapper.get(".s2-TimeField");
    expect(root.classes()).toContain("s2-TimeField--M");
    const input = wrapper.get('input[type="time"]');
    expect((input.element as HTMLInputElement).value).toBe("12:23");

    await input.setValue("09:30");
    expect(onChange).toHaveBeenCalled();
    expect(String(onChange.mock.calls.at(-1)?.[0]?.toString?.() ?? "")).toContain("09:30");
  });
});
