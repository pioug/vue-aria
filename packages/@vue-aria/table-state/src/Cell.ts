import type { CellProps, TablePartialNode } from "./types";

export function Cell(_props: CellProps): null {
  return null;
}

(Cell as any).getCollectionNode = function* getCollectionNode<T>(
  props: CellProps
): Generator<TablePartialNode<T>> {
  const { children } = props;

  const textValue =
    props.textValue
    || (typeof children === "string" ? children : "")
    || props["aria-label"]
    || "";
  yield {
    type: "cell",
    props: props as unknown as Record<string, unknown>,
    rendered: children,
    textValue,
    "aria-label": props["aria-label"],
    hasChildNodes: false,
  };
};
