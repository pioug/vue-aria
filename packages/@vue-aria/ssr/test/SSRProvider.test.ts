import {mount} from '@vue/test-utils';
import {afterEach, describe, expect, it} from 'vitest';
import {defineComponent, h} from 'vue';

import {SSRProvider, useSSRSafeId} from '../src';

const Test = defineComponent({
  name: 'TestIdComponent',
  setup() {
    const id = useSSRSafeId();
    return () => h('div', {'data-testid': 'test', id});
  }
});

afterEach(() => {
  process.env.NODE_ENV = 'test';
});

describe('SSRProvider', () => {
  it('should generate consistent unique ids', () => {
    const wrapper = mount(defineComponent({
      setup() {
        return () => h(SSRProvider, () => [h(Test), h(Test)]);
      }
    }));

    const divs = wrapper.findAll('[data-testid="test"]');
    expect(divs[0].attributes('id')).toBe('react-aria-1');
    expect(divs[1].attributes('id')).toBe('react-aria-2');
  });

  it('should generate consistent unique ids with nested SSR providers', () => {
    const wrapper = mount(defineComponent({
      setup() {
        return () => h(SSRProvider, () => [
          h(Test),
          h(SSRProvider, () => [
            h(Test),
            h(SSRProvider, () => [h(Test)])
          ]),
          h(Test),
          h(SSRProvider, () => [h(Test)])
        ]);
      }
    }));

    const ids = wrapper.findAll('[data-testid="test"]').map((div) => div.attributes('id'));
    expect(ids).toEqual([
      'react-aria-1',
      'react-aria-2-1',
      'react-aria-2-2-1',
      'react-aria-3',
      'react-aria-4-1'
    ]);
  });

  it('should generate a random prefix when not server rendered outside test mode', () => {
    process.env.NODE_ENV = 'production';

    const wrapper = mount(Test);
    expect(/^react-aria\d+-/.test(wrapper.get('[data-testid="test"]').attributes('id'))).toBe(true);
  });

  it('should not generate a random prefix in tests', () => {
    process.env.NODE_ENV = 'test';

    const wrapper = mount(Test);
    expect(/^react-aria-/.test(wrapper.get('[data-testid="test"]').attributes('id'))).toBe(true);
  });
});
