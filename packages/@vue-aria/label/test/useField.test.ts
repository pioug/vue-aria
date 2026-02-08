import { describe, expect, it } from "vitest";
import { useField } from "../src/useField";

describe("useField", () => {
  it("returns label props", () => {
    const { labelProps, fieldProps } = useField({ label: "Test" });
    expect(labelProps.value.id).toBeDefined();
    expect(fieldProps.value.id).toBeDefined();
  });

  it("returns ids for description and error message when provided", () => {
    const { descriptionProps, errorMessageProps } = useField({
      label: "Test",
      description: "Description",
      errorMessage: "Error",
    });

    expect(descriptionProps.value.id).toBeDefined();
    expect(errorMessageProps.value.id).toBeDefined();
  });

  it("does not return ids for description and error message when not provided", () => {
    const { descriptionProps, errorMessageProps } = useField({ label: "Test" });

    expect(descriptionProps.value.id).toBeUndefined();
    expect(errorMessageProps.value.id).toBeUndefined();
  });

  it("composes aria-describedby with description, error, and existing values", () => {
    const { fieldProps, descriptionProps, errorMessageProps } = useField({
      label: "Test",
      description: "Helpful text",
      errorMessage: "Validation error",
      isInvalid: true,
      "aria-describedby": "external-desc",
    });

    expect(fieldProps.value["aria-describedby"]).toBe(
      `${descriptionProps.value.id} ${errorMessageProps.value.id} external-desc`
    );
  });

  it("excludes error message id when field is not invalid", () => {
    const { fieldProps, descriptionProps } = useField({
      label: "Test",
      description: "Helpful text",
      errorMessage: "Validation error",
      isInvalid: false,
    });

    expect(fieldProps.value["aria-describedby"]).toBe(`${descriptionProps.value.id}`);
  });

  it("includes error message id when validationState is invalid", () => {
    const { fieldProps, errorMessageProps } = useField({
      label: "Test",
      errorMessage: "Validation error",
      validationState: "invalid",
    });

    expect(fieldProps.value["aria-describedby"]).toBe(`${errorMessageProps.value.id}`);
  });
});
