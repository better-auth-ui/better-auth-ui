import { afterEach, expect, it, vi } from "vitest"
import {
  prepareNativeImage,
  resizeImage,
  type NativeAvatarConfig
} from "../src/lib/image"
const native = vi.hoisted(() => {
  const saveAsync = vi.fn<(...args: unknown[]) => unknown>()
  const releaseImage = vi.fn<(...args: unknown[]) => unknown>()
  const releaseContext = vi.fn<(...args: unknown[]) => unknown>()
  const context = {
    crop: vi.fn<(...args: unknown[]) => unknown>(),
    resize: vi.fn<(...args: unknown[]) => unknown>(),
    renderAsync: vi.fn<(...args: unknown[]) => unknown>(),
    release: releaseContext
  }
  context.crop.mockReturnValue(context)
  context.resize.mockReturnValue(context)
  context.renderAsync.mockResolvedValue({ saveAsync, release: releaseImage })
  return { context, saveAsync, releaseImage, releaseContext }
})
vi.mock("expo-image-manipulator", () => ({
  ImageManipulator: { manipulate: () => native.context },
  SaveFormat: { PNG: "png", JPEG: "jpeg", WEBP: "webp" }
}))
afterEach(() => vi.clearAllMocks())
const asset = {
  uri: "file:///photo.jpg",
  width: 800,
  height: 600,
  mimeType: "image/jpeg"
}
it("passes configured dimensions and encoding through a custom resize/upload pipeline", async () => {
  const resized = {
    ...asset,
    uri: "file:///resized.webp",
    width: 128,
    height: 128,
    mimeType: "image/webp"
  }
  const config: NativeAvatarConfig = {
    enabled: true,
    size: 128,
    extension: "webp",
    pick: vi.fn<
      () => Promise<{
        uri: string
        width: number
        height: number
        mimeType: string
      }>
    >(() => Promise.resolve(asset)),
    resize: vi.fn<
      () => Promise<{
        uri: string
        width: number
        height: number
        mimeType: string
      }>
    >(() => Promise.resolve(resized)),
    upload: vi.fn<() => Promise<string>>(() =>
      Promise.resolve("https://app.example/avatar.webp")
    )
  }
  expect(await prepareNativeImage(config)).toBe(
    "https://app.example/avatar.webp"
  )
  expect(config.resize).toHaveBeenCalledWith(asset, 128, "webp")
  expect(config.upload).toHaveBeenCalledWith(resized)
  config.pick = vi.fn<() => Promise<null>>(() => Promise.resolve(null))
  await expect(prepareNativeImage(config)).resolves.toBeNull()
  expect(config.upload).toHaveBeenCalledTimes(1)
})
it("center-crops without distortion, retains JPEG encoding, and releases native resources", async () => {
  native.saveAsync.mockResolvedValue({
    uri: "file:///result.jpg",
    width: 256,
    height: 256,
    base64: "encoded"
  })
  const image = await resizeImage(asset, 256, "inherit")
  expect(native.context.crop).toHaveBeenCalledWith({
    originX: 100,
    originY: 0,
    width: 600,
    height: 600
  })
  expect(native.context.resize).toHaveBeenCalledWith({
    width: 256,
    height: 256
  })
  expect(native.saveAsync).toHaveBeenCalledWith({
    compress: 0.9,
    format: "jpeg",
    base64: true
  })
  expect(image.mimeType).toBe("image/jpeg")
  expect(native.releaseImage).toHaveBeenCalledTimes(1)
  expect(native.releaseContext).toHaveBeenCalledTimes(1)
  native.saveAsync.mockRejectedValue(new Error("Storage full"))
  await expect(resizeImage(asset)).rejects.toThrow("Storage full")
  expect(native.releaseImage).toHaveBeenCalledTimes(2)
  expect(native.releaseContext).toHaveBeenCalledTimes(2)
})
it("requires encoded data when saving the image without an upload adapter", async () => {
  const config: NativeAvatarConfig = {
    enabled: true,
    size: 256,
    extension: "png",
    pick: () => Promise.resolve(asset),
    resize: () => Promise.resolve(asset)
  }
  await expect(prepareNativeImage(config)).rejects.toThrow("base64")
  config.resize = () => Promise.resolve({ ...asset, base64: "encoded" })
  expect(await prepareNativeImage(config)).toBe(
    "data:image/jpeg;base64,encoded"
  )
})
