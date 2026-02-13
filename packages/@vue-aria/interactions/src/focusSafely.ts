import {
  focusWithoutScrolling,
  getActiveElement,
  getOwnerDocument,
  runAfterTransition,
} from "@vue-aria/utils";
import { getInteractionModality } from "./useFocusVisible";

export function focusSafely(element: HTMLElement): void {
  const ownerDocument = getOwnerDocument(element);

  if (getInteractionModality() === "virtual") {
    const lastFocusedElement = getActiveElement(ownerDocument);
    runAfterTransition(() => {
      const activeElement = getActiveElement(ownerDocument);
      if (
        (activeElement === lastFocusedElement || activeElement === ownerDocument.body) &&
        element.isConnected
      ) {
        focusWithoutScrolling(element);
      }
    });
  } else {
    focusWithoutScrolling(element);
  }
}
