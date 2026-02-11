import { parseDate } from "@internationalized/date";
import userEvent from "@testing-library/user-event";
import { mount, type VueWrapper } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Calendar, RangeCalendar } from "../src/Calendar";
import { Provider } from "../src/Provider";

function findDayButton(wrapper: VueWrapper, day: string): HTMLButtonElement {
  const match = wrapper
    .findAll("button")
    .find((buttonWrapper) => buttonWrapper.text() === day);
  if (!match) {
    throw new Error(`Missing day button ${day}`);
  }

  return match.element as HTMLButtonElement;
}

describe("@vue-spectrum/s2 Calendar", () => {
  it("renders baseline attrs for Calendar", async () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(Calendar, {
            "aria-label": "Booking calendar",
            defaultValue: parseDate("2019-06-05"),
          }),
      },
    });

    await wrapper.vm.$nextTick();

    const root = wrapper.get(".s2-Calendar");
    expect(root.attributes("role")).toBe("application");
    expect(root.attributes("aria-label")).toContain("Booking calendar");
  });

  it("emits range changes for RangeCalendar selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(RangeCalendar, {
            "aria-label": "Range calendar",
            onChange,
          }),
      },
    });

    await wrapper.vm.$nextTick();
    await user.click(findDayButton(wrapper, "5"));
    await user.click(findDayButton(wrapper, "10"));

    expect(onChange).toHaveBeenCalled();
    const range = onChange.mock.calls.at(-1)?.[0];
    expect(range?.start).toBeTruthy();
    expect(range?.end).toBeTruthy();
  });
});
