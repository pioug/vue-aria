# Test Parity

Behavior parity is required for every ported hook.

## Rules

1. Read upstream implementation and tests from `references/react-spectrum`.
2. Port behavior first, then port the corresponding test scenarios.
3. Do not mark a hook complete until both implementation and test parity pass.

## Local Commands

```bash
npm run test
npm run test:parity
```

## Current Coverage

Current test files:

- `packages/@vue-aria/utils/test/mergeProps.test.ts`
- `packages/@vue-aria/utils/test/filterDOMProps.test.ts`
- `packages/@vue-aria/utils/test/nodeContains.test.ts`
- `packages/@vue-aria/utils/test/router.test.ts`
- `packages/@vue-aria/utils/test/useDescription.test.ts`
- `packages/@vue-aria/utils/test/useErrorMessage.test.ts`
- `packages/@vue-aria/ssr/test/useId.test.ts`
- `packages/@vue-aria/ssr/test/ssrProvider.test.ts`
- `packages/@vue-aria/live-announcer/test/liveAnnouncer.test.ts`
- `packages/@vue-aria/i18n/test/useLocale.test.ts`
- `packages/@vue-aria/focus/test/useFocusVisible.test.ts`
- `packages/@vue-aria/focus/test/useFocusRing.test.ts`
- `packages/@vue-aria/interactions/test/usePress.test.ts`
- `packages/@vue-aria/interactions/test/useKeyboard.test.ts`
- `packages/@vue-aria/interactions/test/useFocus.test.ts`
- `packages/@vue-aria/interactions/test/useFocusWithin.test.ts`
- `packages/@vue-aria/interactions/test/useHover.test.ts`
- `packages/@vue-aria/interactions/test/useLongPress.test.ts`
- `packages/@vue-aria/interactions/test/useMove.test.ts`
- `packages/@vue-aria/interactions/test/useInteractOutside.test.ts`
- `packages/@vue-aria/button/test/useButton.test.ts`
- `packages/@vue-aria/button/test/useToggleButton.test.ts`
- `packages/@vue-aria/checkbox/test/useCheckbox.test.ts`
- `packages/@vue-aria/checkbox/test/useCheckboxGroup.test.ts`
- `packages/@vue-aria/radio/test/useRadioGroup.test.ts`
- `packages/@vue-aria/radio/test/useRadio.test.ts`
- `packages/@vue-aria/switch/test/useSwitch.test.ts`
- `packages/@vue-aria/tabs/test/useTabListState.test.ts`
- `packages/@vue-aria/tabs/test/useTabList.test.ts`
- `packages/@vue-aria/tabs/test/useTab.test.ts`
- `packages/@vue-aria/tabs/test/useTabPanel.test.ts`
- `packages/@vue-aria/tabs/test/useTabs.test.ts`
- `packages/@vue-aria/slider/test/useSlider.test.ts`
- `packages/@vue-aria/slider/test/useSliderThumb.test.ts`
- `packages/@vue-aria/slider/test/useSliderState.test.ts`
- `packages/@vue-aria/progress/test/useProgressBar.test.ts`
- `packages/@vue-aria/progress/test/useProgressCircle.test.ts`
- `packages/@vue-aria/meter/test/useMeter.test.ts`
- `packages/@vue-aria/datefield/test/useDateField.test.ts`
- `packages/@vue-aria/datefield/test/useDateSegment.test.ts`
- `packages/@vue-aria/datepicker/test/useDatePickerGroup.test.ts`
- `packages/@vue-aria/datepicker/test/useDatePicker.test.ts`
- `packages/@vue-aria/datepicker/test/useDateRangePicker.test.ts`
- `packages/@vue-aria/datepicker/test/useTimeField.test.ts`
- `packages/@vue-aria/calendar/test/useCalendar.test.ts`
- `packages/@vue-aria/calendar/test/useRangeCalendar.test.ts`
- `packages/@vue-aria/calendar/test/useCalendarCell.test.ts`
- `packages/@vue-aria/breadcrumbs/test/useBreadcrumbItem.test.ts`
- `packages/@vue-aria/disclosure/test/useDisclosureState.test.ts`
- `packages/@vue-aria/disclosure/test/useDisclosureGroupState.test.ts`
- `packages/@vue-aria/disclosure/test/useAccordionItem.test.ts`
- `packages/@vue-aria/disclosure/test/useDisclosure.test.ts`
- `packages/@vue-aria/collections/test/buildCollection.test.ts`
- `packages/@vue-aria/menu/test/useMenuTriggerState.test.ts`
- `packages/@vue-aria/menu/test/useMenuTrigger.test.ts`
- `packages/@vue-aria/menu/test/useMenu.test.ts`
- `packages/@vue-aria/menu/test/useMenuItem.test.ts`
- `packages/@vue-aria/menu/test/useMenuSection.test.ts`
- `packages/@vue-aria/overlays-state/test/useOverlayTriggerState.test.ts`
- `packages/@vue-aria/overlays/test/useOverlayTrigger.test.ts`
- `packages/@vue-aria/overlays/test/useOverlay.test.ts`
- `packages/@vue-aria/overlays/test/useOverlayPosition.test.ts`
- `packages/@vue-aria/overlays/test/useModal.test.ts`
- `packages/@vue-aria/overlays/test/useModalOverlay.test.ts`
- `packages/@vue-aria/overlays/test/usePopover.test.ts`
- `packages/@vue-aria/dialog/test/useDialog.test.ts`
- `packages/@vue-aria/tooltip/test/useTooltip.test.ts`
- `packages/@vue-aria/listbox/test/useListBoxState.test.ts`
- `packages/@vue-aria/listbox/test/useListBox.test.ts`
- `packages/@vue-aria/listbox/test/useOption.test.ts`
- `packages/@vue-aria/listbox/test/useListBoxSection.test.ts`
- `packages/@vue-aria/selection/test/useListKeyboardDelegate.test.ts`
- `packages/@vue-aria/selection/test/useTypeSelect.test.ts`
- `packages/@vue-aria/link/test/useLink.test.ts`
- `packages/@vue-aria/label/test/useLabel.test.ts`
- `packages/@vue-aria/label/test/useField.test.ts`
- `packages/@vue-aria/textfield/test/useTextField.test.ts`
- `packages/@vue-aria/searchfield/test/useSearchField.test.ts`
- `packages/@vue-aria/select/test/useSelectState.test.ts`
- `packages/@vue-aria/select/test/useSelect.test.ts`
- `packages/@vue-aria/numberfield/test/useNumberField.test.ts`
- `packages/@vue-aria/spinbutton/test/useSpinButton.test.ts`
- `packages/@vue-aria/separator/test/useSeparator.test.ts`
- `packages/@vue-aria/visually-hidden/test/useVisuallyHidden.test.ts`

## What "Parity" Means

- Keyboard, pointer, and virtual-input behavior must align.
- Accessibility attributes and semantics must align.
- Cancellation and edge-case behavior should match upstream expectations.
