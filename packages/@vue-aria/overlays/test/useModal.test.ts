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
import {render} from '@testing-library/react';
import {OverlayContainer, OverlayProvider, useModal} from '../src/useModal';

function ModalDOM(props: any) {
  let {modalProps} = useModal(props.options);
  return React.createElement('div', {'data-testid': props.modalId || 'modal', ...modalProps}, props.children);
}

function Modal(props: any) {
  return React.createElement(
    OverlayContainer,
    {portalContainer: props.container, 'data-testid': props.providerId || 'modal-provider'},
    React.createElement(ModalDOM, {modalId: props.modalId, options: props.options}, props.children)
  );
}

function Example(props: any) {
  return React.createElement(
    OverlayProvider,
    {'data-testid': 'root-provider'},
    'This is the root provider.',
    props.showModal
      ? React.createElement(Modal, {container: props.container, options: props.options}, props.children)
      : null
  );
}

describe('useModal', function () {
  it('sets aria-hidden on parent providers on mount and removes on unmount', function () {
    let res = render(React.createElement(Example));
    let rootProvider = res.getByTestId('root-provider');

    expect(rootProvider.getAttribute('aria-hidden')).toBeNull();

    res.rerender(React.createElement(Example, {showModal: true}));
    let modalProvider = res.getByTestId('modal-provider');

    expect(rootProvider.getAttribute('aria-hidden')).toBe('true');
    expect(modalProvider.getAttribute('aria-hidden')).toBeNull();

    res.rerender(React.createElement(Example));
    expect(rootProvider.getAttribute('aria-hidden')).toBeNull();
  });

  it('marks modal content with data-ismodal', function () {
    let res = render(React.createElement(Example, {showModal: true}));
    let modal = res.getByTestId('modal');

    expect(modal.getAttribute('data-ismodal')).toBe('true');
  });

  it('allows disabling modal behavior', function () {
    let res = render(React.createElement(Example, {showModal: true, options: {isDisabled: true}}));
    let modal = res.getByTestId('modal');

    expect(modal.getAttribute('data-ismodal')).toBe('false');
  });
});
