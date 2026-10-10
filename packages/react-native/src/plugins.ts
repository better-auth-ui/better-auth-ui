// The `@better-auth-ui/react-native/plugins` subpath. Re-exports the RN plugin
// type contract + the RN plugin registration modules. Kept off the root barrel
// so apps only bundle the plugins they import.

export * from "./lib/auth/api-key-plugin"
export * from "./lib/auth/delete-user-plugin"
export * from "./lib/auth/magic-link-plugin"
export * from "./lib/auth/multi-session-plugin"
export * from "./lib/auth/organization-plugin"
export * from "./lib/auth/theme-plugin"
export * from "./lib/auth/username-plugin"
export * from "./lib/auth-plugin"

export * from "./lib/auth/anonymous-plugin"
export * from "./lib/auth/two-factor-plugin"

export * from "./lib/auth/email-otp-plugin"

export * from "./lib/auth/device-authorization-plugin"
export * from "./lib/auth/last-login-method-plugin"

export * from "./lib/auth/passkey-plugin"
export * from "./lib/auth/siwe-plugin"

export * from "./lib/auth/phone-number-plugin"

export { billingPlugin } from "./lib/auth/billing-plugin"
export { agentAuthPlugin } from "./lib/auth/agent-auth-plugin"
export { dashPlugin } from "./lib/auth/dash-plugin"

export { adminPlugin } from "./lib/auth/admin-plugin"
export { ssoPlugin } from "./lib/auth/sso-plugin"

export { oauthProviderPlugin } from "./lib/auth/oauth-provider-plugin"
