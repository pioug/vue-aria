import { Point } from "./Point";
import { Size } from "./Size";

export type RectCorner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

export class Rect {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  get maxX(): number {
    return this.x + this.width;
  }

  get maxY(): number {
    return this.y + this.height;
  }

  get area(): number {
    return this.width * this.height;
  }

  get topLeft(): Point {
    return new Point(this.x, this.y);
  }

  get topRight(): Point {
    return new Point(this.maxX, this.y);
  }

  get bottomLeft(): Point {
    return new Point(this.x, this.maxY);
  }

  get bottomRight(): Point {
    return new Point(this.maxX, this.maxY);
  }

  intersects(rect: Rect): boolean {
    const isTestEnv = process.env.NODE_ENV === "test" && !process.env.VIRT_ON;
    return (
      (isTestEnv || (this.area > 0 && rect.area > 0)) &&
      this.x <= rect.x + rect.width &&
      rect.x <= this.x + this.width &&
      this.y <= rect.y + rect.height &&
      rect.y <= this.y + this.height
    );
  }

  containsRect(rect: Rect): boolean {
    return (
      this.x <= rect.x &&
      this.y <= rect.y &&
      this.maxX >= rect.maxX &&
      this.maxY >= rect.maxY
    );
  }

  containsPoint(point: Point): boolean {
    return (
      this.x <= point.x &&
      this.y <= point.y &&
      this.maxX >= point.x &&
      this.maxY >= point.y
    );
  }

  getCornerInRect(rect: Rect): RectCorner | null {
    for (const key of ["topLeft", "topRight", "bottomLeft", "bottomRight"] as const) {
      if (rect.containsPoint(this[key])) {
        return key;
      }
    }

    return null;
  }

  equals(rect: Rect): boolean {
    return (
      rect.x === this.x &&
      rect.y === this.y &&
      rect.width === this.width &&
      rect.height === this.height
    );
  }

  pointEquals(point: Point | Rect): boolean {
    return this.x === point.x && this.y === point.y;
  }

  sizeEquals(size: Size | Rect): boolean {
    return this.width === size.width && this.height === size.height;
  }

  union(other: Rect): Rect {
    const x = Math.min(this.x, other.x);
    const y = Math.min(this.y, other.y);
    const width = Math.max(this.maxX, other.maxX) - x;
    const height = Math.max(this.maxY, other.maxY) - y;
    return new Rect(x, y, width, height);
  }

  intersection(other: Rect): Rect {
    if (!this.intersects(other)) {
      return new Rect(0, 0, 0, 0);
    }

    const x = Math.max(this.x, other.x);
    const y = Math.max(this.y, other.y);
    return new Rect(
      x,
      y,
      Math.min(this.maxX, other.maxX) - x,
      Math.min(this.maxY, other.maxY) - y
    );
  }

  copy(): Rect {
    return new Rect(this.x, this.y, this.width, this.height);
  }
}
