import {renderToString} from '@vue/server-renderer';
import {mount} from '@vue/test-utils';
import {createSSRApp, defineComponent, h} from 'vue';
import {describe, expect, it} from 'vitest';

import {SSRProvider} from '../../ssr/src/index';
import {useViewportSize} from '../src/useViewportSize';

describe('useViewportSize SSR', () => {
  it('renders without errors in SSR render', async () => {
    const Viewport = defineComponent({
      setup() {
        useViewportSize();
        return () => null;
      }
    });

    const app = createSSRApp(Viewport);
    await expect(renderToString(app)).resolves.toBeTypeOf('string');
  });

  it('starts at 0x0 under SSRProvider and updates after mount', async () => {
    Object.defineProperty(document.documentElement, 'clientWidth', {configurable: true, value: 1024});
    Object.defineProperty(document.documentElement, 'clientHeight', {configurable: true, value: 768});

    let firstSize = '';
    const Viewport = defineComponent({
      setup() {
        const size = useViewportSize();
        firstSize = `${size.value.width}x${size.value.height}`;
        return () => h('div', {'data-testid': 'viewport'}, `${size.value.width}x${size.value.height}`);
      }
    });

    const wrapper = mount(defineComponent({
      setup() {
        return () => h(SSRProvider, () => h(Viewport));
      }
    }));

    expect(firstSize).toBe('0x0');
    await wrapper.vm.$nextTick();
    expect(wrapper.get('[data-testid="viewport"]').text()).not.toBe('0x0');
  });
});
