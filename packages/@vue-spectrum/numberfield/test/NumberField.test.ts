import { fireEvent, render } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { Form } from "@vue-spectrum/form";
import {
  DEFAULT_SPECTRUM_THEME_CLASS_MAP,
  provideSpectrumProvider,
} from "@vue-spectrum/provider";
import { NumberField } from "../src";

function renderNumberField(props: Record<string, unknown> = {}) {
  return render(NumberField, {
    props: {
      "aria-label": "Amount",
      ...props,
    },
  });
}

function renderWithProvider(component: ReturnType<typeof defineComponent>) {
  const ProviderHarness = defineComponent({
    name: "NumberFieldProviderHarness",
    setup() {
      provideSpectrumProvider({
        theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
        colorScheme: "light",
        scale: "medium",
      });

      return () => h(component);
    },
  });

  return render(ProviderHarness);
}

describe("NumberField", () => {
  it("renders group, text input, and step buttons", () => {
    const tree = renderNumberField();

    const group = tree.getByRole("group");
    const input = tree.getByRole("textbox");
    const buttons = tree.getAllByRole("button");

    expect(group).toBeTruthy();
    expect(input.getAttribute("type")).toBe("text");
    expect(buttons).toHaveLength(2);
    expect(buttons[0].getAttribute("tabindex")).toBe("-1");
    expect(buttons[1].getAttribute("tabindex")).toBe("-1");
  });

  it("exposes UNSAFE_getDOMNode and focus through component ref", async () => {
    const numberFieldRef = ref<{
      UNSAFE_getDOMNode?: () => HTMLElement | null;
      focus?: () => void;
    } | null>(null);

    const Harness = defineComponent({
      name: "NumberFieldRefHarness",
      setup() {
        return () =>
          h("div", [
            h(NumberField, {
              ref: numberFieldRef,
              "aria-label": "Amount",
            }),
            h("button", { type: "button", "data-testid": "after" }, "After"),
            h("button", {
              type: "button",
              "data-testid": "focus",
              onClick: () => numberFieldRef.value?.focus?.(),
            }),
          ]);
      },
    });

    const tree = render(Harness);
    const input = tree.getByRole("textbox") as HTMLInputElement;
    const afterButton = tree.getByTestId("after") as HTMLButtonElement;
    const focusButton = tree.getByTestId("focus");
    const groupNode = numberFieldRef.value?.UNSAFE_getDOMNode?.();

    expect(groupNode).toBeTruthy();
    expect(groupNode?.getAttribute("role")).toBe("group");

    afterButton.focus();
    expect(document.activeElement).toBe(afterButton);

    await fireEvent.click(focusButton);
    await nextTick();
    expect(document.activeElement).toBe(input);
  });

  it("wires description and error message to aria-describedby", () => {
    const withDescription = renderNumberField({
      description: "Enter an integer.",
    });

    const inputWithDescription = withDescription.getByRole("textbox");
    const description = withDescription.getByText("Enter an integer.");
    expect(inputWithDescription.getAttribute("aria-describedby")).toContain(
      description.getAttribute("id") ?? ""
    );

    withDescription.unmount();

    const withError = renderNumberField({
      errorMessage: "Invalid amount",
      validationState: "invalid",
    });

    const inputWithError = withError.getByRole("textbox");
    const errorMessage = withError.getByText("Invalid amount");
    expect(inputWithError.getAttribute("aria-describedby")).toContain(
      errorMessage.getAttribute("id") ?? ""
    );
    expect(inputWithError.getAttribute("aria-invalid")).toBe("true");
  });

  it("commits typed value on blur", async () => {
    const onChange = vi.fn();
    const tree = renderNumberField({
      onChange,
    });

    const input = tree.getByRole("textbox") as HTMLInputElement;

    await fireEvent.update(input, "5");
    await fireEvent.blur(input);

    expect(input.value).toBe("5");
    expect(onChange).toHaveBeenCalled();
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  it("commits pasted text when the full input value is selected", async () => {
    const onChange = vi.fn();
    const tree = renderNumberField({
      defaultValue: 10,
      onChange,
    });

    const input = tree.getByRole("textbox") as HTMLInputElement;
    input.focus();
    input.setSelectionRange(0, input.value.length);

    await fireEvent.paste(input, {
      clipboardData: {
        getData: () => "42",
      },
    });

    expect(input.value).toBe("42");
    expect(onChange).toHaveBeenLastCalledWith(42);
  });

  it("does not commit paste when only part of the input is selected", async () => {
    const onChange = vi.fn();
    const tree = renderNumberField({
      defaultValue: 10,
      onChange,
    });

    const input = tree.getByRole("textbox") as HTMLInputElement;
    input.focus();
    input.setSelectionRange(0, 1);

    await fireEvent.paste(input, {
      clipboardData: {
        getData: () => "42",
      },
    });

    expect(input.value).toBe("10");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("snaps typed values to step boundaries on blur", async () => {
    const onChange = vi.fn();
    const tree = renderNumberField({
      step: 5,
      onChange,
    });

    const input = tree.getByRole("textbox") as HTMLInputElement;
    await fireEvent.focus(input);
    await fireEvent.update(input, "2");
    await fireEvent.blur(input);

    expect(input.value).toBe("0");
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("clamps default value to min and max range", () => {
    const minClamped = renderNumberField({
      defaultValue: 20,
      minValue: 50,
    });
    expect((minClamped.getByRole("textbox") as HTMLInputElement).value).toBe("50");

    minClamped.unmount();

    const maxClamped = renderNumberField({
      defaultValue: 20,
      maxValue: 10,
    });
    expect((maxClamped.getByRole("textbox") as HTMLInputElement).value).toBe("10");
  });

  it("snaps stepped values to the nearest valid boundary", () => {
    const minStepped = renderNumberField({
      defaultValue: 20,
      minValue: 50,
      step: 3,
    });
    expect((minStepped.getByRole("textbox") as HTMLInputElement).value).toBe("50");
    minStepped.unmount();

    const maxStepped = renderNumberField({
      defaultValue: 20,
      maxValue: 10,
      step: 3,
    });
    expect((maxStepped.getByRole("textbox") as HTMLInputElement).value).toBe("9");
    maxStepped.unmount();

    const controlledStepped = renderNumberField({
      value: 20,
      maxValue: 10,
      step: 3,
    });
    expect((controlledStepped.getByRole("textbox") as HTMLInputElement).value).toBe("9");
  });

  it("increments and decrements with step buttons", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const tree = renderNumberField({
      defaultValue: 0,
      step: 2,
      onChange,
    });

    const [incrementButton, decrementButton] = tree.getAllByRole("button");

    await user.click(incrementButton);
    expect(onChange).toHaveBeenLastCalledWith(2);

    await user.click(decrementButton);
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("keeps stepped max values on their snapped boundary", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const tree = renderNumberField({
      defaultValue: 8,
      step: 3,
      maxValue: 10,
      onChange,
    });

    const [incrementButton] = tree.getAllByRole("button");
    await user.click(incrementButton);

    const input = tree.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("9");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("moves focus to the input when steppers are pressed with a mouse", async () => {
    const tree = renderNumberField({
      defaultValue: 1,
    });

    const input = tree.getByRole("textbox") as HTMLInputElement;
    const [incrementButton] = tree.getAllByRole("button") as HTMLElement[];

    incrementButton.focus();
    expect(document.activeElement).toBe(incrementButton);

    await fireEvent.pointerDown(incrementButton, {
      button: 0,
      pointerType: "mouse",
    });

    expect(document.activeElement).toBe(input);

    await fireEvent.pointerUp(incrementButton, {
      button: 0,
      pointerType: "mouse",
    });
  });

  it("keeps focus on the pressed stepper for keyboard presses", async () => {
    const tree = renderNumberField({
      defaultValue: 1,
    });

    const input = tree.getByRole("textbox") as HTMLInputElement;
    const [incrementButton] = tree.getAllByRole("button") as HTMLElement[];
    input.focus();
    expect(document.activeElement).toBe(input);

    incrementButton.focus();
    expect(document.activeElement).toBe(incrementButton);
    await fireEvent.keyDown(incrementButton, { key: " " });

    expect(document.activeElement).toBe(incrementButton);

    await fireEvent.keyUp(incrementButton, { key: " " });
  });

  it("starts stepping from zero when empty and no bounds are set", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const tree = renderNumberField({
      onChange,
    });

    const input = tree.getByRole("textbox") as HTMLInputElement;
    const [incrementButton, decrementButton] = tree.getAllByRole("button");

    expect(input.value).toBe("");

    await user.click(incrementButton);
    expect(input.value).toBe("0");
    expect(onChange).toHaveBeenLastCalledWith(0);

    await fireEvent.focus(input);
    await fireEvent.update(input, "");
    await fireEvent.blur(input);
    expect(input.value).toBe("");

    await user.click(decrementButton);
    expect(input.value).toBe("0");
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("starts stepping from minValue when empty and minValue is set", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const tree = renderNumberField({
      minValue: 3,
      onChange,
    });

    const input = tree.getByRole("textbox") as HTMLInputElement;
    const [incrementButton, decrementButton] = tree.getAllByRole("button");

    expect(input.value).toBe("");

    await user.click(incrementButton);
    expect(input.value).toBe("3");
    expect(onChange).toHaveBeenLastCalledWith(3);

    await fireEvent.focus(input);
    await fireEvent.update(input, "");
    await fireEvent.blur(input);
    expect(input.value).toBe("");

    await user.click(decrementButton);
    expect(input.value).toBe("3");
    expect(onChange).toHaveBeenLastCalledWith(3);
  });

  it("starts stepping from maxValue when empty and decrementing with maxValue set", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const tree = renderNumberField({
      maxValue: 3,
      onChange,
    });

    const input = tree.getByRole("textbox") as HTMLInputElement;
    const [incrementButton, decrementButton] = tree.getAllByRole("button");

    expect(input.value).toBe("");

    await user.click(decrementButton);
    expect(input.value).toBe("3");
    expect(onChange).toHaveBeenLastCalledWith(3);

    await fireEvent.focus(input);
    await fireEvent.update(input, "");
    await fireEvent.blur(input);
    expect(input.value).toBe("");

    await user.click(incrementButton);
    expect(input.value).toBe("0");
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("hides stepper buttons when hideStepper is true", () => {
    const tree = renderNumberField({
      hideStepper: true,
    });

    expect(tree.getByRole("textbox")).toBeTruthy();
    expect(tree.queryAllByRole("button")).toHaveLength(0);
  });

  it("does not call onChange when incrementing at controlled max", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const tree = renderNumberField({
      value: 3,
      maxValue: 3,
      onChange,
    });

    const [incrementButton] = tree.getAllByRole("button");
    await user.click(incrementButton);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("supports controlled rerender", async () => {
    const tree = renderNumberField({
      value: 2,
    });

    const input = tree.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("2");

    await tree.rerender({
      "aria-label": "Amount",
      value: 7,
    });

    expect(input.value).toBe("7");
  });

  it("does not emit onChange when only a minus sign is typed then blurred from empty", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const tree = renderNumberField({
      onChange,
    });

    const input = tree.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("");

    await user.click(input);
    await user.keyboard("-");
    expect(input.value).toBe("-");

    await fireEvent.blur(input);
    expect(input.value).toBe("");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders hidden input when name is provided", () => {
    const tree = renderNumberField({
      name: "quantity",
      defaultValue: 4,
    });

    const hidden = tree.container.querySelector(
      'input[type="hidden"][name="quantity"]'
    ) as HTMLInputElement | null;

    expect(hidden).toBeTruthy();
    expect(hidden?.value).toBe("4");
  });

  it("passes data attributes through to the text input", () => {
    const tree = renderNumberField({
      "data-testid": "number-input",
      "data-track-id": "qty",
    });

    const input = tree.getByRole("textbox");
    expect(input.getAttribute("data-testid")).toBe("number-input");
    expect(input.getAttribute("data-track-id")).toBe("qty");
  });

  it("uses upstream-style platform inputMode behavior", () => {
    const platformSpy = vi
      .spyOn(window.navigator, "platform", "get")
      .mockReturnValue("iPhone");
    const uaSpy = vi
      .spyOn(window.navigator, "userAgent", "get")
      .mockReturnValue("AppleWebKit");

    const negativeField = renderNumberField();
    expect(
      (negativeField.getByRole("textbox") as HTMLInputElement).getAttribute("inputmode")
    ).toBe("text");
    negativeField.unmount();

    const nonNegativeField = renderNumberField({ minValue: 0 });
    expect(
      (nonNegativeField.getByRole("textbox") as HTMLInputElement).getAttribute("inputmode")
    ).toBe("decimal");
    nonNegativeField.unmount();

    const integerField = renderNumberField({
      minValue: 0,
      formatOptions: { maximumFractionDigits: 0 },
    });
    expect(
      (integerField.getByRole("textbox") as HTMLInputElement).getAttribute("inputmode")
    ).toBe("numeric");
    integerField.unmount();

    platformSpy.mockRestore();
    uaSpy.mockRestore();
  });

  it("switches to numeric inputMode for currencies without decimals", () => {
    const tree = renderNumberField({
      minValue: 0,
      formatOptions: {
        style: "currency",
        currency: "JPY",
      },
    });

    const input = tree.getByRole("textbox") as HTMLInputElement;
    expect(input.getAttribute("inputmode")).toBe("numeric");
  });

  it("formats currency defaults and parses currency input", async () => {
    const onChange = vi.fn();
    const tree = renderNumberField({
      defaultValue: 10,
      formatOptions: {
        style: "currency",
        currency: "EUR",
      },
      onChange,
    });

    const input = tree.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toContain("10");
    expect(input.value).toContain("€");

    await fireEvent.focus(input);
    await fireEvent.update(input, "€12.83");
    await fireEvent.blur(input);

    expect(input.value).toContain("12.83");
    expect(input.value).toContain("€");
    expect(onChange).toHaveBeenLastCalledWith(12.83);
  });

  it("parses percent input as fractional values", async () => {
    const onChange = vi.fn();
    const tree = renderNumberField({
      formatOptions: {
        style: "percent",
      },
      onChange,
    });

    const input = tree.getByRole("textbox") as HTMLInputElement;
    await fireEvent.focus(input);
    await fireEvent.update(input, "52");
    await fireEvent.blur(input);

    expect(input.value).toBe("52%");
    expect(onChange).toHaveBeenLastCalledWith(0.52);
  });

  it("rejects invalid partial characters while typing", async () => {
    const tree = renderNumberField({
      onChange: vi.fn(),
    });

    const input = tree.getByRole("textbox") as HTMLInputElement;
    await fireEvent.update(input, "1");
    expect(input.value).toBe("1");

    await fireEvent.update(input, "1acd");

    expect(input.value).toBe("1");
  });

  it("supports custom increment and decrement aria labels", () => {
    const tree = renderNumberField({
      label: "Count",
      incrementAriaLabel: "Add one",
      decrementAriaLabel: "Remove one",
    });

    const addButton = tree.getByRole("button", { name: "Add one" });
    const removeButton = tree.getByRole("button", { name: "Remove one" });

    expect(addButton).toBeTruthy();
    expect(removeButton).toBeTruthy();
  });

  it("supports focused wheel stepping and isWheelDisabled", async () => {
    const onChange = vi.fn();
    const tree = renderNumberField({
      defaultValue: 0,
      onChange,
    });
    const input = tree.getByRole("textbox");

    await fireEvent.wheel(input, { deltaY: 10 });
    expect(onChange).not.toHaveBeenCalled();

    await fireEvent.focus(input);
    await fireEvent.wheel(input, { deltaY: 10, ctrlKey: true });
    expect(onChange).not.toHaveBeenCalled();

    await fireEvent.wheel(input, { deltaY: 10 });
    expect(onChange).toHaveBeenLastCalledWith(1);

    tree.unmount();

    const disabledWheelTree = renderNumberField({
      defaultValue: 0,
      isWheelDisabled: true,
      onChange,
    });
    const disabledInput = disabledWheelTree.getByRole("textbox");

    await fireEvent.focus(disabledInput);
    await fireEvent.wheel(disabledInput, { deltaY: 10 });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("repeats stepper increments while the button is held", async () => {
    vi.useFakeTimers();

    const onChange = vi.fn();
    const tree = renderNumberField({
      defaultValue: 10,
      onChange,
    });

    const input = tree.getByRole("textbox");
    const [incrementButton] = tree.getAllByRole("button");

    await fireEvent.focus(input);
    await fireEvent.pointerDown(incrementButton, {
      button: 0,
      pointerType: "mouse",
    });

    expect(onChange).toHaveBeenLastCalledWith(11);

    vi.advanceTimersByTime(400);
    expect(onChange).toHaveBeenLastCalledWith(12);

    vi.advanceTimersByTime(120);
    expect(onChange).toHaveBeenLastCalledWith(14);

    await fireEvent.pointerUp(incrementButton, {
      button: 0,
      pointerType: "mouse",
    });
    const callCountAfterRelease = onChange.mock.calls.length;

    vi.advanceTimersByTime(500);
    expect(onChange).toHaveBeenCalledTimes(callCountAfterRelease);

    vi.useRealTimers();
  });

  it("supports validate function in aria behavior", async () => {
    const tree = renderNumberField({
      defaultValue: 2,
      validate: (value: number | undefined) =>
        value === 2 ? "Invalid value" : null,
    });

    const input = tree.getByRole("textbox") as HTMLInputElement;
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(tree.getByText("Invalid value")).toBeTruthy();

    await fireEvent.update(input, "4");
    await fireEvent.blur(input);
    await nextTick();

    expect(tree.queryByText("Invalid value")).toBeNull();
    expect(input.getAttribute("aria-invalid")).not.toBe("true");
  });

  it("supports custom native error message functions", async () => {
    const Harness = defineComponent({
      name: "NumberFieldNativeCustomMessageHarness",
      setup() {
        return () =>
          h("form", { "data-testid": "form" }, [
            h(NumberField, {
              label: "Amount",
              isRequired: true,
              validationBehavior: "native",
              errorMessage: (context) =>
                (
                  context.validationDetails as
                    | { valueMissing?: boolean }
                    | undefined
                )?.valueMissing
                  ? "Please enter a value"
                  : null,
            }),
          ]);
      },
    });
    const tree = render(Harness);

    const input = tree.getByRole("textbox") as HTMLInputElement;
    const form = tree.getByTestId("form") as HTMLFormElement;

    expect(form.checkValidity()).toBe(false);
    await nextTick();

    expect(tree.getByText("Please enter a value")).toBeTruthy();
    expect(input.getAttribute("aria-describedby")).toBeTruthy();
  });

  it("applies native Form.validationErrors to custom validity", async () => {
    const App = defineComponent({
      name: "NumberFieldNativeServerValidationHarness",
      setup() {
        return () =>
          h(
            Form,
            {
              validationBehavior: "native",
              validationErrors: {
                amount: "Invalid value.",
              },
            },
            {
              default: () =>
                h(NumberField, {
                  label: "Amount",
                  name: "amount",
                }),
            }
          );
      },
    });
    const tree = renderWithProvider(App);

    const input = tree.getByRole("textbox") as HTMLInputElement;
    expect(tree.getByText("Invalid value.")).toBeTruthy();
    expect(input.validity.valid).toBe(false);

    await fireEvent.update(input, "4");
    await nextTick();
    expect(input.validity.valid).toBe(true);
  });

  it("supports required native validation lifecycle", async () => {
    const Harness = defineComponent({
      name: "NumberFieldNativeRequiredHarness",
      setup() {
        return () =>
          h("form", { "data-testid": "form" }, [
            h(NumberField, {
              label: "Amount",
              isRequired: true,
              validationBehavior: "native",
            }),
          ]);
      },
    });
    const tree = render(Harness);

    const input = tree.getByRole("textbox") as HTMLInputElement;
    const form = tree.getByTestId("form") as HTMLFormElement;

    expect(input.getAttribute("aria-describedby")).toBeNull();
    expect(input.validity.valid).toBe(false);

    expect(form.checkValidity()).toBe(false);
    await nextTick();

    expect(input.getAttribute("aria-describedby")).toBeTruthy();
    expect(tree.getByText("Constraints not satisfied")).toBeTruthy();

    await fireEvent.update(input, "4");
    await nextTick();
    expect(input.validity.valid).toBe(true);
    expect(input.getAttribute("aria-describedby")).toBeTruthy();

    await fireEvent.blur(input);
    await nextTick();
    expect(input.getAttribute("aria-describedby")).toBeNull();
  });

  it("supports validate function in native behavior", async () => {
    const Harness = defineComponent({
      name: "NumberFieldNativeValidateHarness",
      setup() {
        return () =>
          h("form", { "data-testid": "form" }, [
            h(NumberField, {
              label: "Amount",
              validationBehavior: "native",
              defaultValue: 2,
              validate: (value: number | undefined) =>
                value === 4 ? null : "Invalid value",
            }),
          ]);
      },
    });
    const tree = render(Harness);

    const input = tree.getByRole("textbox") as HTMLInputElement;
    const form = tree.getByTestId("form") as HTMLFormElement;

    expect(input.validity.valid).toBe(false);
    expect(form.checkValidity()).toBe(false);
    await nextTick();

    expect(tree.getByText("Invalid value")).toBeTruthy();

    await fireEvent.update(input, "4");
    await nextTick();

    expect(input.validity.valid).toBe(true);
    expect(input.getAttribute("aria-describedby")).toBeTruthy();

    await fireEvent.blur(input);
    await nextTick();
    expect(input.getAttribute("aria-describedby")).toBeNull();
  });

  it("supports Form.validationErrors in aria behavior", async () => {
    const App = defineComponent({
      name: "NumberFieldAriaServerValidationHarness",
      setup() {
        return () =>
          h(
            Form,
            {
              validationErrors: {
                amount: "Invalid value.",
              },
            },
            {
              default: () =>
                h(NumberField, {
                  label: "Amount",
                  name: "amount",
                }),
            }
          );
      },
    });
    const tree = renderWithProvider(App);

    const input = tree.getByRole("textbox") as HTMLInputElement;
    expect(tree.getByText("Invalid value.")).toBeTruthy();
    expect(input.getAttribute("aria-invalid")).toBe("true");

    await fireEvent.update(input, "4");
    await fireEvent.blur(input);
    await nextTick();
    expect(tree.queryByText("Invalid value.")).toBeNull();
    expect(input.getAttribute("aria-invalid")).not.toBe("true");
  });

  it("supports uncontrolled form reset", async () => {
    const user = userEvent.setup();
    const Harness = defineComponent({
      name: "NumberFieldUncontrolledResetHarness",
      setup() {
        return () =>
          h("form", null, [
            h(NumberField, {
              "aria-label": "Amount",
              defaultValue: 10,
              name: "amount",
            }),
            h("input", {
              type: "reset",
              "data-testid": "reset",
            }),
          ]);
      },
    });

    const tree = render(Harness);
    const input = tree.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("10");

    await fireEvent.focus(input);
    await fireEvent.update(input, "42");
    await fireEvent.blur(input);
    expect(input.value).toBe("42");

    await user.click(tree.getByTestId("reset"));
    expect(input.value).toBe("10");
  });

  it("can be reset to blank with null-like controlled value", async () => {
    const Harness = defineComponent({
      name: "NumberFieldNullResetHarness",
      setup() {
        const value = ref<number | null>(12);
        return () =>
          h("div", [
            h(NumberField, {
              "aria-label": "Amount",
              value: value.value as unknown as number,
            }),
            h("button", {
              type: "button",
              "data-testid": "clear",
              onClick: () => {
                value.value = null;
              },
            }),
          ]);
      },
    });

    const user = userEvent.setup();
    const tree = render(Harness);
    const input = tree.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("12");

    await user.click(tree.getByTestId("clear"));
    await nextTick();
    expect(input.value).toBe("");
  });

  it("supports native server validation from form submission", async () => {
    const App = defineComponent({
      name: "NumberFieldNativeSubmitServerValidationHarness",
      setup() {
        const serverErrors = ref<Record<string, string | string[]>>({});

        return () =>
          h(
            Form,
            {
              validationBehavior: "native",
              validationErrors: serverErrors.value,
              onSubmit: (event: Event) => {
                event.preventDefault();
                serverErrors.value = {
                  amount: "Invalid value.",
                };
              },
            },
            {
              default: () => [
                h(NumberField, {
                  label: "Amount",
                  name: "amount",
                }),
                h("button", { type: "submit", "data-testid": "submit" }, "Submit"),
              ],
            }
          );
      },
    });
    const tree = renderWithProvider(App);

    const input = tree.getByRole("textbox") as HTMLInputElement;
    expect(input.getAttribute("aria-describedby")).toBeNull();

    await fireEvent.click(tree.getByTestId("submit"));
    await nextTick();

    expect(tree.getByText("Invalid value.")).toBeTruthy();
    expect(input.validity.valid).toBe(false);

    await fireEvent.update(input, "4");
    await nextTick();

    expect(tree.queryByText("Invalid value.")).toBeNull();
    expect(input.validity.valid).toBe(true);
  });
});
