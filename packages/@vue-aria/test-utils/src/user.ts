import { CheckboxGroupTester } from "./checkboxgroup";
import { ComboBoxTester } from "./combobox";
import { DialogTester } from "./dialog";
import { GridListTester } from "./gridlist";
import { ListBoxTester } from "./listbox";
import { MenuTester } from "./menu";
import { RadioGroupTester } from "./radiogroup";
import { SelectTester } from "./select";
import { TableTester } from "./table";
import { TabsTester } from "./tabs";
import { TreeTester } from "./tree";
import type { BaseTesterOpts, UserOpts } from "./types";
import type { CheckboxGroupTesterOpts, ComboBoxTesterOpts, DialogTesterOpts, GridListTesterOpts, ListBoxTesterOpts, MenuTesterOpts, RadioGroupTesterOpts, SelectTesterOpts, TableTesterOpts, TabsTesterOpts, TreeTesterOpts } from "./types";

type TesterMap = {
  CheckboxGroup: typeof CheckboxGroupTester;
  ComboBox: typeof ComboBoxTester;
  Dialog: typeof DialogTester;
  GridList: typeof GridListTester;
  ListBox: typeof ListBoxTester;
  Menu: typeof MenuTester;
  RadioGroup: typeof RadioGroupTester;
  Select: typeof SelectTester;
  Table: typeof TableTester;
  Tabs: typeof TabsTester;
  Tree: typeof TreeTester;
};

type TesterOptsMap = {
  CheckboxGroup: CheckboxGroupTesterOpts;
  ComboBox: ComboBoxTesterOpts;
  Dialog: DialogTesterOpts;
  GridList: GridListTesterOpts;
  ListBox: ListBoxTesterOpts;
  Menu: MenuTesterOpts;
  RadioGroup: RadioGroupTesterOpts;
  Select: SelectTesterOpts;
  Table: TableTesterOpts;
  Tabs: TabsTesterOpts;
  Tree: TreeTesterOpts;
};

export type PatternNames = keyof TesterMap;
export type TesterOpts<T extends PatternNames> = TesterOptsMap[T];
export type Tester<T extends PatternNames> = InstanceType<TesterMap[T]>;

const keyToUtil: TesterMap = {
  CheckboxGroup: CheckboxGroupTester,
  ComboBox: ComboBoxTester,
  Dialog: DialogTester,
  GridList: GridListTester,
  ListBox: ListBoxTester,
  Menu: MenuTester,
  RadioGroup: RadioGroupTester,
  Select: SelectTester,
  Table: TableTester,
  Tabs: TabsTester,
  Tree: TreeTester,
};

function defaultAdvanceTimer(waitTime: number) {
  return new Promise((resolve) => setTimeout(resolve, waitTime));
}

function createDefaultUser(): BaseTesterOpts["user"] {
  return {
    click: async () => undefined,
    keyboard: async () => undefined,
    pointer: async () => undefined,
    hover: async () => undefined,
  };
}

export class User {
  interactionType: UserOpts["interactionType"];
  advanceTimer: UserOpts["advanceTimer"];

  constructor(opts: UserOpts = {}) {
    this.interactionType = opts.interactionType ?? "mouse";
    this.advanceTimer = opts.advanceTimer || defaultAdvanceTimer;
  }

  createTester<T extends PatternNames>(patternName: T, opts: TesterOpts<T>): Tester<T> {
    const Ctor = keyToUtil[patternName];
    return new Ctor({
      ...opts,
      interactionType: this.interactionType,
      user: opts.user ?? createDefaultUser(),
    } as TesterOpts<T>) as Tester<T>;
  }
}
