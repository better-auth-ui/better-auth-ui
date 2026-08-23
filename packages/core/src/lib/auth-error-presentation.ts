export type AuthErrorPresentation = "inline" | "silent" | "toast"

type AuthErrorMeta = {
  errorPresentation?: unknown
}

/**
 * Resolve how a query or mutation error should be presented by auth UI hosts.
 *
 * Errors default to a toast for backwards compatibility. Components that
 * render their own recovery UI use `inline`, while optional enrichment
 * requests use `silent`.
 */
export function getAuthErrorPresentation(meta: unknown): AuthErrorPresentation {
  const presentation = (meta as AuthErrorMeta | null)?.errorPresentation

  return presentation === "inline" || presentation === "silent"
    ? presentation
    : "toast"
}
