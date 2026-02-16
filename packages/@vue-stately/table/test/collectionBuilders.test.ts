import { describe, expect, it } from "vitest";
import {
  Cell,
  Column,
  Row,
  TableBody,
  TableHeader,
  type CollectionBuilderContext,
} from "../src";

function createContext(): CollectionBuilderContext<unknown> {
  return {
    showSelectionCheckboxes: false,
    showDragButtons: false,
    selectionMode: "none",
    columns: [],
  };
}

describe("table-state collection builders", () => {
  it("TableHeader yields dynamic column nodes", () => {
    const context = createContext();
    const renderer = (column: { key: string }) => ({ column });

    const nodes = Array.from(
      (TableHeader as any).getCollectionNode(
        {
          columns: [{ key: "name" }, { key: "type" }],
          children: renderer,
        },
        context
      )
    );

    expect(nodes).toStrictEqual([
      { type: "column", value: { key: "name" }, renderer },
      { type: "column", value: { key: "type" }, renderer },
    ]);
  });

  it("TableHeader throws when children renderer has no columns", () => {
    const context = createContext();

    expect(() =>
      Array.from(
        (TableHeader as any).getCollectionNode(
          {
            children: () => null,
          },
          context
        )
      )
    ).toThrowError("props.children was a function but props.columns is missing");
  });

  it("TableBody yields body node with dynamic row nodes", () => {
    const renderer = (item: { id: number }) => ({ item });
    const generator = (TableBody as any).getCollectionNode({
      items: [{ id: 1 }, { id: 2 }],
      children: renderer,
    });
    const bodyNode = generator.next().value;

    expect(bodyNode.type).toBe("body");
    expect(Array.from(bodyNode.childNodes())).toStrictEqual([
      { type: "item", value: { id: 1 }, renderer },
      { type: "item", value: { id: 2 }, renderer },
    ]);
  });

  it("Column updates context with leaf nodes", () => {
    const context = createContext();
    const generator = (Column as any).getCollectionNode(
      {
        title: "Group",
        children: [{ label: "Name" }],
      },
      context
    );
    generator.next();
    generator.next([
      { key: "name", hasChildNodes: false },
      { key: "group", hasChildNodes: true },
    ]);

    expect(context.columns.map((column) => column.key)).toStrictEqual(["name"]);
  });

  it("Row yields selection/drag cells before dynamic cells and child rows", () => {
    const context = createContext();
    context.showSelectionCheckboxes = true;
    context.showDragButtons = true;
    context.selectionMode = "multiple";
    context.columns = [{ key: "name" }, { key: "type" }] as any;

    const renderer = (columnKey: string) => ({ key: columnKey });
    const generator = (Row as any).getCollectionNode(
      {
        children: renderer,
        UNSTABLE_childItems: [{ id: "child-row" }],
      },
      context
    );
    const rowNode = generator.next().value;
    const childNodes = Array.from(rowNode.childNodes());

    expect(childNodes).toStrictEqual([
      { type: "cell", key: "header-drag", props: { isDragButtonCell: true } },
      { type: "cell", key: "header", props: { isSelectionCell: true } },
      { type: "cell", element: { key: "name" }, key: "name" },
      { type: "cell", element: { key: "type" }, key: "type" },
      { type: "item", value: { id: "child-row" } },
    ]);
  });

  it("Row static children throw when colSpan count does not match columns", () => {
    const context = createContext();
    context.columns = [{ key: "name" }, { key: "type" }] as any;

    const generator = (Row as any).getCollectionNode(
      {
        children: [{ props: { colSpan: 1 } }],
      },
      context
    );
    const rowNode = generator.next().value;

    expect(() => Array.from(rowNode.childNodes())).toThrowError(
      "Cell count must match column count. Found 1 cells and 2 columns."
    );
  });

  it("Cell derives textValue from string children", () => {
    const generator = (Cell as any).getCollectionNode({
      children: "Pikachu",
    });
    const cellNode = generator.next().value;

    expect(cellNode).toMatchObject({
      type: "cell",
      rendered: "Pikachu",
      textValue: "Pikachu",
      hasChildNodes: false,
    });
  });
});
