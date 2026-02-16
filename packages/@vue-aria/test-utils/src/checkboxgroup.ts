import {act, within} from './testing';
import {BaseTester} from "./_base";
import {CheckboxGroupTesterOpts, UserOpts} from './types';
import {pressElement} from './events';

interface TriggerCheckboxOptions {
  interactionType?: UserOpts['interactionType'];
  checkbox: number | string | HTMLElement;
}

export class CheckboxGroupTester extends BaseTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _checkboxgroup: HTMLElement;


  constructor(opts: CheckboxGroupTesterOpts) {
    let {root, user, interactionType} = opts;
    super(opts);
    this.user = user;
    this._interactionType = interactionType || 'mouse';

    this._checkboxgroup = root;
    let checkboxgroup = within(root).queryAllByRole('group');
    if (checkboxgroup.length > 0) {
      this._checkboxgroup = checkboxgroup[0];
    }
  }

  setInteractionType(type: UserOpts['interactionType']): void {
    this._interactionType = type;
  }

  findCheckbox(opts: {checkboxIndexOrText: number | string}): HTMLElement | undefined {
    let {checkboxIndexOrText} = opts;
    let checkbox;
    if (typeof checkboxIndexOrText === 'number') {
      checkbox = this.checkboxes[checkboxIndexOrText];
    } else if (typeof checkboxIndexOrText === 'string') {
      let label = within(this.checkboxgroup).queryByText(checkboxIndexOrText) as HTMLElement;
      if (label) {
        checkbox = within(label).queryByRole('checkbox');
        if (!checkbox) {
          let labelWrapper = label.closest('label');
          if (labelWrapper) {
            checkbox = within(labelWrapper).queryByRole('checkbox');
          } else {
            checkbox = label.closest('[role=checkbox]');
          }
        }
      }
    }

    return checkbox ?? undefined;
  }

  private async keyboardNavigateToCheckbox(opts: {checkbox: HTMLElement}) {
    let {checkbox} = opts;
    let checkboxes = this.checkboxes;
    checkboxes = checkboxes.filter(checkbox => !(checkbox.hasAttribute('disabled') || checkbox.getAttribute('aria-disabled') === 'true'));
    if (checkboxes.length === 0) {
      throw new Error('Checkbox group doesnt have any non-disabled checkboxes. Please double check your checkbox group.');
    }

    let targetIndex = checkboxes.indexOf(checkbox);
    if (targetIndex === -1) {
      throw new Error('Checkbox provided is not in the checkbox group.');
    }

    if (!this.checkboxgroup.contains(document.activeElement)) {
      act(() => checkboxes[0]?.focus());
    }

    let currIndex = checkboxes.indexOf(document.activeElement as HTMLElement);
    if (currIndex === -1) {
      throw new Error('Active element is not in the checkbox group.');
    }

    for (let i = 0; i < Math.abs(targetIndex - currIndex); i++) {
      await this.user.keyboard('[ArrowDown]');
    }
  };

  async toggleCheckbox(opts: TriggerCheckboxOptions): Promise<void> {
    let {
      checkbox,
      interactionType = this._interactionType,
    } = opts;

    if (typeof checkbox === 'string' || typeof checkbox === 'number') {
      checkbox = this.findCheckbox({checkboxIndexOrText: checkbox});
    }

    if (!checkbox) {
      throw new Error('Target checkbox not found in the checkboxgroup.');
    } else if (checkbox.hasAttribute('disabled')) {
      throw new Error('Target checkbox is disabled.');
    }

    if (interactionType === 'keyboard') {
      await this.keyboardNavigateToCheckbox({checkbox});
      await this.user.keyboard('[Space]');
    } else {
      await pressElement(this.user, checkbox, interactionType);
    }
  }

  get checkboxgroup(): HTMLElement {
    return this._checkboxgroup;
  }

  get checkboxes(): HTMLElement[] {
    return within(this.checkboxgroup).queryAllByRole('checkbox');
  }

  get selectedCheckboxes(): HTMLElement[] {
    return this.checkboxes.filter(checkbox => (checkbox as HTMLInputElement).checked || checkbox.getAttribute('aria-checked') === 'true');
  }
}
