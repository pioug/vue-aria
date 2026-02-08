import { describe, expect, it } from "vitest";
import { useErrorMessage } from "../src/useErrorMessage";

describe("useErrorMessage", () => {
  it("returns undefined id when no error message is provided", () => {
    const { errorMessageProps, errorMessageId } = useErrorMessage();

    expect(errorMessageId.value).toBeUndefined();
    expect(errorMessageProps.value.id).toBeUndefined();
  });

  it("returns an id when an error message is provided", () => {
    const { errorMessageProps, errorMessageId } = useErrorMessage({
      errorMessage: "This field is required",
    });

    expect(errorMessageId.value).toBeDefined();
    expect(errorMessageProps.value.id).toBe(errorMessageId.value);
  });

  it("treats explicit isInvalid as invalid", () => {
    const { isInvalid } = useErrorMessage({
      errorMessage: "This field is required",
      isInvalid: true,
    });

    expect(isInvalid.value).toBe(true);
  });

  it("treats validationState='invalid' as invalid", () => {
    const { isInvalid } = useErrorMessage({
      errorMessage: "This field is required",
      validationState: "invalid",
    });

    expect(isInvalid.value).toBe(true);
  });
});
