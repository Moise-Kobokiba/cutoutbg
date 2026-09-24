# Phase 1C benchmark results

## Model

- Name: `zhengpeng7/BiRefNet`
- Revision: `e2bf8e4460fc8fa32bba5ea4d94b3233d367b0e4`
- Checkpoint: `model.safetensors`
- Size: 444,473,596 bytes
- SHA-256: `9ab37426bf4de0567af6b5d21b16151357149139362e6e8992021b8ce356a154`
- Source: Hugging Face model repository, exact revision pinned
- License: upstream repository/model-card terms recorded separately; exact artifact still requires legal review
- Commercial status: not approved
- Legal status: `REQUIRES LEGAL REVIEW`

## Dataset

The Phase 1C manifest contains 13 project-generated fixtures covering people, hair/fine detail, animals/fur, products, clothing, vehicles/thin structures, objects/plants, transparent objects, graphics, low resolution, wide aspect ratio, and high resolution. No third-party photographs were downloaded. Every fixture is marked as generated project evaluation data with no ground-truth mask. Transparent-object results are not evidence of true alpha/translucency understanding.

## Environment and execution

The benchmark runner records OS, Python, CPU, peak process RSS when available, device, GPU properties when CUDA is available, model load time, cold sample timings, and repeated warm timings split into preprocessing, inference, postprocessing, and total time. Run it with:

```text
PYTHONPATH=src python scripts/run_phase1c.py tests/fixtures --cache-dir ./model-cache --device cpu --warm-samples 3 --output-dir ./benchmark-results/phase1c
```

The current environment reports CUDA unavailable (`torch.cuda.is_available() == false`), so no GPU measurements are reported. GPU status: unavailable in current environment. CPU benchmark completion is recorded in the generated ignored JSON artifact when the run finishes; no values are fabricated here.

## Quality review protocol

Review generated RGBA outputs category-by-category for hair, fur, fingers, glasses, facial boundaries, clothing edges, thin structures, holes, shadows, reflections, low contrast, clutter, frame-touching subjects, and similar-color backgrounds. Record objective mask extrema/unique-alpha checks and separately record subjective observations. Ground-truth IoU, Dice, precision, recall, and boundary metrics are `N/A — no ground truth available` for this generated dataset.

## Reliability and security

Fast tests cover manifest provenance, invalid/corrupt input, output dimensions, RGBA mode, alpha variation, and resolution restoration. Learned-model tests remain separate from the fast suite. The adapter uses `trust_remote_code=True` only for the exact pinned repository revision and cache-only loading; remote code and dependencies are acquired by an explicit script. Model artifacts are ignored and checksum-verified. Image limits remain enforced before inference.

## Decision

**CONTINUE EVALUATION** — the benchmark infrastructure and category coverage improved, but the generated dataset has no ground truth, visual review is still required, CPU performance must be read from the completed run, and licensing remains unresolved. Do not begin Phase 2.
