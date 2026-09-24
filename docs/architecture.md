# Architecture

## Phase 1A boundary

CutoutBG remains a local Python inference engine. `pipeline.py` owns untrusted-image validation and output assembly. `model.py` owns the stable `SegmentationModel` contract and model factory. `birefnet.py` is an optional, lazy adapter for the exact pinned BiRefNet checkpoint; it is not imported or downloaded by ordinary tests.

Weights are external cache artifacts, never repository files. Learned inference requires explicit optional dependencies and a cache path. The adapter reports structured load failures to the CLI rather than making the rest of the pipeline aware of PyTorch or Transformers internals.

No web UI, accounts, billing, production API, GPU deployment, or production claims are part of Phase 1A.
