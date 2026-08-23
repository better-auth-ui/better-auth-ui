import { organizationQueryKeys } from "@better-auth-ui/core/plugins/organization"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ReactNode } from "react"
import { expect, fn, waitFor, within } from "storybook/test"

import { AuthProvider } from "@/components/auth/auth-provider"
import { Organization } from "@/components/auth/organization/organization"
import { OrganizationDangerZone } from "@/components/auth/organization/organization-danger-zone"
import { OrganizationInvitations } from "@/components/auth/organization/organization-invitations"
import { OrganizationMembers } from "@/components/auth/organization/organization-members"
import { OrganizationPeople } from "@/components/auth/organization/organization-people"
import { OrganizationProfile } from "@/components/auth/organization/organization-profile"
import { OrganizationRoles } from "@/components/auth/organization/organization-roles"
import { OrganizationSettings } from "@/components/auth/organization/organization-settings"
import { OrganizationSwitcher } from "@/components/auth/organization/organization-switcher"
import { OrganizationTeams } from "@/components/auth/organization/organization-teams"
import { OrganizationsSettings } from "@/components/auth/organization/organizations-settings"
import { TeamSwitcher } from "@/components/auth/organization/team-switcher"
import { UserInvitations } from "@/components/auth/organization/user-invitations"
import { Toaster } from "@/components/ui/sonner"
import { organizationPlugin } from "@/lib/auth/organization-plugin"

import {
  createStoryQueryClient,
  StoryLink,
  StoryShell,
  storyActions,
  storyAuthClient,
  storyUserId
} from "../support/story-fixtures"

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

const organizationTeams = [
  {
    createdAt: new Date("2026-01-03T09:00:00Z"),
    id: "team_platform_storybook",
    name: "Platform",
    organizationId: activeOrganization.id,
    updatedAt: new Date("2026-01-03T09:00:00Z")
  },
  {
    createdAt: new Date("2026-01-04T09:00:00Z"),
    id: "team_research_storybook",
    name: "Research",
    organizationId: activeOrganization.id,
    updatedAt: new Date("2026-01-04T09:00:00Z")
  }
]

const organizationRoles = [
  {
    id: "role_billing_storybook",
    organizationId: activeOrganization.id,
    permission: { invoice: ["read", "update"] },
    role: "billing"
  },
  {
    id: "role_support_storybook",
    organizationId: activeOrganization.id,
    permission: { ticket: ["read", "update"] },
    role: "support"
  }
]

const rolePermissions = {
  invoice: {
    actions: {
      read: "View invoices",
      update: "Edit invoices"
    },
    label: "Invoices"
  },
  ticket: {
    actions: {
      read: "View tickets",
      update: "Update tickets"
    },
    label: "Support tickets"
  }
}

function teamsForUser(userId?: string) {
  if (!userId || userId === storyUserId) return organizationTeams
  if (userId === "user_grace_storybook") return organizationTeams.slice(0, 1)
  return []
}

const teamMembers = {
  [organizationTeams[0].id]: [
    {
      id: "team_member_ada_platform_storybook",
      teamId: organizationTeams[0].id,
      userId: storyUserId
    },
    {
      id: "team_member_grace_platform_storybook",
      teamId: organizationTeams[0].id,
      userId: "user_grace_storybook"
    }
  ],
  [organizationTeams[1].id]: [
    {
      id: "team_member_ada_research_storybook",
      teamId: organizationTeams[1].id,
      userId: storyUserId
    }
  ]
}

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

const organizationActions = {
  addTeamMember: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.organization.addTeamMember"
  ),
  acceptInvitation: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.organization.acceptInvitation"
  ),
  cancelInvitation: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.organization.cancelInvitation"
  ),
  createTeam: fn(async () => ({
    data: organizationTeams[0],
    error: null
  })).mockName("authClient.organization.createTeam"),
  createRole: fn(async () => ({
    data: organizationRoles[0],
    error: null
  })).mockName("authClient.organization.createRole"),
  create: fn(async () => ({ data: activeOrganization, error: null })).mockName(
    "authClient.organization.create"
  ),
  delete: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.organization.delete"
  ),
  deleteRole: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.organization.deleteRole"
  ),
  inviteMember: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.organization.inviteMember"
  ),
  leave: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.organization.leave"
  ),
  rejectInvitation: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.organization.rejectInvitation"
  ),
  removeMember: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.organization.removeMember"
  ),
  removeTeam: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.organization.removeTeam"
  ),
  removeTeamMember: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.organization.removeTeamMember"
  ),
  setActive: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.organization.setActive"
  ),
  setActiveTeam: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.organization.setActiveTeam"
  ),
  update: fn(async () => ({ data: activeOrganization, error: null })).mockName(
    "authClient.organization.update"
  ),
  updateMemberRole: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.organization.updateMemberRole"
  ),
  updateTeam: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.organization.updateTeam"
  ),
  updateRole: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.organization.updateRole"
  )
}

const organizationAuthClient = {
  ...(storyAuthClient as object),
  organization: {
    addTeamMember: organizationActions.addTeamMember,
    acceptInvitation: organizationActions.acceptInvitation,
    cancelInvitation: organizationActions.cancelInvitation,
    checkSlug: async () => ({ data: { status: true }, error: null }),
    create: organizationActions.create,
    createRole: organizationActions.createRole,
    createTeam: organizationActions.createTeam,
    delete: organizationActions.delete,
    deleteRole: organizationActions.deleteRole,
    getFullOrganization: async () => ({
      data: activeOrganization,
      error: null
    }),
    hasPermission: async () => ({
      data: { success: true },
      error: null
    }),
    inviteMember: organizationActions.inviteMember,
    leave: organizationActions.leave,
    list: async () => ({ data: organizations, error: null }),
    listInvitations: async () => ({
      data: organizationInvitations,
      error: null
    }),
    listMembers: async () => ({
      data: { members: organizationMembers },
      error: null
    }),
    listRoles: async () => ({ data: organizationRoles, error: null }),
    listTeamMembers: async (params?: { query?: { teamId?: string } }) => ({
      data: params?.query?.teamId
        ? (teamMembers[params.query.teamId as keyof typeof teamMembers] ?? [])
        : [],
      error: null
    }),
    listTeams: async () => ({ data: organizationTeams, error: null }),
    listUserTeams: async (params?: { query?: { userId?: string } }) => ({
      data: teamsForUser(params?.query?.userId),
      error: null
    }),
    listUserInvitations: async () => ({
      data: userInvitations,
      error: null
    }),
    rejectInvitation: organizationActions.rejectInvitation,
    removeMember: organizationActions.removeMember,
    removeTeam: organizationActions.removeTeam,
    removeTeamMember: organizationActions.removeTeamMember,
    setActive: organizationActions.setActive,
    setActiveTeam: organizationActions.setActiveTeam,
    update: organizationActions.update,
    updateMemberRole: organizationActions.updateMemberRole,
    updateRole: organizationActions.updateRole,
    updateTeam: organizationActions.updateTeam
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
    organizationQueryKeys.members.list(storyUserId, {
      organizationId,
      filterField: "role",
      filterValue: "owner",
      filterOperator: "contains",
      limit: 1
    }),
    { members: organizationMembers.slice(0, 1), total: 1 }
  )
  queryClient.setQueryData(
    organizationQueryKeys.invitations.list(storyUserId, { organizationId }),
    organizationInvitations
  )
  queryClient.setQueryData(
    organizationQueryKeys.teams.list(storyUserId, { organizationId }),
    organizationTeams
  )
  queryClient.setQueryData(
    organizationQueryKeys.teams.userList(storyUserId, { organizationId }),
    organizationTeams
  )
  queryClient.setQueryData(
    organizationQueryKeys.roles.list(storyUserId, { organizationId }),
    organizationRoles
  )

  for (const role of organizationRoles) {
    queryClient.setQueryData(
      organizationQueryKeys.members.list(storyUserId, {
        organizationId,
        filterField: "role",
        filterOperator: "contains",
        filterValue: role.role,
        limit: 1
      }),
      { members: [], total: 0 }
    )
  }

  for (const team of organizationTeams) {
    queryClient.setQueryData(
      organizationQueryKeys.teams.members(storyUserId, team.id),
      teamMembers[team.id as keyof typeof teamMembers]
    )
  }

  for (const member of organizationMembers) {
    queryClient.setQueryData(
      organizationQueryKeys.teams.userList(storyUserId, {
        organizationId,
        userId: member.userId
      }),
      teamsForUser(member.userId)
    )
  }

  for (const permissions of [
    { member: ["update"] },
    { member: ["delete"] },
    { team: ["create"] },
    { team: ["update"] },
    { team: ["delete"] },
    { ac: ["read"] },
    { ac: ["create"] },
    { ac: ["update"] },
    { ac: ["delete"] },
    { invitation: ["create"] },
    { invitation: ["cancel"] },
    { organization: ["update"] },
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
      navigate={storyActions.navigate}
      plugins={[
        organizationPlugin({
          dynamicAccessControl: { permissions: rolePermissions },
          slug,
          teams: true
        })
      ]}
      queryClient={createOrganizationQueryClient()}
    >
      <StoryShell width={width}>{children}</StoryShell>
      <Toaster />
    </AuthProvider>
  )
}

const meta = {
  id: "shadcn-ui-plugins-organization",
  title: "shadcn/Plugins/Organization",
  args: { organizationSlug: "acme" },
  argTypes: { organizationSlug: { control: "text" } },
  parameters: { layout: "fullscreen" }
} satisfies Meta<{ organizationSlug?: string }>

export default meta

type Story = StoryObj<{ organizationSlug?: string }>

export const OrganizationSwitcherPreview: Story = {
  name: "Organization switcher",
  render: ({ organizationSlug = "acme" }) => (
    <OrganizationPreview slug={organizationSlug} width="max-w-xl">
      <OrganizationSwitcher />
    </OrganizationPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("open the organization switcher", async () => {
      const trigger = canvas.getByRole("button", { name: /Acme Labs/ })
      await userEvent.click(trigger)
      await expect(trigger).toHaveAttribute("aria-expanded", "true")
    })
  }
}

export const OrganizationPreviewStory: Story = {
  name: "Organization",
  render: ({ organizationSlug = "acme" }) => (
    <OrganizationPreview slug={organizationSlug}>
      <Organization path="settings" />
    </OrganizationPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("switch to organization people", async () => {
      await userEvent.click(canvas.getByRole("tab", { name: "People" }))
      await expect(storyActions.navigate).toHaveBeenCalled()
    })
  }
}

export const OrganizationSettingsPreview: Story = {
  name: "Organization settings",
  render: ({ organizationSlug = "acme" }) => (
    <OrganizationPreview slug={organizationSlug}>
      <OrganizationSettings
        organizationId={activeOrganization.id}
        organizationSlug="acme"
      />
    </OrganizationPreview>
  ),
  play: async ({ canvas, step }) => {
    await step("render organization settings", async () => {
      await expect(
        canvas.getByRole("heading", { name: "Organization profile" })
      ).toBeVisible()
      await expect(
        canvas.getByRole("heading", { name: "Danger zone" })
      ).toBeVisible()
    })
  }
}

export const OrganizationProfilePreview: Story = {
  name: "Organization profile",
  render: ({ organizationSlug = "acme" }) => (
    <OrganizationPreview slug={organizationSlug}>
      <OrganizationProfile />
    </OrganizationPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("update the organization profile", async () => {
      const name = canvas.getByRole("textbox", { name: "Name" })
      await userEvent.clear(name)
      await userEvent.type(name, "Acme Storybook")
      await userEvent.click(
        canvas.getByRole("button", { name: "Save changes" })
      )
      await expect(organizationActions.update).toHaveBeenCalled()
    })
  }
}

export const OrganizationDangerZonePreview: Story = {
  name: "Organization danger zone",
  render: ({ organizationSlug = "acme" }) => (
    <OrganizationPreview slug={organizationSlug}>
      <OrganizationDangerZone />
    </OrganizationPreview>
  ),
  play: async ({ canvas, canvasElement, step, userEvent }) => {
    await step("open the leave organization dialog", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Leave organization" })
      )
      await expect(
        within(canvasElement.ownerDocument.body).getByRole("alertdialog")
      ).toBeInTheDocument()
    })
  }
}

export const OrganizationPeoplePreview: Story = {
  name: "Organization people",
  render: ({ organizationSlug = "acme" }) => (
    <OrganizationPreview slug={organizationSlug}>
      <OrganizationPeople />
    </OrganizationPreview>
  ),
  play: async ({ canvas, canvasElement, step, userEvent }) => {
    await step("open the member invitation dialog", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Invite member" })
      )
      await expect(
        within(canvasElement.ownerDocument.body).getByRole("dialog")
      ).toBeInTheDocument()
    })
  }
}

export const OrganizationMembersPreview: Story = {
  name: "Organization members",
  render: ({ organizationSlug = "acme" }) => (
    <OrganizationPreview slug={organizationSlug}>
      <OrganizationMembers />
    </OrganizationPreview>
  ),
  play: async ({ canvas, canvasElement, step, userEvent }) => {
    await step("show team assignments", async () => {
      await expect(
        canvas.getByRole("columnheader", { name: "Teams" })
      ).toBeVisible()
      await expect(canvas.getByText("Platform, Research")).toBeVisible()
      await expect(canvas.getByText("No teams")).toBeVisible()
    })

    await step("open the member role editor", async () => {
      const graceRow = canvas.getByRole("row", { name: /Grace Hopper/ })
      const trigger = within(graceRow).getByRole("button", {
        name: "Change role"
      })
      await userEvent.click(trigger)
      const dialog = within(canvasElement.ownerDocument.body).getByRole(
        "dialog",
        { name: "Change role" }
      )
      await expect(dialog).toBeVisible()
      await expect(
        within(dialog).getByRole("checkbox", { name: "Admin" })
      ).toBeChecked()
    })
  }
}

export const OrganizationTeamsPreview: Story = {
  name: "Organization teams",
  render: ({ organizationSlug = "acme" }) => (
    <OrganizationPreview slug={organizationSlug}>
      <OrganizationTeams />
    </OrganizationPreview>
  ),
  play: async ({ canvas, step }) => {
    await step("show the compact team list", async () => {
      await expect(canvas.getByRole("heading", { name: "Teams" })).toBeVisible()
      await expect(canvas.getByText("Platform")).toBeVisible()
      await expect(canvas.getByText("Research")).toBeVisible()
      await expect(
        canvas.getAllByRole("button", { name: /Manage/ })
      ).toHaveLength(2)
    })
  }
}

export const CreateTeamDialogPreview: Story = {
  name: "Create team dialog",
  render: ({ organizationSlug = "acme" }) => (
    <OrganizationPreview slug={organizationSlug}>
      <OrganizationTeams />
    </OrganizationPreview>
  ),
  play: async ({ canvas, canvasElement, step, userEvent }) => {
    await step("open team creation", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Create team" }))
      const dialog = within(canvasElement.ownerDocument.body).getByRole(
        "dialog"
      )
      await waitFor(() =>
        expect(
          within(dialog).getByRole("heading", { name: "Create team" })
        ).toBeVisible()
      )
    })
  }
}

export const EditTeamDialogPreview: Story = {
  name: "Edit team dialog",
  render: ({ organizationSlug = "acme" }) => (
    <OrganizationPreview slug={organizationSlug}>
      <OrganizationTeams />
    </OrganizationPreview>
  ),
  play: async ({ canvas, canvasElement, step, userEvent }) => {
    await step("open team management", async () => {
      await userEvent.click(
        canvas.getAllByRole("button", { name: /Manage/ })[0]
      )
      const dialog = within(canvasElement.ownerDocument.body).getByRole(
        "dialog"
      )
      await waitFor(() => {
        expect(within(dialog).getByDisplayValue("Platform")).toBeVisible()
        expect(within(dialog).getByText("Ada Lovelace")).toBeVisible()
        expect(within(dialog).getByText("Grace Hopper")).toBeVisible()
      })
    })
  }
}

export const OrganizationRolesPreview: Story = {
  name: "Organization roles",
  render: ({ organizationSlug = "acme" }) => (
    <OrganizationPreview slug={organizationSlug}>
      <OrganizationRoles organizationId={activeOrganization.id} />
    </OrganizationPreview>
  ),
  play: async ({ canvas, step }) => {
    await step("show the role list", async () => {
      await expect(canvas.getByText("billing")).toBeVisible()
      await expect(canvas.getByText("support")).toBeVisible()
    })
  }
}

export const CreateRoleDialogPreview: Story = {
  name: "Create role dialog",
  render: ({ organizationSlug = "acme" }) => (
    <OrganizationPreview slug={organizationSlug}>
      <OrganizationRoles organizationId={activeOrganization.id} />
    </OrganizationPreview>
  ),
  play: async ({ canvas, canvasElement, step, userEvent }) => {
    await step("open role creation", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Create role" }))
      const dialog = within(canvasElement.ownerDocument.body).getByRole(
        "dialog"
      )
      await waitFor(() =>
        expect(
          within(dialog).getByRole("heading", { name: "Create role" })
        ).toBeVisible()
      )
    })
  }
}

export const EditRoleDialogPreview: Story = {
  name: "Edit role dialog",
  render: ({ organizationSlug = "acme" }) => (
    <OrganizationPreview slug={organizationSlug}>
      <OrganizationRoles organizationId={activeOrganization.id} />
    </OrganizationPreview>
  ),
  play: async ({ canvas, canvasElement, step, userEvent }) => {
    await step("open role editing", async () => {
      await userEvent.click(
        canvas.getAllByRole("button", { name: "Edit role" })[0]
      )
      const dialog = within(canvasElement.ownerDocument.body).getByRole(
        "dialog"
      )
      await waitFor(() => {
        expect(within(dialog).getByDisplayValue("billing")).toBeVisible()
        expect(within(dialog).getByText("Invoices")).toBeVisible()
      })
    })
  }
}

export const TeamSwitcherPreview: Story = {
  name: "Team switcher",
  render: ({ organizationSlug = "acme" }) => (
    <OrganizationPreview slug={organizationSlug} width="max-w-xl">
      <TeamSwitcher
        organizationId={activeOrganization.id}
        teamId={organizationTeams[0].id}
        syncSession
      />
    </OrganizationPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("open the team switcher", async () => {
      const trigger = canvas.getByRole("button", { name: /Platform/ })
      await userEvent.click(trigger)
      await expect(trigger).toHaveAttribute("aria-expanded", "true")
    })
  }
}

export const OrganizationInvitationsPreview: Story = {
  name: "Organization invitations",
  render: ({ organizationSlug = "acme" }) => (
    <OrganizationPreview slug={organizationSlug}>
      <OrganizationInvitations />
    </OrganizationPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("inspect invitation actions", async () => {
      const cancelButtons = await canvas.findAllByRole("button", {
        name: /Cancel invitation/
      })
      await userEvent.hover(cancelButtons[0])
      await expect(cancelButtons).toHaveLength(2)
    })
  }
}

export const OrganizationsSettingsPreview: Story = {
  name: "Organizations settings",
  render: () => (
    <OrganizationPreview slug={null} width="max-w-2xl">
      <OrganizationsSettings />
    </OrganizationPreview>
  ),
  play: async ({ canvas, canvasElement, step, userEvent }) => {
    await step("open organization creation", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Create organization" })
      )
      await expect(
        within(canvasElement.ownerDocument.body).getByRole("dialog")
      ).toBeInTheDocument()
    })
  }
}

export const UserInvitationsPreview: Story = {
  name: "User invitations",
  render: () => (
    <OrganizationPreview slug={null} width="max-w-2xl">
      <UserInvitations />
    </OrganizationPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("accept an organization invitation", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Accept" }))
      await expect(organizationActions.acceptInvitation).toHaveBeenCalled()
    })
  }
}
