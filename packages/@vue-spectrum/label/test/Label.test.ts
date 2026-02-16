import { defineComponent, h } from "vue";
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { useField } from "@vue-aria/label";
import { Field, HelpText, Label } from "../src";

describe("Label", () => {
  it("renders label text and required indicator", () => {
    const wrapper = mount(Label, {
      props: {
        htmlFor: "field-id",
        isRequired: true,
        necessityIndicator: "label",
      },
      slots: {
        default: () => "Name",
      },
    });

    const label = wrapper.get("label");
    expect(label.element.tagName).toBe("LABEL");
    expect(label.classes()).toContain("spectrum-FieldLabel");
    expect(label.text()).toContain("Name");
    expect(label.text()).toContain("(required)");
    expect(label.attributes("for")).toBe("field-id");
    expect(wrapper.get(".spectrum-FieldLabel-necessity").text()).toBe("(required)");
  });

  it("supports non-label element type", () => {
    const wrapper = mount(Label, {
      props: {
        elementType: "span",
      },
      slots: {
        default: () => "Name",
      },
    });

    const node = wrapper.get("span");
    expect(node.element.tagName).toBe("SPAN");
    expect(node.attributes("for")).toBeUndefined();
  });
});

describe("HelpText", () => {
  it("renders description with neutral variant", () => {
    const wrapper = mount(HelpText, {
      props: {
        description: "Helpful text",
      },
    });

    const helpText = wrapper.get(".spectrum-HelpText");
    expect(helpText.classes()).toContain("spectrum-HelpText--neutral");
    expect(helpText.get(".spectrum-HelpText-text").text()).toBe("Helpful text");
  });

  it("renders error message with negative variant", () => {
    const wrapper = mount(HelpText, {
      props: {
        errorMessage: "Invalid value",
        isInvalid: true,
      },
    });

    const helpText = wrapper.get(".spectrum-HelpText");
    expect(helpText.classes()).toContain("spectrum-HelpText--negative");
    expect(helpText.get(".spectrum-HelpText-text").text()).toBe("Invalid value");
  });
});

describe("Field", () => {
  it("associates description with field input", () => {
    const ExampleField = defineComponent({
      props: {
        label: {
          type: [String, Number, Object],
          required: false,
          default: "Email",
        },
        description: {
          type: [String, Number, Object],
          required: false,
          default: "Enter your email",
        },
      },
      setup(props) {
        const fieldAria = useField({
          ...props,
          id: "field-id",
        } as Record<string, unknown>);

        return () =>
          h(
            Field,
            {
              ...props,
              label: props.label,
              description: props.description,
              labelProps: fieldAria.labelProps,
              descriptionProps: fieldAria.descriptionProps,
              errorMessageProps: fieldAria.errorMessageProps,
            },
            {
              default: () => h("input", fieldAria.fieldProps),
            }
          );
      },
    });

    const wrapper = mount(ExampleField);
    const input = wrapper.get("input");
    const helpText = wrapper.get(".spectrum-HelpText");

    expect(wrapper.get(".spectrum-Field").exists()).toBe(true);
    expect(wrapper.get(".spectrum-FieldLabel").text()).toBe("Email");
    expect(input.attributes("aria-describedby")).toBe(helpText.attributes("id"));
    expect(input.attributes("aria-labelledby")).toContain(wrapper.get(".spectrum-FieldLabel").attributes("id"));
  });

  it("only renders error message when field is invalid", () => {
    const ExampleField = defineComponent({
      props: {
        label: {
          type: [String, Number, Object],
          required: false,
          default: "Email",
        },
        errorMessage: {
          type: [String, Number, Object],
          required: false,
          default: "Error message",
        },
      },
      setup(props) {
        const fieldAria = useField(props as Record<string, unknown>);

        return () =>
          h(
            Field,
            {
              ...props,
              label: props.label,
              errorMessage: props.errorMessage,
              labelProps: fieldAria.labelProps,
              descriptionProps: fieldAria.descriptionProps,
              errorMessageProps: fieldAria.errorMessageProps,
            },
            {
              default: () => h("input", fieldAria.fieldProps),
            }
          );
      },
    });

    const wrapper = mount(ExampleField);

    expect(wrapper.find(".spectrum-HelpText").exists()).toBe(false);

    const invalidWrapper = mount(ExampleField, {
      props: {
        isInvalid: true,
      },
    });

    expect(invalidWrapper.find(".spectrum-HelpText").exists()).toBe(true);
    expect(invalidWrapper.get(".spectrum-HelpText").text()).toContain("Error message");
  });
});
