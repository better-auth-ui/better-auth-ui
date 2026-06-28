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
    expect(authRoute).toContain('from "@/lib/auth/magic-link-plugin"')
    expect(authRoute).toContain("validAuthPathSegments")
    expect(authRoute).toContain("Object.values(viewPaths.auth)")
    expect(authRoute).toContain(
      "Object.values(magicLinkPlugin().viewPaths.auth)"
    )
    expect(authRoute).toContain("if (!validAuthPathSegments.has(path))")
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

    expect(providers).toContain("useNavigate")
    expect(providers).toContain("@tanstack/solid-router")
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
    expect(providers).toContain('from "@/lib/auth/multi-session-plugin"')
    expect(providers).toContain("multiSessionPlugin()")
    expect(providers).not.toContain(
      'multiSessionPlugin\n} from "@better-auth-ui/core/plugins/delete-user"'
    )
    expect(providers).toContain("apiKeyPlugin({ organization: true })")
    expect(providers).toContain("passkeyPlugin()")
    expect(providers).toContain('from "@/lib/auth/api-key-plugin"')
    expect(providers).toContain('from "@/lib/auth/passkey-plugin"')
    expect(providers).toContain("deleteUserPlugin()")
    expect(providers).toContain("usernamePlugin()")
    expect(providers).toContain("magicLinkPlugin()")
    expect(providers).toContain('from "@/lib/auth/magic-link-plugin"')
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

  it("drives the organization plugin from the current route slug", () => {
    const providers = readFileSync(
      resolve(__dirname, "../src/components/providers.tsx"),
      "utf8"
    )

    expect(providers).toContain(
      'import { useNavigate, useParams } from "@tanstack/solid-router"'
    )
    expect(providers).toContain("useParams({ strict: false })")
    expect(providers).toContain('typeof slug === "string"')
    expect(providers).toContain("return null")
    expect(providers).toContain(
      "organizationPlugin({ slug: organizationSlug() })"
    )
    expect(providers).not.toContain("organizationPlugin()}")
    expect(providers).toContain(
      '<Show keyed when={organizationSlug() ?? "personal"}>'
    )
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

  it("surfaces magic-link through provider wiring and plugin auth-route support", () => {
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

    expect(authRoute).toContain("magicLinkPlugin().viewPaths.auth")
    expect(authRoute).toContain("validAuthPathSegments")
    expect(authComponent).toContain("plugin.views?.auth")
    expect(authComponent).toContain("plugin.fallbackViews?.auth?.signIn")
    expect(signInUsername).toContain(".flatMap(")
    expect(signInUsername).toContain('view="signIn"')
    expect(providers).toContain("magicLinkPlugin()")
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

    expect(signIn).toContain("authQueryKeys")
    expect(signIn).toContain("useSignInEmail")
    expect(signIn).toContain('from "@better-auth-ui/core"')
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

    expect(signUp).toContain("authQueryKeys")
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
    expect(sharedHelpers).not.toContain("shouldLoadAccounts")
    expect(sharedHelpers).not.toContain("shouldLoadDeviceSessions")
    expect(sharedHelpers).not.toContain("shouldLoadLinkedAccounts")
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
    expect(settingsRoute).toContain("validSettingsPaths")
    expect(settingsRoute).toContain("organizationPlugin().viewPaths.settings")
    expect(settingsRoute).toContain("if (!validSettingsPaths.includes(path))")
    expect(settingsRoute).toContain("throw notFound()")
    expect(settingsRoute).toContain("async beforeLoad")
    expect(settingsRoute).toContain("createIsomorphicFn()")
    expect(settingsRoute).toContain("ensureSessionServer")
    expect(settingsRoute).toContain("ensureSession")
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
    ).toContain("useListDeviceSessions")
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
    const changePassword = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/change-password.tsx"
      ),
      "utf8"
    )
    const dangerZone = readFileSync(
      resolve(__dirname, "../src/components/auth/delete-user/danger-zone.tsx"),
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
      activeSessions
    ]) {
      expect(source).toContain("useSession")
      expect(source).toContain("const session = useSession(auth.authClient")
    }
  })

  it("keeps Settings runtime and standalone registry parity fixes", () => {
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
    const changeEmail = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/account/change-email.tsx"
      ),
      "utf8"
    )
    const manifest = readFileSync(
      resolve(__dirname, "../registry.manifest.ts"),
      "utf8"
    )

    expect(accountSettings).toContain("showChangeEmail")
    expect(accountSettings).toContain("auth.emailAndPassword?.enabled")
    expect(accountSettings).toContain('plugin.id === "magicLink"')
    expect(accountSettings).toContain("<Show when={showChangeEmail()}>")
    expect(securitySettings).not.toContain("<PasskeysSettings />")
    expect(securitySettings).not.toContain(
      'hasAuthPlugin(auth.plugins, "passkey")'
    )
    expect(securitySettings).toContain("plugin as SecurityCardsPlugin")
    expect(securitySettings).toContain("securityCards")
    expect(changeEmail).toContain("changeEmailSuccess")
    expect(manifest).toContain(
      'componentFile("src/components/auth/settings/shared/helpers.ts")'
    )
    expect(manifest).toContain(
      'componentFile("src/components/auth/settings/shared/types.ts")'
    )
    expect(manifest).toContain('"@zaidan/skeleton"')
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

  it("wires Theme through the local plugin instead of hard-coded user/account surfaces", () => {
    const providers = readFileSync(
      resolve(__dirname, "../src/components/providers.tsx"),
      "utf8"
    )
    const userButton = readFileSync(
      resolve(__dirname, "../src/components/auth/user/user-button.tsx"),
      "utf8"
    )
    const accountSettings = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/account/account-settings.tsx"
      ),
      "utf8"
    )
    const appearanceSettings = readFileSync(
      resolve(__dirname, "../src/components/auth/theme/appearance.tsx"),
      "utf8"
    )
    const themeToggleItem = readFileSync(
      resolve(__dirname, "../src/components/auth/theme/theme-toggle-item.tsx"),
      "utf8"
    )
    const themePluginPath = resolve(
      __dirname,
      "../src/lib/auth/theme-plugin.ts"
    )
    const themePlugin = existsSync(themePluginPath)
      ? readFileSync(themePluginPath, "utf8")
      : ""

    expect(existsSync(themePluginPath)).toBe(true)
    expect(themePlugin).toContain("export const themePlugin")
    const themePluginState = readFileSync(
      resolve(__dirname, "../src/components/auth/theme/theme-plugin-state.ts"),
      "utf8"
    )

    expect(themePlugin).toContain("ThemePluginOptions")
    expect(themePlugin).toContain("ThemeLocalization")
    expect(themePlugin).toContain("userMenuItems: [ThemeToggleItem]")
    expect(themePlugin).toContain("accountCards: [Appearance]")
    expect(themePlugin).toContain("theme: options.theme")
    expect(themePlugin).not.toContain("readStoredThemePreference")
    expect(themePluginState).toContain('typeof window === "undefined"')
    expect(themePluginState).toContain("readInitialThemePreference")

    expect(providers).toContain('from "@/lib/auth/theme-plugin"')
    expect(providers).toContain("themePlugin()")
    expect(providers).not.toContain('themePlugin } from "@better-auth-ui/core')

    expect(userButton).not.toContain(
      'from "@/components/auth/theme/theme-toggle-item"'
    )
    expect(userButton).not.toContain("<ThemeToggleItem />")
    expect(userButton).toContain("pluginUserMenuItems")
    expect(userButton).toContain("plugin.userMenuItems")

    expect(accountSettings).not.toContain(
      'from "@/components/auth/theme/appearance"'
    )
    expect(accountSettings).not.toContain("<Appearance />")
    expect(accountSettings).toContain("pluginAccountCards")
    expect(accountSettings).toContain("plugin.accountCards")

    expect(appearanceSettings).toContain("export type AppearanceProps")
    expect(appearanceSettings).toContain("class?: string")
    expect(appearanceSettings).not.toContain("className")
    expect(appearanceSettings).toContain("resolveThemePluginState")
    expect(appearanceSettings).toContain("themes")
    expect(appearanceSettings).not.toContain('label: "System"')
    expect(appearanceSettings).not.toContain('label: "Light"')
    expect(appearanceSettings).not.toContain('label: "Dark"')

    expect(themeToggleItem).toContain("ThemeToggleItemProps")
    expect(themeToggleItem).toContain("class?: string")
    expect(themeToggleItem).toContain("resolveThemePluginState")
    expect(themeToggleItem).toContain("themes")
    expect(themeToggleItem).not.toContain('aria-label="System"')
    expect(themeToggleItem).not.toContain('aria-label="Light"')
    expect(themeToggleItem).not.toContain('aria-label="Dark"')
  })

  it("provides canonical shadcn-like Solid auth wrapper files without changing behavior", () => {
    const canonicalWrappers = [
      {
        expected: "export function ThemeToggleItem",
        file: "theme/theme-toggle-item.tsx"
      },
      {
        expected: "export function Appearance",
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
        expected: 'export { Appearance } from "../../theme/appearance"',
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
    expect(userButton).not.toContain(
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

    expect(accountSettings).not.toContain(
      'from "@/components/auth/theme/appearance"'
    )
    expect(accountSettings).toContain("useAuth")
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

  it("wires multi-session through a local Solid plugin wrapper and plugin account cards", () => {
    const providers = readFileSync(
      resolve(__dirname, "../src/components/providers.tsx"),
      "utf8"
    )
    const multiSessionPlugin = readFileSync(
      resolve(__dirname, "../src/lib/auth/multi-session-plugin.ts"),
      "utf8"
    )
    const accountSettings = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/account/account-settings.tsx"
      ),
      "utf8"
    )

    expect(providers).toContain('from "@/lib/auth/multi-session-plugin"')
    expect(multiSessionPlugin).toContain("createAuthPlugin")
    expect(multiSessionPlugin).toContain("coreMultiSessionPlugin.id")
    expect(multiSessionPlugin).toContain("accountCards: [ManageAccounts]")
    expect(multiSessionPlugin).toContain(
      "userMenuItems: [SwitchAccountSubmenu]"
    )
    expect(accountSettings).not.toContain(
      'from "@/components/auth/multi-session/manage-accounts"'
    )
    expect(accountSettings).toContain("useAuth")
    expect(accountSettings).toContain("auth.plugins")
    expect(accountSettings).toContain("plugin.accountCards")
    expect(accountSettings).not.toContain("<ManageAccounts />")
  })

  it("adds a real multi-session switch-account submenu and user-button plugin menu rendering", () => {
    const switchAccountSubmenuPath = resolve(
      __dirname,
      "../src/components/auth/multi-session/switch-account-submenu.tsx"
    )
    const switchAccountSubmenuContentPath = resolve(
      __dirname,
      "../src/components/auth/multi-session/switch-account-submenu-content.tsx"
    )
    const switchAccountSubmenuItemPath = resolve(
      __dirname,
      "../src/components/auth/multi-session/switch-account-submenu-item.tsx"
    )

    expect(existsSync(switchAccountSubmenuPath)).toBe(true)
    expect(existsSync(switchAccountSubmenuContentPath)).toBe(true)
    expect(existsSync(switchAccountSubmenuItemPath)).toBe(true)

    const switchAccountSubmenu = readFileSync(switchAccountSubmenuPath, "utf8")
    const switchAccountSubmenuContent = readFileSync(
      switchAccountSubmenuContentPath,
      "utf8"
    )
    const switchAccountSubmenuItem = readFileSync(
      switchAccountSubmenuItemPath,
      "utf8"
    )
    const userButton = readFileSync(
      resolve(__dirname, "../src/components/auth/user/user-button.tsx"),
      "utf8"
    )

    expect(switchAccountSubmenu).toContain(
      "export type SwitchAccountSubmenuProps = {"
    )
    expect(switchAccountSubmenu).toContain("class?: string")
    expect(switchAccountSubmenu).toContain("useAuth")
    expect(switchAccountSubmenu).toContain("useSession")
    expect(switchAccountSubmenu).toContain("coreMultiSessionPlugin.id")
    expect(switchAccountSubmenu).toContain("multiSessionLocalization")
    expect(switchAccountSubmenu).toContain("DropdownMenuSub")
    expect(switchAccountSubmenu).toContain("DropdownMenuSubTrigger")
    expect(switchAccountSubmenu).toContain("<SwitchAccountSubmenuContent />")
    expect(switchAccountSubmenu).not.toContain("return null")
    expect(switchAccountSubmenu).not.toContain(
      "Placeholder for Multi Session submenu wiring"
    )

    expect(switchAccountSubmenuContent).toContain("useListDeviceSessions")
    expect(switchAccountSubmenuContent).not.toContain("createQuery")
    expect(switchAccountSubmenuContent).not.toContain(
      "shouldLoadDeviceSessions"
    )
    expect(switchAccountSubmenuContent).toContain("DropdownMenuSubContent")
    expect(switchAccountSubmenuContent).toContain("SwitchAccountSubmenuItem")
    expect(switchAccountSubmenuContent).toContain('to="/auth/$path"')
    expect(switchAccountSubmenuContent).toContain("auth.viewPaths.auth.signIn")
    expect(switchAccountSubmenuContent).toContain("CirclePlus")

    expect(switchAccountSubmenuItem).toContain(
      "export type SwitchAccountSubmenuItemProps = {"
    )
    expect(switchAccountSubmenuItem).toContain("deviceSession: DeviceSession")
    expect(switchAccountSubmenuItem).toContain("useSetActiveSession")
    expect(switchAccountSubmenuItem).toContain("useSetActiveSession")
    expect(switchAccountSubmenuItem).toContain("window.scrollTo({ top: 0 })")
    expect(switchAccountSubmenuItem).toContain(
      "disabled={setActiveSession.isPending}"
    )
    expect(switchAccountSubmenuItem).toContain("LoaderCircle")

    expect(userButton).toContain("pluginUserMenuItems")
    expect(userButton).toContain("auth.plugins")
    expect(userButton).toContain("plugin.userMenuItems")
    expect(userButton).toContain("component={item.UserMenuItem}")
    expect(userButton).toContain("z-dropdown-menu-item-auth")
    expect(userButton).toContain("px-3.5 py-3")
    expect(userButton).not.toContain("<ThemeToggleItem />")
    expect(userButton).toContain("auth.localization.auth.signOut")
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
    expect(signInUsername).toContain("useSignInUsername")
    expect(signInUsername).toContain("authQueryKeys.session")
    expect(userProfile).toContain(
      'from "@/components/auth/settings/account/change-avatar"'
    )
    expect(userProfile).toContain("<ChangeAvatar")
    expect(userProfile).not.toContain("handleAvatarFileChange")
    expect(changeAvatar).toContain("fileToBase64")
    expect(changeAvatar).toContain("useUpdateUser")
    expect(changeAvatar).toContain("avatarChangedSuccess")
    expect(providerButton).toContain("auth.authClient.signIn.social")
    expect(providerButton).toContain("resolveSocialAuthParams")
    expect(providerButton).toContain("getProviderName")
    expect(providerButtons).toContain("ProviderButton")
    expect(providerButtons).toContain('SocialLayout = "auto"')
    expect(additionalField).toContain("resolveInputType")
    expect(additionalField).toContain("field.render")
    expect(passkeyButton).toContain("useSignInPasskey")
    expect(passkeyButton).toContain('view === "signUp"')
    expect(magicLink).toContain("useSignInMagicLink")
    expect(magicLink).toContain("type MagicLinkLocalization")
    expect(magicLink).toContain("magicLinkLocalization")
    expect(magicLink).toContain("coreMagicLinkPlugin.id")
    expect(magicLink).toContain("class?: string")
    expect(magicLink).not.toContain("className?: string")
    expect(magicLink).toContain('class={cn("w-full max-w-sm", props.class)}')
    expect(magicLink).toContain("magicLinkLabels().sendMagicLink")
    expect(magicLink).toContain("magicLinkLabels().magicLinkSent")
    expect(magicLink).toContain('view="magicLink"')
    expect(magicLink).toContain("auth.plugins as AuthPluginWithButtons[]")
    expect(magicLinkButton).toContain('view === "magicLink"')
    expect(magicLinkButton).toContain("type MagicLinkLocalization")
    expect(magicLinkButton).toContain("magicLinkLocalization")
    expect(magicLinkButton).toContain("coreMagicLinkPlugin.id")
    expect(magicLinkButton).toContain(
      "coreMagicLinkPlugin().viewPaths.auth.magicLink"
    )
    expect(magicLinkButton).toContain("authMutationKeys")
    expect(magicLinkButton).toContain("useIsMutating")
    expect(magicLinkButton).toContain(
      "mutationKey: authMutationKeys.signIn.all"
    )
    expect(magicLinkButton).toContain("aria-disabled")
    expect(magicLinkButton).toContain("event.preventDefault()")
    expect(magicLinkButton).toContain("magicLinkLabels().magicLink")
    expect(magicLinkButton).not.toContain('"Magic Link"')
    expect(magicLinkButton).not.toContain("className")
    expect(magicLink).not.toContain("className")
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

  it("wires captcha slots and fetch options into protected Solid auth forms", () => {
    const signUp = readFileSync(
      resolve(__dirname, "../src/components/auth/sign-up.tsx"),
      "utf8"
    )
    const signInUsername = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/username/sign-in-username.tsx"
      ),
      "utf8"
    )
    const forgotPassword = readFileSync(
      resolve(__dirname, "../src/components/auth/forgot-password.tsx"),
      "utf8"
    )

    for (const source of [signUp, signInUsername, forgotPassword]) {
      expect(source).toContain("useFetchOptions")
      expect(source).toContain("fetchOptions: fetchOptions()")
      expect(source).toContain("resetFetchOptions()")
      expect(source).toContain("captchaComponent")
      expect(source).toContain("<Show when={captchaComponent()} keyed>")
      expect(source).toContain("{(Captcha) => <Captcha />}")
    }

    expect(signUp).toContain("useSignUpEmail")
    expect(signInUsername).toContain("useSignInEmail")
    expect(signInUsername).toContain("useSignInUsername")
    expect(forgotPassword).toContain("useRequestPasswordReset")
  })

  it("wires additional fields into Solid sign-up and profile submissions", () => {
    const signUp = readFileSync(
      resolve(__dirname, "../src/components/auth/sign-up.tsx"),
      "utf8"
    )
    const userProfile = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/account/user-profile.tsx"
      ),
      "utf8"
    )

    expect(signUp).toContain("parseAdditionalFieldValue")
    expect(signUp).toContain('field.signUp === "above"')
    expect(signUp).toContain('field.signUp && field.signUp !== "above"')
    expect(signUp).toContain("<AdditionalField")
    expect(signUp).toContain("if (!field.signUp || field.readOnly) continue")
    expect(signUp).toContain("await field.validate(value)")
    expect(signUp).toContain("additionalFieldValues[field.name] = value")
    expect(signUp).toContain("...additionalFieldValues")

    expect(userProfile).toContain("parseAdditionalFieldValue")
    expect(userProfile).toContain("field.profile !== false")
    expect(userProfile).toContain("<AdditionalField")
    expect(userProfile).toContain(
      "if (field.profile === false || field.readOnly) continue"
    )
    expect(userProfile).toContain("await field.validate(value)")
    expect(userProfile).toContain("additionalFieldValues[field.name] = value")
    expect(userProfile).toContain("...additionalFieldValues")
    expect(userProfile).toContain(
      "defaultValue: value() as AdditionalFieldValue | null"
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
    expect(settingsComponents).not.toContain("function Appearance")
    expect(settingsComponents).not.toContain("function ManageAccountRow")
    expect(manageAccounts).toContain("useAuth")
    expect(manageAccounts).toContain("session.data?.user.name")
    expect(manageAccounts).toContain("session.data?.user.email")
    expect(accountSettings).toContain("<UserProfile />")
    expect(userProfile).toContain("profileFields")
    expect(userProfile).toContain("AdditionalField")
    expect(userProfile).toContain("auth.localization.settings.userProfile")
    expect(userProfile).toContain("<h2")
    expect(changeEmail).toContain("auth.localization.settings.changeEmail")
    expect(changeEmail).toContain("auth.localization.settings.updateEmail")
    expect(appearanceSettings).toContain("Appearance")
    expect(appearanceSettings).toContain("System")
    expect(appearanceSettings).toContain("Light")
    expect(appearanceSettings).toContain("Dark")
    expect(accountSettings).toContain("plugin.accountCards")
    expect(manageAccounts).toContain("multiSessionLabels().manageAccounts")
    expect(manageAccounts).toContain("<ItemGroup")
    expect(manageAccountRow).toContain("<ItemMedia")
    expect(manageAccountRow).toContain("<ItemContent")
    expect(manageAccountRow).toContain("<ItemTitle")
    expect(manageAccountRow).toContain("<ItemDescription")
    expect(manageAccountRow).toContain("<ItemActions")
    expect(manageAccounts).toContain("<ItemSeparator")
    expect(manageAccountRow).toContain("multiSessionLabels().switchAccount")
    expect(manageAccountRow).toContain("auth.localization.auth.signOut")
    expect(userProfile).toContain("auth.localization.settings.saveChanges")
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

    expect(accountSettings).toContain("plugin.accountCards")
    expect(manageAccounts).toContain("useSetActiveSession")
    expect(manageAccounts).toContain("useRevokeMultiSession")
    expect(manageAccounts).toContain(
      "const setActiveSession = useSetActiveSession"
    )
    expect(manageAccounts).toContain(
      "const revokeMultiSession = useRevokeMultiSession"
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
      "Multi Session switch and sign-out actions are shown but disabled until"
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

    expect(userProfile).toContain("useUpdateUser")
    expect(userProfile).toContain(
      "const { mutate: updateUser, isPending: updateUserPending } = useUpdateUser"
    )
    expect(userProfile).toContain("onSubmit={submitProfile}")
    expect(userProfile).toContain("const formData = new FormData")
    expect(userProfile).toContain('formData.get("name")')
    expect(userProfile).toContain("parseAdditionalFieldValue")
    expect(userProfile).toContain("additionalFieldValues")
    expect(userProfile).toContain("updateUser({")
    expect(userProfile).toContain("name,")
    expect(userProfile).toContain("...additionalFieldValues")
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

    expect(changeEmail).toContain("useChangeEmail")
    expect(changeEmail).toContain("const changeEmail = useChangeEmail")
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
    expect(changeEmail).toContain(
      "toast.success(auth.localization.settings.changeEmailSuccess)"
    )
    expect(changeEmail).not.toContain(
      'toast.success("Email updated successfully")'
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
    expect(linkedAccounts).toContain("<Separator")
    expect(linkedAccounts).not.toContain("<ItemSeparator")
    expect(activeSessions).toContain("<ActiveSessionRow")
    expect(activeSessions).toContain("<Separator")
    expect(activeSessions).not.toContain("<ItemGroup")
    expect(activeSessions).toContain('<Card class="z-card-padding-none">')
    expect(activeSessions).toContain(
      '<CardContent class="z-card-content-padding-none">'
    )
    expect(activeSessions).toContain('<div class="p-4">')
    expect(activeSession).not.toContain("<Card")
    expect(activeSession).not.toContain("<CardContent")
    expect(activeSession).toContain("flex items-center justify-between gap-3")
    expect(activeSession).not.toContain("z-card")
    expect(activeSessions).not.toContain("<ItemSeparator")
    expect(activeSession).toContain("auth.localization.settings.currentSession")
    expect(activeSession).toContain("auth.localization.auth.signOut")
    expect(securitySettings).toContain("auth.plugins.flatMap")
    expect(securitySettings).toContain("securityCards")
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

    expect(changePassword).toContain("useChangePassword")
    expect(changePassword).toContain("useRequestPasswordReset")
    expect(changePassword).toContain("useListAccounts")
    expect(changePassword).toContain("const linkedAccounts = useListAccounts")
    expect(changePassword).toContain('providerId === "credential"')
    expect(changePassword).toContain("requestPasswordReset.mutate")
    expect(changePassword).toContain("session.data.user.email")
    expect(changePassword).toContain("passwordResetEmailSent")
    expect(changePassword).toContain("const changePassword = useChangePassword")
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
      'import { Separator, type SeparatorProps } from "@/components/ui/separator"'
    )
    expect(item).toContain('import { cn } from "@/lib/utils"')
    expect(item).toContain('type ItemVariant = "default" | "outline" | "muted"')
    expect(item).toContain('type ItemSize = "default" | "sm" | "xs"')
    expect(item).toContain(
      'type ItemMediaVariant = "default" | "icon" | "image"'
    )
    expect(item).toContain("const itemVariants =")
    expect(item).toContain("const itemMediaVariants =")
    expect(item).toContain(
      '{ as: "div" as T, variant: "default", size: "default" }'
    )
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
      'export * from "./hooks/queries/use-list-sessions"'
    )
    expect(activeSession).toContain('import Bowser from "bowser"')
    expect(activeSessions).toContain("useListSessions")
    expect(activeSessions).toContain("useRevokeSession")
    expect(activeSessions).toContain("const activeSessions = useListSessions")
    expect(activeSessions).not.toContain("createQuery")
    expect(activeSessions).not.toContain("initialData: undefined")
    expect(activeSessions).toContain("const revokeSession = useRevokeSession")
    expect(activeSessions).toContain("useRevokeSession(auth.authClient")
    expect(activeSessions).toContain("revokeSession.mutate(activeSession)")
    expect(activeSessions).toContain(
      "auth.localization.settings.revokeSessionSuccess"
    )
    expect(activeSessions).toContain("activeSession.id ===")
    expect(activeSessions).toContain("session.data?.session.id")
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

    expect(linkedAccount).toContain("useAccountInfo")
    expect(linkedAccount).toContain("useLinkSocial")
    expect(linkedAccount).toContain("useUnlinkAccount")
    expect(linkedAccounts).toContain("const linkedAccounts = useListAccounts")
    expect(linkedAccounts).not.toContain("createQuery")
    expect(linkedAccounts).not.toContain("initialData: undefined")
    expect(linkedAccounts).toContain('providerId !== "credential"')
    expect(linkedAccounts).toContain("<LinkedAccountRow")
    expect(linkedAccount).toContain("const accountInfo = useAccountInfo")
    expect(linkedAccount).not.toContain("createQuery")
    expect(linkedAccount).not.toContain("initialData: undefined")
    expect(linkedAccount).toContain("account?.accountId")
    expect(linkedAccount).toContain("const linkSocial = useLinkSocial")
    expect(linkedAccount).toContain("useLinkSocial(auth.authClient")
    expect(linkedAccount).toContain("provider:")
    expect(linkedAccount).toContain("callbackURL:")
    expect(linkedAccount).toContain("window.location.pathname")
    expect(linkedAccount).toContain("const unlinkAccount = useUnlinkAccount")
    expect(linkedAccount).toContain("useUnlinkAccount(auth.authClient")
    expect(linkedAccount).toContain("accountUnlinked")
    expect(linkedAccount).toContain("providerId: account.providerId")
    expect(linkedAccount).toContain("auth.localization.settings.linkProvider")
    expect(linkedAccount).toContain("auth.localization.settings.unlinkProvider")
    expect(linkedAccount).toContain("auth.localization.settings.link")
    expect(linkedAccount).toContain("Link2Off")
    expect(linkedAccount).toContain("function GitHubIcon")
    expect(linkedAccount).toContain("function GoogleIcon")
    expect(linkedAccount).toContain("<ProviderIcon")
    expect(linkedAccounts).toContain('<Card class="z-card-padding-none">')
    expect(linkedAccounts).toContain(
      '<CardContent class="z-card-content-padding-none">'
    )
    expect(linkedAccounts).toContain('<div class="p-4">')
    expect(linkedAccount).not.toContain("<Card")
    expect(linkedAccount).not.toContain("<CardContent")
    expect(linkedAccount).toContain("flex items-center justify-between gap-3")
    expect(linkedAccount).not.toContain("z-card")
    expect(linkedAccount).toContain("<Spinner")
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
    expect(securitySettings).not.toContain(
      'hasAuthPlugin(auth.plugins, "passkey")'
    )
    expect(securitySettings).toContain("securityCards")
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
      "delete-api-key-dialog.tsx",
      "organization-api-keys.tsx"
    ]
    const passkeyFiles = [
      "passkeys.tsx",
      "passkey.tsx",
      "passkey-skeleton.tsx",
      "passkeys-empty.tsx",
      "add-passkey-dialog.tsx",
      "delete-passkey-dialog.tsx"
    ]
    const deleteUserFiles = ["danger-zone.tsx", "delete-account.tsx"]

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
    const organizationApiKeys = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/api-key/organization-api-keys.tsx"
      ),
      "utf8"
    )
    const apiKeyPlugin = readFileSync(
      resolve(__dirname, "../src/lib/auth/api-key-plugin.ts"),
      "utf8"
    )
    const authServer = readFileSync(
      resolve(__dirname, "../src/lib/auth.ts"),
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
    const deleteAccount = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/delete-user/delete-account.tsx"
      ),
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
    expect(apiKeys).toContain("useListApiKeys")
    expect(apiKeys).toContain("apiKeyLocalization.apiKeys")
    expect(apiKeys).toContain("<CreateApiKeyDialog")
    expect(apiKeys).toContain("<ApiKey")
    expect(apiKeys).toContain("<ApiKeySkeleton")
    expect(apiKeys).toContain("<ApiKeysEmpty")
    expect(apiKeys).toContain('configId: "organization"')
    expect(apiKeys).toContain("organizationId={props.organizationId}")
    expect(apiKeys).toContain("hideDelete={props.hideDelete}")
    expect(apiKey).toContain("apiKeyLocalization.deleteApiKey")
    expect(apiKey).toContain("<DeleteApiKeyDialog")
    expect(createApiKeyDialog).toContain("useCreateApiKey")
    expect(createApiKeyDialog).toContain('configId: "organization"')
    expect(createApiKeyDialog).toContain("organizationId: props.organizationId")
    expect(createApiKeyDialog).toContain("<NewApiKeyDialog")
    expect(newApiKeyDialog).toContain("apiKeyLocalization.newApiKey")
    expect(deleteApiKeyDialog).toContain("useDeleteApiKey")
    expect(deleteApiKeyDialog).toContain('configId: "organization"')
    expect(organizationApiKeys).toContain("useActiveOrganization")
    expect(organizationApiKeys).toContain("useListOrganizationMembers")
    expect(organizationApiKeys).toContain('member.role === "owner"')
    expect(organizationApiKeys).toContain("<ApiKeys")
    expect(apiKeyPlugin).toContain("coreApiKeyPlugin")
    expect(apiKeyPlugin).toContain("organizationCards: [OrganizationApiKeys]")
    expect(authServer).toContain('{ configId: "default", references: "user" }')
    expect(authServer).toContain(
      '{ configId: "organization", references: "organization" }'
    )
    expect(securitySettings).not.toContain(
      'from "@/components/auth/passkey/passkeys"'
    )
    expect(securitySettings).toContain("securityCards")
    expect(settingsComponents).not.toContain("passkeys: PasskeysSettings")
    expect(settingsComponents).not.toContain("function PasskeysSettings")
    expect(settingsComponents).not.toContain("function PasskeyRow")
    expect(settingsComponents).not.toContain("function AddPasskeyDialog")
    expect(settingsComponents).not.toContain("function DeletePasskeyDialog")
    expect(passkeys).toContain("useListPasskeys")
    expect(addPasskeyDialog).toContain("useAddPasskey")
    expect(deletePasskeyDialog).toContain("useDeletePasskey")
    expect(passkeys).toContain("<AddPasskeyDialog")
    expect(passkey).toContain("<DeletePasskeyDialog")
    expect(apiKeys).toContain("apiKeyLocalization.createApiKey")
    expect(apiKeysEmpty).toContain("apiKeyLocalization.noApiKeys")
    expect(passkeys).toContain("labels().passkeys")
    expect(passkeys).toContain("labels().addPasskey")
    expect(passkeysEmpty).toContain("labels().noPasskeys")
    expect(securitySettings).toContain(
      'from "@/components/auth/delete-user/danger-zone"'
    )
    expect(settingsComponents).not.toContain("dangerZone: DangerZone")
    expect(settingsComponents).not.toContain("function DangerZoneSettings")
    expect(settingsComponents).not.toContain("function DeleteAccountSettings")
    expect(dangerZone).toContain("DangerZone")
    expect(dangerZone).toContain("auth.localization.settings.dangerZone")
    expect(dangerZone).toContain("<DeleteAccount")
    expect(deleteAccount).toContain("deleteUserLocalization")
    expect(deleteAccount).toContain("text-destructive")
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
    const deleteAccount = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/delete-user/delete-account.tsx"
      ),
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
    expect(deleteAccount).toContain('from "@/components/ui/dialog"')
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

    expect(createApiKeyDialog).toContain(
      "const auth = useAuth<ApiKeyAuthClient>()"
    )
    expect(createApiKeyDialog).toContain("const createApiKey = useCreateApiKey")
    expect(createApiKeyDialog).toContain("useCreateApiKey(auth.authClient")
    expect(createApiKeyDialog).not.toMatch(
      /auth\.authClient\s+as\s+ApiKeyAuthClient/
    )
    expect(createApiKeyDialog).toContain("createApiKey.mutate(")
    expect(createApiKeyDialog).toContain("setNewApiKeySecret(apiKey.key)")
    expect(createApiKeyDialog).toContain("setIsNewKeyDialogOpen(true)")
    expect(newApiKeyDialog).toContain("navigator.clipboard.writeText")
    expect(newApiKeyDialog).toContain("setIsCopied(true)")
    expect(newApiKeyDialog).toContain("setTimeout(() => setIsCopied(false)")
    expect(deleteApiKeyDialog).toContain(
      "const auth = useAuth<ApiKeyAuthClient>()"
    )
    expect(deleteApiKeyDialog).toContain("const deleteApiKey = useDeleteApiKey")
    expect(deleteApiKeyDialog).toContain("useDeleteApiKey(auth.authClient")
    expect(deleteApiKeyDialog).not.toMatch(
      /auth\.authClient\s+as\s+ApiKeyAuthClient/
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

  it("keeps passkey localization, class prop, and pending UX aligned with shadcn parity", () => {
    const passkeyLocalizationHelperPath = resolve(
      __dirname,
      "../src/components/auth/passkey/passkey-localization.ts"
    )
    const passkeyFiles = [
      "passkey-button.tsx",
      "passkeys.tsx",
      "passkey.tsx",
      "passkeys-empty.tsx",
      "add-passkey-dialog.tsx",
      "delete-passkey-dialog.tsx"
    ]
    const passkeyButton = readFileSync(
      resolve(__dirname, "../src/components/auth/passkey/passkey-button.tsx"),
      "utf8"
    )
    const passkeys = readFileSync(
      resolve(__dirname, "../src/components/auth/passkey/passkeys.tsx"),
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

    expect(existsSync(passkeyLocalizationHelperPath)).toBe(true)
    if (existsSync(passkeyLocalizationHelperPath)) {
      const passkeyLocalizationHelper = readFileSync(
        passkeyLocalizationHelperPath,
        "utf8"
      )

      expect(passkeyLocalizationHelper).toContain("corePasskeyPlugin.id")
      expect(passkeyLocalizationHelper).toContain("passkeyLocalization")
      expect(passkeyLocalizationHelper).toContain("auth.plugins")
    }

    for (const file of passkeyFiles) {
      const source = readFileSync(
        resolve(__dirname, `../src/components/auth/passkey/${file}`),
        "utf8"
      )

      expect(source).toContain("passkeyLabels")
      expect(source).not.toContain("passkeyLocalization.")
    }

    expect(passkeys).toContain("export type PasskeysSettingsProps")
    expect(passkeys).toContain("class?: string")
    expect(passkeys).not.toContain("className")
    expect(passkeys).toContain('class={cn("flex flex-col gap-3", props.class)}')
    expect(passkeyButton).toContain("useIsMutating")
    expect(passkeyButton).toContain("authMutationKeys.signIn.all")
    expect(passkeyButton).toContain("authMutationKeys.signUp.all")
    expect(passkeyButton).toContain("Spinner")
    expect(addPasskeyDialog).toContain("Spinner")
    expect(deletePasskeyDialog).toContain("Spinner")
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

    expect(securitySettings).not.toContain(
      'from "@/components/auth/passkey/passkeys"'
    )
    expect(securitySettings).toContain("securityCards")
    expect(passkeys).toContain("passkeyLabels")
    const settingsTypes = readFileSync(
      resolve(__dirname, "../src/components/auth/settings/shared/types.ts"),
      "utf8"
    )

    expect(settingsTypes).toContain("export type ListedPasskey")
    expect(passkeys).toContain("const [isAddDialogOpen")
    expect(addPasskeyDialog).toContain(
      "const auth = useAuth<PasskeyAuthClient>()"
    )
    expect(addPasskeyDialog).toContain("const addPasskey = useAddPasskey")
    expect(addPasskeyDialog).toContain("useAddPasskey(auth.authClient")
    expect(addPasskeyDialog).not.toMatch(
      /auth\.authClient\s+as\s+PasskeyAuthClient/
    )
    expect(passkeys).toContain("onPasskeyAdded={() => passkeys.refetch()}")
    expect(addPasskeyDialog).toContain("props.onPasskeyAdded()")
    expect(addPasskeyDialog).toContain("addPasskey.mutate(")
    expect(addPasskeyDialog).toContain("name ? { name } : undefined")
    expect(addPasskeyDialog).toContain("props.onOpenChange(false)")
    expect(deletePasskeyDialog).toContain(
      "const auth = useAuth<PasskeyAuthClient>()"
    )
    expect(deletePasskeyDialog).toContain(
      "const deletePasskey = useDeletePasskey"
    )
    expect(deletePasskeyDialog).toContain("useDeletePasskey(auth.authClient")
    expect(deletePasskeyDialog).not.toMatch(
      /auth\.authClient\s+as\s+PasskeyAuthClient/
    )
    expect(deletePasskeyDialog).toContain("deletePasskey.mutate({")
    expect(deletePasskeyDialog).toContain("id: props.passkey.id")
    expect(passkey).toContain("labels().deletePasskey.replace")
    expect(deletePasskeyDialog).toContain("labels().deletePasskeyTitle")
    expect(deletePasskeyDialog).toContain("labels().deletePasskeyWarning")
    expect(addPasskeyDialog).toContain("labels().name")
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
    const deleteAccount = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/delete-user/delete-account.tsx"
      ),
      "utf8"
    )
    const deleteUserStory = readFileSync(
      resolve(__dirname, "../src/stories/delete-user.stories.tsx"),
      "utf8"
    )

    expect(securitySettings).toContain(
      'from "@/components/auth/delete-user/danger-zone"'
    )
    expect(settingsComponents).not.toContain("authQueryKeys")
    expect(settingsComponents).not.toContain("deleteUserLocalization")
    expect(settingsComponents).not.toContain("useDeleteUser")
    expect(settingsComponents).not.toContain("useQueryClient")
    expect(deleteAccount).toContain("authQueryKeys")
    expect(deleteAccount).toContain("deleteUserLocalization")
    expect(deleteAccount).toContain("useDeleteUser")
    expect(deleteAccount).toContain("useQueryClient")
    expect(deleteAccount).toContain("const queryClient = useQueryClient()")
    expect(securitySettings).toContain("<DangerZone />")
    expect(settingsComponents).not.toContain("dangerZone: DangerZone")
    expect(settingsComponents).not.toContain("function DeleteAccountSettings")
    expect(dangerZone).toContain("export type DangerZoneProps = {")
    expect(dangerZone).toContain("class?: string")
    expect(dangerZone).toContain('import { cn } from "@/lib/utils"')
    expect(dangerZone).toContain(
      "export function DangerZone(props: DangerZoneProps = {})"
    )
    expect(dangerZone).toContain(
      'class={cn("flex w-full flex-col", props.class)}'
    )
    expect(dangerZone).not.toContain("className")
    expect(dangerZone).toContain("auth.localization.settings.dangerZone")
    expect(dangerZone).toContain("<DeleteAccount />")
    expect(deleteAccount).toContain("export type DeleteAccountProps = {")
    expect(deleteAccount).toContain("class?: string")
    expect(deleteAccount).toContain('import { cn } from "@/lib/utils"')
    expect(deleteAccount).toContain(
      "export function DeleteAccount(props: DeleteAccountProps = {})"
    )
    expect(deleteAccount).toContain(
      'class={cn("z-card-padding-none border-destructive", props.class)}'
    )
    expect(deleteAccount).not.toContain("className")
    expect(deleteAccount).toContain("const accounts = useListAccounts")
    expect(deleteAccount).not.toContain("createQuery")
    expect(deleteAccount).not.toContain("initialData: undefined")
    expect(deleteAccount).toContain('providerId === "credential"')
    expect(deleteAccount).toContain("const needsPassword = () =>")
    expect(deleteAccount).toContain("useDeleteUser(auth.authClient")
    expect(deleteAccount).toContain(
      "deleteUserLocalization.deleteUserVerificationSent"
    )
    expect(deleteAccount).toContain("deleteUserLocalization.deleteUserSuccess")
    expect(deleteAccount).toContain(
      "queryClient.removeQueries({ queryKey: authQueryKeys.all })"
    )
    expect(deleteAccount).toContain("auth.viewPaths.auth.signIn")
    expect(deleteAccount).toContain('setPassword("")')
    expect(deleteAccount).toContain('name="password"')
    expect(deleteAccount).toContain('autocomplete="current-password"')
    expect(deleteAccount).toContain(
      "auth.localization.auth.passwordPlaceholder"
    )
    expect(deleteAccount).toContain("TriangleAlert")
    expect(deleteAccount).toContain('variant="destructive"')
    expect(deleteAccount).toContain("auth.localization.settings.cancel")
    expect(deleteAccount).not.toMatch(
      /<Button disabled size="sm" type="button" variant="destructive">\s*Delete user/
    )
    expect(deleteUserStory).toContain('title: "Zaidan/Plugins/Delete User"')
    expect(deleteUserStory).toContain("function DeleteAccountStory()")
    expect(deleteUserStory).toContain("<DangerZone />")
    expect(deleteUserStory).toContain("plugins={[deleteUserPlugin()]}")
    expect(deleteUserStory).toContain("queryClient={queryClient}")
    expect(deleteUserStory).not.toContain("as unknown as AuthClient")
  })

  it("keeps organization slug routes coherent with plugin-provided organization cards", () => {
    const organization = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/organization.tsx"
      ),
      "utf8"
    )
    const organizationSwitcher = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/organization-switcher.tsx"
      ),
      "utf8"
    )
    const organizationRow = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/organization-row.tsx"
      ),
      "utf8"
    )
    const organizationApiKeys = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/api-key/organization-api-keys.tsx"
      ),
      "utf8"
    )
    const activeOrganizationQuery = readFileSync(
      resolve(
        __dirname,
        "../../../packages/solid/src/plugins/organization/hooks/queries/use-active-organization.ts"
      ),
      "utf8"
    )
    const listMembersQuery = readFileSync(
      resolve(
        __dirname,
        "../../../packages/solid/src/plugins/organization/hooks/queries/use-list-members.ts"
      ),
      "utf8"
    )

    expect(organization).toContain("OrganizationSettings")
    expect(organization).not.toContain("organizationSlug: props.slug")
    expect(organization).toContain("/organization/$slug/$path")

    for (const source of [organizationSwitcher, organizationRow]) {
      expect(source).toContain("organizationPlugin.id")
      expect(source).toContain("plugin.slug !== undefined")
      expect(source).toContain('to: "/organization/$slug/$path"')
      expect(source).toContain("setActiveOrganization.mutate")
    }

    expect(organizationApiKeys).toContain("useActiveOrganization")
    expect(organizationApiKeys).toContain("useListOrganizationMembers")
    expect(organizationApiKeys).not.toContain("organizationSlug")
    expect(organizationApiKeys).toContain(
      "organizationId={activeOrganization.data?.id}"
    )
    expect(activeOrganizationQuery).toContain("slug === null")
    expect(activeOrganizationQuery).toContain("async () => null")
    expect(listMembersQuery).toContain("activeOrganization.data?.id")
  })

  it("adds Solid/Zaidan Organization profile settings parity", () => {
    const organization = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/organization.tsx"
      ),
      "utf8"
    )
    const organizationSettings = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/organization-settings.tsx"
      ),
      "utf8"
    )
    const organizationProfile = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/organization-profile.tsx"
      ),
      "utf8"
    )
    const changeLogo = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/change-organization-logo.tsx"
      ),
      "utf8"
    )
    const organizationLogo = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/organization-logo.tsx"
      ),
      "utf8"
    )
    const organizationDangerZone = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/organization-danger-zone.tsx"
      ),
      "utf8"
    )
    const deleteOrganization = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/delete-organization.tsx"
      ),
      "utf8"
    )
    const leaveOrganization = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/leave-organization.tsx"
      ),
      "utf8"
    )
    const deleteOrganizationDialog = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/delete-organization-dialog.tsx"
      ),
      "utf8"
    )

    expect(organization).toContain("OrganizationSettings")
    expect(organization).toContain("SettingsIcon")
    expect(organization).toContain("UsersIcon")
    expect(organization).not.toContain(
      "Organization profile management is intentionally minimal"
    )
    expect(organizationSettings).toContain("OrganizationProfile")
    expect(organizationSettings).toContain("organizationCards")
    expect(organizationSettings).toContain("OrganizationDangerZone")
    expect(organizationProfile).toContain("useActiveOrganization")
    expect(organizationProfile).toContain("useUpdateOrganization")
    expect(organizationProfile).toContain("ChangeOrganizationLogo")
    expect(organizationProfile).toContain("SlugField")
    expect(organizationProfile).toContain("<h2")
    expect(organizationProfile).toContain("mt-1 w-fit")
    expect(organizationProfile).not.toContain("CardDescription")
    expect(organizationProfile).toContain(
      "data: { name: name(), slug: slug() }"
    )
    expect(changeLogo).toContain("OrganizationLogo")
    expect(changeLogo).toContain("logo().enabled")
    expect(changeLogo).toContain("useUpdateOrganization")
    expect(changeLogo).toContain("logo: image")
    expect(changeLogo).toContain('logo: ""')
    expect(organizationLogo).toContain("OrganizationLogoSize")
    expect(organizationLogo).toContain("organization?.logo?.trim()")
    expect(organizationLogo).toContain("Skeleton")
    expect(organizationLogo).toContain('lg: "size-20"')
    expect(organizationLogo).toContain("rounded-full")
    expect(organizationDangerZone).toContain("OrganizationDangerZoneProps")
    expect(organizationDangerZone).toContain("dangerZone")
    expect(organizationDangerZone).toContain("LeaveOrganization")
    expect(organizationDangerZone).toContain("DeleteOrganization")
    expect(organizationDangerZone).toContain("useHasPermission")
    expect(organizationDangerZone).toContain(
      'permissions: { organization: ["delete"] }'
    )
    expect(leaveOrganization).toContain("useLeaveOrganization")
    expect(leaveOrganization).toContain("LeaveOrganizationParams")
    expect(leaveOrganization).toContain("leftOrganization")
    expect(leaveOrganization).toContain("auth.navigate")
    expect(deleteOrganization).toContain("useActiveOrganization")
    expect(deleteOrganization).not.toContain("useHasPermission")
    expect(deleteOrganization).toContain("DeleteOrganizationDialog")
    expect(deleteOrganization).toContain("deleteOrganization")
    expect(deleteOrganization).toContain("deleteOrganizationDescription")
    expect(deleteOrganizationDialog).toContain("useDeleteOrganization")
    expect(deleteOrganizationDialog).toContain("DeleteOrganizationParams")
    expect(deleteOrganizationDialog).toContain(
      "organizationId: props.organization.id"
    )
    expect(deleteOrganizationDialog).toContain("organizationDeleted")
    expect(deleteOrganizationDialog).toContain("auth.navigate")
    expect(deleteOrganizationDialog).toContain("auth.basePaths.settings")
    expect(deleteOrganizationDialog).toContain("replace: true")
  })

  it("adds Solid/Zaidan Organization user invitations settings parity", () => {
    const organizationsSettings = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/organizations-settings.tsx"
      ),
      "utf8"
    )
    const userInvitations = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/user-invitations.tsx"
      ),
      "utf8"
    )
    const userInvitationRow = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/user-invitation-row.tsx"
      ),
      "utf8"
    )
    const userInvitationRowSkeleton = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/user-invitation-row-skeleton.tsx"
      ),
      "utf8"
    )
    const userInvitationsEmpty = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/user-invitations-empty.tsx"
      ),
      "utf8"
    )

    expect(organizationsSettings).toContain("UserInvitations")
    expect(organizationsSettings).toContain("Organizations")
    expect(userInvitations).toContain("UserInvitationsProps")
    expect(userInvitations).toContain("useListUserInvitations")
    expect(userInvitations).toContain("OrganizationAuthClient")
    expect(userInvitations).toContain("UserInvitationRow")
    expect(userInvitations).toContain("UserInvitationRowSkeleton")
    expect(userInvitations).toContain("UserInvitationsEmpty")
    expect(userInvitationRow).toContain("UserInvitationRowProps")
    expect(userInvitationRow).toContain("useAcceptInvitation")
    expect(userInvitationRow).toContain("useRejectInvitation")
    expect(userInvitationRow).toContain("acceptInvitation.mutate")
    expect(userInvitationRow).toContain("rejectInvitation.mutate")
    expect(userInvitationRow).toContain("invitationId: props.invitation.id")
    expect(userInvitationRow).toContain("organizationName")
    expect(userInvitationRow).toContain("organizationLocalization().accept")
    expect(userInvitationRow).toContain(
      "organizationLocalization().rejectInvitation"
    )
    expect(userInvitationRow).not.toContain("Badge")
    expect(userInvitationRow).not.toContain("Spinner")
    expect(userInvitations).not.toContain("<Table")
    expect(userInvitations).not.toContain("InputGroup")
    expect(userInvitationRowSkeleton).toContain("Skeleton")
    expect(userInvitationsEmpty).toContain("noInvitations")
    expect(userInvitationsEmpty).toContain("userInvitationsEmptyDescription")
  })

  it("adds Solid/Zaidan Organization people shell parity", () => {
    const organization = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/organization.tsx"
      ),
      "utf8"
    )
    const organizationPeople = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/organization-people.tsx"
      ),
      "utf8"
    )
    const inviteMemberDialog = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/invite-member-dialog.tsx"
      ),
      "utf8"
    )
    const organizationMembers = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/organization-members.tsx"
      ),
      "utf8"
    )
    const organizationMemberRow = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/organization-member-row.tsx"
      ),
      "utf8"
    )
    const organizationMemberRowSkeleton = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/organization-member-row-skeleton.tsx"
      ),
      "utf8"
    )
    const organizationInvitations = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/organization-invitations.tsx"
      ),
      "utf8"
    )
    const organizationInvitationRow = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/organization-invitation-row.tsx"
      ),
      "utf8"
    )
    const organizationInvitationRowSkeleton = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/organization-invitation-row-skeleton.tsx"
      ),
      "utf8"
    )
    const organizationInvitationsEmpty = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/organization-invitations-empty.tsx"
      ),
      "utf8"
    )
    const table = readFileSync(
      resolve(__dirname, "../src/components/ui/table.tsx"),
      "utf8"
    )
    const badge = readFileSync(
      resolve(__dirname, "../src/components/ui/badge.tsx"),
      "utf8"
    )
    const spinner = readFileSync(
      resolve(__dirname, "../src/components/ui/spinner.tsx"),
      "utf8"
    )
    const inputGroup = readFileSync(
      resolve(__dirname, "../src/components/ui/input-group.tsx"),
      "utf8"
    )
    const textarea = readFileSync(
      resolve(__dirname, "../src/components/ui/textarea.tsx"),
      "utf8"
    )

    expect(table).toContain('data-slot="table-container"')
    expect(table).toContain('data-slot="table"')
    expect(table).toContain("TableHeader")
    expect(table).toContain("TableBody")
    expect(table).toContain("TableHead")
    expect(table).toContain("TableCell")
    expect(table).toContain("splitProps")
    expect(table).toContain("local.class")
    expect(table).not.toContain("className")
    expect(badge).toContain("@kobalte/core/badge")
    expect(badge).toContain("badgeVariants")
    expect(badge).toContain("variant")
    expect(badge).toContain('data-slot="badge"')
    expect(badge).toContain('local.variant ?? "default"')
    expect(badge).toContain("data-variant={variant()}")
    expect(badge).toContain("local.class")
    expect(badge).not.toContain("className")
    expect(spinner).toContain("LoaderCircle")
    expect(spinner).toContain('role="status"')
    expect(spinner).toContain('aria-label="Loading"')
    expect(spinner).toContain("z-spinner size-4 animate-spin")
    expect(spinner).not.toContain("className")
    expect(inputGroup).toContain('data-slot="input-group"')
    expect(inputGroup).toContain('ComponentProps<"div">')
    expect(inputGroup).toContain('role="group"')
    expect(inputGroup).toContain("InputGroupAddon")
    expect(inputGroup).toContain('data-slot="input-group-addon"')
    expect(inputGroup).toContain("InputGroupInput")
    expect(inputGroup).toContain('data-slot="input-group-control"')
    expect(inputGroup).toContain("InputGroupTextarea")
    expect(inputGroup).toContain("InputGroupButton")
    expect(inputGroup).toContain("InputGroupText")
    expect(inputGroup).toContain("local.class")
    expect(inputGroup).not.toContain("className")
    expect(textarea).toContain('data-slot="textarea"')
    expect(textarea).toContain("z-textarea")
    expect(textarea).toContain("local.class")
    expect(textarea).not.toContain("className")
    expect(organization).toContain("OrganizationPeople")
    expect(organization).not.toContain(
      "Member and invitation APIs are available"
    )
    expect(organizationPeople).toContain("OrganizationPeopleProps")
    expect(organizationPeople).toContain("class?: string")
    expect(organizationPeople).toContain("Members")
    expect(organizationPeople).toContain("Invitations")
    expect(organizationPeople).toContain("OrganizationMembers")
    expect(organizationPeople).toContain("OrganizationInvitations")
    expect(organizationMembers).toContain("OrganizationMembersProps")
    expect(organizationMembers).toContain("useListOrganizationMembers")
    expect(organizationMembers).toContain("OrganizationAuthClient")
    expect(organizationMembers).toContain("members.data?.members")
    expect(organizationMembers).toContain("OrganizationMemberRow")
    expect(organizationMembers).toContain("OrganizationMemberRowSkeleton")
    expect(organizationMembers).toContain("Table")
    expect(organizationMembers).toContain("TableHeader")
    expect(organizationMembers).toContain("TableBody")
    expect(organizationMembers).toContain("TableHead")
    expect(organizationMembers).toContain("TableRow")
    expect(organizationMembers).toContain("TableCell")
    expect(organizationMembers).toContain("member.role")
    expect(organizationMembers).toContain("No members")
    expect(organizationMembers).toContain("Input")
    expect(organizationMembers).toContain("Search")
    expect(organizationMembers).toContain("Filter")
    expect(organizationMembers).toContain("DropdownMenuRadioGroup")
    expect(organizationMembers).toContain("DropdownMenuRadioItem")
    expect(organizationMembers).toContain("memberSearch")
    expect(organizationMembers).toContain("memberRoleFilter")
    expect(organizationMembers).toContain("memberSort")
    expect(organizationMembers).toContain("SortDirection")
    expect(organizationMembers).toContain("SortDescriptor")
    expect(organizationMembers).toContain("sortDescriptor")
    expect(organizationMembers).toContain("SortableTableHead")
    expect(organizationMembers).toContain("toggleSort")
    expect(organizationMembers).toContain("descending")
    expect(organizationMembers).toContain("filteredMemberRows")
    expect(organizationMembers).toContain("sortedMemberRows")
    expect(organizationMembers).toContain("member.user?.name")
    expect(organizationMembers).toContain("member.user?.email")
    expect(organizationMembers).toContain("toLowerCase()")
    expect(organizationMembers).toContain('memberRoleFilter() === "all"')
    expect(organizationMembers).toContain("localization().search")
    expect(organizationMembers).toContain("localization().clear")
    expect(organizationMembers).toContain("sortMembers")
    expect(organizationMembers).toContain('memberSort() === "name"')
    expect(organizationMembers).toContain('memberSort() === "role"')
    expect(organizationMembers).not.toContain('memberSort() === "email"')
    expect(organizationMembers).toContain("InputGroup")
    expect(organizationMembers).toContain("InputGroupAddon")
    expect(organizationMembers).toContain("InputGroupInput")
    expect(organizationMembers).not.toContain("InputGroupTextarea")
    expect(organizationMembers).toContain("Badge")
    expect(organizationMembers).toContain("selectedRoleLabel")
    expect(organizationInvitations).toContain("OrganizationInvitationsProps")
    expect(organizationInvitations).toContain("useListOrganizationInvitations")
    expect(organizationInvitations).toContain("invitations.data ?? []")
    expect(organizationInvitations).toContain("OrganizationInvitationRow")
    expect(organizationInvitations).toContain(
      "OrganizationInvitationRowSkeleton"
    )
    expect(organizationInvitations).toContain("OrganizationInvitationsEmpty")
    expect(organizationInvitations).toContain("Table")
    expect(organizationInvitations).toContain("TableHeader")
    expect(organizationInvitations).toContain("TableBody")
    expect(organizationInvitations).toContain("TableHead")
    expect(organizationInvitations).toContain("TableRow")
    expect(organizationInvitations).toContain("TableCell")
    expect(organizationInvitations).toContain("invitation.email")
    expect(organizationInvitations).toContain("invitation.createdAt")
    expect(organizationInvitations).toContain("invitation.role")
    expect(organizationInvitations).toContain("invitation.status")
    expect(organizationInvitations).toContain("invitationSearch")
    expect(organizationInvitations).toContain("invitationRoleFilter")
    expect(organizationInvitations).toContain("invitationStatusFilter")
    expect(organizationInvitations).toContain("normalizedInvitationSearch")
    expect(organizationInvitations).toContain("filteredInvitationRows")
    expect(organizationInvitations).toContain("InvitationSort")
    expect(organizationInvitations).toContain("invitationSort")
    expect(organizationInvitations).toContain("setInvitationSort")
    expect(organizationInvitations).toContain("SortDirection")
    expect(organizationInvitations).toContain("SortDescriptor")
    expect(organizationInvitations).toContain("sortDescriptor")
    expect(organizationInvitations).toContain("SortableTableHead")
    expect(organizationInvitations).toContain("toggleSort")
    expect(organizationInvitations).toContain("descending")
    expect(organizationInvitations).toContain("sortInvitations")
    expect(organizationInvitations).toContain("sortedInvitationRows")
    expect(organizationInvitations).toContain('invitationSort() === "email"')
    expect(organizationInvitations).toContain(
      'invitationSort() === "createdAt"'
    )
    expect(organizationInvitations).toContain('invitationSort() === "role"')
    expect(organizationInvitations).toContain('invitationSort() === "status"')
    expect(organizationInvitations).toContain("invitation.email?.toLowerCase()")
    expect(organizationInvitations).toContain(
      'invitationRoleFilter() === "all"'
    )
    expect(organizationInvitations).toContain(
      'invitationStatusFilter() === "all"'
    )
    expect(organizationInvitations).toContain("localization().status")
    expect(organizationInvitations).toContain('"pending"')
    expect(organizationInvitations).toContain('"accepted"')
    expect(organizationInvitations).toContain('"rejected"')
    expect(organizationInvitations).toContain('"canceled"')
    expect(organizationInvitations).toContain("No invitations")
    expect(organizationInvitations).toContain(
      "No invitations match the current filters."
    )
    expect(organizationInvitationRow).toContain("useCancelInvitation")
    expect(organizationInvitationRow).toContain("useHasPermission")
    expect(organizationInvitationRow).toContain(
      'permissions: { invitation: ["cancel"] }'
    )
    expect(organizationInvitationRow).toContain("permission.data?.success")
    expect(organizationInvitationRow).toContain(
      'props.invitation.status === "pending"'
    )
    expect(organizationInvitationRow).toContain("cancelInvitation.mutate")
    expect(organizationInvitationRow).toContain(
      "invitationId: props.invitation.id"
    )
    expect(organizationInvitationRow).toContain(
      "disabled={cancelInvitation.isPending}"
    )
    expect(organizationInvitationRow).toContain(
      'aria-label="Cancel invitation"'
    )
    expect(organizationInvitationRow).toContain("Badge")
    expect(organizationInvitationRow).toContain("Spinner")
    expect(organizationInvitationRowSkeleton).toContain("TableRow")
    expect(organizationInvitationRowSkeleton).toContain("TableCell")
    expect(organizationInvitationsEmpty).toContain(
      "organizationInvitationsEmptyDescription"
    )
    expect(organizationInvitations).toContain("InputGroup")
    expect(organizationInvitations).toContain("InputGroupAddon")
    expect(organizationInvitations).toContain("InputGroupInput")
    expect(organizationInvitations).not.toContain("InputGroupTextarea")
    expect(organizationInvitations).not.toContain("useSearch")
    expect(organizationMemberRow).toContain("useUpdateMemberRole")
    expect(organizationMemberRow).toContain(
      'permissions: { member: ["update"] }'
    )
    expect(organizationMemberRow).toContain("memberRoleUpdated")
    expect(organizationMemberRow).toContain("changeMemberRole")
    expect(organizationMemberRow).toContain("DropdownMenu")
    expect(organizationMemberRow).toContain("DropdownMenuItem")
    expect(organizationMemberRow).toContain("updateMemberRole.mutate")
    expect(organizationMemberRow).toContain("memberId: props.member.id")
    expect(organizationMemberRow).toContain(
      'role as UpdateMemberRoleParams["role"]'
    )
    expect(organizationMemberRow).toContain('key !== "owner"')
    expect(organizationMemberRow).toContain("useSession")
    expect(organizationMemberRow).toContain("session.data?.user.id")
    expect(organizationMemberRow).toContain("RemoveMemberDialog")
    expect(organizationMemberRow).toContain("useRemoveMember")
    expect(organizationMemberRow).toContain(
      'permissions: { member: ["delete"] }'
    )
    expect(organizationMemberRow).toContain("removeMember.mutate")
    expect(organizationMemberRow).toContain("memberIdOrEmail: props.member.id")
    expect(organizationMemberRow).toContain(
      "organizationId: props.member.organizationId"
    )
    expect(organizationMemberRow).toContain("memberRemoved")
    expect(organizationMemberRow).toContain("removeMemberWarning")
    expect(organizationMemberRow).toContain("disabled={removeMember.isPending}")
    expect(organizationMemberRow).toContain(
      "props.member.userId !== session.data?.user.id"
    )
    expect(organizationMemberRow).toContain(
      "aria-label={props.localization.removeMember}"
    )
    expect(organizationMemberRow).toContain("LeaveOrganizationDialog")
    expect(organizationMemberRow).toContain("useLeaveOrganization")
    expect(organizationMemberRow).toContain("useActiveOrganization")
    expect(organizationMemberRow).toContain("leaveOrganization.mutate")
    expect(organizationMemberRow).toContain(
      "organizationId: activeOrganization.data.id"
    )
    expect(organizationMemberRow).toContain("leftOrganization")
    expect(organizationMemberRow).toContain("leaveOrganizationDescription")
    expect(organizationMemberRow).toContain("auth.navigate")
    expect(organizationMemberRow).toContain("auth.basePaths.settings")
    expect(organizationMemberRow).toContain(
      "props.member.userId === session.data?.user.id"
    )
    expect(organizationMemberRow).toContain(
      "aria-label={props.localization.leaveOrganization}"
    )
    expect(organizationMemberRowSkeleton).toContain("TableRow")
    expect(organizationMemberRowSkeleton).toContain("TableCell")
    expect(organizationMembers).toContain("InviteMemberDialog")
    expect(organizationMembers).toContain("const [inviteOpen, setInviteOpen]")
    expect(organizationMembers).toContain("setInviteOpen(true)")
    expect(organizationMemberRow).toContain("LeaveOrganizationDialog")
    expect(organizationMemberRow).toContain("useLeaveOrganization")
    expect(inviteMemberDialog).toContain("InviteMemberDialogProps")
    expect(inviteMemberDialog).toContain("open: boolean")
    expect(inviteMemberDialog).toContain(
      "onOpenChange: (open: boolean) => void"
    )
    expect(inviteMemberDialog).toContain("useInviteMember")
    expect(inviteMemberDialog).toContain("useActiveOrganization")
    expect(inviteMemberDialog).toContain("pickDefaultRole")
    expect(inviteMemberDialog).toContain("inviteMemberSuccess")
    expect(inviteMemberDialog).toContain(
      "organizationId: activeOrganization.data?.id"
    )
    expect(inviteMemberDialog).toContain("email: email().trim()")
    expect(inviteMemberDialog).not.toContain("useCancelInvitation")
  })

  it("aligns OrganizationSwitcher focused API and behavior with shadcn", () => {
    const organizationSwitcher = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/organization-switcher.tsx"
      ),
      "utf8"
    )

    expect(organizationSwitcher).toContain("import type { JSX }")
    expect(organizationSwitcher).toContain("import { UserView }")
    expect(organizationSwitcher).toContain("trigger?: JSX.Element")
    expect(organizationSwitcher).toContain("hidePersonal?: boolean")
    expect(organizationSwitcher).toContain("hideSettings?: boolean")
    expect(organizationSwitcher).toContain("hideSlug?: boolean")
    expect(organizationSwitcher).toContain("hideCreate?: boolean")
    expect(organizationSwitcher).toContain(
      "setActive?: (organization: Organization | null) => void"
    )
    expect(organizationSwitcher).toContain("class?: string")
    expect(organizationSwitcher).not.toContain("className")
    expect(organizationSwitcher).toContain("hideSlug: true")
    expect(organizationSwitcher).toContain("props.trigger")
    expect(organizationSwitcher).toContain('as="span"')
    expect(organizationSwitcher).toContain("CreateOrganizationDialog")
    expect(organizationSwitcher).toContain("const [createOpen, setCreateOpen]")
    expect(organizationSwitcher).toContain("!props.hideCreate")
    expect(organizationSwitcher).toContain("setCreateOpen(true)")
    expect(organizationSwitcher).toContain("props.setActive?.(organization)")
    expect(organizationSwitcher).toContain("props.setActive?.(null)")
    expect(organizationSwitcher).toContain("handleSetActive(null)")
    expect(organizationSwitcher).toContain("!props.hidePersonal")
    expect(organizationSwitcher).toContain("!props.hideSettings")
    expect(organizationSwitcher).toContain("!props.hideSlug")
    expect(organizationSwitcher).toContain(
      "organization.id !== activeOrganization.data?.id"
    )
    expect(organizationSwitcher).toContain(
      "params: { path: auth.viewPaths.settings.account }"
    )
    expect(organizationSwitcher).toContain('to: "/settings/$path"')
    expect(organizationSwitcher).toContain('to: "/organization/$slug/$path"')
    expect(organizationSwitcher).toContain("setActiveOrganization.mutate")
  })

  it("adds Solid/Zaidan Organization create dialog and slug field parity", () => {
    const createDialog = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/create-organization-dialog.tsx"
      ),
      "utf8"
    )
    const slugField = readFileSync(
      resolve(__dirname, "../src/components/auth/organization/slug-field.tsx"),
      "utf8"
    )
    const organizations = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/organization/organizations.tsx"
      ),
      "utf8"
    )

    expect(createDialog).toContain("CreateOrganizationDialogProps")
    expect(createDialog).toContain("open: boolean")
    expect(createDialog).toContain("onOpenChange: (open: boolean) => void")
    expect(createDialog).toContain("useCreateOrganization")
    expect(createDialog).toContain("onSuccess: () => props.onOpenChange(false)")
    expect(createDialog).toContain('setName("")')
    expect(createDialog).toContain('setSlug("")')
    expect(createDialog).toContain("setSlug(sanitizeSlug")
    expect(createDialog).toContain("slug: slug()")
    expect(createDialog).toContain("SlugField")
    expect(createDialog).toContain('id="create-organization-slug"')
    expect(slugField).toContain("export function sanitizeSlug")
    expect(slugField).toContain('replace(/[^a-z0-9]+/g, "-")')
    expect(slugField).toContain("useCheckOrganizationSlug")
    expect(slugField).not.toContain("useCheckSlug")
    expect(slugField).toContain("currentSlug")
    expect(slugField).toContain("checkSlug")
    expect(organizations).toContain("CreateOrganizationDialog")
    expect(organizations).toContain("const [createOpen, setCreateOpen]")
    expect(organizations).toContain("setCreateOpen(true)")
    expect(organizations).not.toContain("const slugify")
  })

  it("adds a Zaidan Magic Link Storybook preview story", () => {
    const magicLinkStoryPath = resolve(
      __dirname,
      "../src/stories/magic-link.stories.tsx"
    )

    expect(existsSync(magicLinkStoryPath)).toBe(true)

    const magicLinkStory = readFileSync(magicLinkStoryPath, "utf8")

    expect(magicLinkStory).toContain('title: "Zaidan/Plugins/Magic Link"')
    expect(magicLinkStory).toContain("function MagicLinkStory()")
    expect(magicLinkStory).toContain("export const Preview: Story = {}")
    expect(magicLinkStory).toContain("RouterProvider")
    expect(magicLinkStory).toContain("createMemoryHistory")
    expect(magicLinkStory).toContain("plugins={[magicLinkPlugin()]}")
    expect(magicLinkStory).toContain('socialProviders={["github", "google"]}')
    expect(magicLinkStory).not.toContain(
      "emailAndPassword={{ enabled: false }}"
    )
    expect(magicLinkStory).toContain("signIn: {")
    expect(magicLinkStory).toContain("magicLink: async () =>")
    expect(magicLinkStory).toContain("social: async () =>")
    expect(magicLinkStory).toContain("<MagicLink />")
  })
})
