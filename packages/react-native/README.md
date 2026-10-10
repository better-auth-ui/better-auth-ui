# @better-auth-ui/react-native

Beautiful, plug-and-play [Better Auth](https://better-auth.com) UI for **React Native & Expo**. A native render target for [`better-auth-ui`](https://better-auth-ui.com) that mirrors the `@better-auth-ui/heroui` components — reusing the framework-agnostic logic from `@better-auth-ui/core` and `@better-auth-ui/react` unchanged.

This package is an incomplete native port. It includes seven plugin UI surfaces and 83 auth component files.
The current web implementations expose 21 plugin UI surfaces. React Native lacks 14 of them, plus 19 capability groups described below.

[Read the feature parity assessment](#feature-parity) before choosing this package for a production app.

## Zero styling setup

The components **style themselves** with plain React Native styles. There is **no nativewind / uniwind / tailwind / babel plugin / metro config** to add — it drops into any RN app, whatever (if anything) you use for your own styling.

## Install

```sh
npm install @better-auth-ui/react-native @better-auth-ui/core @better-auth-ui/react better-auth react-native-svg @tanstack/react-query
```

Some component features rely on **optional** native peers — install only the ones you use:

| Feature | Peer |
| --- | --- |
| Avatar / org-logo upload | `expo-image-picker` `expo-image-manipulator` |
| Copy (API keys, fields) | `expo-clipboard` |
| Date / time additional fields | `@react-native-community/datetimepicker` |
| Slider additional fields | `@react-native-community/slider` |

> These are lazily loaded — the package is import-safe without them (a slider degrades to a static track, etc.), so `<Auth />` works even in Expo Go.

## Usage

Wrap your app in `AuthProvider` and drop in `<Auth />`. With **no router wiring**, the built-in state adapter keeps the current view in memory:

```tsx
import { AuthProvider, Auth } from "@better-auth-ui/react-native"
import { authClient } from "./auth-client" // @better-auth/expo client

export default function SignInScreen() {
  return (
    <AuthProvider authClient={authClient} socialProviders={["google", "github"]}>
      <Auth />
    </AuthProvider>
  )
}
```

## Theming

Colors come from a small semantic theme (light/dark, following the OS by default). Everything works with no setup; to re-theme, wrap your tree in `ThemeProvider` and override any token (e.g. your brand `accent`) or force a scheme:

```tsx
import { ThemeProvider } from "@better-auth-ui/react-native"

<ThemeProvider light={{ accent: "#7c3aed" }} dark={{ accent: "#a78bfa" }}>
  {/* … */}
</ThemeProvider>
```

The `themePlugin`'s Appearance card + user-menu toggle (System / Light / Dark) drive a built-in theme store out of the box — pass a custom `useTheme` to the plugin to integrate an external theme source (e.g. next-themes) instead.

## Overriding styles

Every component accepts a **`style`** prop (any `ViewStyle`/`TextStyle`) and a **`className`** prop (this library's utility subset — `gap-4`, `px-3`, `bg-surface`, …, resolved by the package, not by any external engine). Use whichever you prefer:

```tsx
<UserButton style={{ marginTop: 12 }} />
```

### With expo-router

```tsx
import { useLocalSearchParams, useRouter } from "expo-router"
import { AuthProvider, createExpoRouterNavigation } from "@better-auth-ui/react-native"

export default function AuthLayout({ children }) {
  const router = useRouter()
  const params = useLocalSearchParams()
  const navigation = createExpoRouterNavigation({ router, params })

  return (
    <AuthProvider authClient={authClient} navigation={navigation}>
      {children}
    </AuthProvider>
  )
}

// app/(auth)/sign-in.tsx  ->  <Auth view="signIn" />
// app/(auth)/reset-password.tsx  ->  token comes from useLocalSearchParams via the adapter
```

### With React Navigation

```tsx
import { useNavigation, useRoute } from "@react-navigation/native"
import { AuthProvider, createReactNavigationNavigation } from "@better-auth-ui/react-native"

const navigation = createReactNavigationNavigation({
  navigation: useNavigation(),
  route: useRoute(),
  screens: {
    auth: {
      signIn: "SignIn",
      signUp: "SignUp",
      forgotPassword: "ForgotPassword",
      resetPassword: "ResetPassword",
      verifyEmail: "VerifyEmail",
      signOut: "SignOut"
    }
  }
})
```

### Session storage (Expo)

Use the [`@better-auth/expo`](https://www.better-auth.com/docs/integrations/expo) client with `expo-secure-store`; the UI package is unaware of how sessions are persisted.

## How it works

- **Logic is reused, not reimplemented.** All hooks/queries/mutations come from `@better-auth-ui/react`; view keys and localization from `@better-auth-ui/core`.
- **Styling is self-contained.** Components author with compact class strings that a tiny in-package resolver turns into plain RN `StyleSheet` values against the active theme — so there's no app-wide styling engine to configure. The resolver + `Box`/`Txt`/`Btn` wrappers + `ThemeProvider` are exported if you want to reuse them.
- **Navigation** is pluggable via the `AuthNavigation` adapter — state (default), expo-router, or React Navigation. The `navigate` options carry an optional `view`/`params` so name-based and state-only routers work without a URL.


## Organization access

Organization queries use the slug from the navigation target or router params.
You can also pass an explicit `slug` to `organizationPlugin` for a fixed organization screen.
Without a slug, the provider selects personal access. It does not fall back to Better Auth's session active organization.
Organization switching navigates with the target slug.

## Feature parity

This assessment compares the native code with main on October 10, 2026.
It covers React with HeroUI, shadcn/Radix, and shadcn/Base UI, plus Solid with Zaidan.

There are **14 absent plugin UI surfaces and 19 additional missing or partial capability groups**.
These are planning groups, not counts of endpoints, buttons, or individual components.
A plugin registration does not mean every capability of that plugin works on native.

The native auth directory contains **83 component files**.
HeroUI contains **155**, excluding its 10 server email templates. All 83 native filenames have HeroUI counterparts, leaving **72 absent counterparts**.
Of those, 52 belong to the absent plugin surfaces and 20 belong to shared or partially implemented areas.
A native implementation can combine several web components, so these file counts do not measure functional coverage.
Server email templates remain available through the existing React and Solid email entrypoints.
Google One Tap's browser-specific prompt has no native UI counterpart and is outside this count.

### Absent plugin UI surfaces

Compare the [native registrations](./src/plugins.ts) with the [HeroUI registrations](../heroui/src/plugins.ts).

| Plugin | Missing native UI |
| --- | --- |
| `admin` | User administration, user inspector, impersonation controls |
| `agent-auth` | Agent approval and authorization management |
| `anonymous` | Anonymous sign-in action |
| `billing` | Subscription, checkout, and billing portal controls |
| `dash` | Audit activity view |
| `device-authorization` | Device approval flow |
| `email-otp` | Code sign-in, email verification/change, password recovery |
| `last-login-method` | Last-used method badges and integration into auth controls |
| `oauth-provider` | Consent, account selection, client management, authorized applications |
| `passkey` | Sign-in, registration, listing, rename, and removal |
| `phone-number` | Phone sign-in, verification, change/removal, password recovery |
| `siwe` | Wallet sign-in and linked wallet management |
| `sso` | Email-first discovery, provider setup, domain verification, organization providers |
| `two-factor` | Challenge, enable/disable, backup code display and regeneration |

### Gaps inside implemented areas

Each row counts as one capability group. Related controls stay together to avoid an inflated feature count.

| Group | Gap and code evidence |
| --- | --- |
| Additional fields at sign-up | [SignUp](./src/components/auth/sign-up.tsx) submits only name, email, and password. It never renders additional fields, including the username plugin's required field. |
| Additional-field form contract | [AdditionalField](./src/components/auth/additional-field.tsx) lacks custom async validation and current `value`/`onBlur`/error bindings. [UserProfile](./src/components/auth/settings/account/user-profile.tsx) lacks the shared form handling for read-only payload exclusion and session reseeding. |
| Password strength | No counterpart to the [strength meter](../heroui/src/components/auth/password-strength-meter.tsx). |
| Reauthentication | No counterpart to [fresh-session recovery controls](../heroui/src/components/auth/reauthentication.tsx) or their auth/settings integrations. |
| Auth result routes | [Auth](./src/components/auth/auth.tsx) lacks the built-in callback, error, and redirect views. |
| Email-link follow-up screens | Reset-link-sent and magic-link-sent views are absent. Native uses a toast or returns to sign-in instead. |
| Session-wide actions | [ActiveSessions](./src/components/auth/settings/security/active-sessions.tsx) lacks sign-out-everywhere and sign-out-other-devices actions. |
| Plugin host contract | [Native slots](./src/lib/auth-plugin.ts) and their hosts lack auth prompts, change-email card replacement, and organization tabs. Organization cards do not receive the current identity props. |
| Navigation configuration | Adapters use default paths rather than the resolved plugin/custom path map. State/name adapters cannot resolve arbitrary redirect destinations or organization URLs passed through `navigate({ to })`. |
| Locale formatting and direction | [Date formatting](./src/lib/format-date.ts), relative dates, and number formatting ignore `locale.languageTag`. Native layout does not consume `locale.direction`. |
| Avatar and logo customization | Native upload handlers bypass custom upload/resize callbacks and parts of the size/format configuration. Built-in picker upload and deletion do exist. |
| Direct invitation acceptance | No counterpart to [AcceptInvitation](../heroui/src/components/auth/organization/accept-invitation.tsx). Invitations in the signed-in settings list do have accept/reject actions. |
| Multiple organization roles | [InviteMemberDialog](./src/components/auth/organization/invite-member-dialog.tsx) and member editing select one role. Multi-role editing and matching are absent. |
| Organization teams | Team CRUD, member assignment, and team switching are absent. |
| Dynamic organization roles | Role CRUD and permission editing are absent. |
| Organization model fields | Custom organization, member, invitation, team, and role field forms are absent. |
| Organization policy and permission UI | Creation/member/invitation limits and creation policy are not reflected in native controls. Several gates assume the literal `owner` role. Organization API keys lack the current action-specific permission handling. |
| Organization list tools | Search/basic role filters exist. Sorting, pagination, selection, bulk actions, and column visibility controls are absent. Native equivalents can use list controls. |
| API-key management options | Key editing, expiration selection, and configured key-group selection are absent. Native still assumes the `organization` configuration ID. |

The native lists also combine data and permission loading in several places.
Further ports need leaf-level loading states so slow permission checks do not replace already resolved content.

### Compatibility corrections in this update

This update merges current main and aligns Better Auth dependencies with 1.7.2.
It guards shared browser URL reads when native defines `window` without `location`.
It binds native organization access to route slugs and preserves organization labels and username renderers during locale resolution.
The username renderer now reports changes to the profile form.
The Expo client includes the API-key client required by its showcase.
The declaration build uses the shared import-extension handling, with consumer checks for Node16, NodeNext, and bundler resolution.

These corrections do not implement the missing feature groups above.
Native iOS/Android visual and end-to-end checks remain necessary before release.

## License

MIT
