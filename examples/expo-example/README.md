# expo-example

A minimal Expo Router app showing [`@better-auth-ui/react-native`](../../packages/react-native) with the built-in **state adapter** — the whole auth flow (sign-in, sign-up, forgot/reset password, verify email, social) renders from a single `<Auth />` with no router wiring. After sign-in, `Stack.Protected` swaps to the protected dashboard automatically from the Better Auth session.

## Run

```sh
# from the repo root
bun install

# point at your Better Auth server (defaults to http://localhost:3000)
EXPO_PUBLIC_API_URL=http://localhost:3000 bun --cwd examples/expo-example start
# then press i (iOS) or a (Android)
```

The server must register the [`expo()`](https://www.better-auth.com/docs/integrations/expo) plugin and trust the `betterauthuiexpo://` scheme.

## What to look at

- `app/_layout.tsx` — session-driven routing (`Stack.Protected`).
- `app/(auth)/index.tsx` — `<AuthProvider><Auth /></AuthProvider>`, the entire flow.
- `app/(app)/index.tsx` — protected dashboard with `<UserButton />`.
- `src/auth-client.ts` — `@better-auth/expo` client + `expo-secure-store`.
- `metro.config.js` / `babel.config.js` — plain Expo + monorepo wiring. **No nativewind / tailwind** — `@better-auth-ui/react-native` styles itself, so this app has zero styling setup.
- `app/showcase.tsx` — `/showcase`, mounts every subsystem at once for QA.
