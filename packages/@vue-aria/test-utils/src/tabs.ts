import { act, within } from './testing';
import { TabsTesterOpts, UserOpts, Orientation } from './types';
import { pressElement } from './events';

interface TriggerTabOptions {
  interactionType?: UserOpts['interactionType'],
  tab: number | string | HTMLElement,
  manualActivation?: boolean
}

export class TabsTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _tablist: HTMLElement;
  private _direction: TabsTesterOpts['direction'];

  constructor(opts: TabsTesterOpts) {
    let {root, user, interactionType, direction} = opts;
    this.user = user;
    this._interactionType = interactionType || 'mouse';
    this._direction = direction || 'ltr';

    this._tablist = root;
    let tablist = within(root).queryAllByRole('tablist');
    if (tablist.length > 0) {
      this._tablist = tablist[0];
    }
  }

  setInteractionType(type: UserOpts['interactionType']): void {
    this._interactionType = type;
  }

  findTab(opts: {tabIndexOrText: number | string}): HTMLElement {
    let {
      tabIndexOrText
    } = opts;

    let tab;
    let tabs = this.tabs;
    if (typeof tabIndexOrText === 'number') {
      tab = tabs[tabIndexOrText];
    } else if (typeof tabIndexOrText === 'string') {
      tab = (within(this._tablist).getByText(tabIndexOrText).closest('[role=tab]')) as HTMLElement;
    }

    return tab;
  }

  private async keyboardNavigateToTab(opts: {tab: HTMLElement, orientation?: Orientation}) {
    let {tab, orientation = 'vertical'} = opts;
    let tabs = this.tabs;
    tabs = tabs.filter(tab => !(tab.hasAttribute('disabled') || tab.getAttribute('aria-disabled') === 'true'));
    if (tabs.length === 0) {
      throw new Error('Tablist doesnt have any non-disabled tabs. Please double check your tabs implementation.');
    }

    let targetIndex = tabs.indexOf(tab);
    if (targetIndex === -1) {
      throw new Error('Tab provided is not in the tablist');
    }

    if (!this._tablist.contains(document.activeElement)) {
      let selectedTab = this.selectedTab;
      if (selectedTab != null) {
        act(() => selectedTab.focus());
      } else {
        act(() => tabs[0]?.focus());
      }
    }

    let currIndex = tabs.indexOf(document.activeElement as HTMLElement);
    if (currIndex === -1) {
      throw new Error('ActiveElement is not in the tablist');
    }

    let arrowUp = 'ArrowUp';
    let arrowDown = 'ArrowDown';
    if (orientation === 'horizontal') {
      if (this._direction === 'ltr') {
        arrowUp = 'ArrowLeft';
        arrowDown = 'ArrowRight';
      } else {
        arrowUp = 'ArrowRight';
        arrowDown = 'ArrowLeft';
      }
    }

    let movementDirection = targetIndex > currIndex ? 'down' : 'up';
    for (let i = 0; i < Math.abs(targetIndex - currIndex); i++) {
      await this.user.keyboard(`[${movementDirection === 'down' ? arrowDown : arrowUp}]`);
    }
  };

  async triggerTab(opts: TriggerTabOptions): Promise<void> {
    let {
      tab,
      interactionType = this._interactionType,
      manualActivation
    } = opts;

    if (typeof tab === 'string' || typeof tab === 'number') {
      tab = this.findTab({tabIndexOrText: tab});
    }

    if (!tab) {
      throw new Error('Target tab not found in the tablist.');
    } else if (tab.hasAttribute('disabled')) {
      throw new Error('Target tab is disabled.');
    }

    if (interactionType === 'keyboard') {
      if (document.activeElement !== this._tablist && !this._tablist.contains(document.activeElement)) {
        act(() => this._tablist.focus());
      }

      let tabsOrientation = this._tablist.getAttribute('aria-orientation') || 'horizontal';
      await this.keyboardNavigateToTab({tab, orientation: tabsOrientation as Orientation});
      if (manualActivation) {
        await this.user.keyboard('[Enter]');
      }
    } else {
      await pressElement(this.user, tab, interactionType);
    }
  }

  get tablist(): HTMLElement {
    return this._tablist;
  }

  get tabs(): HTMLElement[] {
    return within(this.tablist).queryAllByRole('tab');
  }

  get selectedTab(): HTMLElement | null {
    return this.tabs.find(tab => tab.getAttribute('aria-selected') === 'true') || null;
  }

  get activeTabpanel(): HTMLElement | null {
    let activeTabpanelId = this.selectedTab?.getAttribute('aria-controls');
    return activeTabpanelId ? document.getElementById(activeTabpanelId) : null;
  }

  get tabpanels(): HTMLElement[] {
    let tabpanels = [] as HTMLElement[];
    for (let tab of this.tabs) {
      let controlId = tab.getAttribute('aria-controls');
      let panel = controlId != null ? document.getElementById(controlId) : null;
      if (panel != null) {
        tabpanels.push(panel);
      }
    }

    return tabpanels;
  }
}
