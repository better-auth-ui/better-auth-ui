import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import {
  accountInfoOptions,
  authMutationKeys,
  authQueryKeys,
  basePaths,
  changeEmailOptions,
  changePasswordOptions,
  deleteUserOptions,
  linkSocialOptions,
  listAccountsOptions,
  requestPasswordResetOptions,
  resetPasswordOptions,
  revokeSessionOptions,
  sendVerificationEmailOptions,
  signInEmailOptions,
  signInSocialOptions,
  signOutOptions,
  signUpEmailOptions,
  unlinkAccountOptions,
  updateUserOptions,
  viewPaths
} from "@better-auth-ui/core"
import {
  apiKeyMutationKeys,
  apiKeyQueryKeys,
  createApiKeyOptions,
  deleteApiKeyOptions,
  listApiKeysOptions
} from "@better-auth-ui/core/plugins/api-key"
import { deleteUserMutationKeys } from "@better-auth-ui/core/plugins/delete-user"
import {
  changeEmailOtpOptions,
  emailOtpMutationKeys,
  requestEmailChangeOtpOptions,
  requestPasswordResetOtpOptions,
  resetPasswordOtpOptions,
  sendVerificationOtpOptions,
  signInEmailOtpOptions,
  verifyEmailOtpOptions
} from "@better-auth-ui/core/plugins/email-otp"
import {
  magicLinkMutationKeys,
  signInMagicLinkOptions
} from "@better-auth-ui/core/plugins/magic-link"
import {
  listDeviceSessionsOptions,
  multiSessionMutationKeys,
  multiSessionQueryKeys,
  revokeMultiSessionOptions,
  setActiveSessionOptions
} from "@better-auth-ui/core/plugins/multi-session"
import {
  createOrganizationOptions,
  hasPermissionOptions,
  listOrganizationMembersOptions,
  listOrganizationsOptions,
  organizationMutationKeys,
  organizationQueryKeys
} from "@better-auth-ui/core/plugins/organization"
import {
  addPasskeyOptions,
  deletePasskeyOptions,
  listPasskeysOptions,
  passkeyMutationKeys,
  passkeyQueryKeys,
  signInPasskeyOptions
} from "@better-auth-ui/core/plugins/passkey"
import {
  disableTwoFactorOptions,
  enableTwoFactorOptions,
  generateBackupCodesOptions,
  getTotpUriOptions,
  sendTwoFactorOtpOptions,
  twoFactorMutationKeys,
  verifyBackupCodeOptions,
  verifyTotpOptions,
  verifyTwoFactorOtpOptions
} from "@better-auth-ui/core/plugins/two-factor"
import {
  isUsernameAvailableOptions,
  signInUsernameOptions,
  usernameMutationKeys
} from "@better-auth-ui/core/plugins/username"
import { afterEach, describe, expect, it, vi } from "vitest"
import { resolveAuthConfig } from "../src"

const signal = new AbortController().signal

/** Mocks a Better Auth method that echoes one request param as its data. */
type EchoParamFn = (
  params: Record<string, unknown>
) => Promise<{ data: unknown }>

describe("Solid auth behavior parity", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("mirrors React provider defaults and redirect query override", () => {
    vi.stubGlobal("window", { location: { search: "?redirectTo=%2Fsettings" } })
    const navigate = vi.fn<(...args: unknown[]) => unknown>()
    const authClient = { getSession: vi.fn<(...args: unknown[]) => unknown>() }

    const config = resolveAuthConfig({
      authClient,
      navigate,
      redirectTo: "/fallback",
      viewPaths: { auth: { signIn: "custom-sign-in" } }
    } as never)

    expect(config.basePaths).toEqual(basePaths)
    expect(config.viewPaths.auth).toEqual({
      ...viewPaths.auth,
      signIn: "custom-sign-in"
    })
    expect(config.viewPaths.settings).toEqual(viewPaths.settings)
    expect(config.redirectTo).toBe("/settings")

    window.location.search = "?redirectTo=%2Fdashboard"
    expect(config.redirectTo).toBe("/dashboard")

    window.location.search = ""
    expect(config.redirectTo).toBe("/fallback")
    expect(config.navigate).toBe(navigate)
  })

  it("creates user-scoped query options for settings, passkeys, multi-session and API keys", async () => {
    const authClient = {
      accountInfo: vi.fn<
        (params: { query: { accountId: string } }) => Promise<{ data: unknown }>
      >((params) => Promise.resolve({ data: params.query.accountId })),
      listAccounts: vi.fn<() => Promise<{ data: string[] }>>(() =>
        Promise.resolve({
          data: ["github"]
        })
      ),
      passkey: {
        listUserPasskeys: vi.fn<() => Promise<{ data: string[] }>>(() =>
          Promise.resolve({ data: ["passkey-1"] })
        )
      },
      multiSession: {
        listDeviceSessions: vi.fn<() => Promise<{ data: string[] }>>(() =>
          Promise.resolve({ data: ["device-1"] })
        )
      },
      apiKey: {
        list: vi.fn<() => Promise<{ data: { apiKeys: string[] } }>>(() =>
          Promise.resolve({ data: { apiKeys: ["key-1"] } })
        )
      }
    }

    const accountInfo = accountInfoOptions(authClient as never, "user-1", {
      query: { accountId: "acct-1" },
      fetchOptions: { credentials: "include" }
    } as never)
    const listAccounts = listAccountsOptions(authClient as never, "user-1")
    const passkeys = listPasskeysOptions(authClient as never, "user-1")
    const deviceSessions = listDeviceSessionsOptions(
      authClient as never,
      "user-1"
    )
    const apiKeys = listApiKeysOptions(authClient as never, "user-1")

    expect(accountInfo.queryKey).toEqual(
      authQueryKeys.accountInfo("user-1", { accountId: "acct-1" })
    )
    expect(listAccounts.queryKey).toEqual(authQueryKeys.listAccounts("user-1"))
    expect(passkeys.queryKey).toEqual(passkeyQueryKeys.list("user-1"))
    expect(deviceSessions.queryKey).toEqual(
      multiSessionQueryKeys.list("user-1")
    )
    expect(apiKeys.queryKey).toEqual(apiKeyQueryKeys.list("user-1"))
    await expect(
      (
        accountInfo as unknown as {
          queryFn?: (context: { signal: AbortSignal }) => unknown
        }
      ).queryFn?.({ signal })
    ).resolves.toEqual({
      data: "acct-1"
    })
    expect(authClient.accountInfo).toHaveBeenCalledWith({
      query: { accountId: "acct-1" },
      fetchOptions: expect.objectContaining({
        credentials: "include",
        signal,
        throw: true
      })
    })
  })

  it("keeps user-scoped base query wrappers thin around core readiness", () => {
    const listAccountsQuery = readFileSync(
      resolve(__dirname, "../src/hooks/queries/use-list-accounts.ts"),
      "utf8"
    )

    expect(listAccountsQuery).toContain(
      "const session = useSession(authClient, undefined, queryClient)"
    )
    expect(listAccountsQuery).toContain("session.data?.user.id")
    expect(listAccountsQuery).toContain("return useQuery(() =>")
    expect(listAccountsQuery).toContain("listAccountsOptions(")
    expect(listAccountsQuery).toContain("authClient,")
    expect(listAccountsQuery).not.toContain("createUserScopedQuery(")
    expect(listAccountsQuery).not.toContain("getSessionUserId")
    expect(listAccountsQuery).not.toContain("enabled: (queryState)")
    expect(listAccountsQuery).not.toContain("query: never")

    const accountInfoQuery = readFileSync(
      resolve(__dirname, "../src/hooks/queries/use-account-info.ts"),
      "utf8"
    )
    const listSessionsQuery = readFileSync(
      resolve(__dirname, "../src/hooks/queries/use-list-sessions.ts"),
      "utf8"
    )

    expect(accountInfoQuery).toContain("session.data?.user.id")
    expect(accountInfoQuery).not.toContain("getSessionUserId")
    expect(accountInfoQuery).not.toContain("enabled: (queryState)")
    expect(accountInfoQuery).not.toContain("query: never")
    expect(accountInfoQuery).not.toContain("initialData: undefined")
    expect(listSessionsQuery).toContain(
      "const session = useSession(authClient, undefined, queryClient)"
    )
    expect(listSessionsQuery).toContain("session.data?.user.id")
    expect(listSessionsQuery).not.toContain("getSessionUserId")
    expect(listSessionsQuery).not.toContain("enabled: (queryState)")
    expect(listSessionsQuery).not.toContain("query: never")
    expect(listSessionsQuery).not.toContain("initialData: undefined")
  })

  it("uses accessor-style wrappers for base Solid query and mutation files", () => {
    const baseFiles = [
      "../src/hooks/queries/use-account-info.ts",
      "../src/hooks/queries/use-list-accounts.ts",
      "../src/hooks/queries/use-list-sessions.ts",
      "../src/hooks/mutations/use-request-password-reset.ts",
      "../src/hooks/mutations/use-reset-password.ts",
      "../src/hooks/mutations/use-send-verification-email.ts",
      "../src/hooks/mutations/use-sign-in-email.ts",
      "../src/hooks/mutations/use-sign-in-social.ts",
      "../src/hooks/mutations/use-sign-out.ts",
      "../src/hooks/mutations/use-sign-up-email.ts",
      "../src/hooks/mutations/use-change-email.ts",
      "../src/hooks/mutations/use-change-password.ts",
      "../src/hooks/mutations/use-delete-user.ts",
      "../src/hooks/mutations/use-link-social.ts",
      "../src/hooks/mutations/use-revoke-session.ts",
      "../src/hooks/mutations/use-unlink-account.ts",
      "../src/hooks/mutations/use-update-user.ts"
    ]

    for (const file of baseFiles) {
      const source = readFileSync(resolve(__dirname, file), "utf8")

      expect(source).not.toContain("createAuthMutationOptions")
      expect(source).not.toContain("createUserScopedQuery")

      if (file.includes("/mutations/")) {
        expect(source).toMatch(/useMutation\([\s\S]*,\s*queryClient\s*\)/)
        expect(source).toContain("queryClient?: Accessor<QueryClient>")
        expect(source).not.toContain("createMutation")
      } else {
        expect(source).toMatch(/useQuery\([\s\S]*,\s*queryClient\s*\)/)
        expect(source).not.toContain("createQuery")
      }
    }
  })

  it("uses useQuery without skipToken for Solid plugin query hooks", () => {
    const queryFiles = [
      "../src/hooks/use-auth-query.ts",
      "../src/plugins/api-key/hooks/queries/use-list-api-keys.ts",
      "../src/plugins/multi-session/hooks/queries/use-list-device-sessions.ts",
      "../src/plugins/organization/hooks/queries/use-active-organization.ts",
      "../src/plugins/organization/hooks/queries/use-full-organization.ts",
      "../src/plugins/organization/hooks/queries/use-has-permission.ts",
      "../src/plugins/organization/hooks/queries/use-list-invitations.ts",
      "../src/plugins/organization/hooks/queries/use-list-members.ts",
      "../src/plugins/organization/hooks/queries/use-list-organizations.ts",
      "../src/plugins/organization/hooks/queries/use-list-user-invitations.ts",
      "../src/plugins/passkey/hooks/queries/use-list-passkeys.ts"
    ]

    for (const file of queryFiles) {
      const source = readFileSync(resolve(__dirname, file), "utf8")

      expect(source).toMatch(/useQuery\([\s\S]*,\s*queryClient\s*\)/)
      expect(source).not.toContain("createQuery")
      expect(source).not.toContain("skipToken")
    }
  })

  it("delegates Solid plugin query dependency gating to core options", () => {
    const guardedQueryFiles = [
      "../src/plugins/api-key/hooks/queries/use-list-api-keys.ts",
      "../src/plugins/multi-session/hooks/queries/use-list-device-sessions.ts",
      "../src/plugins/organization/hooks/queries/use-active-organization.ts",
      "../src/plugins/organization/hooks/queries/use-full-organization.ts",
      "../src/plugins/organization/hooks/queries/use-has-permission.ts",
      "../src/plugins/organization/hooks/queries/use-list-invitations.ts",
      "../src/plugins/organization/hooks/queries/use-list-members.ts",
      "../src/plugins/organization/hooks/queries/use-list-organizations.ts",
      "../src/plugins/organization/hooks/queries/use-list-user-invitations.ts",
      "../src/plugins/passkey/hooks/queries/use-list-passkeys.ts"
    ]

    for (const file of guardedQueryFiles) {
      const source = readFileSync(resolve(__dirname, file), "utf8")

      expect(source).not.toContain("skipToken")
      expect(source).not.toContain("queryFn:")
      if (file.endsWith("use-list-members.ts")) {
        expect(source).toContain(
          "() => ({ enabled: !options?.().query?.organizationId })"
        )
      } else {
        expect(source).not.toContain("enabled:")
      }
      expect(source).toContain("initialData: passInitialData(initialData)")
    }
  })

  it("threads queryClient through Solid plugin mutation hooks", () => {
    const mutationFiles = [
      "../src/hooks/use-auth-mutation.ts",
      "../src/plugins/api-key/hooks/mutations/use-delete-api-key.ts",
      "../src/plugins/magic-link/hooks/mutations/use-sign-in-magic-link.ts",
      "../src/plugins/multi-session/hooks/mutations/use-revoke-multi-session.ts",
      "../src/plugins/multi-session/hooks/mutations/use-set-active-session.ts",
      "../src/plugins/organization/hooks/mutations/use-accept-invitation.ts",
      "../src/plugins/organization/hooks/mutations/use-cancel-invitation.ts",
      "../src/plugins/organization/hooks/mutations/use-check-slug.ts",
      "../src/plugins/organization/hooks/mutations/use-create-organization.ts",
      "../src/plugins/organization/hooks/mutations/use-invite-member.ts",
      "../src/plugins/organization/hooks/mutations/use-leave-organization.ts",
      "../src/plugins/organization/hooks/mutations/use-reject-invitation.ts",
      "../src/plugins/organization/hooks/mutations/use-remove-member.ts",
      "../src/plugins/organization/hooks/mutations/use-set-active-organization.ts",
      "../src/plugins/organization/hooks/mutations/use-update-member-role.ts",
      "../src/plugins/organization/hooks/mutations/use-update-organization.ts",
      "../src/plugins/passkey/hooks/mutations/use-add-passkey.ts",
      "../src/plugins/passkey/hooks/mutations/use-delete-passkey.ts",
      "../src/plugins/passkey/hooks/mutations/use-sign-in-passkey.ts",
      "../src/plugins/username/hooks/mutations/use-is-username-available.ts"
    ]

    for (const file of mutationFiles) {
      const source = readFileSync(resolve(__dirname, file), "utf8")

      expect(source).toMatch(/useMutation\([\s\S]*,\s*queryClient\s*\)/)
      expect(source).toContain("queryClient?: Accessor<QueryClient>")

      if (file.includes("use-set-active-organization")) {
        expect(source).toContain("const mutationOptions = options?.() ?? {}")
        expect(source).toContain("...mutationOptions")
      } else {
        expect(source).toContain("...(options?.() ?? {})")
      }
    }

    const sessionScopedFiles = [
      "../src/hooks/mutations/use-revoke-session.ts",
      "../src/hooks/mutations/use-unlink-account.ts",
      "../src/plugins/api-key/hooks/mutations/use-create-api-key.ts",
      "../src/plugins/api-key/hooks/mutations/use-delete-api-key.ts",
      "../src/plugins/multi-session/hooks/mutations/use-revoke-multi-session.ts",
      "../src/plugins/multi-session/hooks/mutations/use-set-active-session.ts",
      "../src/plugins/organization/hooks/mutations/use-accept-invitation.ts",
      "../src/plugins/organization/hooks/mutations/use-cancel-invitation.ts",
      "../src/plugins/organization/hooks/mutations/use-create-organization.ts",
      "../src/plugins/organization/hooks/mutations/use-delete-organization.ts",
      "../src/plugins/organization/hooks/mutations/use-invite-member.ts",
      "../src/plugins/organization/hooks/mutations/use-leave-organization.ts",
      "../src/plugins/organization/hooks/mutations/use-reject-invitation.ts",
      "../src/plugins/organization/hooks/mutations/use-remove-member.ts",
      "../src/plugins/organization/hooks/mutations/use-set-active-organization.ts",
      "../src/plugins/organization/hooks/mutations/use-update-member-role.ts",
      "../src/plugins/organization/hooks/mutations/use-update-organization.ts",
      "../src/plugins/passkey/hooks/mutations/use-add-passkey.ts",
      "../src/plugins/passkey/hooks/mutations/use-delete-passkey.ts"
    ]

    for (const file of sessionScopedFiles) {
      const source = readFileSync(resolve(__dirname, file), "utf8")

      expect(source).toContain("useSession(authClient, undefined, queryClient)")
    }

    const activeOrganizationScopedFiles = [
      "../src/plugins/organization/hooks/mutations/use-invite-member.ts",
      "../src/plugins/organization/hooks/mutations/use-update-member-role.ts",
      "../src/plugins/organization/hooks/mutations/use-update-organization.ts"
    ]

    for (const file of activeOrganizationScopedFiles) {
      const source = readFileSync(resolve(__dirname, file), "utf8")

      expect(source).toMatch(
        /useActiveOrganization\(\s*authClient,\s*undefined,\s*queryClient\s*\)/
      )
    }

    const setActiveOrganizationSource = readFileSync(
      resolve(
        __dirname,
        "../src/plugins/organization/hooks/mutations/use-set-active-organization.ts"
      ),
      "utf8"
    )

    expect(setActiveOrganizationSource).toMatch(
      /useListOrganizations\(\s*authClient,\s*undefined,\s*queryClient\s*\)/
    )
    expect(setActiveOrganizationSource).toContain(
      "const mutationQueryClient = useQueryClient(queryClient?.())"
    )
    expect(setActiveOrganizationSource).toContain(
      "mutationQueryClient.cancelQueries"
    )
    expect(setActiveOrganizationSource).toContain(
      "const userOnMutateResult = await mutationOptions.onMutate?.("
    )
    expect(setActiveOrganizationSource).toContain(
      "await mutationOptions.onSuccess?.("
    )
    expect(setActiveOrganizationSource).toContain(
      "await mutationOptions.onError?.("
    )
    expect(setActiveOrganizationSource).toContain(
      "await mutationOptions.onSettled?.("
    )
    expect(setActiveOrganizationSource).toContain(
      "onMutateResult?.userOnMutateResult"
    )
    expect(setActiveOrganizationSource).not.toContain(
      "queryClient.cancelQueries"
    )
  })

  it("creates auth mutation options with shared mutation keys and throwing fetch options", async () => {
    const authClient = {
      signIn: {
        email: vi.fn<EchoParamFn>((params) =>
          Promise.resolve({ data: params["email"] })
        ),
        social: vi.fn<EchoParamFn>((params) =>
          Promise.resolve({
            data: params["provider"]
          })
        )
      },
      signUp: {
        email: vi.fn<EchoParamFn>((params) =>
          Promise.resolve({ data: params["email"] })
        )
      },
      signOut: vi.fn<
        (params: {
          fetchOptions: { throw?: boolean }
        }) => Promise<{ data: unknown }>
      >((params) => Promise.resolve({ data: params.fetchOptions.throw })),
      sendVerificationEmail: vi.fn<EchoParamFn>((params) =>
        Promise.resolve({
          data: params["email"]
        })
      ),
      requestPasswordReset: vi.fn<EchoParamFn>((params) =>
        Promise.resolve({
          data: params["email"]
        })
      ),
      resetPassword: vi.fn<EchoParamFn>((params) =>
        Promise.resolve({
          data: params["token"]
        })
      )
    }

    const signInEmail = signInEmailOptions(authClient as never)
    const signInSocial = signInSocialOptions(authClient as never)
    const signUpEmail = signUpEmailOptions(authClient as never)
    const signOut = signOutOptions(authClient as never)
    const verification = sendVerificationEmailOptions(authClient as never)
    const requestReset = requestPasswordResetOptions(authClient as never)
    const resetPassword = resetPasswordOptions(authClient as never)

    expect(signInEmail.mutationKey).toEqual(authMutationKeys.signIn.email)
    expect(signInSocial.mutationKey).toEqual(authMutationKeys.signIn.social)
    expect(signUpEmail.mutationKey).toEqual(authMutationKeys.signUp.email)
    expect(signOut.mutationKey).toEqual(authMutationKeys.signOut)
    expect(verification.mutationKey).toEqual(
      authMutationKeys.sendVerificationEmail
    )
    expect(requestReset.mutationKey).toEqual(
      authMutationKeys.requestPasswordReset
    )
    expect(resetPassword.mutationKey).toEqual(authMutationKeys.resetPassword)
    await expect(
      (
        signInEmail as { mutationFn?: (variables: unknown) => unknown }
      ).mutationFn?.({
        email: "ada@example.com",
        fetchOptions: { credentials: "include" }
      })
    ).resolves.toEqual({ data: "ada@example.com" })
    expect(authClient.signIn.email).toHaveBeenCalledWith({
      email: "ada@example.com",
      fetchOptions: { credentials: "include", throw: true }
    })
  })

  it("creates plugin and settings mutation options for passkeys, sessions, profile and API keys", async () => {
    const authClient = {
      passkey: {
        addPasskey: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({
            data: "added"
          })
        ),
        deletePasskey: vi.fn<EchoParamFn>((params) =>
          Promise.resolve({
            data: params["id"]
          })
        )
      },
      signIn: {
        passkey: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({
            data: "signed-in"
          })
        ),
        magicLink: vi.fn<EchoParamFn>((params) =>
          Promise.resolve({
            data: params["email"]
          })
        ),
        username: vi.fn<EchoParamFn>((params) =>
          Promise.resolve({
            data: params["username"]
          })
        )
      },
      multiSession: {
        revoke: vi.fn<EchoParamFn>((params) =>
          Promise.resolve({
            data: params["sessionToken"]
          })
        ),
        setActive: vi.fn<EchoParamFn>((params) =>
          Promise.resolve({
            data: params["sessionToken"]
          })
        )
      },
      revokeSession: vi.fn<EchoParamFn>((params) =>
        Promise.resolve({
          data: params["token"]
        })
      ),
      changeEmail: vi.fn<EchoParamFn>((params) =>
        Promise.resolve({
          data: params["newEmail"]
        })
      ),
      changePassword: vi.fn<() => Promise<{ data: boolean }>>(() =>
        Promise.resolve({
          data: true
        })
      ),
      deleteUser: vi.fn<() => Promise<{ data: boolean }>>(() =>
        Promise.resolve({
          data: true
        })
      ),
      linkSocial: vi.fn<EchoParamFn>((params) =>
        Promise.resolve({
          data: params["provider"]
        })
      ),
      unlinkAccount: vi.fn<EchoParamFn>((params) =>
        Promise.resolve({
          data: params["providerId"]
        })
      ),
      updateUser: vi.fn<EchoParamFn>((params) =>
        Promise.resolve({ data: params["name"] })
      ),
      isUsernameAvailable: vi.fn<EchoParamFn>((params) =>
        Promise.resolve({
          data: params["username"]
        })
      ),
      apiKey: {
        create: vi.fn<EchoParamFn>((params) =>
          Promise.resolve({ data: params["name"] })
        ),
        delete: vi.fn<EchoParamFn>((params) =>
          Promise.resolve({ data: params["keyId"] })
        )
      }
    }

    expect(addPasskeyOptions(authClient as never).mutationKey).toEqual(
      passkeyMutationKeys.addPasskey
    )
    expect(deletePasskeyOptions(authClient as never).mutationKey).toEqual(
      passkeyMutationKeys.deletePasskey
    )
    expect(signInPasskeyOptions(authClient as never).mutationKey).toEqual(
      passkeyMutationKeys.signIn
    )
    expect(signInMagicLinkOptions(authClient as never).mutationKey).toEqual(
      magicLinkMutationKeys.signIn
    )
    expect(signInUsernameOptions(authClient as never).mutationKey).toEqual(
      usernameMutationKeys.signIn
    )
    expect(revokeMultiSessionOptions(authClient as never).mutationKey).toEqual(
      multiSessionMutationKeys.revoke
    )
    expect(setActiveSessionOptions(authClient as never).mutationKey).toEqual(
      multiSessionMutationKeys.setActive
    )
    expect(revokeSessionOptions(authClient as never).mutationKey).toEqual(
      authMutationKeys.revokeSession
    )
    expect(changeEmailOptions(authClient as never).mutationKey).toEqual(
      authMutationKeys.changeEmail
    )
    expect(changePasswordOptions(authClient as never).mutationKey).toEqual(
      authMutationKeys.changePassword
    )
    expect(deleteUserOptions(authClient as never).mutationKey).toEqual(
      deleteUserMutationKeys.deleteUser
    )
    expect(linkSocialOptions(authClient as never).mutationKey).toEqual(
      authMutationKeys.linkSocial
    )
    expect(unlinkAccountOptions(authClient as never).mutationKey).toEqual(
      authMutationKeys.unlinkAccount
    )
    expect(updateUserOptions(authClient as never).mutationKey).toEqual(
      authMutationKeys.updateUser
    )
    expect(isUsernameAvailableOptions(authClient as never).mutationKey).toEqual(
      usernameMutationKeys.isUsernameAvailable
    )
    expect(createApiKeyOptions(authClient as never).mutationKey).toEqual(
      apiKeyMutationKeys.create
    )
    expect(deleteApiKeyOptions(authClient as never).mutationKey).toEqual(
      apiKeyMutationKeys.delete
    )

    await expect(
      (
        createApiKeyOptions(authClient as never) as {
          mutationFn?: (variables: unknown) => unknown
        }
      ).mutationFn?.({
        name: "CLI",
        fetchOptions: { credentials: "include" }
      })
    ).resolves.toEqual({ data: "CLI" })
    expect(authClient.apiKey.create).toHaveBeenCalledWith({
      name: "CLI",
      fetchOptions: { credentials: "include", throw: true }
    })
  })

  it("mirrors the React email-OTP and two-factor mutation keys", () => {
    const authClient = {
      emailOtp: {
        sendVerificationOtp: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({ data: "sent" })
        ),
        verifyEmail: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({
            data: "verified"
          })
        ),
        requestPasswordReset: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({ data: "requested" })
        ),
        resetPassword: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({
            data: "reset"
          })
        ),
        requestEmailChange: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({ data: "requested" })
        ),
        changeEmail: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({
            data: "changed"
          })
        )
      },
      signIn: {
        emailOtp: vi.fn<EchoParamFn>((params) =>
          Promise.resolve({ data: params["email"] })
        )
      },
      twoFactor: {
        enable: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({
            data: "enabled"
          })
        ),
        disable: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({
            data: "disabled"
          })
        ),
        getTotpUri: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({
            data: "otpauth://"
          })
        ),
        generateBackupCodes: vi.fn<() => Promise<{ data: string[] }>>(() =>
          Promise.resolve({ data: ["code"] })
        ),
        sendOtp: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({
            data: "sent"
          })
        ),
        verifyTotp: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({
            data: "verified"
          })
        ),
        verifyOtp: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({
            data: "verified"
          })
        ),
        verifyBackupCode: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({
            data: "verified"
          })
        )
      }
    }

    expect(sendVerificationOtpOptions(authClient as never).mutationKey).toEqual(
      emailOtpMutationKeys.sendVerificationOtp
    )
    expect(signInEmailOtpOptions(authClient as never).mutationKey).toEqual(
      emailOtpMutationKeys.signIn
    )
    expect(verifyEmailOtpOptions(authClient as never).mutationKey).toEqual(
      emailOtpMutationKeys.verifyEmail
    )
    expect(
      requestPasswordResetOtpOptions(authClient as never).mutationKey
    ).toEqual(emailOtpMutationKeys.requestPasswordReset)
    expect(resetPasswordOtpOptions(authClient as never).mutationKey).toEqual(
      emailOtpMutationKeys.resetPassword
    )
    expect(
      requestEmailChangeOtpOptions(authClient as never).mutationKey
    ).toEqual(emailOtpMutationKeys.requestEmailChange)
    expect(changeEmailOtpOptions(authClient as never).mutationKey).toEqual(
      emailOtpMutationKeys.changeEmail
    )

    expect(enableTwoFactorOptions(authClient as never).mutationKey).toEqual(
      twoFactorMutationKeys.enable
    )
    expect(disableTwoFactorOptions(authClient as never).mutationKey).toEqual(
      twoFactorMutationKeys.disable
    )
    expect(getTotpUriOptions(authClient as never).mutationKey).toEqual(
      twoFactorMutationKeys.getTotpUri
    )
    expect(generateBackupCodesOptions(authClient as never).mutationKey).toEqual(
      twoFactorMutationKeys.generateBackupCodes
    )
    expect(sendTwoFactorOtpOptions(authClient as never).mutationKey).toEqual(
      twoFactorMutationKeys.sendOtp
    )
    expect(verifyTotpOptions(authClient as never).mutationKey).toEqual(
      twoFactorMutationKeys.verifyTotp
    )
    expect(verifyTwoFactorOtpOptions(authClient as never).mutationKey).toEqual(
      twoFactorMutationKeys.verifyOtp
    )
    expect(verifyBackupCodeOptions(authClient as never).mutationKey).toEqual(
      twoFactorMutationKeys.verifyBackupCode
    )
  })

  it("creates organization query and mutation options with plugin-scoped keys", () => {
    const authClient = {
      organization: {
        list: vi.fn<() => Promise<{ data: never[] }>>(() =>
          Promise.resolve({
            data: []
          })
        ),
        listMembers: vi.fn<() => Promise<{ data: { members: never[] } }>>(() =>
          Promise.resolve({ data: { members: [] } })
        ),
        hasPermission: vi.fn<() => Promise<{ data: { success: boolean } }>>(
          () => Promise.resolve({ data: { success: true } })
        ),
        create: vi.fn<() => Promise<{ data: { id: string } }>>(() =>
          Promise.resolve({
            data: { id: "org-1" }
          })
        )
      }
    }

    const listOrganizations = listOrganizationsOptions(
      authClient as never,
      "user-1"
    )
    const listMembers = listOrganizationMembersOptions(
      authClient as never,
      "user-1",
      { query: { organizationId: "org-1" } } as never
    )
    const permissions = hasPermissionOptions(authClient as never, "user-1", {
      organizationId: "org-1",
      permissions: { organization: ["update"] }
    } as never)
    const createOrganization = createOrganizationOptions(
      authClient as never,
      "user-1"
    )

    expect(listOrganizations.queryKey).toEqual(
      organizationQueryKeys.list("user-1")
    )
    expect(listMembers.queryKey).toEqual(
      organizationQueryKeys.members.list("user-1", {
        organizationId: "org-1"
      })
    )
    expect(permissions.queryKey).toEqual(
      organizationQueryKeys.permissions.has("user-1", {
        organizationId: "org-1",
        permissions: { organization: ["update"] }
      })
    )
    expect(createOrganization.mutationKey).toEqual(
      organizationMutationKeys.create
    )
    expect(createOrganization.meta).toEqual({
      awaits: [organizationQueryKeys.lists("user-1")],
      invalidates: [
        organizationQueryKeys.details("user-1"),
        organizationQueryKeys.fullDetails("user-1"),
        organizationQueryKeys.activeOrganizations("user-1")
      ]
    })
  })

  it("delegates provider-level mutation invalidation to core", () => {
    const source = readFileSync(
      resolve(__dirname, "../src/lib/mutation-invalidator.tsx"),
      "utf8"
    )

    expect(source).toContain("setupMutationInvalidation")
    expect(source).not.toContain("mutation.options?.meta")
    expect(source).not.toContain("mutation.meta")
  })

  describe("mutation meta for cache invalidation", () => {
    const authClient = {
      signIn: {
        email: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({
            data: "ok"
          })
        ),
        social: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({
            data: "ok"
          })
        ),
        passkey: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({
            data: "ok"
          })
        ),
        magicLink: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({
            data: "ok"
          })
        ),
        username: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({
            data: "ok"
          })
        )
      },
      signUp: {
        email: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({
            data: "ok"
          })
        )
      },
      signOut: vi.fn<() => Promise<{ data: string }>>(() =>
        Promise.resolve({
          data: "ok"
        })
      ),
      sendVerificationEmail: vi.fn<() => Promise<{ data: string }>>(() =>
        Promise.resolve({ data: "ok" })
      ),
      requestPasswordReset: vi.fn<() => Promise<{ data: string }>>(() =>
        Promise.resolve({ data: "ok" })
      ),
      resetPassword: vi.fn<() => Promise<{ data: string }>>(() =>
        Promise.resolve({
          data: "ok"
        })
      ),
      updateUser: vi.fn<() => Promise<{ data: string }>>(() =>
        Promise.resolve({
          data: "ok"
        })
      ),
      changeEmail: vi.fn<() => Promise<{ data: string }>>(() =>
        Promise.resolve({
          data: "ok"
        })
      ),
      changePassword: vi.fn<() => Promise<{ data: string }>>(() =>
        Promise.resolve({
          data: "ok"
        })
      ),
      deleteUser: vi.fn<() => Promise<{ data: string }>>(() =>
        Promise.resolve({
          data: "ok"
        })
      ),
      revokeSession: vi.fn<() => Promise<{ data: string }>>(() =>
        Promise.resolve({
          data: "ok"
        })
      ),
      unlinkAccount: vi.fn<() => Promise<{ data: string }>>(() =>
        Promise.resolve({
          data: "ok"
        })
      ),
      linkSocial: vi.fn<() => Promise<{ data: string }>>(() =>
        Promise.resolve({
          data: "ok"
        })
      ),
      isUsernameAvailable: vi.fn<() => Promise<{ data: boolean }>>(() =>
        Promise.resolve({ data: true })
      ),
      passkey: {
        addPasskey: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({
            data: "ok"
          })
        ),
        deletePasskey: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({
            data: "ok"
          })
        )
      },
      multiSession: {
        revoke: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({
            data: "ok"
          })
        ),
        setActive: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({
            data: "ok"
          })
        )
      },
      apiKey: {
        create: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({
            data: "ok"
          })
        ),
        delete: vi.fn<() => Promise<{ data: string }>>(() =>
          Promise.resolve({
            data: "ok"
          })
        )
      }
    }

    it("createAuthMutationOptions includes meta when provided", () => {
      const meta = { awaits: [authQueryKeys.session] }
      const options = signInEmailOptions(authClient as never)

      expect(options.meta).toEqual(meta)
    })

    it("createAuthMutationOptions omits meta when not provided", () => {
      const options = signInSocialOptions(authClient as never)

      expect(options.meta).toBeUndefined()
    })

    it("signInEmail has awaits: [session]", () => {
      const options = signInEmailOptions(authClient as never)
      expect(options.meta).toEqual({ awaits: [authQueryKeys.session] })
    })

    it("signUpEmail has awaits: [session]", () => {
      const options = signUpEmailOptions(authClient as never)
      expect(options.meta).toEqual({ awaits: [authQueryKeys.session] })
    })

    it("updateUser has awaits: [session]", () => {
      const options = updateUserOptions(authClient as never)
      expect(options.meta).toEqual({ awaits: [authQueryKeys.session] })
    })

    it("changeEmail has awaits: [session]", () => {
      const options = changeEmailOptions(authClient as never)
      expect(options.meta).toEqual({ awaits: [authQueryKeys.session] })
    })

    it("signInPasskey has awaits: [session]", () => {
      const options = signInPasskeyOptions(authClient as never)
      expect(options.meta).toEqual({ awaits: [authQueryKeys.session] })
    })

    it("signInUsername has awaits: [session]", () => {
      const options = signInUsernameOptions(authClient as never)
      expect(options.meta).toEqual({ awaits: [authQueryKeys.session] })
    })

    it("mutations without cache needs have no meta", () => {
      expect(signInSocialOptions(authClient as never).meta).toBeUndefined()
      expect(
        sendVerificationEmailOptions(authClient as never).meta
      ).toBeUndefined()
      expect(
        requestPasswordResetOptions(authClient as never).meta
      ).toBeUndefined()
      expect(resetPasswordOptions(authClient as never).meta).toBeUndefined()
      expect(changePasswordOptions(authClient as never).meta).toBeUndefined()
      expect(deleteUserOptions(authClient as never).meta).toBeUndefined()
      expect(signInMagicLinkOptions(authClient as never).meta).toBeUndefined()
      expect(
        isUsernameAvailableOptions(authClient as never).meta
      ).toBeUndefined()
    })

    it("userId-scoped mutations define meta at factory level", () => {
      const userId = "user-1"

      expect(addPasskeyOptions(authClient as never, userId).meta).toEqual({
        awaits: [passkeyQueryKeys.lists(userId)],
        errorPresentation: "inline"
      })
      expect(deletePasskeyOptions(authClient as never, userId).meta).toEqual({
        awaits: [passkeyQueryKeys.lists(userId)]
      })
      expect(revokeSessionOptions(authClient as never, userId).meta).toEqual({
        awaits: [authQueryKeys.listSessions(userId)]
      })
      expect(unlinkAccountOptions(authClient as never, userId).meta).toEqual({
        awaits: [authQueryKeys.listAccounts(userId)]
      })
      expect(createApiKeyOptions(authClient as never, userId).meta).toEqual({
        awaits: [apiKeyQueryKeys.lists(userId)]
      })
      expect(deleteApiKeyOptions(authClient as never, userId).meta).toEqual({
        awaits: [apiKeyQueryKeys.all(userId)]
      })
      expect(
        revokeMultiSessionOptions(authClient as never, userId).meta
      ).toEqual({ awaits: [multiSessionQueryKeys.lists(userId)] })
      expect(setActiveSessionOptions(authClient as never, userId).meta).toEqual(
        {
          awaits: [authQueryKeys.session, multiSessionQueryKeys.lists(userId)]
        }
      )
    })
  })
})
