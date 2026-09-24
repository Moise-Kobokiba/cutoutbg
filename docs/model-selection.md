# Model selection

## Decision rule
Choose the model that meets commercial licensing requirements and the benchmark quality target, not the model with the most attractive demo. Model code, downloaded weights, dependencies, and training data must each be reviewed separately.

## Candidates for Phase 1

| Candidate | Primary source | Initial disposition |
|---|---|---|
| BiRefNet | https://github.com/ZhengPeng7/BiRefNet | Benchmark candidate; code license and each weight release must be verified before use. |
| RMBG-2.0 | https://huggingface.co/briaai/RMBG-2.0 | Quality baseline candidate; do not use commercially until the weight license and any BRIA commercial terms are approved. |
| U²-Net | https://github.com/xuebinqin/U-2-Net | Reproducible comparison candidate; older architecture and weight provenance require review. |
| MODNet | https://github.com/ZHKKKe/MODNet | Human portrait/matting comparison candidate; not assumed suitable for general objects. |
| SAM-family pipeline | https://github.com/facebookresearch/segment-anything | Research comparison only; segmentation prompts and matting/refinement add complexity and license review. |

## Evaluation dimensions
Quality is measured on representative, legally usable test images: edge quality, fine-detail preservation, foreground leakage, background leakage, and failure rate. Operational measures are latency, peak memory, CPU/GPU utilization, output resolution, and cold-start load time.

## Recommendation
No commercial model is approved in Phase 0. Start Phase 1 with a license-gated benchmark harness for BiRefNet, RMBG-2.0, U²-Net, and MODNet. Keep the production adapter replaceable. A candidate may be recommended only after a written license review and reproducible benchmark run.

## Model adapter contract
Each adapter must expose:

```text
load(config) -> loaded model
metadata() -> name, version, source, license, weight license, supported limits
preprocess(image) -> tensor/input
infer(input) -> raw prediction
postprocess(prediction, original size) -> alpha mask
health() -> readiness and device information
```

The API must depend on job and output contracts, never on a specific Python package or model name.

## Primary references
- BiRefNet repository: https://github.com/ZhengPeng7/BiRefNet
- RMBG-2.0 model card: https://huggingface.co/briaai/RMBG-2.0
- U²-Net repository: https://github.com/xuebinqin/U-2-Net
- MODNet repository: https://github.com/ZHKKKe/MODNet
- Segment Anything repository: https://github.com/facebookresearch/segment-anything
