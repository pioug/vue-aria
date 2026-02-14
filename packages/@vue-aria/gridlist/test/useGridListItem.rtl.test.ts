import { computed, effectScope, nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useListState } from "@vue-aria/list-state";

vi.mock("@vue-aria/i18n", async () => {
  const actual = await vi.importActual<typeof import("@vue-aria/i18n")>("@vue-aria/i18n");
  return {
    ...actual,
    useLocale: () => computed(() => ({ locale: "ar-AE", direction: "rtl" as const })),
  };
});

import { useGridList } from "../src/useGridList";
import { useGridListItem } from "../src/useGridListItem";

async function flush() {
  await nextTick();
  await nextTick();
}

describe("useGridListItem RTL interaction parity", () => {
  it("mirrors child focus traversal for ArrowLeft/ArrowRight in RTL", async () => {
    const grid = document.createElement("div");
    const row = document.createElement("div");
    const cell = document.createElement("div");
    const firstButton = document.createElement("button");
    firstButton.textContent = "First";
    const secondButton = document.createElement("button");
    secondButton.textContent = "Second";
    cell.append(firstButton, secondButton);
    row.appendChild(cell);
    grid.appendChild(row);
    document.body.appendChild(grid);

    const scope = effectScope();
    const state = scope.run(() =>
      useListState({
        selectionMode: "single",
        items: [{ id: "row-1", label: "Row 1" }],
        getKey: (item) => item.id,
        getTextValue: (item) => item.label,
      })
    )!;

    const { gridProps } = scope.run(() =>
      useGridList(
        {
          "aria-label": "Grid list",
          keyboardNavigationBehavior: "arrow",
        },
        state,
        { current: grid as HTMLElement | null }
      )
    )!;

    state.selectionManager.setFocused(true);
    state.selectionManager.setFocusedKey("row-1");
    await flush();

    const node = state.collection.getItem("row-1");
    if (!node) {
      throw new Error("Expected row node");
    }

    const itemAria = scope.run(() =>
      useGridListItem(
        {
          node,
        },
        state as any,
        { current: row as HTMLElement | null }
      )
    )!;

    if (typeof gridProps.tabIndex === "number") {
      grid.tabIndex = gridProps.tabIndex;
    }
    if (typeof itemAria.rowProps.tabIndex === "number") {
      row.tabIndex = itemAria.rowProps.tabIndex as number;
    }

    const onRowFocus = itemAria.rowProps.onFocus as ((event: FocusEvent) => void) | undefined;
    const onRowKeydownCapture = itemAria.rowProps.onKeydownCapture as
      | ((event: KeyboardEvent) => void)
      | undefined;
    const onRowKeydown = itemAria.rowProps.onKeydown as ((event: KeyboardEvent) => void) | undefined;
    if (onRowFocus) {
      row.addEventListener("focus", (event) => onRowFocus(event as FocusEvent));
    }
    if (onRowKeydownCapture) {
      row.addEventListener("keydown", (event) => onRowKeydownCapture(event as KeyboardEvent), true);
    }
    if (onRowKeydown) {
      row.addEventListener("keydown", (event) => onRowKeydown(event as KeyboardEvent));
    }

    row.focus();
    await flush();
    expect(document.activeElement).toBe(row);

    row.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }));
    await flush();
    expect(document.activeElement).toBe(firstButton);

    firstButton.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true })
    );
    await flush();
    expect(document.activeElement).toBe(secondButton);

    secondButton.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true })
    );
    await flush();
    expect(document.activeElement).toBe(row);

    row.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    await flush();
    expect(document.activeElement).toBe(secondButton);

    scope.stop();
    grid.remove();
  });
});
