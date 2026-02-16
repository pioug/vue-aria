import { describe, expect, it } from "vitest";
import { theme } from "../src";

describe("Theme default", () => {
  it("exports the default theme object", () => {
    expect(theme).toMatchObject({
      global: expect.objectContaining({
        spectrum: "spectrum",
      }),
    });
  });
});
