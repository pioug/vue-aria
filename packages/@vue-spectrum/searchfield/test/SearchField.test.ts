import { fireEvent, render } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { SearchField } from "../src";

const inputText = "blah";

function renderComponent(props: Record<string, unknown> = {}) {
  return render(SearchField, {
    props: {
      "aria-label": "the label",
      ...props,
    },
  });
}

describe("SearchField", () => {
  it("warns once when placeholder is provided", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const tree = renderComponent({
      placeholder: "Search...",
    });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      "Placeholders are deprecated due to accessibility issues. Please use help text instead. See the docs for details: https://react-spectrum.adobe.com/react-spectrum/SearchField.html#help-text"
    );

    await tree.rerender({
      "aria-label": "the label",
      placeholder: "Search again...",
    });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });

  it("renders search input and hides clear button when empty", () => {
    const tree = renderComponent();
    const input = tree.getByRole("searchbox");

    expect(input).toBeTruthy();
    expect(input.getAttribute("type")).toBe("search");
    expect(tree.queryByLabelText("Clear search")).toBeNull();
  });

  it("supports custom icons", () => {
    const tree = renderComponent({
      icon: h("span", { "data-testid": "testicon" }, "*")
    });

    expect(tree.getByTestId("testicon")).toBeTruthy();
  });

  it("supports no icon", () => {
    const tree = renderComponent({ icon: "" });

    expect(tree.queryByTestId("searchicon")).toBeNull();
  });

  it("shows and hides clear button based on current value", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({ defaultValue: inputText });

    const input = tree.getByRole("searchbox") as HTMLInputElement;
    expect(tree.getByLabelText("Clear search")).toBeTruthy();

    await fireEvent.update(input, "");
    expect(tree.queryByLabelText("Clear search")).toBeNull();

    await user.type(input, "bleh");
    expect(tree.queryByLabelText("Clear search")).toBeTruthy();
  });

  it("submits value when Enter is pressed", async () => {
    const onSubmit = vi.fn();
    const tree = renderComponent({
      defaultValue: inputText,
      onSubmit,
    });

    const input = tree.getByRole("searchbox") as HTMLInputElement;
    await fireEvent.keyDown(input, { key: "Enter" });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenLastCalledWith(inputText);

    await fireEvent.update(input, "");
    await fireEvent.keyDown(input, { key: "Enter" });

    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(onSubmit).toHaveBeenLastCalledWith("");
  });

  it("does not submit when disabled", async () => {
    const onSubmit = vi.fn();
    const tree = renderComponent({
      defaultValue: inputText,
      isDisabled: true,
      onSubmit,
    });

    const input = tree.getByRole("searchbox") as HTMLInputElement;
    await fireEvent.keyDown(input, { key: "Enter" });

    expect(onSubmit).toHaveBeenCalledTimes(0);
  });

  it("clears uncontrolled value on Escape", async () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    const tree = renderComponent({
      defaultValue: inputText,
      onChange,
      onClear,
    });

    const input = tree.getByRole("searchbox") as HTMLInputElement;
    expect(input.value).toBe(inputText);

    await fireEvent.keyDown(input, { key: "Escape" });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith("");
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(input.value).toBe("");
  });

  it("does not clear controlled value on Escape", async () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    const tree = renderComponent({
      value: inputText,
      onChange,
      onClear,
    });

    const input = tree.getByRole("searchbox") as HTMLInputElement;
    expect(input.value).toBe(inputText);

    await fireEvent.keyDown(input, { key: "Escape" });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith("");
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(input.value).toBe(inputText);
  });

  it("does not clear value on Escape when disabled", async () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    const tree = renderComponent({
      defaultValue: inputText,
      isDisabled: true,
      onChange,
      onClear,
    });

    const input = tree.getByRole("searchbox") as HTMLInputElement;
    await fireEvent.keyDown(input, { key: "Escape" });

    expect(onChange).toHaveBeenCalledTimes(0);
    expect(onClear).toHaveBeenCalledTimes(0);
    expect(input.value).toBe(inputText);
  });

  it("clears uncontrolled value when clear button is pressed", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onClear = vi.fn();
    const tree = renderComponent({
      defaultValue: inputText,
      onChange,
      onClear,
    });

    const input = tree.getByRole("searchbox") as HTMLInputElement;
    const clearButton = tree.getByLabelText("Clear search");

    await user.click(clearButton);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith("");
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(input.value).toBe("");
    expect(document.activeElement).toBe(input);
  });

  it("does not clear controlled value when clear button is pressed", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onClear = vi.fn();
    const tree = renderComponent({
      value: inputText,
      onChange,
      onClear,
    });

    const input = tree.getByRole("searchbox") as HTMLInputElement;
    const clearButton = tree.getByLabelText("Clear search");

    await user.click(clearButton);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith("");
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(input.value).toBe(inputText);
    expect(document.activeElement).toBe(input);
  });

  it("does not clear value when disabled clear button is pressed", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onClear = vi.fn();
    const tree = renderComponent({
      defaultValue: inputText,
      isDisabled: true,
      onChange,
      onClear,
    });

    const input = tree.getByRole("searchbox") as HTMLInputElement;
    const clearButton = tree.getByLabelText("Clear search");

    await user.click(clearButton);

    expect(onChange).toHaveBeenCalledTimes(0);
    expect(onClear).toHaveBeenCalledTimes(0);
    expect(input.value).toBe(inputText);
  });

  it("does not show clear button when readOnly", () => {
    const tree = renderComponent({
      isReadOnly: true,
      value: "puppy",
    });

    expect(tree.queryByLabelText("Clear search")).toBeNull();
  });

  it("wires description and error message via aria-describedby", () => {
    const withDescription = renderComponent({
      description: "Enter a search term.",
    });
    const inputWithDescription = withDescription.getByRole("searchbox");
    const description = withDescription.getByText("Enter a search term.");

    expect(inputWithDescription.getAttribute("aria-describedby")).toContain(
      description.getAttribute("id") ?? ""
    );

    withDescription.unmount();

    const withError = renderComponent({
      errorMessage: "Remove special characters.",
      validationState: "invalid",
    });
    const inputWithError = withError.getByRole("searchbox");
    const errorMessage = withError.getByText("Remove special characters.");

    expect(inputWithError.getAttribute("aria-describedby")).toContain(
      errorMessage.getAttribute("id") ?? ""
    );
  });

  it("supports aria-label", () => {
    const tree = render(SearchField, {
      props: {
        "aria-label": "Search docs",
      },
    });

    expect(tree.getByRole("searchbox").getAttribute("aria-label")).toBe("Search docs");
  });

  it("supports excludeFromTabOrder", () => {
    const tree = renderComponent({
      excludeFromTabOrder: true,
    });

    expect(tree.getByRole("searchbox").getAttribute("tabindex")).toBe("-1");
  });
});
