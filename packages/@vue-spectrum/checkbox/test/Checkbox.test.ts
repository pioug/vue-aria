import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "../src";

function getCheckboxInput(wrapper: ReturnType<typeof mount>) {
  return wrapper.get("input[type='checkbox']");
}

describe("Checkbox", () => {
  it("default unchecked can be checked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const wrapper = mount(Checkbox, {
      props: {
        onChange,
      },
      slots: {
        default: () => "Click Me",
      },
    });
    const input = getCheckboxInput(wrapper);

    expect((input.element as HTMLInputElement).value).toBe("on");
    expect((input.element as HTMLInputElement).checked).toBe(false);
    expect(onChange).not.toHaveBeenCalled();

    await user.click(input.element);
    expect((input.element as HTMLInputElement).checked).toBe(true);
    expect(onChange).toHaveBeenNthCalledWith(1, true);

    await user.click(input.element);
    expect((input.element as HTMLInputElement).checked).toBe(false);
    expect(onChange).toHaveBeenNthCalledWith(2, false);
  });

  it("can be default checked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const wrapper = mount(Checkbox, {
      props: {
        onChange,
        defaultSelected: true,
        value: "newsletter",
      },
      slots: {
        default: () => "Click Me",
      },
    });
    const input = getCheckboxInput(wrapper);

    expect((input.element as HTMLInputElement).value).toBe("newsletter");
    expect((input.element as HTMLInputElement).checked).toBe(true);

    await user.click(input.element);
    expect((input.element as HTMLInputElement).checked).toBe(false);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("supports controlled selected state", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const wrapper = mount(Checkbox, {
      props: {
        onChange,
        isSelected: true,
      },
      slots: {
        default: () => "Click Me",
      },
    });
    const input = getCheckboxInput(wrapper);

    expect((input.element as HTMLInputElement).checked).toBe(true);

    await user.click(input.element);
    expect((input.element as HTMLInputElement).checked).toBe(true);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("supports controlled unselected state", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const wrapper = mount(Checkbox, {
      props: {
        onChange,
        isSelected: false,
      },
      slots: {
        default: () => "Click Me",
      },
    });
    const input = getCheckboxInput(wrapper);

    expect((input.element as HTMLInputElement).checked).toBe(false);

    await user.click(input.element);
    expect((input.element as HTMLInputElement).checked).toBe(false);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("can be disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const wrapper = mount(Checkbox, {
      props: {
        onChange,
        isDisabled: true,
      },
      slots: {
        default: () => "Click Me",
      },
    });
    const input = getCheckboxInput(wrapper);

    expect(input.attributes("disabled")).toBeDefined();
    expect(wrapper.get("label").classes()).toContain("is-disabled");

    await user.click(input.element);
    expect((input.element as HTMLInputElement).checked).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("can be invalid and supports aria-errormessage", () => {
    const wrapper = mount(Checkbox, {
      props: {
        isInvalid: true,
        ariaErrormessage: "test",
      },
      slots: {
        default: () => "Click Me",
      },
    });
    const input = getCheckboxInput(wrapper);

    expect(input.attributes("aria-invalid")).toBe("true");
    expect(input.attributes("aria-errormessage")).toBe("test");
  });

  it("can be indeterminate", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const wrapper = mount(Checkbox, {
      props: {
        onChange,
        isIndeterminate: true,
      },
      slots: {
        default: () => "Click Me",
      },
    });
    const input = getCheckboxInput(wrapper);

    expect((input.element as HTMLInputElement).indeterminate).toBe(true);
    expect((input.element as HTMLInputElement).checked).toBe(false);
    expect(wrapper.get("label").classes()).toContain("is-indeterminate");

    await user.click(input.element);
    expect((input.element as HTMLInputElement).indeterminate).toBe(true);
    expect((input.element as HTMLInputElement).checked).toBe(true);
    expect(onChange).toHaveBeenNthCalledWith(1, true);
  });

  it("supports aria labeling props", () => {
    const wrapper = mount(Checkbox, {
      attrs: {
        "aria-label": "not visible",
        "aria-labelledby": "label-id",
        "aria-describedby": "description-id",
      },
    });
    const input = getCheckboxInput(wrapper);

    expect(input.attributes("aria-label")).toBe("not visible");
    expect(input.attributes("aria-labelledby")).toBe("label-id");
    expect(input.attributes("aria-describedby")).toBe("description-id");
  });

  it("supports additional label props", () => {
    const wrapper = mount(Checkbox, {
      attrs: {
        "data-testid": "target",
      },
      slots: {
        default: () => "Click Me",
      },
    });

    expect(wrapper.get("[data-testid='target']").element.tagName).toBe("LABEL");
  });

  it("supports excludeFromTabOrder", () => {
    const wrapper = mount(Checkbox, {
      props: {
        excludeFromTabOrder: true,
      },
      slots: {
        default: () => "Hi",
      },
    });
    const input = getCheckboxInput(wrapper);
    expect(input.attributes("tabindex")).toBe("-1");
  });

  it("supports readOnly in controlled and uncontrolled modes", async () => {
    const user = userEvent.setup();
    const controlledOnChange = vi.fn();
    const controlled = mount(Checkbox, {
      props: {
        isSelected: true,
        isReadOnly: true,
        onChange: controlledOnChange,
      },
      slots: {
        default: () => "Controlled",
      },
    });
    const controlledInput = getCheckboxInput(controlled);
    await user.click(controlledInput.element);
    expect((controlledInput.element as HTMLInputElement).checked).toBe(true);
    expect(controlledOnChange).not.toHaveBeenCalled();

    const uncontrolledOnChange = vi.fn();
    const uncontrolled = mount(Checkbox, {
      props: {
        isReadOnly: true,
        onChange: uncontrolledOnChange,
      },
      slots: {
        default: () => "Uncontrolled",
      },
    });
    const uncontrolledInput = getCheckboxInput(uncontrolled);
    await user.click(uncontrolledInput.element);
    expect((uncontrolledInput.element as HTMLInputElement).checked).toBe(false);
    expect(uncontrolledOnChange).not.toHaveBeenCalled();
  });

  it("supports form reset in controlled mode", async () => {
    const user = userEvent.setup();

    const Harness = defineComponent({
      name: "CheckboxFormResetHarness",
      setup() {
        const isSelected = ref(false);

        return () =>
          h("form", [
            h(
              Checkbox,
              {
                "data-testid": "checkbox",
                isSelected: isSelected.value,
                onChange: (value: boolean) => {
                  isSelected.value = value;
                },
              },
              () => "Checkbox"
            ),
            h("input", {
              type: "reset",
              "data-testid": "reset",
              onClick: () => {
                isSelected.value = false;
              },
            }),
          ]);
      },
    });

    const wrapper = mount(Harness);
    const input = wrapper.get("[data-testid='checkbox'] input").element as HTMLInputElement;

    expect(input.checked).toBe(false);
    await user.click(input);
    expect(input.checked).toBe(true);

    const reset = wrapper.get("[data-testid='reset']").element;
    await user.click(reset);
    expect(input.checked).toBe(false);
  });
});
