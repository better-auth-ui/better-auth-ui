import { skipToken } from "@tanstack/query-core"
import { describe, expect, expectTypeOf, it, vi } from "vitest"
import {
  type AuthClient,
  accountInfoOptions,
  authMutationKeys,
  authQueryKeys,
  changeEmailOptions,
  changePasswordOptions,
  deleteUserOptions,
  linkSocialOptions,
  listAccountsOptions,
  listSessionsOptions,
  requestPasswordResetOptions,
  resetPasswordOptions,
  revokeSessionOptions,
  sendVerificationEmailOptions,
  signInEmailOptions,
  signInSocialOptions,
  signOutOptions,
  signUpEmailOptions,
  unlinkAccountOptions
} from "../src"
import {
  type ApiKeyAuthClient,
  apiKeyMutationKeys,
  apiKeyQueryKeys,
  createApiKeyOptions,
  deleteApiKeyOptions
} from "../src/plugins/api-key"
import { deleteUserMutationKeys } from "../src/plugins/delete-user"
import {
  type MagicLinkAuthClient,
  magicLinkMutationKeys,
  signInMagicLinkOptions
} from "../src/plugins/magic-link"
import {
  type MultiSessionAuthClient,
  multiSessionMutationKeys,
  multiSessionQueryKeys,
  revokeMultiSessionOptions,
  setActiveSessionOptions
} from "../src/plugins/multi-session"
import type { OrganizationAuthClient } from "../src/plugins/organization/organization-auth-client"
import {
  addPasskeyOptions,
  deletePasskeyOptions,
  passkeyMutationKeys,
  passkeyQueryKeys,
  signInPasskeyOptions
} from "../src/plugins/passkey"
import type { PasskeyAuthClient } from "../src/plugins/passkey/passkey-auth-client"
import type { UsernameAuthClient } from "../src/plugins/username/username-auth-client"

const signal = new AbortController().signal

type HasStore<T> = "$store" extends keyof T ? true : false

describe("core base endpoint option factories", () => {
  it("omits Solid-only store members from core auth client types", () => {
    expectTypeOf<HasStore<AuthClient>>().toEqualTypeOf<false>()
    expectTypeOf<HasStore<MagicLinkAuthClient>>().toEqualTypeOf<false>()
    expectTypeOf<HasStore<MultiSessionAuthClient>>().toEqualTypeOf<false>()
    expectTypeOf<HasStore<PasskeyAuthClient>>().toEqualTypeOf<false>()
    expectTypeOf<HasStore<ApiKeyAuthClient>>().toEqualTypeOf<false>()
    expectTypeOf<HasStore<UsernameAuthClient>>().toEqualTypeOf<false>()
    expectTypeOf<HasStore<OrganizationAuthClient>>().toEqualTypeOf<false>()
  })

  it("builds base user-scoped query options", async () => {
    const authClient = {
      accountInfo: vi.fn(async (params) => ({ data: params.query.accountId })),
      listAccounts: vi.fn(async () => ({ data: ["github"] })),
      listSessions: vi.fn(async () => ({ data: ["session-1"] }))
    }

    const accountInfo = accountInfoOptions(authClient as never, "user-1", {
      query: { accountId: "acct-1" },
      fetchOptions: { credentials: "include" }
    } as never)
    const listAccounts = listAccountsOptions(authClient as never, "user-1")
    const listSessions = listSessionsOptions(authClient as never, "user-1")

    expect(accountInfo.queryKey).toEqual(
      authQueryKeys.accountInfo("user-1", { accountId: "acct-1" })
    )
    expect(listAccounts.queryKey).toEqual(authQueryKeys.listAccounts("user-1"))
    expect(listSessions.queryKey).toEqual(authQueryKeys.listSessions("user-1"))

    await expect(
      (
        accountInfo as {
          queryFn?: (context: { signal: AbortSignal }) => unknown
        }
      ).queryFn?.({ signal })
    ).resolves.toEqual({ data: "acct-1" })
    expect(authClient.accountInfo).toHaveBeenCalledWith({
      query: { accountId: "acct-1" },
      fetchOptions: { credentials: "include", signal, throw: true }
    })

    expect(accountInfoOptions(authClient as never).queryFn).toBe(skipToken)
    expect(
      accountInfoOptions(authClient as never, "user-1", {} as never).queryFn
    ).toBe(skipToken)
    expect(listAccountsOptions(authClient as never).queryFn).toBe(skipToken)
    expect(listSessionsOptions(authClient as never).queryFn).toBe(skipToken)
  })

  it("builds base mutation options and keeps deleteUser out of auth keys", async () => {
    const authClient = {
      requestPasswordReset: vi.fn(async (params) => ({ data: params.email })),
      resetPassword: vi.fn(async (params) => ({ data: params.token })),
      sendVerificationEmail: vi.fn(async (params) => ({ data: params.email })),
      signIn: {
        email: vi.fn(async (params) => ({ data: params.email })),
        social: vi.fn(async (params) => ({ data: params.provider }))
      },
      signOut: vi.fn(async (params) => ({ data: params.fetchOptions.throw })),
      signUp: {
        email: vi.fn(async (params) => ({ data: params.email }))
      },
      changeEmail: vi.fn(async (params) => ({ data: params.newEmail })),
      changePassword: vi.fn(async () => ({ data: true })),
      deleteUser: vi.fn(async (params) => ({ data: params.callbackURL })),
      linkSocial: vi.fn(async (params) => ({ data: params.provider })),
      revokeSession: vi.fn(async (params) => ({ data: params.token })),
      unlinkAccount: vi.fn(async (params) => ({ data: params.providerId }))
    }

    const requestReset = requestPasswordResetOptions(authClient as never)
    const resetPassword = resetPasswordOptions(authClient as never)
    const verification = sendVerificationEmailOptions(authClient as never)
    const signInEmail = signInEmailOptions(authClient as never)
    const signInSocial = signInSocialOptions(authClient as never)
    const signOut = signOutOptions(authClient as never)
    const signUpEmail = signUpEmailOptions(authClient as never)
    const changeEmail = changeEmailOptions(authClient as never)
    const changePassword = changePasswordOptions(authClient as never)
    const deleteUser = deleteUserOptions(authClient as never)
    const linkSocial = linkSocialOptions(authClient as never)
    const revokeSession = revokeSessionOptions(authClient as never)
    const unlinkAccount = unlinkAccountOptions(authClient as never)

    expect(requestReset.mutationKey).toEqual(
      authMutationKeys.requestPasswordReset
    )
    expect(resetPassword.mutationKey).toEqual(authMutationKeys.resetPassword)
    expect(verification.mutationKey).toEqual(
      authMutationKeys.sendVerificationEmail
    )
    expect(signInEmail.mutationKey).toEqual(authMutationKeys.signIn.email)
    expect(signInSocial.mutationKey).toEqual(authMutationKeys.signIn.social)
    expect(signOut.mutationKey).toEqual(authMutationKeys.signOut)
    expect(signUpEmail.mutationKey).toEqual(authMutationKeys.signUp.email)
    expect(changeEmail.mutationKey).toEqual(authMutationKeys.changeEmail)
    expect(changePassword.mutationKey).toEqual(authMutationKeys.changePassword)
    expect(deleteUser.mutationKey).toEqual(deleteUserMutationKeys.deleteUser)
    expect(linkSocial.mutationKey).toEqual(authMutationKeys.linkSocial)
    expect(revokeSession.mutationKey).toEqual(authMutationKeys.revokeSession)
    expect(unlinkAccount.mutationKey).toEqual(authMutationKeys.unlinkAccount)
    expect("deleteUser" in authMutationKeys).toBe(false)
    expect(signInEmail.meta).toEqual({ awaits: [authQueryKeys.session] })
    expect(signOut.meta).toEqual({ removes: [authQueryKeys.all] })
    expect(signUpEmail.meta).toEqual({ awaits: [authQueryKeys.session] })
    expect(changeEmail.meta).toEqual({ awaits: [authQueryKeys.session] })

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

    await expect(
      (
        deleteUser as { mutationFn?: (variables: unknown) => unknown }
      ).mutationFn?.({
        callbackURL: "/goodbye",
        fetchOptions: { credentials: "include" }
      })
    ).resolves.toEqual({ data: "/goodbye" })
    expect(authClient.deleteUser).toHaveBeenCalledWith({
      callbackURL: "/goodbye",
      fetchOptions: { credentials: "include", throw: true }
    })
  })

  it("builds plugin mutation options", async () => {
    const authClient = {
      apiKey: {
        create: vi.fn(async (params) => ({ data: params.name })),
        delete: vi.fn(async (params) => ({ data: params.keyId }))
      },
      signIn: {
        magicLink: vi.fn(async (params) => ({ data: params.email })),
        passkey: vi.fn(async (params) => ({ data: params?.email ?? null }))
      },
      multiSession: {
        revoke: vi.fn(async (params) => ({ data: params.sessionToken })),
        setActive: vi.fn(async (params) => ({ data: params.sessionToken }))
      },
      passkey: {
        addPasskey: vi.fn(async (params) => ({ data: params.name ?? null })),
        deletePasskey: vi.fn(async (params) => ({ data: params.id }))
      }
    }

    const userId = "user-1"
    const createApiKey = createApiKeyOptions(authClient as never, userId)
    const deleteApiKey = deleteApiKeyOptions(authClient as never, userId)
    const magicLink = signInMagicLinkOptions(authClient as never)
    const revokeMultiSession = revokeMultiSessionOptions(
      authClient as never,
      userId
    )
    const setActiveSession = setActiveSessionOptions(
      authClient as never,
      userId
    )
    const addPasskey = addPasskeyOptions(authClient as never, userId)
    const deletePasskey = deletePasskeyOptions(authClient as never, userId)
    const signInPasskey = signInPasskeyOptions(authClient as never)

    expect(createApiKey.mutationKey).toEqual(apiKeyMutationKeys.create)
    expect(deleteApiKey.mutationKey).toEqual(apiKeyMutationKeys.delete)
    expect(magicLink.mutationKey).toEqual(magicLinkMutationKeys.signIn)
    expect(revokeMultiSession.mutationKey).toEqual(
      multiSessionMutationKeys.revoke
    )
    expect(setActiveSession.mutationKey).toEqual(
      multiSessionMutationKeys.setActive
    )
    expect(addPasskey.mutationKey).toEqual(passkeyMutationKeys.addPasskey)
    expect(deletePasskey.mutationKey).toEqual(passkeyMutationKeys.deletePasskey)
    expect(signInPasskey.mutationKey).toEqual(passkeyMutationKeys.signIn)
    expect(createApiKey.meta).toEqual({
      awaits: [apiKeyQueryKeys.lists(userId)]
    })
    expect(deleteApiKey.meta).toEqual({
      awaits: [apiKeyQueryKeys.lists(userId)]
    })
    expect(revokeMultiSession.meta).toEqual({
      awaits: [multiSessionQueryKeys.lists(userId)]
    })
    expect(setActiveSession.meta).toEqual({
      awaits: [authQueryKeys.session, multiSessionQueryKeys.lists(userId)]
    })
    expect(addPasskey.meta).toEqual({
      awaits: [passkeyQueryKeys.lists(userId)]
    })
    expect(deletePasskey.meta).toEqual({
      awaits: [passkeyQueryKeys.lists(userId)]
    })
    expect(signInPasskey.meta).toEqual({
      awaits: [authQueryKeys.session]
    })

    await expect(
      (
        createApiKey as { mutationFn?: (variables: unknown) => unknown }
      ).mutationFn?.({
        name: "CI key",
        fetchOptions: { credentials: "include" }
      })
    ).resolves.toEqual({ data: "CI key" })
    expect(authClient.apiKey.create).toHaveBeenCalledWith({
      name: "CI key",
      fetchOptions: { credentials: "include", throw: true }
    })

    await expect(
      (
        addPasskey as { mutationFn?: (variables?: unknown) => unknown }
      ).mutationFn?.()
    ).resolves.toEqual({ data: null })
    expect(authClient.passkey.addPasskey).toHaveBeenCalledWith({
      fetchOptions: { throw: true }
    })

    await expect(
      (
        addPasskey as { mutationFn?: (variables: unknown) => unknown }
      ).mutationFn?.({
        name: "Security key",
        fetchOptions: { credentials: "include" }
      })
    ).resolves.toEqual({ data: "Security key" })
    expect(authClient.passkey.addPasskey).toHaveBeenCalledWith({
      name: "Security key",
      fetchOptions: { credentials: "include", throw: true }
    })
  })
})
