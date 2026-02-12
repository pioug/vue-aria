/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {hideOthers} from 'aria-hidden';

type Revert = () => void;

const currentDocument = typeof document !== 'undefined' ? document : undefined;

/**
 * Acts as a polyfill for `aria-modal` by watching for added modals and hiding surrounding DOM elements with `aria-hidden`.
 */
export function watchModals(selector: string = 'body', {document = currentDocument}: {document?: Document} = {}): Revert {
  /**
   * Listen for child additions/removals of the selected element (defaults to body).
   * When modal containers are added, hide non-modal content from assistive tech.
   */
  if (!document) {
    return () => {};
  }

  const target = document.querySelector(selector);
  if (!target) {
    return () => {};
  }

  const config = {childList: true};
  let modalContainers: Element[] = [];
  let undo: Revert | undefined;

  const observer = new MutationObserver((mutationRecord) => {
    const liveAnnouncer = document.querySelector('[data-live-announcer="true"]');
    for (const mutation of mutationRecord) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        const addNode = Array.from(mutation.addedNodes).find(
          (node) => (node as Element).querySelector?.('[aria-modal="true"], [data-ismodal="true"]')
        ) as Element | undefined;

        if (addNode) {
          modalContainers.push(addNode);
          const modal = addNode.querySelector('[aria-modal="true"], [data-ismodal="true"]') as HTMLElement;
          undo?.();
          const others = [modal, ...(liveAnnouncer ? [liveAnnouncer as HTMLElement] : [])];
          undo = hideOthers(others);
        }
      } else if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
        const removedNodes = Array.from(mutation.removedNodes);
        const nodeIndexRemove = modalContainers.findIndex((container) => removedNodes.includes(container));
        if (nodeIndexRemove >= 0) {
          undo?.();
          modalContainers = modalContainers.filter((_, i) => i !== nodeIndexRemove);
          if (modalContainers.length > 0) {
            const modal = modalContainers[modalContainers.length - 1].querySelector('[aria-modal="true"], [data-ismodal="true"]') as HTMLElement;
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
