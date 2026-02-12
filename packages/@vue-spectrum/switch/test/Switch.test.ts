import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "../src";

function getSwitchInput(wrapper: ReturnType<typeof mount>) {
  return wrapper.get("input[role='switch']");
}

describe("Switch", () => {
  it("is unchecked by default and can be toggled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const wrapper = mount(Switch, {
      props: {
        onChange,
      },
      slots: {
        default: () => "Click Me",
      },
    });
    const input = getSwitchInput(wrapper);

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

  it("supports emphasized styling", () => {
    const quietWrapper = mount(Switch, {
      slots: {
        default: () => "Quiet",
      },
    });
    expect(quietWrapper.get("label").classes()).toContain(
      "spectrum-ToggleSwitch--quiet"
    );

    const emphasizedWrapper = mount(Switch, {
      props: {
        isEmphasized: true,
      },
      slots: {
        default: () => "Emphasized",
      },
    });
    expect(emphasizedWrapper.get("label").classes()).not.toContain(
      "spectrum-ToggleSwitch--quiet"
    );
  });

  it("supports defaultSelected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const wrapper = mount(Switch, {
      props: {
        defaultSelected: true,
        value: "newsletter",
        onChange,
      },
      slots: {
        default: () => "Click Me",
      },
    });
    const input = getSwitchInput(wrapper);

    expect((input.element as HTMLInputElement).value).toBe("newsletter");
    expect((input.element as HTMLInputElement).checked).toBe(true);

    await user.click(input.element);
    expect((input.element as HTMLInputElement).checked).toBe(false);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("supports controlled selected state", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const wrapper = mount(Switch, {
      props: {
        isSelected: true,
        onChange,
      },
      slots: {
        default: () => "Click Me",
      },
    });
    const input = getSwitchInput(wrapper);

    expect((input.element as HTMLInputElement).checked).toBe(true);
    await user.click(input.element);
    expect((input.element as HTMLInputElement).checked).toBe(true);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("supports controlled unchecked state", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const wrapper = mount(Switch, {
      props: {
        isSelected: false,
        onChange,
      },
      slots: {
        default: () => "Click Me",
      },
    });
    const input = getSwitchInput(wrapper);

    expect((input.element as HTMLInputElement).checked).toBe(false);
    await user.click(input.element);
    expect((input.element as HTMLInputElement).checked).toBe(false);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("supports disabled state", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const wrapper = mount(Switch, {
      props: {
        isDisabled: true,
        onChange,
      },
      slots: {
        default: () => "Click Me",
      },
    });
    const input = getSwitchInput(wrapper);

    expect(input.attributes("disabled")).toBeDefined();
    expect(wrapper.get("label").classes()).toContain("is-disabled");

    await user.click(input.element);
    expect((input.element as HTMLInputElement).checked).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("supports non-visible labels via aria-label", () => {
    const wrapper = mount(Switch, {
      attrs: {
        "aria-label": "not visible",
      },
    });
    const input = getSwitchInput(wrapper);
    expect(input.attributes("aria-label")).toBe("not visible");
  });

  it("supports aria-labelledby and aria-describedby", () => {
    const Harness = defineComponent({
      name: "SwitchAriaHarness",
      setup() {
        return () =>
          h("div", [
            h("span", { id: "label-id" }, "Label"),
            h("span", { id: "description-id" }, "Description"),
            h(
              Switch,
              {
                "aria-labelledby": "label-id",
                "aria-describedby": "description-id",
              },
              {
                default: () => "Hi",
              }
            ),
          ]);
      },
    });

    const wrapper = mount(Harness, {
      attachTo: document.body,
    });
    const input = getSwitchInput(wrapper);
    expect(input.attributes("aria-labelledby")).toBe("label-id");
    expect(input.attributes("aria-describedby")).toBe("description-id");
  });

  it("supports additional root props", () => {
    const wrapper = mount(Switch, {
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
    const wrapper = mount(Switch, {
      props: {
        excludeFromTabOrder: true,
      },
      slots: {
        default: () => "Hi",
      },
    });
    const input = getSwitchInput(wrapper);
    expect(input.attributes("tabindex")).toBe("-1");
  });

  it("supports readOnly", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const wrapper = mount(Switch, {
      props: {
        isSelected: true,
        isReadOnly: true,
        onChange,
      },
      slots: {
        default: () => "Click Me",
      },
    });
    const input = getSwitchInput(wrapper);

    expect((input.element as HTMLInputElement).checked).toBe(true);
    await user.click(input.element);
    expect((input.element as HTMLInputElement).checked).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("supports form reset", async () => {
    const user = userEvent.setup();

    const Harness = defineComponent({
      name: "SwitchFormResetHarness",
      setup() {
        const isSelected = ref(false);

        return () =>
          h(
            "form",
            {
              onReset: () => {
                isSelected.value = false;
              },
            },
            [
              h(
                Switch,
                {
                  "data-testid": "switch",
                  isSelected: isSelected.value,
                  onChange: (value: boolean) => {
                    isSelected.value = value;
                  },
                },
                () => "Switch"
              ),
              h("input", {
                type: "reset",
                "data-testid": "reset",
              }),
            ]
          );
      },
    });

    const wrapper = mount(Harness);
    const input = wrapper.get("[data-testid='switch'] input").element as HTMLInputElement;

    expect(input.checked).toBe(false);
    await user.click(input);
    expect(input.checked).toBe(true);

    const reset = wrapper.get("[data-testid='reset']").element;
    await user.click(reset);
    await wrapper.get("form").trigger("reset");
    await nextTick();
    expect(input.checked).toBe(false);
    wrapper.unmount();
  });

  it("resets to defaultSelected when submitting form action", async () => {
    const user = userEvent.setup();

    const Harness = defineComponent({
      name: "SwitchSubmitResetHarness",
      setup() {
        const defaultSelected = ref(false);

        return () =>
          h(
            "form",
            {
              onSubmit: (event: Event) => {
                event.preventDefault();
                defaultSelected.value = true;
                (event.currentTarget as HTMLFormElement | null)?.reset();
              },
            },
            [
              h(
                Switch,
                {
                  "data-testid": "switch",
                  defaultSelected: defaultSelected.value,
                },
                () => "Switch"
              ),
              h("input", {
                type: "submit",
                "data-testid": "submit",
              }),
            ]
          );
      },
    });

    const wrapper = mount(Harness, {
      attachTo: document.body,
    });
    const input = wrapper.get("[data-testid='switch'] input").element as HTMLInputElement;

    expect(input.checked).toBe(false);

    const submit = wrapper.get("[data-testid='submit']").element;
    await user.click(submit);
    await nextTick();
    await nextTick();

    expect(input.checked).toBe(true);
    wrapper.unmount();
  });
});
