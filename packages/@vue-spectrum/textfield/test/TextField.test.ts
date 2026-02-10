import { fireEvent, render } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import { TextArea, TextField } from "../src";

describe("TextField", () => {
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
});

describe("TextArea", () => {
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
});
