import { organizationQueryKeys } from "@better-auth-ui/core/plugins/organization"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ReactNode } from "react"
import { expect, fn, within } from "storybook/test"

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
  storyActions,
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

const organizationActions = {
  acceptInvitation: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.organization.acceptInvitation"
  ),
  cancelInvitation: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.organization.cancelInvitation"
  ),
  create: fn(async () => ({ data: activeOrganization, error: null })).mockName(
    "authClient.organization.create"
  ),
  delete: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.organization.delete"
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
  setActive: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.organization.setActive"
  ),
  update: fn(async () => ({ data: activeOrganization, error: null })).mockName(
    "authClient.organization.update"
  ),
  updateMemberRole: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.organization.updateMemberRole"
  )
}

const organizationAuthClient = {
  ...(storyAuthClient as object),
  organization: {
    acceptInvitation: organizationActions.acceptInvitation,
    cancelInvitation: organizationActions.cancelInvitation,
    checkSlug: async () => ({ data: { status: true }, error: null }),
    create: organizationActions.create,
    delete: organizationActions.delete,
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
    listUserInvitations: async () => ({
      data: userInvitations,
      error: null
    }),
    rejectInvitation: organizationActions.rejectInvitation,
    removeMember: organizationActions.removeMember,
    setActive: organizationActions.setActive,
    update: organizationActions.update,
    updateMemberRole: organizationActions.updateMemberRole
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
  play: async ({ canvas, step, userEvent }) => {
    await step("open a member role menu", async () => {
      const trigger = canvas.getAllByRole("button", { name: "Change role" })[1]
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
