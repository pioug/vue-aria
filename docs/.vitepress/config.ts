import { defineConfig } from 'vitepress';
import { sidebarData } from './sidebar-data';

export default defineConfig({
  title: 'Vue Aria',
  description: 'Vue docs for Vue Aria and Vue Spectrum ports.',
  themeConfig: {
    nav: [{ text: 'Guide', link: '/guide/getting-started' }],
    sidebar: [
      { text: 'Guide', items: [{ text: 'Getting started', link: '/guide/getting-started' }] },
      { text: 'Vue Aria', items: sidebarData['react-aria'] },
      { text: 'Vue Spectrum', items: sidebarData['react-spectrum'] }
    ]
  }
});
