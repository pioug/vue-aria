import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();

const requiredTestFiles = [
  "packages/@vue-aria/utils/test/mergeProps.test.ts",
  "packages/@vue-aria/utils/test/filterDOMProps.test.ts",
  "packages/@vue-aria/utils/test/nodeContains.test.ts",
  "packages/@vue-aria/utils/test/router.test.ts",
  "packages/@vue-aria/utils/test/useLoadMore.test.ts",
  "packages/@vue-aria/utils/test/useLoadMoreSentinel.test.ts",
  "packages/@vue-aria/utils/test/useDescription.test.ts",
  "packages/@vue-aria/utils/test/useErrorMessage.test.ts",
  "packages/@vue-aria/ssr/test/useId.test.ts",
  "packages/@vue-aria/ssr/test/ssrProvider.test.ts",
  "packages/@vue-aria/ssr/test/hydration.test.ts",
  "packages/@vue-aria/live-announcer/test/liveAnnouncer.test.ts",
  "packages/@vue-aria/i18n/test/useLocale.test.ts",
  "packages/@vue-aria/focus/test/useFocusVisible.test.ts",
  "packages/@vue-aria/focus/test/useFocusRing.test.ts",
  "packages/@vue-aria/interactions/test/usePress.test.ts",
  "packages/@vue-aria/interactions/test/useKeyboard.test.ts",
  "packages/@vue-aria/interactions/test/useFocus.test.ts",
  "packages/@vue-aria/interactions/test/useFocusWithin.test.ts",
  "packages/@vue-aria/interactions/test/useHover.test.ts",
  "packages/@vue-aria/interactions/test/useLongPress.test.ts",
  "packages/@vue-aria/interactions/test/useMove.test.ts",
  "packages/@vue-aria/interactions/test/useInteractOutside.test.ts",
  "packages/@vue-aria/dnd/test/useClipboard.test.ts",
  "packages/@vue-aria/dnd/test/DragPreview.test.ts",
  "packages/@vue-aria/dnd/test/useDrag.test.ts",
  "packages/@vue-aria/dnd/test/useDrop.test.ts",
  "packages/@vue-aria/dnd/test/useAutoScroll.test.ts",
  "packages/@vue-aria/dnd/test/useDraggableCollection.test.ts",
  "packages/@vue-aria/dnd/test/useDraggableItem.test.ts",
  "packages/@vue-aria/dnd/test/useDropIndicator.test.ts",
  "packages/@vue-aria/dnd/test/useDroppableCollection.test.ts",
  "packages/@vue-aria/dnd/test/useDroppableItem.test.ts",
  "packages/@vue-aria/dnd/test/DropTargetKeyboardNavigation.test.ts",
  "packages/@vue-aria/dnd/test/ListDropTargetDelegate.test.ts",
  "packages/@vue-aria/dnd/test/DragManager.test.ts",
  "packages/@vue-aria/dnd/test/dnd.ssr.test.ts",
  "packages/@vue-aria/dnd/test/useVirtualDrop.test.ts",
  "packages/@vue-aria/dnd-state/test/useDraggableCollectionState.test.ts",
  "packages/@vue-aria/dnd-state/test/useDroppableCollectionState.test.ts",
  "packages/@vue-aria/button/test/useButton.test.ts",
  "packages/@vue-aria/button/test/useToggleButton.test.ts",
  "packages/@vue-aria/checkbox/test/useCheckbox.test.ts",
  "packages/@vue-aria/checkbox/test/useCheckboxGroup.test.ts",
  "packages/@vue-aria/radio/test/useRadioGroup.test.ts",
  "packages/@vue-aria/radio/test/useRadio.test.ts",
  "packages/@vue-aria/switch/test/useSwitch.test.ts",
  "packages/@vue-aria/tabs/test/useTabListState.test.ts",
  "packages/@vue-aria/tabs/test/useTabList.test.ts",
  "packages/@vue-aria/tabs/test/useTab.test.ts",
  "packages/@vue-aria/tabs/test/useTabPanel.test.ts",
  "packages/@vue-aria/tabs/test/useTabs.test.ts",
  "packages/@vue-aria/slider/test/useSlider.test.ts",
  "packages/@vue-aria/slider/test/useSliderThumb.test.ts",
  "packages/@vue-aria/slider/test/useSliderState.test.ts",
  "packages/@vue-aria/progress/test/useProgressBar.test.ts",
  "packages/@vue-aria/progress/test/useProgressCircle.test.ts",
  "packages/@vue-aria/meter/test/useMeter.test.ts",
  "packages/@vue-aria/toast-state/test/useToastState.test.ts",
  "packages/@vue-aria/toast/test/useToast.test.ts",
  "packages/@vue-aria/toast/test/useToastRegion.test.ts",
  "packages/@vue-aria/datefield/test/useDateField.test.ts",
  "packages/@vue-aria/datefield/test/useDateSegment.test.ts",
  "packages/@vue-aria/datepicker/test/useDatePickerGroup.test.ts",
  "packages/@vue-aria/datepicker/test/useDatePicker.test.ts",
  "packages/@vue-aria/datepicker/test/useDateRangePicker.test.ts",
  "packages/@vue-aria/datepicker/test/useTimeField.test.ts",
  "packages/@vue-aria/datepicker-state/test/useDatePickerState.test.ts",
  "packages/@vue-aria/calendar/test/useCalendar.test.ts",
  "packages/@vue-aria/calendar/test/useRangeCalendar.test.ts",
  "packages/@vue-aria/calendar/test/useCalendarCell.test.ts",
  "packages/@vue-aria/calendar-state/test/useCalendarState.test.ts",
  "packages/@vue-aria/calendar-state/test/useRangeCalendarState.test.ts",
  "packages/@vue-aria/breadcrumbs/test/useBreadcrumbItem.test.ts",
  "packages/@vue-aria/disclosure/test/useDisclosureState.test.ts",
  "packages/@vue-aria/disclosure/test/useDisclosureGroupState.test.ts",
  "packages/@vue-aria/disclosure/test/useAccordionItem.test.ts",
  "packages/@vue-aria/disclosure/test/useDisclosure.test.ts",
  "packages/@vue-aria/collections/test/buildCollection.test.ts",
  "packages/@vue-aria/menu/test/useMenuTriggerState.test.ts",
  "packages/@vue-aria/menu/test/useSubmenuTriggerState.test.ts",
  "packages/@vue-aria/menu/test/useMenuTrigger.test.ts",
  "packages/@vue-aria/menu/test/useMenu.test.ts",
  "packages/@vue-aria/menu/test/useMenuItem.test.ts",
  "packages/@vue-aria/menu/test/useMenuSection.test.ts",
  "packages/@vue-aria/menu/test/useSubmenuTrigger.test.ts",
  "packages/@vue-aria/overlays-state/test/useOverlayTriggerState.test.ts",
  "packages/@vue-aria/toggle-state/test/useToggleState.test.ts",
  "packages/@vue-aria/overlays/test/useOverlayTrigger.test.ts",
  "packages/@vue-aria/overlays/test/useOverlay.test.ts",
  "packages/@vue-aria/overlays/test/useOverlayPosition.test.ts",
  "packages/@vue-aria/overlays/test/useModal.test.ts",
  "packages/@vue-aria/overlays/test/useModalOverlay.test.ts",
  "packages/@vue-aria/overlays/test/usePreventScroll.test.ts",
  "packages/@vue-aria/overlays/test/usePopover.test.ts",
  "packages/@vue-aria/dialog/test/useDialog.test.ts",
  "packages/@vue-aria/tooltip/test/useTooltip.test.ts",
  "packages/@vue-aria/listbox/test/useListBoxState.test.ts",
  "packages/@vue-aria/listbox/test/useListBox.test.ts",
  "packages/@vue-aria/listbox/test/useOption.test.ts",
  "packages/@vue-aria/listbox/test/useListBoxSection.test.ts",
  "packages/@vue-aria/list-state/test/useListState.test.ts",
  "packages/@vue-aria/grid/test/useGrid.test.ts",
  "packages/@vue-aria/grid/test/useGridCell.test.ts",
  "packages/@vue-aria/gridlist/test/useGridList.test.ts",
  "packages/@vue-aria/gridlist/test/useGridListItem.test.ts",
  "packages/@vue-aria/tree/test/useTree.test.ts",
  "packages/@vue-aria/tree/test/useTreeItem.test.ts",
  "packages/@vue-aria/tree-state/test/useTreeState.test.ts",
  "packages/@vue-aria/virtualizer/test/Virtualizer.component.test.ts",
  "packages/@vue-aria/virtualizer/test/components.test.ts",
  "packages/@vue-aria/virtualizer/test/VirtualizerItem.test.ts",
  "packages/@vue-aria/virtualizer/test/useScrollView.test.ts",
  "packages/@vue-aria/virtualizer/test/useVirtualizer.test.ts",
  "packages/@vue-aria/virtualizer/test/useVirtualizerItem.test.ts",
  "packages/@vue-aria/virtualizer/test/utils.test.ts",
  "packages/@vue-aria/virtualizer-state/test/LayoutInfo.test.ts",
  "packages/@vue-aria/virtualizer-state/test/OverscanManager.test.ts",
  "packages/@vue-aria/virtualizer-state/test/Virtualizer.test.ts",
  "packages/@vue-aria/virtualizer-state/test/useVirtualizerState.test.ts",
  "packages/@vue-aria/virtualizer-state/test/utils.test.ts",
  "packages/@vue-aria/table/test/useTable.test.ts",
  "packages/@vue-aria/table/test/useTableRow.test.ts",
  "packages/@vue-aria/table/test/useTableCell.test.ts",
  "packages/@vue-aria/table/test/useTableColumnHeader.test.ts",
  "packages/@vue-aria/table-state/test/useTableState.test.ts",
  "packages/@vue-aria/selection/test/useListKeyboardDelegate.test.ts",
  "packages/@vue-aria/selection/test/useGridKeyboardDelegate.test.ts",
  "packages/@vue-aria/selection/test/useTypeSelect.test.ts",
  "packages/@vue-aria/selection-state/test/useMultipleSelectionState.test.ts",
  "packages/@vue-aria/combobox-state/test/useComboBoxState.test.ts",
  "packages/@vue-aria/combobox/test/useComboBox.test.ts",
  "packages/@vue-aria/link/test/useLink.test.ts",
  "packages/@vue-aria/label/test/useLabel.test.ts",
  "packages/@vue-aria/label/test/useField.test.ts",
  "packages/@vue-aria/textfield/test/useTextField.test.ts",
  "packages/@vue-aria/searchfield/test/useSearchField.test.ts",
  "packages/@vue-aria/select/test/useSelectState.test.ts",
  "packages/@vue-aria/select/test/useSelect.test.ts",
  "packages/@vue-aria/numberfield/test/useNumberField.test.ts",
  "packages/@vue-aria/spinbutton/test/useSpinButton.test.ts",
  "packages/@vue-aria/separator/test/useSeparator.test.ts",
  "packages/@vue-aria/visually-hidden/test/useVisuallyHidden.test.ts",
];

const missing = requiredTestFiles.filter((file) => {
  const absolute = path.join(root, file);
  return !fs.existsSync(absolute);
});

if (missing.length > 0) {
  console.error("Parity check failed. Missing test files:");
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

function collectTestFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const tests = [];
  const stack = [directory];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }

    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const next = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(next);
        continue;
      }

      if (entry.isFile() && entry.name.endsWith(".test.ts")) {
        tests.push(next);
      }
    }
  }

  return tests;
}

const packageRoot = path.join(root, "packages", "@vue-aria");
const testAuditExclusions = new Set(["types", "vue-aria"]);
const packagesMissingHookTests = [];

for (const entry of fs.readdirSync(packageRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) {
    continue;
  }

  if (testAuditExclusions.has(entry.name)) {
    continue;
  }

  const packageDir = path.join(packageRoot, entry.name);
  const runtimeEntry = path.join(packageDir, "src", "index.ts");
  if (!fs.existsSync(runtimeEntry)) {
    continue;
  }

  const tests = collectTestFiles(path.join(packageDir, "test"));
  if (tests.length === 0) {
    packagesMissingHookTests.push(path.relative(root, packageDir));
  }
}

if (packagesMissingHookTests.length > 0) {
  console.error("Parity check failed. Packages missing test coverage:");
  for (const packageDir of packagesMissingHookTests) {
    console.error(`- ${packageDir}`);
  }
  process.exit(1);
}

console.log("Parity check passed for currently ported modules.");
