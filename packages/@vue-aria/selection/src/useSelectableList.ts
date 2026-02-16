import { useCollator } from "@vue-aria/i18n";
import type { Key, Node } from "@vue-aria/collections";
import type { MultipleSelectionManager } from "@vue-stately/selection";
import type { LayoutDelegate, KeyboardDelegate, SearchableCollection } from "./types";
import { ListKeyboardDelegate } from "./ListKeyboardDelegate";
import {
  useSelectableCollection,
  type AriaSelectableCollectionOptions,
  type SelectableCollectionAria,
} from "./useSelectableCollection";

export interface AriaSelectableListOptions
  extends Omit<AriaSelectableCollectionOptions, "keyboardDelegate"> {
  collection: SearchableCollection<unknown>;
  keyboardDelegate?: KeyboardDelegate;
  layoutDelegate?: LayoutDelegate;
  disabledKeys: Set<Key>;
  selectionManager: MultipleSelectionManager;
}

export interface SelectableListAria {
  listProps: SelectableCollectionAria["collectionProps"];
}

export function useSelectableList(props: AriaSelectableListOptions): SelectableListAria {
  const {
    selectionManager,
    collection,
    disabledKeys,
    ref,
    keyboardDelegate,
    layoutDelegate,
  } = props;

  const collator = useCollator({ usage: "search", sensitivity: "base" });
  const disabledBehavior = selectionManager.disabledBehavior;

  const delegate =
    keyboardDelegate ||
    new ListKeyboardDelegate({
      collection,
      disabledKeys,
      disabledBehavior,
      ref,
      collator,
      layoutDelegate,
    });

  const { collectionProps } = useSelectableCollection({
    ...props,
    ref,
    selectionManager,
    keyboardDelegate: delegate,
  });

  return {
    listProps: collectionProps,
  };
}
