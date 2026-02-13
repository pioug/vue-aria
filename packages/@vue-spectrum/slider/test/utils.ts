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

import {fireEvent} from '@testing-library/react';

function pressKeyOnSlider(key: string, slider: HTMLElement) {
  fireEvent.keyDown(slider, {key});
  fireEvent.keyUp(slider, {key});
}

export const press = {
  ArrowRight: (slider: HTMLElement) => pressKeyOnSlider('ArrowRight', slider),
  ArrowLeft: (slider: HTMLElement) => pressKeyOnSlider('ArrowLeft', slider),
  ArrowUp: (slider: HTMLElement) => pressKeyOnSlider('ArrowUp', slider),
  ArrowDown: (slider: HTMLElement) => pressKeyOnSlider('ArrowDown', slider),
  Home: (slider: HTMLElement) => pressKeyOnSlider('Home', slider),
  End: (slider: HTMLElement) => pressKeyOnSlider('End', slider),
  PageUp: (slider: HTMLElement) => pressKeyOnSlider('PageUp', slider),
  PageDown: (slider: HTMLElement) => pressKeyOnSlider('PageDown', slider)
} as const;

export function testKeypresses(
  [leftSlider, rightSlider]: [HTMLInputElement, HTMLInputElement],
  commands: Array<{left?: (slider: HTMLElement) => void, right?: (slider: HTMLElement) => void, result: string | number}>
): void {
  for (let command of commands) {
    let keyAction = command.left ?? command.right;
    let result = command.result;
    let slider = command.left ? leftSlider : rightSlider;
    let oldValue = Number(slider.value);

    slider.focus();
    keyAction?.(slider);

    if (typeof result === 'string') {
      expect(slider.value).toBe(result);
    } else {
      expect(slider.value).toBe(String(oldValue + result));
    }
  }
}
