import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { viewPaths } from "@better-auth-ui/core"
import { describe, expect, it } from "vitest"
import { ForgotPassword } from "../src/components/auth/forgot-password"
import { ResetPassword } from "../src/components/auth/reset-password"
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
  resolveSubmittedSignIn
} from "../src/components/auth/sign-in-path"
import { SignOut } from "../src/components/auth/sign-out"
import { SignUp } from "../src/components/auth/sign-up"
import { resolveAuthRoute } from "../src/routes/auth/-route-components"
import {
  AccountSettings,
  resolveSettingsRoute,
  SecuritySettings
} from "../src/routes/settings/-route-components"

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

  it("wires the Solid auth provider to TanStack navigation and the shadcn redirect target", () => {
    const authProvider = readFileSync(
      resolve(__dirname, "../src/components/auth/auth-provider.tsx"),
      "utf8"
    )

    expect(authProvider).toContain(
      'import { useNavigate } from "@tanstack/solid-router"'
    )
    expect(authProvider).toContain("const navigate = useNavigate()")
    expect(authProvider).toContain('redirectTo="/settings/account"')
    expect(authProvider).toContain("navigate={navigate}")
  })

  it("shares the router QueryClient with Solid auth queries across navigation", () => {
    const rootRoute = readFileSync(
      resolve(__dirname, "../src/routes/__root.tsx"),
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
      "<AuthProvider queryClient={routeContext().queryClient}>"
    )
    expect(authProvider).toContain(
      'import type { QueryClient } from "@tanstack/solid-query"'
    )
    expect(authProvider).toContain("queryClient?: QueryClient")
    expect(authProvider).toContain("queryClient={props.queryClient}")
  })

  it("redirects Solid sign-in success like shadcn and refreshes the session query", () => {
    const signIn = readFileSync(
      resolve(__dirname, "../src/components/auth/sign-in.tsx"),
      "utf8"
    )

    expect(signIn).toContain(
      'import { authQueryKeys } from "@better-auth-ui/core"'
    )
    expect(signIn).toContain("useQueryClient")
    expect(signIn).toContain("queryClient.invalidateQueries({")
    expect(signIn).toContain("queryKey: authQueryKeys.session")
    expect(signIn).toContain("auth.navigate({ to: auth.redirectTo })")
    expect(signIn).not.toContain("callbackURL:")
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
    expect(signUp).not.toContain("callbackURL:")
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

  it("keeps the route compatibility facade minimal while shared contracts live in the extracted module", () => {
    const settingsRoute = readFileSync(
      resolve(__dirname, "../src/routes/settings/$path.tsx"),
      "utf8"
    )
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/routes/settings/-route-components.tsx"),
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
      'import { Settings } from "@/routes/settings/-route-components"'
    )
    expect(settingsComponents).toContain("export const Settings =")
    expect(settingsComponents).toContain("export const SecuritySettings =")
    expect(settingsComponents).toContain("export const resolveSettingsRoute =")
    expect(settingsComponents).toContain(
      'export { AccountSettings } from "@/components/auth/settings/account/account-settings"'
    )
    expect(settingsComponents).not.toContain(
      'from "@/components/auth/settings/shared/helpers"'
    )
    expect(settingsComponents).not.toContain(
      'from "@/components/auth/settings/shared/types"'
    )
    expect(settingsComponents).not.toContain("shouldLoadAccounts")
    expect(settingsComponents).not.toContain("shouldLoadDeviceSessions")
    expect(settingsComponents).not.toContain("shouldLoadLinkedAccounts")
    expect(settingsComponents).not.toContain("SettingsRouteResolution")
    expect(settingsComponents).not.toContain(
      "function shouldLoadLinkedAccounts"
    )
    expect(sharedHelpers).toContain("function shouldLoadLinkedAccounts")
    expect(sharedHelpers).toContain("resolveUserLabel")
    expect(sharedHelpers).toContain("resolveUserInitials")
    expect(sharedHelpers).toContain("function timeAgo")
    expect(sharedTypes).toContain("export type SettingsSession")
    expect(sharedTypes).toContain("export type SettingsRouteResolution")
    expect(sharedTypes).toContain("export type ListedPasskey")
  })

  it("keeps Solid settings route validation route-level and shares the auth client", () => {
    const settingsRoute = readFileSync(
      resolve(__dirname, "../src/routes/settings/$path.tsx"),
      "utf8"
    )
    const authProvider = readFileSync(
      resolve(__dirname, "../src/components/auth/auth-provider.tsx"),
      "utf8"
    )

    expect(settingsRoute).toContain("viewPaths.settings")
    expect(settingsRoute).toContain("throw notFound()")
    expect(settingsRoute).not.toContain("minimal {path()} settings route")
    expect(authProvider).toContain("export const authClient")
  })

  it("keeps Solid settings navigation lightweight and non-blocking", () => {
    const settingsRoute = readFileSync(
      resolve(__dirname, "../src/routes/settings/$path.tsx"),
      "utf8"
    )
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/routes/settings/-route-components.tsx"),
      "utf8"
    )
    const settingsShell = readFileSync(
      resolve(__dirname, "../src/components/auth/settings/settings.tsx"),
      "utf8"
    )

    expect(settingsRoute).not.toContain("ensureSession")
    expect(settingsRoute).not.toContain("redirect")
    expect(settingsRoute).not.toContain("async beforeLoad")
    expect(settingsComponents).not.toContain("useAuthenticate")
    expect(settingsComponents).not.toContain("useListAccounts")
    expect(settingsShell).toContain("createEffect")
    expect(settingsShell).toContain("auth.navigate")
    expect(settingsShell).toContain("createSettingsComponent")
    expect(settingsShell).toContain("createSettingsRouteResolver")
    expect(settingsComponents).toContain("createSettingsComponent({")
    expect(settingsComponents).toContain("createSettingsRouteResolver({")
    expect(
      readFileSync(
        resolve(
          __dirname,
          "../src/components/auth/settings/account/account-settings.tsx"
        ),
        "utf8"
      )
    ).toContain("listDeviceSessionsOptions")
  })

  it("extracts Zaidan Tabs settings navigation into the settings shell without document anchors", () => {
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/routes/settings/-route-components.tsx"),
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
    expect(settingsShell).toContain("value={props.currentView}")
    expect(settingsShell).toContain("onChange={props.onTabChange}")
    expect(settingsShell).toContain("auth.navigate({")
    expect(settingsShell).toContain(
      'class={cn("w-full gap-4 md:gap-6", props.class)}'
    )
    expect(settingsShell).toContain("<div>")
    expect(settingsShell).not.toContain("<nav")
    expect(settingsShell).not.toContain("Manage account and security settings")
    expect(settingsShell).not.toMatch(/<h1[^>]*>/)
    expect(settingsShell).not.toMatch(/<a\s/)
    expect(settingsShell).not.toMatch(/href=\{`\$\{auth\.basePaths\.settings\}/)
    expect(settingsComponents).toContain(
      'from "@/components/auth/settings/settings"'
    )
    expect(settingsComponents).not.toContain(
      'import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"'
    )
  })

  it("uses TanStack Link for UserButton auth/settings menu navigation", () => {
    const userButton = readFileSync(
      resolve(__dirname, "../src/components/auth/user-button.tsx"),
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

  it("uses TanStack Link for auth form helper navigation", () => {
    const helperLinkFiles = [
      "sign-in.tsx",
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

  it("renders the account tab like the shadcn settings baseline", () => {
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/routes/settings/-route-components.tsx"),
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
      resolve(
        __dirname,
        "../src/components/auth/settings/account/appearance-settings.tsx"
      ),
      "utf8"
    )
    const manageAccountRow = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/account/manage-account-row.tsx"
      ),
      "utf8"
    )

    expect(settingsComponents).toContain(
      'from "@/components/auth/settings/account/account-settings"'
    )
    expect(settingsComponents).toContain("AccountSettings,")
    expect(settingsComponents).not.toContain("function AppearanceSettings")
    expect(settingsComponents).not.toContain("function ManageAccountRow")
    expect(accountSettings).toContain("useAuth")
    expect(accountSettings).toContain("session.data?.user.name")
    expect(accountSettings).toContain("session.data?.user.email")
    expect(accountSettings).toContain("getUsername(props.session)")
    expect(accountSettings).toContain("username?: string | null")
    expect(userProfile).toContain("Profile")
    expect(userProfile).toContain("<h2")
    expect(changeEmail).toContain("auth.localization.settings.changeEmail")
    expect(changeEmail).toContain("auth.localization.settings.updateEmail")
    expect(appearanceSettings).toContain("Appearance")
    expect(appearanceSettings).toContain("System")
    expect(appearanceSettings).toContain("Light")
    expect(appearanceSettings).toContain("Dark")
    expect(accountSettings).toContain("multiSessionLocalization.manageAccounts")
    expect(accountSettings).toContain("<ItemGroup")
    expect(manageAccountRow).toContain("<ItemMedia")
    expect(manageAccountRow).toContain("<ItemContent")
    expect(manageAccountRow).toContain("<ItemTitle")
    expect(manageAccountRow).toContain("<ItemDescription")
    expect(manageAccountRow).toContain("<ItemActions")
    expect(accountSettings).toContain("<ItemSeparator")
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
        "../src/components/auth/settings/account/manage-account-row.tsx"
      ),
      "utf8"
    )

    expect(accountSettings).toContain("setActiveSessionOptions")
    expect(accountSettings).toContain("revokeMultiSessionOptions")
    expect(accountSettings).toContain("const setActiveSession = createMutation")
    expect(accountSettings).toContain(
      "const revokeMultiSession = createMutation"
    )
    expect(accountSettings).toContain("window.scrollTo({ top: 0 })")
    expect(accountSettings).toContain(
      "auth.localization.settings.revokeSessionSuccess"
    )
    expect(accountSettings).toContain("setActiveSession.mutate({")
    expect(accountSettings).toContain("revokeMultiSession.mutate({")
    expect(accountSettings).toContain("sessionToken:")
    expect(accountSettings).toContain("deviceSession.session.token")
    expect(manageAccountRow).toContain("ArrowLeftRight")
    expect(manageAccountRow).toContain("MoreHorizontal")
    expect(manageAccountRow).toContain("DropdownMenuTrigger")
    expect(manageAccountRow).toContain("DropdownMenuContent")
    expect(manageAccountRow).toContain("DropdownMenuItem")
    expect(manageAccountRow).toContain("auth.localization.auth.signOut")
    expect(accountSettings).not.toContain(
      "Multi-session switch and sign-out actions are shown but disabled until"
    )
    expect(accountSettings).not.toMatch(
      /<Button disabled size="sm" type="button" variant="secondary">\s*Switch account/
    )
    expect(accountSettings).not.toMatch(
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
    const userProfile = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/account/user-profile.tsx"
      ),
      "utf8"
    )

    expect(userProfile).toContain("fileToBase64")
    expect(userProfile).toContain('import { toast } from "solid-sonner"')
    expect(userProfile).toContain("DropdownMenu")
    expect(userProfile).toContain("DropdownMenuContent")
    expect(userProfile).toContain("DropdownMenuItem")
    expect(userProfile).toContain("DropdownMenuTrigger")
    expect(userProfile).toContain("Upload")
    expect(userProfile).toContain("Trash2")
    expect(userProfile).toContain('type="file"')
    expect(userProfile).toContain('accept="image/*"')
    expect(userProfile).toContain("handleAvatarFileChange")
    expect(userProfile).toContain("auth.avatar.resize")
    expect(userProfile).toContain("auth.avatar.upload")
    expect(userProfile).toContain("updateUser.mutate(")
    expect(userProfile).toContain("{ image },")
    expect(userProfile).toContain("avatarChangedSuccess")
    expect(userProfile).toContain("deleteAvatar")
    expect(userProfile).toContain("{ image: null },")
    expect(userProfile).toContain("auth.avatar.delete")
    expect(userProfile).toContain("avatarDeletedSuccess")
    expect(userProfile).toContain("uploadAvatar")
    expect(userProfile).toContain("changeAvatar")
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
      resolve(
        __dirname,
        "../src/components/auth/settings/account/appearance-settings.tsx"
      ),
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
      resolve(__dirname, "../src/routes/settings/-route-components.tsx"),
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
        "../src/components/auth/settings/security/change-password-settings.tsx"
      ),
      "utf8"
    )
    const linkedAccounts = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/linked-accounts-settings.tsx"
      ),
      "utf8"
    )
    const activeSessions = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/active-sessions-settings.tsx"
      ),
      "utf8"
    )

    expect(settingsComponents).toContain(
      'from "@/components/auth/settings/security/security-settings"'
    )
    expect(settingsComponents).toContain("createSecuritySettingsComponent({")
    expect(settingsComponents).toContain("security: SecuritySettings")
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
    expect(activeSessions).toContain("<Item")
    expect(activeSessions).toContain("<ItemMedia")
    expect(activeSessions).toContain("<ItemContent")
    expect(activeSessions).toContain("<ItemTitle")
    expect(activeSessions).toContain("<ItemDescription")
    expect(activeSessions).toContain("<ItemActions")
    expect(activeSessions).toContain("<ItemSeparator")
    expect(activeSessions).toContain(
      "auth.localization.settings.currentSession"
    )
    expect(activeSessions).toContain("auth.localization.auth.signOut")
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
        "../src/components/auth/settings/security/change-password-settings.tsx"
      ),
      "utf8"
    )

    expect(changePassword).toContain("changePasswordOptions")
    expect(changePassword).toContain("requestPasswordResetOptions")
    expect(changePassword).toContain("listAccountsOptions")
    expect(changePassword).toContain("const linkedAccounts = createQuery")
    expect(changePassword).toContain('providerId === "credential"')
    expect(changePassword).toContain("requestPasswordReset.mutate")
    expect(changePassword).toContain("props.session.data.user.email")
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
      resolve(__dirname, "../src/routes/settings/-route-components.tsx"),
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
    const activeSessions = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/active-sessions-settings.tsx"
      ),
      "utf8"
    )

    expect(activeSessions).toContain(
      "auth.localization.settings.currentSession"
    )
    expect(activeSessions).not.toContain("Other active sessions")
    expect(activeSessions).not.toContain(
      "Additional sessions will appear here."
    )
  })

  it("wires active sessions to real Solid session queries and revoke/sign-out parity", () => {
    const activeSessions = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/active-sessions-settings.tsx"
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
    expect(activeSessions).toContain('import Bowser from "bowser"')
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
    expect(activeSessions).toContain("props.session.data?.session.token")
    expect(activeSessions).toContain("auth.navigate({")
    expect(activeSessions).toContain("auth.basePaths.auth")
    expect(activeSessions).toContain("auth.viewPaths.auth.signOut")
    expect(activeSessions).toContain("auth.localization.auth.signOut")
    expect(activeSessions).toContain("auth.localization.settings.revokeSession")
    expect(activeSessions).toContain("auth.localization.settings.revoke")
    expect(activeSessions).toContain(
      "auth.localization.settings.currentSession"
    )
    expect(activeSessions).toContain(
      "Bowser.parse(props.activeSession.userAgent"
    )
    expect(activeSessions).toContain("<Smartphone")
    expect(activeSessions).toContain("<Monitor")
    expect(activeSessions).toContain("<X")
    expect(activeSessions).not.toContain(
      "Session revocation is not wired in this Solid slice yet."
    )
    expect(activeSessions).not.toMatch(
      /<Button disabled size="sm" type="button" variant="outline">\s*<LogOut \/>\s*Sign out/
    )
  })

  it("wires linked accounts to real Solid account queries and link/unlink parity", () => {
    const linkedAccounts = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/linked-accounts-settings.tsx"
      ),
      "utf8"
    )

    expect(linkedAccounts).toContain("accountInfoOptions")
    expect(linkedAccounts).toContain("linkSocialOptions")
    expect(linkedAccounts).toContain("unlinkAccountOptions")
    expect(linkedAccounts).toContain("const linkedAccounts = createQuery")
    expect(linkedAccounts).toContain("...listAccountsOptions(")
    expect(linkedAccounts).toContain('providerId !== "credential"')
    expect(linkedAccounts).toContain("const accountInfo = createQuery")
    expect(linkedAccounts).toContain("...accountInfoOptions(")
    expect(linkedAccounts).toContain("account?.accountId")
    expect(linkedAccounts).toContain("const linkSocial = createMutation")
    expect(linkedAccounts).toContain("...linkSocialOptions(auth.authClient)")
    expect(linkedAccounts).toContain("provider,")
    expect(linkedAccounts).toContain("callbackURL:")
    expect(linkedAccounts).toContain("window.location.pathname")
    expect(linkedAccounts).toContain("const unlinkAccount = createMutation")
    expect(linkedAccounts).toContain("...unlinkAccountOptions(auth.authClient)")
    expect(linkedAccounts).toContain("accountUnlinked")
    expect(linkedAccounts).toContain("providerId: account.providerId")
    expect(linkedAccounts).toContain("auth.localization.settings.linkProvider")
    expect(linkedAccounts).toContain(
      "auth.localization.settings.unlinkProvider"
    )
    expect(linkedAccounts).toContain("auth.localization.settings.link")
    expect(linkedAccounts).toContain("Link2Off")
    expect(linkedAccounts).not.toContain(
      "link and unlink mutations are not wired in this Solid slice yet."
    )
    expect(linkedAccounts).not.toMatch(
      /<Button disabled size="sm" type="button" variant="outline">\s*<Link2 \/>\s*Link/
    )
  })

  it("renders registered security plugin sections with shadcn-like API keys, passkeys, and danger-zone structure", () => {
    const authProvider = readFileSync(
      resolve(__dirname, "../src/components/auth/auth-provider.tsx"),
      "utf8"
    )
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/routes/settings/-route-components.tsx"),
      "utf8"
    )
    const securitySettings = readFileSync(
      resolve(
        __dirname,
        "../src/components/auth/settings/security/security-settings.tsx"
      ),
      "utf8"
    )

    expect(authProvider).toContain("deleteUserPlugin")
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

    expect(settingsComponents).toContain(
      'from "@/components/auth/api-key/api-keys"'
    )
    expect(settingsComponents).toContain("apiKeys: ApiKeysSettings")
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
    expect(settingsComponents).toContain(
      'from "@/components/auth/passkey/passkeys"'
    )
    expect(settingsComponents).toContain("passkeys: PasskeysSettings")
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
    expect(settingsComponents).toContain(
      'from "@/components/auth/delete-user/danger-zone"'
    )
    expect(settingsComponents).toContain("dangerZone: DangerZone")
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
      resolve(__dirname, "../src/routes/settings/-route-components.tsx"),
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

    expect(settingsComponents).toContain(
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
      resolve(__dirname, "../src/routes/settings/-route-components.tsx"),
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

    expect(settingsComponents).toContain(
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
    expect(securitySettings).toContain(
      "<DangerZoneSettings session={props.session} />"
    )
    expect(settingsComponents).toContain("dangerZone: DangerZone")
    expect(settingsComponents).not.toContain("function DeleteUserSettings")
    expect(dangerZone).toContain("auth.localization.settings.dangerZone")
    expect(dangerZone).toContain("<DeleteUser session={props.session}")
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
