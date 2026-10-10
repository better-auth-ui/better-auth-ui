type EmailFlow = "verifyEmail" | "resetLinkSent" | "magicLinkSent"
const pendingEmails = new Map<EmailFlow, string>()

/** Remember an email within the current app session for a follow-up screen. */
export function setPendingEmail(
  email: string,
  flow: EmailFlow = "verifyEmail"
) {
  pendingEmails.set(flow, email)
}

export function getPendingEmail(flow: EmailFlow = "verifyEmail") {
  return pendingEmails.get(flow)
}
