import { isObjectRecord } from "./object-record"
export type AuthErrorPresentation = "inline" | "silent" | "toast"

/**
 * Resolve how a query or mutation error should be presented by auth UI hosts.
 *
 * Errors default to a toast for backwards compatibility. Components that
 * render their own recovery UI use `inline`, while optional enrichment
 * requests use `silent`.
 */
export function getAuthErrorPresentation(meta: unknown): AuthErrorPresentation {
  const presentation = isObjectRecord(meta)
    ? meta["errorPresentation"]
    : undefined

  return presentation === "inline" || presentation === "silent"
    ? presentation
    : "toast"
}
