# @better-auth-ui/react-native

Beautiful, plug-and-play [Better Auth](https://better-auth.com) UI for **React Native & Expo**, styled with [nativewind](https://www.nativewind.dev). A native render target for [`better-auth-ui`](https://better-auth-ui.com) that mirrors the `@better-auth-ui/heroui` components — reusing the framework-agnostic logic from `@better-auth-ui/core` and `@better-auth-ui/react` unchanged.

> Full parity with `@better-auth-ui/heroui` **except passkey**: sign-in/up/out, forgot/reset/verify, social buttons, magic-link, username, the complete settings surface (account, security, sessions, linked accounts, appearance), delete-user, additional-fields, api-keys, multi-session, and the full organization surface. Passkey is deferred (WebAuthn needs a native module).

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

## Setup

The components ship as **source** so nativewind's babel transform styles them in your app, and they use semantic color tokens defined by this package's tailwind preset. Wire up four things (see the nativewind [installation guide](https://www.nativewind.dev/getting-started/installation) for the base setup, and `examples/expo-example` for a complete working reference):

**1. Babel** — nativewind's preset:

```js
// babel.config.js
module.exports = (api) => {
  api.cache(true)
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel"
    ]
  }
}
```

**2. Metro** — consume the package as source so its `className`s are transformed:

```js
// metro.config.js
const { getDefaultConfig } = require("expo/metro-config")
const { withNativeWind } = require("nativewind/metro")

const config = getDefaultConfig(__dirname)
// Resolve the package's `src`/`react-native` export condition (its components
// are shipped as source for nativewind to process).
config.resolver.unstable_enablePackageExports = true
config.resolver.unstable_conditionNames = ["react-native", "src", "require", "import"]

module.exports = withNativeWind(config, { input: "./global.css" })
```

**3. Tailwind** — add this package's **preset** (the semantic color tokens the components use) and its source to `content` so classes aren't purged:

```js
// tailwind.config.js
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./node_modules/@better-auth-ui/react-native/src/**/*.{ts,tsx}"
  ],
  presets: [
    require("nativewind/preset"),
    require("@better-auth-ui/react-native/preset")
  ]
}
```

**4. Theme tokens** — load the default `--bau-*` values (override any to re-theme; `--bau-accent` is the brand color, and `.dark` flips the palette):

```css
/* global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@import "@better-auth-ui/react-native/theme.css";
```

> If your pipeline doesn't process `@import` from `node_modules`, copy the `:root` / `.dark` blocks out of that file into your `global.css` instead.

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
