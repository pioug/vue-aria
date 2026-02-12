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

import {calculatePositionInternal} from '../src/calculatePosition';

function dimensions(width: number, height: number) {
  return {
    width,
    height,
    totalWidth: width,
    totalHeight: height,
    top: 0,
    left: 0,
    scroll: {top: 0, left: 0}
  };
}

describe('calculatePositionInternal', function () {
  it('keeps requested placement when there is enough space', function () {
    let result = calculatePositionInternal(
      'bottom',
      {top: 100, left: 100, width: 50, height: 20},
      {top: 0, left: 0, width: 120, height: 80},
      {top: 0, left: 0, width: 0, height: 0},
      {top: 0, bottom: 0, left: 0, right: 0},
      8,
      true,
      dimensions(1000, 800),
      dimensions(1000, 800),
      {top: 0, left: 0, width: 0, height: 0},
      0,
      0,
      false,
      undefined,
      0,
      0,
      true,
      null
    );

    expect(result.placement).toBe('bottom');
    expect(typeof result.position.top).toBe('number');
    expect(result.maxHeight).toBeGreaterThanOrEqual(0);
  });

  it('flips placement when there is insufficient space', function () {
    let result = calculatePositionInternal(
      'bottom',
      {top: 760, left: 100, width: 50, height: 30},
      {top: 0, left: 0, width: 120, height: 180},
      {top: 0, left: 0, width: 0, height: 0},
      {top: 0, bottom: 0, left: 0, right: 0},
      8,
      true,
      dimensions(1000, 800),
      dimensions(1000, 800),
      {top: 0, left: 0, width: 0, height: 0},
      0,
      0,
      false,
      undefined,
      0,
      0,
      true,
      null
    );

    expect(result.placement).toBe('top');
  });

  it('respects user maxHeight when provided', function () {
    let result = calculatePositionInternal(
      'bottom',
      {top: 100, left: 100, width: 50, height: 20},
      {top: 0, left: 0, width: 120, height: 400},
      {top: 0, left: 0, width: 0, height: 0},
      {top: 0, bottom: 0, left: 0, right: 0},
      8,
      true,
      dimensions(1000, 800),
      dimensions(1000, 800),
      {top: 0, left: 0, width: 0, height: 0},
      0,
      0,
      false,
      100,
      0,
      0,
      true,
      null
    );

    expect(result.maxHeight).toBeLessThanOrEqual(100);
  });
});
