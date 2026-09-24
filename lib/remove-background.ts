export type RemovalResult = { originalUrl: string; resultUrl: string; fileName: string }

/** Frontend seam for the future CutoutBG processing API. */
export async function removeBackground(file: File): Promise<RemovalResult> {
  const originalUrl = URL.createObjectURL(file)
  await new Promise((resolve) => setTimeout(resolve, 1500))
  return { originalUrl, resultUrl: originalUrl, fileName: file.name.replace(/\.[^.]+$/, "") + "-cutout.png" }
}
