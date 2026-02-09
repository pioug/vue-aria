import { computed } from "vue";
import { useDescription } from "@vue-aria/utils";
import type { ReadonlyRef } from "@vue-aria/types";
import { useDragSession } from "./DragManager";
import { getDragModality } from "./utils";

export interface VirtualDropResult {
  dropProps: ReadonlyRef<Record<string, unknown>>;
}

const MESSAGES = {
  keyboard: "Press Enter to drop.",
  touch: "Double tap to drop.",
  virtual: "Click to drop.",
} as const;

export function useVirtualDrop(): VirtualDropResult {
  const dragSession = useDragSession();

  const description = computed(() =>
    dragSession.value ? MESSAGES[getDragModality()] : undefined
  );
  const { descriptionProps } = useDescription(description);

  const dropProps = computed<Record<string, unknown>>(() => ({
    ...descriptionProps.value,
    onClick: () => {},
  }));

  return {
    dropProps,
  };
}
