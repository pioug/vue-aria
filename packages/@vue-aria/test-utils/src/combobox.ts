import {act, waitFor, within} from './testing';
import {ComboBoxTesterOpts, UserOpts} from './types';
import {BaseTester} from "./_base";

interface ComboBoxOpenOpts {
  triggerBehavior?: 'focus' | 'manual';
  interactionType?: UserOpts['interactionType'];
}

interface ComboBoxSelectOpts extends ComboBoxOpenOpts {
  option: number | string | HTMLElement;
}

export class ComboBoxTester extends BaseTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _combobox: HTMLElement;
  private _trigger: HTMLElement;

  constructor(opts: ComboBoxTesterOpts) {
    super(opts);
    let {root, trigger, user, interactionType} = opts;
    this.user = user;
    this._interactionType = interactionType || 'mouse';

    this._combobox = root;
    let combobox = within(root).queryByRole('combobox');
    if (combobox) {
      this._combobox = combobox;
    }

    if (trigger) {
      this._trigger = trigger;
    } else {
      let buttons = within(root).queryAllByRole('button');
      if (buttons.length === 1) {
        trigger = buttons[0];
      } else if (buttons.length > 1) {
        trigger = buttons.find(button => button.hasAttribute('aria-haspopup')) as HTMLElement | undefined;
      }
      this._trigger = trigger ?? this._combobox;
    }
  }

  setInteractionType(type: UserOpts['interactionType']): void {
    this._interactionType = type;
  }

  async open(opts: ComboBoxOpenOpts = {}): Promise<void> {
    let {triggerBehavior = 'manual', interactionType = this._interactionType} = opts;
    let trigger = this.trigger;
    let combobox = this.combobox;
    let isDisabled = trigger.hasAttribute('disabled');

    if (interactionType === 'mouse') {
      if (triggerBehavior === 'focus') {
        await this.user.click(combobox);
      } else {
        await this.user.click(trigger);
      }
    } else if (interactionType === 'keyboard' && this._trigger != null) {
      act(() => this._trigger!.focus());
      if (triggerBehavior !== 'focus') {
        await this.user.keyboard('[ArrowDown]');
      }
    } else if (interactionType === 'touch') {
      if (triggerBehavior === 'focus') {
        await this.user.pointer({target: combobox, keys: '[TouchA]'});
      } else {
        await this.user.pointer({target: trigger, keys: '[TouchA]'});
      }
    }

    await waitFor(() => {
      if (!isDisabled && combobox.getAttribute('aria-controls') == null) {
        throw new Error('No aria-controls found on combobox trigger element.');
      } else {
        return true;
      }
    });
    let listBoxId = combobox.getAttribute('aria-controls');
    await waitFor(() => {
      if (!isDisabled && (!listBoxId || document.getElementById(listBoxId) == null)) {
        throw new Error(`Listbox with id of ${listBoxId} not found in document.`);
      } else {
        return true;
      }
    });
  }

  findOption(opts: {optionIndexOrText: number | string}): HTMLElement {
    let {optionIndexOrText} = opts;
    let option;
    let options = this.options();
    let listbox = this.listbox;

    if (typeof optionIndexOrText === 'number') {
      option = options[optionIndexOrText];
    } else if (typeof optionIndexOrText === 'string' && listbox != null) {
      option = (within(listbox!).getByText(optionIndexOrText).closest('[role=option]')) as HTMLElement;
    }

    return option as HTMLElement;
  }

  async selectOption(opts: ComboBoxSelectOpts): Promise<void> {
    let {
      option,
      triggerBehavior,
      interactionType = this._interactionType,
    } = opts;
    if (!this.combobox.getAttribute('aria-controls')) {
      await this.open({triggerBehavior});
    }

    let listbox = this.listbox;
    if (!listbox) {
      throw new Error('Combobox\'s listbox not found.');
    }

    if (listbox) {
      if (typeof option === 'string' || typeof option === 'number') {
        option = this.findOption({optionIndexOrText: option});
      }

      if (!option) {
        throw new Error('Target option not found in the listbox.');
      }

      if (interactionType === 'mouse' || interactionType === 'keyboard') {
        await this.user.click(option);
      } else {
        await this.user.pointer({target: option, keys: '[TouchA]'});
      }

      if (option.getAttribute('href') == null) {
        await waitFor(() => {
          if (document.contains(listbox)) {
            throw new Error('Expected listbox element to not be in the document after selecting an option');
          } else {
            return true;
          }
        });
      }
    } else {
      throw new Error("Attempted to select a option in the combobox, but the listbox wasn't found.");
    }
  }

  async close(): Promise<void> {
    let listbox = this.listbox;
    if (listbox) {
      act(() => this.combobox.focus());
      await this.user.keyboard('[Escape]');

      await waitFor(() => {
        if (document.contains(listbox)) {
          throw new Error('Expected listbox element to not be in the document after closing.');
        } else {
          return true;
        }
      });
    }
  }

  get combobox(): HTMLElement {
    return this._combobox;
  }

  get trigger(): HTMLElement {
    return this._trigger;
  }

  get listbox(): HTMLElement | null {
    let listBoxId = this.combobox.getAttribute('aria-controls');
    return listBoxId ? document.getElementById(listBoxId) || null : null;
  }

  get sections(): HTMLElement[] {
    let listbox = this.listbox;
    return listbox ? within(listbox).queryAllByRole('group') : [];
  }

  options(opts: {element?: HTMLElement} = {}): HTMLElement[] {
    let {element = this.listbox} = opts;
    let options = [];
    if (element) {
      options = within(element).queryAllByRole('option');
    }

    return options;
  }

  get focusedOption(): HTMLElement | null {
    let focusedOptionId = this.combobox.getAttribute('aria-activedescendant');
    return focusedOptionId ? document.getElementById(focusedOptionId) : null;
  }
}
