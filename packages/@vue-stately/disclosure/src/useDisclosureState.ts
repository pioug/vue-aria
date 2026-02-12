/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {useControlledState} from '@vue-stately/utils';

export interface DisclosureProps {
  /** Whether the disclosure is expanded (controlled). */
  isExpanded?: boolean,
  /** Whether the disclosure is expanded by default (uncontrolled). */
  defaultExpanded?: boolean,
  /** Handler that is called when the disclosure expanded state changes. */
  onExpandedChange?: (isExpanded: boolean) => void
}


export interface DisclosureState {
  /** Whether the disclosure is currently expanded. */
  readonly isExpanded: boolean,
  /** Sets whether the disclosure is expanded. */
  setExpanded(isExpanded: boolean): void,
  /** Expand the disclosure. */
  expand(): void,
  /** Collapse the disclosure. */
  collapse(): void,
  /** Toggles the disclosure's visibility. */
  toggle(): void
}

/**
 * Manages state for a disclosure widget. Tracks whether the disclosure is expanded, and provides
 * methods to toggle this state.
 */
export function useDisclosureState(props: DisclosureProps): DisclosureState {
  let [isExpanded, setExpanded] = useControlledState(props.isExpanded, props.defaultExpanded || false, props.onExpandedChange);

  const expand = () => {
    setExpanded(true);
  };

  const collapse = () => {
    setExpanded(false);
  };

  const toggle = () => {
    setExpanded(!isExpanded.value);
  };

  return {
    get isExpanded() {
      return isExpanded.value;
    },
    setExpanded,
    expand,
    collapse,
    toggle
  };
}
