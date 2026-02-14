import { effectScope, nextTick, ref } from "vue";
import { describe, expect, it } from "vitest";
import type { Key } from "@vue-aria/selection-state";
import type { Node } from "@vue-aria/collections";
import { TreeCollection } from "../src/TreeCollection";
import { useTreeState } from "../src/useTreeState";

function createItemNode(
  key: Key,
  textValue: string,
  children: Node<object>[] = []
): Node<object> {
  const node: Node<object> = {
    type: "item",
    key,
    value: null,
    level: 0,
    hasChildNodes: children.length > 0,
    rendered: textValue,
    textValue,
    index: 0,
    parentKey: null,
    prevKey: null,
    nextKey: null,
    firstChildKey: children[0]?.key ?? null,
    lastChildKey: children[children.length - 1]?.key ?? null,
    props: {},
    colSpan: null,
    colIndex: null,
    childNodes: children,
  };

  children.forEach((child, index) => {
    (child as any).parentKey = key;
    (child as any).index = index;
    (child as any).level = 1;
  });

  return node;
}

function createTreeNodes(includeBear = true): Node<object>[] {
  const childNodes = [
    createItemNode("aardvark", "Aardvark"),
    ...(includeBear ? [createItemNode("bear", "Bear")] : []),
  ];

  return [
    createItemNode("animals", "Animals", childNodes),
    createItemNode("plants", "Plants"),
  ];
}

describe("TreeCollection", () => {
  it("flattens visible nodes based on expanded keys", () => {
    const nodes = createTreeNodes();
    const collapsed = new TreeCollection(nodes);
    const expanded = new TreeCollection(nodes, {
      expandedKeys: new Set<Key>(["animals"]),
    });

    expect([...collapsed.getKeys()]).toEqual(["animals", "plants"]);
    expect([...expanded.getKeys()]).toEqual([
      "animals",
      "aardvark",
      "bear",
      "plants",
    ]);
  });
});

describe("useTreeState", () => {
  it("toggles expanded keys and exposes a selection manager", () => {
    const scope = effectScope();
    let state!: ReturnType<typeof useTreeState<object>>;
    scope.run(() => {
      state = useTreeState({
        collection: createTreeNodes(),
        selectionMode: "multiple",
        defaultExpandedKeys: ["animals"],
      });
    });

    expect(state.expandedKeys.has("animals")).toBe(true);
    state.toggleKey("animals");
    expect(state.expandedKeys.has("animals")).toBe(false);
    state.toggleKey("animals");
    expect(state.expandedKeys.has("animals")).toBe(true);
    expect(state.selectionManager.selectionMode).toBe("multiple");

    scope.stop();
  });

  it("clears focused key when focused item is removed from the collection", async () => {
    const nodesRef = ref<Iterable<Node<object>>>(createTreeNodes(true));
    const scope = effectScope();
    let state!: ReturnType<typeof useTreeState<object>>;
    scope.run(() => {
      state = useTreeState({
        selectionMode: "multiple",
        get collection() {
          return nodesRef.value;
        },
        defaultExpandedKeys: ["animals"],
      } as any);
    });

    state.selectionManager.setFocusedKey("bear");
    expect(state.selectionManager.focusedKey).toBe("bear");

    nodesRef.value = createTreeNodes(false);
    await nextTick();

    expect(state.selectionManager.focusedKey).toBeNull();

    scope.stop();
  });

  it("builds nested nodes from items/getChildren callbacks", () => {
    interface RawNode {
      id: string;
      label: string;
      children?: RawNode[];
    }

    const items: RawNode[] = [
      {
        id: "animals",
        label: "Animals",
        children: [
          { id: "aardvark", label: "Aardvark" },
          { id: "bear", label: "Bear" },
        ],
      },
      {
        id: "plants",
        label: "Plants",
      },
    ];

    const scope = effectScope();
    let state!: ReturnType<typeof useTreeState<RawNode>>;
    scope.run(() => {
      state = useTreeState({
        items,
        getKey: (item) => item.id,
        getTextValue: (item) => item.label,
        getChildren: (item) => item.children,
        defaultExpandedKeys: ["animals"],
      });
    });

    expect([...state.collection.getKeys()]).toEqual([
      "animals",
      "aardvark",
      "bear",
      "plants",
    ]);
    expect(state.collection.getItem("bear")?.parentKey).toBe("animals");

    scope.stop();
  });

  it("generates fallback nested keys for item data without explicit key extractors", () => {
    interface RawNode {
      label: string;
      children?: RawNode[];
    }

    const items: RawNode[] = [
      {
        label: "Parent",
        children: [{ label: "Child" }],
      },
    ];

    const scope = effectScope();
    let state!: ReturnType<typeof useTreeState<RawNode>>;
    scope.run(() => {
      state = useTreeState({
        items,
        getChildren: (item) => item.children,
        defaultExpandedKeys: [0],
      });
    });

    expect([...state.collection.getKeys()]).toEqual([0, "0.0"]);
    expect(state.collection.getItem("0.0")?.parentKey).toBe(0);

    scope.stop();
  });
});
