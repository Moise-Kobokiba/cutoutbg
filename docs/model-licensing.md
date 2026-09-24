# Model licensing review

This is a due-diligence register, not legal advice. Commercial approval requires reviewing the exact commit, model-card license, weight files, dependency licenses, and any separate terms in force at procurement time.

## Required evidence per candidate

1. Source repository URL, commit/tag, and code license.
2. Exact weight URL, revision, and weight license.
3. Attribution, notice, redistribution, and modification obligations.
4. Restrictions on commercial use, hosted inference, SaaS, and training.
5. Third-party dependency and runtime licenses.
6. Written approval from counsel or the rights holder when terms are ambiguous.

## Known caution
A permissive repository license does not automatically license separately distributed weights. In particular, the RMBG-2.0 model card identifies a non-commercial Creative Commons license for the published weights; it must therefore be treated as non-commercial unless BRIA's current commercial agreement is obtained and retained in procurement records.

## Candidate register

| Candidate | Code source | Weights | Commercial status |
|---|---|---|---|
| BiRefNet | Review repository LICENSE | Review each release | Pending exact revision review |
| RMBG-2.0 | Review repository/model-card terms | Model card states CC BY-NC 4.0 | Not approved for commercial use without separate terms |
| U²-Net | Review repository LICENSE | Review downloaded weights | Pending exact weight provenance review |
| MODNet | Review repository LICENSE | Review downloaded weights | Pending exact weight provenance review |
| SAM | Review repository LICENSE | Review checkpoint terms | Research comparison until complete review |

Do not ship a candidate merely because a wrapper package is MIT, Apache-2.0, or BSD licensed. Store a machine-readable manifest of the approved model revision and notices alongside every worker release.

## Primary references
- RMBG-2.0 card and terms: https://huggingface.co/briaai/RMBG-2.0
- BiRefNet: https://github.com/ZhengPeng7/BiRefNet
- U²-Net: https://github.com/xuebinqin/U-2-Net
- MODNet: https://github.com/ZHKKKe/MODNet
- SAM: https://github.com/facebookresearch/segment-anything
- Creative Commons BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
