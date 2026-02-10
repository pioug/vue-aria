import { BaseLayout, type BaseLayoutOptions } from "./BaseLayout";

export interface GridLayoutOptions extends BaseLayoutOptions {}

export class GridLayout extends BaseLayout {
  constructor(options: GridLayoutOptions = {}) {
    super("grid", options);
  }
}
