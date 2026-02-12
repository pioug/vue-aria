import { fireEvent, render } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { provideI18n } from "@vue-aria/i18n";
import { Form } from "@vue-spectrum/form";
import {
  DEFAULT_SPECTRUM_THEME_CLASS_MAP,
  provideSpectrumProvider,
} from "@vue-spectrum/provider";
import { TextField } from "../src";

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

  it("passes through aria-errormessage when invalid", () => {
    const { getByRole } = render(TextField, {
      props: {
        label: "Name",
        validationState: "invalid",
        "aria-errormessage": "name-error",
      } as Record<string, unknown>,
    });

    const input = getByRole("textbox");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-errormessage")).toBe("name-error");
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

  it("shows native required error after form validity check and clears on blur once valid", async () => {
    const Harness = defineComponent({
      name: "TextFieldNativeRequiredHarness",
      setup() {
        return () =>
          h("form", { "data-testid": "form" }, [
            h(TextField, {
              label: "Name",
              isRequired: true,
              validationBehavior: "native",
            }),
          ]);
      },
    });

    const { getByRole, getByTestId } = render(Harness);
    const input = getByRole("textbox") as HTMLInputElement;
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
      name: "TextFieldNativeCustomMessageHarness",
      setup() {
        return () =>
          h("form", { "data-testid": "form" }, [
            h(TextField, {
              label: "Name",
              isRequired: true,
              validationBehavior: "native",
              errorMessage: (context) =>
                (
                  context.validationDetails as
                    | { valueMissing?: boolean }
                    | undefined
                )?.valueMissing
                  ? "Please enter a name"
                  : null,
            }),
          ]);
      },
    });

    const { getByRole, getByTestId, getByText } = render(Harness);
    const input = getByRole("textbox") as HTMLInputElement;
    const form = getByTestId("form") as HTMLFormElement;

    expect(form.checkValidity()).toBe(false);
    await nextTick();

    expect(getByText("Please enter a name")).toBeTruthy();
    expect(input.getAttribute("aria-describedby")).toBeTruthy();
  });

  it("supports native server validation from Form.validationErrors", async () => {
    const user = userEvent.setup();
    const Harness = defineComponent({
      name: "TextFieldNativeServerValidationHarness",
      setup() {
        const serverErrors = ref<Record<string, string>>({});
        return () =>
          h(
            Form,
            {
              validationBehavior: "native",
              validationErrors: serverErrors.value,
              onSubmit: (event: Event) => {
                event.preventDefault();
                serverErrors.value = {
                  name: "Invalid name.",
                };
              },
            } as Record<string, unknown>,
            {
              default: () => [
                h(TextField, {
                  label: "Name",
                  name: "name",
                  "data-testid": "name-input",
                }),
                h(
                  "button",
                  {
                    type: "submit",
                  },
                  "Submit"
                ),
              ],
            }
          );
      },
    });

    const tree = renderWithProvider(Harness);
    const input = tree.getByTestId("name-input") as HTMLInputElement;
    const submit = tree.getByRole("button", { name: "Submit" });

    expect(input.getAttribute("aria-describedby")).toBeNull();
    expect(input.validity.valid).toBe(true);

    await user.click(submit);
    await nextTick();

    expect(tree.getByText("Invalid name.")).toBeTruthy();
    expect(input.getAttribute("aria-describedby")).toBeTruthy();
    expect(input.validity.valid).toBe(false);

    await user.click(submit);
    await nextTick();
    expect(tree.getByText("Invalid name.")).toBeTruthy();
    expect(input.validity.valid).toBe(false);

    await fireEvent.update(input, "Devon");
    await nextTick();
    expect(input.validity.valid).toBe(true);
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
    expect(validIcon.getAttribute("aria-label")).toBe("Valid");
    expect(validInput.getAttribute("aria-describedby")).toContain(validIconId ?? "");
    validTree.unmount();

    const invalidTree = render(TextField, {
      props: {
        label: "Name",
        validationState: "invalid",
      },
    });

    const invalidIcon = invalidTree.getByTestId("textfield-invalid-icon");
    expect(invalidIcon).toBeTruthy();
    expect(invalidIcon.getAttribute("aria-hidden")).toBe("true");
    expect(invalidIcon.getAttribute("aria-label")).toBeNull();
  });

  it("localizes valid icon aria label from i18n locale", () => {
    const App = defineComponent({
      name: "TextFieldValidLocalizedHarness",
      setup() {
        provideI18n({ locale: "fr-FR" });

        return () =>
          h(TextField, {
            label: "Name",
            validationState: "valid",
          });
      },
    });

    const tree = render(App);
    expect(tree.getByTestId("textfield-valid-icon").getAttribute("aria-label")).toBe(
      "Valide"
    );
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

  it("switches between description and error message based on validity", async () => {
    const App = defineComponent({
      name: "TextFieldValidationMessageHarness",
      setup() {
        const value = ref("0");
        return () =>
          h(TextField, {
            "data-testid": "favorite-number",
            label: "Favorite number",
            value: value.value,
            onChange: (nextValue: string) => {
              value.value = nextValue;
            },
            maxLength: 1,
            validationState: /^\d$/.test(value.value) ? "valid" : "invalid",
            description: "Enter a single digit number.",
            errorMessage:
              value.value === ""
                ? "Empty input not allowed."
                : "Single digit numbers are 0-9.",
          });
      },
    });
    const tree = render(App);
    const input = tree.getByTestId("favorite-number") as HTMLInputElement;

    const description = tree.getByText("Enter a single digit number.");
    const validIcon = tree.getByTestId("textfield-valid-icon");
    expect(input.getAttribute("aria-describedby")).toContain(
      description.getAttribute("id") ?? ""
    );
    expect(input.getAttribute("aria-describedby")).toContain(
      validIcon.getAttribute("id") ?? ""
    );

    await fireEvent.update(input, "s");
    const invalidMessage = tree.getByText("Single digit numbers are 0-9.");
    expect(input.getAttribute("aria-describedby")).toContain(
      invalidMessage.getAttribute("id") ?? ""
    );
    expect(tree.queryByTestId("textfield-valid-icon")).toBeNull();

    await fireEvent.update(input, "");
    const emptyMessage = tree.getByText("Empty input not allowed.");
    expect(input.getAttribute("aria-describedby")).toContain(
      emptyMessage.getAttribute("id") ?? ""
    );

    await fireEvent.update(input, "4");
    expect(tree.getByText("Enter a single digit number.")).toBeTruthy();
    expect(tree.getByTestId("textfield-valid-icon")).toBeTruthy();
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

  it("clears form validationErrors message when the field value changes", async () => {
    const App = defineComponent({
      name: "TextFieldFormValidationClearHarness",
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

    const input = tree.getByRole("textbox") as HTMLInputElement;
    expect(tree.getByText("Invalid username.")).toBeTruthy();
    expect(input.getAttribute("aria-invalid")).toBe("true");

    await fireEvent.update(input, "devon");
    await nextTick();

    expect(tree.queryByText("Invalid username.")).toBeNull();
    expect(input.getAttribute("aria-invalid")).not.toBe("true");
  });

  it("supports validate function in aria behavior", async () => {
    const tree = render(TextField, {
      props: {
        label: "Name",
        defaultValue: "Foo",
        validate: (value: string) => (value === "Foo" ? "Invalid name" : null),
      },
    });

    const input = tree.getByRole("textbox") as HTMLInputElement;
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(tree.getByText("Invalid name")).toBeTruthy();

    await fireEvent.update(input, "Devon");
    await nextTick();

    expect(input.getAttribute("aria-invalid")).not.toBe("true");
    expect(tree.queryByText("Invalid name")).toBeNull();
  });

  it("supports validate function in native behavior", async () => {
    const tree = render(TextField, {
      props: {
        label: "Name",
        defaultValue: "Foo",
        validationBehavior: "native",
        validate: (value: string) => (value === "Foo" ? "Invalid name" : null),
      },
    });

    const input = tree.getByRole("textbox") as HTMLInputElement;
    expect(input.validity.valid).toBe(false);
    expect(input.getAttribute("aria-invalid")).not.toBe("true");

    await fireEvent.update(input, "Devon");
    await nextTick();

    expect(input.validity.valid).toBe(true);
    expect(tree.queryByText("Invalid name")).toBeNull();
  });
});
