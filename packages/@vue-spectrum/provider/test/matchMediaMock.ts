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

type MatchMediaListener = (event: {matches: boolean; media: string}) => void;

export interface MatchMediaController {
  useMediaQuery(query: string): void;
  clear(): void;
}

export function installMatchMediaMock(): MatchMediaController {
  let originalMatchMedia = window.matchMedia;
  let activeQuery: string | null = null;
  let listeners = new Map<string, Set<MatchMediaListener>>();

  let matches = (query: string) => activeQuery === query;
  let notify = () => {
    for (let [query, queryListeners] of listeners) {
      let event = {matches: matches(query), media: query};
      for (let listener of queryListeners) {
        listener(event);
      }
    }
  };

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => {
      let addListener = (listener: MatchMediaListener) => {
        let queryListeners = listeners.get(query);
        if (!queryListeners) {
          queryListeners = new Set<MatchMediaListener>();
          listeners.set(query, queryListeners);
        }

        queryListeners.add(listener);
      };

      let removeListener = (listener: MatchMediaListener) => {
        listeners.get(query)?.delete(listener);
      };

      return {
        media: query,
        get matches() {
          return matches(query);
        },
        onchange: null,
        addListener,
        removeListener,
        addEventListener: (_type: string, listener: MatchMediaListener) => addListener(listener),
        removeEventListener: (_type: string, listener: MatchMediaListener) => removeListener(listener),
        dispatchEvent: () => true
      };
    }
  });

  return {
    useMediaQuery(query: string) {
      activeQuery = query;
      notify();
    },
    clear() {
      listeners.clear();
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        writable: true,
        value: originalMatchMedia
      });
    }
  };
}
