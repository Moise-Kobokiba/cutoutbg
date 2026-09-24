# Model licensing

## BiRefNet general

| Field | Record |
|---|---|
| Model | `zhengpeng7/BiRefNet` |
| Source | https://huggingface.co/zhengpeng7/BiRefNet and https://github.com/ZhengPeng7/BiRefNet |
| Code license | MIT, evidenced by upstream `LICENSE` |
| Weight license | Hugging Face model card declares MIT; exact checkpoint terms still require legal review |
| Commercial use | Requires legal review before commercial use |
| Attribution | Zheng Peng et al.; preserve MIT notice and paper citation |
| Redistribution | Do not redistribute weights until reviewed |
| Model-weight restrictions | Checkpoint is loaded only at pinned revision `e2bf8e4460fc8fa32bba5ea4d94b3233d367b0e4` |
| Training-data concerns | Upstream sources should be reviewed; this record does not establish training-data rights |
| Evidence | Upstream MIT license; Hugging Face README `license: mit`; model config and official inference instructions |
| Status | REQUIRES LEGAL REVIEW |

The adapter never commits weights. It accepts an explicit cache directory and uses `local_files_only` when one is supplied, preventing an evaluation from silently changing its cache contents. The model must not be described as commercially cleared or production-ready.

## Rejected or unresolved candidates

RMBG-2.0 is not selected for this evaluation because its published CC BY-NC 4.0 terms are non-commercial. The smoke-test adapter has no learned weights and is not a product model.
