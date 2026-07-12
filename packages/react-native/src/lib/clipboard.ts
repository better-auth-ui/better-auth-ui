import * as Clipboard from "expo-clipboard"

/**
 * Copy text to the system clipboard (e.g. a freshly created API key).
 * Requires the optional peer `expo-clipboard`.
 */
export async function copyText(text: string): Promise<void> {
  await Clipboard.setStringAsync(text)
}
