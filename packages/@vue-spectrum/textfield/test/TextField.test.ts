import { fireEvent, render } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { Form } from "@vue-spectrum/form";
import {
  DEFAULT_SPECTRUM_THEME_CLASS_MAP,
  provideSpectrumProvider,
} from "@vue-spectrum/provider";
import { TextArea, TextField } from "../src";

function renderWithProvider(component: ReturnType<typeof defineComponent>) {
  const ProviderHarness = defineComponent({
    name: "TextFieldProviderHarness",
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

describe("TextField", () => {
  it("warns once when placeholder is provided", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { rerender } = render(TextField, {
      props: {
        label: "Name",
        placeholder: "Full name",
      },
    });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      "Placeholders are deprecated due to accessibility issues. Please use help text instead. See the docs for details: https://react-spectrum.adobe.com/react-spectrum/TextField.html#help-text"
    );

    await rerender({
      label: "Name",
      placeholder: "Another placeholder",
    });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });

  it("renders a labeled text input", () => {
    const { getByRole } = render(TextField, {
      props: {
        label: "Name",
      },
    });

    const input = getByRole("textbox") as HTMLInputElement;
    expect(input.tagName).toBe("INPUT");
    expect(input.type).toBe("text");
    expect(input.getAttribute("aria-labelledby")).toBeTruthy();
  });

  it("renders description and wires aria-describedby", () => {
    const { getByRole, getByText } = render(TextField, {
      props: {
        label: "Name",
        description: "Provide your full name",
      },
    });

    const input = getByRole("textbox");
    const description = getByText("Provide your full name");

    expect(description).toBeTruthy();
    expect(input.getAttribute("aria-describedby")).toContain(
      description.getAttribute("id") ?? ""
    );
  });

  it("renders error text when invalid", () => {
    const { getByRole, getByText } = render(TextField, {
      props: {
        label: "Name",
        errorMessage: "Name is required",
        validationState: "invalid",
      },
    });

    const input = getByRole("textbox");
    const errorMessage = getByText("Name is required");

    expect(errorMessage).toBeTruthy();
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toContain(
      errorMessage.getAttribute("id") ?? ""
    );
  });

  it("supports uncontrolled value changes and onChange callback", async () => {
    const onChange = vi.fn();
    const { getByRole } = render(TextField, {
      props: {
        label: "Name",
        defaultValue: "",
        onChange,
      },
    });

    const input = getByRole("textbox") as HTMLInputElement;
    await fireEvent.update(input, "Ada");

    expect(onChange).toHaveBeenCalled();
    expect(input.value).toBe("Ada");
  });

  it("supports controlled value", async () => {
    const { getByRole, rerender } = render(TextField, {
      props: {
        label: "Name",
        value: "First",
      },
    });

    const input = getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("First");

    await rerender({
      label: "Name",
      value: "Second",
    });

    expect(input.value).toBe("Second");
  });

  it("supports native required behavior", () => {
    const { getByRole } = render(TextField, {
      props: {
        label: "Name",
        isRequired: true,
        validationBehavior: "native",
      },
    });

    const input = getByRole("textbox");
    expect(input.getAttribute("required")).toBe("");
    expect(input.getAttribute("aria-required")).toBeNull();
  });

  it("supports disabled and readOnly states", () => {
    const { getByRole } = render(TextField, {
      props: {
        label: "Name",
        isDisabled: true,
        isReadOnly: true,
      },
    });

    const input = getByRole("textbox");
    expect(input.getAttribute("disabled")).toBe("");
    expect(input.getAttribute("readonly")).toBe("");
  });

  it("supports autoFocus", async () => {
    const { getByRole } = render(TextField, {
      props: {
        label: "Name",
        autoFocus: true,
      },
    });

    await nextTick();
    await nextTick();

    const input = getByRole("textbox");
    expect(document.activeElement).toBe(input);
  });

  it("supports custom icon rendering", () => {
    const { getByTestId } = render(TextField, {
      props: {
        label: "Name",
        icon: h("span", { "data-testid": "textfield-icon", role: "img" }, "*"),
      },
    });

    expect(getByTestId("textfield-icon")).toBeTruthy();
  });

  it("supports validation icons and valid aria-describedby wiring", () => {
    const validTree = render(TextField, {
      props: {
        label: "Name",
        validationState: "valid",
      },
    });

    const validInput = validTree.getByRole("textbox");
    const validIcon = validTree.getByTestId("textfield-valid-icon");
    const validIconId = validIcon.getAttribute("id");

    expect(validIconId).toBeTruthy();
    expect(validInput.getAttribute("aria-describedby")).toContain(validIconId ?? "");
    validTree.unmount();

    const invalidTree = render(TextField, {
      props: {
        label: "Name",
        validationState: "invalid",
      },
    });

    expect(invalidTree.getByTestId("textfield-invalid-icon")).toBeTruthy();
  });

  it("supports loading indicator and suppresses validation icon while loading", () => {
    const { getByTestId, queryByTestId } = render(TextField, {
      props: {
        label: "Name",
        validationState: "valid",
        isLoading: true,
        loadingIndicator: h("span", { "data-testid": "textfield-loading" }, "Loading"),
      },
    });

    expect(getByTestId("textfield-loading")).toBeTruthy();
    expect(queryByTestId("textfield-valid-icon")).toBeNull();
  });

  it("passes through ARIA and data attributes to the input", () => {
    const { getByRole } = render(TextField, {
      props: {
        label: "Name",
        "data-testid": "name-input",
        "aria-activedescendant": "item-1",
        "aria-autocomplete": "list",
        "aria-haspopup": "menu",
      } as Record<string, unknown>,
    });

    const input = getByRole("textbox");
    expect(input.getAttribute("data-testid")).toBe("name-input");
    expect(input.getAttribute("aria-activedescendant")).toBe("item-1");
    expect(input.getAttribute("aria-autocomplete")).toBe("list");
    expect(input.getAttribute("aria-haspopup")).toBe("menu");
  });

  it("supports excludeFromTabOrder", () => {
    const { getByRole } = render(TextField, {
      props: {
        label: "Name",
        excludeFromTabOrder: true,
      },
    });

    const input = getByRole("textbox");
    expect(input.getAttribute("tabindex")).toBe("-1");
  });

  it("supports form reset with controlled value", async () => {
    const user = userEvent.setup();
    const Harness = defineComponent({
      name: "TextFieldFormResetHarness",
      setup() {
        const value = ref("Devon");
        return () =>
          h("form", null, [
            h(TextField, {
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
    const input = getByTestId("name") as HTMLInputElement;
    expect(input.value).toBe("Devon");

    await user.click(input);
    await user.keyboard("[ArrowRight] test");
    expect(input.value).toBe("Devon test");

    await user.click(getByTestId("reset"));
    expect(input.value).toBe("Devon");
  });

  it("shows form validationErrors message when field name matches", () => {
    const App = defineComponent({
      name: "TextFieldFormValidationHarness",
      setup() {
        return () =>
          h(
            Form,
            {
              validationErrors: {
                username: "Invalid username.",
              },
            },
            {
              default: () =>
                h(TextField, {
                  label: "Username",
                  name: "username",
                }),
            }
          );
      },
    });
    const tree = renderWithProvider(App);

    const input = tree.getByRole("textbox");
    const message = tree.getByText("Invalid username.");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toContain(
      message.getAttribute("id") ?? ""
    );
  });
});

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

  it("auto-resizes when content grows", async () => {
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
});
