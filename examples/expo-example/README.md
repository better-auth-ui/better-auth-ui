# Expo example

This app uses the native Expo Router adapter. One provider stays mounted above all
routes, preserving verification state and actions that require fresh authentication.
The UI uses plain React Native styles.

## Run

From the repository root:

```sh
bun install
EXPO_PUBLIC_API_URL=http://localhost:3000 bun nx run expo-example:start
```

Use your machine's LAN address on a physical device. The server must register
[Better Auth's Expo integration](https://www.better-auth.com/docs/integrations/expo)
and trust `betterauthuiexpo://` callbacks.

## Server configuration

Enable email/password authentication and matching client plugins: API key, admin,
anonymous, device authorization, email OTP, last login method, magic link,
multi-session, organization, phone number, SSO, two-factor, and username.
Organization client options enable teams and dynamic access control.
Configure the same features on the server, including its permission registry.
Configure mail and SMS delivery, OAuth provider credentials, and application origins.

Features backed by application integrations, such as billing, native passkeys,
SIWE wallets, Agent Auth, Dash, and OAuth client management, are available in the
package. This example does not supply those application integrations.

## Routes

- `app/_layout.tsx` configures the persistent provider, plugins, and navigation adapter.
- `app/auth/[...view].tsx` resolves built-in and plugin views, tokens, and return destinations.
- `app/settings/[...view].tsx` renders account, security, and contributed settings tabs.
- `app/organization/[slug]/[...view].tsx` uses explicit organization access.
- `app/admin/[...view].tsx` renders administration with server permission checks.
- `app/(app)/index.tsx` links to settings and redirects unauthenticated users to sign-in.
- `app/showcase.tsx` renders account and organization components with the root configuration.
- `src/auth-client.ts` configures client plugins and native secure session storage.

## Validate

```sh
bun nx run expo-example:typecheck
bun nx run expo-example:build
```

The build exports iOS, Android, and web bundles. It does not test a running device.
Follow the [native device checklist](../../packages/react-native/PARITY.md#device-validation-to-finish)
against your configured server before shipping.
