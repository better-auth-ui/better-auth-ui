export const SSO_EMAIL_STORAGE_KEY = "better-auth-ui.sso-email"

/** Read the email carried from SSO discovery into a fallback sign-in view. */
export function getSsoFallbackEmail() {
  if (typeof sessionStorage === "undefined") return ""
  return sessionStorage.getItem(SSO_EMAIL_STORAGE_KEY) ?? ""
}

/** Persist the email used for SSO discovery for passwordless fallback views. */
export function setSsoFallbackEmail(email: string) {
  if (typeof sessionStorage === "undefined") return
  sessionStorage.setItem(SSO_EMAIL_STORAGE_KEY, email)
}
