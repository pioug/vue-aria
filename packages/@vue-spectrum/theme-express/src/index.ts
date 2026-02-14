import { theme as defaultTheme } from "../../theme/src";
import type { Theme } from "../../provider/src/types";

export const theme: Theme = {
  ...defaultTheme,
  global: {
    ...defaultTheme.global,
    express: "express",
  },
  medium: {
    ...defaultTheme.medium,
    express: "medium",
  },
  large: {
    ...defaultTheme.large,
    express: "large",
  },
};
