import { describe, expect, it } from "vitest";
import { Content, Footer, Header, View } from "../src";

describe("View", () => {
  it("re-exports layout components", () => {
    expect(typeof View).toBe("function");
    expect(typeof Content).toBe("function");
    expect(typeof Footer).toBe("function");
    expect(typeof Header).toBe("function");
  });
});
