import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { Provider } from "@vue-spectrum/provider";
import { theme } from "@vue-spectrum/theme";
import { Radio } from "../src/Radio";
import { RadioGroup } from "../src/RadioGroup";

type GenericProps = Record<string, unknown>;

function mountRadioGroup(
  groupProps: GenericProps = {},
  radioProps: GenericProps[] = [{}, {}, {}],
  options: { withGroupAriaLabel?: boolean } = {}
) {
  return mount(
    defineComponent({
      setup() {
        return () =>
          h(
            RadioGroup as any,
            {
              ...(options.withGroupAriaLabel === false ? {} : { "aria-label": "favorite pet" }),
              ...groupProps,
            },
            {
              default: () => [
                h(
                  Radio as any,
                  {
                    value: "dogs",
                    ...(radioProps[0] ?? {}),
                  },
                  { default: () => "Dogs" }
                ),
                h(
                  Radio as any,
                  {
                    value: "cats",
                    ...(radioProps[1] ?? {}),
                  },
                  { default: () => "Cats" }
                ),
                h(
                  Radio as any,
                  {
                    value: "dragons",
                    ...(radioProps[2] ?? {}),
                  },
                  { default: () => "Dragons" }
                ),
              ],
            }
          );
      },
    }),
    { attachTo: document.body }
  );
}

describe("RadioGroup + Radio", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("handles defaults", async () => {
    const onChange = vi.fn();
    const wrapper = mountRadioGroup({ onChange });
    const group = wrapper.get('[role="radiogroup"]');
    const radios = wrapper.findAll('input[type="radio"]');

    expect(group.element).toBeTruthy();
    expect(radios).toHaveLength(3);

    const groupName = radios[0]!.attributes("name");
    for (const radio of radios) {
      expect(radio.attributes("name")).toBe(groupName);
      expect((radio.element as HTMLInputElement).checked).toBe(false);
    }

    expect((radios[0]!.element as HTMLInputElement).value).toBe("dogs");
    expect((radios[1]!.element as HTMLInputElement).value).toBe("cats");
    expect((radios[2]!.element as HTMLInputElement).value).toBe("dragons");

    await radios[0]!.setValue(true);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("dogs");
    expect((radios[0]!.element as HTMLInputElement).checked).toBe(true);
    expect((radios[1]!.element as HTMLInputElement).checked).toBe(false);
    expect((radios[2]!.element as HTMLInputElement).checked).toBe(false);
  });

  it("renders without visible labels when aria-label is provided", () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(RadioGroup as any, { "aria-label": "favorite pet" }, () => [
              h(Radio as any, { value: "dogs", "aria-label": "dogs" }),
              h(Radio as any, { value: "cats", "aria-label": "cats" }),
              h(Radio as any, { value: "dragons", "aria-label": "dragons" }),
            ]);
        },
      })
    );

    const group = wrapper.get('[role="radiogroup"]');
    const radios = wrapper.findAll('input[type="radio"]');
    expect(group.element).toBeTruthy();
    expect(radios).toHaveLength(3);

    const groupName = radios[0]!.attributes("name");
    for (const radio of radios) {
      expect(radio.attributes("name")).toBe(groupName);
    }
  });

  it("can be given a group name", () => {
    const wrapper = mountRadioGroup({ name: "customName" });
    const radios = wrapper.findAll('input[type="radio"]');
    for (const radio of radios) {
      expect(radio.attributes("name")).toBe("customName");
    }
  });

  it("can be disabled via Provider", () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider as any,
              { theme, isDisabled: true },
              () => h(RadioGroup as any, { "aria-label": "favorite pet" }, () => [
                h(Radio as any, { value: "dogs" }, { default: () => "Dogs" }),
                h(Radio as any, { value: "cats" }, { default: () => "Cats" }),
                h(Radio as any, { value: "dragons" }, { default: () => "Dragons" }),
              ])
            );
        },
      }),
      { attachTo: document.body }
    );

    const radios = wrapper.findAll('input[type="radio"]');
    expect(radios).toHaveLength(3);
    for (const radio of radios) {
      expect(radio.attributes("disabled")).toBeDefined();
    }
  });

  it("can have a single disabled radio", async () => {
    const onChange = vi.fn();
    const wrapper = mountRadioGroup({ onChange }, [{}, { isDisabled: true }, {}]);
    const radios = wrapper.findAll('input[type="radio"]');

    expect(radios[0]!.attributes("disabled")).toBeUndefined();
    expect(radios[1]!.attributes("disabled")).toBeDefined();
    expect(radios[2]!.attributes("disabled")).toBeUndefined();

    await radios[1]!.trigger("click");
    expect(onChange).not.toHaveBeenCalled();

    await radios[0]!.setValue(true);
    expect(onChange).toHaveBeenCalledWith("dogs");
    expect((radios[0]!.element as HTMLInputElement).checked).toBe(true);
  });

  it("can be readonly", async () => {
    const onChange = vi.fn();
    const wrapper = mountRadioGroup({ isReadOnly: true, onChange });
    const group = wrapper.get('[role="radiogroup"]');
    const radios = wrapper.findAll('input[type="radio"]');

    expect(group.attributes("aria-readonly")).toBe("true");
    for (const radio of radios) {
      expect(radio.attributes("aria-readonly")).toBeUndefined();
    }

    await radios[1]!.trigger("click");
    expect(onChange).not.toHaveBeenCalled();
    expect((radios[1]!.element as HTMLInputElement).checked).toBe(false);
  });

  it("individual radios cannot be readonly", async () => {
    const onChange = vi.fn();
    const wrapper = mountRadioGroup({ onChange }, [{ isReadOnly: true }, {}, {}]);
    const radios = wrapper.findAll('input[type="radio"]');

    for (const radio of radios) {
      expect(radio.attributes("readonly")).toBeUndefined();
    }

    await radios[0]!.setValue(true);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("dogs");
  });

  it("can have a default value", async () => {
    const onChange = vi.fn();
    const wrapper = mountRadioGroup({ defaultValue: "dragons", onChange });
    const radios = wrapper.findAll('input[type="radio"]');

    expect((radios[0]!.element as HTMLInputElement).checked).toBe(false);
    expect((radios[1]!.element as HTMLInputElement).checked).toBe(false);
    expect((radios[2]!.element as HTMLInputElement).checked).toBe(true);

    await radios[0]!.setValue(true);
    expect(onChange).toHaveBeenCalledWith("dogs");
    expect((radios[0]!.element as HTMLInputElement).checked).toBe(true);
  });

  it("can be controlled", async () => {
    const onChange = vi.fn();
    const wrapper = mountRadioGroup({ value: "dragons", onChange });
    const radios = wrapper.findAll('input[type="radio"]');

    expect((radios[2]!.element as HTMLInputElement).checked).toBe(true);
    await radios[0]!.setValue(true);
    await nextTick();

    expect(onChange).toHaveBeenCalledWith("dogs");
    expect((radios[0]!.element as HTMLInputElement).checked).toBe(false);
    expect((radios[2]!.element as HTMLInputElement).checked).toBe(true);
  });

  it("supports labeling", () => {
    const wrapper = mountRadioGroup({ label: "Favorite Pet" }, [{}, {}, {}], {
      withGroupAriaLabel: false,
    });
    const group = wrapper.get('[role="radiogroup"]');
    const labelId = group.attributes("aria-labelledby");
    expect(labelId).toBeTruthy();
    expect(wrapper.get(`#${labelId}`).text()).toContain("Favorite Pet");
  });

  it("supports aria-label and custom props", () => {
    const wrapper = mountRadioGroup({
      "aria-label": "Favorite Pet",
      "data-testid": "test",
    });

    const group = wrapper.get('[role="radiogroup"]');
    expect(group.attributes("aria-label")).toBe("Favorite Pet");
    expect(group.attributes("data-testid")).toBe("test");
  });

  it("supports aria-label and custom props on individual radios", () => {
    const wrapper = mountRadioGroup(
      { label: "Favorite Pet" },
      [{ "aria-label": "Favorite Pet", "data-testid": "first" }, {}, {}],
      { withGroupAriaLabel: false }
    );

    const radios = wrapper.findAll('input[type="radio"]');
    expect(radios[0]!.attributes("aria-label")).toBe("Favorite Pet");
    expect(radios[0]!.attributes("data-testid")).toBe("first");
  });

  it("sets aria-orientation by default and from prop", () => {
    const vertical = mountRadioGroup();
    const horizontal = mountRadioGroup({ orientation: "horizontal" });

    expect(vertical.get('[role="radiogroup"]').attributes("aria-orientation")).toBe("vertical");
    expect(horizontal.get('[role="radiogroup"]').attributes("aria-orientation")).toBe("horizontal");
    expect(horizontal.get('[role="radiogroup"]').classes()).toContain("spectrum-FieldGroup-group--horizontal");
  });

  it("sets aria-invalid and passes aria-errormessage", () => {
    const wrapper = mountRadioGroup({
      isInvalid: true,
      "aria-errormessage": "test",
    });
    const group = wrapper.get('[role="radiogroup"]');

    expect(group.attributes("aria-invalid")).toBe("true");
    expect(group.attributes("aria-errormessage")).toBe("test");
  });

  it("sets aria-required on group but not individual radios", () => {
    const wrapper = mountRadioGroup({ isRequired: true });
    const group = wrapper.get('[role="radiogroup"]');
    const radios = wrapper.findAll('input[type="radio"]');

    expect(group.attributes("aria-required")).toBe("true");
    for (const radio of radios) {
      expect(radio.attributes("aria-required")).toBeUndefined();
    }
  });

  it("sets aria-disabled when group is disabled", () => {
    const wrapper = mountRadioGroup({ isDisabled: true });
    const group = wrapper.get('[role="radiogroup"]');
    expect(group.attributes("aria-disabled")).toBe("true");
  });

  it("supports help text description and error message", async () => {
    const withDescription = mountRadioGroup({ description: "Help text" });
    const description = withDescription.get(".spectrum-HelpText");
    expect(description.text()).toContain("Help text");

    const withError = mountRadioGroup({
      errorMessage: "Error message",
      isInvalid: true,
    });
    await nextTick();
    const error = withError.get(".spectrum-HelpText.is-invalid");
    expect(error.text()).toContain("Error message");
  });

  it("supports form reset", async () => {
    const Test = defineComponent({
      setup: () => () =>
        h("form", null, [
          h(RadioGroup as any, { name: "pet", label: "Favorite Pet", defaultValue: "dogs" }, () => [
            h(Radio as any, { value: "dogs" }, { default: () => "Dogs" }),
            h(Radio as any, { value: "cats" }, { default: () => "Cats" }),
            h(Radio as any, { value: "dragons" }, { default: () => "Dragons" }),
          ]),
          h("input", { type: "reset", "data-testid": "reset" }),
        ]),
    });

    const wrapper = mount(Test, { attachTo: document.body });
    const radios = wrapper.findAll('input[type="radio"]');
    const reset = wrapper.get('[data-testid="reset"]');

    expect((radios[0]!.element as HTMLInputElement).checked).toBe(true);
    await radios[1]!.setValue(true);
    await nextTick();
    expect((radios[1]!.element as HTMLInputElement).checked).toBe(true);

    await reset.trigger("click");
    await nextTick();
    expect((radios[0]!.element as HTMLInputElement).checked).toBe(true);
    expect((radios[1]!.element as HTMLInputElement).checked).toBe(false);
  });

  it("supports roving tabIndex behavior", async () => {
    const wrapper = mountRadioGroup();
    const radios = wrapper.findAll('input[type="radio"]');

    expect(radios[0]!.attributes("tabindex")).toBe("0");
    expect(radios[1]!.attributes("tabindex")).toBe("0");
    expect(radios[2]!.attributes("tabindex")).toBe("0");

    (radios[0]!.element as HTMLInputElement).focus();
    await radios[1]!.setValue(true);

    expect(radios[0]!.attributes("tabindex")).toBe("-1");
    expect(radios[1]!.attributes("tabindex")).toBe("0");
    expect(radios[2]!.attributes("tabindex")).toBe("-1");
  });

  it("supports keyboard navigation with wrapping", async () => {
    const wrapper = mountRadioGroup({ orientation: "horizontal" });
    const radios = wrapper.findAll('input[type="radio"]');

    (radios[0]!.element as HTMLInputElement).focus();
    await radios[0]!.trigger("keydown", { key: "ArrowRight" });
    expect((radios[1]!.element as HTMLInputElement).checked).toBe(true);

    await radios[1]!.trigger("keydown", { key: "ArrowRight" });
    expect((radios[2]!.element as HTMLInputElement).checked).toBe(true);

    await radios[2]!.trigger("keydown", { key: "ArrowRight" });
    expect((radios[0]!.element as HTMLInputElement).checked).toBe(true);
  });

  it("supports native required validation", async () => {
    const wrapper = mountRadioGroup({
      isRequired: true,
      validationBehavior: "native",
    });

    const radios = wrapper.findAll('input[type="radio"]');
    for (const radio of radios) {
      const input = radio.element as HTMLInputElement;
      expect(radio.attributes("required")).toBeDefined();
      expect(radio.attributes("aria-required")).toBeUndefined();
      expect(input.validity.valid).toBe(false);
    }

    await radios[0]!.setValue(true);
    for (const radio of radios) {
      expect((radio.element as HTMLInputElement).validity.valid).toBe(true);
    }
  });

  it("uses quiet style by default and emphasized when requested", () => {
    const quiet = mountRadioGroup({ defaultValue: "dogs" });
    const quietLabels = quiet.findAll("label.spectrum-Radio");
    expect(quietLabels[0]!.classes()).toContain("spectrum-Radio--quiet");

    const emphasized = mountRadioGroup({ isEmphasized: true, defaultValue: "dogs" });
    const emphasizedLabels = emphasized.findAll("label.spectrum-Radio");
    expect(emphasizedLabels[0]!.classes()).not.toContain("spectrum-Radio--quiet");
  });
});
