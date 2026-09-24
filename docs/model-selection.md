# Model selection

## Phase 1A candidate

BiRefNet general is the first learned adapter because the upstream project publishes an official implementation and Hugging Face checkpoint. The exact model identifier is `zhengpeng7/BiRefNet`, pinned to revision `e2bf8e4460fc8fa32bba5ea4d94b3233d367b0e4`. The adapter uses the official 1024x1024 preprocessing recipe and restores masks to the source dimensions.

The adapter is intentionally optional and lazy: ordinary CI does not install or download PyTorch, torchvision, Transformers, or model weights. Install the `ml` extra only for a local evaluation, provide a populated revision-pinned cache, and run with `--cache-dir`. Commercial status remains `REQUIRES LEGAL REVIEW`; no production recommendation has been made.

## Contract

All models implement `SegmentationModel`. The pipeline receives only an alpha mask and does not depend on BiRefNet internals.
