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
  remove: "Remove",

  /** @remarks `"OAuth clients"` */
  oauthClients: "OAuth clients",
  /** @remarks `"Create and manage applications that can request access to accounts."` */
  oauthClientsDescription:
    "Create and manage applications that can request access to accounts.",
  /** @remarks `"No OAuth clients"` */
  noOAuthClients: "No OAuth clients",
  /** @remarks `"Create a client when your application is ready to use OAuth."` */
  noOAuthClientsDescription:
    "Create a client when your application is ready to use OAuth.",
  /** @remarks `"Create client"` */
  createClient: "Create client",
  /** @remarks `"Edit client"` */
  editClient: "Edit client",
  /** @remarks `"Client name"` */
  clientName: "Client name",
  /** @remarks `"Application type"` */
  applicationType: "Application type",
  /** @remarks `"Web"` */
  webApplication: "Web",
  /** @remarks `"Native"` */
  nativeApplication: "Native",
  /** @remarks `"Redirect URLs"` */
  redirectUrls: "Redirect URLs",
  /** @remarks `"Enter one URL per line."` */
  redirectUrlsDescription: "Enter one URL per line.",
  /** @remarks `"Application URL"` */
  applicationUrl: "Application URL",
  /** @remarks `"Logo URL"` */
  logoUrl: "Logo URL",
  /** @remarks `"Scopes"` */
  scopes: "Scopes",
  /** @remarks `"Save changes"` */
  saveChanges: "Save changes",
  /** @remarks `"Client ID"` */
  clientId: "Client ID",
  /** @remarks `"Client secret"` */
  clientSecret: "Client secret",
  /** @remarks `"Copy this secret now. It will not be shown again."` */
  clientSecretWarning: "Copy this secret now. It will not be shown again.",
  /** @remarks `"Rotate secret"` */
  rotateSecret: "Rotate secret",
  /** @remarks `"Rotate client secret?"` */
  rotateSecretTitle: "Rotate client secret?",
  /** @remarks `"The current secret will stop working immediately."` */
  rotateSecretDescription: "The current secret will stop working immediately.",
  /** @remarks `"Delete client"` */
  deleteClient: "Delete client",
  /** @remarks `"Delete OAuth client?"` */
  deleteClientTitle: "Delete OAuth client?",
  /** @remarks `"This permanently removes the client and stops new authorization requests."` */
  deleteClientDescription:
    "This permanently removes the client and stops new authorization requests.",
  /** @remarks `"Enabled"` */
  enabled: "Enabled",
  /** @remarks `"Disabled"` */
  disabled: "Disabled",
  /** @remarks `"Client created"` */
  clientCreated: "Client created",
  /** @remarks `"Secret rotated"` */
  secretRotated: "Secret rotated"
}

export type OAuthProviderLocalization = typeof oauthProviderLocalization
