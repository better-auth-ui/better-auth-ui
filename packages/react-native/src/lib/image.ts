export interface NativeImageAsset {
  uri: string
  width: number
  height: number
  base64?: string
  mimeType?: string
  fileName?: string
  fileSize?: number
}
export type NativeImageFormat = "png" | "jpg" | "webp" | "inherit"
export type NativeAvatarConfig = {
  enabled: boolean
  size: number
  extension: NativeImageFormat
  pick?: () => Promise<NativeImageAsset | null>
  resize: (
    image: NativeImageAsset,
    size?: number,
    extension?: NativeImageFormat
  ) => Promise<NativeImageAsset>
  upload?: (image: NativeImageAsset) => Promise<string>
  delete?: (url: string) => Promise<void>
}
export const defaultNativeAvatarConfig: NativeAvatarConfig = {
  enabled: true,
  size: 256,
  extension: "png",
  resize: resizeImage
}

export async function pickImage(): Promise<NativeImageAsset | null> {
  const picker = await import("expo-image-picker")
  const result = await picker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1
  })
  if (result.canceled || !result.assets.length) return null
  const asset = result.assets[0]!
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    base64: asset.base64 ?? undefined,
    mimeType: asset.mimeType,
    fileName: asset.fileName ?? undefined,
    fileSize: asset.fileSize
  }
}

/** Center-crop without stretching, then encode at the configured dimensions and format. */
export async function resizeImage(
  image: NativeImageAsset,
  size = 256,
  extension: NativeImageFormat = "png"
): Promise<NativeImageAsset> {
  const manipulator = await import("expo-image-manipulator")
  const format =
    extension === "inherit"
      ? image.mimeType === "image/jpeg"
        ? "jpg"
        : image.mimeType === "image/webp"
          ? "webp"
          : "png"
      : extension
  const nativeFormat =
    format === "jpg"
      ? manipulator.SaveFormat.JPEG
      : format === "webp"
        ? manipulator.SaveFormat.WEBP
        : manipulator.SaveFormat.PNG
  const side = Math.min(image.width, image.height)
  if (side <= 0 || !Number.isSafeInteger(size) || size <= 0)
    throw new Error("Image dimensions must be positive.")
  const context = manipulator.ImageManipulator.manipulate(image.uri)
  context
    .crop({
      originX: (image.width - side) / 2,
      originY: (image.height - side) / 2,
      width: side,
      height: side
    })
    .resize({ width: size, height: size })
  let rendered: Awaited<ReturnType<typeof context.renderAsync>> | undefined
  try {
    rendered = await context.renderAsync()
    const result = await rendered.saveAsync({
      compress: 0.9,
      format: nativeFormat,
      base64: true
    })
    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
      base64: result.base64,
      mimeType: format === "jpg" ? "image/jpeg" : `image/${format}`
    }
  } finally {
    rendered?.release()
    context.release()
  }
}

export async function prepareNativeImage(
  config: NativeAvatarConfig
): Promise<string | null> {
  const picked = await (config.pick ?? pickImage)()
  if (!picked) return null
  const resized = await config.resize(picked, config.size, config.extension)
  if (config.upload) return config.upload(resized)
  if (!resized.base64)
    throw new Error(
      "The resized image needs base64 data when no upload callback is configured."
    )
  return `data:${resized.mimeType ?? "image/png"};base64,${resized.base64}`
}
