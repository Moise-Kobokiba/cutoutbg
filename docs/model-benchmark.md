# Model benchmark plan

No benchmark has been run. All results are **pending**; this document deliberately contains no invented scores.

## Dataset slices
Use a versioned, permissioned internal corpus with fixed train-free evaluation splits for: people, hair, pets, animals, products, clothing, cars, furniture, objects, logos/graphics, complex backgrounds, low-resolution images, and high-resolution images. Record source permission and anonymized asset IDs. Do not upload customer data to benchmarking.

## Protocol
For every model and revision, run the same container, preprocessing, input sizes, hardware profile, warm-up count, and concurrency. Record input/output resolution, cold and warm processing time, peak memory, device, failure count, and output encoding. Compare against human-reviewed masks where available.

## Quality rubric
Reviewers score edge quality and fine-detail preservation, and label foreground leakage, background leakage, unusable output, and category-specific failure modes. Report sample counts, confidence intervals where appropriate, and examples—not only averages.

## Result record

```text
model, revision, weights_revision, license_review_id
category, asset_id, input_width, input_height, output_width, output_height
latency_ms, peak_memory_mb, failed, edge_score, foreground_leakage
background_leakage, fine_detail_score, device, runtime_version
```

## Release gate
A model is eligible only if: licensing is approved; reproducibility is demonstrated; failure behavior is bounded; resource use fits the target worker; and quality is acceptable across every required slice, not just portraits. Benchmark artifacts and scripts must be versioned with the model manifest.
