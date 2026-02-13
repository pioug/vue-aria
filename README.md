# vue-aria

Vue port of React Aria and React Spectrum.

## Baseline

- Upstream repository: `https://github.com/adobe/react-spectrum`
- Locked baseline SHA is documented in:
  - `PORT_BASELINE.md`
  - `package.json` (`upstreamBaselineSha`)
  - `status.json` (`baselineSha`)

## Core Commands

- `npm test`: run all unit + SSR tests.
- `npm run check:ci`: run the full local CI gate:
  - baseline consistency check
  - local-only dependency/workspace consistency check
  - parity regression check
  - upstream/status test parity check
  - deviations/status consistency check
  - docs frontmatter package metadata check
  - status page generation + validation
  - port order computation
  - full test suite

## Status Artifacts

- `status.json`: canonical machine-readable port progress.
- `status.md`: generated summary (`npm run generate:status`).
- `docs/port-status.md`: generated static docs status page (`npm run generate:docs-status`).
- `port-order.json`: generated dependency-leaf ordering (`npm run compute:port-order`).

Generated files should not be edited by hand.
