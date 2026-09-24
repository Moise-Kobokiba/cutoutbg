# CutoutBG

CutoutBG is an independent AI image-processing platform, beginning with background removal.

## Current phase: Phase 0

This repository currently contains the technical foundation and due-diligence documentation. The production web application, public API, billing, and deployment infrastructure are intentionally not implemented yet.

Read the [Phase 0 architecture](docs/architecture.md), [model selection](docs/model-selection.md), [licensing review](docs/model-licensing.md), and [benchmark plan](docs/model-benchmark.md) first.

## Principles

- Treat uploaded images as untrusted data.
- Keep model code and model-weight licensing separate.
- Do not claim benchmark results that have not been run.
- Keep inference replaceable behind a model contract.
- Follow Apple Human Interface Guidelines for the future product experience: https://developer.apple.com/design/human-interface-guidelines/design-principles

## Phase 1 gate
Before implementation begins, approve a commercially usable model revision, secure a permissioned benchmark corpus, and agree on the GPU/storage/authentication choices documented as open decisions.
