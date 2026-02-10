import { BaseLayout, type BaseLayoutOptions } from "./BaseLayout";

export interface WaterfallLayoutOptions extends BaseLayoutOptions {}

export class WaterfallLayout extends BaseLayout {
  constructor(options: WaterfallLayoutOptions = {}) {
    super("waterfall", options);
  }
}
