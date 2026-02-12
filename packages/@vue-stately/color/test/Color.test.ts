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

import {parseColor} from '../src/Color';

describe('Color', () => {
  it('parses and formats short hex colors', () => {
    let color = parseColor('#abc');
    expect(color.getChannelValue('red')).toBe(170);
    expect(color.getChannelValue('green')).toBe(187);
    expect(color.getChannelValue('blue')).toBe(204);
    expect(color.getChannelValue('alpha')).toBe(1);
    expect(color.toString('hex')).toBe('#AABBCC');
    expect(color.toString('rgb')).toBe('rgb(170, 187, 204)');
    expect(color.toString('rgba')).toBe('rgba(170, 187, 204, 1)');
    expect(color.toString('css')).toBe('rgba(170, 187, 204, 1)');
  });

  it('parses and normalizes rgba values by clamping', () => {
    let color = parseColor('rgba(300, -10, 0, 4)');
    expect(color.getChannelValue('red')).toBe(255);
    expect(color.getChannelValue('green')).toBe(0);
    expect(color.getChannelValue('blue')).toBe(0);
    expect(color.getChannelValue('alpha')).toBe(1);
    expect(color.toString('rgba')).toBe('rgba(255, 0, 0, 1)');
  });

  it('supports channel updates and integer conversion', () => {
    let color = parseColor('hsl(120, 100%, 50%)');
    let updated = color.withChannelValue('hue', 200);

    expect(updated.getChannelValue('hue')).toBe(200);
    expect(updated.getChannelValue('saturation')).toBe(100);
    expect(updated.getChannelValue('lightness')).toBe(50);
    expect(parseColor('#abcdef').toHexInt()).toBe(0xABCDEF);
  });

  it('throws on invalid color values', () => {
    expect(() => parseColor('#ggg')).toThrow('Invalid color value: #ggg');
  });
});
