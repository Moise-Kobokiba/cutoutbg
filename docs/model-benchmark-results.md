# Phase 1B benchmark results

## Environment

- OS: Linux sandbox
- Python: 3.13.11
- PyTorch: 2.14.0+cu130
- Transformers: 4.57.6
- Device tested: CPU
- GPU: not tested/available for this run
- CPU model: reported as `x86_64`; detailed host CPU and RAM were not exposed by the runtime

## Model

- Model: `zhengpeng7/BiRefNet`
- Revision: `e2bf8e4460fc8fa32bba5ea4d94b3233d367b0e4`
- Weight file: `model.safetensors`
- Weight size: `444,473,596` bytes
- Weight SHA-256: `9ab37426bf4de0567af6b5d21b16151357149139362e6e8992021b8ce356a154`
- Source: https://huggingface.co/zhengpeng7/BiRefNet/tree/e2bf8e4460fc8fa32bba5ea4d94b3233d367b0e4
- Acquisition: downloaded/verified into local ignored cache

## Dataset

One generated fixture is available: `phase1b-generated-subject.png`, 1024×1024, a red ceramic mug on a pale blue background. It is categorized as product/object/complex-background. No ground-truth mask is available, so objective quality metrics are not reported.

## Performance

On the sandbox CPU, with the model already loaded:

- Cold model load: 2.020 s
- Warm inference samples: 27.616 s, 27.201 s, 29.829 s
- Mean warm inference: 28.215 s
- Median warm inference: 27.616 s
- p95: not reported; sample size is too small for a meaningful estimate
- Peak RAM/GPU memory: not measured

The end-to-end CLI run completed successfully in 32.474 s and produced a 1024×1024 PNG.

## Output validation

The generated output decoded as PNG RGBA at 1024×1024. Alpha extrema were 0–255 with 256 distinct alpha values; 123,111 of 1,048,576 pixels had non-zero alpha. This confirms meaningful transparency variation and a non-empty foreground.

## Structured visual observations

The generated product fixture produced a non-empty transparent cutout with a soft alpha transition. The fixture is not a sufficient evaluation of hair, fur, thin structures, low contrast, reflections, or complex natural backgrounds, and no claim is made for those categories.

## Failures

- Initial cache-only model load failed because remote-code files were not included in the first acquisition pattern. The acquisition tool was corrected to include the pinned repository's `BiRefNet_config.py`, `birefnet.py`, `handler.py`, and `requirements.txt`.
- Initial inference failed with missing upstream dependencies `einops`, `kornia`, and `timm`; these were installed from the pinned revision's declared requirements.
- No checksum failure, corrupt-weight, invalid-image, or unavailable-device test was executed against the learned model in this run.

## Licensing

Status remains `REQUIRES LEGAL REVIEW`. See `docs/model-licensing.md`; the published MIT metadata is recorded as evidence, not a legal conclusion.

## Decision

`CONTINUE EVALUATION` — the pinned checkpoint acquired, loaded, inferred successfully, and passed output-integrity checks on CPU. The dataset is far below the requested category coverage, memory measurements are incomplete, and commercial clearance remains unresolved. Do not advance to Phase 2 based on this single generated fixture.
