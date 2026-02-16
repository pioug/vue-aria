import { BaseTester } from "./_base";
import type { ListBoxTesterOpts } from "./types";

export class ListBoxTester extends BaseTester {
  constructor(opts: ListBoxTesterOpts) {
    super(opts);
    this.advanceTimer = opts.advanceTimer;
  }

  advanceTimer?: ListBoxTesterOpts["advanceTimer"];

  async select(row: string | number | HTMLElement) {
    await this.selectRow(row);
  }
}
