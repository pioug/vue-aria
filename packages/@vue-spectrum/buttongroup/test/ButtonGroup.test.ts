import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@vue-spectrum/button";
import { ButtonGroup } from "../src";

const buttonGroupId = "button-group";

function renderButtonGroup(props: Record<string, unknown> = {}) {
  const onPressSpy1 = vi.fn();
  const onPressSpy2 = vi.fn();
  const onPressSpy3 = vi.fn();

  const wrapper = mount(ButtonGroup, {
    props: {
      "data-testid": buttonGroupId,
      ...props,
    },
    slots: {
      default: () => [
        h(Button, { onPress: onPressSpy1, variant: "primary" }, () => "Button1"),
        h(Button, { onPress: onPressSpy2, variant: "primary" }, () => "Button2"),
        h(Button, { onPress: onPressSpy3, variant: "primary" }, () => "Button3"),
      ],
    },
  });

  return {
    wrapper,
    onPressSpy1,
    onPressSpy2,
    onPressSpy3,
  };
}

describe("ButtonGroup", () => {
  it("renders multiple buttons", async () => {
    const user = userEvent.setup();
    const { wrapper, onPressSpy1, onPressSpy2, onPressSpy3 } = renderButtonGroup();

    const buttonGroup = wrapper.get(`[data-testid='${buttonGroupId}']`);
    expect(buttonGroup.element).toBeTruthy();

    const button1 = wrapper.get("button:nth-of-type(1)");
    const button2 = wrapper.get("button:nth-of-type(2)");
    const button3 = wrapper.get("button:nth-of-type(3)");

    expect(button1.text()).toContain("Button1");
    expect(button2.text()).toContain("Button2");
    expect(button3.text()).toContain("Button3");

    await user.click(button1.element);
    await user.click(button2.element);
    await user.click(button3.element);

    expect(onPressSpy1).toHaveBeenCalledTimes(1);
    expect(onPressSpy2).toHaveBeenCalledTimes(1);
    expect(onPressSpy3).toHaveBeenCalledTimes(1);
  });

  it("supports UNSAFE_className", () => {
    const { wrapper } = renderButtonGroup({
      UNSAFE_className: "custom-class",
    });

    const buttonGroup = wrapper.get(`[data-testid='${buttonGroupId}']`);
    expect(buttonGroup.attributes("class")).toContain("custom-class");
  });

  it("supports attaching a ref", async () => {
    const buttonGroupRef = ref<{
      UNSAFE_getDOMNode: () => HTMLElement | null;
    } | null>(null);

    const Harness = defineComponent({
      name: "ButtonGroupRefHarness",
      setup() {
        return () =>
          h(
            ButtonGroup,
            {
              ref: buttonGroupRef,
              "data-testid": buttonGroupId,
            },
            {
              default: () => [h(Button, { variant: "primary" }, () => "Button1")],
            }
          );
      },
    });

    const wrapper = mount(Harness);
    await nextTick();

    const buttonGroup = wrapper.get(`[data-testid='${buttonGroupId}']`).element;
    expect(buttonGroupRef.value?.UNSAFE_getDOMNode()).toBe(buttonGroup);
  });

  it("supports disabling all buttons via isDisabled", async () => {
    const user = userEvent.setup();
    const { wrapper, onPressSpy1, onPressSpy2, onPressSpy3 } = renderButtonGroup({
      isDisabled: true,
    });

    const button1 = wrapper.get("button:nth-of-type(1)");
    const button2 = wrapper.get("button:nth-of-type(2)");
    const button3 = wrapper.get("button:nth-of-type(3)");

    await user.click(button1.element);
    await user.click(button2.element);
    await user.click(button3.element);

    expect(onPressSpy1).not.toHaveBeenCalled();
    expect(onPressSpy2).not.toHaveBeenCalled();
    expect(onPressSpy3).not.toHaveBeenCalled();
  });

  it("supports vertical orientation", () => {
    const { wrapper } = renderButtonGroup({
      orientation: "vertical",
    });

    const buttonGroup = wrapper.get(`[data-testid='${buttonGroupId}']`);
    expect(buttonGroup.attributes("class")).toContain("spectrum-ButtonGroup--vertical");
  });

  it("goes vertical when there is not enough room after resize", async () => {
    const { wrapper } = renderButtonGroup();
    const buttonGroup = wrapper.get(`[data-testid='${buttonGroupId}']`);
    const groupElement = buttonGroup.element as HTMLElement;
    const groupClientWidthSpy = vi
      .spyOn(groupElement, "clientWidth", "get")
      .mockImplementation(() => 88);
    vi.spyOn(groupElement, "scrollWidth", "get").mockImplementation(() => 90);
    vi.spyOn(groupElement, "offsetWidth", "get").mockImplementation(() => 90);

    (wrapper.vm as unknown as { UNSAFE_remeasure: () => void }).UNSAFE_remeasure();
    await nextTick();
    await nextTick();

    expect(buttonGroup.attributes("class")).toContain("spectrum-ButtonGroup--vertical");

    groupClientWidthSpy.mockImplementation(() => 90);
    (wrapper.vm as unknown as { UNSAFE_remeasure: () => void }).UNSAFE_remeasure();
    await nextTick();
    await nextTick();

    expect(buttonGroup.attributes("class")).not.toContain(
      "spectrum-ButtonGroup--vertical"
    );
  });
});
