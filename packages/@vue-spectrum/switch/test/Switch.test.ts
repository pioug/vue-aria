import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { Switch } from "../src/Switch";

describe("Switch", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it.each([
    { name: "Switch", props: {} },
    { name: "Switch isEmphasized", props: { isEmphasized: true } },
  ])("$name default unchecked can be checked", async ({ props }) => {
    const onChange = vi.fn();
    const wrapper = mount(Switch as any, {
      props: {
        ...props,
        onChange,
      },
      slots: {
        default: () => "Click Me",
      },
      attachTo: document.body,
    });

    const input = wrapper.get('input[type="checkbox"][role="switch"]');
    expect((input.element as HTMLInputElement).value).toBe("on");
    expect((input.element as HTMLInputElement).checked).toBe(false);

    await input.setValue(true);
    expect((input.element as HTMLInputElement).checked).toBe(true);
    expect(onChange).toHaveBeenCalledWith(true);

    await input.setValue(false);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it.each([
    { name: "Switch", props: { defaultSelected: true, value: "newsletter" } },
    { name: "Switch isEmphasized", props: { defaultSelected: true, isEmphasized: true, value: "newsletter" } },
  ])("$name can be default checked", async ({ props }) => {
    const onChange = vi.fn();
    const wrapper = mount(Switch as any, {
      props: {
        ...props,
        onChange,
      },
      slots: {
        default: () => "Click Me",
      },
      attachTo: document.body,
    });

    const input = wrapper.get('input[type="checkbox"][role="switch"]');
    expect((input.element as HTMLInputElement).value).toBe("newsletter");
    expect((input.element as HTMLInputElement).checked).toBe(true);

    await input.setValue(false);
    expect((input.element as HTMLInputElement).checked).toBe(false);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it.each([
    { name: "Switch", props: { isSelected: true } },
    { name: "Switch isEmphasized", props: { isSelected: true, isEmphasized: true } },
  ])("$name can be controlled checked", async ({ props }) => {
    const onChange = vi.fn();
    const wrapper = mount(Switch as any, {
      props: {
        ...props,
        onChange,
      },
      slots: {
        default: () => "Click Me",
      },
      attachTo: document.body,
    });

    const input = wrapper.get('input[type="checkbox"][role="switch"]');
    expect((input.element as HTMLInputElement).checked).toBe(true);

    await input.setValue(false);
    await nextTick();
    expect((input.element as HTMLInputElement).checked).toBe(true);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it.each([
    { name: "Switch", props: { isSelected: false } },
    { name: "Switch isEmphasized", props: { isSelected: false, isEmphasized: true } },
  ])("$name can be controlled unchecked", async ({ props }) => {
    const onChange = vi.fn();
    const wrapper = mount(Switch as any, {
      props: {
        ...props,
        onChange,
      },
      slots: {
        default: () => "Click Me",
      },
      attachTo: document.body,
    });

    const input = wrapper.get('input[type="checkbox"][role="switch"]');
    expect((input.element as HTMLInputElement).checked).toBe(false);

    await input.setValue(true);
    await nextTick();
    expect((input.element as HTMLInputElement).checked).toBe(false);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it.each([
    { name: "Switch", props: { isDisabled: true } },
    { name: "Switch isEmphasized", props: { isDisabled: true, isEmphasized: true } },
  ])("$name can be disabled", async ({ props }) => {
    const onChange = vi.fn();
    const wrapper = mount(Switch as any, {
      props: {
        ...props,
        onChange,
      },
      slots: {
        default: () => "Click Me",
      },
      attachTo: document.body,
    });

    const input = wrapper.get('input[type="checkbox"][role="switch"]');
    expect((input.element as HTMLInputElement).checked).toBe(false);

    await input.trigger("click");
    expect((input.element as HTMLInputElement).checked).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("can have a non-visible label", () => {
    const wrapper = mount(Switch as any, {
      props: {
        "aria-label": "not visible",
      },
    });

    const input = wrapper.get('[role="switch"]');
    expect(input.attributes("aria-label")).toBe("not visible");
  });

  it("supports aria-labelledby", () => {
    const wrapper = mount({
      components: {
        Switch,
      },
      template: '<div><span id="test">Test</span><Switch aria-labelledby="test" /></div>',
    });

    const input = wrapper.get('[role="switch"]');
    expect(input.attributes("aria-labelledby")).toBe("test");
  });

  it("supports aria-describedby", () => {
    const wrapper = mount({
      components: {
        Switch,
      },
      template: '<div><span id="test">Test</span><Switch aria-describedby="test">Hi</Switch></div>',
    });

    const input = wrapper.get('[role="switch"]');
    expect(input.attributes("aria-describedby")).toBe("test");
  });

  it("supports additional props", () => {
    const wrapper = mount(Switch as any, {
      attrs: {
        "data-testid": "target",
      },
      slots: {
        default: () => "Click Me",
      },
    });

    expect(wrapper.get('[data-testid="target"]').attributes("data-testid")).toBe("target");
  });

  it("supports excludeFromTabOrder", () => {
    const wrapper = mount(Switch as any, {
      props: {
        excludeFromTabOrder: true,
      },
      slots: {
        default: () => "Hi",
      },
    });

    const input = wrapper.get('[role="switch"]');
    expect(input.attributes("tabindex")).toBe("-1");
  });

  it("supports readOnly", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Switch as any, {
      props: {
        isSelected: true,
        isReadOnly: true,
        onChange,
      },
      slots: {
        default: () => "Click Me",
      },
      attachTo: document.body,
    });

    const input = wrapper.get('[role="switch"]');
    expect((input.element as HTMLInputElement).checked).toBe(true);

    await input.setValue(false);
    await nextTick();
    expect((input.element as HTMLInputElement).checked).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("supports form reset", async () => {
    const Test = defineComponent({
      setup() {
        const isSelected = ref(false);
        const setSelected = (next: boolean) => {
          isSelected.value = next;
        };

        return () =>
          h("form", null, [
            h(Switch as any, { "data-testid": "switch", isSelected: isSelected.value, onChange: setSelected }, {
              default: () => "Switch",
            }),
            h("input", { type: "reset", "data-testid": "reset" }),
          ]);
      },
    });

    const wrapper = mount(Test, { attachTo: document.body });
    const input = wrapper.get('[data-testid="switch"] input[role="switch"]');
    const reset = wrapper.get('[data-testid="reset"]');

    expect((input.element as HTMLInputElement).checked).toBe(false);
    await input.setValue(true);
    await nextTick();
    expect((input.element as HTMLInputElement).checked).toBe(true);

    await reset.trigger("click");
    await nextTick();
    expect((input.element as HTMLInputElement).checked).toBe(false);
  });

  it("uses quiet style by default and emphasized when requested", () => {
    const quiet = mount(Switch as any, {
      slots: {
        default: () => "Quiet",
      },
    });
    expect(quiet.get("label").classes()).toContain("spectrum-ToggleSwitch--quiet");

    const emphasized = mount(Switch as any, {
      props: {
        isEmphasized: true,
      },
      slots: {
        default: () => "Emphasized",
      },
    });
    expect(emphasized.get("label").classes()).not.toContain("spectrum-ToggleSwitch--quiet");
  });
});
