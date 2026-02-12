/*
 * Copyright 2022 Adobe. All rights reserved.
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
import {fireEvent, render, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useLandmark} from '../src/useLandmark';

vi.mock('@vue-aria/utils', async () => {
  const actual = await vi.importActual<typeof import('@vue-aria/utils')>('@vue-aria/utils');
  return {
    ...actual,
    useLayoutEffect: React.useLayoutEffect
  };
});

function Main(props: any) {
  let ref = React.useRef<HTMLElement | null>(null);
  let {landmarkProps} = useLandmark({...props, role: 'main'}, ref as any);
  return React.createElement('main', {ref, ...landmarkProps}, props.children);
}

function Navigation(props: any) {
  let ref = React.useRef<HTMLElement | null>(null);
  let {landmarkProps} = useLandmark({...props, role: 'navigation'}, ref as any);
  return React.createElement('nav', {ref, ...landmarkProps}, props.children);
}

function renderLandmarks() {
  return render(
    React.createElement(
      'div',
      null,
      React.createElement(
        Navigation,
        null,
        React.createElement(
          'ul',
          null,
          React.createElement('li', null, React.createElement('a', {href: '/home'}, 'Home')),
          React.createElement('li', null, React.createElement('a', {href: '/about'}, 'About')),
          React.createElement('li', null, React.createElement('a', {href: '/contact'}, 'Contact'))
        )
      ),
      React.createElement(
        Main,
        null,
        React.createElement('input', {'aria-label': 'First Name'})
      )
    )
  );
}

describe('LandmarkManager', function () {
  it('can tab into a landmark region', async function () {
    let user = userEvent.setup();
    let tree = renderLandmarks();

    await user.tab();
    expect(document.activeElement).toBe(tree.getAllByRole('link')[0]);
  });

  it('can F6 to a landmark region', async function () {
    let tree = renderLandmarks();
    let navigation = tree.getByRole('navigation');
    let main = tree.getByRole('main');

    fireEvent.keyDown(document.activeElement ?? document.body, {key: 'F6'});
    await waitFor(() => {
      expect(document.activeElement).toBe(navigation);
    });

    fireEvent.keyDown(document.activeElement ?? document.body, {key: 'F6'});
    await waitFor(() => {
      expect(document.activeElement).toBe(main);
    });
  });

  it('can shift+F6 to a landmark region', async function () {
    let tree = renderLandmarks();
    let navigation = tree.getByRole('navigation');
    let main = tree.getByRole('main');

    fireEvent.keyDown(document.activeElement ?? document.body, {key: 'F6'});
    await waitFor(() => {
      expect(document.activeElement).toBe(navigation);
    });

    fireEvent.keyDown(document.activeElement ?? document.body, {key: 'F6'});
    await waitFor(() => {
      expect(document.activeElement).toBe(main);
    });

    fireEvent.keyDown(document.activeElement ?? document.body, {key: 'F6', shiftKey: true});
    await waitFor(() => {
      expect(document.activeElement).toBe(navigation);
    });
  });
});
