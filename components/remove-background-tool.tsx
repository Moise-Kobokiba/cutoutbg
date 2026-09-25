"use client"

import { useEffect, useRef, useState } from "react"
import { AlertCircle, Check, Download, LoaderCircle, RotateCcw, Upload } from "lucide-react"
import { isProcessingConfigured, removeBackground, type RemovalResult, ProcessingError } from "@/lib/remove-background"
import { BeforeAfterViewer } from "@/components/before-after-viewer"

type State = "idle" | "processing" | "success" | "error"
const accepted = ["image/png", "image/jpeg", "image/webp"] as const
const acceptedExtensions = ["png", "jpg", "jpeg", "webp"] as const
const maxFileBytes = 25 * 1024 * 1024

function isAcceptedImage(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase()
  return accepted.includes(file.type as (typeof accepted)[number]) && Boolean(extension && acceptedExtensions.includes(extension as (typeof acceptedExtensions)[number]))
}

export function RemoveBackgroundTool() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<State>("idle")
  const [result, setResult] = useState<RemovalResult | null>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState("")
  const configured = isProcessingConfigured()
  useEffect(() => () => { if (result?.originalUrl) URL.revokeObjectURL(result.originalUrl) }, [result])
  const select = async (next?: File) => {
    if (!next) return
    if (!isAcceptedImage(next)) { setError("Choose a PNG, JPG, JPEG, or WEBP image with a matching file type."); setState("error"); return }
    if (next.size > maxFileBytes) { setError("Choose an image smaller than 25 MB."); setState("error"); return }
    setError("")
    if (!configured) { setError("Background removal is temporarily unavailable. The processing service is not connected in this environment."); setState("error"); return }
    setState("processing")
    try { setResult(await removeBackground(next)); setState("success") } catch (caught) { setError(caught instanceof ProcessingError ? caught.message : "The processing service is unavailable. Try again later."); setState("error") }
  }
  const reset = () => { if (result?.originalUrl) URL.revokeObjectURL(result.originalUrl); setResult(null); setError(""); setState("idle") }
  const download = () => { if (!result) return; const link = document.createElement("a"); link.href = result.resultUrl; link.download = "cutoutbg-result.png"; link.click() }
  if (state === "processing") return <div className="flex min-h-[330px] flex-col items-center justify-center rounded-[28px] border border-[var(--line)] bg-[var(--panel)]"><LoaderCircle className="size-9 animate-spin text-[var(--deep)]" aria-hidden="true" /><h3 className="mt-5 font-display text-xl font-bold">Removing background…</h3><p className="mt-2 text-sm text-[var(--muted)]">Preparing a transparent cutout</p></div>
  if (state === "success" && result) return <div className="rounded-[28px] border border-[var(--line)] bg-[var(--panel)] p-3 sm:p-5"><div className="flex items-center justify-between px-2 pb-4"><div><div className="flex items-center gap-2 text-sm font-semibold text-[var(--deep)]"><Check className="size-4" aria-hidden="true" /> Background removed</div><p className="mt-1 text-xs text-[var(--muted)]">Preview your result, then download a PNG.</p></div><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--soft)] hover:text-[var(--foreground)]"><RotateCcw className="size-4" aria-hidden="true" /> Start over</button></div><BeforeAfterViewer imageUrl={result.resultUrl} /><div className="flex flex-wrap justify-end gap-3 pt-4"><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--foreground)]"><RotateCcw className="size-4" aria-hidden="true" /> Start another image</button><button type="button" onClick={download} className="inline-flex items-center gap-2 rounded-full bg-[var(--deep)] px-4 py-3 text-sm font-semibold text-white hover:bg-[#234c3e]"><Download className="size-4" aria-hidden="true" /> Download PNG</button></div></div>
  return <div onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); void select(event.dataTransfer.files[0]) }} className={`rounded-[28px] border-2 border-dashed p-8 text-center transition sm:p-14 ${dragging ? "border-[var(--deep)] bg-[var(--soft)]" : "border-[#cbd8d0] bg-[var(--panel)]"}`}><input ref={inputRef} type="file" accept={accepted.join(",")} className="sr-only" onChange={(event) => { void select(event.target.files?.[0]); event.currentTarget.value = "" }} /><div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[var(--soft)] text-[var(--deep)]"><Upload className="size-6" aria-hidden="true" /></div><h3 className="mt-5 font-display text-xl font-bold">Upload an image</h3><p className="mt-2 text-sm text-[var(--muted)]">Drop a file here or browse your device.</p><button type="button" onClick={() => inputRef.current?.click()} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[var(--accent-ink)] hover:brightness-95"><Upload className="size-4" aria-hidden="true" /> Browse files</button><p className="mt-5 text-xs text-[var(--muted)]">PNG, JPG, JPEG, or WEBP</p>{!configured && <p className="mx-auto mt-4 max-w-sm text-xs text-[var(--muted)]">Processing is not connected in this preview. You can still browse the tool, but no image will be uploaded.</p>}{state === "error" && <div role="alert" className="mx-auto mt-5 flex max-w-sm items-center justify-center gap-2 rounded-xl bg-[#fff0ec] px-3 py-2 text-sm text-[#a63c27]"><AlertCircle className="size-4" aria-hidden="true" />{error}</div>}</div>
}
