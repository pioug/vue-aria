import { fireEvent, render } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { Form } from "@vue-spectrum/form";
import {
  DEFAULT_SPECTRUM_THEME_CLASS_MAP,
  provideSpectrumProvider,
} from "@vue-spectrum/provider";
import { TextArea } from "../src";

function renderWithProvider(component: ReturnType<typeof defineComponent>) {
  const ProviderHarness = defineComponent({
    name: "TextAreaProviderHarness",
    setup() {
      provideSpectrumProvider({
        theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
        colorScheme: "light",
        scale: "medium",
      });

      return () => h(component);
    },
  });

  return render(ProviderHarness);
}

describe("TextArea", () => {
  it("warns once when placeholder is provided", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { rerender } = render(TextArea, {
      props: {
        label: "Notes",
        placeholder: "Type notes",
      },
    });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      "Placeholders are deprecated due to accessibility issues. Please use help text instead. See the docs for details: https://react-spectrum.adobe.com/react-spectrum/TextArea.html#help-text"
    );

    await rerender({
      label: "Notes",
      placeholder: "Another placeholder",
    });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });

  it("renders textarea with rows", () => {
    const { getByRole } = render(TextArea, {
      props: {
        label: "Notes",
        rows: 4,
      },
    });

    const textarea = getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea.getAttribute("rows")).toBe("4");
  });

  it("shows native required error after form validity check and clears on blur once valid", async () => {
    const Harness = defineComponent({
      name: "TextAreaNativeRequiredHarness",
      setup() {
        return () =>
          h("form", { "data-testid": "form" }, [
            h(TextArea, {
              label: "Notes",
              isRequired: true,
              validationBehavior: "native",
            }),
          ]);
      },
    });

    const { getByRole, getByTestId } = render(Harness);
    const input = getByRole("textbox") as HTMLTextAreaElement;
    const form = getByTestId("form") as HTMLFormElement;

    expect(input.getAttribute("aria-describedby")).toBeNull();
    expect(form.checkValidity()).toBe(false);
    await nextTick();

    expect(input.getAttribute("aria-describedby")).toBeTruthy();
    expect(input.validity.valid).toBe(false);

    await fireEvent.update(input, "Devon");
    await nextTick();
    expect(input.validity.valid).toBe(true);
    expect(input.getAttribute("aria-describedby")).toBeTruthy();

    await fireEvent.blur(input);
    await nextTick();
    expect(input.getAttribute("aria-describedby")).toBeNull();
  });

  it("supports custom native error message functions", async () => {
    const Harness = defineComponent({
      name: "TextAreaNativeCustomMessageHarness",
      setup() {
        return () =>
          h("form", { "data-testid": "form" }, [
            h(TextArea, {
              label: "Notes",
              isRequired: true,
              validationBehavior: "native",
              errorMessage: (context) =>
                (
                  context.validationDetails as
                    | { valueMissing?: boolean }
                    | undefined
                )?.valueMissing
                  ? "Please enter notes"
                  : null,
            }),
          ]);
      },
    });

    const { getByRole, getByTestId, getByText } = render(Harness);
    const input = getByRole("textbox") as HTMLTextAreaElement;
    const form = getByTestId("form") as HTMLFormElement;

    expect(form.checkValidity()).toBe(false);
    await nextTick();

    expect(getByText("Please enter notes")).toBeTruthy();
    expect(input.getAttribute("aria-describedby")).toBeTruthy();
  });

  it("supports text updates", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { getByRole } = render(TextArea, {
      props: {
        label: "Notes",
        onChange,
      },
    });

    const textarea = getByRole("textbox") as HTMLTextAreaElement;
    await user.type(textarea, "hello");

    expect(onChange).toHaveBeenCalled();
    expect(textarea.value).toBe("hello");
  });

  it("auto-resizes based on scroll height on mount", async () => {
    let scrollHeight = 72;
    const scrollHeightDescriptor = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "scrollHeight"
    );
    Object.defineProperty(HTMLTextAreaElement.prototype, "scrollHeight", {
      configurable: true,
      get() {
        return scrollHeight;
      },
    });

    try {
      const { getByRole } = render(TextArea, {
        props: {
          label: "Notes",
          defaultValue: "Initial content",
        },
      });

      await nextTick();
      await nextTick();

      const textarea = getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.style.height).toBe("72px");
    } finally {
      if (scrollHeightDescriptor) {
        Object.defineProperty(
          HTMLTextAreaElement.prototype,
          "scrollHeight",
          scrollHeightDescriptor
        );
      } else {
        delete (HTMLTextAreaElement.prototype as { scrollHeight?: number }).scrollHeight;
      }
    }
  });

  it('default can adjust after text "grows"', async () => {
    let scrollHeight = 64;
    const scrollHeightDescriptor = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "scrollHeight"
    );
    Object.defineProperty(HTMLTextAreaElement.prototype, "scrollHeight", {
      configurable: true,
      get() {
        return scrollHeight;
      },
    });

    try {
      const { getByRole } = render(TextArea, {
        props: {
          label: "Notes",
          defaultValue: "Start",
        },
      });

      await nextTick();
      await nextTick();

      const textarea = getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.style.height).toBe("64px");

      scrollHeight = 128;
      await fireEvent.update(textarea, "Expanded content");
      await nextTick();

      expect(textarea.style.height).toBe("128px");
    } finally {
      if (scrollHeightDescriptor) {
        Object.defineProperty(
          HTMLTextAreaElement.prototype,
          "scrollHeight",
          scrollHeightDescriptor
        );
      } else {
        delete (HTMLTextAreaElement.prototype as { scrollHeight?: number }).scrollHeight;
      }
    }
  });

  it('isQuiet can adjust after text "grows"', async () => {
    let scrollHeight = 52;
    const scrollHeightDescriptor = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "scrollHeight"
    );
    Object.defineProperty(HTMLTextAreaElement.prototype, "scrollHeight", {
      configurable: true,
      get() {
        return scrollHeight;
      },
    });

    try {
      const { getByRole } = render(TextArea, {
        props: {
          label: "Notes",
          isQuiet: true,
        },
      });

      await nextTick();
      await nextTick();

      const textarea = getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.style.height).toBe("52px");

      scrollHeight = 104;
      await fireEvent.update(textarea, "Grown");
      await nextTick();

      expect(textarea.style.height).toBe("104px");
    } finally {
      if (scrollHeightDescriptor) {
        Object.defineProperty(
          HTMLTextAreaElement.prototype,
          "scrollHeight",
          scrollHeightDescriptor
        );
      } else {
        delete (HTMLTextAreaElement.prototype as { scrollHeight?: number }).scrollHeight;
      }
    }
  });

  it("default does not change height when a height prop is set", async () => {
    let scrollHeight = 60;
    const scrollHeightDescriptor = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "scrollHeight"
    );
    Object.defineProperty(HTMLTextAreaElement.prototype, "scrollHeight", {
      configurable: true,
      get() {
        return scrollHeight;
      },
    });

    try {
      const { getByRole } = render(TextArea, {
        props: {
          label: "Notes",
          UNSAFE_style: {
            height: "200px",
          },
        },
      });

      await nextTick();
      await nextTick();

      const textarea = getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.style.height).toBe("");

      scrollHeight = 120;
      await fireEvent.update(textarea, "Expanded");
      await nextTick();

      expect(textarea.style.height).toBe("");
    } finally {
      if (scrollHeightDescriptor) {
        Object.defineProperty(
          HTMLTextAreaElement.prototype,
          "scrollHeight",
          scrollHeightDescriptor
        );
      } else {
        delete (HTMLTextAreaElement.prototype as { scrollHeight?: number }).scrollHeight;
      }
    }
  });

  it("supports custom icon rendering", () => {
    const { getByTestId } = render(TextArea, {
      props: {
        label: "Notes",
        icon: h("span", { "data-testid": "textarea-icon", role: "img" }, "*"),
      },
    });

    expect(getByTestId("textarea-icon")).toBeTruthy();
  });

  it("supports excludeFromTabOrder", () => {
    const { getByRole } = render(TextArea, {
      props: {
        label: "Notes",
        excludeFromTabOrder: true,
      },
    });

    const input = getByRole("textbox");
    expect(input.getAttribute("tabindex")).toBe("-1");
  });

  it("passes through aria-errormessage when invalid", () => {
    const { getByRole } = render(TextArea, {
      props: {
        label: "Notes",
        validationState: "invalid",
        "aria-errormessage": "notes-error",
      } as Record<string, unknown>,
    });

    const input = getByRole("textbox");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-errormessage")).toBe("notes-error");
  });

  it("supports form reset with controlled value", async () => {
    const user = userEvent.setup();
    const Harness = defineComponent({
      name: "TextAreaFormResetHarness",
      setup() {
        const value = ref("Devon");
        return () =>
          h("form", null, [
            h(TextArea, {
              "data-testid": "name",
              label: "Name",
              value: value.value,
              onChange: (nextValue: string) => {
                value.value = nextValue;
              },
            }),
            h("input", {
              type: "reset",
              "data-testid": "reset",
            }),
          ]);
      },
    });

    const { getByTestId } = render(Harness);
    const input = getByTestId("name") as HTMLTextAreaElement;
    expect(input.value).toBe("Devon");

    await user.click(input);
    await user.keyboard("[ArrowRight] test");
    expect(input.value).toBe("Devon test");

    await user.click(getByTestId("reset"));
    expect(input.value).toBe("Devon");
  });

  it("shows form validationErrors message when field name matches", () => {
    const App = defineComponent({
      name: "TextAreaFormValidationHarness",
      setup() {
        return () =>
          h(
            Form,
            {
              validationErrors: {
                notes: "Invalid notes.",
              },
            },
            {
              default: () =>
                h(TextArea, {
                  label: "Notes",
                  name: "notes",
                }),
            }
          );
      },
    });
    const tree = renderWithProvider(App);

    const input = tree.getByRole("textbox");
    const message = tree.getByText("Invalid notes.");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toContain(
      message.getAttribute("id") ?? ""
    );
  });

  it("clears form validationErrors message when the textarea value changes", async () => {
    const App = defineComponent({
      name: "TextAreaFormValidationClearHarness",
      setup() {
        return () =>
          h(
            Form,
            {
              validationErrors: {
                notes: "Invalid notes.",
              },
            },
            {
              default: () =>
                h(TextArea, {
                  label: "Notes",
                  name: "notes",
                }),
            }
          );
      },
    });
    const tree = renderWithProvider(App);

    const input = tree.getByRole("textbox") as HTMLTextAreaElement;
    expect(tree.getByText("Invalid notes.")).toBeTruthy();
    expect(input.getAttribute("aria-invalid")).toBe("true");

    await fireEvent.update(input, "updated");
    await nextTick();

    expect(tree.queryByText("Invalid notes.")).toBeNull();
    expect(input.getAttribute("aria-invalid")).not.toBe("true");
  });

  it("supports validate function in aria behavior", async () => {
    const tree = render(TextArea, {
      props: {
        label: "Notes",
        defaultValue: "Foo",
        validate: (value: string) => (value === "Foo" ? "Invalid name" : null),
      },
    });

    const input = tree.getByRole("textbox") as HTMLTextAreaElement;
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(tree.getByText("Invalid name")).toBeTruthy();

    await fireEvent.update(input, "Devon");
    await nextTick();

    expect(input.getAttribute("aria-invalid")).not.toBe("true");
    expect(tree.queryByText("Invalid name")).toBeNull();
  });

  it("supports validate function in native behavior", async () => {
    const tree = render(TextArea, {
      props: {
        label: "Notes",
        defaultValue: "Foo",
        validationBehavior: "native",
        validate: (value: string) => (value === "Foo" ? "Invalid name" : null),
      },
    });

    const input = tree.getByRole("textbox") as HTMLTextAreaElement;
    expect(input.validity.valid).toBe(false);
    expect(input.getAttribute("aria-invalid")).not.toBe("true");

    await fireEvent.update(input, "Devon");
    await nextTick();

    expect(input.validity.valid).toBe(true);
    expect(tree.queryByText("Invalid name")).toBeNull();
  });
});
