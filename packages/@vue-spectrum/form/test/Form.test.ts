import { describe, expect, it } from "vitest";
import { useFormValidation } from "../src";

describe("Form", () => {
  it("re-exports form validation hook", () => {
    expect(typeof useFormValidation).toBe("function");
  });
});
