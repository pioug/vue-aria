import { BaseTester } from "./_base";
import type { TabsTesterOpts } from "./types";

export class TabsTester extends BaseTester {
  constructor(opts: TabsTesterOpts) {
    super(opts);
    this.direction = opts.direction ?? "ltr";
  }

  direction: TabsTesterOpts["direction"];

  async selectTab(tab: string | number | HTMLElement) {
    await this.click(tab instanceof HTMLElement ? tab : this.root);
  }
}
