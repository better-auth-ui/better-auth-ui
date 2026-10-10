---
name: better-auth-ui-react-native
description: Integrate Better Auth UI in React Native and Expo apps with native authentication views, settings, organization management, plugins, and deep links. Use for @better-auth-ui/react-native consumers.
license: MIT
metadata:
  library: "@better-auth-ui/react-native"
  framework: react-native
---

# Better Auth UI for React Native

Use the installed package exports as the API authority. This package renders native
controls and shares auth queries and mutations with `@better-auth-ui/react`.

## Configure providers and routing

- Import UI components and `AuthProvider` from `@better-auth-ui/react-native`.
  Import data hooks from `@better-auth-ui/react`.
- Keep the native provider mounted above authentication, settings, and organization
  routes. Remounting it discards pending reauthentication actions.
- Pass one QueryClient to the provider and any surrounding QueryClientProvider.
- With Expo Router, pass `useRouter()`, `usePathname()`, and router params to
  `createExpoRouterNavigation`. Render the current host component on its route.
- With React Navigation, map every enabled auth, settings, and organization view
  to a registered screen through `createReactNavigationNavigation`.
- The default state adapter stores the current view in memory. Supply
  `onUnhandledNavigate` for destinations outside the auth route map.
- Configure `baseURL` with the application callback scheme and configure the server
  to trust it. Preserve verification tokens and `redirectTo` through authentication.
- Use `@better-auth/expo` with secure session storage on native. Configure matching
  Better Auth server and client plugins for the UI plugins your app enables.

## Register native plugins

Import registrations from `@better-auth-ui/react-native/plugins` or individual
plugin paths. Individual paths also export native plugin components.

Passkey controls require `passkeyPlugin({ client })` with a Better Auth compatible
client that performs native credential ceremonies. Configure associated domains
and Android asset links in the application. Browser WebAuthn cannot supply a native ceremony.

SIWE controls require a native wallet connector. Billing, Agent Auth, and OAuth
management accept the shared core adapter contracts. Implement those adapters against
the application's authorized server endpoints.

OAuth consent requires verified signed request metadata. Enable server support for
`allowPublicClientPrelogin`. Keep the signed query intact during account selection,
sign-up, and email verification. Custom callback schemes must match the verified request.

## Use explicit organization access

Pass a route slug or explicit organization ID. Personal access must not use the
session active organization. Switching organizations changes the navigation target.
Team selection belongs to the route as well.

Configure multiple roles, creator roles, model fields, limits, and dynamic permissions
through `organizationPlugin`. Authorize organization adapter requests on the server
with the supplied ID and slug. Keep resolved content visible while action permissions load.

## Forms, images, and native controls

- Use native `useAuthForm`, `withAuthForm`, and `withAuthFieldGroup` for reusable forms.
  Bind controlled field values, changes, blur, and errors. Preserve custom validators
  and debounce configuration. Exclude read-only fields from mutation payloads.
- Native avatar and logo callbacks receive `NativeImageAsset`, including its URI and
  dimensions. A custom upload returns a URL; the default data URL path needs base64.
- Install SDK-compatible image picker/manipulator and clipboard peers for those features.
  Date/time and slider peers provide OS controls, with editable fallbacks.
- Components resolve their own styles. No NativeWind or Tailwind setup is required.
  Use supported utility classes or native primitive styles and `gap-*` spacing.
- Use `locale.languageTag` for formatting and `locale.direction` for RTL.
  ThemeProvider supports light and dark color tokens.

## Validate native behavior

Component tests under React Native Web can verify decisions, payloads, permissions,
and navigation. They cannot verify OS credential ceremonies, screen readers, permission
prompts, or keyboards. Check auth deep links, reauthentication, wallet cancellation,
image operations, and accessibility on iOS and Android against the configured server.
