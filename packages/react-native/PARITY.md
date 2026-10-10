# React Native feature parity

This checklist tracks the native work after [PR #446](https://github.com/better-auth-ui/better-auth-ui/pull/446).
The baseline is the [October 10, 2026 assessment](./README.md#feature-parity): 14 absent plugin surfaces and 19 missing or partial capability groups.
The 14 plugin surfaces and 19 capability groups now have native implementations.
Checked items below mean the code is implemented. Device validation remains separate.

The reference implementations are React with HeroUI, shadcn/Radix, and shadcn/Base UI, plus Solid with Zaidan.
Parity means equivalent user outcomes, public configuration, localization, permissions, and error recovery.
Native controls can differ from browser controls.

## Shared forms and plugin hosts

- [x] **Additional fields at sign-up:** Render configured fields, including required usernames, and submit their parsed values.
- [x] **Additional-field form contract:** Support controlled values, blur events, field errors, async validation, and validation debounce. Exclude read-only fields from mutations and reseed forms after session changes.
- [x] **Password strength:** Use the shared password policy and localized strength feedback in sign-up, reset, and change-password forms.
- [x] **Reauthentication:** Recover from fresh-session errors, preserve the pending action, and retry it after successful authentication.
- [x] **Plugin host contract:** Mount keyed auth prompts, apply change-email overrides, render organization tabs, and pass organization identity to cards.

## Authentication and navigation

- [x] **Auth result routes:** Implement callback, error, and redirect views with the same success and failure behavior as web.
- [x] **Email-link follow-up screens:** Implement reset-link-sent and magic-link-sent views with resend controls and pending states.
- [x] **Navigation configuration:** Resolve plugin and custom paths in state, Expo Router, and React Navigation adapters. Support redirect destinations, organization URLs, query parameters, and unknown routes.
- [x] **Session-wide actions:** Support sign-out-everywhere and sign-out-other-devices, including pending states, session refresh, and error recovery.

## Shared presentation and account controls

- [x] **Locale formatting and direction:** Use the configured language tag for dates, relative dates, and numbers. Support RTL layout and accessible native controls.
- [x] **Avatar and logo customization:** Honor upload and resize callbacks, size limits, and format configuration. Preserve picker uploads and image removal.
- [x] **API-key management options:** Support key editing, expiration selection, configured key groups, and action-specific permissions.

## Organization capabilities

Organization access uses an explicit slug or ID. Switching organizations changes the navigation target.
Personal access never falls back to the session active organization.

- [x] **Direct invitation acceptance:** Open invitation links, recover through authentication, and support acceptance and rejection.
- [x] **Multiple organization roles:** Support role selection, member editing, and filters for members with multiple roles.
- [x] **Organization teams:** Support team creation, editing, removal, member assignment, and team switching.
- [x] **Dynamic organization roles:** Support role creation, editing, removal, and permission editing.
- [x] **Organization model fields:** Render and validate custom organization, member, invitation, team, and role fields.
- [x] **Organization policy and permission UI:** Honor creation policy, resource limits, custom roles, and action-specific permissions. Show resolved content while permission queries remain pending.
- [x] **Organization list tools:** Support sorting, pagination, selection, bulk actions, and field visibility through native list controls.

## Plugin surfaces

Each plugin needs its public registration, configured views, localization, supported actions, and appropriate package exports.
The existing core queries and React hooks remain the source of shared behavior.

- [x] **Admin:** User management, user inspection, and impersonation controls.
- [x] **Agent auth:** Agent approval and authorization management.
- [x] **Anonymous:** Anonymous sign-in action and its configured auth button.
- [x] **Billing:** Subscription controls, checkout, and billing portal navigation.
- [x] **Dash:** Audit activity, filters, pagination, and localized event details.
- [x] **Device authorization:** Device approval, rejection, expiration, and authentication recovery.
- [x] **Email OTP:** Code sign-in, email verification and change, password recovery, and card overrides.
- [x] **Last login method:** Last-used method indicators across supported authentication controls.
- [x] **OAuth provider:** Verified consent requests, account selection, client management, and authorized applications.
- [x] **Passkey:** Sign-in, registration, listing, rename, and removal through a supported native client integration.
- [x] **Phone number:** Sign-in, verification, change, removal, and password recovery.
- [x] **SIWE:** Wallet sign-in and linked wallet management through a supported native wallet integration.
- [x] **SSO:** Email discovery, provider setup, domain verification, and organization provider management.
- [x] **Two-factor:** Authentication challenges, enable and disable controls, backup codes, and code regeneration.

Browser-only Google One Tap is outside this checklist.
Server email templates remain available through the existing React and Solid email entrypoints.

## Automated validation

The native suite has 65 passing tests. Its unit and Chromium tests cover controlled forms, custom validation,
read-only fields, password policy, route configuration, and authentication recovery.
Behavior tests cover explicit device and agent decisions, email and phone codes,
passkey management, SSO discovery, signed OAuth requests, billing scope,
API-key options, organization role editing, and permission loading.
Image tests verify custom callbacks, cancellation, cropping, encoding, and resource release.
Shared core tests cover role assignment checks, native slug generation, and OAuth secret handling.

Chromium uses React Native Web to exercise component behavior. These tests cannot
verify device credential ceremonies, keyboard behavior, or OS permission dialogs.

## Completion criteria

Mark each item complete only after its implementation and relevant validation pass.
Reference component counts describe the baseline, but they do not determine functional completion.

- [x] Add focused behavior tests for forms, navigation, permission gates, and plugin configuration.
- [x] Verify each new native plugin registration and its exports through declaration consumer checks.
- [x] Verify the Expo showcase with the required Better Auth client plugins.
- [x] Run affected build, typecheck, and test targets through Bun and Nx.
- [x] Run the source sync and affected browser tests after changes to shared web sources.
- [x] Pass workspace Oxlint and Oxfmt checks.
- [ ] Verify iOS and Android authentication, deep links, settings, and organization flows.
- [ ] Verify keyboard navigation, screen reader labels, RTL, dark mode, and leaf-level loading states.
- [x] Update the README assessment and usage examples to match the implemented behavior.

The follow-up PR remains a draft until device validation passes.
Any platform limitation needs a documented user outcome and supporting evidence before review.

## Device validation to finish

- [ ] On iOS and Android, follow email, password reset, invitation, device, SSO, and OAuth deep links through sign-in and back to their destination.
- [ ] With a compatible native passkey client, register, sign in, rename, and remove a passkey. Verify the app's associated domains and Android asset links.
- [ ] With a native wallet connector, sign a SIWE message and manage linked wallets. Test user cancellation and connection failure.
- [ ] Exercise TOTP, email/phone codes, backup codes, fresh-session recovery, and session revocation against a configured server.
- [ ] Verify image permissions, cropping, upload, removal, date/time controls, clipboard access, and native modals.
- [ ] Check VoiceOver, TalkBack, hardware keyboards, RTL, dark mode, and permission-dependent loading with realistic network delays.

## Native integration contracts

`passkeyPlugin({ client })` requires a Better Auth compatible client that performs
native credential ceremonies. A browser WebAuthn client does not provide those ceremonies.
`siwePlugin({ connector, domain, uri })` uses the application's native wallet connector.
The wallet manager, billing adapter, Agent Auth adapter, and organization OAuth client
manager use the same core contracts as web. Organization adapters receive explicit identity.

External checkout and provider flows use the OS browser. The authorization server must
return valid callbacks. Custom OAuth schemes must match the verified request's scheme,
authority, and path. Enable `allowPublicClientPrelogin` on the OAuth server for signed
pre-login metadata verification.
