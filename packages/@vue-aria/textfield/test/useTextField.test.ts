import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useTextField } from "../src/useTextField";

interface TextFieldHandlers {
  onChange?: (event: Event) => void;
}

describe("useTextField", () => {
  it("returns default input props", () => {
    const { inputProps } = useTextField({ "aria-label": "mandatory label" });

    expect(inputProps.value.type).toBe("text");
    expect(inputProps.value.disabled).toBe(false);
    expect(inputProps.value.readOnly).toBe(false);
    expect(inputProps.value["aria-invalid"]).toBeUndefined();
    expect(inputProps.value["aria-required"]).toBeUndefined();
    expect(typeof inputProps.value.onChange).toBe("function");
    expect(inputProps.value.autoFocus).toBe(false);
  });

  it("uses the provided type", () => {
    const { inputProps } = useTextField({
      type: "search",
      "aria-label": "mandatory label",
    });
    expect(inputProps.value.type).toBe("search");
  });

  it("respects disabled state", () => {
    const disabled = useTextField({ isDisabled: true, "aria-label": "mandatory label" });
    expect(disabled.inputProps.value.disabled).toBe(true);

    const enabled = useTextField({
      isDisabled: false,
      "aria-label": "mandatory label",
    });
    expect(enabled.inputProps.value.disabled).toBe(false);
  });

  it("sets aria-required when required in aria mode", () => {
    const required = useTextField({ isRequired: true, "aria-label": "mandatory label" });
    expect(required.inputProps.value["aria-required"]).toBe(true);
    expect(required.inputProps.value.required).toBeUndefined();

    const notRequired = useTextField({
      isRequired: false,
      "aria-label": "mandatory label",
    });
    expect(notRequired.inputProps.value["aria-required"]).toBeUndefined();
  });

  it("sets native required attribute in native validation mode", () => {
    const required = useTextField({
      isRequired: true,
      validationBehavior: "native",
      "aria-label": "mandatory label",
    });

    expect(required.inputProps.value.required).toBe(true);
    expect(required.inputProps.value["aria-required"]).toBeUndefined();
  });

  it("respects read-only state", () => {
    const readOnly = useTextField({
      isReadOnly: true,
      "aria-label": "mandatory label",
    });
    expect(readOnly.inputProps.value.readOnly).toBe(true);

    const writable = useTextField({
      isReadOnly: false,
      "aria-label": "mandatory label",
    });
    expect(writable.inputProps.value.readOnly).toBe(false);
  });

  it("maps validationState to aria-invalid", () => {
    const invalid = useTextField({
      validationState: "invalid",
      "aria-label": "mandatory label",
    });
    expect(invalid.inputProps.value["aria-invalid"]).toBe(true);

    const valid = useTextField({
      validationState: "valid",
      "aria-label": "mandatory label",
    });
    expect(valid.inputProps.value["aria-invalid"]).toBeUndefined();
  });

  it("wires error message id into aria-describedby when invalid", () => {
    const { inputProps, errorMessageProps } = useTextField({
      label: "Email",
      errorMessage: "Email is required",
      validationState: "invalid",
    });

    expect(inputProps.value["aria-invalid"]).toBe(true);
    expect(inputProps.value["aria-describedby"]).toContain(
      String(errorMessageProps.value.id)
    );
  });

  it("forwards autoCapitalize", () => {
    const on = useTextField({ autoCapitalize: "on", "aria-label": "mandatory label" });
    expect(on.inputProps.value.autoCapitalize).toBe("on");

    const off = useTextField({ autoCapitalize: "off", "aria-label": "mandatory label" });
    expect(off.inputProps.value.autoCapitalize).toBe("off");
  });

  it("calls onChange with input value", () => {
    const onChange = vi.fn();
    const { inputProps } = useTextField({
      onChange,
      "aria-label": "mandatory label",
    });
    const handlers = inputProps.value as TextFieldHandlers;

    handlers.onChange?.({ target: { value: "123" } } as unknown as Event);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("123");
    expect(inputProps.value.value).toBe("123");
  });

  it("omits input-only props when using textarea", () => {
    const { inputProps } = useTextField({
      type: "search",
      pattern: "abc",
      inputElementType: "textarea",
      "aria-label": "mandatory label",
    });

    expect(inputProps.value.type).toBeUndefined();
    expect(inputProps.value.pattern).toBeUndefined();
  });

  it("supports textarea value updates", () => {
    const onChange = vi.fn();
    const { inputProps } = useTextField({
      inputElementType: "textarea",
      onChange,
      "aria-label": "Notes",
    });
    const handlers = inputProps.value as TextFieldHandlers;

    handlers.onChange?.({ target: { value: "line 1\nline 2" } } as unknown as Event);

    expect(onChange).toHaveBeenCalledWith("line 1\nline 2");
    expect(inputProps.value.value).toBe("line 1\nline 2");
  });

  it("resets controlled value to initial value on form reset", () => {
    const onChange = vi.fn();
    const form = document.createElement("form");
    const input = document.createElement("input");
    form.append(input);
    document.body.append(form);

    try {
      const value = ref("Devon");
      const { inputProps } = useTextField({
        value,
        inputRef: ref(input),
        onChange: (nextValue) => {
          value.value = nextValue;
          onChange(nextValue);
        },
        "aria-label": "mandatory label",
      });
      const handlers = inputProps.value as TextFieldHandlers;

      handlers.onChange?.({ target: { value: "Devon test" } } as unknown as Event);
      expect(value.value).toBe("Devon test");

      form.dispatchEvent(new Event("reset", { bubbles: true }));
      expect(value.value).toBe("Devon");
      expect(onChange).toHaveBeenLastCalledWith("Devon");
    } finally {
      form.remove();
    }
  });

  it("resets to defaultValue when form resets", () => {
    const onChange = vi.fn();
    const form = document.createElement("form");
    const input = document.createElement("input");
    form.append(input);
    document.body.append(form);

    try {
      const value = ref("Devon");
      const { inputProps } = useTextField({
        value,
        defaultValue: "Ada",
        inputRef: ref(input),
        onChange: (nextValue) => {
          value.value = nextValue;
          onChange(nextValue);
        },
        "aria-label": "mandatory label",
      });
      const handlers = inputProps.value as TextFieldHandlers;

      handlers.onChange?.({ target: { value: "Devon test" } } as unknown as Event);
      expect(value.value).toBe("Devon test");

      form.dispatchEvent(new Event("reset", { bubbles: true }));
      expect(value.value).toBe("Ada");
      expect(onChange).toHaveBeenLastCalledWith("Ada");
    } finally {
      form.remove();
    }
  });
});
