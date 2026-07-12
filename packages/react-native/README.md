# @better-auth-ui/react-native

Beautiful, plug-and-play [Better Auth](https://better-auth.com) UI for **React Native & Expo**. A native render target for [`better-auth-ui`](https://better-auth-ui.com) that mirrors the `@better-auth-ui/heroui` components — reusing the framework-agnostic logic from `@better-auth-ui/core` and `@better-auth-ui/react` unchanged.

> Full parity with `@better-auth-ui/heroui` **except passkey**: sign-in/up/out, forgot/reset/verify, social buttons, magic-link, username, the complete settings surface (account, security, sessions, linked accounts, appearance), delete-user, additional-fields, api-keys, multi-session, and the full organization surface. Passkey is deferred (WebAuthn needs a native module).

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
    signIn: "SignIn",
    signUp: "SignUp",
    forgotPassword: "ForgotPassword",
    resetPassword: "ResetPassword",
    verifyEmail: "VerifyEmail",
    signOut: "SignOut"
  }
})
```

### Session storage (Expo)

Use the [`@better-auth/expo`](https://www.better-auth.com/docs/integrations/expo) client with `expo-secure-store`; the UI package is unaware of how sessions are persisted.

## How it works

- **Logic is reused, not reimplemented.** All hooks/queries/mutations come from `@better-auth-ui/react`; view keys and localization from `@better-auth-ui/core`.
- **Styling is self-contained.** Components author with compact class strings that a tiny in-package resolver turns into plain RN `StyleSheet` values against the active theme — so there's no app-wide styling engine to configure. The resolver + `Box`/`Txt`/`Btn` wrappers + `ThemeProvider` are exported if you want to reuse them.
- **Navigation** is pluggable via the `AuthNavigation` adapter — state (default), expo-router, or React Navigation. The `navigate` options carry an optional `view`/`params` so name-based and state-only routers work without a URL.

## License

MIT
