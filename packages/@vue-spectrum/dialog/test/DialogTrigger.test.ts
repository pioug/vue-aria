import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { h } from "vue";
import { Dialog } from "../src/Dialog";
import { DialogTrigger } from "../src/DialogTrigger";

describe("DialogTrigger", () => {
  it("opens and closes dialog content", async () => {
    const wrapper = mount(DialogTrigger as any, {
      slots: {
        trigger: () => h("button", { "data-testid": "trigger" }, "Trigger"),
        default: ({ close }: { close: () => void }) =>
          h(Dialog as any, null, {
            default: () => [
              h("p", "contents"),
              h("button", { "data-testid": "close", onClick: close }, "Close"),
            ],
          }),
      },
      attachTo: document.body,
    });

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);

    await wrapper.get('[data-testid="trigger"]').trigger("click");
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);

    await wrapper.get('[data-testid="close"]').trigger("click");
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });
});
