import { mount } from "@vue/test-utils";
import { computed, defineComponent, h, nextTick, ref, type PropType } from "vue";
import { describe, expect, it } from "vitest";
import { mergeProps } from "@vue-aria/utils";
import { useField } from "@vue-aria/label";
import type { LabelPosition } from "../src";
import { Field } from "../src";

const ExampleField = defineComponent({
  name: "ExampleField",
  props: {
    label: {
      type: null as unknown as PropType<string | null | undefined>,
      default: "Field label",
    },
    ariaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    description: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    errorMessage: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    validationState: {
      type: String as PropType<"valid" | "invalid" | undefined>,
      default: undefined,
    },
    isInvalid: {
      type: null as unknown as PropType<boolean | undefined>,
      default: undefined,
    },
    labelPosition: {
      type: String as PropType<LabelPosition | undefined>,
      default: undefined,
    },
    contextualHelp: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const label = computed(() =>
      props.label === null ? undefined : props.label
    );

    const { labelProps, fieldProps, descriptionProps, errorMessageProps } = useField({
      label,
      description: computed(() => props.description),
      errorMessage: computed(() => props.errorMessage),
      validationState: computed(() => props.validationState),
      isInvalid: computed(() => props.isInvalid),
      "aria-label": computed(() => props.ariaLabel),
    });

    return () =>
      h(
        Field,
        {
          label: props.label === null ? undefined : props.label,
          labelPosition: props.labelPosition,
          description: props.description,
          errorMessage: props.errorMessage,
          validationState: props.validationState,
          isInvalid: props.isInvalid,
          labelProps: labelProps.value,
          descriptionProps: descriptionProps.value,
          errorMessageProps: errorMessageProps.value,
          contextualHelp: props.contextualHelp
            ? h(
                "button",
                {
                  type: "button",
                  "aria-label": "Help",
                },
                "Help"
              )
            : undefined,
        } as Record<string, unknown>,
        {
          default: () =>
            h(
              "input",
              mergeProps(fieldProps.value, {
                type: "text",
              })
            ),
        }
      );
  },
});

function renderField(props: Record<string, unknown> = {}) {
  return mount(ExampleField, {
    props,
  });
}

describe("Field", () => {
  it("renders correctly", () => {
    const wrapper = renderField();

    const input = wrapper.find("input");
    expect(input.exists()).toBe(true);
    expect(input.attributes("aria-describedby")).toBeUndefined();
  });

  it("supports a ref", () => {
    const fieldRef = ref<{ $el?: Element } | null>(null);
    const App = defineComponent({
      name: "FieldRefHarness",
      setup() {
        return () =>
          h(
            Field,
            {
              ref: fieldRef,
              label: "Field label",
            },
            {
              default: () => h("input", { type: "text" }),
            }
          );
      },
    });

    const wrapper = mount(App);
    const fieldRoot = wrapper.get(".spectrum-Field").element;
    expect(fieldRef.value?.$el).toBe(fieldRoot);
  });

  it("supports contextualHelp", () => {
    const wrapper = renderField({ contextualHelp: true });

    const label = wrapper.get("label");
    const button = wrapper.get("button[aria-label='Help']");
    expect(button.attributes("id")).toBeDefined();
    expect(button.attributes("aria-labelledby")).toBeDefined();
    expect(button.attributes("aria-labelledby")?.split(/\s+/)[0]).toBe(
      label.attributes("id")
    );
  });

  it("does not render contextual help if there is no label", () => {
    let wrapper = renderField({
      label: null,
      ariaLabel: "Test",
      contextualHelp: true,
    });
    expect(wrapper.find("button[aria-label='Help']").exists()).toBe(false);

    wrapper = renderField({
      label: null,
      ariaLabel: "Test",
      contextualHelp: true,
      description: "test",
    });
    expect(wrapper.find("button[aria-label='Help']").exists()).toBe(false);
  });

  it("applies side label classes", () => {
    const wrapper = renderField({
      labelPosition: "side",
    });

    expect(wrapper.get(".spectrum-Field").classes()).toContain(
      "spectrum-Field--positionSide"
    );
  });

  it("renders when description is provided", () => {
    const wrapper = renderField({ description: "Help text" });

    const helpText = wrapper.get(".spectrum-HelpText-text");
    expect(helpText.text()).toBe("Help text");

    const input = wrapper.get("input");
    expect(input.attributes("aria-describedby")).toBe(helpText.attributes("id"));
  });

  it(
    "renders when description and error message are provided but validationState is not invalid",
    () => {
    const wrapper = renderField({
      description: "Help text",
      errorMessage: "Error message",
    });

    expect(wrapper.text()).toContain("Help text");
    expect(wrapper.text()).not.toContain("Error message");
    }
  );

  it(
    "renders when description is provided and validationState is invalid but no error message is provided",
    () => {
    const wrapper = renderField({
      description: "Help text",
      validationState: "invalid",
    });

    expect(wrapper.text()).toContain("Help text");
    }
  );

  it("does not render when no description is provided", () => {
    const wrapper = renderField();
    expect(wrapper.find(".spectrum-HelpText-text").exists()).toBe(false);

    const input = wrapper.get("input");
    expect(input.attributes("aria-describedby")).toBeUndefined();
  });

  it("renders when no visible label is provided", () => {
    const wrapper = renderField({
      label: null,
      ariaLabel: "Field label",
      description: "Help text",
    });

    const helpText = wrapper.get(".spectrum-HelpText-text");
    expect(helpText.text()).toBe("Help text");

    const input = wrapper.get("input");
    expect(input.attributes("aria-describedby")).toBe(helpText.attributes("id"));
  });

  it("renders when error message is provided and validationState is invalid", () => {
    const wrapper = renderField({
      errorMessage: "Error message",
      validationState: "invalid",
    });

    const errorText = wrapper.get(".spectrum-HelpText-text");
    expect(errorText.text()).toBe("Error message");

    const input = wrapper.get("input");
    expect(input.attributes("aria-describedby")).toBe(errorText.attributes("id"));
  });

  it("does not render when error message is provided but validationState is not invalid", () => {
    const wrapper = renderField({
      errorMessage: "Error message",
    });

    expect(wrapper.text()).not.toContain("Error message");
    expect(wrapper.get("input").attributes("aria-describedby")).toBeUndefined();
  });

  it("does not render when validationState is invalid but no error message is provided", () => {
    const wrapper = renderField({
      validationState: "invalid",
    });

    expect(wrapper.find(".spectrum-HelpText-text").exists()).toBe(false);
    expect(wrapper.get("input").attributes("aria-describedby")).toBeUndefined();
  });

  it("does not lose focus when no visible label and validation state changes", async () => {
    const wrapper = mount(ExampleField, {
      attachTo: document.body,
      props: {
        label: null,
        ariaLabel: "Field label",
      },
    });

    const input = wrapper.get("input");
    (input.element as HTMLInputElement).focus();
    await nextTick();
    expect(document.activeElement).toBe(input.element);

    await wrapper.setProps({
      validationState: "invalid",
      errorMessage: "Error message",
    });
    await nextTick();

    expect(wrapper.text()).toContain("Error message");
    expect(document.activeElement).toBe(wrapper.get("input").element);
    wrapper.unmount();
  });
});
