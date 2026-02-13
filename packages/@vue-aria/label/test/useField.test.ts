import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { useField } from "../src";

describe("useField", () => {
  it("returns label props", () => {
    const { labelProps, fieldProps } = useField({ label: "Test" });
    expect(labelProps.id).toBeDefined();
    expect(fieldProps.id).toBeDefined();
  });

  it("returns no description/error ids when not rendered", () => {
    const { descriptionProps, errorMessageProps } = useField({
      label: "Test",
      description: "Description",
      errorMessage: "Error",
    });

    expect(descriptionProps.id).toBeUndefined();
    expect(errorMessageProps.id).toBeUndefined();
  });

  it("renders and labels both description and error message", async () => {
    const Example = defineComponent({
      setup() {
        const { labelProps, fieldProps, descriptionProps, errorMessageProps } = useField({
          label: "Test label",
          description: "I describe the field.",
          errorMessage: "I'm a helpful error for the field.",
          isInvalid: true,
        });

        return () =>
          h("div", [
            h("label", labelProps, "Test label"),
            h("input", fieldProps),
            h("div", descriptionProps, "I describe the field."),
            h("div", errorMessageProps, "I'm a helpful error for the field."),
          ]);
      },
    });

    const wrapper = mount(Example, { attachTo: document.body });
    await Promise.resolve();

    const input = wrapper.get("input").element as HTMLInputElement;
    const description = wrapper.findAll("div")[1]?.element as HTMLElement;
    const error = wrapper.findAll("div")[2]?.element as HTMLElement;

    expect(input.getAttribute("aria-describedby") ?? "").toContain(description.id);
    expect(input.getAttribute("aria-describedby") ?? "").toContain(error.id);

    wrapper.unmount();
  });
});
