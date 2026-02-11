import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import {
  PickerItem as SpectrumPickerItem,
  PickerSection as SpectrumPickerSection,
} from "@vue-spectrum/picker";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Picker, PickerItem, PickerSection } from "../src";
import { Provider } from "../src/Provider";

async function flushOverlay(): Promise<void> {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

describe("@vue-spectrum/s2 Picker", () => {
  it("renders baseline attrs", async () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(Picker, {
            "aria-label": "Status",
            size: "L",
            items: [
              { key: "todo", label: "Todo" },
              { key: "done", label: "Done" },
            ],
          }),
      },
    });

    await wrapper.vm.$nextTick();
    const root = wrapper.get(".s2-Picker");
    expect(root.classes()).toContain("s2-Picker--L");
    expect(wrapper.get("button").attributes("aria-haspopup")).toBe("listbox");
  });

  it("opens and emits onSelectionChange", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const wrapper = mount(Provider, {
      attachTo: document.body,
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(Picker, {
            "aria-label": "Priority",
            items: [
              { key: "normal", label: "Normal" },
              { key: "urgent", label: "Urgent" },
            ],
            onSelectionChange,
          }),
      },
    });

    await wrapper.vm.$nextTick();
    await user.click(wrapper.get("button").element);
    await flushOverlay();

    const options = Array.from(
      document.body.querySelectorAll<HTMLElement>("[role=\"option\"]")
    );
    expect(options).toHaveLength(2);
    await user.click(options[1] as HTMLElement);
    expect(onSelectionChange).toHaveBeenCalledWith("urgent");

    wrapper.unmount();
  });

  it("re-exports picker static slot helpers", () => {
    expect(PickerItem).toBe(SpectrumPickerItem);
    expect(PickerSection).toBe(SpectrumPickerSection);
  });
});
