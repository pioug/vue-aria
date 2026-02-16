import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { I18nProvider } from "@vue-aria/i18n";
import { useToolbar } from "../src";

describe("useToolbar", () => {
  const renderToolbar = (props: Record<string, unknown> = {}) => {
    return defineComponent({
      setup() {
        const toolbarRef = ref<HTMLElement | null>(null);
        const { toolbarProps } = useToolbar(props as any, {
          get current() {
            return toolbarRef.value;
          },
          set current(value: Element | null) {
            toolbarRef.value = value as HTMLElement | null;
          },
        });

        return () =>
          h("div", { "data-testid": "toolbar", ref: toolbarRef, ...toolbarProps }, [
            h("button", { type: "button" }, "A"),
            h("button", { type: "button" }, "B"),
            h("button", { type: "button" }, "C"),
          ]);
      },
    });
  };

  it("defaults to a toolbar role", () => {
    const wrapper = mount(renderToolbar());
    expect(wrapper.get('[data-testid="toolbar"]').attributes("role")).toBe("toolbar");
    wrapper.unmount();
  });

  it("uses radiogroup semantics when nested in another toolbar", async () => {
    const Probe = defineComponent({
      setup() {
        const Nested = renderToolbar();
        return () =>
          h("div", { role: "toolbar" }, [
            h(Nested),
          ]);
      },
    });

    const wrapper = mount(Probe);
    await nextTick();
    expect(wrapper.find('[data-testid="toolbar"]').attributes("role")).toBe("group");
    wrapper.unmount();
  });

  it("moves focus with arrow keys", async () => {
    const wrapper = mount(renderToolbar());
    await nextTick();

    const buttons = wrapper.findAll("button").map((button) => button.element as HTMLButtonElement);
    buttons[1].focus();
    buttons[1].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(buttons[2]);
    wrapper.unmount();
  });

  it("moves focus backwards for tab in RTL locale", async () => {
    const wrapper = mount({
      setup() {
        return () => h(I18nProvider, { locale: "ar-AE" }, { default: () => h(renderToolbar({ orientation: "horizontal" })) });
      },
    });
    await nextTick();

    const buttons = wrapper.findAll("button").map((button) => button.element as HTMLButtonElement);
    buttons[1].focus();
    buttons[1].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(buttons[0]);
    wrapper.unmount();
  });
});
