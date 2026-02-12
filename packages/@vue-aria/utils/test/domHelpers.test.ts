import {beforeAll, describe, expect, it} from 'vitest';

import {enableShadowDOM} from '../../../@vue-stately/flags/src/index';
import {getActiveElement, getOwnerWindow} from '../src';

describe('getOwnerWindow', () => {
  beforeAll(() => {
    enableShadowDOM();
  });

  it('returns the window if argument is null or undefined', () => {
    expect(getOwnerWindow(null)).toBe(window);
    expect(getOwnerWindow(undefined)).toBe(window);
  });

  it('returns window for document elements', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    expect(getOwnerWindow(div)).toBe(window);
    div.remove();
  });

  it('returns iframe window for elements inside iframe', () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const iframeWindow = iframe.contentWindow;
    const iframeDocument = iframeWindow?.document;
    expect(iframeWindow).toBeTruthy();
    expect(iframeDocument).toBeTruthy();

    const iframeDiv = iframeDocument!.createElement('div');
    iframeDocument!.body.appendChild(iframeDiv);
    expect(getOwnerWindow(iframeDiv)).toBe(iframeWindow);
    iframe.remove();
  });
});

describe('getActiveElement', () => {
  beforeAll(() => {
    enableShadowDOM();
  });

  it('returns the active element in the light DOM', () => {
    const button = document.createElement('button');
    document.body.appendChild(button);
    button.focus();
    expect(getActiveElement()).toBe(button);
    button.remove();
  });

  it('returns the active element inside a shadow root', () => {
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({mode: 'open'});
    const input = document.createElement('input');
    shadowRoot.appendChild(input);
    document.body.appendChild(host);

    input.focus();
    expect(getActiveElement()).toBe(input);
    host.remove();
  });

  it('returns active element inside iframe document', () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const iframeDoc = iframe.contentWindow!.document;
    const input = iframeDoc.createElement('input');
    iframeDoc.body.appendChild(input);

    input.focus();
    expect(getActiveElement(iframeDoc)).toBe(input);
    iframe.remove();
  });
});
