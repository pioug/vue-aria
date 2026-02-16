import { useInteractionModality } from "@vue-aria/interactions";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { useDescription } from "@vue-aria/utils";
import type { MultipleSelectionManager } from "@vue-stately/selection";
import { intlMessages } from "./intlMessages";

export interface HighlightSelectionDescriptionProps {
  selectionManager: MultipleSelectionManager;
  hasItemActions?: boolean;
}

export function useHighlightSelectionDescription(
  props: HighlightSelectionDescriptionProps
): Record<string, unknown> {
  const stringFormatter = useLocalizedStringFormatter(intlMessages as any);
  const modality = useInteractionModality();
  const shouldLongPress =
    (modality === "pointer" || modality === "virtual" || modality == null)
    && typeof window !== "undefined"
    && "ontouchstart" in window;

  const selectionMode = props.selectionManager.selectionMode;
  const selectionBehavior = props.selectionManager.selectionBehavior;
  let message: string | undefined;
  if (shouldLongPress) {
    message = stringFormatter.format("longPressToSelect");
  }

  const interactionDescription =
    selectionBehavior === "replace" && selectionMode !== "none" && props.hasItemActions
      ? message
      : undefined;

  const { descriptionProps } = useDescription(interactionDescription);
  return descriptionProps.value;
}
