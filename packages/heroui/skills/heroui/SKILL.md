---
name: heroui
description: >
  Packaged HeroUI v3 React auth components for Better Auth UI: Auth router,
  SignIn, SignUp, Settings, AccountSettings, SecuritySettings, UserButton,
  UserAvatar, AuthProvider with plugin slots (organizationPlugin, passkeyPlugin,
  deleteUserPlugin), styles import, plugin card slots. Load when working with
  @better-auth-ui/heroui, HeroUI auth pages, or packaged auth component
  customization.
license: MIT
metadata:
  type: framework
  library: better-auth-ui
  framework: react
  library_version: '1.6.27'
requires:
  - better-auth-ui/core
  - better-auth-ui/react
sources:
  - 'better-auth-ui/better-auth-ui:packages/heroui/src/index.tsx'
  - 'better-auth-ui/better-auth-ui:packages/heroui/src/components/auth/auth-provider.tsx'
  - 'better-auth-ui/better-auth-ui:packages/heroui/src/lib/auth/auth-plugin.ts'
---

# Better Auth UI HeroUI

This skill builds on `better-auth-ui/core` and `better-auth-ui/react`. The
HeroUI package is a packaged component surface (npm import), unlike shadcn/ui
and Zaidan which copy source into the consuming app.

## Setup

```tsx
import { QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@better-auth-ui/heroui"
import { deleteUserPlugin } from "@better-auth-ui/heroui/plugins"
import { Toast } from "@heroui/react"

<QueryClientProvider client={queryClient}>
  <AuthProvider
    authClient={authClient}
    redirectTo="/settings/account"
    socialProviders={["google", "github"]}
    navigate={({ to, replace }) =>
      replace ? router.replace(to) : router.push(to)
    }
    plugins={[deleteUserPlugin()]}
  >
    {children}
    <Toast.Provider />
  </AuthProvider>
</QueryClientProvider>
```

Import styles once in your global CSS:

```css
@import "@better-auth-ui/heroui/styles";
```

## Hooks and Components

### Path-based auth router

```tsx
import { Auth } from "@better-auth-ui/heroui"

// route: /auth/$path
<Auth path={path} />
```

`Auth` renders `SignIn`, `SignUp`, `ForgotPassword`, `ResetPassword`,
`VerifyEmail`, `SignOut` based on `path`. Individual views are also exported
for standalone routes.

### Settings and user components

```tsx
import { Settings, UserButton } from "@better-auth-ui/heroui"

<UserButton />
<Settings />
```

`Settings`, `AccountSettings`, `SecuritySettings`, `UserProfile`,
`ChangeEmail`, `ChangePassword`, `ActiveSessions`, `LinkedAccounts` compose the
settings surface.

### Plugin factories

```tsx
import { organizationPlugin, passkeyPlugin } from "@better-auth-ui/heroui/plugins"

<AuthProvider plugins={[organizationPlugin(), passkeyPlugin()]} />
```

Plugins contribute components through slots (`securityCards`, `accountCards`,
`organizationCards`, `userMenuItems`) plus auth/settings views.
Plugin-contributed `additionalFields` merge with user-supplied fields, with
user fields overriding by `name`.

## Common Mistakes

### HIGH Wrapping with the React package AuthProvider instead of HeroUI's

Wrong:

```tsx
import { AuthProvider } from "@better-auth-ui/react"
```

Correct:

```tsx
import { AuthProvider } from "@better-auth-ui/heroui"
```

The HeroUI `AuthProvider` wraps the React primitive with HeroUI
`RouterProvider` and `ErrorToaster`; using the React one silently drops link
routing and error toasts in HeroUI components.

Source: packages/heroui/src/components/auth/auth-provider.tsx

### HIGH Forgetting the styles import

Wrong:

```css
/* only Tailwind + HeroUI imports */
```

Correct:

```css
@import "@better-auth-ui/heroui/styles";
```

Components render unstyled or partially styled without the package stylesheet;
there is no runtime error.

Source: packages/heroui/src/index.tsx

### MEDIUM Passing plugin factories without calling them

Wrong:

```tsx
<AuthProvider plugins={[organizationPlugin]} />
```

Correct:

```tsx
<AuthProvider plugins={[organizationPlugin()]} />
```

Plugin entries are `AuthPlugin` objects returned by the factory call; passing
the function itself contributes no views or cards and fails silently.

Source: packages/heroui/src/plugins.ts
