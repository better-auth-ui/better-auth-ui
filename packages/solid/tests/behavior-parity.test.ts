import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import {
  authMutationKeys,
  authQueryKeys,
  basePaths,
  viewPaths
} from "@better-auth-ui/core"
import {
  apiKeyMutationKeys,
  magicLinkMutationKeys,
  passkeyMutationKeys
} from "@better-auth-ui/core/plugins"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  accountInfoOptions,
  addPasskeyOptions,
  changeEmailOptions,
  changePasswordOptions,
  createApiKeyOptions,
  deleteApiKeyOptions,
  deletePasskeyOptions,
  deleteUserOptions,
  isUsernameAvailableOptions,
  linkSocialOptions,
  listAccountsOptions,
  listApiKeysOptions,
  listDeviceSessionsOptions,
  listPasskeysOptions,
  requestPasswordResetOptions,
  resetPasswordOptions,
  resolveAuthConfig,
  revokeMultiSessionOptions,
  revokeSessionOptions,
  sendVerificationEmailOptions,
  setActiveSessionOptions,
  signInEmailOptions,
  signInMagicLinkOptions,
  signInPasskeyOptions,
  signInSocialOptions,
  signInUsernameOptions,
  signOutOptions,
  signUpEmailOptions,
  unlinkAccountOptions,
  updateUserOptions
} from "../src"
import { getSessionUserId } from "../src/queries/create-user-scoped-query"

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
    expect(passkeys.queryKey).toEqual(authQueryKeys.listPasskeys("user-1"))
    expect(deviceSessions.queryKey).toEqual(
      authQueryKeys.listDeviceSessions("user-1")
    )
    expect(apiKeys.queryKey).toEqual(authQueryKeys.listApiKeys("user-1"))
    await expect(accountInfo.queryFn?.({ signal } as never)).resolves.toEqual({
      data: "acct-1"
    })
    expect(authClient.accountInfo).toHaveBeenCalledWith({
      query: { accountId: "acct-1" },
      fetchOptions: { credentials: "include", signal, throw: true }
    })
  })

  it("derives user-scoped query IDs from one existing session query result", () => {
    expect(
      getSessionUserId({ data: { user: { id: "user-1" } } } as never)
    ).toBe("user-1")
    expect(getSessionUserId({ data: null } as never)).toBeUndefined()

    const listAccountsQuery = readFileSync(
      resolve(__dirname, "../src/queries/settings/list-accounts-query.ts"),
      "utf8"
    )

    expect(listAccountsQuery).toContain(
      "const session = useSession(authClient)"
    )
    expect(listAccountsQuery).toContain("getSessionUserId(session)")
    expect(listAccountsQuery).not.toContain("getUserId(authClient)")
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
      signInEmail.mutationFn?.({
        email: "ada@example.com",
        fetchOptions: { credentials: "include" }
      } as never)
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
      authMutationKeys.signIn.username
    )
    expect(revokeMultiSessionOptions(authClient as never).mutationKey).toEqual(
      authMutationKeys.multiSession.revoke
    )
    expect(setActiveSessionOptions(authClient as never).mutationKey).toEqual(
      authMutationKeys.multiSession.setActive
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
      authMutationKeys.deleteUser
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
      authMutationKeys.isUsernameAvailable
    )
    expect(createApiKeyOptions(authClient as never).mutationKey).toEqual(
      apiKeyMutationKeys.createApiKey
    )
    expect(deleteApiKeyOptions(authClient as never).mutationKey).toEqual(
      apiKeyMutationKeys.deleteApiKey
    )

    await expect(
      createApiKeyOptions(authClient as never).mutationFn?.({
        name: "CLI",
        fetchOptions: { credentials: "include" }
      } as never)
    ).resolves.toEqual({ data: "CLI" })
    expect(authClient.apiKey.create).toHaveBeenCalledWith({
      name: "CLI",
      fetchOptions: { credentials: "include", throw: true }
    })
  })
})
