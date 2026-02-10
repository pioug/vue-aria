import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { ClearButton } from "../src";

describe("ClearButton", () => {
  it("handles defaults", async () => {
    const onPress = vi.fn();
    const user = userEvent.setup();
    const wrapper = mount(ClearButton, {
      props: {
        onPress,
      },
      slots: {
        default: () => "Click Me",
      },
    });

    const button = wrapper.get("button");
    await user.click(button.element);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("allows custom props to be passed through", () => {
    const wrapper = mount(ClearButton, {
      props: {
        "data-foo": "bar",
      } as Record<string, unknown>,
      slots: {
        default: () => "Click Me",
      },
    });

    expect(wrapper.get("button").attributes("data-foo")).toBe("bar");
  });

  it("does not accept an icon prop", () => {
    const wrapper = mount(ClearButton, {
      props: {
        icon: h("svg", { role: "status" }),
      } as Record<string, unknown>,
    });

    expect(wrapper.find("[role='status']").exists()).toBe(false);
  });

  it("allows forwarding a ref to the button instance", async () => {
    const clearButtonRef = ref<{
      UNSAFE_getDOMNode: () => HTMLElement | null;
      focus: () => void;
    } | null>(null);

    const Harness = defineComponent({
      name: "ClearButtonRefHarness",
      setup() {
        return () => h(ClearButton, { ref: clearButtonRef });
      },
    });

    const wrapper = mount(Harness, {
      attachTo: document.body,
    });

    await nextTick();

    const button = wrapper.get("button").element as HTMLButtonElement;
    expect(clearButtonRef.value?.UNSAFE_getDOMNode()).toBe(button);

    clearButtonRef.value?.focus();
    expect(document.activeElement).toBe(button);
  });
});
