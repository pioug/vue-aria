import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { SearchField } from "../src/SearchField";

const TEST_ID = "test-id";
const INPUT_TEXT = "blah";

function renderComponent(props: Record<string, unknown> = {}) {
  return mount(SearchField as any, {
    props: {
      ...props,
    },
    attrs: {
      "aria-label": "the label",
      "data-testid": TEST_ID,
    },
    attachTo: document.body,
  });
}

describe("SearchField", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("supports default behavior", () => {
    const wrapper = renderComponent();
    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    expect(input.attributes("type")).toBe("search");
    expect(wrapper.find('[aria-label="Clear search"]').exists()).toBe(false);
  });

  it("supports custom icons and no icons", () => {
    const withIcon = renderComponent({
      icon: "icon",
    });
    expect(withIcon.text()).toContain("icon");

    const withoutIcon = renderComponent({
      icon: "",
    });
    expect(withoutIcon.find('[data-testid="searchicon"]').exists()).toBe(false);
  });

  it("displays clear button only when text is present", async () => {
    const wrapper = renderComponent({ defaultValue: INPUT_TEXT });
    expect(wrapper.find('[aria-label="Clear search"]').exists()).toBe(true);

    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    await input.setValue("");
    await nextTick();
    expect(wrapper.find('[aria-label="Clear search"]').exists()).toBe(false);

    await input.setValue("bleh");
    await nextTick();
    expect(wrapper.find('[aria-label="Clear search"]').exists()).toBe(true);
  });

  it("submits text when Enter is pressed", async () => {
    const onSubmit = vi.fn();
    const wrapper = renderComponent({ defaultValue: INPUT_TEXT, onSubmit });
    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    await input.trigger("keydown", { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenLastCalledWith(INPUT_TEXT);
  });

  it("does not submit when disabled", async () => {
    const onSubmit = vi.fn();
    const wrapper = renderComponent({ defaultValue: INPUT_TEXT, onSubmit, isDisabled: true });
    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    await input.trigger("keydown", { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledTimes(0);
  });

  it("clears uncontrolled value on Escape", async () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    const wrapper = renderComponent({ defaultValue: INPUT_TEXT, onChange, onClear });
    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    expect((input.element as HTMLInputElement).value).toBe(INPUT_TEXT);

    await input.trigger("keydown", { key: "Escape" });
    expect(onChange).toHaveBeenCalled();
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("does not clear controlled value on Escape", async () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    const wrapper = renderComponent({ value: INPUT_TEXT, onChange, onClear });
    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    expect((input.element as HTMLInputElement).value).toBe(INPUT_TEXT);

    await input.trigger("keydown", { key: "Escape" });
    expect(onChange).toHaveBeenCalled();
    expect(onClear).toHaveBeenCalledTimes(1);
    expect((input.element as HTMLInputElement).value).toBe(INPUT_TEXT);
  });

  it("clears value when clear button is pressed for uncontrolled fields", async () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    const wrapper = renderComponent({ defaultValue: INPUT_TEXT, onChange, onClear });
    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    const clearButton = wrapper.get('[aria-label="Clear search"]');

    await clearButton.trigger("click");
    expect(onChange).toHaveBeenCalled();
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("does not show clear button when readOnly", () => {
    const wrapper = renderComponent({ isReadOnly: true, value: "puppy" });
    expect(wrapper.find('[aria-label="Clear search"]').exists()).toBe(false);
  });

  it("supports description and error message", () => {
    const withDescription = renderComponent({ description: "Enter a search term." });
    const description = withDescription.get(".spectrum-HelpText");
    expect(description.text()).toContain("Enter a search term.");

    const withError = renderComponent({
      errorMessage: "Remove special characters.",
      validationState: "invalid",
    });
    const errorMessage = withError.get(".spectrum-HelpText.is-invalid");
    expect(errorMessage.text()).toContain("Remove special characters.");
  });

  it("supports aria-label and excludeFromTabOrder", () => {
    const wrapper = renderComponent({
      "aria-label": "Test",
      excludeFromTabOrder: true,
    });

    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    expect(input.attributes("aria-label")).toBe("Test");
    expect(input.attributes("tabindex")).toBe("-1");
  });
});
