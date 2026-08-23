import { organizationQueryKeys } from "@better-auth-ui/core/plugins/organization"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ReactNode } from "react"

import { AuthProvider } from "@/components/auth/auth-provider"
import { Organization } from "@/components/auth/organization/organization"
import { OrganizationDangerZone } from "@/components/auth/organization/organization-danger-zone"
import { OrganizationInvitations } from "@/components/auth/organization/organization-invitations"
import { OrganizationMembers } from "@/components/auth/organization/organization-members"
import { OrganizationPeople } from "@/components/auth/organization/organization-people"
import { OrganizationProfile } from "@/components/auth/organization/organization-profile"
import { OrganizationSettings } from "@/components/auth/organization/organization-settings"
import { OrganizationSwitcher } from "@/components/auth/organization/organization-switcher"
import { OrganizationsSettings } from "@/components/auth/organization/organizations-settings"
import { UserInvitations } from "@/components/auth/organization/user-invitations"
import { Toaster } from "@/components/ui/sonner"
import { organizationPlugin } from "@/lib/auth/organization-plugin"

import {
  createStoryQueryClient,
  StoryLink,
  StoryShell,
  storyAuthClient,
  storyUserId
} from "./story-fixtures"

const organizations = [
  {
    createdAt: new Date("2026-01-01T09:00:00Z"),
    id: "org_acme_storybook",
    logo: null,
    metadata: null,
    name: "Acme Labs",
    slug: "acme"
  },
  {
    createdAt: new Date("2026-01-02T09:00:00Z"),
    id: "org_northwind_storybook",
    logo: null,
    metadata: null,
    name: "Northwind Traders",
    slug: "northwind"
  }
]

const activeOrganization = organizations[0]

const organizationMembers = [
  {
    id: "member_storybook_ada",
    organizationId: activeOrganization.id,
    role: "owner",
    user: {
      email: "ada@example.com",
      image: null,
      name: "Ada Lovelace"
    },
    userId: storyUserId
  },
  {
    id: "member_storybook_grace",
    organizationId: activeOrganization.id,
    role: "admin",
    user: {
      email: "grace@example.com",
      image: null,
      name: "Grace Hopper"
    },
    userId: "user_grace_storybook"
  },
  {
    id: "member_storybook_katherine",
    organizationId: activeOrganization.id,
    role: "member",
    user: {
      email: "katherine@example.com",
      image: null,
      name: "Katherine Johnson"
    },
    userId: "user_katherine_storybook"
  }
]

const organizationInvitations = [
  {
    createdAt: new Date("2026-01-09T10:00:00Z"),
    email: "grace@example.com",
    id: "invitation_storybook_grace",
    role: "admin",
    status: "pending"
  },
  {
    createdAt: new Date("2026-01-10T12:30:00Z"),
    email: "alan@example.com",
    id: "invitation_storybook_alan",
    role: "member",
    status: "pending"
  }
]

const userInvitations = [
  {
    createdAt: new Date("2026-01-08T14:15:00Z"),
    id: "invitation_storybook_billing",
    organizationName: "Billing Guild",
    role: "admin"
  }
]

const organizationAuthClient = {
  ...(storyAuthClient as object),
  organization: {
    acceptInvitation: async () => ({ data: null, error: null }),
    cancelInvitation: async () => ({ data: null, error: null }),
    checkSlug: async () => ({ data: { status: true }, error: null }),
    create: async () => ({ data: activeOrganization, error: null }),
    delete: async () => ({ data: null, error: null }),
    getFullOrganization: async () => ({
      data: activeOrganization,
      error: null
    }),
    hasPermission: async () => ({
      data: { success: true },
      error: null
    }),
    inviteMember: async () => ({ data: null, error: null }),
    leave: async () => ({ data: null, error: null }),
    list: async () => ({ data: organizations, error: null }),
    listInvitations: async () => ({
      data: organizationInvitations,
      error: null
    }),
    listMembers: async () => ({
      data: { members: organizationMembers },
      error: null
    }),
    listUserInvitations: async () => ({
      data: userInvitations,
      error: null
    }),
    rejectInvitation: async () => ({ data: null, error: null }),
    removeMember: async () => ({ data: null, error: null }),
    setActive: async () => ({ data: null, error: null }),
    update: async () => ({ data: activeOrganization, error: null }),
    updateMemberRole: async () => ({ data: null, error: null })
  }
} as never

function createOrganizationQueryClient() {
  const queryClient = createStoryQueryClient()
  const organizationId = activeOrganization.id

  queryClient.setQueryData(
    organizationQueryKeys.list(storyUserId),
    organizations
  )
  queryClient.setQueryData(
    organizationQueryKeys.activeOrganization(storyUserId, {
      organizationSlug: "acme"
    }),
    activeOrganization
  )
  queryClient.setQueryData(
    organizationQueryKeys.members.list(storyUserId, { organizationId }),
    { members: organizationMembers }
  )
  queryClient.setQueryData(
    organizationQueryKeys.invitations.list(storyUserId, { organizationId }),
    organizationInvitations
  )

  for (const permissions of [
    { member: ["update"] },
    { member: ["delete"] },
    { invitation: ["cancel"] },
    { organization: ["delete"] }
  ]) {
    queryClient.setQueryData(
      organizationQueryKeys.permissions.has(storyUserId, {
        organizationId,
        permissions
      }),
      { success: true }
    )
  }

  queryClient.setQueryData(
    organizationQueryKeys.userInvitations.list(storyUserId),
    userInvitations
  )

  return queryClient
}

function OrganizationPreview({
  children,
  slug = "acme",
  width = "max-w-4xl"
}: {
  children: ReactNode
  slug?: string | null
  width?: "max-w-md" | "max-w-xl" | "max-w-2xl" | "max-w-4xl"
}) {
  return (
    <AuthProvider
      authClient={organizationAuthClient}
      Link={StoryLink}
      navigate={() => undefined}
      plugins={[organizationPlugin({ slug })]}
      queryClient={createOrganizationQueryClient()}
    >
      <StoryShell width={width}>{children}</StoryShell>
      <Toaster />
    </AuthProvider>
  )
}

const meta = {
  title: "shadcn/ui/Plugins/Organization",
  parameters: { layout: "fullscreen" }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const OrganizationSwitcherPreview: Story = {
  name: "Organization switcher",
  render: () => (
    <OrganizationPreview width="max-w-xl">
      <OrganizationSwitcher />
    </OrganizationPreview>
  )
}

export const OrganizationPreviewStory: Story = {
  name: "Organization",
  render: () => (
    <OrganizationPreview>
      <Organization path="settings" />
    </OrganizationPreview>
  )
}

export const OrganizationSettingsPreview: Story = {
  name: "Organization settings",
  render: () => (
    <OrganizationPreview>
      <OrganizationSettings
        organizationId={activeOrganization.id}
        organizationSlug="acme"
      />
    </OrganizationPreview>
  )
}

export const OrganizationProfilePreview: Story = {
  name: "Organization profile",
  render: () => (
    <OrganizationPreview>
      <OrganizationProfile />
    </OrganizationPreview>
  )
}

export const OrganizationDangerZonePreview: Story = {
  name: "Organization danger zone",
  render: () => (
    <OrganizationPreview>
      <OrganizationDangerZone />
    </OrganizationPreview>
  )
}

export const OrganizationPeoplePreview: Story = {
  name: "Organization people",
  render: () => (
    <OrganizationPreview>
      <OrganizationPeople />
    </OrganizationPreview>
  )
}

export const OrganizationMembersPreview: Story = {
  name: "Organization members",
  render: () => (
    <OrganizationPreview>
      <OrganizationMembers />
    </OrganizationPreview>
  )
}

export const OrganizationInvitationsPreview: Story = {
  name: "Organization invitations",
  render: () => (
    <OrganizationPreview>
      <OrganizationInvitations />
    </OrganizationPreview>
  )
}

export const OrganizationsSettingsPreview: Story = {
  name: "Organizations settings",
  render: () => (
    <OrganizationPreview slug={null} width="max-w-2xl">
      <OrganizationsSettings />
    </OrganizationPreview>
  )
}

export const UserInvitationsPreview: Story = {
  name: "User invitations",
  render: () => (
    <OrganizationPreview slug={null} width="max-w-2xl">
      <UserInvitations />
    </OrganizationPreview>
  )
}
