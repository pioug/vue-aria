import { defineComponent, h } from "vue";

/**
 * Collection item wrapper used by Breadcrumbs.
 */
export const Item = defineComponent({
  name: "SpectrumBreadcrumbsItem",
  inheritAttrs: false,
  setup(_props, { slots }) {
    return () => h("span", null, slots.default?.());
  },
});
