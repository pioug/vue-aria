---
layout: home

hero:
  name: vue-aria
  text: Accessible interaction primitives for Vue
  tagline: A package-structured port of React Aria, built for Vue 3 composables.
  image:
    src: /logo.svg
    alt: vue-aria
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: Package Docs
      link: /packages/overview
    - theme: alt
      text: Porting Tracker
      link: /porting/roadmap

features:
  - title: React Aria-Aligned Structure
    details: Code is split into `@vue-aria/*` packages so each hook family maps cleanly to the upstream source.
  - title: Test-Parity Workflow
    details: Porting requires preserving behavior and bringing over relevant test scenarios for each hook.
  - title: Vue-Native API Shape
    details: Hooks expose reactive refs and prop objects designed for Vue templates while keeping accessibility semantics.
---

## Current Coverage

Implemented packages and hooks:

- `@vue-aria/ssr`: `useId`
- `@vue-aria/focus`: `useFocusVisible`, `useFocusRing`
- `@vue-aria/interactions`: `usePress`
- `@vue-aria/button`: `useButton`
- `@vue-aria/utils`: `mergeProps`

## Upstream Reference

The upstream React Aria monorepo is added as a git submodule at:

- `references/react-spectrum`

Use it as the source of truth for behavior and test cases while porting.
