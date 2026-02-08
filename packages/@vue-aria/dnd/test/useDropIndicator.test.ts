import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import {
  beginDragging,
  endDragging,
  getRegisteredDropItems,
} from "../src/DragManager";
import { useDropIndicator, type DropIndicatorState } from "../src/useDropIndicator";
import type { CollectionNode, DropOperation, DropTarget } from "../src/types";
import {
  registerDroppableCollection,
  setGlobalDnDState,
} from "../src/utils";

const ROOT_TARGET: DropTarget = { type: "root" };

function createCollection(nodes: CollectionNode[]): DropIndicatorState["collection"] {
  const map = new Map(nodes.map((node) => [node.key, node]));

  return {
    getItem: (key) => map.get(key) ?? null,
    getKeyAfter: (key) => map.get(key)?.nextKey ?? null,
    getKeyBefore: (key) => map.get(key)?.prevKey ?? null,
    [Symbol.iterator]: () => map.values(),
  };
}

function createNode(node: Partial<CollectionNode> & { key: string; textValue: string }): CollectionNode {
  const { key, textValue, ...rest } = node;
  return {
    type: "item",
    key,
    value: null,
    level: 0,
    hasChildNodes: false,
    childNodes: [],
    rendered: textValue,
    textValue,
    index: 0,
    parentKey: null,
    nextKey: null,
    prevKey: null,
    ...rest,
  };
}

function createState(
  target: DropTarget,
  overrides: Partial<DropIndicatorState> = {}
): DropIndicatorState {
  return {
    collection: createCollection([
      createNode({ key: "a", textValue: "Alpha", nextKey: "b" }),
      createNode({ key: "b", textValue: "Beta", prevKey: "a", nextKey: "c" }),
      createNode({ key: "c", textValue: "Gamma", prevKey: "b" }),
    ]),
    getDropOperation: vi.fn((): DropOperation => "copy"),
    isDropTarget: vi.fn((nextTarget) => nextTarget === target),
    ...overrides,
  };
}

describe("useDropIndicator", () => {
  afterEach(() => {
    endDragging();
    (getRegisteredDropItems() as Map<HTMLElement, unknown>).clear();
    setGlobalDnDState({
      draggingCollectionRef: null,
      draggingKeys: new Set(),
      dropCollectionRef: null,
    });
  });

  it("returns root drop label and links to collection id", async () => {
    const collectionElement = document.createElement("div");
    collectionElement.id = "listbox-id";
    const indicatorElement = document.createElement("div");
    const state = createState(ROOT_TARGET, {
      isDropTarget: vi.fn(() => false),
    });

    registerDroppableCollection(state, collectionElement.id, ref(collectionElement));

    let result: ReturnType<typeof useDropIndicator> | undefined;
    const scope = effectScope();
    scope.run(() => {
      result = useDropIndicator({ target: ROOT_TARGET }, state, ref(indicatorElement));
    });

    await nextTick();

    expect(result?.dropIndicatorProps.value["aria-label"]).toBe("Drop on");
    expect(result?.dropIndicatorProps.value["aria-labelledby"]).toContain(
      collectionElement.id
    );
    expect(result?.dropIndicatorProps.value["aria-hidden"]).toBe("true");
    expect(result?.isHidden.value).toBe(true);

    scope.stop();
  });

  it("formats item labels for on and between positions", async () => {
    const collectionElement = document.createElement("div");
    const onTarget: DropTarget = { type: "item", key: "b", dropPosition: "on" };
    const betweenTarget: DropTarget = {
      type: "item",
      key: "b",
      dropPosition: "before",
    };

    const onState = createState(onTarget, {
      isDropTarget: vi.fn(() => false),
    });
    const betweenState = createState(betweenTarget, {
      isDropTarget: vi.fn(() => false),
    });

    registerDroppableCollection(onState, "collection-1", ref(collectionElement));
    registerDroppableCollection(betweenState, "collection-1", ref(collectionElement));

    let onResult: ReturnType<typeof useDropIndicator> | undefined;
    let betweenResult: ReturnType<typeof useDropIndicator> | undefined;

    const scope = effectScope();
    scope.run(() => {
      onResult = useDropIndicator({ target: onTarget }, onState, ref(document.createElement("div")));
      betweenResult = useDropIndicator(
        { target: betweenTarget },
        betweenState,
        ref(document.createElement("div"))
      );
    });

    await nextTick();

    expect(onResult?.dropIndicatorProps.value["aria-label"]).toBe("Drop on Beta");
    expect(betweenResult?.dropIndicatorProps.value["aria-label"]).toBe(
      "Insert between Alpha and Beta"
    );

    scope.stop();
  });

  it("is visible when current drop target is active during drag", async () => {
    const collectionElement = document.createElement("div");
    const state = createState(ROOT_TARGET, {
      isDropTarget: vi.fn(() => true),
    });

    registerDroppableCollection(state, "collection-2", ref(collectionElement));
    beginDragging({});

    let result: ReturnType<typeof useDropIndicator> | undefined;
    const scope = effectScope();
    scope.run(() => {
      result = useDropIndicator({ target: ROOT_TARGET }, state, ref(document.createElement("div")));
    });

    await nextTick();

    expect(result?.isDropTarget.value).toBe(true);
    expect(result?.dropIndicatorProps.value["aria-hidden"]).toBeUndefined();
    expect(result?.isHidden.value).toBe(false);

    scope.stop();
  });
});
