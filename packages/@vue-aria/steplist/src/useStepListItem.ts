import { useSelectableItem } from "@vue-aria/selection";
import { mergeProps } from "@vue-aria/utils";
import type { Key } from "@vue-aria/collections";

export interface AriaStepListItemProps {
  key: Key;
}

export interface StepListItemAria {
  stepProps: Record<string, unknown>;
  stepStateProps?: Record<string, unknown>;
  stepStateText?: string;
}

interface StepListItemState {
  selectionManager?: {
    isSelected?: (key: Key) => boolean;
    selectedKey?: Key | null;
    focusedKey?: Key | null;
  };
  selectedKey?: Key | null;
  isSelectable?: (key: Key) => boolean;
}

export function useStepListItem(
  props: AriaStepListItemProps,
  state: StepListItemState,
  ref: { current: HTMLElement | null }
): StepListItemAria {
  const { key } = props;
  const disabled = !state?.isSelectable?.(key);

  const { itemProps } = useSelectableItem({
    isDisabled: disabled,
    key,
    ref,
    selectionManager: state.selectionManager as never,
  });

  const isSelected = (state?.selectionManager?.selectedKey ?? state?.selectedKey) === key;

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
    }

    (itemProps as { onKeyDown?: (event: KeyboardEvent) => void }).onKeyDown?.(event);
  };

  return {
    stepProps: mergeProps(itemProps as Record<string, unknown>, {
      onKeyDown,
      role: "link",
      "aria-current": isSelected ? "step" : undefined,
      "aria-disabled": disabled ? true : undefined,
      tabIndex: disabled ? undefined : 0,
    }),
    stepStateProps: undefined,
    stepStateText: undefined,
  };
}
