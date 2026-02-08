import { describe, expect, it } from "vitest";
import { useGridKeyboardDelegate } from "../src";

describe("useGridKeyboardDelegate", () => {
  const collection = [
    { key: "r0c0", rowIndex: 0, colIndex: 0, textValue: "Aardvark" },
    { key: "r0c1", rowIndex: 0, colIndex: 1, textValue: "Ant" },
    { key: "r1c0", rowIndex: 1, colIndex: 0, textValue: "Bear" },
    { key: "r1c1", rowIndex: 1, colIndex: 1, textValue: "Bee", isDisabled: true },
    { key: "r2c0", rowIndex: 2, colIndex: 0, textValue: "Cat" },
    { key: "r2c1", rowIndex: 2, colIndex: 1, textValue: "Cobra" },
  ];

  it("navigates across rows and columns while skipping disabled cells", () => {
    const delegate = useGridKeyboardDelegate({
      collection,
    });

    expect(delegate.getFirstKey?.()).toBe("r0c0");
    expect(delegate.getLastKey?.()).toBe("r2c1");
    expect(delegate.getKeyRightOf?.("r0c0")).toBe("r0c1");
    expect(delegate.getKeyLeftOf?.("r0c1")).toBe("r0c0");
    expect(delegate.getKeyBelow?.("r0c1")).toBe("r2c1");
    expect(delegate.getKeyAbove?.("r2c1")).toBe("r0c1");
  });

  it("supports rtl horizontal navigation", () => {
    const delegate = useGridKeyboardDelegate({
      collection,
      direction: "rtl",
    });

    expect(delegate.getKeyRightOf?.("r0c1")).toBe("r0c0");
    expect(delegate.getKeyLeftOf?.("r0c0")).toBe("r0c1");
  });

  it("supports typeahead search", () => {
    const delegate = useGridKeyboardDelegate({
      collection,
    });

    expect(delegate.getKeyForSearch?.("b")).toBe("r1c0");
    expect(delegate.getKeyForSearch?.("c", "r1c0")).toBe("r2c0");
  });
});
