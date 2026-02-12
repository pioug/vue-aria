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

import {convertStyleProps, dimensionValue, viewStyleProps} from '../src';

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  })
}));

describe('styleProps', () => {
  describe('dimensionValue', () => {
    it('supports numbers and falsy values', () => {
      expect(dimensionValue(100)).toBe('100px');
      expect(dimensionValue()).toBe(undefined);
    });

    it('supports css units and design-token values', () => {
      expect(dimensionValue('100px')).toBe('100px');
      expect(dimensionValue('100vh')).toBe('100vh');
      expect(dimensionValue('size-100')).toBe('var(--spectrum-global-dimension-size-100, var(--spectrum-alias-size-100))');
      expect(dimensionValue('single-line-height')).toBe('var(--spectrum-global-dimension-single-line-height, var(--spectrum-alias-single-line-height))');
    });

    it('supports css functions with spectrum variables', () => {
      expect(dimensionValue('calc(100px - size-100)')).toBe('calc(100px - var(--spectrum-global-dimension-size-100, var(--spectrum-alias-size-100)))');
      expect(dimensionValue('min(100px, static-size-100)')).toBe('min(100px, var(--spectrum-global-dimension-static-size-100, var(--spectrum-alias-static-size-100)))');
    });
  });

  describe('convertStyleProps', () => {
    it('converts background and border colors', () => {
      let background = convertStyleProps({backgroundColor: {S: 'gray-50'}}, viewStyleProps, 'ltr', ['base', 'S']);
      expect(background.backgroundColor).toBe('var(--spectrum-alias-background-color-gray-50, var(--spectrum-legacy-color-gray-50, var(--spectrum-global-color-gray-50, var(--spectrum-semantic-gray-50-color-background))))');

      let borderDefault = convertStyleProps({borderColor: 'default'}, viewStyleProps, 'ltr', ['base']);
      expect(borderDefault.borderColor).toBe('var(--spectrum-alias-border-color)');
    });

    it('handles responsive border widths and none', () => {
      let style = convertStyleProps({borderEndWidth: {S: 'thin'}}, viewStyleProps, 'ltr', ['base']);
      expect(style.borderRightWidth).toBe('0');

      style = convertStyleProps({borderEndWidth: {S: 'thin'}}, viewStyleProps, 'ltr', ['S', 'base']);
      expect(style.borderRightWidth).toBe('var(--spectrum-alias-border-size-thin)');

      style = convertStyleProps({borderEndWidth: {S: 'thick', M: 'none', L: 'thin'}}, viewStyleProps, 'ltr', ['M', 'S', 'base']);
      expect(style.borderRightWidth).toBe('0');
    });
  });
});
