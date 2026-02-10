export type CardOrientation = "vertical" | "horizontal";

export interface BaseLayoutOptions {
  cardOrientation?: CardOrientation | undefined;
}

export class BaseLayout {
  readonly type: string;
  readonly cardOrientation: CardOrientation;

  constructor(type: string, options: BaseLayoutOptions = {}) {
    this.type = type;
    this.cardOrientation = options.cardOrientation ?? "vertical";
  }
}
