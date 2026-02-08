import { beforeEach, describe, expect, it } from "vitest";
import { ref, toValue } from "vue";
import { useDraggableCollection } from "../src/useDraggableCollection";
import { globalDndState, setGlobalDnDState } from "../src/utils";

describe("useDraggableCollection", () => {
  beforeEach(() => {
    setGlobalDnDState({ draggingCollectionRef: null });
  });

  it("sets the dragging collection reference when keys are dragging", () => {
    const element = document.createElement("div");
    const collectionRef = ref(element);

    useDraggableCollection(
      {},
      {
        draggingKeys: new Set(["item-1"]),
      },
      collectionRef
    );

    expect(toValue(globalDndState.draggingCollectionRef)).toBe(element);
  });

  it("does not set dragging collection reference when no keys are dragging", () => {
    const element = document.createElement("div");
    const collectionRef = ref(element);

    useDraggableCollection(
      {},
      {
        draggingKeys: new Set(),
      },
      collectionRef
    );

    expect(globalDndState.draggingCollectionRef).toBeNull();
  });

  it("updates the tracked reference when dragging moves to another collection", () => {
    const first = document.createElement("div");
    const second = document.createElement("div");

    useDraggableCollection(
      {},
      {
        draggingKeys: new Set(["item-1"]),
      },
      ref(first)
    );

    expect(toValue(globalDndState.draggingCollectionRef)).toBe(first);

    useDraggableCollection(
      {},
      {
        draggingKeys: new Set(["item-2"]),
      },
      ref(second)
    );

    expect(toValue(globalDndState.draggingCollectionRef)).toBe(second);
  });
});
