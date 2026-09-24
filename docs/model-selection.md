# Model selection

Phase 1 intentionally does not approve a learned production model. The only executable adapter is `center-contrast-smoke-test`, a deterministic dependency-light smoke-test model with no downloaded weights. It proves the contract and pipeline without making unsupported commercial-use claims.

## Candidates requiring license gates

| Candidate | Source | Phase 1 status |
|---|---|---|
| BiRefNet | https://github.com/ZhengPeng7/BiRefNet | Not downloaded; code/weight release terms require review |
| RMBG-2.0 | https://huggingface.co/briaai/RMBG-2.0 | Not downloaded; BRIA weight terms require explicit review |
| U²-Net | https://github.com/xuebinqin/U-2-Net | Not downloaded; weight provenance and terms require review |
| MODNet | https://github.com/ZHKKKe/MODNet | Not downloaded; portrait-focused comparison only |
| SAM | https://github.com/facebookresearch/segment-anything | Not downloaded; research comparison only |

## Contract

`SegmentationModel` exposes metadata, `load`, `preprocess`, `infer`, `postprocess`, and `close`. The pipeline never imports a model-specific package. A future learned adapter must provide exact revision, code license, weight license, attribution, redistribution, runtime, and device support before it is enabled.
