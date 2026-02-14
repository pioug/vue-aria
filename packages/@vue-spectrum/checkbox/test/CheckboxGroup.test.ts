import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref, type PropType } from "vue";
import { Checkbox } from "../src/Checkbox";
import { CheckboxGroup } from "../src/CheckboxGroup";

const GroupFixture = defineComponent({
  props: {
    value: {
      type: Array as () => string[] | undefined,
      required: false,
    },
    defaultValue: {
      type: Array as () => string[] | undefined,
      required: false,
    },
    onChange: {
      type: Function as PropType<((value: string[]) => void) | undefined>,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    label: {
      type: String,
      required: false,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    isReadOnly: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
  },
  setup(props, { attrs }) {
    return () =>
      h(
        CheckboxGroup as any,
        {
          ...attrs,
          label: props.label,
          value: props.value,
          defaultValue: props.defaultValue,
          onChange: props.onChange,
          name: props.name,
          isDisabled: props.isDisabled,
          isReadOnly: props.isReadOnly,
        },
        {
          default: () => [
            h(Checkbox as any, { value: "dogs" }, { default: () => "Dogs" }),
            h(Checkbox as any, { value: "cats" }, { default: () => "Cats" }),
            h(Checkbox as any, { value: "dragons" }, { default: () => "Dragons" }),
          ],
        }
      );
  },
});

describe("CheckboxGroup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("handles defaults", async () => {
    const onChange = vi.fn();
    const wrapper = mount(GroupFixture as any, {
      props: {
        label: "Favorite Pet",
        onChange,
      },
      attachTo: document.body,
    });

    const group = wrapper.get('[role="group"]');
    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    expect(checkboxes).toHaveLength(3);
    expect((checkboxes[0]!.element as HTMLInputElement).checked).toBe(false);
    expect((checkboxes[1]!.element as HTMLInputElement).checked).toBe(false);
    expect((checkboxes[2]!.element as HTMLInputElement).checked).toBe(false);

    await checkboxes[2]!.setValue(true);
    expect(onChange).toHaveBeenCalledWith(["dragons"]);
    expect((checkboxes[2]!.element as HTMLInputElement).checked).toBe(true);
  });

  it("can have a default value", () => {
    const wrapper = mount(GroupFixture as any, {
      props: {
        label: "Favorite Pet",
        value: ["cats"],
      },
    });

    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    expect((checkboxes[1]!.element as HTMLInputElement).checked).toBe(true);
  });

  it("name can be controlled", () => {
    const wrapper = mount(GroupFixture as any, {
      props: {
        label: "Favorite Pet",
        name: "awesome-react-aria",
      },
    });

    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    expect(checkboxes[0]!.attributes("name")).toBe("awesome-react-aria");
    expect(checkboxes[1]!.attributes("name")).toBe("awesome-react-aria");
    expect(checkboxes[2]!.attributes("name")).toBe("awesome-react-aria");
  });

  it("supports labeling", () => {
    const wrapper = mount(GroupFixture as any, {
      props: {
        label: "Favorite Pet",
      },
    });
    const group = wrapper.get('[role="group"]');
    const labelId = group.attributes("aria-labelledby");
    expect(labelId).toBeTruthy();
    const label = wrapper.get(`#${labelId}`);
    expect(label.text()).toContain("Favorite Pet");
  });

  it("supports aria-label", () => {
    const wrapper = mount(GroupFixture as any, {
      props: {
        label: "",
      },
      attrs: {
        "aria-label": "My Favorite Pet",
      },
    });
    const group = wrapper.get('[role="group"]');
    expect(group.attributes("aria-label")).toBe("My Favorite Pet");
  });

  it("supports custom props", () => {
    const wrapper = mount(GroupFixture as any, {
      props: {
        label: "Favorite Pet",
      },
      attrs: {
        "data-testid": "favorite-pet",
      },
    });

    const group = wrapper.get('[role="group"]');
    expect(group.attributes("data-testid")).toBe("favorite-pet");
  });

  it("sets aria-disabled when isDisabled is true", () => {
    const wrapper = mount(GroupFixture as any, {
      props: {
        label: "Favorite Pet",
        isDisabled: true,
      },
    });

    const group = wrapper.get('[role="group"]');
    expect(group.attributes("aria-disabled")).toBe("true");

    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    expect(checkboxes[0]!.attributes("disabled")).toBeDefined();
    expect(checkboxes[1]!.attributes("disabled")).toBeDefined();
    expect(checkboxes[2]!.attributes("disabled")).toBeDefined();
  });

  it("sets aria-readonly on each checkbox when readOnly", () => {
    const wrapper = mount(GroupFixture as any, {
      props: {
        label: "Favorite Pet",
        isReadOnly: true,
      },
    });

    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    expect(checkboxes[0]!.attributes("aria-readonly")).toBe("true");
    expect(checkboxes[1]!.attributes("aria-readonly")).toBe("true");
    expect(checkboxes[2]!.attributes("aria-readonly")).toBe("true");
  });

  it.each(["isSelected", "defaultSelected", "isEmphasized"] as const)(
    "warns if %s is passed to an individual checkbox",
    (prop) => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
      mount(
        defineComponent({
          setup() {
            return () =>
              h(CheckboxGroup as any, { label: "Favorite Pet" }, {
                default: () => [
                  h(Checkbox as any, { value: "dogs" }, { default: () => "Dogs" }),
                  h(Checkbox as any, { value: "cats", [prop]: true }, { default: () => "Cats" }),
                  h(Checkbox as any, { value: "dragons" }, { default: () => "Dragons" }),
                ],
              });
          },
        })
      );

      expect(spy).toHaveBeenCalledWith(
        `${prop} is unsupported on individual <Checkbox> elements within a <CheckboxGroup>. ` +
          "Apply these props on the group instead."
      );
      spy.mockRestore();
    }
  );

  it("supports help text description", async () => {
    const wrapper = mount(GroupFixture as any, {
      props: {
        label: "Favorite Pet",
      },
      attrs: {
        description: "Help text",
      },
    });

    await nextTick();
    const description = wrapper.get(".spectrum-HelpText");
    expect(description.text()).toContain("Help text");
  });

  it("supports error message", async () => {
    const wrapper = mount(GroupFixture as any, {
      props: {
        label: "Favorite Pet",
      },
      attrs: {
        errorMessage: "Error message",
        isInvalid: true,
      },
    });

    await nextTick();
    const description = wrapper.get(".spectrum-HelpText.is-invalid");
    expect(description.text()).toContain("Error message");
  });

  it("supports form reset", async () => {
    const Test = defineComponent({
      setup() {
        const value = ref(["dogs"]);
        const setValue = (next: string[]) => {
          value.value = next;
        };
        return () =>
          h("form", null, [
            h(CheckboxGroup as any, { name: "pets", label: "Pets", value: value.value, onChange: setValue }, {
              default: () => [
                h(Checkbox as any, { value: "dogs" }, { default: () => "Dogs" }),
                h(Checkbox as any, { value: "cats" }, { default: () => "Cats" }),
                h(Checkbox as any, { value: "dragons" }, { default: () => "Dragons" }),
              ],
            }),
            h("input", { type: "reset", "data-testid": "reset" }),
          ]);
      },
    });

    const wrapper = mount(Test, { attachTo: document.body });
    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    const reset = wrapper.get('[data-testid="reset"]');

    expect((checkboxes[0]!.element as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[1]!.element as HTMLInputElement).checked).toBe(false);
    expect((checkboxes[2]!.element as HTMLInputElement).checked).toBe(false);

    await checkboxes[1]!.setValue(true);
    expect((checkboxes[0]!.element as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[1]!.element as HTMLInputElement).checked).toBe(true);

    await reset.trigger("click");
    await nextTick();
    expect((checkboxes[0]!.element as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[1]!.element as HTMLInputElement).checked).toBe(false);
    expect((checkboxes[2]!.element as HTMLInputElement).checked).toBe(false);
  });

  it("adds aria-invalid to all checkboxes when group is invalid", () => {
    const wrapper = mount(GroupFixture as any, {
      props: {
        label: "Favorite Pet",
      },
      attrs: {
        isInvalid: true,
      },
    });

    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    expect(checkboxes[0]!.attributes("aria-invalid")).toBe("true");
    expect(checkboxes[1]!.attributes("aria-invalid")).toBe("true");
    expect(checkboxes[2]!.attributes("aria-invalid")).toBe("true");
  });

  it("supports invalid state on individual checkboxes", () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(CheckboxGroup as any, { label: "Agree to the following" }, {
              default: () => [
                h(Checkbox as any, { value: "terms", isInvalid: true }, { default: () => "Terms and conditions" }),
                h(Checkbox as any, { value: "cookies", isInvalid: true }, { default: () => "Cookies" }),
                h(Checkbox as any, { value: "privacy" }, { default: () => "Privacy policy" }),
              ],
            });
        },
      })
    );

    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    expect(checkboxes[0]!.attributes("aria-invalid")).toBe("true");
    expect(checkboxes[1]!.attributes("aria-invalid")).toBe("true");
    expect(checkboxes[2]!.attributes("aria-invalid")).toBeUndefined();
  });

  it("supports group-level native required validation", async () => {
    const wrapper = mount(GroupFixture as any, {
      props: {
        label: "Agree to the following",
      },
      attrs: {
        isRequired: true,
        validationBehavior: "native",
      },
      attachTo: document.body,
    });

    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    for (const input of checkboxes) {
      expect(input.attributes("required")).toBeDefined();
      expect(input.attributes("aria-required")).toBeUndefined();
      expect((input.element as HTMLInputElement).validity.valid).toBe(false);
    }

    await checkboxes[0]!.setValue(true);
    for (const input of checkboxes) {
      expect(input.attributes("required")).toBeUndefined();
      expect((input.element as HTMLInputElement).validity.valid).toBe(true);
    }
  });
});
