import { announce } from "@vue-aria/live-announcer";
import { useGrid, type GridAria, type GridProps } from "@vue-aria/grid";
import { useCollator, useLocale, useLocalizedStringFormatter } from "@vue-aria/i18n";
import { tableNestedRows } from "@vue-aria/flags";
import {
  mergeProps,
  useDescription,
  useId,
  useUpdateEffect,
} from "@vue-aria/utils";
import type { Key, LayoutDelegate, Rect, Size } from "@vue-aria/selection";
import type { TableState, TreeGridState } from "@vue-stately/table";
import { computed } from "vue";
import { intlMessages } from "./intlMessages";
import { TableKeyboardDelegate } from "./TableKeyboardDelegate";
import { gridIds } from "./utils";

export interface AriaTableProps extends GridProps {
  layoutDelegate?: LayoutDelegate;
  layout?: DeprecatedLayout;
}

interface DeprecatedLayout {
  getLayoutInfo(key: Key): DeprecatedLayoutInfo;
  getContentSize(): Size;
  virtualizer: DeprecatedVirtualizer;
}

interface DeprecatedLayoutInfo {
  rect: Rect;
}

interface DeprecatedVirtualizer {
  visibleRect: Rect;
}

export function useTable<T>(
  props: AriaTableProps,
  state: TableState<T> | TreeGridState<T>,
  ref: { current: HTMLElement | null }
): GridAria {
  const { keyboardDelegate, isVirtualized, layoutDelegate, layout } = props;

  const collator = useCollator({ usage: "search", sensitivity: "base" });
  const { direction } = useLocale().value;
  const disabledBehavior = state.selectionManager.disabledBehavior;
  const delegate =
    keyboardDelegate
    || new TableKeyboardDelegate({
      collection: state.collection as any,
      disabledKeys: state.disabledKeys,
      disabledBehavior,
      ref,
      direction,
      collator,
      layoutDelegate,
      layout,
    });
  const id = useId(props.id as string | undefined);
  gridIds.set(state as unknown as TableState<unknown>, id);

  const { gridProps } = useGrid(
    {
      ...props,
      id,
      keyboardDelegate: delegate as any,
    },
    state as any,
    ref
  );

  if (isVirtualized) {
    gridProps["aria-rowcount"] =
      state.collection.size + state.collection.headerRows.length;
  }

  if (tableNestedRows() && "expandedKeys" in state) {
    gridProps.role = "treegrid";
  }

  const stringFormatter = useLocalizedStringFormatter(
    intlMessages as any,
    "@react-aria/table"
  );
  const sortDescription = computed(() => {
    const column = state.sortDescriptor?.column;
    const sortDirection = state.sortDescriptor?.direction;
    const columnName =
      state.collection.columns.find((col) => col.key === column)?.textValue ?? "";
    return sortDirection && column
      ? stringFormatter.format(`${sortDirection}Sort`, { columnName })
      : undefined;
  });

  const { descriptionProps } = useDescription(sortDescription);

  useUpdateEffect(
    () => {
      if (sortDescription.value) {
        announce(sortDescription.value, "assertive", 500);
      }
    },
    [sortDescription]
  );

  const describedBy = [
    descriptionProps.value["aria-describedby"],
    gridProps["aria-describedby"],
  ]
    .filter(Boolean)
    .join(" ");

  return {
    gridProps: mergeProps(gridProps, descriptionProps.value, {
      "aria-describedby": describedBy,
    }) as Record<string, unknown>,
  };
}
