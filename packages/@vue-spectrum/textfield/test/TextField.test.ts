import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, provide, ref } from "vue";
import { FormValidationContext } from "@vue-stately/form";
import { TextField } from "../src/TextField";

const TEST_ID = "test-id";
const INPUT_TEXT = "blah";

describe("TextField", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders with default textfield behavior", async () => {
    const wrapper = mount(TextField as any, {
      attrs: {
        "aria-label": "mandatory label",
        "data-testid": TEST_ID,
      },
      attachTo: document.body,
    });

    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    expect((input.element as HTMLInputElement).value).toBe("");
    expect(input.element.tagName).toBe("INPUT");
    expect(input.attributes("type")).toBe("text");

    await input.setValue(INPUT_TEXT);
    expect((input.element as HTMLInputElement).value).toBe(INPUT_TEXT);
  });

  it("allows custom naming", () => {
    const wrapper = mount(TextField as any, {
      props: {
        name: "blah",
      },
      attrs: {
        "aria-label": "mandatory label",
        "data-testid": TEST_ID,
      },
    });

    expect(wrapper.get(`[data-testid="${TEST_ID}"]`).attributes("name")).toBe("blah");
  });

  it("renders placeholder text and shows warning", () => {
    const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const wrapper = mount(TextField as any, {
      props: {
        placeholder: INPUT_TEXT,
      },
      attrs: {
        "aria-label": "mandatory label",
        "data-testid": TEST_ID,
      },
    });

    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    expect(input.attributes("placeholder")).toBe(INPUT_TEXT);
    expect(spyWarn).toHaveBeenCalledWith(
      "Placeholders are deprecated due to accessibility issues. Please use help text instead. " +
        "See the docs for details: https://react-spectrum.adobe.com/react-spectrum/TextField.html#help-text"
    );
    spyWarn.mockRestore();
  });

  it("calls onChange when text changes", async () => {
    const onChange = vi.fn();
    const wrapper = mount(TextField as any, {
      props: {
        onChange,
      },
      attrs: {
        "aria-label": "mandatory label",
        "data-testid": TEST_ID,
      },
      attachTo: document.body,
    });

    await wrapper.get(`[data-testid="${TEST_ID}"]`).setValue(INPUT_TEXT);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(INPUT_TEXT);
  });

  it("calls onFocus and onBlur", async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const wrapper = mount(TextField as any, {
      props: {
        onFocus,
        onBlur,
      },
      attrs: {
        "aria-label": "mandatory label",
        "data-testid": TEST_ID,
      },
      attachTo: document.body,
    });

    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    await input.trigger("focus");
    await input.trigger("blur");
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("is uncontrolled when defaultValue is provided", async () => {
    const onChange = vi.fn();
    const wrapper = mount(TextField as any, {
      props: {
        onChange,
        defaultValue: "test",
      },
      attrs: {
        "aria-label": "mandatory label",
        "data-testid": TEST_ID,
      },
      attachTo: document.body,
    });

    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    await input.setValue("testblah");
    expect(onChange).toHaveBeenCalled();
  });

  it("is controlled when value is provided", async () => {
    const onChange = vi.fn();
    const wrapper = mount(TextField as any, {
      props: {
        onChange,
        value: "test",
      },
      attrs: {
        "aria-label": "mandatory label",
        "data-testid": TEST_ID,
      },
      attachTo: document.body,
    });

    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    expect((input.element as HTMLInputElement).value).toBe("test");
    await input.setValue("testblah");
    await nextTick();
    expect((input.element as HTMLInputElement).value).toBe("testblah");
    expect(onChange).toHaveBeenCalled();
  });

  it("supports validation state invalid and valid icon", () => {
    const invalid = mount(TextField as any, {
      props: {
        validationState: "invalid",
      },
      attrs: {
        "aria-label": "mandatory label",
        "data-testid": TEST_ID,
      },
    });
    const invalidInput = invalid.get(`[data-testid="${TEST_ID}"]`);
    expect(invalidInput.attributes("aria-invalid")).toBe("true");
    expect(invalid.get(".spectrum-Textfield").classes()).toContain("spectrum-Textfield--invalid");
    expect(invalid.find('[role="img"]').exists()).toBe(true);

    const valid = mount(TextField as any, {
      props: {
        validationState: "valid",
      },
      attrs: {
        "aria-label": "mandatory label",
        "data-testid": TEST_ID,
      },
    });
    const validInput = valid.get(`[data-testid="${TEST_ID}"]`);
    expect(validInput.attributes("aria-invalid")).toBeUndefined();
    expect(valid.get(".spectrum-Textfield").classes()).toContain("spectrum-Textfield--valid");
    const validIcon = valid.get('[aria-label="Valid"]');
    expect(validIcon.attributes("role")).toBe("img");
  });

  it("supports quiet and standard visual variants", () => {
    const standard = mount(TextField as any, {
      attrs: {
        "aria-label": "mandatory label",
        "data-testid": TEST_ID,
      },
    });
    expect(standard.get(".spectrum-Textfield-wrapper").classes()).not.toContain("spectrum-Textfield-wrapper--quiet");
    expect(standard.get(".spectrum-Textfield").classes()).not.toContain("spectrum-Textfield--quiet");

    const quiet = mount(TextField as any, {
      props: {
        isQuiet: true,
      },
      attrs: {
        "aria-label": "mandatory label",
        "data-testid": TEST_ID,
      },
    });
    expect(quiet.get(".spectrum-Textfield-wrapper").classes()).toContain("spectrum-Textfield-wrapper--quiet");
    expect(quiet.get(".spectrum-Textfield").classes()).toContain("spectrum-Textfield--quiet");
  });

  it("supports icon + validation-indicator rendering", () => {
    const wrapper = mount(TextField as any, {
      props: {
        validationState: "invalid",
        icon: h("span", { "data-testid": "leading-icon", role: "img", "aria-label": "Search icon" }, "S"),
      },
      attrs: {
        "aria-label": "mandatory label",
        "data-testid": TEST_ID,
      },
    });

    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    expect(input.classes()).toContain("spectrum-Textfield-inputIcon");
    expect(wrapper.get('[data-testid="leading-icon"]').attributes("aria-label")).toBe("Search icon");
    expect(wrapper.get(".spectrum-Textfield-validationIcon").attributes("role")).toBe("img");
  });

  it("passes through aria-errormessage", () => {
    const wrapper = mount(TextField as any, {
      props: {
        validationState: "invalid",
      },
      attrs: {
        "aria-label": "mandatory label",
        "aria-errormessage": "error",
        "data-testid": TEST_ID,
      },
    });

    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(input.attributes("aria-errormessage")).toBe("error");
  });

  it("supports required state and autofocus", () => {
    const wrapper = mount(TextField as any, {
      props: {
        isRequired: true,
        autoFocus: true,
      },
      attrs: {
        "aria-label": "mandatory label",
        "data-testid": TEST_ID,
      },
      attachTo: document.body,
    });

    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    expect(input.attributes("aria-required")).toBe("true");
    expect(document.activeElement).toBe(input.element);
  });

  it("supports readonly and disabled", () => {
    const readonly = mount(TextField as any, {
      props: {
        isReadOnly: true,
      },
      attrs: {
        "aria-label": "mandatory label",
        "data-testid": TEST_ID,
      },
    });
    expect(readonly.get(`[data-testid="${TEST_ID}"]`).attributes("readonly")).toBeDefined();

    const disabled = mount(TextField as any, {
      props: {
        isDisabled: true,
      },
      attrs: {
        "aria-label": "mandatory label",
        "data-testid": TEST_ID,
      },
    });
    expect(disabled.get(`[data-testid="${TEST_ID}"]`).attributes("disabled")).toBeDefined();
  });

  it("supports labeling", () => {
    const wrapper = mount(TextField as any, {
      props: {
        label: "Textfield label",
      },
      attrs: {
        "data-testid": TEST_ID,
      },
    });

    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    const labelId = input.attributes("aria-labelledby");
    expect(labelId).toBeTruthy();
    expect(wrapper.get(`#${labelId}`).text()).toContain("Textfield label");
  });

  it("supports description or error message", async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(TextField as any, {
              "data-testid": TEST_ID,
              value: "s",
              onChange: () => {},
              label: "Favorite number",
              validationState: "invalid",
              description: "Enter a single digit number.",
              errorMessage: "Single digit numbers are 0-9.",
            });
        },
      })
    );

    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    await nextTick();
    expect(wrapper.text()).toContain("Single digit numbers are 0-9.");
  });

  it("supports validate function in aria mode", () => {
    const wrapper = mount(TextField as any, {
      props: {
        "aria-label": "mandatory label",
        "data-testid": TEST_ID,
        defaultValue: "Foo",
        validate: (value: string) => (value === "Foo" ? "Invalid name" : null),
      },
    });

    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(wrapper.get(".spectrum-HelpText.is-invalid").text()).toContain("Invalid name");
  });

  it("supports server validation in aria mode", () => {
    const serverErrors = ref<Record<string, string | undefined>>({
      name: "Invalid name.",
    });

    const wrapper = mount(
      defineComponent({
        setup() {
          provide(FormValidationContext, serverErrors);
          return () =>
            h(TextField as any, {
              "aria-label": "mandatory label",
              "data-testid": TEST_ID,
              name: "name",
            });
        },
      }),
      { attachTo: document.body }
    );

    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(wrapper.get(".spectrum-HelpText.is-invalid").text()).toContain("Invalid name.");
  });

  it("supports required native validation semantics", () => {
    const wrapper = mount(TextField as any, {
      props: {
        "aria-label": "mandatory label",
        "data-testid": TEST_ID,
        isRequired: true,
        validationBehavior: "native",
      },
      attachTo: document.body,
    });

    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    expect(input.attributes("required")).toBeDefined();
    expect(input.attributes("aria-required")).toBeUndefined();
    expect((input.element as HTMLInputElement).checkValidity()).toBe(false);
  });

  it("passes through ARIA props and supports excludeFromTabOrder", () => {
    const wrapper = mount(TextField as any, {
      props: {
        excludeFromTabOrder: true,
      },
      attrs: {
        "aria-label": "mandatory label",
        "aria-activedescendant": "test",
        "aria-autocomplete": "list",
        "aria-haspopup": "menu",
        "data-testid": TEST_ID,
      },
    });

    const input = wrapper.get(`[data-testid="${TEST_ID}"]`);
    expect(input.attributes("aria-activedescendant")).toBe("test");
    expect(input.attributes("aria-autocomplete")).toBe("list");
    expect(input.attributes("aria-haspopup")).toBe("menu");
    expect(input.attributes("tabindex")).toBe("-1");
  });

  it("supports form reset", async () => {
    const Test = defineComponent({
      setup: () => () =>
        h("form", null, [
          h(TextField as any, { "data-testid": "name", label: "Name", defaultValue: "Devon" }),
          h("input", { type: "reset", "data-testid": "reset" }),
        ]),
    });

    const wrapper = mount(Test, { attachTo: document.body });
    const input = wrapper.get('[data-testid="name"]');
    const reset = wrapper.get('[data-testid="reset"]');

    expect((input.element as HTMLInputElement).value).toBe("Devon");
    await input.setValue("Devon test");
    expect((input.element as HTMLInputElement).value).toBe("Devon test");
    await reset.trigger("click");
    await nextTick();
    expect((input.element as HTMLInputElement).value).toBe("Devon");
  });
});
