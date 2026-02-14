import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { ClearButton } from "../src/ClearButton";
import { pressElement } from "./helpers";

describe("ClearButton", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("handles defaults", async () => {
    const onPress = vi.fn();
    const wrapper = mount(ClearButton as any, {
      props: {
        onPress,
      },
      slots: {
        default: () => "Click Me",
      },
      attachTo: document.body,
    });

    await pressElement(wrapper.get("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("allows custom props to pass through", () => {
    const wrapper = mount(ClearButton as any, {
      attrs: {
        "data-foo": "bar",
      },
      slots: {
        default: () => "Click Me",
      },
    });

    expect(wrapper.get("button").attributes("data-foo")).toBe("bar");
  });

  it("does not accept an icon prop", () => {
    const wrapper = mount(ClearButton as any, {
      attrs: {
        icon: h("svg", { role: "status" }),
      },
    });

    expect(wrapper.find('[role="status"]').exists()).toBe(false);
  });

  it("allows forwarding a ref-like API", () => {
    const clearRef = ref<any>(null);
    const wrapper = mount(
      defineComponent({
        setup() {
          return () => h(ClearButton as any, { ref: clearRef });
        },
      }),
      {
        attachTo: document.body,
      }
    );

    const button = wrapper.get("button").element as HTMLButtonElement;
    expect(clearRef.value.UNSAFE_getDOMNode()).toBe(button);

    clearRef.value.focus();
    expect(document.activeElement).toBe(button);
  });
});
