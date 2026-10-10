/**
 * Transient in-memory store for the email that sign-in / sign-up hand off to
 * the verify-email screen. Replaces the web components' `sessionStorage`
 * (unavailable in React Native). It's a per-session hint, not durable state.
 */
let pendingEmail: string | undefined

export function setPendingEmail(email: string): void {
  pendingEmail = email
}

export function getPendingEmail(): string | undefined {
  return pendingEmail
}
