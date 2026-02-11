import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { Switch } from "../src/Switch";

describe("@vue-spectrum/s2 Switch", () => {
  it("renders baseline attrs", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            Switch,
            {
              size: "L",
              "aria-label": "Notifications",
            },
            {
              default: () => "Notifications",
            }
          ),
      },
    });

    const root = wrapper.get(".s2-Switch");
    expect(root.classes()).toContain("s2-Switch--L");
    expect(wrapper.get("input[role='switch']").attributes("aria-label")).toBe(
      "Notifications"
    );
  });

  it("toggles and emits changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            Switch,
            {
              onChange,
            },
            {
              default: () => "Enabled",
            }
          ),
      },
    });

    const input = wrapper.get("input[role='switch']");
    expect((input.element as HTMLInputElement).checked).toBe(false);

    await user.click(input.element);
    expect(onChange).toHaveBeenCalledWith(true);
    expect((input.element as HTMLInputElement).checked).toBe(true);
  });
});
