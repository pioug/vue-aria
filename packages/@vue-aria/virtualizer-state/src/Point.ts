export class Point {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  copy(): Point {
    return new Point(this.x, this.y);
  }

  equals(point: Point): boolean {
    return this.x === point.x && this.y === point.y;
  }

  isOrigin(): boolean {
    return this.x === 0 && this.y === 0;
  }
}
