# Phase 1D complete benchmark results

## Decision

**CONTINUE EVALUATION.** The complete real-model CPU run succeeded technically across all 13 fixtures, but the generated dataset has no ground-truth masks, visual review remains limited, CPU latency is high for interactive use, GPU evidence is unavailable, and licensing remains unresolved. Do not begin Phase 2.

## Model identity and legal status

- Model: `ZhengPeng7/BiRefNet`
- Revision: `e2bf8e4460fc8fa32bba5ea4d94b3233d367b0e4`
- Checkpoint: `444,473,596` bytes
- SHA-256: `9ab37426bf4de0567af6b5d21b16151357149139362e6e8992021b8ce356a154`
- Legal status: `REQUIRES LEGAL REVIEW`
- Commercial approval: not established

## Completed CPU run

The runner was made resumable with persistent per-fixture state. It executed the actual BiRefNet adapter against every manifest fixture; no fixture was skipped.

| Measure | Result |
|---|---:|
| Fixtures | 13 |
| Successful | 13 |
| Failed | 0 |
| Cold model load | 4.498 s |
| Warm total mean | 26.860 s |
| Warm total median | 26.664 s |
| Warm total min / max | 25.849 / 28.770 s |
| Warm total standard deviation | 0.929 s |
| Mean preprocessing | 0.0168 s |
| Mean inference | 26.415 s |
| Mean postprocessing | 0.0102 s |
| Peak RSS | 5,291,175,936 bytes (about 4.93 GiB) |

The run artifact is stored outside Git at `benchmark-results/phase1d/report.json`; model weights and generated benchmark outputs remain ignored.

## Resolution and aspect-ratio findings

The adapter resizes every input to `1024×1024` for inference, then restores the alpha mask to the exact original dimensions. Verified cases:

- `phase1c-highres.png`: input `1600×1200`, model `1024×1024`, output `1600×1200`.
- `phase1c-wide.png`: input `1600×900`, model `1024×1024`, output `1600×900`.
- `phase1c-lowres.png`: input `96×96`, model `1024×1024`, output `96×96`.

No output dimension mismatch, crop, or padding artifact was reported by the contract checks. Because inference uses a square resize, fine-detail distortion or mask-scale degradation still requires broader visual review.

## Per-category results

Every category represented in the manifest produced a successful output: people, hair/fine detail, animals/fur, products, clothing, vehicles/thin structures, objects/plants, transparency, graphics, low resolution, wide aspect ratio, and high resolution. Success means the model completed and emitted a valid RGBA output; it is not a segmentation-quality score.

## Visual review observations

Representative outputs were preserved for manual inspection under the ignored `benchmark-results/phase1d/` directory. The generated inputs visibly exercise the intended cases: the person has fingers and shoes against a busy street; the hair case contains many loose curls and strands against stone; the transparent case contains a clear bottle and frosted container; the vehicle case contains spokes, cables, and handles. The current report does not claim that these fine, translucent, or thin structures were retained correctly; they require a human reviewer to inspect the alpha outputs at full resolution. No objective edge or quality metric is reported.

## Alpha pathology and output contract

All 13 rows recorded alpha statistics and no `flat-alpha`, `nearly-all-transparent`, or `nearly-all-opaque` flags. All outputs were RGBA PNGs with output dimensions equal to their corresponding inputs. These checks establish output integrity only; they do not establish correct foreground boundaries.

## Metrics and GPU status

Objective IoU, Dice, precision, recall, and boundary metrics remain **N/A — no ground-truth masks available**. The fixtures are generated project evaluation data and the model output was not used as ground truth.

CUDA was unavailable in the execution environment (`torch.cuda.is_available() == false`). GPU benchmark: unavailable in current environment. The CUDA code path remains implemented but has no measured result.

## Proven vs not proven

Proven:

- The pinned real model loads from the verified local cache.
- Real CPU inference completes for all 13 fixtures with zero execution failures.
- Preprocessing, inference, postprocessing, and total timing are recorded separately.
- The output contract preserves original dimensions and emits RGBA PNGs.
- Resumable state records every fixture as `SUCCESS` or `FAILURE`.

Not proven:

- Objective segmentation quality without legitimate masks.
- Production suitability at approximately 26.9 seconds per image and approximately 4.93 GiB peak RSS on CPU.
- GPU performance.
- Commercial or legal clearance.
- Correct handling of transparent objects, hair, fur, thin structures, shadows, or difficult backgrounds beyond the recorded output checks.
