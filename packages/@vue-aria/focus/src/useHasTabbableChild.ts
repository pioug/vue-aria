import { useLayoutEffect } from "@vue-aria/utils";
import { getFocusableTreeWalker } from "./FocusScope";

export interface AriaHasTabbableChildOptions {
  isDisabled?: boolean;
}

export function useHasTabbableChild(
  ref: { current: Element | null },
  options?: AriaHasTabbableChildOptions
): boolean {
  const isDisabled = options?.isDisabled;
  let hasTabbableChild = false;

  if (ref?.current && !isDisabled) {
    const walker = getFocusableTreeWalker(ref.current, { tabbable: true });
    hasTabbableChild = Boolean(walker.nextNode());
  }

  useLayoutEffect(() => {
    if (!ref?.current || isDisabled) {
      hasTabbableChild = false;
      return;
    }

    const update = () => {
      if (!ref.current) {
        hasTabbableChild = false;
        return;
      }

      const walker = getFocusableTreeWalker(ref.current, { tabbable: true });
      hasTabbableChild = Boolean(walker.nextNode());
    };

    update();

    const observer = new MutationObserver(update);
    observer.observe(ref.current, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["tabIndex", "disabled"],
    });

    return () => {
      observer.disconnect();
    };
  });

  return isDisabled ? false : hasTabbableChild;
}
