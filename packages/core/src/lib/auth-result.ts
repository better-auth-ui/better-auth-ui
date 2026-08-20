import type { Localization } from "./localization"

export type AuthResultFlow =
  | "accountLinking"
  | "emailVerification"
  | "oauth"
  | "passwordReset"
  | "unknown"

export type AuthResultReason =
  | "accountLinkConflict"
  | "accountLinked"
  | "callbackFailed"
  | "cancelled"
  | "emailNotVerified"
  | "emailVerified"
  | "expiredLink"
  | "genericError"
  | "genericSuccess"
  | "missingEmail"
  | "passwordReset"
  | "signupComplete"
  | "signupDisabled"

export type AuthResultAction =
  | "accountSettings"
  | "continue"
  | "forgotPassword"
  | "signIn"
  | "signUp"
  | "verifyEmail"

export type AuthResult = {
  action: AuthResultAction
  code?: string
  flow: AuthResultFlow
  intent: "danger" | "success" | "warning"
  reason: AuthResultReason
  redirectTo?: string
}

export type AuthResultMessage = {
  description: string
  title: string
}

const CANCELLED_ERRORS = new Set([
  "access_denied",
  "authorization_declined",
  "cancelled",
  "canceled",
  "user_cancelled",
  "user_canceled"
])

const EXPIRED_LINK_ERRORS = new Set([
  "expired_token",
  "invalid_token",
  "token_expired"
])

const ACCOUNT_LINK_ERRORS = new Set([
  "account_already_linked_to_different_user",
  "account_not_linked",
  "email_does_not_match",
  "unable_to_link_account"
])

const CALLBACK_ERRORS = new Set([
  "internal_server_error",
  "invalid_callback_request",
  "invalid_code",
  "issuer_mismatch",
  "issuer_missing",
  "no_callback_url",
  "no_code",
  "nonce_binding_missing",
  "oauth_provider_not_found",
  "provider_not_found",
  "state_mismatch",
  "state_not_found",
  "unable_to_get_user_info"
])

const normalizeValue = (value: string | null) =>
  value
    ?.trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_") ?? ""

function parseFlow(params: URLSearchParams): AuthResultFlow {
  const flow = normalizeValue(params.get("flow") ?? params.get("source"))

  if (["account_link", "account_linking", "link_account"].includes(flow)) {
    return "accountLinking"
  }
  if (["email", "email_verification", "verify_email"].includes(flow)) {
    return "emailVerification"
  }
  if (["password", "password_reset", "reset_password"].includes(flow)) {
    return "passwordReset"
  }
  if (["oauth", "social", "social_sign_in"].includes(flow)) return "oauth"

  return "unknown"
}

const AUTH_REDIRECT_ORIGIN = "https://better-auth-ui.local"

/** Only allow a local redirect path from callback query parameters. */
export function getSafeAuthRedirect(value: string | null) {
  const redirect = value?.trim()

  if (!redirect?.startsWith("/")) return undefined

  try {
    return new URL(redirect, AUTH_REDIRECT_ORIGIN).origin ===
      AUTH_REDIRECT_ORIGIN
      ? redirect
      : undefined
  } catch {
    return undefined
  }
}

/** Classify Better Auth callback parameters into a stable UI result. */
export function parseAuthResult(
  search: string | URLSearchParams,
  fallbackIntent: "danger" | "success" = "success"
): AuthResult {
  const params =
    typeof search === "string"
      ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
      : search
  const code =
    normalizeValue(params.get("error")) || normalizeValue(params.get("code"))
  const result =
    normalizeValue(params.get("result")) || normalizeValue(params.get("status"))
  const flow = parseFlow(params)
  const redirectTo = getSafeAuthRedirect(
    params.get("redirectTo") ?? params.get("returnTo")
  )

  if (code) {
    if (CANCELLED_ERRORS.has(code)) {
      return {
        action: "signIn",
        code,
        flow: flow === "unknown" ? "oauth" : flow,
        intent: "warning",
        reason: "cancelled"
      }
    }
    if (EXPIRED_LINK_ERRORS.has(code)) {
      const action =
        flow === "passwordReset"
          ? "forgotPassword"
          : flow === "emailVerification"
            ? "verifyEmail"
            : "signIn"
      return { action, code, flow, intent: "danger", reason: "expiredLink" }
    }
    if (ACCOUNT_LINK_ERRORS.has(code)) {
      return {
        action: "accountSettings",
        code,
        flow: "accountLinking",
        intent: "danger",
        reason: "accountLinkConflict"
      }
    }
    if (code === "signup_disabled") {
      return {
        action: "signIn",
        code,
        flow,
        intent: "danger",
        reason: "signupDisabled"
      }
    }
    if (code === "email_not_verified") {
      return {
        action: "verifyEmail",
        code,
        flow,
        intent: "warning",
        reason: "emailNotVerified"
      }
    }
    if (code === "email_not_found") {
      return {
        action: "signIn",
        code,
        flow,
        intent: "danger",
        reason: "missingEmail"
      }
    }
    if (CALLBACK_ERRORS.has(code)) {
      return {
        action: "signIn",
        code,
        flow: flow === "unknown" ? "oauth" : flow,
        intent: "danger",
        reason: "callbackFailed"
      }
    }

    return {
      action: "signIn",
      code,
      flow,
      intent: "danger",
      reason: "genericError"
    }
  }

  if (["cancelled", "canceled"].includes(result)) {
    return {
      action: "signIn",
      flow,
      intent: "warning",
      reason: "cancelled"
    }
  }
  if (
    ["email_verified", "verified"].includes(result) ||
    (result === "success" && flow === "emailVerification")
  ) {
    return {
      action: redirectTo ? "continue" : "signIn",
      flow: "emailVerification",
      intent: "success",
      reason: "emailVerified",
      redirectTo
    }
  }
  if (
    result === "account_linked" ||
    (result === "success" && flow === "accountLinking")
  ) {
    return {
      action: redirectTo ? "continue" : "accountSettings",
      flow: "accountLinking",
      intent: "success",
      reason: "accountLinked",
      redirectTo
    }
  }
  if (
    result === "password_reset" ||
    (result === "success" && flow === "passwordReset")
  ) {
    return {
      action: "signIn",
      flow: "passwordReset",
      intent: "success",
      reason: "passwordReset"
    }
  }
  if (["signup_complete", "signed_up"].includes(result)) {
    return {
      action: redirectTo ? "continue" : "signIn",
      flow,
      intent: "success",
      reason: "signupComplete",
      redirectTo
    }
  }

  if (fallbackIntent === "danger") {
    return {
      action: "signIn",
      flow,
      intent: "danger",
      reason: "genericError"
    }
  }

  return {
    action: redirectTo ? "continue" : "signIn",
    flow,
    intent: "success",
    reason: "genericSuccess",
    redirectTo
  }
}

/** Resolve localized copy for a classified callback result. */
export function getAuthResultMessage(
  result: AuthResult,
  localization: Localization
): AuthResultMessage {
  const auth = localization.auth
  const messages: Record<AuthResultReason, AuthResultMessage> = {
    accountLinkConflict: {
      description: auth.callbackAccountLinkConflictDescription,
      title: auth.callbackAccountLinkConflictTitle
    },
    accountLinked: {
      description: auth.callbackAccountLinkedDescription,
      title: auth.callbackAccountLinkedTitle
    },
    callbackFailed: {
      description: auth.callbackFailedDescription,
      title: auth.callbackFailedTitle
    },
    cancelled: {
      description: auth.callbackCancelledDescription,
      title: auth.callbackCancelledTitle
    },
    emailNotVerified: {
      description: auth.callbackEmailNotVerifiedDescription,
      title: auth.callbackEmailNotVerifiedTitle
    },
    emailVerified: {
      description: auth.callbackEmailVerifiedDescription,
      title: auth.callbackEmailVerifiedTitle
    },
    expiredLink: {
      description: auth.callbackExpiredLinkDescription,
      title: auth.callbackExpiredLinkTitle
    },
    genericError: {
      description: auth.callbackGenericErrorDescription,
      title: auth.callbackGenericErrorTitle
    },
    genericSuccess: {
      description: auth.callbackGenericSuccessDescription,
      title: auth.callbackGenericSuccessTitle
    },
    missingEmail: {
      description: auth.callbackMissingEmailDescription,
      title: auth.callbackMissingEmailTitle
    },
    passwordReset: {
      description: auth.callbackPasswordResetDescription,
      title: auth.callbackPasswordResetTitle
    },
    signupComplete: {
      description: auth.callbackSignupCompleteDescription,
      title: auth.callbackSignupCompleteTitle
    },
    signupDisabled: {
      description: auth.callbackSignupDisabledDescription,
      title: auth.callbackSignupDisabledTitle
    }
  }

  return messages[result.reason]
}
