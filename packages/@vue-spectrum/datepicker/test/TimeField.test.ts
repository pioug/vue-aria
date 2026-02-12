import { parseTime } from "@internationalized/date";
import { fireEvent, render } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { TimeField } from "../src";

describe("TimeField", () => {
  it("renders with second granularity and emits parsed time", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const tree = render(TimeField, {
      props: {
        label: "Time",
        granularity: "second",
        defaultValue: parseTime("14:30:45"),
        onChange,
      },
    });

    const input = tree.container.querySelector("input[type=\"time\"]") as HTMLInputElement;
    expect(input.value).toBe("14:30:45");

    await user.click(input);
    await fireEvent.update(input, "09:15:30");

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]?.toString()).toBe("09:15:30");
  });

  it("supports aria labeling props", () => {
    const ariaLabelTree = render(TimeField, {
      props: {
        "aria-label": "Meeting time",
      },
    });
    const ariaLabelInput = ariaLabelTree.container.querySelector(
      "input[type=\"time\"]"
    ) as HTMLInputElement;
    expect(ariaLabelInput.getAttribute("aria-label")).toBe("Meeting time");

    const labelledByTree = render(TimeField, {
      props: {
        label: "Time",
        "aria-labelledby": "custom-label",
      },
    });
    const labelledByInput = labelledByTree.container.querySelector(
      "input[type=\"time\"]"
    ) as HTMLInputElement;
    expect(labelledByInput.getAttribute("aria-labelledby")).toBe("custom-label");
  });

  it("wires description and error message to aria-describedby", () => {
    const tree = render(TimeField, {
      props: {
        label: "Time",
        description: "Help text",
        errorMessage: "Error message",
      },
    });

    const input = tree.container.querySelector("input[type=\"time\"]") as HTMLInputElement;
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
    const tree = render(TimeField, {
      props: {
        label: "Time",
        validationState: "invalid",
      },
    });

    const root = tree.container.querySelector(".react-spectrum-TimeField");
    const input = tree.container.querySelector("input[type=\"time\"]") as HTMLInputElement;
    expect(root?.classList.contains("is-invalid")).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("derives input step from granularity", () => {
    const second = render(TimeField, {
      props: {
        label: "Second",
        granularity: "second",
      },
    });
    const secondInput = second.container.querySelector("input[type=\"time\"]") as HTMLInputElement;
    expect(secondInput.getAttribute("step")).toBe("1");

    const hour = render(TimeField, {
      props: {
        label: "Hour",
        granularity: "hour",
      },
    });
    const hourInput = hour.container.querySelector("input[type=\"time\"]") as HTMLInputElement;
    expect(hourInput.getAttribute("step")).toBe("3600");
  });

  it("does not emit changes when readOnly or disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const readOnlyTree = render(TimeField, {
      props: {
        label: "Time",
        isReadOnly: true,
        onChange,
      },
    });
    const readOnlyInput = readOnlyTree.container.querySelector(
      "input[type=\"time\"]"
    ) as HTMLInputElement;
    await user.click(readOnlyInput);
    await fireEvent.update(readOnlyInput, "10:00");
    expect(onChange).not.toHaveBeenCalled();

    const disabledTree = render(TimeField, {
      props: {
        label: "Time",
        isDisabled: true,
        onChange,
      },
    });
    const disabledInput = disabledTree.container.querySelector(
      "input[type=\"time\"]"
    ) as HTMLInputElement;
    await fireEvent.update(disabledInput, "11:00");
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
          h(TimeField, {
            ref: fieldRef,
            label: "Time",
          });
      },
    });

    const wrapper = mount(App);
    const input = wrapper.get("input[type=\"time\"]").element as HTMLInputElement;

    expect(fieldRef.value).not.toBeNull();
    expect(typeof fieldRef.value?.focus).toBe("function");
    expect(typeof fieldRef.value?.blur).toBe("function");
    expect(typeof fieldRef.value?.UNSAFE_getDOMNode).toBe("function");
    const domNode = fieldRef.value?.UNSAFE_getDOMNode();
    expect(domNode).toBeInstanceOf(HTMLElement);
    expect(domNode?.querySelector("input[type=\"time\"]")).toBe(input);

    fieldRef.value?.focus();
    await nextTick();
    fieldRef.value?.blur();
    await nextTick();
    expect(domNode?.querySelector("input[type=\"time\"]")).toBe(input);
  });
});
