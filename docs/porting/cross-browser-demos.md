# Cross-Browser Demos

This page hosts interactive demos used by Playwright cross-browser checks.

<script setup lang="ts">
import { computed, ref } from "vue";
import { useButton, useTab, useTabs } from "@vue-aria/vue-aria";

const pressCount = ref(0);
const lastPointerType = ref("none");

const { buttonProps, isPressed, isFocusVisible } = useButton({
  elementType: "div",
  onPress: (event) => {
    pressCount.value += 1;
    lastPointerType.value = event.pointerType;
  },
});

const tabItems = [
  { key: "overview", label: "Overview", content: "Overview panel content" },
  { key: "api", label: "API", content: "API panel content" },
  { key: "status", label: "Status", content: "Status panel content" },
];

const panelRef = ref<HTMLElement | null>(null);
const overviewRef = ref<HTMLElement | null>(null);
const apiRef = ref<HTMLElement | null>(null);
const statusRef = ref<HTMLElement | null>(null);

const { state: tabState, tabListProps, tabPanelProps } = useTabs(
  {
    state: {
      collection: tabItems,
    },
    tabList: {
      "aria-label": "Cross-browser tabs",
    },
  },
  panelRef
);

const { tabProps: overviewTabProps } = useTab({ key: "overview" }, tabState, overviewRef);
const { tabProps: apiTabProps } = useTab({ key: "api" }, tabState, apiRef);
const { tabProps: statusTabProps } = useTab({ key: "status" }, tabState, statusRef);

const activeTabContent = computed(() => {
  const selectedKey = tabState.selectedKey.value;
  return tabItems.find((item) => item.key === selectedKey)?.content ?? "";
});
</script>

## Press Demo

<div data-testid="press-demo">
  <div
    v-bind="buttonProps"
    data-testid="press-target"
    :data-pressed="isPressed ? '' : undefined"
    :data-focus-visible="isFocusVisible ? '' : undefined"
    style="display: inline-flex; cursor: pointer; user-select: none; border: 1px solid #7f7f7f; border-radius: 0.5rem; padding: 0.5rem 0.75rem; gap: 0.5rem; align-items: center; font-weight: 600;"
  >
    Activate
  </div>

  <p style="margin-top: 0.75rem;">
    Count:
    <strong data-testid="press-count">{{ pressCount }}</strong>
  </p>
  <p>
    Last pointer type:
    <strong data-testid="press-pointer-type">{{ lastPointerType }}</strong>
  </p>
</div>

## Tabs Demo

<section data-testid="tabs-demo">
  <div v-bind="tabListProps" data-testid="tabs-list" style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
    <button ref="overviewRef" v-bind="overviewTabProps" data-testid="tab-overview">Overview</button>
    <button ref="apiRef" v-bind="apiTabProps" data-testid="tab-api">API</button>
    <button ref="statusRef" v-bind="statusTabProps" data-testid="tab-status">Status</button>
  </div>

  <div ref="panelRef" v-bind="tabPanelProps" data-testid="tabs-panel">
    {{ activeTabContent }}
  </div>
</section>
