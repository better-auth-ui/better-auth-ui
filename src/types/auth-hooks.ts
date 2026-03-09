import type { Passkey } from "@better-auth/passkey"
import type { BetterFetchError } from "@better-fetch/fetch"
import type { Account, User } from "better-auth"
import type { Member } from "better-auth/plugins/organization"
import type { AnyAuthClient } from "./any-auth-client"
import type { ApiKey } from "./api-key"
import type { AuthClient } from "./auth-client"
import type { Invitation } from "./invitation"
import type { Refetch } from "./refetch"

type AnyAuthSession = AnyAuthClient["$Infer"]["Session"]

type AuthHook<T> = {
    isPending: boolean
    data?: T | null
    error?: BetterFetchError | null
    refetch?: Refetch
}

export type AuthHooks = {
    useSession: () => ReturnType<AnyAuthClient["useSession"]>
    useListAccounts: () => AuthHook<Account[]>
    useAccountInfo: (
        params: Parameters<AuthClient["accountInfo"]>[0]
    ) => AuthHook<{ user: User }>
    useListDeviceSessions: () => AuthHook<AnyAuthClient["$Infer"]["Session"][]>
    useListSessions: () => AuthHook<AnyAuthSession["session"][]>
    useListPasskeys: () => AuthHook<Passkey[]>
    useListApiKeys: () => AuthHook<ApiKey[]>
    useActiveOrganization: () => Partial<
        ReturnType<AuthClient["useActiveOrganization"]>
    >
    useListOrganizations: () => Partial<
        ReturnType<AuthClient["useListOrganizations"]>
    >
    useHasPermission: (
        params: Parameters<AuthClient["organization"]["hasPermission"]>[0]
    ) => AuthHook<{
        error: null
        success: boolean
    }>
    useInvitation: (
        params: Parameters<AuthClient["organization"]["getInvitation"]>[0]
    ) => AuthHook<
        Invitation & {
            organizationName: string
            organizationSlug: string
            organizationLogo?: string
        }
    >
    useListInvitations: (
        params: Parameters<AuthClient["organization"]["listInvitations"]>[0]
    ) => AuthHook<Invitation[]>
    useListUserInvitations: () => AuthHook<Invitation[]>
    useListMembers: (
        params: Parameters<AuthClient["organization"]["listMembers"]>[0]
    ) => AuthHook<{
        members: (Member & { user?: Partial<User> | null })[]
        total: number
    }>
    useListTeams: (params?: { organizationId?: string }) => AuthHook<Team[]>
    useListTeamMembers: (params: { teamId?: string }) => AuthHook<TeamMember[]>
    useListUserTeams: () => AuthHook<Team[]>
    useIsRestoring?: () => boolean
}

export type Team = {
    id: string
    name: string
    organizationId: string
    createdAt: Date
    updatedAt: Date
}

export type TeamMember = {
    id: string
    teamId: string
    userId: string
    createdAt: Date
    user?: Partial<User> | null
}
