---
layout: home

hero:
  name: vue-aria
  text: React Aria + React Spectrum for Vue
  tagline: Upstream-aligned package ports with parity-focused tests and docs.
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
      text: Migration Status
      link: /porting/status

features:
  - title: Two-Layer Port
    details: "@vue-aria/* hooks are parity-complete baseline; @vue-spectrum/* components are now the active migration track."
  - title: Horizontal Delivery
    details: We move lane by lane and only mark progress after runtime behavior, tests, docs, and previews are aligned.
  - title: Upstream-First Parity
    details: "Behavior and tests are ported from references/react-spectrum with package structure kept close to the original repo."
---

## Current Status

- React Aria layer: parity-complete baseline (maintenance/hardening mode).
- React Spectrum layer: active migration with v1 parity prioritized before S2.
- Focus lane: `@vue-spectrum/button`, `@vue-spectrum/textfield`, and `@vue-spectrum/dialog`.

## Where to track progress

- Source-of-truth docs page: `/porting/status`
- React Spectrum package checklist: `SPECTRUM_PORTING_TRACKER.md`
- React Spectrum strategy/phases: `/porting/spectrum-roadmap`
- React Aria completed tracker: `PORTING_TRACKER.md`
