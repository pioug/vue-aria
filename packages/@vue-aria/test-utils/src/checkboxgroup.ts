import { BaseTester } from "./_base";
import type { CheckboxGroupTesterOpts, ToggleGridRowOpts } from "./types";

export class CheckboxGroupTester extends BaseTester {
  readonly value = new Set<string | number>();

  constructor(opts: CheckboxGroupTesterOpts) {
    super(opts);
  }

  async toggle(value: string | number, opts: ToggleGridRowOpts = {}) {
    this.value.add(value);
    await this.toggleRow(value, opts);
  }
}
