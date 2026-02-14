import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { NumberField } from "../src/NumberField";

function renderNumberField(
  props: Record<string, unknown> = {},
  attrs: Record<string, unknown> = { "aria-label": "labelled" }
) {
  return mount(NumberField as any, {
    props,
    attrs,
    attachTo: document.body,
  });
}

describe("NumberField", () => {
  it("has correct aria and props", () => {
    const wrapper = renderNumberField();
    const group = wrapper.get('[role="group"]');
    const textField = wrapper.get('input[type="text"]');
    const buttons = wrapper.findAll('[role="button"]');

    expect(wrapper.find('[role="group"]').exists()).toBe(true);
    expect(textField.attributes("type")).toBe("text");
    expect(textField.attributes("inputmode")).toBe("numeric");
    expect(buttons).toHaveLength(2);
    expect(buttons[0].attributes("tabindex")).toBe("-1");
    expect(buttons[1].attributes("tabindex")).toBe("-1");
  });

  it("handles input change and onChange", async () => {
    const onChange = vi.fn();
    const wrapper = renderNumberField({ onChange });
    const textField = wrapper.get('input[type="text"]');

    await textField.setValue("5");
    await textField.trigger("blur");

    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("increments and decrements using step buttons", async () => {
    const onChange = vi.fn();
    const wrapper = renderNumberField({
      minValue: 0,
      step: 5,
      onChange,
    });

    const buttons = wrapper.findAll('[role="button"]');
    const incrementButton = buttons[0];
    const decrementButton = buttons[1];

    await incrementButton.trigger("click");
    await nextTick();
    expect(onChange).toHaveBeenLastCalledWith(0);

    await incrementButton.trigger("click");
    await nextTick();
    expect(onChange).toHaveBeenLastCalledWith(5);

    await decrementButton.trigger("click");
    await nextTick();
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("supports hideStepper", () => {
    const wrapper = renderNumberField({ hideStepper: true });
    expect(wrapper.findAll('[role="button"]')).toHaveLength(0);
    expect(wrapper.get(".spectrum-Stepper").classes()).not.toContain("spectrum-Stepper--showStepper");
  });

  it("supports state classes", () => {
    const wrapper = renderNumberField({
      isQuiet: true,
      isReadOnly: true,
      validationState: "invalid",
    });
    const group = wrapper.get(".spectrum-Stepper");

    expect(group.classes()).toContain("spectrum-Stepper--isQuiet");
    expect(group.classes()).toContain("spectrum-Stepper--readonly");
    expect(group.classes()).toContain("is-invalid");
  });

  it("supports custom DOM props", () => {
    const wrapper = renderNumberField(
      { label: "Width" },
      {
        "aria-label": "labelled",
        "data-testid": "test",
      }
    );

    expect(wrapper.find('[data-testid="test"]').exists()).toBe(true);
  });

  it("renders hidden form input when name is provided", () => {
    const wrapper = renderNumberField({
      name: "amount",
      defaultValue: 45,
      formatOptions: {
        style: "currency",
        currency: "USD",
      },
    });

    const hiddenInput = wrapper.get('input[type="hidden"][name="amount"]');
    expect(hiddenInput.attributes("value")).toBe("45");
  });

  it("supports inputMode numeric when no decimals and non-negative range", () => {
    const wrapper = renderNumberField({
      minValue: 0,
      formatOptions: { maximumFractionDigits: 0 },
    });

    expect(wrapper.get('input[type="text"]').attributes("inputmode")).toBe("numeric");
  });
});
