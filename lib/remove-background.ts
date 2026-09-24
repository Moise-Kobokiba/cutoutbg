export type RemovalResult = {
  originalUrl: string
  resultUrl: string
  fileName: string
}

/** Frontend seam for the future CutoutBG processing API. */
export async function removeBackground(file: File): Promise<RemovalResult> {
  const originalUrl = URL.createObjectURL(file)
  const resultUrl = await createMockCutout(file)

  return {
    originalUrl,
    resultUrl,
    fileName: `${file.name.replace(/\.[^.]+$/, "")}-cutout.png`,
  }
}

async function createMockCutout(file: File): Promise<string> {
  const imageUrl = URL.createObjectURL(file)
  try {
    const image = await loadImage(imageUrl)
    const canvas = document.createElement("canvas")
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const context = canvas.getContext("2d")
    if (!context) throw new Error("Canvas is unavailable")

    context.drawImage(image, 0, 0)
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height)
    const background = sampleCorner(pixels, canvas.width, canvas.height)

    for (let index = 0; index < pixels.data.length; index += 4) {
      const distance = colorDistance(pixels.data[index], pixels.data[index + 1], pixels.data[index + 2], background)
      if (distance < 42) pixels.data[index + 3] = 0
      else if (distance < 78) pixels.data[index + 3] = Math.round(((distance - 42) / 36) * 255)
    }

    context.putImageData(pixels, 0, 0)
    return canvas.toDataURL("image/png")
  } finally {
    URL.revokeObjectURL(imageUrl)
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Image could not be loaded"))
    image.src = url
  })
}

function sampleCorner(data: ImageData, width: number, height: number) {
  const points = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ]
  const values = points.map(([x, y]) => {
    const offset = (y * width + x) * 4
    return [data.data[offset], data.data[offset + 1], data.data[offset + 2]]
  })
  return values[0].map((_, channel) => Math.round(values.reduce((sum, value) => sum + value[channel], 0) / values.length)) as [number, number, number]
}

function colorDistance(red: number, green: number, blue: number, background: [number, number, number]) {
  return Math.sqrt((red - background[0]) ** 2 + (green - background[1]) ** 2 + (blue - background[2]) ** 2)
}
