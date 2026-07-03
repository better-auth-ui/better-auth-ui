# Better Auth UI

Beautiful, ready-to-use authentication components and framework adapters for [Better Auth](https://better-auth.com).

Built for **React**, **Solid**, **shadcn/ui**, **HeroUI**, and **Zaidan**. Drop in and go.

## [better-auth-ui.com](https://better-auth-ui.com)

[Documentation](https://better-auth-ui.com/docs) • [Demo](https://demo.better-auth-ui.com)

---

*Looking for the legacy package?*
[Legacy Branch](https://github.com/better-auth-ui/better-auth-ui/tree/legacy) • [Legacy Docs](https://legacy.better-auth-ui.com)

---

## Selected UI Options

### shadcn/ui

<picture>
  <source srcset="https://raw.githubusercontent.com/better-auth-ui/better-auth-ui/shadcn-registry/apps/docs/public/screenshots/shadcn-sign-in-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/better-auth-ui/better-auth-ui/shadcn-registry/apps/docs/public/screenshots/shadcn-sign-in-light.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/better-auth-ui/better-auth-ui/shadcn-registry/apps/docs/public/screenshots/shadcn-sign-in-light.png" alt="shadcn/ui Sign In" width="400">
</picture>

### HeroUI

<picture>
  <source srcset="https://raw.githubusercontent.com/better-auth-ui/better-auth-ui/shadcn-registry/apps/docs/public/screenshots/heroui-sign-in-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/better-auth-ui/better-auth-ui/shadcn-registry/apps/docs/public/screenshots/heroui-sign-in-light.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/better-auth-ui/better-auth-ui/shadcn-registry/apps/docs/public/screenshots/heroui-sign-in-light.png" alt="HeroUI Sign In" width="400">
</picture>

---

## Features

- **Framework adapters** — React and Solid hooks, queries, mutations, and auth helpers.
- **UI choices** — shadcn/ui and Zaidan registries for copied components, plus packaged HeroUI components.
- **Drop-in Ready** — Pre-built Sign In, Sign Up, Forgot Password, and more. Just add and configure.
- **Better Auth Native** — Built specifically for Better Auth. Social logins, magic links, organizations, passkeys, and more.

## Installation

These are quick start entry points, not full framework setup. See the [documentation](https://better-auth-ui.com/docs) for peer dependencies, providers, plugins, and framework-specific configuration.

### shadcn/ui

```bash
bun x shadcn@latest add https://better-auth-ui.com/r/auth.json
```

### HeroUI

```bash
bun add @better-auth-ui/heroui@latest @better-auth-ui/react@latest @better-auth-ui/core@latest
```

### React

```bash
bun add @better-auth-ui/react @better-auth-ui/core
```

### Solid

```bash
bun add @better-auth-ui/solid @better-auth-ui/core
```

### Zaidan

```bash
bun x shadcn@latest add https://better-auth-ui.com/r/solid/auth.json
```

## Agent Skills

### TanStack Intent (recommended)

Better Auth UI packages ship [TanStack Intent](https://tanstack.com/intent) skills inside the npm packages, so installed skills always match your installed package version. After installing any `@better-auth-ui/*` package, wire up your agent once:

```bash
npx @tanstack/intent@latest install
```

Then agents discover and load skills automatically, or you can load one manually:

```bash
npx @tanstack/intent@latest list
npx @tanstack/intent@latest load @better-auth-ui/react#react
```

Allowlist the packages in your `package.json` so their skills are surfaced:

```json
{
  "intent": {
    "skills": ["@better-auth-ui/core", "@better-auth-ui/react", "@better-auth-ui/solid", "@better-auth-ui/heroui"]
  }
}
```

### npx skills

Install the Better Auth UI agent skill so coding assistants can route between React, Solid, shadcn/ui, HeroUI, Zaidan, core, and upstream Better Auth docs correctly.

```bash
npx skills add better-auth-ui/better-auth-ui
```

For upstream Better Auth conventions, also install the Better Auth skill pack:

```bash
npx skills add better-auth/skills
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
