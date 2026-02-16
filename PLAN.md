# Vue Aria / Vue Spectrum Porting Plan

## 1) Mission
Maintain strict parity between the Vue port and the upstream sources in `references/react-spectrum`.

## 2) Date
Created: 2026-02-16

## 3) Reference rule
For this phase, parity targets are constrained to:

- `references/react-spectrum/packages/@react-aria`
- `references/react-spectrum/packages/@react-spectrum`
- `references/react-spectrum/packages/@react-stately`

Other work in `references/` (for example `@react-types`, `@adobe/*`, `@internationalized/*`, or external test tooling packages) is **out of scope for this gap pass** unless explicitly pulled into plan later.

## 4) Package mapping convention
- `@react-aria/<name>` maps to `@vue-aria/<name>`
- `@react-spectrum/<name>` maps to `@vue-spectrum/<name>`
- `@react-stately/<name>` maps to `@vue-stately/<name>` for new work going forward.
- Existing legacy state packages are currently under `@vue-aria/<name>-state` where already ported.
- Any mapping exceptions are documented explicitly in `ROADMAP.md`
- In plan/roadmap staging, `@react-stately` entries are written with full upstream package names (for example `@react-stately/layout`) to match reference naming.

## 5) Gate for a package entering `Complete`
1. Public API parity with upstream package surface
2. Behavioral parity evidence in parity tests or upstream-backed test rationale
3. Accessibility parity evidence (where relevant)
4. Visual parity evidence (for visual packages) through docs/examples parity checks
5. No remaining React runtime dependency in that package
6. Package appears in roadmap status as `Complete`

## 6) Operating cycle
1. Run package inventory against `references/`
2. Update `ROADMAP.md` gaps and priorities
3. Close the highest-priority gap block in one slice
4. Run local checks for that slice
5. Update package and roadmap status
6. Repeat

## 7) Roadmap format requirements
`ROADMAP.md` is now canonical and must include for each package:
- Mapped upstream source package(s)
- Current status (`Complete`, `In progress`, `Not started`, `Blocked`)
- Explicit blocker and close condition if not `Complete`

## 8) In this pass
This pass focuses on fixing **reference consistency gaps** (missing mappings and namespace alignment) before continuing feature-level completion work.
