import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { Checkbox, CheckboxGroup } from "../src";

function renderGroup(
  props: Record<string, unknown> = {},
  checkboxProps: Array<Record<string, unknown>> = []
) {
  return mount(CheckboxGroup, {
    props,
    slots: {
      default: () => [
        h(
          Checkbox,
          {
            value: "dogs",
            ...(checkboxProps[0] ?? {}),
          },
          () => "Dogs"
        ),
        h(
          Checkbox,
          {
            value: "cats",
            ...(checkboxProps[1] ?? {}),
          },
          () => "Cats"
        ),
        h(
          Checkbox,
          {
            value: "dragons",
            ...(checkboxProps[2] ?? {}),
          },
          () => "Dragons"
        ),
      ],
    },
  });
}

function getInputByValue(wrapper: ReturnType<typeof mount>, value: string) {
  return wrapper.get(`input[value="${value}"]`);
}

describe("CheckboxGroup", () => {
  it("handles defaults", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const wrapper = renderGroup(
      {
        label: "Favorite Pet",
        onChange,
      },
      [{}, {}, {}]
    );
    const group = wrapper.get("[role='group']");
    const dogs = getInputByValue(wrapper, "dogs");
    const cats = getInputByValue(wrapper, "cats");
    const dragons = getInputByValue(wrapper, "dragons");

    expect(group.attributes("role")).toBe("group");
    expect((dogs.element as HTMLInputElement).checked).toBe(false);
    expect((cats.element as HTMLInputElement).checked).toBe(false);
    expect((dragons.element as HTMLInputElement).checked).toBe(false);

    await user.click(dragons.element);
    expect(onChange).toHaveBeenCalledWith(["dragons"]);
    expect((dragons.element as HTMLInputElement).checked).toBe(true);
    expect((dogs.element as HTMLInputElement).checked).toBe(false);
    expect((cats.element as HTMLInputElement).checked).toBe(false);
  });

  it("supports defaultValue", () => {
    const wrapper = renderGroup({
      label: "Favorite Pet",
      defaultValue: ["cats"],
    });
    const dogs = getInputByValue(wrapper, "dogs");
    const cats = getInputByValue(wrapper, "cats");
    const dragons = getInputByValue(wrapper, "dragons");

    expect((cats.element as HTMLInputElement).checked).toBe(true);
    expect((dogs.element as HTMLInputElement).checked).toBe(false);
    expect((dragons.element as HTMLInputElement).checked).toBe(false);
  });

  it("supports name and labeling", () => {
    const wrapper = renderGroup({
      label: "Favorite Pet",
      name: "awesome-vue-aria",
    });
    const group = wrapper.get("[role='group']");
    const labelledby = group.attributes("aria-labelledby");

    expect(labelledby).toBeTruthy();
    expect(wrapper.get(`#${labelledby}`).text()).toContain("Favorite Pet");
    expect(getInputByValue(wrapper, "dogs").attributes("name")).toBe("awesome-vue-aria");
    expect(getInputByValue(wrapper, "cats").attributes("name")).toBe("awesome-vue-aria");
    expect(getInputByValue(wrapper, "dragons").attributes("name")).toBe(
      "awesome-vue-aria"
    );
  });

  it("supports aria-label and custom props", () => {
    const wrapper = renderGroup({
      "aria-label": "My Favorite Pet",
      "data-testid": "favorite-pet",
    });
    const group = wrapper.get("[role='group']");

    expect(group.attributes("aria-label")).toBe("My Favorite Pet");
    expect(group.attributes("data-testid")).toBe("favorite-pet");
  });

  it("sets aria-disabled and disables items when group is disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const checkboxOnChange = vi.fn();
    const wrapper = renderGroup(
      {
        label: "Favorite Pet",
        isDisabled: true,
        onChange,
      },
      [{}, {}, { onChange: checkboxOnChange }]
    );
    const group = wrapper.get("[role='group']");
    const dragons = getInputByValue(wrapper, "dragons");

    expect(group.attributes("aria-disabled")).toBe("true");
    expect(dragons.attributes("disabled")).toBeDefined();

    await user.click(dragons.element);
    expect(onChange).not.toHaveBeenCalled();
    expect(checkboxOnChange).not.toHaveBeenCalled();
    expect((dragons.element as HTMLInputElement).checked).toBe(false);
  });

  it("supports readonly groups", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const wrapper = renderGroup({
      label: "Favorite Pet",
      isReadOnly: true,
      onChange,
    });
    const dragons = getInputByValue(wrapper, "dragons");

    expect(dragons.attributes("aria-readonly")).toBe("true");

    await user.click(dragons.element);
    expect((dragons.element as HTMLInputElement).checked).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("supports required semantics on group items", async () => {
    const user = userEvent.setup();
    const wrapper = renderGroup({
      label: "Favorite Pet",
      isRequired: true,
    });
    const dragons = getInputByValue(wrapper, "dragons");

    expect(dragons.attributes("aria-required")).toBe("true");
    expect((dragons.element as HTMLInputElement).checked).toBe(false);

    await user.click(dragons.element);
    expect((dragons.element as HTMLInputElement).checked).toBe(true);

    await user.click(dragons.element);
    expect((dragons.element as HTMLInputElement).checked).toBe(false);
  });

  it("supports description and error message", async () => {
    const user = userEvent.setup();
    const wrapper = renderGroup({
      label: "Favorite Pet",
      isRequired: true,
      description: "Select all that apply",
      errorMessage: "At least one option is required",
    });
    const dragons = getInputByValue(wrapper, "dragons");

    expect(wrapper.text()).toContain("At least one option is required");

    await user.click(dragons.element);
    expect(wrapper.text()).toContain("Select all that apply");
    expect(wrapper.text()).not.toContain("At least one option is required");
  });

  it("supports horizontal orientation", () => {
    const wrapper = renderGroup({
      orientation: "horizontal",
      "aria-label": "Pets",
    });
    const group = wrapper.get("[role='group']");
    expect(group.classes()).toContain("spectrum-FieldGroup-group--horizontal");
  });

  it("passes emphasized style to child checkboxes", () => {
    const wrapper = renderGroup({
      isEmphasized: true,
      "aria-label": "Pets",
    });
    const labels = wrapper.findAll("label.spectrum-Checkbox");
    for (const label of labels) {
      expect(label.classes()).not.toContain("spectrum-Checkbox--quiet");
    }
  });
});
