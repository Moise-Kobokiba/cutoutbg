export type RemovalResult = { originalUrl: string; resultUrl: string; fileName: string }
export type ProcessingErrorCode = "API_NOT_CONFIGURED" | "NETWORK_ERROR" | "API_ERROR" | "MALFORMED_RESPONSE" | "PROCESSING_FAILED" | "PROCESSING_TIMEOUT"
export class ProcessingError extends Error { constructor(public readonly code: ProcessingErrorCode, message: string) { super(message); this.name = "ProcessingError" } }

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
async function readJson(response: Response) { try { return await response.json() as Record<string, unknown> } catch { return null } }

export async function removeBackground(file: File): Promise<RemovalResult> {
  if (!API_BASE) throw new ProcessingError("API_NOT_CONFIGURED", "The processing service is not connected in this environment.")
  const originalUrl = URL.createObjectURL(file)
  const body = new FormData(); body.append("file", file)
  let created: Record<string, unknown> | null
  try {
    const response = await fetch(`${API_BASE}/api/v1/jobs`, { method: "POST", body })
    created = await readJson(response)
    if (!response.ok) throw new ProcessingError("API_ERROR", typeof (created?.error as Record<string, unknown> | undefined)?.message === "string" ? (created?.error as Record<string, string>).message : "The processing service rejected this image.")
  } catch (error) {
    if (error instanceof ProcessingError) { URL.revokeObjectURL(originalUrl); throw error }
    URL.revokeObjectURL(originalUrl); throw new ProcessingError("NETWORK_ERROR", "The processing service is unavailable. Try again when the service is connected.")
  }
  const jobId = created?.jobId
  if (typeof jobId !== "string" || !jobId) { URL.revokeObjectURL(originalUrl); throw new ProcessingError("MALFORMED_RESPONSE", "The processing service returned an invalid job response.") }
  for (let attempt = 0; attempt < 120; attempt++) {
    await wait(1000)
    let job: Record<string, unknown> | null
    try { const response = await fetch(`${API_BASE}/api/v1/jobs/${encodeURIComponent(jobId)}`); job = await readJson(response); if (!response.ok) throw new Error() } catch { URL.revokeObjectURL(originalUrl); throw new ProcessingError("NETWORK_ERROR", "The processing service became unavailable while checking this job.") }
    if (job?.status === "completed") {
      const result = job.result as Record<string, unknown> | undefined
      if (typeof result?.downloadUrl !== "string") { URL.revokeObjectURL(originalUrl); throw new ProcessingError("MALFORMED_RESPONSE", "The processing service returned an invalid result.") }
      return { originalUrl, resultUrl: result.downloadUrl, fileName: `${file.name.replace(/\.[^.]+$/, "")}-cutout.png` }
    }
    if (job?.status === "failed") { URL.revokeObjectURL(originalUrl); throw new ProcessingError("PROCESSING_FAILED", typeof (job.error as Record<string, unknown> | undefined)?.message === "string" ? (job.error as Record<string, string>).message : "The image could not be processed.") }
  }
  URL.revokeObjectURL(originalUrl); throw new ProcessingError("PROCESSING_TIMEOUT", "Processing took too long. Try again with a smaller image.")
}

export function isProcessingConfigured() { return Boolean(API_BASE) }
export function processingApiUrl() { return API_BASE }
