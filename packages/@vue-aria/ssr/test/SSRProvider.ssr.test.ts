// @vitest-environment node

import {renderToString} from '@vue/server-renderer';
import {describe, expect, it} from 'vitest';
import {createSSRApp, defineComponent, h} from 'vue';

import {SSRProvider, useSSRSafeId} from '../src';

const Test = defineComponent({
  name: 'SSRTestComponent',
  setup() {
    const id = useSSRSafeId();
    return () => h('div', {id});
  }
});

describe('SSRProvider SSR', () => {
  it('should render without errors', async () => {
    const app = createSSRApp(defineComponent({
      setup() {
        return () => h(SSRProvider, () => [h(Test), h(Test)]);
      }
    }));

    const html = await renderToString(app);
    expect(html).toContain('id="react-aria-1"');
    expect(html).toContain('id="react-aria-2"');
  });

  it('should render without errors with nested SSRProviders', async () => {
    const app = createSSRApp(defineComponent({
      setup() {
        return () => h(SSRProvider, () => [
          h(SSRProvider, () => [h(Test)]),
          h(SSRProvider, () => [h(Test)])
        ]);
      }
    }));

    const html = await renderToString(app);
    expect(html).toContain('id="react-aria-1-1"');
    expect(html).toContain('id="react-aria-2-1"');
  });
});
