# CutoutBG architecture

Phase 1 adds a local Python engine under `src/cutoutbg`. It is intentionally isolated from the future web/API topology. The engine flow is:

```text
explicit file path -> byte/magic/type/size validation -> EXIF-safe RGB image -> SegmentationModel -> L alpha mask -> RGBA PNG
```

`SegmentationModel` is the model boundary. The current `center-contrast-smoke-test` adapter exists only to prove validation, lifecycle, mask, and output contracts. Learned model adapters must be license-gated and can replace it without changing the pipeline or CLI contract.

The future Phase 2 topology remains Next.js web app -> TypeScript API -> queue -> Python worker, with PostgreSQL as source of truth and private object storage for user data. Phase 1 does not add public API, authentication, billing, deployment, or uploads.

## Security boundaries

Inputs are untrusted. The validator checks size, magic bytes, decoder verification, dimensions, pixel count, and format. Processing uses Pillow, never shell execution, and writes only the requested output path. Temporary files and external uploads are not used.
