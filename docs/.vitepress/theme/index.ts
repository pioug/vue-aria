import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import { h } from "vue";
import { Provider } from "@vue-spectrum/provider";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import "./custom.css";
import "./spectrum-base.css";

const BaseLayout = DefaultTheme.Layout;

const theme: Theme = {
  extends: DefaultTheme,
  Layout: () =>
    h(
      Provider,
      {
        theme: defaultTheme,
        colorScheme: "light",
        scale: "medium",
        UNSAFE_className: "spectrum-docs-provider",
      },
      {
        default: () => h(BaseLayout),
      }
    ),
};

export default theme;
