import { hideOthers } from "aria-hidden";

type Revert = () => void;

const currentDocument = typeof document !== "undefined" ? document : undefined;

export function watchModals(
  selector: string = "body",
  { document = currentDocument }: { document?: Document } = {}
): Revert {
  if (!document) {
    return () => {};
  }

  const target = document.querySelector(selector);
  if (!target) {
    return () => {};
  }

  const config = { childList: true };
  let modalContainers: Array<Element> = [];
  let undo: Revert | undefined;

  const observer = new MutationObserver((mutationRecord) => {
    const liveAnnouncer = document.querySelector('[data-live-announcer="true"]');
    for (const mutation of mutationRecord) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        const addNode = Array.from(mutation.addedNodes).find((node) =>
          (node as Element)?.querySelector?.('[aria-modal="true"], [data-ismodal="true"]')
        ) as Element | undefined;

        if (addNode) {
          modalContainers.push(addNode);
          const modal = addNode.querySelector('[aria-modal="true"], [data-ismodal="true"]') as HTMLElement;
          undo?.();
          const others = [modal, ...(liveAnnouncer ? [liveAnnouncer as HTMLElement] : [])];
          undo = hideOthers(others);
        }
      } else if (mutation.type === "childList" && mutation.removedNodes.length > 0) {
        const removedNodes = Array.from(mutation.removedNodes);
        const removedIndex = modalContainers.findIndex((container) => removedNodes.includes(container));
        if (removedIndex >= 0) {
          undo?.();
          modalContainers = modalContainers.filter((_, index) => index !== removedIndex);
          if (modalContainers.length > 0) {
            const modal = modalContainers[modalContainers.length - 1].querySelector(
              '[aria-modal="true"], [data-ismodal="true"]'
            ) as HTMLElement;
            const others = [modal, ...(liveAnnouncer ? [liveAnnouncer as HTMLElement] : [])];
            undo = hideOthers(others);
          } else {
            undo = undefined;
          }
        }
      }
    }
  });

  observer.observe(target, config);

  return () => {
    undo?.();
    observer.disconnect();
  };
}
