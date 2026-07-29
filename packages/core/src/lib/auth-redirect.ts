const ABSOLUTE_HTTP_URL = /^https?:\/\//i

/**
 * Build a callback URL from an optional origin, a configured base path, and a
 * view path.
 *
 * Separators are normalized so custom paths work whether callers include
 * leading or trailing slashes.
 */
export function getViewURL(
  baseURL: string,
  basePath: string,
  viewPath: string
): string {
  const origin = baseURL.replace(/\/+$/, "")
  const path = [basePath, viewPath]
    .map((segment) => segment.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/")

  return `${origin}/${path}`
}

/**
 * Add the current post-authentication destination to an internal auth link.
 */
export function getAuthLinkURL(href: string, redirectTo: string): string {
  const hashIndex = href.indexOf("#")
  const hash = hashIndex === -1 ? "" : href.slice(hashIndex)
  const hrefWithoutHash = hashIndex === -1 ? href : href.slice(0, hashIndex)
  const queryIndex = hrefWithoutHash.indexOf("?")
  const pathname =
    queryIndex === -1 ? hrefWithoutHash : hrefWithoutHash.slice(0, queryIndex)
  const searchParams = new URLSearchParams(
    queryIndex === -1 ? "" : hrefWithoutHash.slice(queryIndex + 1)
  )

  searchParams.set("redirectTo", redirectTo)

  return `${pathname}?${searchParams}${hash}`
}

function hasUnsafeRedirectCharacters(value: string): boolean {
  for (const character of value) {
    const codePoint = character.codePointAt(0)
    if (
      character === "\\" ||
      codePoint === undefined ||
      codePoint <= 31 ||
      codePoint === 127
    ) {
      return true
    }
  }

  return false
}

/**
 * Normalize a redirect target to a same-origin path.
 *
 * Root-relative paths and same-origin HTTP(S) URLs are accepted. Invalid,
 * cross-origin, protocol-relative, and non-HTTP targets fall back to `/`.
 *
 * @param redirectTo - Requested redirect target
 * @param origin - Origin used to validate and normalize the target
 * @returns A same-origin path including its query string and hash
 */
export function getSafeRedirectTo(
  redirectTo: string | null | undefined,
  origin: string
): string {
  if (!redirectTo || hasUnsafeRedirectCharacters(redirectTo)) return "/"

  const target = redirectTo.trim()
  if (
    !target ||
    target.startsWith("//") ||
    (!target.startsWith("/") && !ABSOLUTE_HTTP_URL.test(target))
  ) {
    return "/"
  }

  try {
    const baseURL = new URL(origin)
    const targetURL = new URL(target, baseURL)

    if (
      targetURL.origin !== baseURL.origin ||
      targetURL.username ||
      targetURL.password
    ) {
      return "/"
    }

    return `${targetURL.pathname}${targetURL.search}${targetURL.hash}`
  } catch {
    return "/"
  }
}

export type AuthRedirectAction =
  | { type: "redirect"; to: string }
  | { type: "signIn"; to: string }

/**
 * Resolve the next action for the authenticated redirect view.
 *
 * Signed-in users continue to the validated target. Signed-out users are sent
 * to sign in with the current redirect-view URL preserved, allowing the view
 * to perform a full-page redirect after authentication.
 *
 * @param currentURL - Current redirect-view URL
 * @param authenticated - Whether the current user has a session
 * @param signInPath - Same-origin path to the sign-in view
 * @returns The redirect or sign-in action to perform
 */
export function getAuthRedirectAction(
  currentURL: URL,
  authenticated: boolean,
  signInPath: string
): AuthRedirectAction {
  const requestedTarget = getSafeRedirectTo(
    currentURL.searchParams.get("redirectTo"),
    currentURL.origin
  )
  const targetURL = new URL(requestedTarget, currentURL.origin)
  const redirectTo =
    targetURL.pathname === currentURL.pathname ? "/" : requestedTarget

  if (authenticated) {
    return { type: "redirect", to: redirectTo }
  }

  const signInURL = new URL(signInPath, currentURL.origin)
  signInURL.searchParams.set(
    "redirectTo",
    `${currentURL.pathname}${currentURL.search}${currentURL.hash}`
  )

  return {
    type: "signIn",
    to: `${signInURL.pathname}${signInURL.search}${signInURL.hash}`
  }
}
