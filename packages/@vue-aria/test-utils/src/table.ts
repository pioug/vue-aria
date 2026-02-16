import { BaseTester } from "./_base";
import type { TableTesterOpts } from "./types";

export class TableTester extends BaseTester {
  advanceTimer?: TableTesterOpts["advanceTimer"];

  constructor(opts: TableTesterOpts) {
    super(opts);
    this.advanceTimer = opts.advanceTimer;
  }

  async selectAllRows() {
    const rows = Array.from(this.root.querySelectorAll("[role='row']"));
    for (const row of rows) {
      await this.selectRow(row);
    }
  }
}
