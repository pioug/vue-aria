import { Point } from "./Point";
import { Rect } from "./Rect";

export class OverscanManager {
  private startTime = 0;
  private velocity = new Point(0, 0);
  private visibleRect = new Rect();

  setVisibleRect(rect: Rect): void {
    const elapsed = performance.now() - this.startTime;
    if (elapsed < 500) {
      if (rect.x !== this.visibleRect.x && elapsed > 0) {
        this.velocity.x = (rect.x - this.visibleRect.x) / elapsed;
      }

      if (rect.y !== this.visibleRect.y && elapsed > 0) {
        this.velocity.y = (rect.y - this.visibleRect.y) / elapsed;
      }
    }

    this.startTime = performance.now();
    this.visibleRect = rect;
  }

  getOverscannedRect(): Rect {
    const overscanned = this.visibleRect.copy();

    const overscanY = this.visibleRect.height / 3;
    overscanned.height += overscanY;
    if (this.velocity.y < 0) {
      overscanned.y -= overscanY;
    }

    if (this.velocity.x !== 0) {
      const overscanX = this.visibleRect.width / 3;
      overscanned.width += overscanX;
      if (this.velocity.x < 0) {
        overscanned.x -= overscanX;
      }
    }

    return overscanned;
  }
}
