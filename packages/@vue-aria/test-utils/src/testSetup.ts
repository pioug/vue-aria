/**
 * Enables reading pageX/pageY from pointer events.
 */
export function installMouseEvent(): void {
  let oldMouseEvent = MouseEvent;
  beforeAll(() => {
    // @ts-ignore
    global.MouseEvent = class FakeMouseEvent extends MouseEvent {
      _init: {pageX: number; pageY: number};
      constructor(name: string, init: EventInit & Record<string, unknown> = {}) {
        super(name, init);
        this._init = {pageX: 0, pageY: 0, ...init} as {pageX: number; pageY: number};
      }
      get pageX() {
        return this._init.pageX;
      }
      get pageY() {
        return this._init.pageY;
      }
    };
  });
  afterAll(() => {
    // @ts-ignore
    global.MouseEvent = oldMouseEvent;
  });
}

export function definePointerEvent(): void {
  // @ts-ignore
  global.PointerEvent = class FakePointerEvent extends MouseEvent {
    _init: {pageX: number; pageY: number; pointerType: string; pointerId?: number; width?: number; height?: number};
    constructor(name: string, init: EventInit & Record<string, unknown> = {}) {
      super(name, init);
      this._init = {pageX: 0, pageY: 0, pointerType: "mouse", ...init} as {
        pageX: number;
        pageY: number;
        pointerType: string;
        pointerId?: number;
        width?: number;
        height?: number;
      };
    }
    get pointerType() {
      return this._init.pointerType;
    }
    get pointerId() {
      return this._init.pointerId;
    }
    get pageX() {
      return this._init.pageX;
    }
    get pageY() {
      return this._init.pageY;
    }
    get width() {
      return this._init.width;
    }
    get height() {
      return this._init.height;
    }
  };
}

export function installPointerEvent(): void {
  beforeAll(definePointerEvent);
  afterAll(() => {
    // @ts-ignore
    delete global.PointerEvent;
  });
}
