import {afterEach, beforeAll, describe, expect, it} from 'vitest';

import {enableShadowDOM} from '../../../@vue-stately/flags/src/index';
import {createShadowTreeWalker} from '../src/shadowdom/ShadowTreeWalker';

function inputFilter(node: Node): number {
  return node instanceof HTMLInputElement ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
}

function collectIds(walker: TreeWalker): string[] {
  const ids: string[] = [];
  let node = walker.nextNode();
  while (node) {
    if (node instanceof HTMLElement && node.id) {
      ids.push(node.id);
    }
    node = walker.nextNode();
  }
  return ids;
}

describe('ShadowTreeWalker', () => {
  beforeAll(() => {
    enableShadowDOM();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('walks through non-shadow DOM like native tree walker', () => {
    document.body.innerHTML = `
      <div id="div-one"></div>
      <input id="input-one" />
      <div id="div-two"></div>
      <input id="input-two" />
      <div id="div-three"></div>
      <input id="input-three" />
    `;

    const nativeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_ALL, inputFilter);
    const shadowWalker = createShadowTreeWalker(document, document.body, undefined, inputFilter);

    expect(collectIds(shadowWalker)).toEqual(collectIds(nativeWalker));
  });

  it('walks into shadow roots while traversing', () => {
    const host = document.createElement('div');
    host.id = 'host';
    const shadowRoot = host.attachShadow({mode: 'open'});
    const shadowInput = document.createElement('input');
    shadowInput.id = 'shadow-input';
    shadowRoot.appendChild(shadowInput);

    const lightInput = document.createElement('input');
    lightInput.id = 'light-input';

    document.body.append(host, lightInput);

    const walker = createShadowTreeWalker(document, document.body, undefined, inputFilter);
    const ids = collectIds(walker);

    expect(ids).toContain('shadow-input');
    expect(ids).toContain('light-input');
  });

  it('throws when setting currentNode outside root', () => {
    document.body.innerHTML = '<div id="inside"></div>';
    const walker = createShadowTreeWalker(document, document.body);
    const outside = document.createElement('div');

    expect(() => {
      walker.currentNode = outside;
    }).toThrow('Cannot set currentNode to a node that is not contained by the root node.');
  });
});
