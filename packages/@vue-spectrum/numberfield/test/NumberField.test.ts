import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, provide, ref } from "vue";
import { FormValidationContext } from "@vue-aria/form-state";
import { I18nProvider } from "@vue-aria/i18n";
import { NumberField } from "../src/NumberField";
import { StepButton } from "../src/StepButton";

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
  afterEach(() => {
    vi.useRealTimers();
  });

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

  it("has proper aria attributes for readonly/disabled/required state", () => {
    const wrapper = renderNumberField(
      {
        defaultValue: 100,
        minValue: 0,
        maxValue: 100,
        isReadOnly: true,
        isDisabled: true,
        isRequired: true,
        formatOptions: { style: "currency", currency: "EUR" },
      },
      {
        "aria-label": "labelled",
        id: "test-numberfield-id",
      }
    );
    const input = wrapper.get('input[type="text"]');
    const buttons = wrapper.findAll('[role="button"]');

    expect(input.attributes("aria-valuenow")).toBeUndefined();
    expect(input.attributes("aria-valuetext")).toBeUndefined();
    expect(input.attributes("aria-valuemin")).toBeUndefined();
    expect(input.attributes("aria-valuemax")).toBeUndefined();
    expect(input.attributes("aria-readonly")).toBe("true");
    expect(input.attributes("aria-required")).toBe("true");
    expect(input.attributes("aria-disabled")).toBe("true");
    expect(input.attributes("role")).toBeUndefined();
    expect(input.attributes("id")).toBe("test-numberfield-id");

    expect(buttons[0].attributes("aria-controls")).toBe("test-numberfield-id");
    expect(buttons[1].attributes("aria-controls")).toBe("test-numberfield-id");
  });

  it.each([
    [{ defaultValue: 0 }],
    [{ value: 0 }],
  ])("renders zero value correctly: %o", (props) => {
    const wrapper = renderNumberField(props);
    expect((wrapper.get('input[type="text"]').element as HTMLInputElement).value).toBe("0");
  });

  it("associates string labels and exposes number-field role description", () => {
    const wrapper = renderNumberField(
      {
        label: "this is the stepper that never ends",
      },
      {}
    );
    const input = wrapper.get('input[type="text"]');
    const label = wrapper.get(".spectrum-FieldLabel");

    expect(label.text()).toContain("this is the stepper that never ends");
    expect(input.attributes("aria-labelledby")).toContain(label.attributes("id") ?? "");
    expect(input.attributes("aria-roledescription")).toBe("Number field");
  });

  it("attaches a user provided ref handle to the outer wrapper", async () => {
    const fieldRef = ref<any>(null);
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(NumberField as any, {
              ref: fieldRef,
              "aria-label": "labelled",
            });
        },
      }),
      {
        attachTo: document.body,
      }
    );

    await nextTick();
    const group = wrapper.get('[role="group"]').element as HTMLElement;
    const textField = wrapper.get('input[type="text"]').element as HTMLInputElement;

    expect(fieldRef.value.UNSAFE_getDOMNode()).toBe(group.parentElement);
    fieldRef.value.focus();
    await nextTick();
    expect(document.activeElement).toBe(textField);
  });

  it("attaches a user provided ref handle when rendered with a label", async () => {
    const fieldRef = ref<any>(null);
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(NumberField as any, {
              ref: fieldRef,
              "aria-label": "labelled",
              label: "Visually labelled",
            });
        },
      }),
      {
        attachTo: document.body,
      }
    );

    await nextTick();
    const group = wrapper.get('[role="group"]').element as HTMLElement;
    const textField = wrapper.get('input[type="text"]').element as HTMLInputElement;

    expect(fieldRef.value.UNSAFE_getDOMNode()).toBe(group.parentElement);
    fieldRef.value.focus();
    await nextTick();
    expect(document.activeElement).toBe(textField);
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

  it("keeps textbox value stable for controlled steppers without parent updates", async () => {
    const onChange = vi.fn();
    const wrapper = renderNumberField({
      value: 10,
      onChange,
    });
    const input = wrapper.get('input[type="text"]');
    const [incrementButton, decrementButton] = wrapper.findAll('[role="button"]');

    expect((input.element as HTMLInputElement).value).toBe("10");
    await incrementButton.trigger("click");
    expect((input.element as HTMLInputElement).value).toBe("10");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(11);

    await decrementButton.trigger("click");
    expect((input.element as HTMLInputElement).value).toBe("10");
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(9);
  });

  it("keeps textbox value stable for controlled typed text without parent updates", async () => {
    const onChange = vi.fn();
    const wrapper = renderNumberField({
      value: 10,
      onChange,
    });
    const input = wrapper.get('input[type="text"]');

    expect((input.element as HTMLInputElement).value).toBe("10");
    (input.element as HTMLInputElement).focus();
    await nextTick();
    await input.setValue("10123");
    await input.trigger("blur");
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("10");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(10123);
  });

  it("updates textbox when controlled parent updates value", async () => {
    const onChange = vi.fn();
    const wrapper = mount(
      defineComponent({
        setup() {
          const value = ref(10);
          return () =>
            h(NumberField as any, {
              "aria-label": "you shall not change",
              formatOptions: { style: "currency", currency: "EUR" },
              value: value.value,
              onChange: (nextValue: number) => {
                value.value = nextValue;
                onChange(nextValue);
              },
            });
        },
      }),
      { attachTo: document.body }
    );
    const input = wrapper.get('input[type="text"]');
    const [incrementButton, decrementButton] = wrapper.findAll('[role="button"]');
    const format = (value: number) =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(value);

    expect((input.element as HTMLInputElement).value).toBe(format(10));

    await incrementButton.trigger("click");
    await nextTick();
    expect((input.element as HTMLInputElement).value).toBe(format(11));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(11);

    await decrementButton.trigger("click");
    await nextTick();
    expect((input.element as HTMLInputElement).value).toBe(format(10));
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(10);
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

  it("supports label and help-text rendering", () => {
    const wrapper = renderNumberField({
      label: "Amount",
      description: "Enter amount in dollars.",
    });
    const input = wrapper.get('input[type="text"]');
    const label = wrapper.get(".spectrum-FieldLabel");
    expect(label.text()).toContain("Amount");
    expect(input.attributes("aria-labelledby")).toContain(label.attributes("id") ?? "");

    const helpText = wrapper.get(".spectrum-HelpText");
    expect(helpText.text()).toContain("Enter amount in dollars.");
  });

  it("supports custom increment and decrement aria labels", () => {
    const wrapper = renderNumberField({
      incrementAriaLabel: "Increase amount",
      decrementAriaLabel: "Decrease amount",
    } as any);
    const buttons = wrapper.findAll('[role="button"]');

    expect(buttons[0].attributes("aria-label")).toBe("Increase amount");
    expect(buttons[1].attributes("aria-label")).toBe("Decrease amount");
  });

  it("supports custom incrementAriaLabel with derived decrement label", () => {
    const wrapper = renderNumberField({
      incrementAriaLabel: "Increment",
    } as any, { "aria-label": "Width" });
    const buttons = wrapper.findAll('[role="button"]');

    expect(buttons[0].attributes("aria-label")).toBe("Increment");
    expect(buttons[0].attributes("id")).toBeUndefined();
    expect(buttons[0].attributes("aria-labelledby")).toBeUndefined();
    expect(buttons[1].attributes("aria-label")).toBe("Decrease Width");
    expect(buttons[1].attributes("id")).toBeUndefined();
    expect(buttons[1].attributes("aria-labelledby")).toBeUndefined();
  });

  it("supports custom decrementAriaLabel with derived increment label", () => {
    const wrapper = renderNumberField({
      decrementAriaLabel: "Decrement",
    } as any, { "aria-label": "Width" });
    const buttons = wrapper.findAll('[role="button"]');

    expect(buttons[0].attributes("aria-label")).toBe("Increase Width");
    expect(buttons[0].attributes("id")).toBeUndefined();
    expect(buttons[0].attributes("aria-labelledby")).toBeUndefined();
    expect(buttons[1].attributes("aria-label")).toBe("Decrement");
    expect(buttons[1].attributes("id")).toBeUndefined();
    expect(buttons[1].attributes("aria-labelledby")).toBeUndefined();
  });

  it("uses string label for textbox labeling and stepper aria-labels", () => {
    const wrapper = renderNumberField(
      {
        label: "Width",
      },
      {}
    );
    const input = wrapper.get('input[type="text"]');
    const buttons = wrapper.findAll('[role="button"]');

    expect(input.attributes("aria-labelledby")).toBeDefined();
    expect(input.attributes("aria-label")).toBeUndefined();
    expect(buttons[0].attributes("aria-label")).toBe("Increase Width");
    expect(buttons[0].attributes("id")).toBeUndefined();
    expect(buttons[0].attributes("aria-labelledby")).toBeUndefined();
    expect(buttons[1].attributes("aria-label")).toBe("Decrease Width");
    expect(buttons[1].attributes("id")).toBeUndefined();
    expect(buttons[1].attributes("aria-labelledby")).toBeUndefined();
  });

  it("uses aria-label for textbox and stepper labels", () => {
    const wrapper = renderNumberField({}, { "aria-label": "Width" });
    const input = wrapper.get('input[type="text"]');
    const buttons = wrapper.findAll('[role="button"]');

    expect(input.attributes("aria-label")).toBe("Width");
    expect(input.attributes("aria-labelledby")).toBeUndefined();
    expect(buttons[0].attributes("aria-label")).toBe("Increase Width");
    expect(buttons[0].attributes("id")).toBeUndefined();
    expect(buttons[0].attributes("aria-labelledby")).toBeUndefined();
    expect(buttons[1].attributes("aria-label")).toBe("Decrease Width");
    expect(buttons[1].attributes("id")).toBeUndefined();
    expect(buttons[1].attributes("aria-labelledby")).toBeUndefined();
  });

  it("wires aria-labelledby through input and stepper controls", () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h("div", [
              h("span", { id: "external-label" }, "External label"),
              h(NumberField as any, {
                "aria-labelledby": "external-label",
              }),
            ]);
        },
      }),
      { attachTo: document.body }
    );

    const input = wrapper.get('input[type="text"]');
    const buttons = wrapper.findAll('[role="button"]');

    expect(input.attributes("aria-labelledby")).toBe("external-label");
    expect(buttons[0].attributes("aria-label")).toBe("Increase");
    expect(buttons[0].attributes("id")).toBeDefined();
    expect(buttons[0].attributes("aria-labelledby")).toContain("external-label");
    expect(buttons[1].attributes("aria-label")).toBe("Decrease");
    expect(buttons[1].attributes("id")).toBeDefined();
    expect(buttons[1].attributes("aria-labelledby")).toContain("external-label");
  });

  it("uses invalid help-text state when validation is invalid", () => {
    const wrapper = renderNumberField({
      label: "Amount",
      validationState: "invalid",
      errorMessage: "Amount is invalid.",
    });
    const error = wrapper.get(".spectrum-HelpText.is-invalid");
    expect(error.text()).toContain("Amount is invalid.");
    expect(wrapper.get('[role="group"]').attributes("aria-invalid")).toBe("true");
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

  it("adds data attributes to the text field input", () => {
    const wrapper = renderNumberField(
      {},
      {
        "aria-label": "labelled",
        "data-testid": "numberfield-input",
      }
    );

    const textField = wrapper.get('input[type="text"]');
    expect(textField.attributes("data-testid")).toBe("numberfield-input");
  });

  it("handles compositionend events and undoes invalid compositions", async () => {
    const wrapper = renderNumberField({ onChange: vi.fn() });
    const input = wrapper.get('input[type="text"]');
    const element = input.element as HTMLInputElement;

    element.focus();
    await nextTick();
    await input.setValue("123");
    element.setSelectionRange(1, 1);

    await input.trigger("compositionstart");
    const beforeInputProceed = element.dispatchEvent(
      new InputEvent("beforeinput", {
        cancelable: false,
        data: "ü",
        inputType: "insertCompositionText",
      })
    );
    expect(beforeInputProceed).toBe(true);

    element.dispatchEvent(new InputEvent("input", { bubbles: true, data: "ü" }));

    element.value = "1ü23";
    element.setSelectionRange(2, 2);
    await input.trigger("compositionend");
    await nextTick();

    expect(element.value).toBe("123");
    expect(element.selectionStart).toBe(1);
    expect(element.selectionEnd).toBe(1);
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

  it("supports form value forwarding and null clearing", async () => {
    const wrapper = renderNumberField({
      name: "age",
      form: "test",
      value: 30,
    });

    const textField = wrapper.get('input[type="text"]');
    expect(textField.attributes("name")).toBeUndefined();

    const hiddenInput = wrapper.get('input[type="hidden"][name="age"]');
    expect(hiddenInput.attributes("form")).toBe("test");
    expect((hiddenInput.element as HTMLInputElement).value).toBe("30");

    await wrapper.setProps({ value: null as any });
    await nextTick();
    expect((wrapper.props() as any).value).toBeNull();

    expect((wrapper.get('input[type="hidden"][name="age"]').element as HTMLInputElement).value).toBe("");
  });

  it("can be reset to blank using null", async () => {
    const resetSpy = vi.fn();
    const wrapper = mount(
      defineComponent({
        setup() {
          const value = ref<number | null>(10);

          return () =>
            h("div", [
              h(NumberField as any, {
                "aria-label": "reset to blank using null",
                value: value.value as any,
                onChange: (nextValue: number) => {
                  value.value = nextValue;
                },
              }),
              h(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    value.value = null;
                    resetSpy();
                  },
                },
                "Reset"
              ),
            ]);
        },
      }),
      { attachTo: document.body }
    );

    const input = wrapper.get('input[type="text"]');
    expect((input.element as HTMLInputElement).value).toBe("10");

    await wrapper.get("button").trigger("click");
    await nextTick();

    expect(resetSpy).toHaveBeenCalledTimes(1);
    expect((input.element as HTMLInputElement).value).toBe("");
  });

  it("supports form reset", async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const value = ref(10);

          return () =>
            h("form", [
              h(NumberField as any, {
                "aria-label": "Value",
                value: value.value,
                onChange: (nextValue: number) => {
                  value.value = nextValue;
                },
              }),
              h("input", {
                type: "reset",
                "data-testid": "reset",
              }),
            ]);
        },
      }),
      { attachTo: document.body }
    );

    const input = wrapper.get('input[type="text"]');
    expect((input.element as HTMLInputElement).value).toBe("10");

    (input.element as HTMLInputElement).focus();
    await nextTick();
    await input.setValue("100");
    expect((input.element as HTMLInputElement).value).toBe("100");

    await input.trigger("blur");
    await nextTick();
    expect((input.element as HTMLInputElement).value).toBe("100");

    await wrapper.get('[data-testid="reset"]').trigger("click");
    await nextTick();
    expect((input.element as HTMLInputElement).value).toBe("10");
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

  it("supports platform inputMode behavior on Android", () => {
    const platformDescriptor = Object.getOwnPropertyDescriptor(window.navigator, "platform");
    const userAgentDescriptor = Object.getOwnPropertyDescriptor(window.navigator, "userAgent");

    try {
      Object.defineProperty(window.navigator, "platform", {
        configurable: true,
        value: "Linux",
      });
      Object.defineProperty(window.navigator, "userAgent", {
        configurable: true,
        value: "Android",
      });

      const numericMode = renderNumberField();
      expect(numericMode.get('input[type="text"]').attributes("inputmode")).toBe("numeric");

      const decimalMode = renderNumberField({ minValue: 0 });
      expect(decimalMode.get('input[type="text"]').attributes("inputmode")).toBe("decimal");

      const strictNumericMode = renderNumberField({
        minValue: 0,
        formatOptions: { maximumFractionDigits: 0 },
      });
      expect(strictNumericMode.get('input[type="text"]').attributes("inputmode")).toBe("numeric");
    } finally {
      if (platformDescriptor) {
        Object.defineProperty(window.navigator, "platform", platformDescriptor);
      }
      if (userAgentDescriptor) {
        Object.defineProperty(window.navigator, "userAgent", userAgentDescriptor);
      }
    }
  });

  it("uses numeric inputMode on iPad WebKit paths", () => {
    const platformDescriptor = Object.getOwnPropertyDescriptor(window.navigator, "platform");
    const userAgentDescriptor = Object.getOwnPropertyDescriptor(window.navigator, "userAgent");

    try {
      Object.defineProperty(window.navigator, "platform", {
        configurable: true,
        value: "iPad",
      });
      Object.defineProperty(window.navigator, "userAgent", {
        configurable: true,
        value: "AppleWebKit",
      });

      expect(renderNumberField().get('input[type="text"]').attributes("inputmode")).toBe("numeric");
      expect(
        renderNumberField({ minValue: 0 }).get('input[type="text"]').attributes("inputmode")
      ).toBe("numeric");
      expect(
        renderNumberField({
          minValue: 0,
          formatOptions: { maximumFractionDigits: 0 },
        }).get('input[type="text"]').attributes("inputmode")
      ).toBe("numeric");
    } finally {
      if (platformDescriptor) {
        Object.defineProperty(window.navigator, "platform", platformDescriptor);
      }
      if (userAgentDescriptor) {
        Object.defineProperty(window.navigator, "userAgent", userAgentDescriptor);
      }
    }
  });

  it("uses numeric inputMode on Mac WebKit paths", () => {
    const platformDescriptor = Object.getOwnPropertyDescriptor(window.navigator, "platform");
    const userAgentDescriptor = Object.getOwnPropertyDescriptor(window.navigator, "userAgent");

    try {
      Object.defineProperty(window.navigator, "platform", {
        configurable: true,
        value: "MacIntel",
      });
      Object.defineProperty(window.navigator, "userAgent", {
        configurable: true,
        value: "AppleWebKit",
      });

      expect(renderNumberField().get('input[type="text"]').attributes("inputmode")).toBe("numeric");
      expect(
        renderNumberField({ minValue: 0 }).get('input[type="text"]').attributes("inputmode")
      ).toBe("numeric");
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

  it("supports keyboard stepping for Arrow/Home/End keys", async () => {
    const onChange = vi.fn();
    const wrapper = renderNumberField({
      defaultValue: 5,
      minValue: 0,
      maxValue: 10,
      onChange,
    });
    const input = wrapper.get('input[type="text"]');

    await input.trigger("keydown", { key: "ArrowUp" });
    expect(onChange).toHaveBeenLastCalledWith(6);

    await input.trigger("keydown", { key: "ArrowDown" });
    expect(onChange).toHaveBeenLastCalledWith(5);

    await input.trigger("keydown", { key: "Home" });
    expect(onChange).toHaveBeenLastCalledWith(0);

    await input.trigger("keydown", { key: "End" });
    expect(onChange).toHaveBeenLastCalledWith(10);
  });

  it("advances increment starting from undefined", async () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const wrapper = renderNumberField({ onChange });
    const input = wrapper.get('input[type="text"]');
    const incrementStepper = wrapper.findAllComponents(StepButton)[0];
    const target = incrementStepper.element as HTMLElement;

    (input.element as HTMLInputElement).focus();
    await nextTick();

    (incrementStepper.props() as any).onPressStart?.({
      pointerType: "mouse",
      target,
    });
    await nextTick();
    vi.advanceTimersByTime(400);
    vi.advanceTimersByTime(60);

    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange.mock.calls.map(([value]) => value)).toEqual([0, 1, 2]);
    expect(onChange).toHaveBeenLastCalledWith(2);

    (incrementStepper.props() as any).onPressUp?.({
      pointerType: "mouse",
      target,
    });
    (incrementStepper.props() as any).onPressEnd?.({
      pointerType: "mouse",
      target,
    });
  });

  it("advances increment starting from undefined where minValue is defined", async () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const wrapper = renderNumberField({ onChange, minValue: 20 });
    const input = wrapper.get('input[type="text"]');
    const incrementStepper = wrapper.findAllComponents(StepButton)[0];
    const target = incrementStepper.element as HTMLElement;

    (input.element as HTMLInputElement).focus();
    await nextTick();

    (incrementStepper.props() as any).onPressStart?.({
      pointerType: "mouse",
      target,
    });
    await nextTick();
    vi.advanceTimersByTime(400);
    vi.advanceTimersByTime(60);

    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange.mock.calls.map(([value]) => value)).toEqual([20, 21, 22]);
    expect(onChange).toHaveBeenLastCalledWith(22);

    (incrementStepper.props() as any).onPressUp?.({
      pointerType: "mouse",
      target,
    });
    (incrementStepper.props() as any).onPressEnd?.({
      pointerType: "mouse",
      target,
    });
  });

  it("advances decrement starting from undefined", async () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const wrapper = renderNumberField({ onChange });
    const input = wrapper.get('input[type="text"]');
    const decrementStepper = wrapper.findAllComponents(StepButton)[1];
    const target = decrementStepper.element as HTMLElement;

    (input.element as HTMLInputElement).focus();
    await nextTick();

    (decrementStepper.props() as any).onPressStart?.({
      pointerType: "mouse",
      target,
    });
    await nextTick();
    vi.advanceTimersByTime(400);
    vi.advanceTimersByTime(60);

    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange.mock.calls.map(([value]) => value)).toEqual([0, -1, -2]);
    expect(onChange).toHaveBeenLastCalledWith(-2);

    (decrementStepper.props() as any).onPressUp?.({
      pointerType: "mouse",
      target,
    });
    (decrementStepper.props() as any).onPressEnd?.({
      pointerType: "mouse",
      target,
    });
  });

  it("advances automatically to the limit and not beyond", async () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const wrapper = renderNumberField({
      defaultValue: 10,
      minValue: 0,
      maxValue: 20,
      onChange,
    });
    const input = wrapper.get('input[type="text"]');
    const [incrementStepper, decrementStepper] = wrapper.findAllComponents(StepButton);
    const incrementTarget = incrementStepper.element as HTMLElement;
    const decrementTarget = decrementStepper.element as HTMLElement;

    (input.element as HTMLInputElement).focus();
    await nextTick();

    (incrementStepper.props() as any).onPressStart?.({
      pointerType: "mouse",
      target: incrementTarget,
    });
    await nextTick();
    vi.advanceTimersByTime(400);
    for (let i = 0; i < 10; i += 1) {
      vi.advanceTimersByTime(60);
    }
    expect(onChange).toHaveBeenCalledTimes(10);
    expect(onChange).toHaveBeenLastCalledWith(20);

    (incrementStepper.props() as any).onPressUp?.({
      pointerType: "mouse",
      target: incrementTarget,
    });
    (incrementStepper.props() as any).onPressEnd?.({
      pointerType: "mouse",
      target: incrementTarget,
    });

    onChange.mockReset();

    (decrementStepper.props() as any).onPressStart?.({
      pointerType: "mouse",
      target: decrementTarget,
    });
    await nextTick();
    vi.advanceTimersByTime(400);
    for (let i = 0; i < 20; i += 1) {
      vi.advanceTimersByTime(60);
    }
    expect(onChange).toHaveBeenCalledTimes(20);
    expect(onChange).toHaveBeenLastCalledWith(0);

    (decrementStepper.props() as any).onPressUp?.({
      pointerType: "mouse",
      target: decrementTarget,
    });
    (decrementStepper.props() as any).onPressEnd?.({
      pointerType: "mouse",
      target: decrementTarget,
    });
  });

  it("advances automatically if the arrows are held down", async () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const wrapper = renderNumberField({ defaultValue: 10, onChange });
    const input = wrapper.get('input[type="text"]');
    const [incrementStepper, decrementStepper] = wrapper.findAllComponents(StepButton);
    const incrementTarget = incrementStepper.element as HTMLElement;
    const decrementTarget = decrementStepper.element as HTMLElement;

    (input.element as HTMLInputElement).focus();
    await nextTick();

    (incrementStepper.props() as any).onPressStart?.({
      pointerType: "mouse",
      target: incrementTarget,
    });
    expect(onChange).toHaveBeenCalledWith(11);
    await nextTick();

    vi.advanceTimersByTime(399);
    expect(onChange).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(12);

    vi.advanceTimersByTime(60);
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenLastCalledWith(13);

    vi.advanceTimersByTime(60);
    vi.advanceTimersByTime(60);
    vi.advanceTimersByTime(60);
    expect(onChange).toHaveBeenCalledTimes(6);
    expect(onChange).toHaveBeenNthCalledWith(4, 14);
    expect(onChange).toHaveBeenNthCalledWith(5, 15);
    expect(onChange).toHaveBeenNthCalledWith(6, 16);

    (incrementStepper.props() as any).onPressUp?.({
      pointerType: "mouse",
      target: incrementTarget,
    });
    (incrementStepper.props() as any).onPressEnd?.({
      pointerType: "mouse",
      target: incrementTarget,
    });

    onChange.mockReset();

    (decrementStepper.props() as any).onPressStart?.({
      pointerType: "mouse",
      target: decrementTarget,
    });
    expect(onChange).toHaveBeenCalledWith(15);
    await nextTick();

    vi.advanceTimersByTime(399);
    expect(onChange).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(14);

    vi.advanceTimersByTime(60);
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenLastCalledWith(13);

    vi.advanceTimersByTime(60);
    vi.advanceTimersByTime(60);
    vi.advanceTimersByTime(60);
    expect(onChange).toHaveBeenCalledTimes(6);
    expect(onChange).toHaveBeenNthCalledWith(4, 12);
    expect(onChange).toHaveBeenNthCalledWith(5, 11);
    expect(onChange).toHaveBeenNthCalledWith(6, 10);

    (decrementStepper.props() as any).onPressUp?.({
      pointerType: "mouse",
      target: decrementTarget,
    });
    (decrementStepper.props() as any).onPressEnd?.({
      pointerType: "mouse",
      target: decrementTarget,
    });
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

  it("clears aria validate callback invalid state after valid blur commit", async () => {
    const wrapper = renderNumberField({
      defaultValue: 2,
      validate: (value: number) => (value === 2 ? "Invalid value" : null),
    });
    const group = wrapper.get('[role="group"]');
    const input = wrapper.get('input[type="text"]');

    expect(group.attributes("aria-invalid")).toBe("true");

    (input.element as HTMLInputElement).focus();
    await nextTick();
    await input.setValue("3");
    expect(group.attributes("aria-invalid")).toBe("true");

    await input.trigger("blur");
    await nextTick();
    expect(group.attributes("aria-invalid")).toBeUndefined();
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

  it("clears aria server validation after valid blur commit", async () => {
    const serverErrors = ref<Record<string, string | undefined>>({
      amount: "Invalid value.",
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
    const group = wrapper.get('[role="group"]');
    const input = wrapper.get('input[type="text"]');

    expect(group.attributes("aria-invalid")).toBe("true");
    expect(wrapper.get(".spectrum-HelpText.is-invalid").text()).toContain("Invalid value.");

    (input.element as HTMLInputElement).focus();
    await nextTick();
    await input.setValue("4");
    await input.trigger("blur");
    await nextTick();

    expect(group.attributes("aria-invalid")).toBeUndefined();
    expect(wrapper.find(".spectrum-HelpText.is-invalid").exists()).toBe(false);
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

  it("commits native validation changes when incrementing with steppers", async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h("form", { "data-testid": "form" }, [
              h(NumberField as any, {
                "data-testid": "input",
                label: "Value",
                isRequired: true,
                validationBehavior: "native",
              }),
            ]);
        },
      }),
      { attachTo: document.body }
    );

    const form = wrapper.get('[data-testid="form"]').element as HTMLFormElement;
    const input = wrapper.get('input[type="text"]');

    expect((input.element as HTMLInputElement).validity.valid).toBe(false);

    form.checkValidity();
    await nextTick();
    await wrapper.findAll('[role="button"]')[0].trigger("click");
    await nextTick();

    expect((input.element as HTMLInputElement).validity.valid).toBe(true);
  });

  it("supports validate function in native mode", async () => {
    const wrapper = renderNumberField({
      label: "Value",
      defaultValue: 2,
      step: 2,
      validationBehavior: "native",
      validate: (value: number) => (value !== 4 ? "Invalid value" : null),
    });
    const input = wrapper.get('input[type="text"]');
    await nextTick();

    expect((input.element as HTMLInputElement).validity.valid).toBe(false);
    expect((input.element as HTMLInputElement).validationMessage).toContain("Invalid value");

    (input.element as HTMLInputElement).focus();
    await nextTick();
    await input.setValue("4");
    await input.trigger("blur");
    await nextTick();

    expect((input.element as HTMLInputElement).validity.valid).toBe(true);
  });

  it("supports server validation in native mode", async () => {
    const serverErrors = ref<Record<string, string | undefined>>({
      amount: "Invalid value.",
    });
    const wrapper = mount(
      defineComponent({
        setup() {
          provide(FormValidationContext, serverErrors);
          return () =>
            h(NumberField as any, {
              label: "Amount",
              name: "amount",
              validationBehavior: "native",
            });
        },
      }),
      { attachTo: document.body }
    );
    const input = wrapper.get('input[type="text"]');
    await nextTick();

    expect((input.element as HTMLInputElement).validity.valid).toBe(false);
    expect((input.element as HTMLInputElement).validationMessage).toContain("Invalid value.");
  });

  it("supports custom native error messages", async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h("form", { "data-testid": "form" }, [
              h(NumberField as any, {
                label: "Value",
                isRequired: true,
                validationBehavior: "native",
                errorMessage: (validation: { validationDetails: ValidityState | null }) =>
                  validation.validationDetails?.valueMissing ? "Please enter a value" : null,
              }),
            ]);
        },
      }),
      { attachTo: document.body }
    );

    const form = wrapper.get('[data-testid="form"]').element as HTMLFormElement;
    const input = wrapper.get('input[type="text"]');
    await nextTick();
    form.checkValidity();
    await nextTick();

    expect((input.element as HTMLInputElement).validity.valid).toBe(false);
    expect((input.element as HTMLInputElement).validationMessage).toContain("Please enter a value");
  });

  it("only commits on blur when the value changed", async () => {
    const onChange = vi.fn();
    const wrapper = renderNumberField({
      label: "Value",
      isRequired: true,
      validationBehavior: "native",
      onChange,
    });
    const input = wrapper.get('input[type="text"]');

    (input.element as HTMLInputElement).focus();
    await nextTick();
    await input.trigger("blur");
    await nextTick();
    expect(onChange).not.toHaveBeenCalled();

    (input.element as HTMLInputElement).focus();
    await nextTick();
    await input.setValue("4");
    expect(onChange).not.toHaveBeenCalled();
    await input.trigger("blur");
    await nextTick();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(4);
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

  it("commits and formats percent values", async () => {
    const onChange = vi.fn();
    const wrapper = renderNumberField({
      defaultValue: 0.1,
      onChange,
      formatOptions: { style: "percent" },
    });

    const input = wrapper.get('input[type="text"]');
    expect((input.element as HTMLInputElement).value).toBe("10%");

    (input.element as HTMLInputElement).focus();
    await nextTick();
    await input.setValue("25");
    (input.element as HTMLInputElement).blur();
    await nextTick();

    expect(onChange).toHaveBeenCalledWith(0.25);
  });

  it("commits and formats currency values", async () => {
    const onChange = vi.fn();
    const wrapper = renderNumberField({
      onChange,
      formatOptions: { style: "currency", currency: "EUR" },
    });

    const input = wrapper.get('input[type="text"]');
    (input.element as HTMLInputElement).focus();
    await nextTick();
    await input.setValue("12.83");
    (input.element as HTMLInputElement).blur();
    await nextTick();

    expect(onChange).toHaveBeenCalledWith(12.83);
  });

  it("does not allow invalid characters for currency entry", async () => {
    const onChange = vi.fn();
    const wrapper = renderNumberField({
      defaultValue: 10,
      onChange,
      formatOptions: { style: "currency", currency: "SAR" },
    });
    const input = wrapper.get('input[type="text"]');
    const initialValue = (input.element as HTMLInputElement).value;

    (input.element as HTMLInputElement).focus();
    await nextTick();
    await input.setValue("@!");
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe(initialValue);
    expect(onChange).not.toHaveBeenCalled();

    await input.trigger("blur");
    await nextTick();
    expect((input.element as HTMLInputElement).value).toBe(initialValue);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not lose precision with decimal step constraints", async () => {
    const wrapper = renderNumberField({
      minValue: 0.1,
      maxValue: 24,
      step: 0.1,
      onChange: vi.fn(),
    });
    const input = wrapper.get('input[type="text"]');

    (input.element as HTMLInputElement).focus();
    await nextTick();
    await input.setValue("24");
    (input.element as HTMLInputElement).blur();
    await nextTick();

    expect((input.element as HTMLInputElement).value).toBe("24");
  });

  it("handles custom decimal step increments", async () => {
    const onChange = vi.fn();
    const wrapper = renderNumberField({
      onChange,
      step: 0.001,
    });
    const input = wrapper.get('input[type="text"]');
    const incrementButton = wrapper.findAll('[role="button"]')[0];

    (input.element as HTMLInputElement).focus();
    await nextTick();
    await input.setValue("1");

    await incrementButton.trigger("click");
    expect(onChange).toHaveBeenLastCalledWith(1.001);

    await incrementButton.trigger("click");
    expect(onChange).toHaveBeenLastCalledWith(1.002);

    await incrementButton.trigger("click");
    expect(onChange).toHaveBeenLastCalledWith(1.003);

    await incrementButton.trigger("click");
    expect(onChange).toHaveBeenLastCalledWith(1.004);
  });

  it.each([
    [{ defaultValue: 20, minValue: 50 }, "50"],
    [{ defaultValue: 20, maxValue: 10 }, "10"],
    [{ defaultValue: 20, minValue: 50, step: 3 }, "50"],
    [{ defaultValue: 20, maxValue: 10, step: 3 }, "9"],
    [{ value: 20, minValue: 50 }, "50"],
    [{ value: 20, maxValue: 10 }, "10"],
    [{ value: 20, minValue: 50, step: 3 }, "50"],
    [{ value: 20, maxValue: 10, step: 3 }, "9"],
  ])("clamps value/defaultValue to allowed range", (props, expected) => {
    const wrapper = renderNumberField(props);
    expect((wrapper.get('input[type="text"]').element as HTMLInputElement).value).toBe(expected);
  });

  it("parses leading decimal input on commit", async () => {
    const onChange = vi.fn();
    const wrapper = renderNumberField({ onChange });
    const input = wrapper.get('input[type="text"]');

    await input.setValue(".5");
    await input.trigger("blur");
    expect(onChange).toHaveBeenCalledWith(0.5);
  });

  it.each([
    ["6", 5],
    ["8", 10],
    ["-8", -10],
    ["-6", -5],
  ])("rounds to step on commit for %s", async (rawValue, expectedValue) => {
    const onChange = vi.fn();
    const wrapper = renderNumberField({
      step: 5,
      onChange,
    });
    const input = wrapper.get('input[type="text"]');

    await input.setValue(rawValue);
    await input.trigger("blur");
    expect(onChange).toHaveBeenCalledWith(expectedValue);
  });

  it("re-enables steppers when a max-limited typed value is cleared", async () => {
    const onChange = vi.fn();
    const wrapper = renderNumberField({
      onChange,
      defaultValue: 1,
      maxValue: 1,
    });
    const input = wrapper.get('input[type="text"]');
    const incrementAriaDisabled = () => wrapper.findAll('[role="button"]')[0].attributes("aria-disabled");
    const decrementAriaDisabled = () => wrapper.findAll('[role="button"]')[1].attributes("aria-disabled");

    expect((input.element as HTMLInputElement).value).toBe("1");
    expect(incrementAriaDisabled()).toBeDefined();
    expect(decrementAriaDisabled()).toBeUndefined();

    (input.element as HTMLInputElement).focus();
    await nextTick();
    await input.setValue("");
    await nextTick();

    expect(onChange).not.toHaveBeenCalled();
    expect((input.element as HTMLInputElement).value).toBe("");
    expect(incrementAriaDisabled()).toBeUndefined();
    expect(decrementAriaDisabled()).toBeUndefined();

    await input.trigger("blur");
    expect(onChange).toHaveBeenCalledWith(NaN);
  });

  it("disables increment stepper when typed value exceeds max", async () => {
    const wrapper = renderNumberField({
      onChange: vi.fn(),
      maxValue: 15,
    });
    const input = wrapper.get('input[type="text"]');
    const incrementAriaDisabled = () => wrapper.findAll('[role="button"]')[0].attributes("aria-disabled");
    const decrementAriaDisabled = () => wrapper.findAll('[role="button"]')[1].attributes("aria-disabled");

    expect(incrementAriaDisabled()).toBeUndefined();
    expect(decrementAriaDisabled()).toBeUndefined();

    (input.element as HTMLInputElement).focus();
    await nextTick();

    await input.setValue("10");
    await nextTick();
    expect(incrementAriaDisabled()).toBeUndefined();
    expect(decrementAriaDisabled()).toBeUndefined();

    await input.setValue("100");
    await nextTick();
    expect(incrementAriaDisabled()).toBeDefined();
    expect(decrementAriaDisabled()).toBeUndefined();
  });

  it("disables decrement stepper when typed value goes below min", async () => {
    const wrapper = renderNumberField({
      onChange: vi.fn(),
      minValue: -15,
    });
    const input = wrapper.get('input[type="text"]');
    const incrementAriaDisabled = () => wrapper.findAll('[role="button"]')[0].attributes("aria-disabled");
    const decrementAriaDisabled = () => wrapper.findAll('[role="button"]')[1].attributes("aria-disabled");

    expect(incrementAriaDisabled()).toBeUndefined();
    expect(decrementAriaDisabled()).toBeUndefined();

    (input.element as HTMLInputElement).focus();
    await nextTick();

    await input.setValue("-10");
    await nextTick();
    expect(incrementAriaDisabled()).toBeUndefined();
    expect(decrementAriaDisabled()).toBeUndefined();

    await input.setValue("-100");
    await nextTick();
    expect(incrementAriaDisabled()).toBeUndefined();
    expect(decrementAriaDisabled()).toBeDefined();
  });

  it("disables increment stepper when typed value is above max step boundary", async () => {
    const wrapper = renderNumberField({
      onChange: vi.fn(),
      minValue: 2,
      maxValue: 21,
      step: 3,
    });
    const input = wrapper.get('input[type="text"]');
    const incrementAriaDisabled = () => wrapper.findAll('[role="button"]')[0].attributes("aria-disabled");
    const decrementAriaDisabled = () => wrapper.findAll('[role="button"]')[1].attributes("aria-disabled");

    expect(incrementAriaDisabled()).toBeUndefined();
    expect(decrementAriaDisabled()).toBeUndefined();

    (input.element as HTMLInputElement).focus();
    await nextTick();

    await input.setValue("19");
    await nextTick();
    expect(incrementAriaDisabled()).toBeUndefined();
    expect(decrementAriaDisabled()).toBeUndefined();

    await input.setValue("20");
    await nextTick();
    expect(incrementAriaDisabled()).toBeDefined();
    expect(decrementAriaDisabled()).toBeUndefined();
  });

  it("disables decrement stepper when typed value reaches min step boundary", async () => {
    const wrapper = renderNumberField({
      onChange: vi.fn(),
      minValue: 2,
      maxValue: 21,
      step: 3,
    });
    const input = wrapper.get('input[type="text"]');
    const incrementAriaDisabled = () => wrapper.findAll('[role="button"]')[0].attributes("aria-disabled");
    const decrementAriaDisabled = () => wrapper.findAll('[role="button"]')[1].attributes("aria-disabled");

    expect(incrementAriaDisabled()).toBeUndefined();
    expect(decrementAriaDisabled()).toBeUndefined();

    (input.element as HTMLInputElement).focus();
    await nextTick();

    await input.setValue("3");
    await nextTick();
    expect(incrementAriaDisabled()).toBeUndefined();
    expect(decrementAriaDisabled()).toBeUndefined();

    await input.setValue("2");
    await nextTick();
    expect(incrementAriaDisabled()).toBeUndefined();
    expect(decrementAriaDisabled()).toBeDefined();
  });

  it("supports typing arabic-indic numerals in default locale", async () => {
    const onChange = vi.fn();
    const wrapper = renderNumberField({ onChange });
    const input = wrapper.get('input[type="text"]');

    expect((input.element as HTMLInputElement).value).toBe("");

    (input.element as HTMLInputElement).focus();
    await nextTick();
    await input.setValue("٤٢");
    await input.trigger("blur");
    expect((input.element as HTMLInputElement).value).toBe("٤٢");
    expect(onChange).toHaveBeenCalledWith(42);
    onChange.mockReset();

    (input.element as HTMLInputElement).focus();
    await nextTick();
    await input.setValue("");
    await nextTick();
    await input.setValue("56");
    await input.trigger("blur");
    expect((input.element as HTMLInputElement).value).toBe("56");
    expect(onChange).toHaveBeenCalledWith(56);
  });

  it("parses currency input with arbitrary whitespace on commit", async () => {
    const onChange = vi.fn();
    const wrapper = renderNumberField({
      onChange,
      formatOptions: { style: "currency", currency: "SAR" },
    });
    const input = wrapper.get('input[type="text"]');
    const expected = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "SAR",
    }).format(21);

    expect((input.element as HTMLInputElement).value).toBe("");

    (input.element as HTMLInputElement).focus();
    await nextTick();
    await input.setValue(" 21 . 00 ");
    expect((input.element as HTMLInputElement).value).toBe(" 21 . 00 ");

    await input.trigger("blur");
    expect((input.element as HTMLInputElement).value).toBe(expected);
    expect(onChange).toHaveBeenCalledWith(21);
  });

  it("supports grouped numeral entry in es-ES locale", async () => {
    const onChange = vi.fn();
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              I18nProvider as any,
              { locale: "es-ES" },
              {
                default: () =>
                  h(NumberField as any, {
                    "aria-label": "labelled",
                    onChange,
                  }),
              }
            );
        },
      }),
      { attachTo: document.body }
    );
    const input = wrapper.get('input[type="text"]');

    (input.element as HTMLInputElement).focus();
    await nextTick();
    await input.setValue("123.456.789");
    expect((input.element as HTMLInputElement).value).toBe("123.456.789");

    await input.trigger("blur");
    expect((input.element as HTMLInputElement).value).toBe("123.456.789");
    expect(onChange).toHaveBeenCalledWith(123456789);
  });

  it("formats default values using provider locale", () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              I18nProvider as any,
              { locale: "fr-FR" },
              {
                default: () =>
                  h(NumberField as any, {
                    "aria-label": "labelled",
                    defaultValue: -52,
                    formatOptions: { style: "currency", currency: "USD" },
                  }),
              }
            );
        },
      }),
      { attachTo: document.body }
    );

    const input = wrapper.get('input[type="text"]');
    const expected = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "USD",
    }).format(-52);
    expect((input.element as HTMLInputElement).value).toBe(expected);
  });

  it("accepts latin numeral entry in arab locale", async () => {
    const onChange = vi.fn();
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              I18nProvider as any,
              { locale: "ar-AE" },
              {
                default: () =>
                  h(NumberField as any, {
                    "aria-label": "labelled",
                    onChange,
                    formatOptions: { style: "currency", currency: "USD" },
                  }),
              }
            );
        },
      }),
      { attachTo: document.body }
    );

    const input = wrapper.get('input[type="text"]');
    (input.element as HTMLInputElement).focus();
    await nextTick();
    await input.setValue("21");
    await input.trigger("blur");

    const expected = new Intl.NumberFormat("ar-AE-u-nu-latn", {
      style: "currency",
      currency: "USD",
    }).format(21);
    expect((input.element as HTMLInputElement).value).toBe(expected);
    expect(onChange).toHaveBeenCalledWith(21);
  });

  it("accepts arabic-indic numeral entry in arab locale", async () => {
    const onChange = vi.fn();
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              I18nProvider as any,
              { locale: "ar-AE" },
              {
                default: () =>
                  h(NumberField as any, {
                    "aria-label": "labelled",
                    onChange,
                    formatOptions: { style: "currency", currency: "USD" },
                  }),
              }
            );
        },
      }),
      { attachTo: document.body }
    );

    const input = wrapper.get('input[type="text"]');
    (input.element as HTMLInputElement).focus();
    await nextTick();
    await input.setValue("٢١");
    await input.trigger("blur");

    const expected = new Intl.NumberFormat("ar-AE-u-nu-arab", {
      style: "currency",
      currency: "USD",
    }).format(21);
    expect((input.element as HTMLInputElement).value).toBe(expected);
    expect(onChange).toHaveBeenCalledWith(21);
  });

  it("accepts hanidec numeral entry in default locale", async () => {
    const onChange = vi.fn();
    const wrapper = renderNumberField({
      onChange,
      formatOptions: { style: "currency", currency: "USD" },
    });
    const input = wrapper.get('input[type="text"]');

    (input.element as HTMLInputElement).focus();
    await nextTick();
    await input.setValue("二一");
    await input.trigger("blur");

    const expected = new Intl.NumberFormat("en-US-u-nu-hanidec", {
      style: "currency",
      currency: "USD",
    }).format(21);
    expect((input.element as HTMLInputElement).value).toBe(expected);
    expect(onChange).toHaveBeenCalledWith(21);
  });

  it("accepts devanagari numeral entry in default locale", async () => {
    const onChange = vi.fn();
    const wrapper = renderNumberField({
      onChange,
      formatOptions: { style: "currency", currency: "USD" },
    });
    const input = wrapper.get('input[type="text"]');

    (input.element as HTMLInputElement).focus();
    await nextTick();
    await input.setValue("२१");
    await input.trigger("blur");

    const expected = new Intl.NumberFormat("en-US-u-nu-deva", {
      style: "currency",
      currency: "USD",
    }).format(21);
    expect((input.element as HTMLInputElement).value).toBe(expected);
    expect(onChange).toHaveBeenCalledWith(21);
  });

  it("accepts bengali numeral entry in default locale", async () => {
    const onChange = vi.fn();
    const wrapper = renderNumberField({
      onChange,
      formatOptions: { style: "currency", currency: "USD" },
    });
    const input = wrapper.get('input[type="text"]');

    (input.element as HTMLInputElement).focus();
    await nextTick();
    await input.setValue("২১");
    await input.trigger("blur");

    const expected = new Intl.NumberFormat("en-US-u-nu-beng", {
      style: "currency",
      currency: "USD",
    }).format(21);
    expect((input.element as HTMLInputElement).value).toBe(expected);
    expect(onChange).toHaveBeenCalledWith(21);
  });

  it("accepts latin numeral entry with SAR in arab locale", async () => {
    const onChange = vi.fn();
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              I18nProvider as any,
              { locale: "ar-AE" },
              {
                default: () =>
                  h(NumberField as any, {
                    "aria-label": "labelled",
                    onChange,
                    formatOptions: { style: "currency", currency: "SAR" },
                  }),
              }
            );
        },
      }),
      { attachTo: document.body }
    );

    const input = wrapper.get('input[type="text"]');
    (input.element as HTMLInputElement).focus();
    await nextTick();
    await input.setValue("21");
    await input.trigger("blur");

    const expected = new Intl.NumberFormat("ar-AE-u-nu-latn", {
      style: "currency",
      currency: "SAR",
    }).format(21);
    expect((input.element as HTMLInputElement).value).toBe(expected);
    expect(onChange).toHaveBeenCalledWith(21);
  });
});
