# @better-auth-ui/react-native

Native Better Auth components for React Native and Expo. The package uses shared
queries and mutations from `@better-auth-ui/core` and `@better-auth-ui/react`.
Components use React Native styles and require no external styling engine.

The package implements all 21 plugin UI surfaces and the 19 capability groups
identified after [PR #446](https://github.com/better-auth-ui/better-auth-ui/pull/446).
[The parity checklist](./PARITY.md) records implementation and validation separately.
iOS and Android device validation is still pending.

## Install

```sh
bun add @better-auth-ui/react-native @better-auth-ui/core @better-auth-ui/react better-auth react-native-svg @tanstack/react-query
```

Install native peers for the features your app uses. In Expo, use `bunx expo install`
to select versions compatible with your SDK.

| Feature | Native peer |
| --- | --- |
| Default avatar and logo picker | `expo-image-picker`, `expo-image-manipulator` |
| Clipboard controls | `expo-clipboard` |
| Native date and time picker | `@react-native-community/datetimepicker` |
| Native slider | `@react-native-community/slider` |

Date and time fields have editable text controls when the native picker is unavailable.
Sliders have numeric controls when the slider peer is unavailable.
Provide custom image callbacks if your app uses another picker or storage service.
Metro may require optional imports to resolve during bundling, so check your app build
when omitting a peer.

## Use authentication views

Keep the provider mounted across auth and settings routes. This preserves pending
email flows and actions that require reauthentication. The provider accepts a shared
TanStack Query client.

```tsx
import { Auth, AuthProvider } from "@better-auth-ui/react-native"
import { emailOtpPlugin, twoFactorPlugin } from "@better-auth-ui/react-native/plugins"
import { authClient } from "./auth-client"
import { handleAppNavigation } from "./navigation"

const plugins = [emailOtpPlugin(), twoFactorPlugin()]

export default function App() {
  return (
    <AuthProvider authClient={authClient} plugins={plugins} onUnhandledNavigate={handleAppNavigation}>
      <Auth />
    </AuthProvider>
  )
}
```

Without a navigation adapter, the provider stores the current view in memory.
Use `onUnhandledNavigate` to handle destinations outside auth, settings, and organization routes.
Configure the same Better Auth plugins on your server and client as you register in the UI.

## Expo Router and deep links

```tsx
import { Stack, useGlobalSearchParams, usePathname, useRouter } from "expo-router"
import { AuthProvider, createExpoRouterNavigation } from "@better-auth-ui/react-native"

export default function RootLayout() {
  const navigation = createExpoRouterNavigation({
    router: useRouter(),
    pathname: usePathname(),
    params: useGlobalSearchParams()
  })
  return (
    <AuthProvider
      authClient={authClient}
      navigation={navigation}
      plugins={plugins}
      baseURL="myapp://"
      redirectTo="/"
    >
      <Stack />
    </AuthProvider>
  )
}
```

Mount `<Auth />` at `app/auth/[...view].tsx`, `<Settings />` at settings routes,
and `<Organization />` at organization routes containing an explicit slug.
The adapter resolves plugin paths and provider overrides. It preserves tokens,
query parameters, redirect destinations, and nested paths such as OAuth sign-up.
[The Expo example](../../examples/expo-example) includes these routes and a client configuration.

Use the [Better Auth Expo integration](https://www.better-auth.com/docs/integrations/expo)
with `expo-secure-store`. Configure the app scheme, matching server plugins, and trusted origins.

## React Navigation

```tsx
import { createReactNavigationNavigation } from "@better-auth-ui/react-native"

const navigation = createReactNavigationNavigation({
  navigation: appNavigation,
  route: currentRoute,
  screens: {
    auth: { signIn: "SignIn", twoFactor: "TwoFactor", callback: "AuthCallback" },
    settings: { account: "Account", security: "Security" },
    organization: { settings: "Organization", people: "People", teams: "Teams" }
  },
  onUnhandledNavigate: ({ to }) => openAppDestination(to)
})
```

Register each screen your app exposes. Screens receive the same token, slug, and
redirect parameters as the Expo and state adapters.

## Plugin surfaces

Registrations are exported from `@better-auth-ui/react-native/plugins` and individual
paths such as `@better-auth-ui/react-native/plugins/two-factor`. Individual paths also
export their native components.

| Plugin | Native UI |
| --- | --- |
| Admin | User search, inspection, editing, roles, bans, sessions, and impersonation |
| Agent auth | Verified capability approval, rejection, and grant revocation |
| Anonymous | Anonymous sign-in |
| API key | Create, edit, groups, expiration, permissions, copy, and delete |
| Billing | Plans, subscription, usage, checkout, portal, cancellation, and restore |
| Dash | Personal, organization, and admin activity with filters and pagination |
| Delete user | Account deletion and recovery requirements |
| Device authorization | Code verification and explicit approval or rejection |
| Email OTP | Sign-in, email verification/change, and password recovery |
| Last login method | Last-used badges on authentication controls |
| Magic link | Request, resend, and email-link follow-up |
| Multi-session | Account management and switching |
| OAuth provider | Verified consent, account selection, sign-up, clients, and authorized apps |
| Organization | Invitations, multiple roles, teams, dynamic roles, model fields, and list tools |
| Passkey | Sign-in, registration, list, rename, and removal |
| Phone number | Code/password sign-in, verification, change/removal, and recovery |
| SIWE | Wallet sign-in, linking, primary wallet, and unlinking |
| SSO | Discovery, provider setup, domain verification, and organization providers |
| Theme | Appearance settings and theme menu |
| Two-factor | Challenges, TOTP setup, backup codes, regeneration, and disable |
| Username | Sign-in, sign-up fields, availability, and profile editing |

Native passkeys require `passkeyPlugin({ client })` with a compatible client that
performs OS credential ceremonies. SIWE requires a native wallet connector.
Billing, Agent Auth, and OAuth client management use the shared adapter contracts.
Organization adapters must authorize explicit organization IDs and slugs on the server.
OAuth pre-login views require server support for signed public metadata verification
with `allowPublicClientPrelogin` enabled.

Browser Google One Tap is outside native parity. Server email templates remain
available through the existing React and Solid email entrypoints.

## Forms and organization access

Sign-up and profile forms support controlled additional fields, async validation,
validation debounce, field errors, defaults, and session reseeding. Read-only fields
are excluded from mutation payloads. Password forms share password policy and localized
strength feedback. Fresh-session errors preserve the failed action and retry it only
when the same user authenticates again.

Organization access uses an explicit route slug or ID. Switching organizations changes
the route. Personal screens do not fall back to the session active organization.
Team selection also belongs to the route. Configure resource limits, creator roles,
multiple roles, model fields, and dynamic permissions through `organizationPlugin`.
Native lists support search, filtering, sorting, pagination, selection, bulk actions,
and field visibility. Permission loading affects actions while resolved content stays mounted.

## Images, locale, and themes

Native image callbacks receive `NativeImageAsset` rather than browser `File` objects:

```tsx
<AuthProvider
  authClient={authClient}
  avatar={{
    size: 128,
    extension: "webp",
    pick: pickNativeImage,
    resize: resizeNativeImage,
    upload: uploadNativeImage,
    delete: deleteStoredImage
  }}
>
  {children}
</AuthProvider>
```

The default resize crops to a square without stretching. An upload callback returns
an image URL. Without one, the resized asset must contain base64 data.
Use the same options in `organizationPlugin({ logo: { ... } })` for organization logos.

`locale.languageTag` controls date, relative-time, and number formatting.
`locale.direction` controls RTL layout and text direction. `ThemeProvider` accepts
light and dark color tokens, and `themePlugin()` supplies appearance controls.
Components accept `className` from the package's utility subset; primitives also accept
native styles. Use `gap-*` for spacing between children.

## Validation

Unit and Chromium behavior tests cover shared forms, routing, recovery, permission gates,
authentication challenges, plugin management, and image callbacks. Declaration consumers
check Node16, NodeNext, and bundler resolution for every plugin path.

Device tests remain necessary for deep links, credential ceremonies, wallet connections,
OS permissions, screen readers, keyboards, RTL, and dark mode. See the
[device checklist](./PARITY.md#device-validation-to-finish) before release.

## License

MIT
