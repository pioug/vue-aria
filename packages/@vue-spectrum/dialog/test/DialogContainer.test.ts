import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { Dialog } from "../src/Dialog";
import { DialogContainer } from "../src/DialogContainer";
import { useDialogContainer } from "../src/useDialogContainer";

const ExampleDialog = defineComponent({
  name: "ExampleDialog",
  setup() {
    const container = useDialogContainer();
    return () =>
      h(Dialog as any, null, {
        default: () => [
          h("p", "contents"),
          h("button", { "data-testid": "confirm", onClick: () => container.dismiss() }, "Confirm"),
        ],
      });
  },
});

describe("DialogContainer", () => {
  it("opens and closes from controlled child state", async () => {
    const onDismiss = vi.fn();
    const isOpen = ref(true);
    const Host = defineComponent({
      setup() {
        return () =>
          h(DialogContainer as any, {
            onDismiss: () => {
              onDismiss();
              isOpen.value = false;
            },
          }, {
            default: () => (isOpen.value ? [h(ExampleDialog)] : []),
          });
      },
    });

    const wrapper = mount(Host, {
      attachTo: document.body,
    });
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);

    await wrapper.get('[data-testid="confirm"]').trigger("click");
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });
});
