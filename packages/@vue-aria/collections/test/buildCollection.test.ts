import { describe, expect, it } from "vitest";
import { buildCollection } from "../src";

describe("buildCollection", () => {
  it("builds flat key order across items and sections", () => {
    const collection = buildCollection([
      { key: "overview", textValue: "Overview" },
      {
        type: "section",
        key: "admin",
        heading: "Admin",
        children: [
          { key: "users", textValue: "Users" },
          { key: "teams", textValue: "Teams" },
        ],
      },
      { key: "settings", textValue: "Settings" },
    ]);

    expect(collection.getFirstKey()).toBe("overview");
    expect(collection.getLastKey()).toBe("settings");
    expect(collection.getKeyAfter("overview")).toBe("users");
    expect(collection.getKeyAfter("users")).toBe("teams");
    expect(collection.getKeyAfter("teams")).toBe("settings");
    expect(collection.getKeyBefore("settings")).toBe("teams");

    expect(collection.getSection("admin")?.heading).toBe("Admin");
    expect(collection.getItem("users")?.textValue).toBe("Users");
  });

  it("normalizes text values when missing", () => {
    const collection = buildCollection([
      { key: "a", value: "Apple" },
      { key: "b" },
    ]);

    expect(collection.getItem("a")?.textValue).toBe("Apple");
    expect(collection.getItem("b")?.textValue).toBe("b");
  });

  it("throws on duplicate keys", () => {
    expect(() =>
      buildCollection([
        { key: "a", textValue: "One" },
        { key: "a", textValue: "Two" },
      ])
    ).toThrow("Duplicate collection key: a");
  });
});
