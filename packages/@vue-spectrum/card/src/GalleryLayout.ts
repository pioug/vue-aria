import { BaseLayout, type BaseLayoutOptions } from "./BaseLayout";

export interface GalleryLayoutOptions extends BaseLayoutOptions {}

export class GalleryLayout extends BaseLayout {
  constructor(options: GalleryLayoutOptions = {}) {
    super("gallery", options);
  }
}
