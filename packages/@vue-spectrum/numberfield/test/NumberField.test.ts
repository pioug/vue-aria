import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, provide, ref } from "vue";
import { FormValidationContext } from "@vue-aria/form-state";
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

  it("supports platform inputMode behavior on iPhone", () => {
    const platformDescriptor = Object.getOwnPropertyDescriptor(window.navigator, "platform");
    const userAgentDescriptor = Object.getOwnPropertyDescriptor(window.navigator, "userAgent");

    try {
      Object.defineProperty(window.navigator, "platform", {
        configurable: true,
        value: "iPhone",
      });
      Object.defineProperty(window.navigator, "userAgent", {
        configurable: true,
        value: "AppleWebKit",
      });

      const textMode = renderNumberField();
      expect(textMode.get('input[type="text"]').attributes("inputmode")).toBe("text");

      const decimalMode = renderNumberField({ minValue: 0 });
      expect(decimalMode.get('input[type="text"]').attributes("inputmode")).toBe("decimal");

      const numericMode = renderNumberField({
        minValue: 0,
        formatOptions: { maximumFractionDigits: 0 },
      });
      expect(numericMode.get('input[type="text"]').attributes("inputmode")).toBe("numeric");
    } finally {
      if (platformDescriptor) {
        Object.defineProperty(window.navigator, "platform", platformDescriptor);
      }
      if (userAgentDescriptor) {
        Object.defineProperty(window.navigator, "userAgent", userAgentDescriptor);
      }
    }
  });

  it("supports wheel stepping only while focused", async () => {
    const onChange = vi.fn();
    const wrapper = renderNumberField({
      defaultValue: 0,
      onChange,
    });
    const input = wrapper.get('input[type="text"]');

    input.element.dispatchEvent(new WheelEvent("wheel", { deltaY: 10, bubbles: true, cancelable: true }));
    expect(onChange).not.toHaveBeenCalled();

    input.element.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    input.element.dispatchEvent(new WheelEvent("wheel", { deltaY: 10, bubbles: true, cancelable: true }));
    expect(onChange).toHaveBeenLastCalledWith(1);

    input.element.dispatchEvent(new WheelEvent("wheel", { deltaY: -10, bubbles: true, cancelable: true }));
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("does not step on wheel for ctrlKey zoom gestures or when wheel stepping is disabled", () => {
    const onChange = vi.fn();
    const wrapper = renderNumberField({
      defaultValue: 0,
      onChange,
      isWheelDisabled: true,
    });
    const input = wrapper.get('input[type="text"]');

    input.element.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    input.element.dispatchEvent(new WheelEvent("wheel", {
      deltaY: 10,
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    }));
    input.element.dispatchEvent(new WheelEvent("wheel", { deltaY: 10, bubbles: true, cancelable: true }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("supports aria validate callback behavior", () => {
    const wrapper = renderNumberField({
      defaultValue: 13,
      validate: (value: number) => (value === 13 ? "Unlucky value" : null),
    });
    const group = wrapper.get('[role="group"]');
    expect(group.attributes("aria-invalid")).toBe("true");
  });

  it("supports server validation in aria mode", () => {
    const serverErrors = ref<Record<string, string | undefined>>({
      amount: "Amount is required.",
    });
    const wrapper = mount(
      defineComponent({
        setup() {
          provide(FormValidationContext, serverErrors);
          return () =>
            h(NumberField as any, {
              label: "Amount",
              name: "amount",
            });
        },
      }),
      { attachTo: document.body }
    );

    expect(wrapper.get('[role="group"]').attributes("aria-invalid")).toBe("true");
  });

  it("supports native required validation semantics", () => {
    const wrapper = renderNumberField({
      label: "Amount",
      isRequired: true,
      validationBehavior: "native",
    });
    const input = wrapper.get('input[type="text"]');

    expect(input.attributes("required")).toBeDefined();
    expect(input.attributes("aria-required")).toBeUndefined();
  });

  it("renders description and invalid help text states", () => {
    const description = renderNumberField({
      label: "Amount",
      description: "Enter amount in dollars.",
    });
    expect(description.get(".spectrum-HelpText").text()).toContain("Enter amount in dollars.");

    const invalid = renderNumberField({
      label: "Amount",
      validationState: "invalid",
      errorMessage: "Amount is invalid.",
    });
    expect(invalid.get(".spectrum-HelpText.is-invalid").text()).toContain("Amount is invalid.");
  });
});
