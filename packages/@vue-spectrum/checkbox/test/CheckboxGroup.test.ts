import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, type PropType } from "vue";
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
});
