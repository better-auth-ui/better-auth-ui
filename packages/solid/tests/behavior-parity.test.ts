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
  createOrganizationMeta,
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
  isUsernameAvailableOptions,
  signInUsernameOptions,
  usernameMutationKeys
} from "@better-auth-ui/core/plugins/username"
import { afterEach, describe, expect, it, vi } from "vitest"
import { resolveAuthConfig } from "../src"

const signal = new AbortController().signal

describe("Solid auth behavior parity", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("mirrors React provider defaults and redirect query override", () => {
    vi.stubGlobal("window", { location: { search: "?redirectTo=%2Fsettings" } })
    const navigate = vi.fn()
    const authClient = { getSession: vi.fn() }

    const config = resolveAuthConfig({
      authClient,
      navigate,
      viewPaths: { auth: { signIn: "custom-sign-in" } }
    } as never)

    expect(config.basePaths).toEqual(basePaths)
    expect(config.viewPaths.auth).toEqual({
      ...viewPaths.auth,
      signIn: "custom-sign-in"
    })
    expect(config.viewPaths.settings).toEqual(viewPaths.settings)
    expect(config.redirectTo).toBe("/settings")
    expect(config.navigate).toBe(navigate)
  })

  it("creates user-scoped query options for settings, passkeys, multi-session and API keys", async () => {
    const authClient = {
      accountInfo: vi.fn(async (params) => ({ data: params.query.accountId })),
      listAccounts: vi.fn(async () => ({ data: ["github"] })),
      passkey: {
        listUserPasskeys: vi.fn(async () => ({ data: ["passkey-1"] }))
      },
      multiSession: {
        listDeviceSessions: vi.fn(async () => ({ data: ["device-1"] }))
      },
      apiKey: {
        list: vi.fn(async () => ({ data: { apiKeys: ["key-1"] } }))
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
      fetchOptions: { credentials: "include", signal, throw: true }
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
    expect(listSessionsQuery).toContain("session?.user.id")
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
        expect(source).toContain("useMutation(() =>")
        expect(source).not.toContain("createMutation")
      } else {
        expect(source).toContain("useQuery(() =>")
        expect(source).not.toContain("createQuery")
      }
    }
  })

  it("creates auth mutation options with shared mutation keys and throwing fetch options", async () => {
    const authClient = {
      signIn: {
        email: vi.fn(async (params) => ({ data: params.email })),
        social: vi.fn(async (params) => ({ data: params.provider }))
      },
      signUp: { email: vi.fn(async (params) => ({ data: params.email })) },
      signOut: vi.fn(async (params) => ({ data: params.fetchOptions.throw })),
      sendVerificationEmail: vi.fn(async (params) => ({ data: params.email })),
      requestPasswordReset: vi.fn(async (params) => ({ data: params.email })),
      resetPassword: vi.fn(async (params) => ({ data: params.token }))
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
        addPasskey: vi.fn(async () => ({ data: "added" })),
        deletePasskey: vi.fn(async (params) => ({ data: params.id }))
      },
      signIn: {
        passkey: vi.fn(async () => ({ data: "signed-in" })),
        magicLink: vi.fn(async (params) => ({ data: params.email })),
        username: vi.fn(async (params) => ({ data: params.username }))
      },
      multiSession: {
        revoke: vi.fn(async (params) => ({ data: params.sessionToken })),
        setActive: vi.fn(async (params) => ({ data: params.sessionToken }))
      },
      revokeSession: vi.fn(async (params) => ({ data: params.token })),
      changeEmail: vi.fn(async (params) => ({ data: params.newEmail })),
      changePassword: vi.fn(async () => ({ data: true })),
      deleteUser: vi.fn(async () => ({ data: true })),
      linkSocial: vi.fn(async (params) => ({ data: params.provider })),
      unlinkAccount: vi.fn(async (params) => ({ data: params.providerId })),
      updateUser: vi.fn(async (params) => ({ data: params.name })),
      isUsernameAvailable: vi.fn(async (params) => ({ data: params.username })),
      apiKey: {
        create: vi.fn(async (params) => ({ data: params.name })),
        delete: vi.fn(async (params) => ({ data: params.keyId }))
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

  it("creates organization query and mutation options with plugin-scoped keys", () => {
    const authClient = {
      organization: {
        list: vi.fn(async () => ({ data: [] })),
        listMembers: vi.fn(async () => ({ data: { members: [] } })),
        hasPermission: vi.fn(async () => ({ data: { success: true } })),
        create: vi.fn(async () => ({ data: { id: "org-1" } }))
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
    const createOrganization = createOrganizationOptions(authClient as never)

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
    expect(createOrganizationMeta("user-1")).toEqual({
      awaits: [organizationQueryKeys.lists("user-1")],
      invalidates: [
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
        email: vi.fn(async () => ({ data: "ok" })),
        social: vi.fn(async () => ({ data: "ok" })),
        passkey: vi.fn(async () => ({ data: "ok" })),
        magicLink: vi.fn(async () => ({ data: "ok" })),
        username: vi.fn(async () => ({ data: "ok" }))
      },
      signUp: { email: vi.fn(async () => ({ data: "ok" })) },
      signOut: vi.fn(async () => ({ data: "ok" })),
      sendVerificationEmail: vi.fn(async () => ({ data: "ok" })),
      requestPasswordReset: vi.fn(async () => ({ data: "ok" })),
      resetPassword: vi.fn(async () => ({ data: "ok" })),
      updateUser: vi.fn(async () => ({ data: "ok" })),
      changeEmail: vi.fn(async () => ({ data: "ok" })),
      changePassword: vi.fn(async () => ({ data: "ok" })),
      deleteUser: vi.fn(async () => ({ data: "ok" })),
      revokeSession: vi.fn(async () => ({ data: "ok" })),
      unlinkAccount: vi.fn(async () => ({ data: "ok" })),
      linkSocial: vi.fn(async () => ({ data: "ok" })),
      isUsernameAvailable: vi.fn(async () => ({ data: true })),
      passkey: {
        addPasskey: vi.fn(async () => ({ data: "ok" })),
        deletePasskey: vi.fn(async () => ({ data: "ok" }))
      },
      multiSession: {
        revoke: vi.fn(async () => ({ data: "ok" })),
        setActive: vi.fn(async () => ({ data: "ok" }))
      },
      apiKey: {
        create: vi.fn(async () => ({ data: "ok" })),
        delete: vi.fn(async () => ({ data: "ok" }))
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
        awaits: [passkeyQueryKeys.lists(userId)]
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
        awaits: [apiKeyQueryKeys.lists(userId)]
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
