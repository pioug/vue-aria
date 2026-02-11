import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { Tooltip, TooltipTrigger } from "../src/Tooltip";

async function flushOverlay(): Promise<void> {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

describe("@vue-spectrum/s2 Tooltip", () => {
  it("renders baseline tooltip class and role", async () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            Tooltip,
            {
              "aria-label": "Helpful information",
            },
            {
              default: () => "Helpful information",
            }
          ),
      },
    });

    await wrapper.vm.$nextTick();

    const tooltip = wrapper.get(".s2-Tooltip");
    expect(tooltip.attributes("role")).toBe("tooltip");
    expect(tooltip.attributes("aria-label")).toBe("Helpful information");
  });

  it("opens on focus from tooltip trigger", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const wrapper = mount(Provider, {
      attachTo: document.body,
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            TooltipTrigger,
            {
              onOpenChange,
            },
            {
              default: () => [
                h("button", { "aria-label": "trigger" }, "Trigger"),
                h(Tooltip, null, {
                  default: () => "Helpful information.",
                }),
              ],
            }
          ),
      },
    });

    await wrapper.vm.$nextTick();
    wrapper.get(".s2-TooltipTrigger");

    const button = wrapper.get("button");
    (button.element as HTMLButtonElement).focus();
    await flushOverlay();

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(document.body.querySelector(".s2-Tooltip")).not.toBeNull();

    await user.keyboard("{Escape}");
    await flushOverlay();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(document.body.querySelector(".s2-Tooltip")).toBeNull();

    wrapper.unmount();
  });
});
