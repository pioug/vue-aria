import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import {
  beginDragging,
  endDragging,
  getRegisteredDropItems,
} from "../src/DragManager";
import {
  useDroppableItem,
  type DroppableItemState,
} from "../src/useDroppableItem";
import type { DropOperation } from "../src/types";
import {
  registerDroppableCollection,
  setGlobalDnDState,
} from "../src/utils";

const ROOT_TARGET = { type: "root" } as const;

function createState(overrides: Partial<DroppableItemState> = {}): DroppableItemState {
  return {
    getDropOperation: vi.fn((): DropOperation => "copy"),
    isDropTarget: vi.fn(() => false),
    ...overrides,
  };
}

describe("useDroppableItem", () => {
  afterEach(() => {
    endDragging();
    (getRegisteredDropItems() as Map<HTMLElement, unknown>).clear();
    setGlobalDnDState({
      draggingCollectionRef: null,
      draggingKeys: new Set(),
      dropCollectionRef: null,
    });
  });

  it("registers and unregisters droppable items", async () => {
    const collectionElement = document.createElement("div");
    const itemElement = document.createElement("div");
    const itemRef = ref(itemElement);
    const state = createState();

    registerDroppableCollection(state, "collection-id", ref(collectionElement));

    const scope = effectScope();
    scope.run(() => {
      useDroppableItem(
        {
          target: ROOT_TARGET,
        },
        state,
        itemRef
      );
    });

    await nextTick();
    expect(getRegisteredDropItems().get(itemElement)).toEqual({
      element: itemElement,
      target: ROOT_TARGET,
      getDropOperation: expect.any(Function),
      activateButtonRef: undefined,
    });

    const getDropOperation = getRegisteredDropItems().get(itemElement)?.getDropOperation;
    expect(getDropOperation?.(new Set(["text/plain"]), ["copy"])).toBe("copy");
    expect(state.getDropOperation).toHaveBeenCalledWith({
      target: ROOT_TARGET,
      types: new Set(["text/plain"]),
      allowedOperations: ["copy"],
      isInternal: false,
      draggingKeys: new Set(),
    });

    scope.stop();
    await nextTick();
    expect(getRegisteredDropItems().has(itemElement)).toBe(false);
  });

  it("hides invalid drop targets during virtual drag", async () => {
    const collectionElement = document.createElement("div");
    const itemElement = document.createElement("div");
    const state = createState({
      getDropOperation: vi.fn((): DropOperation => "cancel"),
    });

    registerDroppableCollection(state, "collection-id", ref(collectionElement));
    beginDragging({
      dragTarget: {
        items: [{ "text/plain": "foo" }],
        allowedDropOperations: ["copy"],
      },
    });

    let result: ReturnType<typeof useDroppableItem> | undefined;
    const scope = effectScope();
    scope.run(() => {
      result = useDroppableItem(
        {
          target: ROOT_TARGET,
        },
        state,
        ref(itemElement)
      );
    });

    await nextTick();
    expect(result?.dropProps.value["aria-hidden"]).toBe("true");
    scope.stop();
  });

  it("focuses active drop targets during virtual drag", async () => {
    const collectionElement = document.createElement("div");
    const itemElement = document.createElement("div");
    itemElement.tabIndex = -1;
    document.body.appendChild(itemElement);

    const active = ref(false);
    const state = createState({
      isDropTarget: vi.fn(() => active.value),
    });

    registerDroppableCollection(state, "collection-id", ref(collectionElement));
    beginDragging({ dragTarget: { items: [], allowedDropOperations: ["move"] } });

    const scope = effectScope();
    scope.run(() => {
      useDroppableItem(
        {
          target: ROOT_TARGET,
        },
        state,
        ref(itemElement)
      );
    });

    active.value = true;
    await nextTick();
    expect(document.activeElement).toBe(itemElement);

    scope.stop();
    itemElement.remove();
  });
});
