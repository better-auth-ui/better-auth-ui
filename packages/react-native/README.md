# @better-auth-ui/react-native

Beautiful, plug-and-play [Better Auth](https://better-auth.com) UI for **React Native & Expo**, styled with [nativewind](https://www.nativewind.dev). A native render target for [`better-auth-ui`](https://better-auth-ui.com) that mirrors the `@better-auth-ui/heroui` components — reusing the framework-agnostic logic from `@better-auth-ui/core` and `@better-auth-ui/react` unchanged.

> MVP scope: sign-in, sign-up, sign-out, forgot/reset password, verify email, social provider buttons, and a basic user avatar / button. Passkey, organization, api-key, multi-session, and magic-link land in follow-ups.

## Install

```sh
npm install @better-auth-ui/react-native @better-auth-ui/core @better-auth-ui/react better-auth
# peers
npm install nativewind react-native-svg @tanstack/react-query
npm install -D tailwindcss@^3.4
```

> **pnpm users:** nativewind's babel transform emits `import "react-native-css-interop/jsx-runtime"`, which pnpm's strict, non-hoisted `node_modules` won't place where Metro looks. Add it as a direct dependency so it resolves:
> ```sh
> pnpm add react-native-css-interop
> ```

Set up nativewind (babel preset, `tailwind.config.js`, and a `global.css`) per the [nativewind guide](https://www.nativewind.dev/getting-started/installation). Make sure your `tailwind.config.js` `content` globs include this package's source so its classes aren't purged:

```js
// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./node_modules/@better-auth-ui/react-native/src/**/*.{ts,tsx}"
  ],
  presets: [require("nativewind/preset")]
}
```

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
- **Primitives** are the nativewind swap layer for `@heroui/react` (`Button`, `TextField`, `Card`, `Form`, …). Primitives own the visual theme; components pass only structural classes.
- **Navigation** is pluggable via the `AuthNavigation` adapter — state (default), expo-router, or React Navigation. The `navigate` options carry an optional `view`/`params` so name-based and state-only routers work without a URL.

## License

MIT
