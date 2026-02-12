import {beforeAll, describe, expect, it} from 'vitest';

import {enableShadowDOM} from '../../../@vue-stately/flags/src/index';
import {getEventTarget, isFocusWithin, nodeContains} from '../src';

describe('DOMFunctions', () => {
  beforeAll(() => {
    enableShadowDOM();
  });

  it('nodeContains works across shadow boundary', () => {
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({mode: 'open'});
    const button = document.createElement('button');
    shadowRoot.appendChild(button);
    document.body.appendChild(host);

    expect(nodeContains(shadowRoot, button)).toBe(true);
    expect(nodeContains(host, button)).toBe(true);
    host.remove();
  });

  it('getEventTarget returns composed path first node when available', () => {
    const target = document.createElement('button');
    const host = document.createElement('div');
    host.attachShadow({mode: 'open'}).appendChild(target);

    const event = new Event('click') as Event & {composedPath: () => EventTarget[]};
    Object.defineProperty(event, 'target', {value: host, configurable: true});
    Object.defineProperty(event, 'composedPath', {value: () => [target]});

    expect(getEventTarget(event)).toBe(target);
  });

  it('isFocusWithin reports focus inside element subtree', () => {
    const wrapper = document.createElement('div');
    const input = document.createElement('input');
    wrapper.appendChild(input);
    document.body.appendChild(wrapper);

    input.focus();
    expect(isFocusWithin(wrapper)).toBe(true);
    wrapper.remove();
  });
});
