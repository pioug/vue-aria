import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref, type PropType, type VNode } from "vue";
import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_SPECTRUM_THEME_CLASS_MAP,
  provideSpectrumProvider,
  useSpectrumProvider,
} from "@vue-spectrum/provider";
import { TextField } from "@vue-spectrum/textfield";
import { Picker } from "@vue-spectrum/picker";
import { ContextualHelp } from "@vue-spectrum/contextualhelp";
import { Content, Header } from "@vue-spectrum/view";
import { Form, useFormValidationErrors } from "../src";

type RenderFunction = () => VNode;
type PickerItemData = { key: string; label: string };

const ProviderRoot = defineComponent({
  name: "ProviderRoot",
  props: {
    render: {
      type: Function as PropType<RenderFunction>,
      required: true,
    },
  },
  setup(props) {
    provideSpectrumProvider({
      theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
      colorScheme: "light",
      scale: "medium",
    });

    return () => props.render();
  },
});

function mountWithProvider(render: RenderFunction) {
  return mount(ProviderRoot, {
    props: {
      render,
    },
  });
}

async function flushOverlay() {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

const pickerItems: PickerItemData[] = [
  { key: "one", label: "One" },
  { key: "two", label: "Two" },
  { key: "three", label: "Three" },
];

describe("Form", () => {
  it("should render a form", () => {
    const wrapper = mountWithProvider(() =>
      h(Form, { "aria-label": "Home", "data-testid": "form" })
    );

    const form = wrapper.get('[data-testid="form"]');
    expect(form.element.tagName).toBe("FORM");
    expect(form.attributes("novalidate")).toBeDefined();
    expect(form.classes()).toContain("spectrum-Form");
    expect(form.classes()).toContain("spectrum-Form--positionTop");
  });

  it("should render children inside the form", () => {
    const wrapper = mountWithProvider(() =>
      h(
        Form,
        {
          "aria-label": "Home",
        },
        {
          default: () => h("button", { "data-testid": "child-button" }, "Test"),
        }
      )
    );

    expect(wrapper.get('[data-testid="child-button"]').text()).toBe("Test");
  });

  it("should attach a optional user provided ref to the form", () => {
    const formRef = ref<{
      UNSAFE_getDOMNode: () => HTMLFormElement | null;
    } | null>(null);

    const wrapper = mountWithProvider(() =>
      h(Form, {
        ref: formRef,
        "aria-label": "Home",
        "data-testid": "form",
      })
    );

    const form = wrapper.get('[data-testid="form"]').element as HTMLFormElement;
    expect(typeof formRef.value?.UNSAFE_getDOMNode).toBe("function");
    expect(formRef.value?.UNSAFE_getDOMNode()).toBe(form);
  });

  it("should context props should be overridden by child", () => {
    const wrapper = mountWithProvider(() =>
      h(
        Form,
        {
          "aria-label": "Context form",
          necessityIndicator: undefined,
        },
        {
          default: () =>
            h(TextField, {
              label: "A text field",
              necessityIndicator: "label",
              "data-testid": "tfid4",
            }),
        }
      )
    );

    const input = wrapper.get('[data-testid="tfid4"]');
    const labelId = (input.attributes("aria-labelledby") ?? "").split(" ")[0];
    expect(labelId).toBeTruthy();
    const label = wrapper.get(`#${labelId}`);
    expect(label.text()).toContain("A text field");
    expect(label.text().toLowerCase()).toContain("optional");
  });

  it("supports native validation behavior", () => {
    const wrapper = mountWithProvider(() =>
      h(Form, {
        "aria-label": "Home",
        validationBehavior: "native",
        "data-testid": "form",
      })
    );

    const form = wrapper.get('[data-testid="form"]');
    expect(form.attributes("novalidate")).toBeUndefined();
  });

  it("supports form attributes", async () => {
    const onSubmit = vi.fn((event: Event) => event.preventDefault());

    const wrapper = mountWithProvider(() =>
      h(
        Form,
        {
          "aria-label": "Test",
          action: "/action_page.php",
          method: "get",
          target: "_self",
          encType: "text/plain",
          autoComplete: "on",
          onSubmit,
          "data-testid": "form",
        },
        {
          default: () =>
            h("button", {
              type: "submit",
              "aria-label": "Submit",
            }),
        }
      )
    );

    const form = wrapper.get('[data-testid="form"]');
    expect(form.attributes("action")).toContain("/action_page.php");
    expect(form.attributes("method")).toBe("get");
    expect(form.attributes("target")).toBe("_self");
    expect(form.attributes("autocomplete")).toBe("on");
    expect(form.attributes("enctype")).toBe("text/plain");

    await form.trigger("submit");
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("supports aria-label", () => {
    const wrapper = mountWithProvider(() =>
      h(Form, { "aria-label": "Test", "data-testid": "form" })
    );

    expect(wrapper.get('[data-testid="form"]').attributes("aria-label")).toBe("Test");
  });

  it("supports aria-labelledby", () => {
    const wrapper = mountWithProvider(() =>
      h("div", [
        h("span", { id: "test-label" }, "Test"),
        h(Form, {
          "aria-labelledby": "test-label",
          "data-testid": "form",
        }),
      ])
    );

    expect(wrapper.get('[data-testid="form"]').attributes("aria-labelledby")).toBe(
      "test-label"
    );
  });

  it("supports aria-describedby", () => {
    const wrapper = mountWithProvider(() =>
      h("div", [
        h("span", { id: "test-description" }, "Description"),
        h(Form, {
          "aria-label": "Test",
          "aria-describedby": "test-description",
          "data-testid": "form",
        }),
      ])
    );

    expect(wrapper.get('[data-testid="form"]').attributes("aria-describedby")).toBe(
      "test-description"
    );
  });

  it("supports custom data attributes", () => {
    const wrapper = mountWithProvider(() =>
      h(Form, {
        "aria-label": "Test",
        "data-testid": "form",
        "data-qa": "form-qa-target",
      })
    );

    expect(wrapper.get('[data-testid="form"]').attributes("data-qa")).toBe(
      "form-qa-target"
    );
  });

  describe("values", () => {
    it("default value of a picker is empty", () => {
      const wrapper = mountWithProvider(() =>
        h(
          Form,
          {
            "aria-label": "Picker form",
          },
          {
            default: () =>
              h(Picker, {
                name: "picker",
                label: "Test Picker",
                items: pickerItems,
              }),
          }
        )
      );

      const form = wrapper.get("form").element as HTMLFormElement;
      const pickerInput = form.elements.namedItem("picker") as HTMLInputElement | null;
      expect(pickerInput?.value ?? "").toBe("");
    });

    it("value of a picker can be set", () => {
      const wrapper = mountWithProvider(() =>
        h(
          Form,
          {
            "aria-label": "Picker form",
          },
          {
            default: () =>
              h(Picker, {
                name: "picker",
                label: "Test Picker",
                items: pickerItems,
                defaultSelectedKey: "one",
              }),
          }
        )
      );

      const form = wrapper.get("form").element as HTMLFormElement;
      const pickerInput = form.elements.namedItem("picker") as HTMLInputElement | null;
      expect(pickerInput?.value).toBe("one");
    });

    it(
      "contextual help should not be disabled nor should its dismiss button be disabled",
      async () => {
        const wrapper = mountWithProvider(() =>
          h(
            Form,
            {
              "aria-label": "Test",
              isDisabled: true,
            },
            {
              default: () =>
                h(ContextualHelp, null, {
                  default: () => [
                    h(Header, null, () => "What is it good for?"),
                    h(Content, null, () => "Absolutely nothing."),
                  ],
                }),
            }
          )
        );

        const trigger = wrapper.get("button");
        expect(trigger.attributes("disabled")).toBeUndefined();

        await trigger.trigger("click");
        await flushOverlay();

        const dialog = document.body.querySelector("[role=\"dialog\"]");
        expect(dialog).not.toBeNull();

        const dismissButton = dialog?.querySelector("button") as HTMLButtonElement | null;
        if (dismissButton) {
          expect(dismissButton.disabled).toBe(false);
          dismissButton.click();
          await flushOverlay();
        }
        wrapper.unmount();
      }
    );
  });

  it("updates form positioning classes", () => {
    const wrapper = mountWithProvider(() =>
      h(Form, {
        labelPosition: "side",
        "aria-label": "Test",
        "data-testid": "form",
      })
    );

    const form = wrapper.get('[data-testid="form"]');
    expect(form.classes()).toContain("spectrum-Form--positionSide");
    expect(form.classes()).not.toContain("spectrum-Form--positionTop");
  });

  it("provides form validation errors to descendants", () => {
    const ValidationReader = defineComponent({
      name: "ValidationReader",
      setup() {
        const validationErrors = useFormValidationErrors();

        return () =>
          h("output", {
            "data-testid": "validation-reader",
            "data-email-errors": Array.isArray(validationErrors.value.email)
              ? validationErrors.value.email.join("|")
              : (validationErrors.value.email ?? ""),
          });
      },
    });

    const wrapper = mountWithProvider(() =>
      h(
        Form,
        {
          "aria-label": "Validation form",
          validationErrors: {
            email: ["Already taken", "Must contain a number"],
          },
        },
        {
          default: () => h(ValidationReader),
        }
      )
    );

    expect(
      wrapper.get('[data-testid="validation-reader"]').attributes("data-email-errors")
    ).toBe("Already taken|Must contain a number");
  });

  it("provides provider-level state to descendants", () => {
    const Child = defineComponent({
      name: "ChildProviderState",
      setup() {
        const provider = useSpectrumProvider();
        return () =>
          h("output", {
            "data-testid": "provider-state",
            "data-is-disabled": String(provider.value.isDisabled),
            "data-is-read-only": String(provider.value.isReadOnly),
            "data-is-required": String(provider.value.isRequired),
          });
      },
    });

    const wrapper = mountWithProvider(() =>
      h(
        Form,
        {
          "aria-label": "Test",
          isDisabled: true,
          isReadOnly: true,
          isRequired: true,
        },
        {
          default: () => h(Child),
        }
      )
    );

    const state = wrapper.get('[data-testid="provider-state"]');
    expect(state.attributes("data-is-disabled")).toBe("true");
    expect(state.attributes("data-is-read-only")).toBe("true");
    expect(state.attributes("data-is-required")).toBe("true");
  });
});
