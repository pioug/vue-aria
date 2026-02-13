import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { PressResponder } from "../src/PressResponder";
import { usePress } from "../src/usePress";

describe("PressResponder", () => {
  it("warns if there is no pressable child", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    mount(PressResponder, {
      slots: {
        default: () => [h("div", [h("button", "Button")])],
      },
    });

    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it("does not warn when a pressable child registers", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const onPress = vi.fn();

    const Child = defineComponent({
      setup() {
        const { pressProps } = usePress({});
        return () => h("button", { ...pressProps }, "Button");
      },
    });

    mount(PressResponder, {
      props: { onPress },
      slots: {
        default: () => [h("div", [h(Child)])],
      },
    });

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
