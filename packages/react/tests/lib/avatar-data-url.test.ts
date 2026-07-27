import { fileToAvatarDataUrl } from "@better-auth-ui/core"
import { describe, expect, it } from "vitest"

function canvasToPngFile(canvas: HTMLCanvasElement): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not create test avatar"))
        return
      }

      resolve(new File([blob], "avatar.png", { type: blob.type }))
    }, "image/png")
  })
}

async function createLargeAvatar() {
  const canvas = document.createElement("canvas")
  canvas.width = 256
  canvas.height = 256

  const context = canvas.getContext("2d")
  if (!context) {
    throw new Error("Could not get canvas context")
  }

  const imageData = context.createImageData(canvas.width, canvas.height)
  let value = 17

  for (let offset = 0; offset < imageData.data.length; offset += 4) {
    value = (value * 75 + 74) % 65_537
    imageData.data[offset] = value % 256
    imageData.data[offset + 1] = (value >> 4) % 256
    imageData.data[offset + 2] = (value >> 8) % 256
    imageData.data[offset + 3] = 255
  }

  context.putImageData(imageData, 0, 0)

  return canvasToPngFile(canvas)
}

describe("fileToAvatarDataUrl", () => {
  it("keeps embedded avatars within the response-header budget", async () => {
    const source = await createLargeAvatar()
    expect(source.size).toBeGreaterThan(4_096)

    const dataUrl = await fileToAvatarDataUrl(source)
    const optimized = await fetch(dataUrl).then((response) => response.blob())
    const image = await createImageBitmap(optimized)

    expect(dataUrl.length).toBeLessThanOrEqual(4_096)
    expect(optimized.type).toBe("image/webp")
    expect(image.width).toBeLessThanOrEqual(96)
    expect(image.height).toBe(image.width)

    image.close()
  })
})
