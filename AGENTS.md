# AGENTS.md

## Project status
CutoutBG is in Phase 0 initialization. Do not build the production frontend, billing, public API, or deployment infrastructure until the model licensing and benchmark gates in `docs/` are complete.

## Required behavior
- Audit existing code before changing it.
- Treat model code, weights, dependencies, and training data as separate licensing questions.
- Never fabricate benchmark results or commercial-use permission.
- Keep inference behind the `SegmentationModel` contract described in `docs/model-selection.md`.
- Treat uploads as untrusted; follow `docs/security.md`.
- Prefer small, independently testable changes and preserve unrelated work.
- Use primary documentation and repository sources for external factual claims.

## UI direction for Phase 1+
When the product UI is approved, use semantic HTML, keyboard-accessible controls, visible focus, readable contrast, responsive layouts, clear progress/error states, and one obvious primary action. Follow Apple HIG design principles rather than copying another product's branding or implementation.

## Verification
Run the narrowest relevant tests first, then the required broader checks. Report incomplete checks honestly.
