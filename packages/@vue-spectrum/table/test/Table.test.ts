import { describe, it } from "vitest";
import { tableTests } from "./TableTests";

describe("TableView", () => {
  tableTests();

  it("success", () => {
    // Mirrors upstream file shape where table tests can be conditionally skipped.
  });
});
