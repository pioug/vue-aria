export class Size {
  width: number;
  height: number;

  constructor(width = 0, height = 0) {
    this.width = Math.max(width, 0);
    this.height = Math.max(height, 0);
  }

  copy(): Size {
    return new Size(this.width, this.height);
  }

  equals(other: Size): boolean {
    return this.width === other.width && this.height === other.height;
  }

  get area(): number {
    return this.width * this.height;
  }
}
