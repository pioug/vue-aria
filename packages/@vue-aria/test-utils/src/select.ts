import {act, waitFor, within} from './testing';
import {BaseTester} from "./_base";
import {SelectTesterOpts, UserOpts} from './types';

interface SelectOpenOpts {
  interactionType?: UserOpts['interactionType'];
}

interface SelectTriggerOptionOpts extends SelectOpenOpts {
  option: number | string | HTMLElement;
}

export class SelectTester extends BaseTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _trigger: HTMLElement;

  constructor(opts: SelectTesterOpts) {
    let {root, user, interactionType} = opts;
    super(opts);
    this.user = user;
    this._interactionType = interactionType || 'mouse';
    let buttons = within(root).queryAllByRole('button');
    let triggerButton;
    if (buttons.length === 0) {
      triggerButton = root;
    } else if (buttons.length === 1) {
      triggerButton = buttons[0];
    } else {
      triggerButton = buttons.find(button => button.hasAttribute('aria-haspopup'));
    }

    this._trigger = triggerButton ?? root;
  }

  setInteractionType(type: UserOpts['interactionType']): void {
    this._interactionType = type;
  }

  async open(opts: SelectOpenOpts = {}): Promise<void> {
    let {interactionType = this._interactionType} = opts;
    let trigger = this.trigger;
    let isDisabled = trigger.hasAttribute('disabled');

    if (interactionType === 'mouse') {
      await this.user.click(this._trigger);
    } else if (interactionType === 'keyboard') {
      act(() => trigger.focus());
      await this.user.keyboard('[Enter]');
    } else if (interactionType === 'touch') {
      await this.user.pointer({target: this._trigger, keys: '[TouchA]'});
    }

    await waitFor(() => {
      if (!isDisabled && trigger.getAttribute('aria-controls') == null) {
        throw new Error('No aria-controls found on select element trigger.');
      } else {
        return true;
      }
    });
    let listBoxId = trigger.getAttribute('aria-controls');
    await waitFor(() => {
      if (!isDisabled && (!listBoxId || document.getElementById(listBoxId) == null)) {
        throw new Error(`ListBox with id of ${listBoxId} not found in document.`);
      } else {
        return true;
      }
    });
  }

  async close(): Promise<void> {
    let listbox = this.listbox;
    if (listbox) {
      act(() => listbox.focus());
      await this.user.keyboard('[Escape]');
    }

    await waitFor(() => {
      if (document.activeElement !== this._trigger) {
        throw new Error(`Expected the document.activeElement after closing the select dropdown to be the select component trigger but got ${document.activeElement}`);
      } else {
        return true;
      }
    });

    if (listbox && document.contains(listbox)) {
      throw new Error('Expected the select element listbox to not be in the document after selecting an option.');
    }
  }

  findOption(opts: {optionIndexOrText: number | string}): HTMLElement {
    let {optionIndexOrText} = opts;
    let option;
    let options = this.options();
    if (typeof optionIndexOrText === 'number') {
      option = options[optionIndexOrText];
    } else if (typeof optionIndexOrText === 'string' && this.listbox != null) {
      option = (within(this.listbox!).getByText(optionIndexOrText).closest('[role=option]')) as HTMLElement;
    }

    return option;
  }

  private async keyboardNavigateToOption(opts: {option: HTMLElement}) {
    let {option} = opts;
    let options = this.options();
    let targetIndex = options.indexOf(option);
    if (targetIndex === -1) {
      throw new Error('Option provided is not in the listbox');
    }
    if (document.activeElement === this.listbox) {
      await this.user.keyboard('[ArrowDown]');
    }
    let currIndex = options.indexOf(document.activeElement as HTMLElement);
    if (currIndex === -1) {
      throw new Error('ActiveElement is not in the listbox');
    }
    let direction = targetIndex > currIndex ? 'down' : 'up';
    for (let i = 0; i < Math.abs(targetIndex - currIndex); i++) {
      await this.user.keyboard(`[${direction === 'down' ? 'ArrowDown' : 'ArrowUp'}]`);
    }
  };

  async selectOption(opts: SelectTriggerOptionOpts): Promise<void> {
    let {
      option,
      interactionType = this._interactionType,
    } = opts;
    let trigger = this.trigger;
    if (!trigger.getAttribute('aria-controls')) {
      await this.open();
    }
    let listbox = this.listbox;
    if (!listbox) {
      throw new Error('Select\\'s listbox not found.');
    }

    if (listbox) {
      if (typeof option === 'string' || typeof option === 'number') {
        option = this.findOption({optionIndexOrText: option});
      }

      if (!option) {
        throw new Error('Target option not found in the listbox.');
      }

      let isMultiSelect = listbox.getAttribute('aria-multiselectable') === 'true';

      if (interactionType === 'keyboard') {
        if (option?.getAttribute('aria-disabled') === 'true') {
          return;
        }

        if (document.activeElement !== listbox && !listbox.contains(document.activeElement)) {
          act(() => listbox.focus());
        }
        await this.keyboardNavigateToOption({option});
        await this.user.keyboard('[Enter]');
      } else {
        if (interactionType === 'mouse') {
          await this.user.click(option);
        } else {
          await this.user.pointer({target: option, keys: '[TouchA]'});
        }
      }

      if (!isMultiSelect && option.getAttribute('href') == null) {
        await waitFor(() => {
          if (document.activeElement !== this._trigger) {
            throw new Error(`Expected the document.activeElement after selecting an option to be the select component trigger but got ${document.activeElement}`);
          } else {
            return true;
          }
        });

        if (document.contains(listbox)) {
          throw new Error('Expected select element listbox to not be in the document after selecting an option.');
        }
      }
    }
  }

  options(opts: {element?: HTMLElement} = {}): HTMLElement[] {
    let {element = this.listbox} = opts;
    let options = [];
    if (element) {
      options = within(element).queryAllByRole('option');
    }

    return options;
  }

  get trigger(): HTMLElement {
    return this._trigger;
  }

  get listbox(): HTMLElement | null {
    let listBoxId = this.trigger.getAttribute('aria-controls');
    return listBoxId ? document.getElementById(listBoxId) : null;
  }

  get sections(): HTMLElement[] {
    let listbox = this.listbox;
    return listbox ? within(listbox).queryAllByRole('group') : [];
  }
}
