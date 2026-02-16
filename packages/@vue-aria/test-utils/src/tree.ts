import { BaseTester } from "./_base";
import type { TreeTesterOpts } from "./types";

export class TreeTester extends BaseTester {
  advanceTimer?: TreeTesterOpts["advanceTimer"];

  constructor(opts: TreeTesterOpts) {
    super(opts);
    this.advanceTimer = opts.advanceTimer;
  }

  async expand(node: string | number | HTMLElement) {
    await this.selectRow(node);
  }
}
