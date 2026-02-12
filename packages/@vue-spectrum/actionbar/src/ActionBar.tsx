/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionButton} from '-spectrum/button';
import {ActionGroup} from '-spectrum/actiongroup';
import {announce} from '-aria/live-announcer';
import {classNames, useDOMRef, useStyleProps} from '-spectrum/utils';
import CrossLarge from '@spectrum-icons/ui/CrossLarge';
import {DOMRef} from '-types/shared';
import {filterDOMProps} from '-aria/utils';
import {FocusScope} from '-aria/focus';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {OpenTransition} from '-spectrum/overlays';
import React, {ReactElement, Ref, useEffect, useRef, useState} from 'react';
import {SpectrumActionBarProps} from '-types/actionbar';
import styles from './actionbar.css';
import {Text} from '-spectrum/text';
import {useKeyboard} from '-aria/interactions';
import {useLocalizedStringFormatter} from '-aria/i18n';
import {useProviderProps} from '-spectrum/provider';

/**
 * Action bars are used for single and bulk selection patterns when a user needs to perform actions on one or more items at the same time.
 */
export const ActionBar = React.forwardRef(function ActionBar<T extends object>(props: SpectrumActionBarProps<T>, ref: DOMRef<HTMLDivElement>) {
  let isOpen = props.selectedItemCount !== 0;
  let domRef = useDOMRef(ref);

  return (
    <OpenTransition
      nodeRef={domRef}
      in={isOpen}
      mountOnEnter
      unmountOnExit>
      <ActionBarInnerWithRef {...props} ref={domRef} />
    </OpenTransition>
  );
}) as <T>(props: SpectrumActionBarProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;

interface ActionBarInnerProps<T> extends SpectrumActionBarProps<T> {
  isOpen?: boolean
}

function ActionBarInner<T>(props: ActionBarInnerProps<T>, ref: Ref<HTMLDivElement>) {
  props = useProviderProps(props);

  let {
    children,
    isEmphasized,
    onAction,
    onClearSelection,
    selectedItemCount,
    isOpen,
    buttonLabelBehavior = 'collapse',
    items,
    disabledKeys
  } = props;

  let {styleProps} = useStyleProps(props);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '-spectrum/actionbar');

  // Store the last count greater than zero in a ref so that we can retain it while rendering the fade-out animation.
  let [lastCount, setLastCount] = useState(selectedItemCount);
  if ((selectedItemCount === 'all' || selectedItemCount > 0) && selectedItemCount !== lastCount) {
    setLastCount(selectedItemCount);
  }

  let {keyboardProps} = useKeyboard({
    onKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClearSelection();
      }
    }
  });

  // Announce "actions available" on mount.
  let isInitial = useRef(true);
  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      announce(stringFormatter.format('actionsAvailable'));
    }
  }, [stringFormatter]);

  return (
    <FocusScope restoreFocus>
      <div
        {...filterDOMProps(props)}
        {...styleProps}
        {...keyboardProps}
        ref={ref}
        className={classNames(
          styles,
          'react-spectrum-ActionBar', {
            'react-spectrum-ActionBar--emphasized': isEmphasized,
            'is-open': isOpen
          },
          styleProps.className
        )}>
        <div className={classNames(styles, 'react-spectrum-ActionBar-bar')}>
          <ActionGroup
            items={items}
            aria-label={stringFormatter.format('actions')}
            isQuiet
            staticColor={isEmphasized ? 'white' : undefined}
            overflowMode="collapse"
            buttonLabelBehavior={buttonLabelBehavior}
            onAction={onAction}
            disabledKeys={disabledKeys}
            UNSAFE_className={classNames(styles, 'react-spectrum-ActionBar-actionGroup')}>
            {children}
          </ActionGroup>
          <ActionButton
            gridArea={styles.clear}
            aria-label={stringFormatter.format('clearSelection')}
            onPress={() => onClearSelection()}
            isQuiet
            staticColor={isEmphasized ? 'white' : undefined}>
            <CrossLarge />
          </ActionButton>
          <Text UNSAFE_className={classNames(styles, 'react-spectrum-ActionBar-selectedCount')}>
            {lastCount === 'all'
              ? stringFormatter.format('selectedAll')
              : stringFormatter.format('selected', {count: lastCount})}
          </Text>
        </div>
      </div>
    </FocusScope>
  );
}

const ActionBarInnerWithRef = React.forwardRef(ActionBarInner) as <T>(props: ActionBarInnerProps<T> & {ref?: Ref<HTMLDivElement>}) => ReactElement;
