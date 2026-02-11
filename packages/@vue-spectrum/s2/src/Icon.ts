import { defineComponent, h, type Component } from "vue";
import {
  Icon as SpectrumIcon,
  Illustration as SpectrumIllustration,
  type IconProps,
  type IllustrationProps,
} from "@vue-spectrum/icon";

export type S2IconProps = IconProps;
export type S2IllustrationProps = IllustrationProps;

export type S2SVGComponent = Component;

export function createIcon(component: S2SVGComponent) {
  return defineComponent({
    name: "S2GeneratedIcon",
    inheritAttrs: false,
    setup(_, { attrs }) {
      return () =>
        h(SpectrumIcon, attrs as Record<string, unknown>, {
          default: () => h(component as any),
        });
    },
  });
}

export function createIllustration(component: S2SVGComponent) {
  return defineComponent({
    name: "S2GeneratedIllustration",
    inheritAttrs: false,
    setup(_, { attrs }) {
      return () =>
        h(SpectrumIllustration, attrs as Record<string, unknown>, {
          default: () => h(component as any),
        });
    },
  });
}
