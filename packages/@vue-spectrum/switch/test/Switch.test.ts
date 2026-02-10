import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
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

    const wrapper = mount(Harness);
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
});
