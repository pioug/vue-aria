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

import {getEventTarget} from './shadowdom/DOMFunctions';

const transitionsByElement = new Map<EventTarget, Set<string>>();
const transitionCallbacks = new Set<() => void>();

function setupGlobalEvents() {
  if (typeof window === 'undefined') {
    return;
  }

  function isTransitionEvent(event: Event): event is TransitionEvent {
    return 'propertyName' in event;
  }

  const onTransitionEnd = (e: Event) => {
    const eventTarget = getEventTarget(e);
    if (!isTransitionEvent(e) || !eventTarget) {
      return;
    }

    const properties = transitionsByElement.get(eventTarget);
    if (!properties) {
      return;
    }

    properties.delete(e.propertyName);
    if (properties.size === 0) {
      eventTarget.removeEventListener('transitioncancel', onTransitionEnd);
      transitionsByElement.delete(eventTarget);
    }

    if (transitionsByElement.size === 0) {
      for (const cb of transitionCallbacks) {
        cb();
      }
      transitionCallbacks.clear();
    }
  };

  const onTransitionStart = (e: Event) => {
    const eventTarget = getEventTarget(e);
    if (!isTransitionEvent(e) || !eventTarget) {
      return;
    }

    let transitions = transitionsByElement.get(eventTarget);
    if (!transitions) {
      transitions = new Set();
      transitionsByElement.set(eventTarget, transitions);
      eventTarget.addEventListener('transitioncancel', onTransitionEnd, {once: true});
    }

    transitions.add(e.propertyName);
  };

  document.body.addEventListener('transitionrun', onTransitionStart);
  document.body.addEventListener('transitionend', onTransitionEnd);
}

if (typeof document !== 'undefined') {
  if (document.readyState !== 'loading') {
    setupGlobalEvents();
  } else {
    document.addEventListener('DOMContentLoaded', setupGlobalEvents);
  }
}

function cleanupDetachedElements() {
  for (const [eventTarget] of transitionsByElement) {
    if ('isConnected' in eventTarget && !eventTarget.isConnected) {
      transitionsByElement.delete(eventTarget);
    }
  }
}

export function runAfterTransition(fn: () => void): void {
  requestAnimationFrame(() => {
    cleanupDetachedElements();
    if (transitionsByElement.size === 0) {
      fn();
    } else {
      transitionCallbacks.add(fn);
    }
  });
}
