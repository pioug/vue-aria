import { describe, expect, it } from "vitest";
import { theme } from "../src";

describe("@vue-spectrum/theme-express", () => {
  it("extends the default theme with express classes", () => {
    expect(theme.global?.express).toBe("spectrum--express");
    expect(theme.medium?.express).toBe("spectrum--express-medium");
    expect(theme.large?.express).toBe("spectrum--express-large");
    expect(theme.light?.["spectrum--light"]).toBe("spectrum--light");
  });
});
