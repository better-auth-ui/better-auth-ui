export const oauthProviderLocalization = {
  /** @remarks `"Authorize {{client}}"` */
  authorize: "Authorize {{client}}",
  /** @remarks `"{{client}} wants to access your account."` */
  authorizationDescription: "{{client}} wants to access your account.",
  /** @remarks `"This will allow {{client}} to:"` */
  requestedPermissions: "This will allow {{client}} to:",
  /** @remarks `"Signed in as"` */
  signedInAs: "Signed in as",
  /** @remarks `"Allow"` */
  allow: "Allow",
  /** @remarks `"Cancel"` */
  cancel: "Cancel",
  /** @remarks `"Privacy policy"` */
  privacyPolicy: "Privacy policy",
  /** @remarks `"Terms of service"` */
  termsOfService: "Terms of service",
  /** @remarks `"Invalid authorization request"` */
  invalidRequest: "Invalid authorization request",
  /** @remarks `"This authorization request is missing required information or is no longer valid."` */
  invalidRequestDescription:
    "This authorization request is missing required information or is no longer valid.",
  /** @remarks `"Application"` */
  application: "Application"
}

export type OAuthProviderLocalization = typeof oauthProviderLocalization
