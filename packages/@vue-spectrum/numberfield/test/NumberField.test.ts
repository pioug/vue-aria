import { fireEvent, render } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NumberField } from "../src";

function renderNumberField(props: Record<string, unknown> = {}) {
  return render(NumberField, {
    props: {
      "aria-label": "Amount",
      ...props,
    },
  });
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
});
