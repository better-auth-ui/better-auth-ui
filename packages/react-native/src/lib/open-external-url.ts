import { Linking } from "react-native"

/** Open URLs returned by billing and authorization adapters in the system browser. */
export async function openExternalURL(
  url: string | undefined,
  baseURL?: string
) {
  if (!url) return
  const target = new URL(url, baseURL)
  if (target.protocol !== "https:" && target.protocol !== "http:") {
    throw new Error("The server returned an unsupported URL.")
  }
  await Linking.openURL(target.href)
}
