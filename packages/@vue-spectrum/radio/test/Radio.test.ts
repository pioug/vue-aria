import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { Provider } from "@vue-spectrum/provider";
import { Radio, RadioGroup } from "../src";

function createTheme() {
  return {
    global: { spectrum: "spectrum" },
    light: { "spectrum--light": "spectrum--light" },
    dark: { "spectrum--dark": "spectrum--dark" },
    medium: { "spectrum--medium": "spectrum--medium" },
    large: { "spectrum--large": "spectrum--large" },
  };
}

function renderRadioGroup(
  groupProps: Record<string, unknown> = {},
  radioProps: Array<Record<string, unknown>> = [{}, {}, {}]
) {
  return mount(RadioGroup, {
    props: {
      "aria-label": "favorite pet",
      ...groupProps,
    },
    slots: {
      default: () => [
        h(
          Radio,
          {
            value: "dogs",
            ...(radioProps[0] ?? {}),
          },
          () => "Dogs"
        ),
        h(
          Radio,
          {
            value: "cats",
            ...(radioProps[1] ?? {}),
          },
          () => "Cats"
        ),
        h(
          Radio,
          {
            value: "dragons",
            ...(radioProps[2] ?? {}),
          },
          () => "Dragons"
        ),
      ],
    },
  });
}

function getRadios(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll("input[type='radio']");
}

describe("Radio and RadioGroup", () => {
  it("handles defaults", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const wrapper = renderRadioGroup({ onChange });
    const group = wrapper.get("[role='radiogroup']");
    const radios = getRadios(wrapper);

    expect(group).toBeTruthy();
    expect(radios).toHaveLength(3);
    expect(radios[0].attributes("name")).toBeTruthy();
    expect(radios[1].attributes("name")).toBe(radios[0].attributes("name"));
    expect(radios[2].attributes("name")).toBe(radios[0].attributes("name"));
    expect((radios[0].element as HTMLInputElement).checked).toBe(false);
    expect((radios[1].element as HTMLInputElement).checked).toBe(false);
    expect((radios[2].element as HTMLInputElement).checked).toBe(false);

    await user.click(wrapper.get("label.spectrum-Radio:nth-of-type(1)").element);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("dogs");
    expect((radios[0].element as HTMLInputElement).checked).toBe(true);
    expect((radios[1].element as HTMLInputElement).checked).toBe(false);
    expect((radios[2].element as HTMLInputElement).checked).toBe(false);
  });

  it("renders radios without visible labels", () => {
    const wrapper = mount(RadioGroup, {
      props: {
        "aria-label": "favorite pet",
      },
      slots: {
        default: () => [
          h(Radio, { value: "dogs", "aria-label": "dogs" }),
          h(Radio, { value: "cats", "aria-label": "cats" }),
          h(Radio, { value: "dragons", "aria-label": "dragons" }),
        ],
      },
    });
    const group = wrapper.get("[role='radiogroup']");
    const radios = getRadios(wrapper);

    expect(group).toBeTruthy();
    expect(radios).toHaveLength(3);
  });

  it("supports custom group name", () => {
    const wrapper = renderRadioGroup({ name: "customName" });
    const radios = getRadios(wrapper);

    expect(radios[0].attributes("name")).toBe("customName");
    expect(radios[1].attributes("name")).toBe("customName");
    expect(radios[2].attributes("name")).toBe("customName");
  });

  it("can be disabled via Provider", () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme: createTheme(),
                isDisabled: true,
              },
              {
                default: () =>
                  h(
                    RadioGroup,
                    {
                      "aria-label": "favorite pet",
                    },
                    {
                      default: () => [
                        h(Radio, { value: "dogs" }, () => "Dogs"),
                        h(Radio, { value: "cats" }, () => "Cats"),
                        h(Radio, { value: "dragons" }, () => "Dragons"),
                      ],
                    }
                  ),
              }
            );
        },
      })
    );
    const radios = getRadios(wrapper);

    expect(radios[0].attributes("disabled")).toBeDefined();
    expect(radios[1].attributes("disabled")).toBeDefined();
    expect(radios[2].attributes("disabled")).toBeDefined();
  });

  it("supports a single disabled radio", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const wrapper = renderRadioGroup(
      {
        onChange,
      },
      [{}, { isDisabled: true }, {}]
    );
    const radios = getRadios(wrapper);

    expect(radios[0].attributes("disabled")).toBeUndefined();
    expect(radios[1].attributes("disabled")).toBeDefined();
    expect(radios[2].attributes("disabled")).toBeUndefined();

    await user.click(wrapper.get("label.spectrum-Radio:nth-of-type(2)").element);
    expect(onChange).not.toHaveBeenCalled();

    await user.click(wrapper.get("label.spectrum-Radio:nth-of-type(1)").element);
    expect(onChange).toHaveBeenCalledWith("dogs");
  });

  it("supports readonly groups", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const wrapper = renderRadioGroup({
      isReadOnly: true,
      onChange,
    });
    const group = wrapper.get("[role='radiogroup']");

    expect(group.attributes("aria-readonly")).toBe("true");
    await user.click(wrapper.get("label.spectrum-Radio:nth-of-type(2)").element);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("supports defaultValue", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const wrapper = renderRadioGroup({
      defaultValue: "dragons",
      onChange,
    });
    const radios = getRadios(wrapper);

    expect((radios[2].element as HTMLInputElement).checked).toBe(true);
    await user.click(wrapper.get("label.spectrum-Radio:nth-of-type(1)").element);
    expect(onChange).toHaveBeenCalledWith("dogs");
    expect((radios[0].element as HTMLInputElement).checked).toBe(true);
  });

  it("supports controlled value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const wrapper = renderRadioGroup({
      value: "dragons",
      onChange,
    });
    const radios = getRadios(wrapper);

    expect((radios[2].element as HTMLInputElement).checked).toBe(true);
    await user.click(wrapper.get("label.spectrum-Radio:nth-of-type(1)").element);
    expect(onChange).toHaveBeenCalledWith("dogs");
    expect((radios[2].element as HTMLInputElement).checked).toBe(true);
  });

  it("supports labeling and custom props", () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h("div", [
              h("span", { id: "test-label" }, "Favorite Pet"),
              h(
                RadioGroup,
                {
                  "aria-labelledby": "test-label",
                  "data-testid": "favorite-pet",
                },
                {
                  default: () => [
                    h(Radio, { value: "dogs" }, () => "Dogs"),
                    h(Radio, { value: "cats" }, () => "Cats"),
                  ],
                }
              ),
            ]);
        },
      })
    );
    const group = wrapper.get("[role='radiogroup']");

    expect(group.attributes("aria-labelledby")).toBe("test-label");
    expect(group.attributes("data-testid")).toBe("favorite-pet");
  });

  it("supports orientation, invalid, errormessage, required, and disabled attrs", () => {
    const wrapper = renderRadioGroup({
      orientation: "horizontal",
      isInvalid: true,
      ariaErrormessage: "error-id",
      isRequired: true,
      isDisabled: true,
    });
    const group = wrapper.get("[role='radiogroup']");

    expect(group.attributes("aria-orientation")).toBe("horizontal");
    expect(group.attributes("aria-invalid")).toBe("true");
    expect(group.attributes("aria-errormessage")).toBe("error-id");
    expect(group.attributes("aria-required")).toBe("true");
    expect(group.attributes("aria-disabled")).toBe("true");
  });

  it("supports description and error message", () => {
    const wrapper = renderRadioGroup({
      label: "Favorite Pet",
      description: "Pick one option",
      errorMessage: "Selection required",
      isInvalid: true,
    });

    expect(wrapper.text()).toContain("Selection required");
  });

  it("supports form reset", async () => {
    const user = userEvent.setup();
    const Harness = defineComponent({
      name: "RadioGroupFormResetHarness",
      setup() {
        const value = ref("dogs");

        return () =>
          h("form", [
            h(
              RadioGroup,
              {
                "aria-label": "favorite pet",
                value: value.value,
                onChange: (nextValue: string) => {
                  value.value = nextValue;
                },
              },
              {
                default: () => [
                  h(Radio, { value: "dogs" }, () => "Dogs"),
                  h(Radio, { value: "cats" }, () => "Cats"),
                ],
              }
            ),
            h("input", {
              type: "reset",
              "data-testid": "reset",
              onClick: () => {
                value.value = "dogs";
              },
            }),
          ]);
      },
    });

    const wrapper = mount(Harness);
    const radios = getRadios(wrapper);

    expect((radios[0].element as HTMLInputElement).checked).toBe(true);
    await user.click(wrapper.get("label.spectrum-Radio:nth-of-type(2)").element);
    expect((radios[1].element as HTMLInputElement).checked).toBe(true);

    await user.click(wrapper.get("[data-testid='reset']").element);
    expect((radios[0].element as HTMLInputElement).checked).toBe(true);
  });
});
