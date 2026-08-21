export const ssoLocalization = {
  addProvider: "Add SSO provider",
  clientId: "Client ID",
  clientSecret: "Client secret",
  continueWithEmail: "Continue with email",
  continueWithSso: "Continue with SSO",
  copyDnsHost: "Copy DNS host",
  copyDnsValue: "Copy DNS value",
  domain: "Email domain",
  domainVerification: "Domain verification",
  domainVerificationDescription:
    "Publish the TXT record for every configured domain, then verify it.",
  domainVerificationRequested: "A new verification token was created.",
  domainVerified: "The provider domain is verified.",
  emailFirstDescription: "Enter your work email to continue.",
  entryPoint: "SSO URL",
  identityProviderMetadata: "Identity provider metadata XML",
  issuer: "Issuer URL",
  oidc: "OIDC",
  organizationId: "Organization ID",
  providerCreated: "The SSO provider was added.",
  providerId: "Provider ID",
  providerSetup: "SSO provider setup",
  providerSetupDescription:
    "Connect an OpenID Connect or SAML identity provider.",
  requestNewToken: "Create new token",
  saml: "SAML",
  txtRecordHost: "TXT record host",
  txtRecordValue: "TXT record value",
  useDifferentEmail: "Use a different email",
  verifyDomain: "Verify domain",
  noProvider:
    "No organization sign-in was found. Choose another way to continue.",
  ssoUnavailable:
    "Organization sign-in is unavailable. Try another sign-in method."
}

export type SsoLocalization = typeof ssoLocalization
