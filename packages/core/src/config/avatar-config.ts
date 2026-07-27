/**
 * Configuration options for avatar handling.
 */
export type AvatarConfig = {
  /**
   * Delete the current avatar (e.g. remove from storage).
   * Gets called after the user's avatar is updated to null.
   */
  delete?: (url: string) => Promise<void>
  /**
   * Whether avatar changing is enabled.
   * @default true
   */
  enabled: boolean
  /**
   * Output image format.
   * @default "png"
   */
  extension: "png" | "jpg" | "webp" | "inherit"
  /**
   * Resize an image file before upload. Overrides the default resize behavior.
   * @default Resizes to `size` pixels, square-cropped, output as `extension`.
   */
  resize: (
    file: File,
    size?: number,
    extension?: "png" | "jpg" | "webp" | "inherit"
  ) => Promise<File>
  /**
   * Max dimension in pixels for the optimized avatar.
   * @default 256
   */
  size: number
  /**
   * Upload a file and return the URL where it was stored.
   * When undefined, a compact data URL is saved directly to `user.image`.
   * The fallback is optimized for session cookie caches, while uploaded files
   * keep the size and format produced by {@link resize}.
   */
  upload?: (file: File) => Promise<string>
}
