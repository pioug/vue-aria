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

import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';

import './testSetup';
import {BreadcrumbItem} from '../src/BreadcrumbItem';

describe('BreadcrumbItem', () => {
  it('handles defaults', () => {
    render(React.createElement(BreadcrumbItem, null, 'Breadcrumb item'));
    let breadcrumbItem = screen.getByText('Breadcrumb item');

    expect(breadcrumbItem.id).toBeTruthy();
    expect(breadcrumbItem.tabIndex).toBe(0);
  });

  it('handles current', () => {
    render(React.createElement(BreadcrumbItem, {isCurrent: true}, 'Breadcrumb item'));
    let breadcrumbItem = screen.getByText('Breadcrumb item');

    expect(breadcrumbItem.tabIndex).toBe(-1);
    expect(breadcrumbItem.getAttribute('aria-current')).toBe('page');
  });

  it('handles disabled', () => {
    let onPressSpy = vi.fn();
    render(React.createElement(BreadcrumbItem, {onPress: onPressSpy, isDisabled: true}, 'Breadcrumb item'));
    let breadcrumbItem = screen.getByText('Breadcrumb item');

    expect(breadcrumbItem.tabIndex).toBe(-1);
    expect(breadcrumbItem.getAttribute('aria-disabled')).toBe('true');

    fireEvent.click(breadcrumbItem);
    expect(onPressSpy).toHaveBeenCalledTimes(0);
  });

  it('handles onPress', () => {
    let onPressSpy = vi.fn();
    render(React.createElement(BreadcrumbItem, {onPress: onPressSpy}, 'Breadcrumb item'));
    let breadcrumbItem = screen.getByText('Breadcrumb item');

    fireEvent.click(breadcrumbItem);
    expect(onPressSpy).toHaveBeenCalledTimes(1);
  });

  it('handles custom element type', () => {
    render(React.createElement(BreadcrumbItem, {href: 'http://example.com/'}, 'Breadcrumb item'));
    let breadcrumbItem = screen.getByText('Breadcrumb item');

    expect(breadcrumbItem.tagName).toBe('A');
    expect(breadcrumbItem.id).toBeTruthy();
    expect(breadcrumbItem.tabIndex).toBe(0);
  });
});
