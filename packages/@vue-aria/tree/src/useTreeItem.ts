import type { AriaButtonOptions } from "@vue-aria/button";
import { useGridListItem, type AriaGridListItemOptions, type GridListItemAria } from "@vue-aria/gridlist";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import type { Node } from "@vue-aria/collections";
import type { TreeState } from "@vue-aria/tree-state";
import { useLabels } from "@vue-aria/utils";
import { intlMessages } from "./intlMessages";

export interface AriaTreeItemOptions extends Omit<AriaGridListItemOptions, "isVirtualized"> {
  node: Node<unknown>;
}

export interface TreeExpandButtonProps extends AriaButtonOptions {
  "aria-label"?: string;
  "aria-labelledby"?: string;
  excludeFromTabOrder?: boolean;
  "data-react-aria-prevent-focus"?: boolean;
}

export interface TreeItemAria extends GridListItemAria {
  rowProps: Record<string, unknown>;
  gridCellProps: Record<string, unknown>;
  descriptionProps: Record<string, unknown>;
  expandButtonProps: TreeExpandButtonProps;
}

/**
 * Provides tree-item row behavior and expand-button wiring.
 */
export function useTreeItem<T>(
  props: AriaTreeItemOptions,
  state: TreeState<T>,
  ref: { current: HTMLElement | null }
): TreeItemAria {
  const { node } = props;
  const gridListAria = useGridListItem(props, state as any, ref);
  const isExpanded = gridListAria.rowProps["aria-expanded"] === true;
  const stringFormatter = useLocalizedStringFormatter(intlMessages as any, "@react-aria/tree");
  const labelProps = useLabels({
    "aria-label": isExpanded ? stringFormatter.format("collapse") : stringFormatter.format("expand"),
    "aria-labelledby": gridListAria.rowProps.id as string | undefined,
  });

  const expandButtonProps: TreeExpandButtonProps = {
    onPress: () => {
      if (!gridListAria.isDisabled) {
        state.toggleKey(node.key);
        state.selectionManager.setFocused(true);
        state.selectionManager.setFocusedKey(node.key);
      }
    },
    excludeFromTabOrder: true,
    preventFocusOnPress: true,
    "data-react-aria-prevent-focus": true,
    ...labelProps,
  };

  return {
    ...gridListAria,
    expandButtonProps,
  };
}
