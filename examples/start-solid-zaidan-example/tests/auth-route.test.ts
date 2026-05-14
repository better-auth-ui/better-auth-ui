import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { viewPaths } from "@better-auth-ui/core"
import { describe, expect, it } from "vitest"
import { resolveAuthRoute } from "../src/components/auth/auth"
import { ForgotPassword } from "../src/components/auth/forgot-password"
import { ResetPassword } from "../src/components/auth/reset-password"
import { AccountSettings } from "../src/components/auth/settings/account/account-settings"
import {
  resolveSettingsRoute,
  SecuritySettings
} from "../src/components/auth/settings/settings"
import {
  resolveUserInitials,
  resolveUserLabel,
  shouldLoadAccounts as shouldLoadAccountsFromShared,
  shouldLoadDeviceSessions as shouldLoadDeviceSessionsFromShared,
  shouldLoadLinkedAccounts as shouldLoadLinkedAccountsFromShared,
  timeAgo
} from "../src/components/auth/settings/shared/helpers"
import { SignIn } from "../src/components/auth/sign-in"
import {
  resolveSignInPath,
  resolveSocialAuthParams,
  resolveSocialAuthURLs,
  resolveSubmittedSignIn
} from "../src/components/auth/sign-in-path"
import { SignOut } from "../src/components/auth/sign-out"
import { SignUp } from "../src/components/auth/sign-up"

const isSimpleReExportOnly = (source: string) => {
  const statement = source
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("//"))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()

  return /^export\s+(?:\{[\s\S]*\}|\*)\s+from\s+["'][^"']+["']$/.test(statement)
}

describe("Solid auth route component selection", () => {
  it("maps supported auth paths to their existing Solid components", () => {
    expect(resolveAuthRoute(viewPaths.auth.signIn)).toEqual({
      component: SignIn,
      title: "Sign in"
    })
    expect(resolveAuthRoute(viewPaths.auth.signUp)).toEqual({
      component: SignUp,
      title: "Sign up"
    })
    expect(resolveAuthRoute(viewPaths.auth.signOut)).toEqual({
      component: SignOut,
      title: "Sign out"
    })
    expect(resolveAuthRoute(viewPaths.auth.forgotPassword)).toEqual({
      component: ForgotPassword,
      title: "Forgot password"
    })
    expect(resolveAuthRoute(viewPaths.auth.resetPassword)).toEqual({
      component: ResetPassword,
      title: "Reset password"
    })
  })

  it("keeps invalid auth paths on the existing redirect-to-home behavior", () => {
    expect(resolveAuthRoute("unknown-auth-path")).toEqual({ redirectTo: "/" })
  })

  it("removes the auth route-local component facade like the shadcn example", () => {
    const authRoute = readFileSync(
      resolve(__dirname, "../src/routes/auth/$path.tsx"),
      "utf8"
    )
    const authComponentPath = resolve(
      __dirname,
      "../src/routes/auth/-route-components.tsx"
    )
    const authComponent = readFileSync(
      resolve(__dirname, "../src/components/auth/auth.tsx"),
      "utf8"
    )

    expect(existsSync(authComponentPath)).toBe(false)
    expect(authRoute).toContain('import { Auth } from "@/components/auth/auth"')
    expect(authRoute).toContain("viewPaths.auth")
    expect(authRoute).toContain(
      "if (!Object.values(viewPaths.auth).includes(path))"
    )
    expect(authRoute).toContain('throw redirect({ to: "/" })')
    expect(authRoute).toContain("<Auth path={path} />")
    expect(authRoute).not.toContain("resolveAuthRoute")
    expect(authRoute).not.toContain("-route-components")
    expect(authComponent).toContain('import { SignIn } from "./sign-in"')
    expect(authComponent).toContain('import { SignUp } from "./sign-up"')
    expect(authComponent).toContain("export function Auth(")
    expect(authComponent).toContain("export function resolveAuthRoute(")
  })

  it("wires Solid app providers like shadcn with TanStack navigation and the redirect target", () => {
    const providers = readFileSync(
      resolve(__dirname, "../src/components/providers.tsx"),
      "utf8"
    )
    const authProvider = readFileSync(
      resolve(__dirname, "../src/components/auth/auth-provider.tsx"),
      "utf8"
    )
    const authClient = readFileSync(
      resolve(__dirname, "../src/lib/auth-client.ts"),
      "utf8"
    )
    const authServer = readFileSync(
      resolve(__dirname, "../src/lib/auth.ts"),
      "utf8"
    )

    expect(providers).toContain(
      'import { useNavigate } from "@tanstack/solid-router"'
    )
    expect(providers).toContain(
      'import { AuthProvider } from "./auth/auth-provider"'
    )
    expect(providers).toContain(
      'import { authClient } from "@/lib/auth-client"'
    )
    expect(providers).toContain("const navigate = useNavigate()")
    expect(providers).toContain('redirectTo="/settings/account"')
    expect(providers).toContain("navigate={navigate}")
    expect(providers).toContain('socialProviders={["github"]}')
    expect(providers).toContain("multiSessionPlugin()")
    expect(providers).toContain("apiKeyPlugin()")
    expect(providers).toContain("passkeyPlugin()")
    expect(providers).toContain('from "@/lib/auth/passkey-plugin"')
    expect(providers).toContain("deleteUserPlugin()")
    expect(providers).toContain("usernamePlugin()")
    expect(providers).not.toContain("magicLinkPlugin()")
    expect(providers).not.toContain('from "@/lib/auth/magic-link-plugin"')
    expect(authClient).toContain("export const authClient")
    expect(authClient).toContain("createAuthClient")
    expect(authClient).toContain("magicLinkClient")
    expect(authClient).toContain("magicLinkClient()")
    expect(authServer).toContain("socialProviders")
    expect(authServer).toContain("github")
    expect(authServer).toContain("GITHUB_CLIENT_ID")
    expect(authServer).toContain("GITHUB_CLIENT_SECRET")
    expect(authServer).toContain("magicLink")
    expect(authServer).toContain("sendMagicLink")
    expect(authServer).toContain("Magic link email delivery is not configured")
    expect(authServer).toContain("console.info")
    expect(authServer).toContain('"http://localhost:3000"')
    expect(authProvider).not.toContain("useNavigate")
    expect(authProvider).not.toContain("createAuthClient")
  })

  it("loads the example-local env file into server-side auth config when Vite runs from the workspace", () => {
    const viteConfig = readFileSync(
      resolve(__dirname, "../vite.config.ts"),
      "utf8"
    )

    expect(viteConfig).toContain('import { defineConfig, loadEnv } from "vite"')
    expect(viteConfig).toContain("const exampleEnvDir")
    expect(viteConfig).toContain('loadEnv(mode, exampleEnvDir, "")')
    expect(viteConfig).toContain("Object.assign(process.env")
    expect(viteConfig).toContain("envDir: exampleEnvDir")
    expect(viteConfig).toContain("GITHUB_CLIENT_ID")
    expect(viteConfig).toContain("GITHUB_CLIENT_SECRET")
    expect(viteConfig).toContain("BETTER_AUTH_URL")
    expect(viteConfig).not.toContain("process.cwd()")
  })

  it("keeps magic-link configured but not surfaced in the default shadcn-parity sign-in", () => {
    const authRoute = readFileSync(
      resolve(__dirname, "../src/routes/auth/$path.tsx"),
      "utf8"
    )
    const authComponent = readFileSync(
      resolve(__dirname, "../src/components/auth/auth.tsx"),
      "utf8"
    )
    const signInUsername = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/username/sign-in-username.tsx"
      ),
      "utf8"
    )
    const providers = readFileSync(
      resolve(__dirname, "../src/components/providers.tsx"),
      "utf8"
    )
    const authClient = readFileSync(
      resolve(__dirname, "../src/lib/auth-client.ts"),
      "utf8"
    )
    const authServer = readFileSync(
      resolve(__dirname, "../src/lib/auth.ts"),
      "utf8"
    )
    const magicLinkPlugin = readFileSync(
      resolve(__dirname, "../src/lib/auth/magic-link-plugin.ts"),
      "utf8"
    )

    expect(authRoute).not.toContain("magicLinkPlugin().viewPaths")
    expect(authRoute).not.toContain("supportedAuthPaths")
    expect(authComponent).toContain("plugin.views?.auth")
    expect(authComponent).toContain("plugin.fallbackViews?.auth?.signIn")
    expect(signInUsername).toContain(".flatMap(")
    expect(signInUsername).toContain('view="signIn"')
    expect(providers).not.toContain("magicLinkPlugin()")
    expect(authClient).toContain("magicLinkClient()")
    expect(authServer).toContain("magicLink({")
    expect(magicLinkPlugin).toContain("authButtons: [MagicLinkButton]")
    expect(magicLinkPlugin).toContain("views:")
  })

  it("surfaces shadcn-visible GitHub and passkey auth entry points in Solid", () => {
    const providers = readFileSync(
      resolve(__dirname, "../src/components/providers.tsx"),
      "utf8"
    )
    const passkeyPlugin = readFileSync(
      resolve(__dirname, "../src/lib/auth/passkey-plugin.ts"),
      "utf8"
    )
    const providerButtons = readFileSync(
      resolve(__dirname, "../src/components/auth/provider-buttons.tsx"),
      "utf8"
    )
    const providerButton = readFileSync(
      resolve(__dirname, "../src/components/auth/provider-button.tsx"),
      "utf8"
    )
    const signInUsername = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/username/sign-in-username.tsx"
      ),
      "utf8"
    )

    expect(providers).toContain('socialProviders={["github"]}')
    expect(providerButtons).toContain("auth.socialProviders")
    expect(providerButtons).toContain("<ProviderButton")
    expect(providerButtons).toContain("view={props.view}")
    expect(providerButton).toContain("auth.authClient.signIn.social")
    expect(providerButton).toContain("provider: props.provider")
    expect(providerButton).toContain("resolveSocialAuthParams")
    expect(passkeyPlugin).toContain("authButtons: [PasskeyButton]")
    expect(passkeyPlugin).toContain("securityCards: [Passkeys]")
    expect(signInUsername).toContain("plugin.authButtons")
    expect(signInUsername).toContain('view="signIn"')
  })

  it("builds GitHub social sign-in and sign-up redirect URLs from existing auth redirects", () => {
    const sharedAuthContext = {
      basePaths: { auth: "/auth" },
      baseURL: "http://localhost:5173",
      redirectTo: "/settings/account",
      viewPaths: {
        auth: {
          signIn: "sign-in",
          signUp: "sign-up"
        }
      }
    }

    expect(
      resolveSocialAuthURLs({ ...sharedAuthContext, view: "signIn" })
    ).toEqual({
      callbackURL: "http://localhost:5173/settings/account",
      errorCallbackURL: "http://localhost:5173/auth/sign-in"
    })

    expect(
      resolveSocialAuthURLs({ ...sharedAuthContext, view: "signUp" })
    ).toEqual({
      callbackURL: "http://localhost:5173/settings/account",
      errorCallbackURL: "http://localhost:5173/auth/sign-up",
      newUserCallbackURL: "http://localhost:5173/settings/account"
    })

    expect(
      resolveSocialAuthParams({
        ...sharedAuthContext,
        provider: "github",
        view: "signUp"
      })
    ).toEqual({
      callbackURL: "http://localhost:5173/settings/account",
      errorCallbackURL: "http://localhost:5173/auth/sign-up",
      newUserCallbackURL: "http://localhost:5173/settings/account",
      provider: "github"
    })
  })

  it("shares the router QueryClient with Solid auth queries across navigation", () => {
    const rootRoute = readFileSync(
      resolve(__dirname, "../src/routes/__root.tsx"),
      "utf8"
    )
    const providers = readFileSync(
      resolve(__dirname, "../src/components/providers.tsx"),
      "utf8"
    )
    const authProvider = readFileSync(
      resolve(__dirname, "../src/components/auth/auth-provider.tsx"),
      "utf8"
    )

    expect(rootRoute).toContain(
      'import type { QueryClient } from "@tanstack/solid-query"'
    )
    expect(rootRoute).toContain("createRootRouteWithContext<{")
    expect(rootRoute).toContain("queryClient: QueryClient")
    expect(rootRoute).toContain("const routeContext = Route.useRouteContext()")
    expect(rootRoute).toContain(
      "<Providers queryClient={routeContext().queryClient}>"
    )
    expect(rootRoute).toContain(
      'import { Providers } from "@/components/providers"'
    )
    expect(providers).toContain(
      'import type { QueryClient } from "@tanstack/solid-query"'
    )
    expect(providers).toContain("queryClient?: QueryClient")
    expect(providers).toContain("queryClient={props.queryClient}")
    expect(authProvider).toContain("AuthProvider as AuthProviderPrimitive")
    expect(authProvider).toContain("type AuthProviderProps")
    expect(authProvider).toContain("<ErrorToaster />")
    expect(authProvider).not.toContain("queryClient?: QueryClient")
  })

  it("redirects Solid sign-in success like shadcn and refreshes the session query", () => {
    const signIn = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/username/sign-in-username.tsx"
      ),
      "utf8"
    )

    expect(signIn).toContain(
      'import { authQueryKeys } from "@better-auth-ui/core"'
    )
    expect(signIn).toContain("useQueryClient")
    expect(signIn).toContain("queryClient.invalidateQueries({")
    expect(signIn).toContain("queryKey: authQueryKeys.session")
    expect(signIn).toContain("auth.navigate({ to: auth.redirectTo })")
    expect(signIn).toContain("<ProviderButtons")
    expect(signIn).toContain('view="signIn"')
  })

  it("selects Better Auth email sign-in for email identifiers even when username auth is enabled", () => {
    expect(
      resolveSignInPath({ identifier: " andres@test.com ", usernameAuth: true })
    ).toEqual({ kind: "email", email: "andres@test.com" })

    expect(
      resolveSignInPath({ identifier: "andres", usernameAuth: true })
    ).toEqual({ kind: "username", username: "andres" })

    expect(
      resolveSignInPath({ identifier: "andres@test.com", usernameAuth: false })
    ).toEqual({ kind: "email", email: "andres@test.com" })
  })

  it("resolves submitted sign-in from current form values instead of stale Solid signals", () => {
    const formData = new FormData()
    formData.set("username", " andres@test.com ")
    formData.set("password", "current-password")

    expect(resolveSubmittedSignIn({ formData, usernameAuth: true })).toEqual({
      password: "current-password",
      signInPath: { email: "andres@test.com", kind: "email" }
    })
  })

  it("resolves submitted username sign-in from the current username form value", () => {
    const formData = new FormData()
    formData.set("username", " andres ")
    formData.set("password", "username-password")

    expect(resolveSubmittedSignIn({ formData, usernameAuth: true })).toEqual({
      password: "username-password",
      signInPath: { kind: "username", username: "andres" }
    })
  })

  it("redirects Solid sign-up success with the same verification branch as shadcn", () => {
    const signUp = readFileSync(
      resolve(__dirname, "../src/components/auth/sign-up.tsx"),
      "utf8"
    )

    expect(signUp).toContain(
      'import { authQueryKeys } from "@better-auth-ui/core"'
    )
    expect(signUp).toContain("useQueryClient")
    expect(signUp).toContain(
      "if (auth.emailAndPassword.requireEmailVerification)"
    )
    expect(signUp).toContain("auth.navigate({")
    expect(signUp).toContain("auth.basePaths.auth")
    expect(signUp).toContain("auth.viewPaths.auth.signIn")
    expect(signUp).toContain("queryClient.invalidateQueries({")
    expect(signUp).toContain("queryKey: authQueryKeys.session")
    expect(signUp).toContain("auth.navigate({ to: auth.redirectTo })")
    expect(signUp).toContain("<ProviderButtons")
    expect(signUp).toContain('view="signUp"')
  })

  it("keeps the shadcn redirect target routable in the Solid example", () => {
    const settingsRoutePath = resolve(
      __dirname,
      "../src/routes/settings/$path.tsx"
    )
    const routeTree = readFileSync(
      resolve(__dirname, "../src/routeTree.gen.ts"),
      "utf8"
    )

    expect(existsSync(settingsRoutePath)).toBe(true)
    expect(readFileSync(settingsRoutePath, "utf8")).toContain(
      "viewPaths.settings"
    )
    expect(routeTree).toContain("/settings/$path")
  })

  it("maps supported settings paths to real Solid settings panels", () => {
    expect(resolveSettingsRoute(viewPaths.settings.account)).toEqual({
      component: AccountSettings,
      title: "Account"
    })
    expect(resolveSettingsRoute(viewPaths.settings.security)).toEqual({
      component: SecuritySettings,
      title: "Security"
    })
  })

  it("loads linked accounts only after a client session user is known", () => {
    expect(
      shouldLoadLinkedAccountsFromShared({ isSsr: true, userId: "user-1" })
    ).toBe(false)
    expect(shouldLoadLinkedAccountsFromShared({ isSsr: false })).toBe(false)
    expect(
      shouldLoadLinkedAccountsFromShared({ isSsr: false, userId: "user-1" })
    ).toBe(true)
  })

  it("keeps shared settings load guards behavior-compatible in the shared settings module", () => {
    const blockedBySsr = { isSsr: true, userId: "user-1" }
    const blockedWithoutUser = { isSsr: false }
    const loadableClientUser = { isSsr: false, userId: "user-1" }

    expect(shouldLoadAccountsFromShared(blockedBySsr)).toBe(false)
    expect(shouldLoadAccountsFromShared(blockedWithoutUser)).toBe(false)
    expect(shouldLoadAccountsFromShared(loadableClientUser)).toBe(true)
    expect(shouldLoadDeviceSessionsFromShared(loadableClientUser)).toBe(true)
    expect(shouldLoadLinkedAccountsFromShared(loadableClientUser)).toBe(true)
  })

  it("moves settings label and time helpers into the shared settings module", () => {
    expect(resolveUserLabel("  Ada Lovelace  ", "ada@example.com")).toBe(
      "Ada Lovelace"
    )
    expect(resolveUserLabel("", "  ada@example.com  ")).toBe("ada@example.com")
    expect(resolveUserInitials("Ada Lovelace", "ada@example.com")).toBe("AD")

    expect(timeAgo(new Date(Date.now() - 2 * 60 * 1000))).toBe("2 minutes ago")
  })

  it("removes the route compatibility facade while shared contracts live in the extracted module", () => {
    const settingsRoute = readFileSync(
      resolve(__dirname, "../src/routes/settings/$path.tsx"),
      "utf8"
    )
    const settingsComponentsPath = resolve(
      __dirname,
      "../src/routes/settings/-route-components.tsx"
    )
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/components/auth/settings/settings.tsx"),
      "utf8"
    )
    const sharedHelpers = readFileSync(
      resolve(__dirname, "../src/components/auth/settings/shared/helpers.ts"),
      "utf8"
    )
    const sharedTypes = readFileSync(
      resolve(__dirname, "../src/components/auth/settings/shared/types.ts"),
      "utf8"
    )

    expect(settingsRoute).toContain(
      'import { Settings } from "@/components/auth/settings/settings"'
    )
    expect(existsSync(settingsComponentsPath)).toBe(false)
    expect(settingsComponents).toContain("export function Settings(")
    expect(settingsComponents).toContain(
      'export { SecuritySettings } from "@/components/auth/settings/security/security-settings"'
    )
    expect(settingsComponents).toContain(
      "export function resolveSettingsRoute("
    )
    expect(settingsComponents).toContain(
      'export { AccountSettings } from "@/components/auth/settings/account/account-settings"'
    )
    expect(settingsComponents).not.toContain(
      'from "@/components/auth/settings/shared/helpers"'
    )
    expect(settingsComponents).not.toContain("shouldLoadAccounts")
    expect(settingsComponents).not.toContain("shouldLoadDeviceSessions")
    expect(settingsComponents).not.toContain("shouldLoadLinkedAccounts")
    expect(settingsComponents).not.toContain(
      "function shouldLoadLinkedAccounts"
    )
    expect(sharedHelpers).toContain("function shouldLoadLinkedAccounts")
    expect(sharedHelpers).toContain("resolveUserLabel")
    expect(sharedHelpers).toContain("resolveUserInitials")
    expect(sharedHelpers).toContain("function timeAgo")
    expect(sharedTypes).not.toContain("export type SettingsSession")
    expect(sharedTypes).toContain("export type SettingsRouteResolution")
    expect(sharedTypes).toContain("export type ListedPasskey")
  })

  it("keeps Solid settings route validation route-level and shares the auth client", () => {
    const settingsRoute = readFileSync(
      resolve(__dirname, "../src/routes/settings/$path.tsx"),
      "utf8"
    )
    const authClient = readFileSync(
      resolve(__dirname, "../src/lib/auth-client.ts"),
      "utf8"
    )

    expect(settingsRoute).toContain("viewPaths.settings")
    expect(settingsRoute).toContain(
      "if (!Object.values(viewPaths.settings).includes(path))"
    )
    expect(settingsRoute).toContain("throw notFound()")
    expect(settingsRoute).toContain("async beforeLoad")
    expect(settingsRoute).toContain("createIsomorphicFn()")
    expect(settingsRoute).toContain("ensureSessionServer")
    expect(settingsRoute).toContain("ensureSessionClient")
    expect(settingsRoute).toContain("getRequestHeaders()")
    expect(settingsRoute).toContain('to: "/auth/$path"')
    expect(settingsRoute).toContain('params: { path: "sign-in" }')
    expect(settingsRoute).toContain("search: { redirectTo: location.href }")
    expect(settingsRoute).not.toContain("minimal {path()} settings route")
    expect(settingsRoute).toContain(
      'import { authClient } from "@/lib/auth-client"'
    )
    expect(settingsRoute).not.toContain(
      'import { authClient } from "@/components/auth/auth-provider"'
    )
    expect(authClient).toContain("export const authClient")
  })

  it("gates Solid settings navigation at the route instead of redirecting from the component", () => {
    const settingsRoute = readFileSync(
      resolve(__dirname, "../src/routes/settings/$path.tsx"),
      "utf8"
    )
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/components/auth/settings/settings.tsx"),
      "utf8"
    )
    const settingsShell = readFileSync(
      resolve(__dirname, "../src/components/auth/settings/settings.tsx"),
      "utf8"
    )

    expect(settingsRoute).toContain("ensureSession")
    expect(settingsRoute).toContain("redirect")
    expect(settingsRoute).toContain("async beforeLoad")
    expect(settingsComponents).not.toContain("useAuthenticate")
    expect(settingsComponents).not.toContain("useListAccounts")
    expect(settingsShell).not.toContain("createEffect")
    expect(settingsShell).not.toContain("redirectTo = encodeURIComponent")
    expect(settingsShell).not.toContain("replace: true")
    expect(settingsShell).toContain("auth.navigate")
    expect(settingsShell).not.toContain("createSettingsComponent")
    expect(settingsShell).not.toContain("createSettingsRouteResolver")
    expect(settingsShell).not.toContain("SettingsShell")
    expect(settingsComponents).not.toContain("routeComponents")
    expect(settingsComponents).not.toContain("props.routeComponents")
    expect(settingsComponents).toContain("function Settings(")
    expect(
      readFileSync(
        resolve(
          __dirname,
          "../src/components/auth/multi-session/manage-accounts.tsx"
        ),
        "utf8"
      )
    ).toContain("listDeviceSessionsOptions")
  })

  it("uses colocated session queries instead of drilling session through settings sections", () => {
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/components/auth/settings/settings.tsx"),
      "utf8"
    )
    const accountSettings = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/account/account-settings.tsx"
      ),
      "utf8"
    )
    const manageAccounts = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/multi-session/manage-accounts.tsx"
      ),
      "utf8"
    )
    const userProfile = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/account/user-profile.tsx"
      ),
      "utf8"
    )
    const changeEmail = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/account/change-email.tsx"
      ),
      "utf8"
    )
    const securitySettings = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/security-settings.tsx"
      ),
      "utf8"
    )
    const activeSessions = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/active-sessions.tsx"
      ),
      "utf8"
    )
    const apiKeys = readFileSync(
      resolve(__dirname, "../src/components/auth/api-key/api-keys.tsx"),
      "utf8"
    )
    const changePassword = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/change-password.tsx"
      ),
      "utf8"
    )
    const passkeys = readFileSync(
      resolve(__dirname, "../src/components/auth/passkey/passkeys.tsx"),
      "utf8"
    )
    const dangerZone = readFileSync(
      resolve(__dirname, "../src/components/auth/delete-user/danger-zone.tsx"),
      "utf8"
    )
    const deleteUser = readFileSync(
      resolve(__dirname, "../src/components/auth/delete-user/delete-user.tsx"),
      "utf8"
    )

    expect(settingsComponents).toContain("<AccountSettings />")
    expect(settingsComponents).toContain("<SecuritySettings />")
    expect(settingsComponents).not.toContain("session={session}")
    expect(accountSettings).not.toContain("session={session}")
    expect(securitySettings).not.toContain("props.session")
    expect(securitySettings).not.toContain("session={props.session}")
    expect(dangerZone).not.toContain("props.session")
    expect(dangerZone).not.toContain("session={props.session}")

    for (const source of [
      manageAccounts,
      userProfile,
      changeEmail,
      changePassword,
      activeSessions,
      apiKeys,
      passkeys,
      deleteUser
    ]) {
      expect(source).toContain("useSession")
      expect(source).toContain("const session = useSession(auth.authClient")
    }
  })

  it("extracts Zaidan Tabs settings navigation into the settings shell without document anchors", () => {
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/components/auth/settings/settings.tsx"),
      "utf8"
    )
    const settingsShell = readFileSync(
      resolve(__dirname, "../src/components/auth/settings/settings.tsx"),
      "utf8"
    )

    expect(settingsShell).toContain(
      'import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"'
    )
    expect(settingsShell).toContain("<Tabs")
    expect(settingsShell).toContain("<TabsList")
    expect(settingsShell).toContain("<TabsTrigger")
    expect(settingsShell).toContain("<TabsContent")
    expect(settingsShell).toContain("value={currentView()}")
    expect(settingsShell).toContain("onChange={handleSettingsTabChange}")
    expect(settingsShell).toContain("auth.navigate({")
    expect(settingsShell).toContain(
      'class={cn("w-full gap-4 md:gap-6", props.class)}'
    )
    expect(settingsShell).toContain("<div")
    expect(settingsShell).not.toContain("<nav")
    expect(settingsShell).not.toContain("Manage account and security settings")
    expect(settingsShell).not.toMatch(/<h1[^>]*>/)
    expect(settingsShell).not.toMatch(/<a\s/)
    expect(settingsShell).not.toMatch(/href=\{`\$\{auth\.basePaths\.settings\}/)
    expect(settingsComponents).toContain(
      'from "@/components/auth/settings/account/account-settings"'
    )
    expect(settingsComponents).toContain(
      'from "@/components/auth/settings/security/security-settings"'
    )
  })

  it("uses TanStack Link for UserButton auth/settings menu navigation", () => {
    const userButton = readFileSync(
      resolve(__dirname, "../src/components/auth/user/user-button.tsx"),
      "utf8"
    )

    expect(userButton).toContain(
      'import { Link } from "@tanstack/solid-router"'
    )
    expect(userButton).toContain('to="/auth/$path"')
    expect(userButton).toContain('to="/settings/$path"')
    expect(userButton).toContain("params={{ path: signInPath }}")
    expect(userButton).toContain("params={{ path: signUpPath }}")
    expect(userButton).toContain("params={{ path: settingsPath }}")
    expect(userButton).toContain("params={{ path: signOutPath }}")
    expect(userButton).not.toContain('as="a"')
    expect(userButton).not.toMatch(
      /href=\{(?:signInHref|signUpHref|settingsHref|signOutHref)\}/
    )
  })

  it("provides canonical shadcn-like Solid auth wrapper files without changing behavior", () => {
    const canonicalWrappers = [
      {
        expected: "export function ThemeToggleItem",
        file: "theme/theme-toggle-item.tsx"
      },
      {
        expected: "export function AppearanceSettings",
        file: "theme/appearance.tsx"
      },
      {
        expected: "export function UserAvatar",
        file: "user/user-avatar.tsx"
      },
      {
        expected: "export function UserView",
        file: "user/user-view.tsx"
      },
      {
        expected: "export function UserButton",
        file: "user/user-button.tsx"
      },
      {
        expected: "export function ManageAccounts",
        file: "multi-session/manage-accounts.tsx"
      },
      {
        expected: "export function ManageAccountRow",
        file: "multi-session/manage-account.tsx"
      },
      {
        expected: "export function ActiveSessionRow",
        file: "settings/security/active-session.tsx"
      },
      {
        expected: "export function ActiveSessionsSettings",
        file: "settings/security/active-sessions.tsx"
      },
      {
        expected: "export function ChangePasswordSettings",
        file: "settings/security/change-password.tsx"
      },
      {
        expected: "export function LinkedAccountRow",
        file: "settings/security/linked-account.tsx"
      },
      {
        expected: "export function LinkedAccountsSettings",
        file: "settings/security/linked-accounts.tsx"
      }
    ]

    for (const wrapper of canonicalWrappers) {
      const source = readFileSync(
        resolve(__dirname, `../src/components/auth/${wrapper.file}`),
        "utf8"
      )

      expect(source, wrapper.file).toContain(wrapper.expected)
      if (wrapper.expected.startsWith("export function")) {
        expect(isSimpleReExportOnly(source), wrapper.file).toBe(false)
      }
    }

    const compatibilityWrappers = [
      {
        expected: 'export { UserButton } from "./user/user-button"',
        file: "user-button.tsx"
      },
      {
        expected: 'export { AppearanceSettings } from "../../theme/appearance"',
        file: "settings/account/appearance-settings.tsx"
      },
      {
        expected:
          'export { ManageAccountRow, ManageAccountRowSkeleton } from "../../multi-session/manage-account"',
        file: "settings/account/manage-account-row.tsx"
      }
    ]

    for (const wrapper of compatibilityWrappers) {
      const source = readFileSync(
        resolve(__dirname, `../src/components/auth/${wrapper.file}`),
        "utf8"
      ).trim()
      const normalizedSource = source.replace(/\s+/g, " ")

      expect(normalizedSource, wrapper.file).toBe(wrapper.expected)
      expect(isSimpleReExportOnly(source), wrapper.file).toBe(true)
    }

    const userButton = readFileSync(
      resolve(__dirname, "../src/components/auth/user/user-button.tsx"),
      "utf8"
    )
    expect(userButton).toContain(
      'from "@/components/auth/theme/theme-toggle-item"'
    )
    expect(userButton).toContain('from "@/components/auth/user/user-avatar"')
    expect(userButton).toContain('from "@/components/auth/user/user-view"')
    expect(userButton).not.toContain("function ThemeToggleItem")

    const accountSettings = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/account/account-settings.tsx"
      ),
      "utf8"
    )
    const securitySettings = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/security-settings.tsx"
      ),
      "utf8"
    )

    expect(accountSettings).toContain(
      'from "@/components/auth/theme/appearance"'
    )
    expect(accountSettings).toContain(
      'from "@/components/auth/multi-session/manage-accounts"'
    )
    expect(accountSettings).not.toContain("listDeviceSessionsOptions")
    expect(securitySettings).toContain(
      'from "@/components/auth/settings/security/active-sessions"'
    )
    expect(securitySettings).toContain(
      'from "@/components/auth/settings/security/change-password"'
    )
    expect(securitySettings).toContain(
      'from "@/components/auth/settings/security/linked-accounts"'
    )

    const activeSessionsSettings = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/active-sessions.tsx"
      ),
      "utf8"
    )
    const linkedAccountsSettings = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/linked-accounts.tsx"
      ),
      "utf8"
    )
    expect(activeSessionsSettings).toContain('from "./active-session"')
    expect(activeSessionsSettings).not.toContain("function ActiveSessionRow(")
    expect(linkedAccountsSettings).toContain('from "./linked-account"')
    expect(linkedAccountsSettings).not.toContain("function LinkedAccountRow(")
  })

  it("closes remaining shadcn-like Solid auth file parity with real implementations or documented guards", () => {
    const canonicalFiles = [
      "additional-field.tsx",
      "provider-button.tsx",
      "provider-buttons.tsx",
      "username/username-field.tsx",
      "username/sign-in-username.tsx",
      "magic-link.tsx",
      "magic-link-button.tsx",
      "passkey/passkey-button.tsx",
      "settings/account/change-avatar.tsx",
      "settings/security/active-sessions.tsx",
      "settings/security/change-password.tsx",
      "settings/security/linked-accounts.tsx"
    ]

    for (const file of canonicalFiles) {
      expect(
        existsSync(resolve(__dirname, `../src/components/auth/${file}`)),
        file
      ).toBe(true)
    }

    const expectedImplementations = [
      {
        expected: "export function AdditionalField",
        file: "additional-field.tsx"
      },
      {
        expected: "export function ProviderButton",
        file: "provider-button.tsx"
      },
      {
        expected: "export function ProviderButtons",
        file: "provider-buttons.tsx"
      },
      {
        expected: "export function UsernameField",
        file: "username/username-field.tsx"
      },
      {
        expected: "export function SignInUsername",
        file: "username/sign-in-username.tsx"
      },
      {
        expected: "export function MagicLink",
        file: "magic-link.tsx"
      },
      {
        expected: "export function MagicLinkButton",
        file: "magic-link-button.tsx"
      },
      {
        expected: "export function PasskeyButton",
        file: "passkey/passkey-button.tsx"
      },
      {
        expected: "export function ChangeAvatar",
        file: "settings/account/change-avatar.tsx"
      },
      {
        expected: "export function ActiveSessionsSettings",
        file: "settings/security/active-sessions.tsx"
      },
      {
        expected: "export function ChangePasswordSettings",
        file: "settings/security/change-password.tsx"
      },
      {
        expected: "export function LinkedAccountsSettings",
        file: "settings/security/linked-accounts.tsx"
      }
    ]

    for (const implementation of expectedImplementations) {
      const source = readFileSync(
        resolve(__dirname, `../src/components/auth/${implementation.file}`),
        "utf8"
      )

      expect(source, implementation.file).toContain(implementation.expected)
      expect(isSimpleReExportOnly(source), implementation.file).toBe(false)
    }

    const signIn = readFileSync(
      resolve(__dirname, "../src/components/auth/sign-in.tsx"),
      "utf8"
    )
    const signInUsername = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/username/sign-in-username.tsx"
      ),
      "utf8"
    )
    const userProfile = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/account/user-profile.tsx"
      ),
      "utf8"
    )
    const changeAvatar = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/account/change-avatar.tsx"
      ),
      "utf8"
    )
    const providerButton = readFileSync(
      resolve(__dirname, "../src/components/auth/provider-button.tsx"),
      "utf8"
    )
    const providerButtons = readFileSync(
      resolve(__dirname, "../src/components/auth/provider-buttons.tsx"),
      "utf8"
    )
    const additionalField = readFileSync(
      resolve(__dirname, "../src/components/auth/additional-field.tsx"),
      "utf8"
    )
    const passkeyButton = readFileSync(
      resolve(__dirname, "../src/components/auth/passkey/passkey-button.tsx"),
      "utf8"
    )
    const magicLink = readFileSync(
      resolve(__dirname, "../src/components/auth/magic-link.tsx"),
      "utf8"
    )
    const magicLinkButton = readFileSync(
      resolve(__dirname, "../src/components/auth/magic-link-button.tsx"),
      "utf8"
    )

    expect(signIn).toContain('from "./username/sign-in-username"')
    expect(signIn).not.toContain("function resolveSubmittedSignIn")
    expect(signInUsername).toContain("resolveSubmittedSignIn")
    expect(signInUsername).toContain("signInUsernameOptions")
    expect(signInUsername).toContain("authQueryKeys.session")
    expect(userProfile).toContain(
      'from "@/components/auth/settings/account/change-avatar"'
    )
    expect(userProfile).toContain("<ChangeAvatar")
    expect(userProfile).not.toContain("handleAvatarFileChange")
    expect(changeAvatar).toContain("fileToBase64")
    expect(changeAvatar).toContain("updateUserOptions")
    expect(changeAvatar).toContain("avatarChangedSuccess")
    expect(providerButton).toContain("auth.authClient.signIn.social")
    expect(providerButton).toContain("resolveSocialAuthParams")
    expect(providerButton).toContain("getProviderName")
    expect(providerButtons).toContain("ProviderButton")
    expect(providerButtons).toContain('SocialLayout = "auto"')
    expect(additionalField).toContain("resolveInputType")
    expect(additionalField).toContain("field.render")
    expect(passkeyButton).toContain("signInPasskeyOptions")
    expect(passkeyButton).toContain('view === "signUp"')
    expect(magicLink).toContain("signInMagicLinkOptions")
    expect(magicLink).toContain('plugin.id === "magicLink"')
    expect(magicLinkButton).toContain('view === "magicLink"')
    expect(magicLinkButton).toContain('plugin.id === "magicLink"')
    expect(magicLinkButton).not.toContain("magic link plugin is not wired")
  })

  it("removes unused security compatibility wrappers while keeping canonical implementations real", () => {
    const removedCompatibilityWrappers = [
      "settings/security/active-sessions-settings.tsx",
      "settings/security/change-password-settings.tsx",
      "settings/security/linked-accounts-settings.tsx"
    ]

    for (const file of removedCompatibilityWrappers) {
      expect(
        existsSync(resolve(__dirname, `../src/components/auth/${file}`)),
        file
      ).toBe(false)
    }

    const canonicalImplementations = [
      {
        expected: "export function ActiveSessionsSettings",
        file: "settings/security/active-sessions.tsx"
      },
      {
        expected: "export function ChangePasswordSettings",
        file: "settings/security/change-password.tsx"
      },
      {
        expected: "export function LinkedAccountsSettings",
        file: "settings/security/linked-accounts.tsx"
      }
    ]

    for (const implementation of canonicalImplementations) {
      const source = readFileSync(
        resolve(__dirname, `../src/components/auth/${implementation.file}`),
        "utf8"
      )

      expect(source, implementation.file).toContain(implementation.expected)
      expect(isSimpleReExportOnly(source), implementation.file).toBe(false)
    }
  })

  it("uses TanStack Link for auth form helper navigation", () => {
    const helperLinkFiles = [
      "username/sign-in-username.tsx",
      "sign-up.tsx",
      "forgot-password.tsx",
      "reset-password.tsx"
    ]

    for (const file of helperLinkFiles) {
      const source = readFileSync(
        resolve(__dirname, `../src/components/auth/${file}`),
        "utf8"
      )

      expect(source, file).toContain(
        'import { Link } from "@tanstack/solid-router"'
      )
      expect(source, file).toContain("<Link")
      expect(source, file).toContain('to="/auth/$path"')
      expect(source, file).toContain("params={{ path: auth.viewPaths.auth.")
      expect(source, file).not.toMatch(/<a\s/)
      expect(source, file).not.toMatch(/href=\{?`?\$?\{?auth\.basePaths\.auth/)
    }
  })

  it("keeps Auth, SignIn, and SignUp props aligned with the shadcn parity surface", () => {
    const authComponent = readFileSync(
      resolve(__dirname, "../src/components/auth/auth.tsx"),
      "utf8"
    )
    const signIn = readFileSync(
      resolve(__dirname, "../src/components/auth/sign-in.tsx"),
      "utf8"
    )
    const signInUsername = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/username/sign-in-username.tsx"
      ),
      "utf8"
    )
    const signUp = readFileSync(
      resolve(__dirname, "../src/components/auth/sign-up.tsx"),
      "utf8"
    )

    expect(authComponent).toContain(
      'import type { SocialLayout } from "./provider-buttons"'
    )
    expect(authComponent).toContain("export type AuthProps = {")
    for (const prop of [
      "class?: string",
      "path?: string",
      "socialLayout?: SocialLayout",
      'socialPosition?: "top" | "bottom"',
      "view?: AuthView"
    ]) {
      expect(authComponent, prop).toContain(prop)
    }
    expect(authComponent).toContain("const currentView =")
    expect(authComponent).toContain("view ??")
    expect(authComponent).not.toContain("normalizeClassName")
    expect(authComponent).toContain("const PluginComponent = () =>")
    expect(authComponent).toContain("const FallbackComponent = () =>")
    expect(authComponent).toContain("const RouteComponent = () =>")
    expect(authComponent).toContain("<Dynamic")
    expect(authComponent).toContain("class={props.class}")
    expect(authComponent).toContain("socialLayout={props.socialLayout}")
    expect(authComponent).toContain("socialPosition={props.socialPosition}")

    expect(signIn).toContain("export type SignInProps = SignInUsernameProps")
    expect(signIn).toContain("export function SignIn(props: SignInProps)")
    expect(signIn).toContain("<SignInUsername {...props} />")

    expect(signInUsername).toContain("export type SignInUsernameProps = {")
    expect(signInUsername).toContain("class?: string")
    expect(signInUsername).toContain("socialLayout?: SocialLayout")
    expect(signInUsername).toContain('socialPosition?: "top" | "bottom"')
    expect(signInUsername).toContain(
      'const socialPosition = () => props.socialPosition ?? "bottom"'
    )
    expect(signInUsername).toContain(
      'class={cn("w-full max-w-sm", props.class)}'
    )
    expect(signInUsername).toContain('socialPosition() === "top"')
    expect(signInUsername).toContain('socialPosition() === "bottom"')
    expect(signInUsername).toContain(
      '<ProviderButtons socialLayout={props.socialLayout} view="signIn" />'
    )

    expect(signUp).toContain("export type SignUpProps = {")
    expect(signUp).toContain("class?: string")
    expect(signUp).toContain("socialLayout?: SocialLayout")
    expect(signUp).toContain('socialPosition?: "top" | "bottom"')
    expect(signUp).toContain(
      'const socialPosition = () => props.socialPosition ?? "bottom"'
    )
    expect(signUp).toContain('class={cn("w-full max-w-sm", props.class)}')
    expect(signUp).toContain('socialPosition() === "top"')
    expect(signUp).toContain('socialPosition() === "bottom"')
    expect(signUp).toContain(
      '<ProviderButtons socialLayout={props.socialLayout} view="signUp" />'
    )
  })

  it("keeps Auth view resolution reactive when the external view prop changes", () => {
    const authComponent = readFileSync(
      resolve(__dirname, "../src/components/auth/auth.tsx"),
      "utf8"
    )

    expect(authComponent).toContain("const authView = () => currentView()")
    expect(authComponent).not.toContain("const authView = currentView()")
    expect(authComponent).toContain("const AuthComponent = () =>")
    expect(authComponent).toContain("component={AuthComponent()}")
  })

  it("keeps Settings props aligned with the shadcn parity surface", () => {
    const settings = readFileSync(
      resolve(__dirname, "../src/components/auth/settings/settings.tsx"),
      "utf8"
    )

    expect(settings).toContain("export type SettingsProps = {")
    for (const prop of [
      "class?: string",
      "path?: string",
      "view?: SettingsView",
      "hideNav?: boolean"
    ]) {
      expect(settings, prop).toContain(prop)
    }
    expect(settings).toContain(
      'class={cn("w-full gap-4 md:gap-6", props.class)}'
    )
    expect(settings).toContain("props.view ??")
    expect(settings).toContain("resolveSettingsView")
    expect(settings).toContain("currentView()")
    expect(settings).toContain('class={cn(props.hideNav && "hidden")}')
  })

  it("keeps Settings subtree props aligned with the shadcn parity surface", () => {
    const files = {
      accountSettings: readFileSync(
        resolve(
          __dirname,
          "../src/components/auth/settings/account/account-settings.tsx"
        ),
        "utf8"
      ),
      userProfile: readFileSync(
        resolve(
          __dirname,
          "../src/components/auth/settings/account/user-profile.tsx"
        ),
        "utf8"
      ),
      changeEmail: readFileSync(
        resolve(
          __dirname,
          "../src/components/auth/settings/account/change-email.tsx"
        ),
        "utf8"
      ),
      securitySettings: readFileSync(
        resolve(
          __dirname,
          "../src/components/auth/settings/security/security-settings.tsx"
        ),
        "utf8"
      ),
      changePassword: readFileSync(
        resolve(
          __dirname,
          "../src/components/auth/settings/security/change-password.tsx"
        ),
        "utf8"
      ),
      linkedAccounts: readFileSync(
        resolve(
          __dirname,
          "../src/components/auth/settings/security/linked-accounts.tsx"
        ),
        "utf8"
      ),
      activeSessions: readFileSync(
        resolve(
          __dirname,
          "../src/components/auth/settings/security/active-sessions.tsx"
        ),
        "utf8"
      ),
      forgotPassword: readFileSync(
        resolve(__dirname, "../src/components/auth/forgot-password.tsx"),
        "utf8"
      ),
      resetPassword: readFileSync(
        resolve(__dirname, "../src/components/auth/reset-password.tsx"),
        "utf8"
      ),
      signOut: readFileSync(
        resolve(__dirname, "../src/components/auth/sign-out.tsx"),
        "utf8"
      )
    }

    for (const [name, source] of Object.entries(files)) {
      expect(source, name).toContain("class?: string")
      expect(source, name).not.toContain("StylableProps")
      expect(source, name).not.toContain("normalizeClassName")
    }

    expect(files.accountSettings).toContain(
      "export type AccountSettingsProps = {"
    )
    expect(files.accountSettings).toContain(
      "export function AccountSettings(props: AccountSettingsProps = {})"
    )
    expect(files.accountSettings).toContain("<UserProfile />")

    expect(files.userProfile).toContain("export type UserProfileProps")
    expect(files.changeEmail).toContain("export type ChangeEmailProps")
    expect(files.securitySettings).toContain(
      "export type SecuritySettingsProps = {"
    )
    expect(files.changePassword).toContain(
      "export type ChangePasswordSettingsProps = {"
    )
    expect(files.changePassword).toContain("confirmPassword?: boolean")
    expect(files.linkedAccounts).toContain(
      "export type LinkedAccountsSettingsProps = {"
    )
    expect(files.activeSessions).toContain(
      "export type ActiveSessionsSettingsProps = {"
    )
    expect(files.forgotPassword).toContain(
      "export type ForgotPasswordProps = {"
    )
    expect(files.resetPassword).toContain("export type ResetPasswordProps = {")
    expect(files.signOut).toContain("export type SignOutProps = {")
  })

  it("keeps User surface props aligned with the shadcn parity surface", () => {
    const userButton = readFileSync(
      resolve(__dirname, "../src/components/auth/user/user-button.tsx"),
      "utf8"
    )
    const userAvatar = readFileSync(
      resolve(__dirname, "../src/components/auth/user/user-avatar.tsx"),
      "utf8"
    )
    const userView = readFileSync(
      resolve(__dirname, "../src/components/auth/user/user-view.tsx"),
      "utf8"
    )

    expect(userButton).toContain("export type UserButtonLinkVisibility")
    expect(userButton).toContain("export type UserButtonLink = {")
    expect(userButton).toContain("links?: (UserButtonLink | JSX.Element)[]")
    expect(userButton).toContain("hideSettings?: boolean")
    expect(userButton).toContain("props.class")
    expect(userButton).toContain("renderUserLink")
    expect(userButton).toContain('visibility === "authenticated"')
    expect(userButton).toContain('visibility === "unauthenticated"')
    expect(userButton).toContain("!props.hideSettings")

    expect(userAvatar).toContain("export type UserAvatarProps = {")
    expect(userAvatar).toContain("class?: string")
    expect(userAvatar).toContain("user?: AuthUser")
    expect(userAvatar).toContain("isPending?: boolean")
    expect(userAvatar).toContain("props.class")
    expect(userAvatar).toContain("resolvedUser")
    expect(userAvatar).toContain("sessionPending")
    expect(userAvatar).toContain("displayUsername")

    expect(userView).toContain("export type UserViewProps = {")
    expect(userView).toContain("class?: string")
    expect(userView).toContain("user?: AuthUser")
    expect(userView).toContain("isPending?: boolean")
    expect(userView).toContain("props.class")
    expect(userView).toContain("user={resolvedUser()}")
    expect(userView).toContain("secondaryLabel()")
  })

  it("renders the account tab like the shadcn settings baseline", () => {
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/components/auth/settings/settings.tsx"),
      "utf8"
    )
    const accountSettings = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/account/account-settings.tsx"
      ),
      "utf8"
    )
    const userProfile = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/account/user-profile.tsx"
      ),
      "utf8"
    )
    const changeEmail = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/account/change-email.tsx"
      ),
      "utf8"
    )
    const appearanceSettings = readFileSync(
      resolve(__dirname, "../src/components/auth/theme/appearance.tsx"),
      "utf8"
    )
    const manageAccountRow = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/multi-session/manage-account.tsx"
      ),
      "utf8"
    )
    const manageAccounts = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/multi-session/manage-accounts.tsx"
      ),
      "utf8"
    )

    expect(settingsComponents).toContain(
      'from "@/components/auth/settings/account/account-settings"'
    )
    expect(settingsComponents).toContain("AccountSettings,")
    expect(settingsComponents).not.toContain("function AppearanceSettings")
    expect(settingsComponents).not.toContain("function ManageAccountRow")
    expect(manageAccounts).toContain("useAuth")
    expect(manageAccounts).toContain("session.data?.user.name")
    expect(manageAccounts).toContain("session.data?.user.email")
    expect(accountSettings).toContain("<UserProfile />")
    expect(userProfile).toContain("getUsername(session)")
    expect(userProfile).toContain("username?: string | null")
    expect(userProfile).toContain("Profile")
    expect(userProfile).toContain("<h2")
    expect(changeEmail).toContain("auth.localization.settings.changeEmail")
    expect(changeEmail).toContain("auth.localization.settings.updateEmail")
    expect(appearanceSettings).toContain("Appearance")
    expect(appearanceSettings).toContain("System")
    expect(appearanceSettings).toContain("Light")
    expect(appearanceSettings).toContain("Dark")
    expect(accountSettings).toContain("<ManageAccounts />")
    expect(manageAccounts).toContain("multiSessionLocalization.manageAccounts")
    expect(manageAccounts).toContain("<ItemGroup")
    expect(manageAccountRow).toContain("<ItemMedia")
    expect(manageAccountRow).toContain("<ItemContent")
    expect(manageAccountRow).toContain("<ItemTitle")
    expect(manageAccountRow).toContain("<ItemDescription")
    expect(manageAccountRow).toContain("<ItemActions")
    expect(manageAccounts).toContain("<ItemSeparator")
    expect(manageAccountRow).toContain("multiSessionLocalization.switchAccount")
    expect(manageAccountRow).toContain("auth.localization.auth.signOut")
    expect(userProfile).toContain("Save changes")
    expect(userProfile).toContain("disabled")
    expect(settingsComponents).not.toContain("Plugin account cards")
    expect(settingsComponents).not.toContain("Social accounts")
    expect(settingsComponents).not.toMatch(
      /<CardTitle[^>]*class="flex items-center gap-2"/
    )
    expect(settingsComponents).not.toMatch(
      /<User class=|<Mail class=|<Palette class=|<LinkIcon class=/
    )
  })

  it("wires manage accounts to Solid multi-session switch and sign-out actions", () => {
    const accountSettings = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/account/account-settings.tsx"
      ),
      "utf8"
    )
    const manageAccountRow = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/multi-session/manage-account.tsx"
      ),
      "utf8"
    )
    const manageAccounts = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/multi-session/manage-accounts.tsx"
      ),
      "utf8"
    )

    expect(accountSettings).toContain("<ManageAccounts />")
    expect(manageAccounts).toContain("setActiveSessionOptions")
    expect(manageAccounts).toContain("revokeMultiSessionOptions")
    expect(manageAccounts).toContain("const setActiveSession = createMutation")
    expect(manageAccounts).toContain(
      "const revokeMultiSession = createMutation"
    )
    expect(manageAccounts).toContain("window.scrollTo({ top: 0 })")
    expect(manageAccounts).toContain(
      "auth.localization.settings.revokeSessionSuccess"
    )
    expect(manageAccounts).toContain("setActiveSession.mutate({")
    expect(manageAccounts).toContain("revokeMultiSession.mutate({")
    expect(manageAccounts).toContain("sessionToken:")
    expect(manageAccounts).toContain("deviceSession.session.token")
    expect(manageAccountRow).toContain("ArrowLeftRight")
    expect(manageAccountRow).toContain("MoreHorizontal")
    expect(manageAccountRow).toContain("DropdownMenuTrigger")
    expect(manageAccountRow).toContain("DropdownMenuContent")
    expect(manageAccountRow).toContain("DropdownMenuItem")
    expect(manageAccountRow).toContain("auth.localization.auth.signOut")
    expect(manageAccounts).not.toContain(
      "Multi-session switch and sign-out actions are shown but disabled until"
    )
    expect(manageAccounts).not.toMatch(
      /<Button disabled size="sm" type="button" variant="secondary">\s*Switch account/
    )
    expect(manageAccounts).not.toMatch(
      /<Button disabled size="sm" type="button" variant="secondary">\s*Sign out/
    )
  })

  it("wires profile save to Solid updateUser mutation like the shadcn user profile", () => {
    const userProfile = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/account/user-profile.tsx"
      ),
      "utf8"
    )

    expect(userProfile).toContain("updateUserOptions")
    expect(userProfile).toContain("createMutation")
    expect(userProfile).toContain("const updateUser = createMutation")
    expect(userProfile).toContain("onSubmit={submitProfile}")
    expect(userProfile).toContain("const formData = new FormData")
    expect(userProfile).toContain('formData.get("name")')
    expect(userProfile).toContain('formData.get("username")')
    expect(userProfile).toContain("updateUser.mutate({")
    expect(userProfile).toContain("name,")
    expect(userProfile).toContain("username")
    expect(userProfile).toContain("profileUpdatedSuccess")
    expect(userProfile).not.toContain(
      "Profile and avatar update mutations are not available in this Solid"
    )
    expect(userProfile).not.toMatch(
      /<Button disabled size="sm" type="button">\s*Save changes/
    )
  })

  it("wires avatar upload and delete to Solid updateUser mutation like shadcn ChangeAvatar", () => {
    const changeAvatar = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/account/change-avatar.tsx"
      ),
      "utf8"
    )

    expect(changeAvatar).toContain("fileToBase64")
    expect(changeAvatar).toContain('import { toast } from "solid-sonner"')
    expect(changeAvatar).toContain("DropdownMenu")
    expect(changeAvatar).toContain("DropdownMenuContent")
    expect(changeAvatar).toContain("DropdownMenuItem")
    expect(changeAvatar).toContain("DropdownMenuTrigger")
    expect(changeAvatar).toContain("Upload")
    expect(changeAvatar).toContain("Trash2")
    expect(changeAvatar).toContain('type="file"')
    expect(changeAvatar).toContain('accept="image/*"')
    expect(changeAvatar).toContain("handleAvatarFileChange")
    expect(changeAvatar).toContain("auth.avatar.resize")
    expect(changeAvatar).toContain("auth.avatar.upload")
    expect(changeAvatar).toContain("updateUser.mutate(")
    expect(changeAvatar).toContain("{ image },")
    expect(changeAvatar).toContain("avatarChangedSuccess")
    expect(changeAvatar).toContain("deleteAvatar")
    expect(changeAvatar).toContain("{ image: null },")
    expect(changeAvatar).toContain("auth.avatar.delete")
    expect(changeAvatar).toContain("avatarDeletedSuccess")
    expect(changeAvatar).toContain("uploadAvatar")
    expect(changeAvatar).toContain("changeAvatar")
  })

  it("wires change email to the Solid changeEmail mutation like the shadcn account form", () => {
    const changeEmail = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/account/change-email.tsx"
      ),
      "utf8"
    )

    expect(changeEmail).toContain("changeEmailOptions")
    expect(changeEmail).toContain("const changeEmail = createMutation")
    expect(changeEmail).toContain("onSubmit={submitChangeEmail}")
    expect(changeEmail).toContain("const formData = new FormData")
    expect(changeEmail).toContain('formData.get("email")')
    expect(changeEmail).toContain("newEmail:")
    expect(changeEmail).toContain("callbackURL:")
    expect(changeEmail).toContain("auth.baseURL")
    expect(changeEmail).toContain("auth.viewPaths.settings.account")
    expect(changeEmail).toContain("auth.localization.settings.changeEmail")
    expect(changeEmail).toContain("auth.localization.auth.email")
    expect(changeEmail).toContain("auth.localization.auth.emailPlaceholder")
    expect(changeEmail).toContain('toast.success("Email updated successfully")')
    expect(changeEmail).not.toContain(
      "toast.success(auth.localization.settings.changeEmailSuccess)"
    )
    expect(changeEmail).toContain("auth.localization.settings.updateEmail")
    expect(changeEmail).not.toContain(
      "Change email mutation is not available in this Solid slice yet."
    )
    expect(changeEmail).not.toMatch(
      /<Button disabled size="sm" type="button">\s*Update email/
    )
  })

  it("uses the exact shadcn theme preview SVG shapes for the Solid appearance cards", () => {
    const appearanceSettings = readFileSync(
      resolve(__dirname, "../src/components/auth/theme/appearance.tsx"),
      "utf8"
    )

    expect(appearanceSettings).toContain("ThemePreviewSystem")
    expect(appearanceSettings).toContain("ThemePreviewLight")
    expect(appearanceSettings).toContain("ThemePreviewDark")
    expect(appearanceSettings).toContain('viewBox="0 0 240 117"')
    expect(appearanceSettings).toContain("systemDiagonalLight")
    expect(appearanceSettings).toContain("systemDiagonalDark")
    expect(appearanceSettings).toContain(
      'd="M12 0.5H228C234.351 0.5 239.5 5.64873 239.5 12V105C239.5 111.351 234.351 116.5 228 116.5H12C5.64873 116.5 0.5 111.351 0.5 105V12C0.5 5.64873 5.64873 0.5 12 0.5Z"'
    )
    expect(appearanceSettings).toContain(
      'd="M88 51C88 46.5817 91.5817 43 96 43H221C225.418 43 229 46.5817 229 51V85C229 89.4183 225.418 93 221 93H96C91.5817 93 88 89.4183 88 85V51Z"'
    )
    expect(appearanceSettings).toContain(
      '<circle cx="22.5" cy="25.5" fill="#E4E4E7" r="5.5" />'
    )
    expect(appearanceSettings).toContain(
      '<circle cx="22.5" cy="25.5" fill="#3F3F46" r="5.5" />'
    )
    expect(appearanceSettings).not.toContain(
      "bg-gradient-to-r from-background to-slate-950"
    )
  })

  it("renders the security tab like the shadcn settings baseline", () => {
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/components/auth/settings/settings.tsx"),
      "utf8"
    )
    const securitySettings = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/security-settings.tsx"
      ),
      "utf8"
    )
    const changePassword = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/change-password.tsx"
      ),
      "utf8"
    )
    const linkedAccounts = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/linked-accounts.tsx"
      ),
      "utf8"
    )
    const activeSessions = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/active-sessions.tsx"
      ),
      "utf8"
    )
    const activeSession = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/active-session.tsx"
      ),
      "utf8"
    )

    expect(settingsComponents).toContain(
      'from "@/components/auth/settings/security/security-settings"'
    )
    expect(settingsComponents).not.toContain("createSecuritySettingsComponent")
    expect(settingsComponents).toContain("<SecuritySettings />")
    expect(settingsComponents).not.toContain("function ChangePasswordSettings")
    expect(settingsComponents).not.toContain("function LinkedAccountsSettings")
    expect(settingsComponents).not.toContain("function ActiveSessionsSettings")
    expect(securitySettings).toContain("auth.emailAndPassword?.enabled")
    expect(securitySettings).toContain("<ChangePasswordSettings")
    expect(securitySettings).toContain("auth.emailAndPassword.confirmPassword")
    expect(changePassword).toContain(
      "auth.localization.settings.currentPassword"
    )
    expect(changePassword).toContain("auth.localization.auth.newPassword")
    expect(changePassword).toContain("auth.localization.auth.confirmPassword")
    expect(changePassword).toContain(
      "auth.localization.settings.updatePassword"
    )
    expect(securitySettings).toContain("!!auth.socialProviders?.length")
    expect(securitySettings).toContain("<LinkedAccountsSettings")
    expect(securitySettings).toContain("<ActiveSessionsSettings")
    expect(linkedAccounts).toContain("<ItemSeparator")
    expect(activeSessions).toContain("<ItemGroup")
    expect(activeSessions).toContain("<ActiveSessionRow")
    expect(activeSession).toContain("<Item")
    expect(activeSession).toContain("<ItemMedia")
    expect(activeSession).toContain("<ItemContent")
    expect(activeSession).toContain("<ItemTitle")
    expect(activeSession).toContain("<ItemDescription")
    expect(activeSession).toContain("<ItemActions")
    expect(activeSessions).toContain("<ItemSeparator")
    expect(activeSession).toContain("auth.localization.settings.currentSession")
    expect(activeSession).toContain("auth.localization.auth.signOut")
    expect(securitySettings).toContain("auth.plugins.flatMap")
    expect(securitySettings).toContain("plugin.securityCards")
    expect(settingsComponents).not.toContain("Plugin security cards")
    expect(settingsComponents).not.toContain("API keys are not available")
    expect(settingsComponents).not.toContain("Passkeys are not available")
    expect(settingsComponents).not.toContain(
      "Danger zone actions are not available"
    )
  })

  it("wires change password to Solid mutations and account detection like shadcn", () => {
    const changePassword = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/change-password.tsx"
      ),
      "utf8"
    )

    expect(changePassword).toContain("changePasswordOptions")
    expect(changePassword).toContain("requestPasswordResetOptions")
    expect(changePassword).toContain("listAccountsOptions")
    expect(changePassword).toContain("const linkedAccounts = createQuery")
    expect(changePassword).toContain('providerId === "credential"')
    expect(changePassword).toContain("requestPasswordReset.mutate")
    expect(changePassword).toContain("session.data.user.email")
    expect(changePassword).toContain("passwordResetEmailSent")
    expect(changePassword).toContain("const changePassword = createMutation")
    expect(changePassword).toContain("submitChangePassword")
    expect(changePassword).toContain("passwordsDoNotMatch")
    expect(changePassword).toContain("changePassword.mutate({")
    expect(changePassword).toContain("currentPassword,")
    expect(changePassword).toContain("newPassword,")
    expect(changePassword).toContain("revokeOtherSessions: true")
    expect(changePassword).toContain("changePasswordSuccess")
    expect(changePassword).toContain(
      "auth.localization.settings.currentPassword"
    )
    expect(changePassword).toContain(
      "auth.localization.settings.currentPasswordPlaceholder"
    )
    expect(changePassword).toContain("auth.localization.auth.newPassword")
    expect(changePassword).toContain(
      "auth.localization.auth.newPasswordPlaceholder"
    )
    expect(changePassword).toContain("auth.localization.auth.confirmPassword")
    expect(changePassword).toContain(
      "auth.localization.auth.confirmPasswordPlaceholder"
    )
    expect(changePassword).toContain(
      "auth.localization.settings.updatePassword"
    )
    expect(changePassword).toContain("auth.emailAndPassword.minPasswordLength")
    expect(changePassword).toContain("auth.emailAndPassword.maxPasswordLength")
    expect(changePassword).toContain("Eye")
    expect(changePassword).toContain("EyeOff")
    expect(changePassword).not.toContain(
      "Change password mutation is not wired in this Solid slice yet."
    )
    expect(changePassword).not.toMatch(
      /<Button disabled size="sm" type="button">\s*Update password/
    )
  })

  it("provides the local Solid Zaidan Item primitive used by settings rows", () => {
    const itemPath = resolve(__dirname, "../src/components/ui/item.tsx")
    const item = readFileSync(itemPath, "utf8")
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/components/auth/settings/settings.tsx"),
      "utf8"
    )
    const passkeys = readFileSync(
      resolve(__dirname, "../src/components/auth/passkey/passkeys.tsx"),
      "utf8"
    )

    expect(existsSync(itemPath)).toBe(true)
    expect(item).toContain(
      'import { Separator } from "@/components/ui/separator"'
    )
    expect(item).toContain('import { cn } from "@/lib/utils"')
    expect(item).toContain('type ItemVariant = "default" | "outline" | "muted"')
    expect(item).toContain('type ItemSize = "default" | "sm" | "xs"')
    expect(item).toContain(
      'type ItemMediaVariant = "default" | "icon" | "image"'
    )
    expect(item).toContain("const itemVariants =")
    expect(item).toContain("const itemMediaVariants =")
    expect(item).toContain('{ as: "div", size: "default", variant: "default" }')
    expect(item).toContain('type ItemGroupProps = ComponentProps<"div">')
    expect(item).toContain("<div")
    expect(item).not.toContain("<ul")
    expect(item).toContain('type ItemDescriptionProps = ComponentProps<"p">')
    expect(item).toContain("<p")
    expect(item).toContain('data-slot="item"')
    expect(item).toContain('data-slot="item-group"')
    expect(item).toContain('data-slot="item-media"')
    expect(item).toContain("data-variant={local.variant}")
    expect(item).toContain('data-slot="item-content"')
    expect(item).toContain('data-slot="item-title"')
    expect(item).toContain('data-slot="item-description"')
    expect(item).toContain('data-slot="item-actions"')
    expect(item).toContain('data-slot="item-separator"')
    expect(item).toContain('role="list"')
    expect(item).toMatch(
      /export \{[\s\S]*ItemFooter[\s\S]*ItemHeader[\s\S]*itemMediaVariants[\s\S]*itemVariants/
    )
    expect(settingsComponents).not.toContain('from "@/components/ui/item"')
    expect(passkeys).toContain('from "@/components/ui/item"')
  })

  it("does not invent placeholder active-session rows when only the current session is known", () => {
    const activeSession = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/active-session.tsx"
      ),
      "utf8"
    )

    expect(activeSession).toContain("auth.localization.settings.currentSession")
    expect(activeSession).not.toContain("Other active sessions")
    expect(activeSession).not.toContain("Additional sessions will appear here.")
  })

  it("wires active sessions to real Solid session queries and revoke/sign-out parity", () => {
    const activeSessions = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/active-sessions.tsx"
      ),
      "utf8"
    )
    const activeSession = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/active-session.tsx"
      ),
      "utf8"
    )
    const solidIndex = readFileSync(
      resolve(__dirname, "../../../packages/solid/src/index.ts"),
      "utf8"
    )

    expect(solidIndex).toContain(
      'export * from "./queries/settings/list-sessions-query"'
    )
    expect(activeSession).toContain('import Bowser from "bowser"')
    expect(activeSessions).toContain("listSessionsOptions")
    expect(activeSessions).toContain("revokeSessionOptions")
    expect(activeSessions).toContain("const activeSessions = createQuery")
    expect(activeSessions).toContain("...listSessionsOptions(")
    expect(activeSessions).toContain("const revokeSession = createMutation")
    expect(activeSessions).toContain("...revokeSessionOptions(auth.authClient)")
    expect(activeSessions).toContain("revokeSession.mutate(activeSession)")
    expect(activeSessions).toContain(
      "auth.localization.settings.revokeSessionSuccess"
    )
    expect(activeSessions).toContain("activeSession.token ===")
    expect(activeSessions).toContain("session.data?.session.token")
    expect(activeSessions).toContain("auth.navigate({")
    expect(activeSessions).toContain("auth.basePaths.auth")
    expect(activeSessions).toContain("auth.viewPaths.auth.signOut")
    expect(activeSession).toContain("auth.localization.auth.signOut")
    expect(activeSession).toContain("auth.localization.settings.revokeSession")
    expect(activeSession).toContain("auth.localization.settings.revoke")
    expect(activeSession).toContain("auth.localization.settings.currentSession")
    expect(activeSession).toContain(
      "Bowser.parse(props.activeSession.userAgent"
    )
    expect(activeSession).toContain("<Smartphone")
    expect(activeSession).toContain("<Monitor")
    expect(activeSession).toContain("<X")
    expect(activeSession).not.toContain(
      "Session revocation is not wired in this Solid slice yet."
    )
    expect(activeSession).not.toMatch(
      /<Button disabled size="sm" type="button" variant="outline">\s*<LogOut \/>\s*Sign out/
    )
  })

  it("wires linked accounts to real Solid account queries and link/unlink parity", () => {
    const linkedAccounts = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/linked-accounts.tsx"
      ),
      "utf8"
    )
    const linkedAccount = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/linked-account.tsx"
      ),
      "utf8"
    )

    expect(linkedAccount).toContain("accountInfoOptions")
    expect(linkedAccount).toContain("linkSocialOptions")
    expect(linkedAccount).toContain("unlinkAccountOptions")
    expect(linkedAccounts).toContain("const linkedAccounts = createQuery")
    expect(linkedAccounts).toContain("...listAccountsOptions(")
    expect(linkedAccounts).toContain('providerId !== "credential"')
    expect(linkedAccounts).toContain("<LinkedAccountRow")
    expect(linkedAccount).toContain("const accountInfo = createQuery")
    expect(linkedAccount).toContain("...accountInfoOptions(")
    expect(linkedAccount).toContain("account?.accountId")
    expect(linkedAccount).toContain("const linkSocial = createMutation")
    expect(linkedAccount).toContain("...linkSocialOptions(auth.authClient)")
    expect(linkedAccount).toContain("provider:")
    expect(linkedAccount).toContain("callbackURL:")
    expect(linkedAccount).toContain("window.location.pathname")
    expect(linkedAccount).toContain("const unlinkAccount = createMutation")
    expect(linkedAccount).toContain("...unlinkAccountOptions(auth.authClient)")
    expect(linkedAccount).toContain("accountUnlinked")
    expect(linkedAccount).toContain("providerId: account.providerId")
    expect(linkedAccount).toContain("auth.localization.settings.linkProvider")
    expect(linkedAccount).toContain("auth.localization.settings.unlinkProvider")
    expect(linkedAccount).toContain("auth.localization.settings.link")
    expect(linkedAccount).toContain("Link2Off")
    expect(linkedAccount).not.toContain(
      "link and unlink mutations are not wired in this Solid slice yet."
    )
    expect(linkedAccount).not.toMatch(
      /<Button disabled size="sm" type="button" variant="outline">\s*<Link2 \/>\s*Link/
    )
  })

  it("renders registered security plugin sections with shadcn-like API keys, passkeys, and danger-zone structure", () => {
    const providers = readFileSync(
      resolve(__dirname, "../src/components/providers.tsx"),
      "utf8"
    )
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/components/auth/settings/settings.tsx"),
      "utf8"
    )
    const securitySettings = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/security-settings.tsx"
      ),
      "utf8"
    )

    expect(providers).toContain("deleteUserPlugin")
    expect(securitySettings).toContain('hasAuthPlugin(auth.plugins, "apiKey")')
    expect(securitySettings).toContain('hasAuthPlugin(auth.plugins, "passkey")')
    expect(securitySettings).toContain(
      'hasAuthPlugin(auth.plugins, "deleteUser")'
    )
    const apiKeyFiles = [
      "api-keys.tsx",
      "api-key.tsx",
      "api-key-skeleton.tsx",
      "api-keys-empty.tsx",
      "create-api-key-dialog.tsx",
      "new-api-key-dialog.tsx",
      "delete-api-key-dialog.tsx"
    ]
    const passkeyFiles = [
      "passkeys.tsx",
      "passkey.tsx",
      "passkey-skeleton.tsx",
      "passkeys-empty.tsx",
      "add-passkey-dialog.tsx",
      "delete-passkey-dialog.tsx"
    ]
    const deleteUserFiles = ["danger-zone.tsx", "delete-user.tsx"]

    for (const file of apiKeyFiles) {
      expect(
        existsSync(
          resolve(__dirname, `../src/components/auth/api-key/${file}`)
        ),
        file
      ).toBe(true)
    }

    for (const file of passkeyFiles) {
      expect(
        existsSync(
          resolve(__dirname, `../src/components/auth/passkey/${file}`)
        ),
        file
      ).toBe(true)
    }

    for (const file of deleteUserFiles) {
      expect(
        existsSync(
          resolve(__dirname, `../src/components/auth/delete-user/${file}`)
        ),
        file
      ).toBe(true)
    }

    const apiKeys = readFileSync(
      resolve(__dirname, "../src/components/auth/api-key/api-keys.tsx"),
      "utf8"
    )
    const apiKey = readFileSync(
      resolve(__dirname, "../src/components/auth/api-key/api-key.tsx"),
      "utf8"
    )
    const apiKeysEmpty = readFileSync(
      resolve(__dirname, "../src/components/auth/api-key/api-keys-empty.tsx"),
      "utf8"
    )
    const createApiKeyDialog = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/api-key/create-api-key-dialog.tsx"
      ),
      "utf8"
    )
    const newApiKeyDialog = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/api-key/new-api-key-dialog.tsx"
      ),
      "utf8"
    )
    const deleteApiKeyDialog = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/api-key/delete-api-key-dialog.tsx"
      ),
      "utf8"
    )
    const passkeys = readFileSync(
      resolve(__dirname, "../src/components/auth/passkey/passkeys.tsx"),
      "utf8"
    )
    const passkey = readFileSync(
      resolve(__dirname, "../src/components/auth/passkey/passkey.tsx"),
      "utf8"
    )
    const passkeysEmpty = readFileSync(
      resolve(__dirname, "../src/components/auth/passkey/passkeys-empty.tsx"),
      "utf8"
    )
    const addPasskeyDialog = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/passkey/add-passkey-dialog.tsx"
      ),
      "utf8"
    )
    const deletePasskeyDialog = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/passkey/delete-passkey-dialog.tsx"
      ),
      "utf8"
    )
    const dangerZone = readFileSync(
      resolve(__dirname, "../src/components/auth/delete-user/danger-zone.tsx"),
      "utf8"
    )
    const deleteUser = readFileSync(
      resolve(__dirname, "../src/components/auth/delete-user/delete-user.tsx"),
      "utf8"
    )

    expect(securitySettings).toContain(
      'from "@/components/auth/api-key/api-keys"'
    )
    expect(settingsComponents).not.toContain("apiKeys: ApiKeysSettings")
    expect(settingsComponents).not.toContain("function ApiKeysSettings")
    expect(settingsComponents).not.toContain("function ApiKeyRow")
    expect(settingsComponents).not.toContain("function CreateApiKeyDialog")
    expect(settingsComponents).not.toContain("function NewApiKeyDialog")
    expect(settingsComponents).not.toContain("function DeleteApiKeyDialog")
    expect(apiKeys).toContain("listApiKeysOptions")
    expect(apiKeys).toContain("apiKeyLocalization.apiKeys")
    expect(apiKeys).toContain("<CreateApiKeyDialog")
    expect(apiKeys).toContain("<ApiKey")
    expect(apiKeys).toContain("<ApiKeySkeleton")
    expect(apiKeys).toContain("<ApiKeysEmpty")
    expect(apiKey).toContain("apiKeyLocalization.deleteApiKey")
    expect(apiKey).toContain("<DeleteApiKeyDialog")
    expect(createApiKeyDialog).toContain("createApiKeyOptions")
    expect(createApiKeyDialog).toContain("<NewApiKeyDialog")
    expect(newApiKeyDialog).toContain("apiKeyLocalization.newApiKey")
    expect(deleteApiKeyDialog).toContain("deleteApiKeyOptions")
    expect(securitySettings).toContain(
      'from "@/components/auth/passkey/passkeys"'
    )
    expect(settingsComponents).not.toContain("passkeys: PasskeysSettings")
    expect(settingsComponents).not.toContain("function PasskeysSettings")
    expect(settingsComponents).not.toContain("function PasskeyRow")
    expect(settingsComponents).not.toContain("function AddPasskeyDialog")
    expect(settingsComponents).not.toContain("function DeletePasskeyDialog")
    expect(passkeys).toContain("listPasskeysOptions")
    expect(addPasskeyDialog).toContain("addPasskeyOptions")
    expect(deletePasskeyDialog).toContain("deletePasskeyOptions")
    expect(passkeys).toContain("<AddPasskeyDialog")
    expect(passkey).toContain("<DeletePasskeyDialog")
    expect(apiKeys).toContain("apiKeyLocalization.createApiKey")
    expect(apiKeysEmpty).toContain("apiKeyLocalization.noApiKeys")
    expect(passkeys).toContain("passkeyLocalization.passkeys")
    expect(passkeys).toContain("passkeyLocalization.addPasskey")
    expect(passkeysEmpty).toContain("passkeyLocalization.noPasskeys")
    expect(securitySettings).toContain(
      'from "@/components/auth/delete-user/danger-zone"'
    )
    expect(settingsComponents).not.toContain("dangerZone: DangerZone")
    expect(settingsComponents).not.toContain("function DangerZoneSettings")
    expect(settingsComponents).not.toContain("function DeleteUserSettings")
    expect(dangerZone).toContain("DangerZone")
    expect(dangerZone).toContain("auth.localization.settings.dangerZone")
    expect(dangerZone).toContain("<DeleteUser")
    expect(deleteUser).toContain("deleteUserLocalization")
    expect(deleteUser).toContain("text-destructive")
    expect(settingsComponents).not.toMatch(
      /<Button class="shrink-0" disabled size="sm" type="button">\s*Create API key/
    )
    expect(settingsComponents).not.toMatch(
      /<Button disabled size="sm" type="button" variant="secondary">\s*Create API key/
    )
    expect(settingsComponents).not.toContain(
      '<p class="text-muted-foreground text-xs">API key</p>'
    )
    expect(settingsComponents).not.toMatch(
      /<Button class="shrink-0" disabled size="sm" type="button">\s*Add passkey/
    )
    expect(settingsComponents).not.toMatch(
      /<Button disabled size="sm" type="button" variant="secondary">\s*Add passkey/
    )
  })

  it("provides the local Solid Zaidan Dialog primitive for extracted auth dialogs", () => {
    const dialogPath = resolve(__dirname, "../src/components/ui/dialog.tsx")
    const createApiKeyDialog = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/api-key/create-api-key-dialog.tsx"
      ),
      "utf8"
    )
    const deleteUser = readFileSync(
      resolve(__dirname, "../src/components/auth/delete-user/delete-user.tsx"),
      "utf8"
    )

    expect(existsSync(dialogPath)).toBe(true)

    const dialog = readFileSync(dialogPath, "utf8")

    expect(dialog).toContain('from "@kobalte/core/dialog"')
    expect(dialog).toContain("DialogPrimitive.Root")
    expect(dialog).toContain("DialogPrimitive.Trigger")
    expect(dialog).toContain("DialogPrimitive.Content")
    expect(dialog).toContain("DialogPrimitive.Title")
    expect(dialog).toContain("DialogPrimitive.Description")
    expect(dialog).toContain("DialogPrimitive.CloseButton")
    expect(dialog).toContain('data-slot="dialog-content"')
    expect(dialog).toContain("showCloseButton")
    expect(dialog).toMatch(
      /export \{[\s\S]*Dialog[\s\S]*DialogClose[\s\S]*DialogContent[\s\S]*DialogDescription[\s\S]*DialogFooter[\s\S]*DialogHeader[\s\S]*DialogTitle[\s\S]*DialogTrigger/
    )
    expect(createApiKeyDialog).toContain('from "@/components/ui/dialog"')
    expect(deleteUser).toContain('from "@/components/ui/dialog"')
  })

  it("wires API key create, new-key reveal, copy, and delete dialogs to Solid mutations", () => {
    const createApiKeyDialog = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/api-key/create-api-key-dialog.tsx"
      ),
      "utf8"
    )
    const newApiKeyDialog = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/api-key/new-api-key-dialog.tsx"
      ),
      "utf8"
    )
    const deleteApiKeyDialog = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/api-key/delete-api-key-dialog.tsx"
      ),
      "utf8"
    )

    expect(createApiKeyDialog).toContain("const createApiKey = createMutation")
    expect(createApiKeyDialog).toContain(
      "...createApiKeyOptions(auth.authClient as ApiKeyAuthClient)"
    )
    expect(createApiKeyDialog).toContain("createApiKey.mutate(")
    expect(createApiKeyDialog).toContain("setNewApiKeySecret(result.key)")
    expect(createApiKeyDialog).toContain("setIsNewKeyDialogOpen(true)")
    expect(newApiKeyDialog).toContain("navigator.clipboard.writeText")
    expect(newApiKeyDialog).toContain("setIsCopied(true)")
    expect(newApiKeyDialog).toContain("setTimeout(() => setIsCopied(false)")
    expect(deleteApiKeyDialog).toContain("const deleteApiKey = createMutation")
    expect(deleteApiKeyDialog).toContain(
      "...deleteApiKeyOptions(auth.authClient as ApiKeyAuthClient)"
    )
    expect(deleteApiKeyDialog).toContain("deleteApiKey.mutate({")
    expect(deleteApiKeyDialog).toContain("keyId: props.apiKey.id")
    expect(deleteApiKeyDialog).toContain("onOpenChange(false)")
    expect(deleteApiKeyDialog).toContain("apiKey.start")
    expect(deleteApiKeyDialog).toContain('"*".repeat(16)')
    expect(deleteApiKeyDialog).toContain(
      "apiKeyLocalization.deleteApiKeyWarning"
    )
    expect(newApiKeyDialog).toContain("apiKeyLocalization.newApiKeyWarning")
    expect(newApiKeyDialog).toContain(
      "auth.localization.settings.copyToClipboard"
    )
    expect(newApiKeyDialog).toContain("apiKeyLocalization.dismissNewKey")
  })

  it("wires passkey list, add, and delete dialogs to Solid passkey mutations", () => {
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/components/auth/settings/settings.tsx"),
      "utf8"
    )
    const securitySettings = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/security-settings.tsx"
      ),
      "utf8"
    )

    const passkeys = readFileSync(
      resolve(__dirname, "../src/components/auth/passkey/passkeys.tsx"),
      "utf8"
    )
    const passkey = readFileSync(
      resolve(__dirname, "../src/components/auth/passkey/passkey.tsx"),
      "utf8"
    )
    const addPasskeyDialog = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/passkey/add-passkey-dialog.tsx"
      ),
      "utf8"
    )
    const deletePasskeyDialog = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/passkey/delete-passkey-dialog.tsx"
      ),
      "utf8"
    )

    expect(securitySettings).toContain(
      'from "@/components/auth/passkey/passkeys"'
    )
    expect(passkeys).toContain("passkeyLocalization")
    const settingsTypes = readFileSync(
      resolve(__dirname, "../src/components/auth/settings/shared/types.ts"),
      "utf8"
    )

    expect(settingsTypes).toContain("export type ListedPasskey")
    expect(passkeys).toContain("const [isAddDialogOpen")
    expect(addPasskeyDialog).toContain("const addPasskey = createMutation")
    expect(addPasskeyDialog).toContain(
      "...addPasskeyOptions(auth.authClient as PasskeyAuthClient)"
    )
    expect(passkeys).toContain("onPasskeyAdded={() => passkeys.refetch()}")
    expect(addPasskeyDialog).toContain("props.onPasskeyAdded()")
    expect(addPasskeyDialog).toContain("addPasskey.mutate(")
    expect(addPasskeyDialog).toContain("name ? { name } : undefined")
    expect(addPasskeyDialog).toContain("props.onOpenChange(false)")
    expect(deletePasskeyDialog).toContain(
      "const deletePasskey = createMutation"
    )
    expect(deletePasskeyDialog).toContain(
      "...deletePasskeyOptions(auth.authClient as PasskeyAuthClient)"
    )
    expect(deletePasskeyDialog).toContain("deletePasskey.mutate({")
    expect(deletePasskeyDialog).toContain("id: props.passkey.id")
    expect(passkey).toContain("passkeyLocalization.deletePasskey.replace")
    expect(deletePasskeyDialog).toContain(
      "passkeyLocalization.deletePasskeyTitle"
    )
    expect(deletePasskeyDialog).toContain(
      "passkeyLocalization.deletePasskeyWarning"
    )
    expect(addPasskeyDialog).toContain("passkeyLocalization.name")
    expect(addPasskeyDialog).toContain("auth.localization.settings.optional")
    expect(deletePasskeyDialog).toContain("auth.localization.settings.cancel")
    expect(passkey).toContain("Fingerprint")
    expect(settingsComponents).not.toContain("Loading passkeys…")
    expect(passkey).not.toMatch(
      /<Button disabled size="sm" type="button" variant="outline">\s*Revoke/
    )
  })

  it("wires delete-user danger-zone dialog to Solid mutation parity", () => {
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/components/auth/settings/settings.tsx"),
      "utf8"
    )
    const securitySettings = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/security-settings.tsx"
      ),
      "utf8"
    )
    const dangerZone = readFileSync(
      resolve(__dirname, "../src/components/auth/delete-user/danger-zone.tsx"),
      "utf8"
    )
    const deleteUser = readFileSync(
      resolve(__dirname, "../src/components/auth/delete-user/delete-user.tsx"),
      "utf8"
    )

    expect(securitySettings).toContain(
      'from "@/components/auth/delete-user/danger-zone"'
    )
    expect(settingsComponents).not.toContain("authQueryKeys")
    expect(settingsComponents).not.toContain("deleteUserLocalization")
    expect(settingsComponents).not.toContain("deleteUserOptions")
    expect(settingsComponents).not.toContain("useQueryClient")
    expect(deleteUser).toContain("authQueryKeys")
    expect(deleteUser).toContain("deleteUserLocalization")
    expect(deleteUser).toContain("deleteUserOptions")
    expect(deleteUser).toContain("useQueryClient")
    expect(deleteUser).toContain("const queryClient = useQueryClient()")
    expect(securitySettings).toContain("<DangerZone />")
    expect(settingsComponents).not.toContain("dangerZone: DangerZone")
    expect(settingsComponents).not.toContain("function DeleteUserSettings")
    expect(dangerZone).toContain("auth.localization.settings.dangerZone")
    expect(dangerZone).toContain("<DeleteUser />")
    expect(deleteUser).toContain("const accounts = createQuery")
    expect(deleteUser).toContain(
      "...listAccountsOptions(auth.authClient, userId())"
    )
    expect(deleteUser).toContain('providerId === "credential"')
    expect(deleteUser).toContain("const needsPassword = () =>")
    expect(deleteUser).toContain("deleteUserOptions(auth.authClient)")
    expect(deleteUser).toContain(
      "deleteUserLocalization.deleteUserVerificationSent"
    )
    expect(deleteUser).toContain("deleteUserLocalization.deleteUserSuccess")
    expect(deleteUser).toContain(
      "queryClient.removeQueries({ queryKey: authQueryKeys.all })"
    )
    expect(deleteUser).toContain("auth.viewPaths.auth.signIn")
    expect(deleteUser).toContain('setPassword("")')
    expect(deleteUser).toContain('name="password"')
    expect(deleteUser).toContain('autocomplete="current-password"')
    expect(deleteUser).toContain("auth.localization.auth.passwordPlaceholder")
    expect(deleteUser).toContain("TriangleAlert")
    expect(deleteUser).toContain('variant="destructive"')
    expect(deleteUser).toContain("auth.localization.settings.cancel")
    expect(deleteUser).not.toMatch(
      /<Button disabled size="sm" type="button" variant="destructive">\s*Delete user/
    )
  })
})
