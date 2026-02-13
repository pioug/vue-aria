import { describe, expect, it, vi } from "vitest";
import {
  getCollectionId,
  getItemElement,
  isNonContiguousSelectionModifier,
  useCollectionId,
} from "../src/utils";
import * as utilsModule from "@vue-aria/utils";

describe("selection utils", () => {
  it("getItemElement finds element scoped by data-key", () => {
    const container = document.createElement("div");
    const item = document.createElement("div");
    item.dataset.key = "abc";
    container.appendChild(item);

    const result = getItemElement({ current: container }, "abc");
    expect(result).toBe(item);
  });

  it("getItemElement honors data-collection scoping", () => {
    const root = document.createElement("div");
    root.dataset.collection = "a";

    const itemA = document.createElement("div");
    itemA.dataset.collection = "a";
    itemA.dataset.key = "1";

    const itemB = document.createElement("div");
    itemB.dataset.collection = "b";
    itemB.dataset.key = "1";

    root.append(itemA, itemB);

    expect(getItemElement({ current: root }, "1")).toBe(itemA);

    root.dataset.collection = "b";
    expect(getItemElement({ current: root }, "1")).toBe(itemB);
  });

  it("maps collection ids via useCollectionId/getCollectionId", () => {
    const collection = {};
    const useIdSpy = vi.spyOn(utilsModule, "useId").mockReturnValue("collection-id");

    const id = useCollectionId(collection);

    expect(id).toBe("collection-id");
    expect(getCollectionId(collection)).toBe("collection-id");

    useIdSpy.mockRestore();
  });

  it("uses platform modifier for non-contiguous selection", () => {
    const isAppleSpy = vi.spyOn(utilsModule, "isAppleDevice").mockReturnValue(true);

    expect(
      isNonContiguousSelectionModifier({ altKey: true, ctrlKey: false, metaKey: false })
    ).toBe(true);

    isAppleSpy.mockReturnValue(false);
    expect(
      isNonContiguousSelectionModifier({ altKey: false, ctrlKey: true, metaKey: false })
    ).toBe(true);

    isAppleSpy.mockRestore();
  });
});
