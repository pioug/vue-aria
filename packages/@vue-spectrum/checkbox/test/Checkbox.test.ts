import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { Checkbox } from "../src/Checkbox";

describe("Checkbox", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it.each([
    { name: "Checkbox", props: {} },
    { name: "Checkbox isEmphasized", props: { isEmphasized: true } },
  ])("$name default unchecked can be checked", async ({ props }) => {
    const onChange = vi.fn();
    const wrapper = mount(Checkbox as any, {
      props: {
        ...props,
        onChange,
      },
      slots: {
        default: () => "Click Me",
      },
      attachTo: document.body,
    });

    const checkbox = wrapper.get('input[type="checkbox"]');
    expect((checkbox.element as HTMLInputElement).value).toBe("on");
    expect((checkbox.element as HTMLInputElement).checked).toBe(false);

    await checkbox.setValue(true);
    expect(onChange).toHaveBeenCalledWith(true);
    expect((checkbox.element as HTMLInputElement).checked).toBe(true);

    await checkbox.setValue(false);
    expect(onChange).toHaveBeenCalledWith(false);
    expect((checkbox.element as HTMLInputElement).checked).toBe(false);
  });

  it("can be default checked", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Checkbox as any, {
      props: {
        onChange,
        defaultSelected: true,
        value: "newsletter",
      },
      slots: {
        default: () => "Click Me",
      },
    });

    const checkbox = wrapper.get('input[type="checkbox"]');
    expect((checkbox.element as HTMLInputElement).value).toBe("newsletter");
    expect((checkbox.element as HTMLInputElement).checked).toBe(true);

    await checkbox.setValue(false);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("can be controlled checked", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Checkbox as any, {
      props: {
        isSelected: true,
        onChange,
      },
      slots: {
        default: () => "Click Me",
      },
    });

    const checkbox = wrapper.get('input[type="checkbox"]');
    expect((checkbox.element as HTMLInputElement).checked).toBe(true);
    await checkbox.setValue(false);
    await nextTick();
    expect(onChange).toHaveBeenCalledWith(false);
    expect((checkbox.element as HTMLInputElement).checked).toBe(true);
  });

  it("can be controlled unchecked", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Checkbox as any, {
      props: {
        isSelected: false,
        onChange,
      },
      slots: {
        default: () => "Click Me",
      },
    });

    const checkbox = wrapper.get('input[type="checkbox"]');
    expect((checkbox.element as HTMLInputElement).checked).toBe(false);
    await checkbox.setValue(true);
    await nextTick();
    expect(onChange).toHaveBeenCalledWith(true);
    expect((checkbox.element as HTMLInputElement).checked).toBe(false);
  });

  it("can be disabled", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Checkbox as any, {
      props: {
        onChange,
        isDisabled: true,
      },
      slots: {
        default: () => "Click Me",
      },
    });

    const checkbox = wrapper.get('input[type="checkbox"]');
    await checkbox.trigger("click");
    expect(onChange).not.toHaveBeenCalled();
    expect((checkbox.element as HTMLInputElement).checked).toBe(false);
  });

  it("can be invalid", () => {
    const wrapper = mount(Checkbox as any, {
      props: {
        isInvalid: true,
      },
      slots: {
        default: () => "Click Me",
      },
    });

    expect(wrapper.get("label").classes()).toContain("is-invalid");
    expect(wrapper.get("label").classes()).toContain("spectrum-Checkbox--quiet");
    const checkbox = wrapper.get('input[type="checkbox"]');
    expect(checkbox.attributes("aria-invalid")).toBe("true");
  });

  it("passes through aria-errormessage", () => {
    const wrapper = mount(Checkbox as any, {
      props: {
        isInvalid: true,
        "aria-errormessage": "test",
      },
      slots: {
        default: () => "Click Me",
      },
    });

    const checkbox = wrapper.get('input[type="checkbox"]');
    expect(checkbox.attributes("aria-invalid")).toBe("true");
    expect(checkbox.attributes("aria-errormessage")).toBe("test");
  });

  it("can be indeterminate", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Checkbox as any, {
      props: {
        onChange,
        isIndeterminate: true,
      },
      slots: {
        default: () => "Click Me",
      },
      attachTo: document.body,
    });

    const checkbox = wrapper.get('input[type="checkbox"]');
    expect((checkbox.element as HTMLInputElement).indeterminate).toBe(true);
    expect((checkbox.element as HTMLInputElement).checked).toBe(false);

    await checkbox.setValue(true);
    expect(onChange).toHaveBeenCalledWith(true);
    expect((checkbox.element as HTMLInputElement).indeterminate).toBe(true);

    await checkbox.setValue(false);
    expect(onChange).toHaveBeenCalledWith(false);
    expect((checkbox.element as HTMLInputElement).indeterminate).toBe(true);
  });

  it("can have non-visible label", () => {
    const wrapper = mount(Checkbox as any, {
      props: {
        "aria-label": "not visible",
      },
    });

    const checkbox = wrapper.get('input[type="checkbox"]');
    expect(checkbox.attributes("aria-label")).toBe("not visible");
  });

  it("supports aria-labelledby", () => {
    const wrapper = mount({
      components: {
        Checkbox,
      },
      template: '<div><span id="test">Test</span><Checkbox aria-labelledby="test" /></div>',
    });

    const checkbox = wrapper.get('input[type="checkbox"]');
    expect(checkbox.attributes("aria-labelledby")).toBe("test");
  });

  it("supports aria-describedby", () => {
    const wrapper = mount({
      components: {
        Checkbox,
      },
      template: '<div><span id="test">Test</span><Checkbox aria-describedby="test">Hi</Checkbox></div>',
    });

    const checkbox = wrapper.get('input[type="checkbox"]');
    expect(checkbox.attributes("aria-describedby")).toBe("test");
  });

  it("supports additional props", () => {
    const wrapper = mount(Checkbox as any, {
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
    const wrapper = mount(Checkbox as any, {
      props: {
        excludeFromTabOrder: true,
      },
      slots: {
        default: () => "Hi",
      },
    });

    const checkbox = wrapper.get('input[type="checkbox"]');
    expect(checkbox.attributes("tabindex")).toBe("-1");
  });

  it("supports readOnly", async () => {
    const onChange = vi.fn();
    const wrapper = mount(Checkbox as any, {
      props: {
        isSelected: true,
        isReadOnly: true,
        onChange,
      },
      slots: {
        default: () => "Click Me",
      },
    });

    const checkbox = wrapper.get('input[type="checkbox"]');
    await checkbox.setValue(false);
    expect(onChange).not.toHaveBeenCalled();
    expect((checkbox.element as HTMLInputElement).checked).toBe(true);
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
            h(
              Checkbox as any,
              {
                "data-testid": "checkbox",
                isSelected: isSelected.value,
                onChange: setSelected,
              },
              { default: () => "Checkbox" }
            ),
            h("input", { type: "reset", "data-testid": "reset" }),
          ]);
      },
    });

    const wrapper = mount(Test, { attachTo: document.body });
    const checkbox = wrapper.get('[data-testid="checkbox"] input[type="checkbox"]');
    const reset = wrapper.get('[data-testid="reset"]');

    expect((checkbox.element as HTMLInputElement).checked).toBe(false);
    await checkbox.setValue(true);
    await nextTick();
    expect((checkbox.element as HTMLInputElement).checked).toBe(true);

    await reset.trigger("click");
    await nextTick();
    expect((checkbox.element as HTMLInputElement).checked).toBe(false);
  });

  it("supports native required validation", async () => {
    const wrapper = mount(Checkbox as any, {
      props: {
        isRequired: true,
        validationBehavior: "native",
      },
      slots: {
        default: () => "Terms and conditions",
      },
      attachTo: document.body,
    });

    const checkbox = wrapper.get('input[type="checkbox"]').element as HTMLInputElement;
    expect(checkbox.hasAttribute("required")).toBe(true);
    expect(checkbox.hasAttribute("aria-required")).toBe(false);
    expect(checkbox.validity.valid).toBe(false);

    await wrapper.get('input[type="checkbox"]').setValue(true);
    expect(checkbox.validity.valid).toBe(true);
  });

  it("uses quiet style by default and emphasized when requested", () => {
    const quiet = mount(Checkbox as any, {
      slots: {
        default: () => "Quiet",
      },
    });
    expect(quiet.get("label").classes()).toContain("spectrum-Checkbox--quiet");

    const emphasized = mount(Checkbox as any, {
      props: {
        isEmphasized: true,
      },
      slots: {
        default: () => "Emphasized",
      },
    });
    expect(emphasized.get("label").classes()).not.toContain("spectrum-Checkbox--quiet");
  });

  it("combines emphasized and invalid visual classes", () => {
    const emphasizedInvalid = mount(Checkbox as any, {
      props: {
        isEmphasized: true,
        isInvalid: true,
      },
      slots: {
        default: () => "Emphasized invalid",
      },
    });

    const label = emphasizedInvalid.get("label");
    expect(label.classes()).not.toContain("spectrum-Checkbox--quiet");
    expect(label.classes()).toContain("is-invalid");
  });
});
