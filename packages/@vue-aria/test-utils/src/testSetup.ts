type EventCtor = { new(type: string, eventInitDict?: EventInit & Record<string, unknown>): Event };
let originalMouseEvent: EventCtor | undefined;
let originalPointerEvent: EventCtor | undefined;

export function definePointerEvent(): void {
  if (typeof window === "undefined" || typeof window.PointerEvent !== "undefined") {
    return;
  }

  class FakePointerEvent extends MouseEvent {
    _init: {pageX: number; pageY: number; pointerType: string; pointerId?: number; width?: number; height?: number};
    constructor(type: string, init: EventInit & Record<string, unknown> = {}) {
      super(type, init);
      this._init = {
        pageX: 0,
        pageY: 0,
        pointerType: "mouse",
        ...init,
      };
    }
    get pointerType() {
      return this._init.pointerType;
    }
    get pointerId() {
      return this._init.pointerId ?? 1;
    }
    get pageX() {
      return this._init.pageX;
    }
    get pageY() {
      return this._init.pageY;
    }
    get width() {
      return this._init.width ?? 1;
    }
    get height() {
      return this._init.height ?? 1;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).PointerEvent = FakePointerEvent;
}

export function installMouseEvent(): void {
  if (typeof window === "undefined") return;
  originalMouseEvent = window.MouseEvent;
  class FakeMouseEvent extends MouseEvent {
    _init: {pageX: number; pageY: number};
    constructor(name: string, init: EventInit & Record<string, unknown> = {}) {
      super(name, init);
      this._init = {pageX: 0, pageY: 0, ...init};
    }
    get pageX() {
      return this._init.pageX;
    }
    get pageY() {
      return this._init.pageY;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).MouseEvent = FakeMouseEvent;
}

export function installPointerEvent(): void {
  if (typeof window === "undefined") return;
  if (typeof window.PointerEvent === "undefined") {
    originalPointerEvent = undefined;
    definePointerEvent();
  } else {
    originalPointerEvent = window.PointerEvent;
    definePointerEvent();
  }
}

export function installMousePointerEvents(): void {
  installMouseEvent();
  installPointerEvent();
}

export function restoreMousePointerEvents(): void {
  if (typeof window === "undefined") return;
  if (originalMouseEvent) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).MouseEvent = originalMouseEvent;
  }
  if (originalPointerEvent) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).PointerEvent = originalPointerEvent;
  }
}
