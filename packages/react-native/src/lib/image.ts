import * as ImageManipulator from "expo-image-manipulator"
import * as ImagePicker from "expo-image-picker"

export interface PickedImage {
  uri: string
  base64?: string
}

/**
 * Launch the system image library and return the selected image, or `null` if
 * the user cancels. Requires the optional peer `expo-image-picker`. The RN
 * replacement for the web components' hidden `<input type="file">`.
 */
export async function pickImage(): Promise<PickedImage | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 1
  })
  if (result.canceled || !result.assets?.length) return null
  const asset = result.assets[0]
  return { uri: asset.uri, base64: asset.base64 ?? undefined }
}

/**
 * Resize/compress an image to a square and return a PNG data URI. The RN
 * replacement for core's canvas-based `resizeAvatar` — pass this (wrapped) to
 * `AuthConfig.avatar.resize` / `.upload` so the DOM code never runs. Requires
 * the optional peer `expo-image-manipulator`.
 */
export async function resizeImage(uri: string, size = 256): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: size, height: size } }],
    {
      compress: 0.9,
      format: ImageManipulator.SaveFormat.PNG,
      base64: true
    }
  )
  return result.base64 ? `data:image/png;base64,${result.base64}` : result.uri
}
