import type { DragItem } from "./types";

export interface DragPreviewRenderResult {
  element: HTMLElement;
  x: number;
  y: number;
}

export type DragPreviewTemplateResult =
  | HTMLElement
  | DragPreviewRenderResult
  | null;

export type DragPreviewTemplate = (items: DragItem[]) => DragPreviewTemplateResult;

export type DragPreviewRenderer = (
  items: DragItem[],
  callback: (node: HTMLElement | null, x?: number, y?: number) => void
) => void;

export function createDragPreviewRenderer(
  render: DragPreviewTemplate
): DragPreviewRenderer {
  return (items, callback) => {
    const result = render(items);
    if (result == null) {
      callback(null);
      return;
    }

    if (result instanceof HTMLElement) {
      callback(result);
      return;
    }

    callback(result.element, result.x, result.y);
  };
}
