import { describe, it } from "vitest";
import { tableTests } from "./TableTests";

describe("TableView", () => {
  tableTests();

  it("success", () => {
    // Kept to mirror upstream test-file shape where table tests may be conditionally skipped.
  });
});
