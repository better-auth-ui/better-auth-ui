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
  application: "Application",

  /** @remarks `"Choose an account"` */
  selectAccount: "Choose an account",
  /** @remarks `"Pick the account you want to use with {{client}}."` */
  selectAccountDescription: "Pick the account you want to use with {{client}}.",
  /** @remarks `"Current"` */
  currentAccount: "Current",
  /** @remarks `"Continue"` */
  continue: "Continue",
  /** @remarks `"No accounts available"` */
  noAccounts: "No accounts available",
  /** @remarks `"Sign in to continue to {{client}}."` */
  noAccountsDescription: "Sign in to continue to {{client}}.",

  /** @remarks `"Account created"` */
  accountCreated: "Account created",
  /** @remarks `"Taking you back to {{client}}."` */
  continuing: "Taking you back to {{client}}.",
  /** @remarks `"Your account is ready, but we could not send you back to {{client}}."` */
  continueFailed:
    "Your account is ready, but we could not send you back to {{client}}.",
  /** @remarks `"Try again"` */
  tryAgain: "Try again",

  /** @remarks `"Connected applications"` */
  connectedApplications: "Connected applications",
  /** @remarks `"No connected applications"` */
  noConnectedApplications: "No connected applications",
  /** @remarks `"Applications you authorize will show up here."` */
  connectedApplicationsDescription:
    "Applications you authorize will show up here.",
  /** @remarks `"Last authorized"` */
  lastAuthorized: "Last authorized",
  /** @remarks `"Remove authorization"` */
  removeAuthorization: "Remove authorization",
  /** @remarks `"Remove authorization?"` */
  removeAuthorizationTitle: "Remove authorization?",
  /** @remarks `"This application will need your approval before receiving new access. Existing tokens may remain valid until they expire."` */
  removeAuthorizationDescription:
    "This application will need your approval before receiving new access. Existing tokens may remain valid until they expire.",
  /** @remarks `"Remove"` */
  remove: "Remove"
}

export type OAuthProviderLocalization = typeof oauthProviderLocalization
