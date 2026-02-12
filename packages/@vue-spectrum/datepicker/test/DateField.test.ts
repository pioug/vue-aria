import { parseDate } from "@internationalized/date";
import { fireEvent, render } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { DateField } from "../src";

describe("DateField", () => {
  it("renders with default value and emits parsed date on input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const tree = render(DateField, {
      props: {
        label: "Date",
        defaultValue: parseDate("2019-06-05"),
        onChange,
      },
    });

    const input = tree.container.querySelector("input[type=\"date\"]") as HTMLInputElement;
    expect(input.value).toBe("2019-06-05");

    await user.click(input);
    await fireEvent.update(input, "2019-06-17");

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]?.toString()).toBe("2019-06-17");
  });

  it("supports aria labeling props", () => {
    const ariaLabelTree = render(DateField, {
      props: {
        "aria-label": "Birth date",
      },
    });
    const ariaLabelInput = ariaLabelTree.container.querySelector(
      "input[type=\"date\"]"
    ) as HTMLInputElement;
    expect(ariaLabelInput.getAttribute("aria-label")).toBe("Birth date");

    const labelledByTree = render(DateField, {
      props: {
        label: "Date",
        "aria-labelledby": "custom-label",
      },
    });
    const labelledByInput = labelledByTree.container.querySelector(
      "input[type=\"date\"]"
    ) as HTMLInputElement;
    expect(labelledByInput.getAttribute("aria-labelledby")).toBe("custom-label");
  });

  it("wires description and error message to aria-describedby", () => {
    const tree = render(DateField, {
      props: {
        label: "Date",
        description: "Help text",
        errorMessage: "Error message",
      },
    });

    const input = tree.container.querySelector("input[type=\"date\"]") as HTMLInputElement;
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();

    const ids = (describedBy ?? "").split(" ").filter(Boolean);
    expect(ids).toHaveLength(2);

    const description = tree.container.querySelector(`#${ids[0]}`);
    const error = tree.container.querySelector(`#${ids[1]}`);
    expect(description?.textContent).toBe("Help text");
    expect(error?.textContent).toBe("Error message");
  });

  it("marks field invalid when requested", () => {
    const tree = render(DateField, {
      props: {
        label: "Date",
        validationState: "invalid",
      },
    });

    const root = tree.container.querySelector(".react-spectrum-DateField");
    const input = tree.container.querySelector("input[type=\"date\"]") as HTMLInputElement;
    expect(root?.classList.contains("is-invalid")).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("does not emit changes when readOnly or disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const readOnlyTree = render(DateField, {
      props: {
        label: "Date",
        isReadOnly: true,
        onChange,
      },
    });
    const readOnlyInput = readOnlyTree.container.querySelector(
      "input[type=\"date\"]"
    ) as HTMLInputElement;
    await user.click(readOnlyInput);
    await fireEvent.update(readOnlyInput, "2020-01-01");
    expect(onChange).not.toHaveBeenCalled();

    const disabledTree = render(DateField, {
      props: {
        label: "Date",
        isDisabled: true,
        onChange,
      },
    });
    const disabledInput = disabledTree.container.querySelector(
      "input[type=\"date\"]"
    ) as HTMLInputElement;
    await fireEvent.update(disabledInput, "2020-01-02");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("exposes DOM ref helpers", async () => {
    const fieldRef = ref<{
      focus: () => void;
      blur: () => void;
      UNSAFE_getDOMNode: () => HTMLElement | null;
    } | null>(null);
    const App = defineComponent({
      setup() {
        return () =>
          h(DateField, {
            ref: fieldRef,
            label: "Date",
          });
      },
    });

    const wrapper = mount(App);
    const input = wrapper.get("input[type=\"date\"]").element as HTMLInputElement;

    expect(fieldRef.value).not.toBeNull();
    expect(typeof fieldRef.value?.focus).toBe("function");
    expect(typeof fieldRef.value?.blur).toBe("function");
    expect(typeof fieldRef.value?.UNSAFE_getDOMNode).toBe("function");
    const domNode = fieldRef.value?.UNSAFE_getDOMNode();
    expect(domNode).toBeInstanceOf(HTMLElement);
    expect(domNode?.querySelector("input[type=\"date\"]")).toBe(input);

    fieldRef.value?.focus();
    await nextTick();
    fieldRef.value?.blur();
    await nextTick();
    expect(domNode?.querySelector("input[type=\"date\"]")).toBe(input);
  });
});
