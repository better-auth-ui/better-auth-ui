import { authQueryKeys } from "@better-auth-ui/core"
import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { organizationQueryKeys } from "@better-auth-ui/core/plugins/organization"
import { QueryClient } from "@tanstack/solid-query"
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  useNavigate
} from "@tanstack/solid-router"
import type { Organization as BetterAuthOrganization } from "better-auth/client"
import type { JSX } from "solid-js"
import { expect, waitFor, within } from "storybook/test"
import type { Meta, StoryObj } from "storybook-solidjs-vite"
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
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { storyRenders, withStoryActions } from "../support/story-coverage"

const userId = "user_organization_docs"

const sessionData = {
  session: {
    createdAt: new Date("2026-01-12T10:30:00Z"),
    expiresAt: new Date("2026-01-12T11:30:00Z"),
    id: "session_organization_docs",
    token: "",
    updatedAt: new Date("2026-01-12T10:30:00Z"),
    userId
  },
  user: {
    email: "ada@example.com",
    emailVerified: true,
    id: userId,
    image: null,
    name: "Ada Lovelace"
  }
}

const organizations = [
  {
    createdAt: new Date("2026-01-01T09:00:00Z"),
    id: "org_acme_docs",
    logo: null,
    metadata: null,
    name: "Acme Labs",
    slug: "acme"
  },
  {
    createdAt: new Date("2026-01-02T09:00:00Z"),
    id: "org_northwind_docs",
    logo: null,
    metadata: null,
    name: "Northwind Traders",
    slug: "northwind"
  }
] satisfies BetterAuthOrganization[]

const activeOrganization = organizations[0]

const organizationMembers = [
  {
    id: "member_docs_ada",
    organizationId: "org_acme_docs",
    role: "owner",
    user: {
      email: "ada@example.com",
      image: null,
      name: "Ada Lovelace"
    },
    userId
  },
  {
    id: "member_docs_grace",
    organizationId: "org_acme_docs",
    role: "admin",
    user: {
      email: "grace@example.com",
      image: null,
      name: "Grace Hopper"
    },
    userId: "user_grace_docs"
  },
  {
    id: "member_docs_katherine",
    organizationId: "org_acme_docs",
    role: "member",
    user: {
      email: "katherine@example.com",
      image: null,
      name: "Katherine Johnson"
    },
    userId: "user_katherine_docs"
  }
]

const organizationTeams = [
  {
    createdAt: new Date("2026-01-03T09:00:00Z"),
    id: "team_platform_docs",
    name: "Platform",
    organizationId: activeOrganization.id,
    updatedAt: new Date("2026-01-03T09:00:00Z")
  },
  {
    createdAt: new Date("2026-01-04T09:00:00Z"),
    id: "team_research_docs",
    name: "Research",
    organizationId: activeOrganization.id,
    updatedAt: new Date("2026-01-04T09:00:00Z")
  }
]

const organizationRoles = [
  {
    id: "role_billing_docs",
    organizationId: activeOrganization.id,
    permission: { invoice: ["read", "update"] },
    role: "billing"
  },
  {
    id: "role_support_docs",
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

function teamsForUser(targetUserId?: string) {
  if (!targetUserId || targetUserId === userId) return organizationTeams
  if (targetUserId === "user_grace_docs") return organizationTeams.slice(0, 1)
  return []
}

const teamMembers = {
  [organizationTeams[0].id]: [
    {
      id: "team_member_ada_platform_docs",
      teamId: organizationTeams[0].id,
      userId
    },
    {
      id: "team_member_grace_platform_docs",
      teamId: organizationTeams[0].id,
      userId: "user_grace_docs"
    }
  ],
  [organizationTeams[1].id]: [
    {
      id: "team_member_ada_research_docs",
      teamId: organizationTeams[1].id,
      userId
    }
  ]
}

const northwindMembers = [
  {
    id: "member_docs_ada_northwind",
    organizationId: "org_northwind_docs",
    role: "admin",
    user: {
      email: "ada@example.com",
      image: null,
      name: "Ada Lovelace"
    },
    userId
  }
]

const organizationInvitations = [
  {
    createdAt: new Date("2026-01-09T10:00:00Z"),
    email: "grace@example.com",
    id: "invitation_docs_grace",
    role: "admin",
    status: "pending"
  },
  {
    createdAt: new Date("2026-01-10T12:30:00Z"),
    email: "alan@example.com",
    id: "invitation_docs_alan",
    role: "member",
    status: "pending"
  },
  {
    createdAt: new Date("2026-01-07T16:45:00Z"),
    email: "dorothy@example.com",
    id: "invitation_docs_dorothy",
    role: "owner",
    status: "accepted"
  },
  {
    createdAt: new Date("2026-01-06T15:20:00Z"),
    email: "margaret@example.com",
    id: "invitation_docs_margaret",
    role: "admin",
    status: "rejected"
  },
  {
    createdAt: new Date("2026-01-05T11:10:00Z"),
    email: "hedy@example.com",
    id: "invitation_docs_hedy",
    role: "member",
    status: "canceled"
  }
]

const userInvitations = [
  {
    createdAt: new Date("2026-01-08T14:15:00Z"),
    id: "invitation_docs_billing",
    organizationName: "Billing Guild",
    role: "admin"
  }
]

const mockAuthClient = withStoryActions(
  {
    getSession: async () => sessionData,
    organization: {
      addTeamMember: async () => null,
      acceptInvitation: async () => null,
      cancelInvitation: async () => null,
      checkSlug: async () => ({ status: true }),
      create: async () => activeOrganization,
      createRole: async () => organizationRoles[0],
      createTeam: async () => organizationTeams[0],
      delete: async () => null,
      deleteRole: async () => null,
      getFullOrganization: async () => activeOrganization,
      hasPermission: async () => ({ success: true }),
      inviteMember: async () => null,
      leave: async () => null,
      list: async () => organizations,
      listInvitations: async () => organizationInvitations,
      listMembers: async (params?: {
        query?: { organizationId?: string }
      }) => ({
        members:
          params?.query?.organizationId === "org_northwind_docs"
            ? northwindMembers
            : organizationMembers
      }),
      listRoles: async () => organizationRoles,
      listTeamMembers: async (params?: { query?: { teamId?: string } }) =>
        params?.query?.teamId
          ? (teamMembers[params.query.teamId as keyof typeof teamMembers] ?? [])
          : [],
      listTeams: async () => organizationTeams,
      listUserTeams: async (params?: { query?: { userId?: string } }) =>
        teamsForUser(params?.query?.userId),
      listUserInvitations: async () => userInvitations,
      rejectInvitation: async () => null,
      removeMember: async () => null,
      removeTeam: async () => null,
      removeTeamMember: async () => null,
      setActive: async () => null,
      setActiveTeam: async () => null,
      update: async () => activeOrganization,
      updateMemberRole: async () => null,
      updateRole: async () => null,
      updateTeam: async () => null
    }
  },
  "authClient"
) as unknown as OrganizationAuthClient

function createStoryQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Number.POSITIVE_INFINITY
      }
    }
  })

  queryClient.setQueryData(authQueryKeys.session, sessionData)
  queryClient.setQueryData(organizationQueryKeys.list(userId), organizations)
  queryClient.setQueryData(
    organizationQueryKeys.activeOrganization(userId, {
      organizationSlug: "acme"
    }),
    activeOrganization
  )
  queryClient.setQueryData(
    organizationQueryKeys.members.list(userId, {
      organizationId: "org_acme_docs"
    }),
    { members: organizationMembers }
  )
  queryClient.setQueryData(
    organizationQueryKeys.members.list(userId, {
      organizationId: "org_acme_docs",
      filterField: "role",
      filterValue: "owner",
      filterOperator: "contains",
      limit: 1
    }),
    { members: organizationMembers.slice(0, 1), total: 1 }
  )
  queryClient.setQueryData(
    organizationQueryKeys.members.list(userId, {
      organizationId: "org_northwind_docs"
    }),
    { members: northwindMembers }
  )
  queryClient.setQueryData(
    organizationQueryKeys.invitations.list(userId, {
      organizationId: "org_acme_docs"
    }),
    organizationInvitations
  )
  queryClient.setQueryData(
    organizationQueryKeys.teams.list(userId, {
      organizationId: "org_acme_docs"
    }),
    organizationTeams
  )
  queryClient.setQueryData(
    organizationQueryKeys.teams.userList(userId, {
      organizationId: "org_acme_docs"
    }),
    organizationTeams
  )
  queryClient.setQueryData(
    organizationQueryKeys.roles.list(userId, {
      organizationId: "org_acme_docs"
    }),
    organizationRoles
  )

  for (const role of organizationRoles) {
    queryClient.setQueryData(
      organizationQueryKeys.members.list(userId, {
        organizationId: "org_acme_docs",
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
      organizationQueryKeys.teams.members(userId, team.id),
      teamMembers[team.id as keyof typeof teamMembers]
    )
  }

  for (const member of organizationMembers) {
    queryClient.setQueryData(
      organizationQueryKeys.teams.userList(userId, {
        organizationId: "org_acme_docs",
        userId: member.userId
      }),
      teamsForUser(member.userId)
    )
  }
  queryClient.setQueryData(
    organizationQueryKeys.permissions.has(userId, {
      organizationId: "org_acme_docs",
      permissions: { member: ["update"] }
    }),
    { success: true }
  )
  queryClient.setQueryData(
    organizationQueryKeys.permissions.has(userId, {
      organizationId: "org_acme_docs",
      permissions: { member: ["delete"] }
    }),
    { success: true }
  )
  queryClient.setQueryData(
    organizationQueryKeys.permissions.has(userId, {
      organizationId: "org_acme_docs",
      permissions: { team: ["create"] }
    }),
    { success: true }
  )
  queryClient.setQueryData(
    organizationQueryKeys.permissions.has(userId, {
      organizationId: "org_acme_docs",
      permissions: { team: ["update"] }
    }),
    { success: true }
  )
  queryClient.setQueryData(
    organizationQueryKeys.permissions.has(userId, {
      organizationId: "org_acme_docs",
      permissions: { team: ["delete"] }
    }),
    { success: true }
  )
  for (const permissions of [
    { ac: ["read"] },
    { ac: ["create"] },
    { ac: ["update"] },
    { ac: ["delete"] }
  ]) {
    queryClient.setQueryData(
      organizationQueryKeys.permissions.has(userId, {
        organizationId: "org_acme_docs",
        permissions
      }),
      { success: true }
    )
  }
  queryClient.setQueryData(
    organizationQueryKeys.permissions.has(userId, {
      organizationId: "org_acme_docs",
      permissions: { invitation: ["create"] }
    }),
    { success: true }
  )
  queryClient.setQueryData(
    organizationQueryKeys.permissions.has(userId, {
      organizationId: "org_acme_docs",
      permissions: { invitation: ["cancel"] }
    }),
    { success: true }
  )
  queryClient.setQueryData(
    organizationQueryKeys.permissions.has(userId, {
      organizationId: "org_acme_docs",
      permissions: { organization: ["update"] }
    }),
    { success: true }
  )
  queryClient.setQueryData(
    organizationQueryKeys.permissions.has(userId, {
      organizationId: "org_acme_docs",
      permissions: { organization: ["delete"] }
    }),
    { success: true }
  )
  queryClient.setQueryData(
    organizationQueryKeys.userInvitations.list(userId),
    userInvitations
  )

  return queryClient
}

type OrganizationStoryProviderProps = {
  children: () => JSX.Element
  queryClient: QueryClient
  slug?: string | null
}

function OrganizationStoryProvider(props: OrganizationStoryProviderProps) {
  const navigate = useNavigate()

  return (
    <AuthProvider
      authClient={mockAuthClient}
      navigate={navigate}
      plugins={[
        organizationPlugin({
          dynamicAccessControl: { permissions: rolePermissions },
          slug: props.slug,
          teams: true
        })
      ]}
      queryClient={props.queryClient}
    >
      {props.children}
    </AuthProvider>
  )
}

function createStoryRouter(component: () => JSX.Element) {
  const rootRoute = createRootRoute({ component })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component
  })

  return createRouter({
    history: createMemoryHistory({ initialEntries: ["/"] }),
    routeTree: rootRoute.addChildren([indexRoute])
  })
}

function OrganizationSwitcherPreviewContent() {
  const queryClient = createStoryQueryClient()

  return (
    <OrganizationStoryProvider queryClient={queryClient} slug="acme">
      {() => (
        <main class="mx-auto flex min-h-[360px] w-full max-w-xl items-center justify-center bg-background p-6 text-foreground">
          <OrganizationSwitcher />
        </main>
      )}
    </OrganizationStoryProvider>
  )
}

function OrganizationPreviewContent(props: {
  organizationView?: "people" | "settings"
}) {
  const queryClient = createStoryQueryClient()

  return (
    <OrganizationStoryProvider queryClient={queryClient} slug="acme">
      {() => (
        <main class="mx-auto min-h-[640px] w-full max-w-3xl bg-background p-6 text-foreground">
          <Organization
            path={props.organizationView ?? "settings"}
            slug="acme"
          />
        </main>
      )}
    </OrganizationStoryProvider>
  )
}

function OrganizationSettingsPreviewContent() {
  const queryClient = createStoryQueryClient()

  return (
    <OrganizationStoryProvider queryClient={queryClient} slug="acme">
      {() => (
        <main class="mx-auto min-h-[600px] w-full max-w-3xl bg-background p-6 text-foreground">
          <OrganizationSettings
            organizationId="org_acme_docs"
            organizationSlug="acme"
          />
        </main>
      )}
    </OrganizationStoryProvider>
  )
}

function OrganizationProfilePreviewContent() {
  const queryClient = createStoryQueryClient()

  return (
    <OrganizationStoryProvider queryClient={queryClient} slug="acme">
      {() => (
        <main class="mx-auto min-h-[420px] w-full max-w-3xl bg-background p-6 text-foreground">
          <OrganizationProfile />
        </main>
      )}
    </OrganizationStoryProvider>
  )
}

function OrganizationDangerZonePreviewContent() {
  const queryClient = createStoryQueryClient()

  return (
    <OrganizationStoryProvider queryClient={queryClient} slug="acme">
      {() => (
        <main class="mx-auto min-h-[320px] w-full max-w-3xl bg-background p-6 text-foreground">
          <OrganizationDangerZone />
        </main>
      )}
    </OrganizationStoryProvider>
  )
}

function OrganizationPeoplePreviewContent() {
  const queryClient = createStoryQueryClient()

  return (
    <OrganizationStoryProvider queryClient={queryClient} slug="acme">
      {() => (
        <main class="mx-auto w-full max-w-5xl bg-background p-6 text-foreground">
          <OrganizationPeople />
        </main>
      )}
    </OrganizationStoryProvider>
  )
}

function OrganizationMembersPreviewContent() {
  const queryClient = createStoryQueryClient()

  return (
    <OrganizationStoryProvider queryClient={queryClient} slug="acme">
      {() => (
        <main class="mx-auto w-full max-w-5xl bg-background p-6 text-foreground">
          <OrganizationMembers />
        </main>
      )}
    </OrganizationStoryProvider>
  )
}

function OrganizationTeamsPreviewContent() {
  const queryClient = createStoryQueryClient()

  return (
    <OrganizationStoryProvider queryClient={queryClient} slug="acme">
      {() => (
        <main class="mx-auto w-full max-w-5xl bg-background p-6 text-foreground">
          <OrganizationTeams />
        </main>
      )}
    </OrganizationStoryProvider>
  )
}

function OrganizationRolesPreviewContent() {
  const queryClient = createStoryQueryClient()

  return (
    <OrganizationStoryProvider queryClient={queryClient} slug="acme">
      {() => (
        <main class="mx-auto w-full max-w-5xl bg-background p-6 text-foreground">
          <OrganizationRoles organizationId={activeOrganization.id} />
        </main>
      )}
    </OrganizationStoryProvider>
  )
}

function TeamSwitcherPreviewContent() {
  const queryClient = createStoryQueryClient()

  return (
    <OrganizationStoryProvider queryClient={queryClient} slug="acme">
      {() => (
        <main class="mx-auto flex min-h-[360px] w-full max-w-xl items-center justify-center bg-background p-6 text-foreground">
          <TeamSwitcher
            organizationId={activeOrganization.id}
            teamId={organizationTeams[0].id}
            syncSession
          />
        </main>
      )}
    </OrganizationStoryProvider>
  )
}

function OrganizationInvitationsPreviewContent() {
  const queryClient = createStoryQueryClient()

  return (
    <OrganizationStoryProvider queryClient={queryClient} slug="acme">
      {() => (
        <main class="mx-auto w-full max-w-5xl bg-background p-6 text-foreground">
          <OrganizationInvitations />
        </main>
      )}
    </OrganizationStoryProvider>
  )
}

function OrganizationsSettingsPreviewContent() {
  const queryClient = createStoryQueryClient()

  return (
    <OrganizationStoryProvider queryClient={queryClient} slug={null}>
      {() => (
        <main class="mx-auto min-h-[520px] w-full max-w-2xl bg-background p-6 text-foreground">
          <OrganizationsSettings />
        </main>
      )}
    </OrganizationStoryProvider>
  )
}

function UserInvitationsPreviewContent() {
  const queryClient = createStoryQueryClient()

  return (
    <OrganizationStoryProvider queryClient={queryClient} slug={null}>
      {() => (
        <main class="mx-auto min-h-[220px] w-full max-w-2xl bg-background p-6 text-foreground">
          <UserInvitations />
        </main>
      )}
    </OrganizationStoryProvider>
  )
}

const meta = {
  id: "zaidan-plugins-organization",
  title: "Zaidan/Plugins/Organization",
  args: { organizationView: "settings" },
  argTypes: {
    organizationView: {
      control: "inline-radio",
      options: ["settings", "people"]
    }
  },
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<{ organizationView?: "people" | "settings" }>

export default meta

type Story = StoryObj<{ organizationView?: "people" | "settings" }>

export const OrganizationSwitcherPreview: Story = {
  play: storyRenders,
  render: () => (
    <RouterProvider
      router={createStoryRouter(OrganizationSwitcherPreviewContent)}
    />
  )
}

export const OrganizationPreview: Story = {
  play: storyRenders,
  render: ({ organizationView = "settings" }) => (
    <RouterProvider
      router={createStoryRouter(() => (
        <OrganizationPreviewContent organizationView={organizationView} />
      ))}
    />
  )
}

export const OrganizationSettingsPreview: Story = {
  play: storyRenders,
  render: () => (
    <RouterProvider
      router={createStoryRouter(OrganizationSettingsPreviewContent)}
    />
  )
}

export const OrganizationProfilePreview: Story = {
  play: storyRenders,
  render: () => (
    <RouterProvider
      router={createStoryRouter(OrganizationProfilePreviewContent)}
    />
  )
}

export const OrganizationDangerZonePreview: Story = {
  play: storyRenders,
  render: () => (
    <RouterProvider
      router={createStoryRouter(OrganizationDangerZonePreviewContent)}
    />
  )
}

export const OrganizationPeoplePreview: Story = {
  play: storyRenders,
  render: () => (
    <RouterProvider
      router={createStoryRouter(OrganizationPeoplePreviewContent)}
    />
  )
}

export const OrganizationMembersPreview: Story = {
  play: async ({ canvas, canvasElement, step, userEvent }) => {
    await step("open the member role editor", async () => {
      const graceRow = await waitFor(() =>
        canvas.getByRole("row", { name: /Grace Hopper/ })
      )
      const trigger = within(graceRow).getByRole("button", {
        name: "Change member role"
      })
      await userEvent.click(trigger)
      const dialog = within(canvasElement.ownerDocument.body).getByRole(
        "dialog",
        { name: "Change member role" }
      )
      await expect(dialog).toBeVisible()
      await expect(
        within(dialog).getByRole("checkbox", { name: "Admin" })
      ).toBeChecked()
    })
  },
  render: () => (
    <RouterProvider
      router={createStoryRouter(OrganizationMembersPreviewContent)}
    />
  )
}

export const OrganizationTeamsPreview: Story = {
  play: async ({ canvas, step }) => {
    await step("show the compact team list", async () => {
      await expect(canvas.getByRole("heading", { name: "Teams" })).toBeVisible()
      await expect(canvas.getByText("Platform")).toBeVisible()
      await expect(canvas.getByText("Research")).toBeVisible()
      await expect(
        canvas.getAllByRole("button", { name: /Manage/ })
      ).toHaveLength(2)
    })
  },
  render: () => (
    <RouterProvider
      router={createStoryRouter(OrganizationTeamsPreviewContent)}
    />
  )
}

export const CreateTeamDialogPreview: Story = {
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
  },
  render: () => (
    <RouterProvider
      router={createStoryRouter(OrganizationTeamsPreviewContent)}
    />
  )
}

export const EditTeamDialogPreview: Story = {
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
  },
  render: () => (
    <RouterProvider
      router={createStoryRouter(OrganizationTeamsPreviewContent)}
    />
  )
}

export const OrganizationRolesPreview: Story = {
  play: async ({ canvas, step }) => {
    await step("show the role list", async () => {
      await expect(canvas.getByText("billing")).toBeVisible()
      await expect(canvas.getByText("support")).toBeVisible()
    })
  },
  render: () => (
    <RouterProvider
      router={createStoryRouter(OrganizationRolesPreviewContent)}
    />
  )
}

export const CreateRoleDialogPreview: Story = {
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
  },
  render: () => (
    <RouterProvider
      router={createStoryRouter(OrganizationRolesPreviewContent)}
    />
  )
}

export const EditRoleDialogPreview: Story = {
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
  },
  render: () => (
    <RouterProvider
      router={createStoryRouter(OrganizationRolesPreviewContent)}
    />
  )
}

export const TeamSwitcherPreview: Story = {
  play: storyRenders,
  render: () => (
    <RouterProvider router={createStoryRouter(TeamSwitcherPreviewContent)} />
  )
}

export const OrganizationInvitationsPreview: Story = {
  play: storyRenders,
  render: () => (
    <RouterProvider
      router={createStoryRouter(OrganizationInvitationsPreviewContent)}
    />
  )
}

export const OrganizationsSettingsPreview: Story = {
  play: storyRenders,
  render: () => (
    <RouterProvider
      router={createStoryRouter(OrganizationsSettingsPreviewContent)}
    />
  )
}

export const UserInvitationsPreview: Story = {
  play: storyRenders,
  render: () => (
    <RouterProvider router={createStoryRouter(UserInvitationsPreviewContent)} />
  )
}
