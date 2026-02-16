import type { BaseTesterOpts, BaseGridRowInteractionOpts, GridRowActionOpts, ToggleGridRowOpts, UserOpts } from "./types";

export function noopAsync() {
  return Promise.resolve();
}

export class BaseTester {
  readonly root: HTMLElement;
  readonly user: {
    click: (element: Element) => Promise<void>;
    keyboard: (keys: string) => Promise<void>;
    pointer: (opts: {target: Element; keys?: string; coords?: Record<string, unknown>}) => Promise<void>;
    hover: (element: Element) => Promise<void>;
    dblClick: (element: Element) => Promise<void>;
    tab: (opts?: {shift?: boolean}) => Promise<void>;
  };

  readonly interactionType: UserOpts["interactionType"];

  constructor(opts: BaseTesterOpts) {
    this.root = opts.root;
    this.interactionType = opts.interactionType ?? "mouse";
    this.user = opts.user ?? {
      click: async () => undefined,
      keyboard: async () => undefined,
      pointer: async () => undefined,
      hover: async () => undefined,
      dblClick: async () => undefined,
      tab: async () => undefined,
    };
  }

  async click(element: Element = this.root): Promise<void> {
    await this.user.click(element);
  }

  async keyboard(keys: string): Promise<void> {
    await this.user.keyboard(keys);
  }

  async dblClick(element: Element = this.root): Promise<void> {
    await this.user.dblClick(element);
  }

  async pointer(target: Element, keys = "[MouseLeft]") {
    await this.user.pointer({target, keys});
  }

  async tab(opts: {shift?: boolean} = {}): Promise<void> {
    await this.user.tab(opts);
  }

  async focusRow(target: BaseGridRowInteractionOpts["row"]) {
    const row = this.findRow(target);
    if (row) {
      (row as HTMLElement).focus();
    }
    return row;
  }

  async selectRow(target: BaseGridRowInteractionOpts["row"]): Promise<void> {
    const row = this.findRow(target);
    if (row) {
      await this.click(row);
    }
  }

  async toggleRow(target: BaseGridRowInteractionOpts["row"], opts: ToggleGridRowOpts = {}): Promise<void> {
    const row = this.findRow(target);
    if (row) {
      await this.selectRow(opts.checkboxSelection !== false ? row : row);
    }
  }

  async actOnRow(target: BaseGridRowInteractionOpts["row"], _opts?: GridRowActionOpts): Promise<void> {
    const row = this.findRow(target);
    if (row) {
      await this.doubleClick(row);
    }
  }

  async doubleClick(target: BaseGridRowInteractionOpts["row"]): Promise<void> {
    const row = this.findRow(target);
    if (!row) return;
    await this.click(row);
    await this.click(row);
  }

  protected findRow(target: BaseGridRowInteractionOpts["row"]): Element | null {
    if (target instanceof HTMLElement) return target;
    if (typeof target === "number") {
      return this.root.querySelectorAll<HTMLElement>("[role='row'], [role='listitem'], [role='option']").item(target);
    }
    return this.root.querySelector(`[data-row='${target}'], [aria-label='${target}'], [data-key='${target}']`);
  }
}
