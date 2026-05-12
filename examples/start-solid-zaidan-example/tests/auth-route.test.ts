import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { viewPaths } from "@better-auth-ui/core"
import { describe, expect, it } from "vitest"
import { ForgotPassword } from "../src/components/auth/forgot-password"
import { ResetPassword } from "../src/components/auth/reset-password"
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
  SecuritySettings,
  shouldLoadLinkedAccounts
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
    expect(shouldLoadLinkedAccounts({ isSsr: true, userId: "user-1" })).toBe(
      false
    )
    expect(shouldLoadLinkedAccounts({ isSsr: false })).toBe(false)
    expect(shouldLoadLinkedAccounts({ isSsr: false, userId: "user-1" })).toBe(
      true
    )
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

    expect(settingsRoute).not.toContain("ensureSession")
    expect(settingsRoute).not.toContain("redirect")
    expect(settingsRoute).not.toContain("async beforeLoad")
    expect(settingsComponents).not.toContain("useAuthenticate")
    expect(settingsComponents).not.toContain("useListAccounts")
    expect(settingsComponents).toContain("createEffect")
    expect(settingsComponents).toContain("auth.navigate")
    expect(settingsComponents).toContain("shouldLoadLinkedAccounts")
    expect(settingsComponents).toContain("shouldLoadDeviceSessions")
    expect(settingsComponents).toContain("listDeviceSessionsOptions")
  })

  it("uses Zaidan Tabs for settings navigation without document anchors", () => {
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/routes/settings/-route-components.tsx"),
      "utf8"
    )

    expect(settingsComponents).toContain(
      'import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"'
    )
    expect(settingsComponents).toContain("<Tabs")
    expect(settingsComponents).toContain("<TabsList")
    expect(settingsComponents).toContain("<TabsTrigger")
    expect(settingsComponents).toContain("<TabsContent")
    expect(settingsComponents).toContain("value={currentView()}")
    expect(settingsComponents).toContain("onChange={handleSettingsTabChange}")
    expect(settingsComponents).toContain("auth.navigate({")
    expect(settingsComponents).toContain(
      'class={cn("w-full gap-4 md:gap-6", props.class)}'
    )
    expect(settingsComponents).toContain("<div>")
    expect(settingsComponents).not.toContain("<nav")
    expect(settingsComponents).not.toContain(
      "Manage account and security settings"
    )
    expect(settingsComponents).not.toMatch(/<h1[^>]*>/)
    expect(settingsComponents).not.toMatch(/<a\s/)
    expect(settingsComponents).not.toMatch(
      /href=\{`\$\{auth\.basePaths\.settings\}/
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

    expect(settingsComponents).toContain("useAuth")
    expect(settingsComponents).toContain("useSession")
    expect(settingsComponents).toContain("session.data?.user.name")
    expect(settingsComponents).toContain("session.data?.user.email")
    expect(settingsComponents).toContain("username?: string | null")
    expect(settingsComponents).toContain("getUsername(props.session)")
    expect(settingsComponents).toContain("Profile")
    expect(settingsComponents).toContain("<h2")
    expect(settingsComponents).toContain(
      "auth.localization.settings.changeEmail"
    )
    expect(settingsComponents).toContain(
      "auth.localization.settings.updateEmail"
    )
    expect(settingsComponents).toContain("Appearance")
    expect(settingsComponents).toContain("System")
    expect(settingsComponents).toContain("Light")
    expect(settingsComponents).toContain("Dark")
    expect(settingsComponents).toContain(
      "multiSessionLocalization.manageAccounts"
    )
    expect(settingsComponents).toContain("<ItemGroup")
    expect(settingsComponents).toContain("<ItemMedia")
    expect(settingsComponents).toContain("<ItemContent")
    expect(settingsComponents).toContain("<ItemTitle")
    expect(settingsComponents).toContain("<ItemDescription")
    expect(settingsComponents).toContain("<ItemActions")
    expect(settingsComponents).toContain("<ItemSeparator")
    expect(settingsComponents).toContain(
      "auth.localization.settings.currentSession"
    )
    expect(settingsComponents).toContain(
      "multiSessionLocalization.switchAccount"
    )
    expect(settingsComponents).toContain("auth.localization.auth.signOut")
    expect(settingsComponents).toContain("Save changes")
    expect(settingsComponents).toContain("disabled")
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
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/routes/settings/-route-components.tsx"),
      "utf8"
    )

    expect(settingsComponents).toContain("setActiveSessionOptions")
    expect(settingsComponents).toContain("revokeMultiSessionOptions")
    expect(settingsComponents).toContain(
      "const setActiveSession = createMutation"
    )
    expect(settingsComponents).toContain(
      "const revokeMultiSession = createMutation"
    )
    expect(settingsComponents).toContain("window.scrollTo({ top: 0 })")
    expect(settingsComponents).toContain(
      "auth.localization.settings.revokeSessionSuccess"
    )
    expect(settingsComponents).toContain("setActiveSession.mutate({")
    expect(settingsComponents).toContain("revokeMultiSession.mutate({")
    expect(settingsComponents).toContain("sessionToken:")
    expect(settingsComponents).toContain("deviceSession.session.token")
    expect(settingsComponents).toContain("ArrowLeftRight")
    expect(settingsComponents).toContain("MoreHorizontal")
    expect(settingsComponents).toContain("DropdownMenuTrigger")
    expect(settingsComponents).toContain("DropdownMenuContent")
    expect(settingsComponents).toContain("DropdownMenuItem")
    expect(settingsComponents).toContain("auth.localization.auth.signOut")
    expect(settingsComponents).not.toContain(
      "Multi-session switch and sign-out actions are shown but disabled until"
    )
    expect(settingsComponents).not.toMatch(
      /<Button disabled size="sm" type="button" variant="secondary">\s*Switch account/
    )
    expect(settingsComponents).not.toMatch(
      /<Button disabled size="sm" type="button" variant="secondary">\s*Sign out/
    )
  })

  it("wires profile save to Solid updateUser mutation like the shadcn user profile", () => {
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/routes/settings/-route-components.tsx"),
      "utf8"
    )

    expect(settingsComponents).toContain("updateUserOptions")
    expect(settingsComponents).toContain("createMutation")
    expect(settingsComponents).toContain("const updateUser = createMutation")
    expect(settingsComponents).toContain("onSubmit={submitProfile}")
    expect(settingsComponents).toContain("const formData = new FormData")
    expect(settingsComponents).toContain('formData.get("name")')
    expect(settingsComponents).toContain('formData.get("username")')
    expect(settingsComponents).toContain("updateUser.mutate({")
    expect(settingsComponents).toContain("name,")
    expect(settingsComponents).toContain("username")
    expect(settingsComponents).toContain("profileUpdatedSuccess")
    expect(settingsComponents).not.toContain(
      "Profile and avatar update mutations are not available in this Solid"
    )
    expect(settingsComponents).not.toMatch(
      /<Button disabled size="sm" type="button">\s*Save changes/
    )
  })

  it("wires avatar upload and delete to Solid updateUser mutation like shadcn ChangeAvatar", () => {
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/routes/settings/-route-components.tsx"),
      "utf8"
    )

    expect(settingsComponents).toContain("fileToBase64")
    expect(settingsComponents).toContain('import { toast } from "solid-sonner"')
    expect(settingsComponents).toContain("DropdownMenu")
    expect(settingsComponents).toContain("DropdownMenuContent")
    expect(settingsComponents).toContain("DropdownMenuItem")
    expect(settingsComponents).toContain("DropdownMenuTrigger")
    expect(settingsComponents).toContain("Upload")
    expect(settingsComponents).toContain("Trash2")
    expect(settingsComponents).toContain('type="file"')
    expect(settingsComponents).toContain('accept="image/*"')
    expect(settingsComponents).toContain("handleAvatarFileChange")
    expect(settingsComponents).toContain("auth.avatar.resize")
    expect(settingsComponents).toContain("auth.avatar.upload")
    expect(settingsComponents).toContain("updateUser.mutate(")
    expect(settingsComponents).toContain("{ image },")
    expect(settingsComponents).toContain("avatarChangedSuccess")
    expect(settingsComponents).toContain("deleteAvatar")
    expect(settingsComponents).toContain("{ image: null },")
    expect(settingsComponents).toContain("auth.avatar.delete")
    expect(settingsComponents).toContain("avatarDeletedSuccess")
    expect(settingsComponents).toContain("uploadAvatar")
    expect(settingsComponents).toContain("changeAvatar")
  })

  it("wires change email to the Solid changeEmail mutation like the shadcn account form", () => {
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/routes/settings/-route-components.tsx"),
      "utf8"
    )

    expect(settingsComponents).toContain("changeEmailOptions")
    expect(settingsComponents).toContain("const changeEmail = createMutation")
    expect(settingsComponents).toContain("onSubmit={submitChangeEmail}")
    expect(settingsComponents).toContain("const formData = new FormData")
    expect(settingsComponents).toContain('formData.get("email")')
    expect(settingsComponents).toContain("newEmail:")
    expect(settingsComponents).toContain("callbackURL:")
    expect(settingsComponents).toContain("auth.baseURL")
    expect(settingsComponents).toContain("auth.viewPaths.settings.account")
    expect(settingsComponents).toContain(
      "auth.localization.settings.changeEmail"
    )
    expect(settingsComponents).toContain("auth.localization.auth.email")
    expect(settingsComponents).toContain(
      "auth.localization.auth.emailPlaceholder"
    )
    expect(settingsComponents).toContain(
      'toast.success("Email updated successfully")'
    )
    expect(settingsComponents).not.toContain(
      "toast.success(auth.localization.settings.changeEmailSuccess)"
    )
    expect(settingsComponents).toContain(
      "auth.localization.settings.updateEmail"
    )
    expect(settingsComponents).not.toContain(
      "Change email mutation is not available in this Solid slice yet."
    )
    expect(settingsComponents).not.toMatch(
      /<Button disabled size="sm" type="button">\s*Update email/
    )
  })

  it("uses the exact shadcn theme preview SVG shapes for the Solid appearance cards", () => {
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/routes/settings/-route-components.tsx"),
      "utf8"
    )

    expect(settingsComponents).toContain("ThemePreviewSystem")
    expect(settingsComponents).toContain("ThemePreviewLight")
    expect(settingsComponents).toContain("ThemePreviewDark")
    expect(settingsComponents).toContain('viewBox="0 0 240 117"')
    expect(settingsComponents).toContain("systemDiagonalLight")
    expect(settingsComponents).toContain("systemDiagonalDark")
    expect(settingsComponents).toContain(
      'd="M12 0.5H228C234.351 0.5 239.5 5.64873 239.5 12V105C239.5 111.351 234.351 116.5 228 116.5H12C5.64873 116.5 0.5 111.351 0.5 105V12C0.5 5.64873 5.64873 0.5 12 0.5Z"'
    )
    expect(settingsComponents).toContain(
      'd="M88 51C88 46.5817 91.5817 43 96 43H221C225.418 43 229 46.5817 229 51V85C229 89.4183 225.418 93 221 93H96C91.5817 93 88 89.4183 88 85V51Z"'
    )
    expect(settingsComponents).toContain(
      '<circle cx="22.5" cy="25.5" fill="#E4E4E7" r="5.5" />'
    )
    expect(settingsComponents).toContain(
      '<circle cx="22.5" cy="25.5" fill="#3F3F46" r="5.5" />'
    )
    expect(settingsComponents).not.toContain(
      "bg-gradient-to-r from-background to-slate-950"
    )
  })

  it("renders the security tab like the shadcn settings baseline", () => {
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/routes/settings/-route-components.tsx"),
      "utf8"
    )

    expect(settingsComponents).toContain("auth.emailAndPassword?.enabled")
    expect(settingsComponents).toContain("<ChangePasswordSettings")
    expect(settingsComponents).toContain(
      "auth.emailAndPassword.confirmPassword"
    )
    expect(settingsComponents).toContain(
      "auth.localization.settings.currentPassword"
    )
    expect(settingsComponents).toContain("auth.localization.auth.newPassword")
    expect(settingsComponents).toContain(
      "auth.localization.auth.confirmPassword"
    )
    expect(settingsComponents).toContain(
      "auth.localization.settings.updatePassword"
    )
    expect(settingsComponents).toContain("!!auth.socialProviders?.length")
    expect(settingsComponents).toContain("<LinkedAccountsSettings")
    expect(settingsComponents).toContain("<ActiveSessionsSettings")
    expect(settingsComponents).toContain("<ItemGroup")
    expect(settingsComponents).toContain("<Item")
    expect(settingsComponents).toContain("<ItemMedia")
    expect(settingsComponents).toContain("<ItemContent")
    expect(settingsComponents).toContain("<ItemTitle")
    expect(settingsComponents).toContain("<ItemDescription")
    expect(settingsComponents).toContain("<ItemActions")
    expect(settingsComponents).toContain("<ItemSeparator")
    expect(settingsComponents).toContain(
      "auth.localization.settings.currentSession"
    )
    expect(settingsComponents).toContain("auth.localization.auth.signOut")
    expect(settingsComponents).toContain("auth.plugins.flatMap")
    expect(settingsComponents).toContain("plugin.securityCards")
    expect(settingsComponents).not.toContain("Plugin security cards")
    expect(settingsComponents).not.toContain("API keys are not available")
    expect(settingsComponents).not.toContain("Passkeys are not available")
    expect(settingsComponents).not.toContain(
      "Danger zone actions are not available"
    )
  })

  it("wires change password to Solid mutations and account detection like shadcn", () => {
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/routes/settings/-route-components.tsx"),
      "utf8"
    )

    expect(settingsComponents).toContain("changePasswordOptions")
    expect(settingsComponents).toContain("requestPasswordResetOptions")
    expect(settingsComponents).toContain("listAccountsOptions")
    expect(settingsComponents).toContain("const linkedAccounts = createQuery")
    expect(settingsComponents).toContain('providerId === "credential"')
    expect(settingsComponents).toContain("requestPasswordReset.mutate")
    expect(settingsComponents).toContain("props.session.data.user.email")
    expect(settingsComponents).toContain("passwordResetEmailSent")
    expect(settingsComponents).toContain(
      "const changePassword = createMutation"
    )
    expect(settingsComponents).toContain("submitChangePassword")
    expect(settingsComponents).toContain("passwordsDoNotMatch")
    expect(settingsComponents).toContain("changePassword.mutate({")
    expect(settingsComponents).toContain("currentPassword,")
    expect(settingsComponents).toContain("newPassword,")
    expect(settingsComponents).toContain("revokeOtherSessions: true")
    expect(settingsComponents).toContain("changePasswordSuccess")
    expect(settingsComponents).toContain(
      "auth.localization.settings.currentPassword"
    )
    expect(settingsComponents).toContain(
      "auth.localization.settings.currentPasswordPlaceholder"
    )
    expect(settingsComponents).toContain("auth.localization.auth.newPassword")
    expect(settingsComponents).toContain(
      "auth.localization.auth.newPasswordPlaceholder"
    )
    expect(settingsComponents).toContain(
      "auth.localization.auth.confirmPassword"
    )
    expect(settingsComponents).toContain(
      "auth.localization.auth.confirmPasswordPlaceholder"
    )
    expect(settingsComponents).toContain(
      "auth.localization.settings.updatePassword"
    )
    expect(settingsComponents).toContain(
      "auth.emailAndPassword.minPasswordLength"
    )
    expect(settingsComponents).toContain(
      "auth.emailAndPassword.maxPasswordLength"
    )
    expect(settingsComponents).toContain("Eye")
    expect(settingsComponents).toContain("EyeOff")
    expect(settingsComponents).not.toContain(
      "Change password mutation is not wired in this Solid slice yet."
    )
    expect(settingsComponents).not.toMatch(
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
    expect(settingsComponents).toContain('from "@/components/ui/item"')
  })

  it("does not invent placeholder active-session rows when only the current session is known", () => {
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/routes/settings/-route-components.tsx"),
      "utf8"
    )

    expect(settingsComponents).toContain(
      "auth.localization.settings.currentSession"
    )
    expect(settingsComponents).not.toContain("Other active sessions")
    expect(settingsComponents).not.toContain(
      "Additional sessions will appear here."
    )
  })

  it("wires active sessions to real Solid session queries and revoke/sign-out parity", () => {
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/routes/settings/-route-components.tsx"),
      "utf8"
    )
    const solidIndex = readFileSync(
      resolve(__dirname, "../../../packages/solid/src/index.ts"),
      "utf8"
    )

    expect(solidIndex).toContain(
      'export * from "./queries/settings/list-sessions-query"'
    )
    expect(settingsComponents).toContain('import Bowser from "bowser"')
    expect(settingsComponents).toContain("listSessionsOptions")
    expect(settingsComponents).toContain("revokeSessionOptions")
    expect(settingsComponents).toContain("const activeSessions = createQuery")
    expect(settingsComponents).toContain("...listSessionsOptions(")
    expect(settingsComponents).toContain("const revokeSession = createMutation")
    expect(settingsComponents).toContain(
      "...revokeSessionOptions(auth.authClient)"
    )
    expect(settingsComponents).toContain("revokeSession.mutate(activeSession)")
    expect(settingsComponents).toContain(
      "auth.localization.settings.revokeSessionSuccess"
    )
    expect(settingsComponents).toContain("activeSession.token ===")
    expect(settingsComponents).toContain("props.session.data?.session.token")
    expect(settingsComponents).toContain("auth.navigate({")
    expect(settingsComponents).toContain("auth.basePaths.auth")
    expect(settingsComponents).toContain("auth.viewPaths.auth.signOut")
    expect(settingsComponents).toContain("auth.localization.auth.signOut")
    expect(settingsComponents).toContain(
      "auth.localization.settings.revokeSession"
    )
    expect(settingsComponents).toContain("auth.localization.settings.revoke")
    expect(settingsComponents).toContain(
      "auth.localization.settings.currentSession"
    )
    expect(settingsComponents).toContain(
      "Bowser.parse(props.activeSession.userAgent"
    )
    expect(settingsComponents).toContain("<Smartphone")
    expect(settingsComponents).toContain("<Monitor")
    expect(settingsComponents).toContain("<X")
    expect(settingsComponents).not.toContain(
      "Session revocation is not wired in this Solid slice yet."
    )
    expect(settingsComponents).not.toMatch(
      /<Button disabled size="sm" type="button" variant="outline">\s*<LogOut \/>\s*Sign out/
    )
  })

  it("wires linked accounts to real Solid account queries and link/unlink parity", () => {
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/routes/settings/-route-components.tsx"),
      "utf8"
    )

    expect(settingsComponents).toContain("accountInfoOptions")
    expect(settingsComponents).toContain("linkSocialOptions")
    expect(settingsComponents).toContain("unlinkAccountOptions")
    expect(settingsComponents).toContain("const linkedAccounts = createQuery")
    expect(settingsComponents).toContain("...listAccountsOptions(")
    expect(settingsComponents).toContain('providerId !== "credential"')
    expect(settingsComponents).toContain("const accountInfo = createQuery")
    expect(settingsComponents).toContain("...accountInfoOptions(")
    expect(settingsComponents).toContain("account?.accountId")
    expect(settingsComponents).toContain("const linkSocial = createMutation")
    expect(settingsComponents).toContain(
      "...linkSocialOptions(auth.authClient)"
    )
    expect(settingsComponents).toContain("provider,")
    expect(settingsComponents).toContain("callbackURL:")
    expect(settingsComponents).toContain("window.location.pathname")
    expect(settingsComponents).toContain("const unlinkAccount = createMutation")
    expect(settingsComponents).toContain(
      "...unlinkAccountOptions(auth.authClient)"
    )
    expect(settingsComponents).toContain("accountUnlinked")
    expect(settingsComponents).toContain("providerId: account.providerId")
    expect(settingsComponents).toContain(
      "auth.localization.settings.linkProvider"
    )
    expect(settingsComponents).toContain(
      "auth.localization.settings.unlinkProvider"
    )
    expect(settingsComponents).toContain("auth.localization.settings.link")
    expect(settingsComponents).toContain("Link2Off")
    expect(settingsComponents).not.toContain(
      "link and unlink mutations are not wired in this Solid slice yet."
    )
    expect(settingsComponents).not.toMatch(
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

    expect(authProvider).toContain("deleteUserPlugin")
    expect(settingsComponents).toContain(
      'hasAuthPlugin(auth.plugins, "apiKey")'
    )
    expect(settingsComponents).toContain(
      'hasAuthPlugin(auth.plugins, "passkey")'
    )
    expect(settingsComponents).toContain(
      'hasAuthPlugin(auth.plugins, "deleteUser")'
    )
    expect(settingsComponents).toContain("listApiKeysOptions")
    expect(settingsComponents).toContain("createApiKeyOptions")
    expect(settingsComponents).toContain("deleteApiKeyOptions")
    expect(settingsComponents).toContain("apiKeyLocalization.apiKeys")
    expect(settingsComponents).toContain("listPasskeysOptions")
    expect(settingsComponents).toContain("addPasskeyOptions")
    expect(settingsComponents).toContain("deletePasskeyOptions")
    expect(settingsComponents).toContain("<CreateApiKeyDialog")
    expect(settingsComponents).toContain("<NewApiKeyDialog")
    expect(settingsComponents).toContain("<DeleteApiKeyDialog")
    expect(settingsComponents).toContain("<AddPasskeyDialog")
    expect(settingsComponents).toContain("<DeletePasskeyDialog")
    expect(settingsComponents).toContain("apiKeyLocalization.createApiKey")
    expect(settingsComponents).toContain("apiKeyLocalization.noApiKeys")
    expect(settingsComponents).toContain("passkeyLocalization.passkeys")
    expect(settingsComponents).toContain("passkeyLocalization.addPasskey")
    expect(settingsComponents).toContain("passkeyLocalization.noPasskeys")
    expect(settingsComponents).toContain("Danger zone")
    expect(settingsComponents).toContain("Delete user")
    expect(settingsComponents).toContain("text-destructive")
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

  it("provides the local Solid Zaidan Dialog primitive for API key dialogs", () => {
    const dialogPath = resolve(__dirname, "../src/components/ui/dialog.tsx")
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/routes/settings/-route-components.tsx"),
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
    expect(settingsComponents).toContain('from "@/components/ui/dialog"')
  })

  it("wires API key create, new-key reveal, copy, and delete dialogs to Solid mutations", () => {
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/routes/settings/-route-components.tsx"),
      "utf8"
    )

    expect(settingsComponents).toContain("const createApiKey = createMutation")
    expect(settingsComponents).toContain(
      "...createApiKeyOptions(auth.authClient as ApiKeyAuthClient)"
    )
    expect(settingsComponents).toContain("createApiKey.mutate(")
    expect(settingsComponents).toContain("setNewApiKeySecret(result.key)")
    expect(settingsComponents).toContain("setIsNewKeyDialogOpen(true)")
    expect(settingsComponents).toContain("navigator.clipboard.writeText")
    expect(settingsComponents).toContain("setIsCopied(true)")
    expect(settingsComponents).toContain("setTimeout(() => setIsCopied(false)")
    expect(settingsComponents).toContain("const deleteApiKey = createMutation")
    expect(settingsComponents).toContain(
      "...deleteApiKeyOptions(auth.authClient as ApiKeyAuthClient)"
    )
    expect(settingsComponents).toContain("deleteApiKey.mutate({")
    expect(settingsComponents).toContain("keyId: props.apiKey.id")
    expect(settingsComponents).toContain("onOpenChange(false)")
    expect(settingsComponents).toContain("apiKey.start")
    expect(settingsComponents).toContain('"*".repeat(16)')
    expect(settingsComponents).toContain(
      "apiKeyLocalization.deleteApiKeyWarning"
    )
    expect(settingsComponents).toContain("apiKeyLocalization.newApiKeyWarning")
    expect(settingsComponents).toContain(
      "auth.localization.settings.copyToClipboard"
    )
    expect(settingsComponents).toContain("apiKeyLocalization.dismissNewKey")
  })

  it("wires passkey list, add, and delete dialogs to Solid passkey mutations", () => {
    const settingsComponents = readFileSync(
      resolve(__dirname, "../src/routes/settings/-route-components.tsx"),
      "utf8"
    )

    expect(settingsComponents).toContain("passkeyLocalization")
    expect(settingsComponents).toContain("type ListedPasskey")
    expect(settingsComponents).toContain("const [isAddDialogOpen")
    expect(settingsComponents).toContain("const addPasskey = createMutation")
    expect(settingsComponents).toContain(
      "...addPasskeyOptions(auth.authClient as PasskeyAuthClient)"
    )
    expect(settingsComponents).toContain(
      "onPasskeyAdded={() => passkeys.refetch()}"
    )
    expect(settingsComponents).toContain("props.onPasskeyAdded()")
    expect(settingsComponents).toContain("addPasskey.mutate(")
    expect(settingsComponents).toContain("name ? { name } : undefined")
    expect(settingsComponents).toContain("props.onOpenChange(false)")
    expect(settingsComponents).toContain("const deletePasskey = createMutation")
    expect(settingsComponents).toContain(
      "...deletePasskeyOptions(auth.authClient as PasskeyAuthClient)"
    )
    expect(settingsComponents).toContain("deletePasskey.mutate({")
    expect(settingsComponents).toContain("id: props.passkey.id")
    expect(settingsComponents).toContain(
      "passkeyLocalization.deletePasskey.replace"
    )
    expect(settingsComponents).toContain(
      "passkeyLocalization.deletePasskeyTitle"
    )
    expect(settingsComponents).toContain(
      "passkeyLocalization.deletePasskeyWarning"
    )
    expect(settingsComponents).toContain("passkeyLocalization.name")
    expect(settingsComponents).toContain("auth.localization.settings.optional")
    expect(settingsComponents).toContain("auth.localization.settings.cancel")
    expect(settingsComponents).toContain("Fingerprint")
    expect(settingsComponents).not.toContain("Loading passkeys…")
    expect(settingsComponents).not.toMatch(
      /<Button disabled size="sm" type="button" variant="outline">\s*Revoke/
    )
  })
})
