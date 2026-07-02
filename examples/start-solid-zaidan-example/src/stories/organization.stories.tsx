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
import type { Meta, StoryObj } from "storybook-solidjs-vite"
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
import { organizationPlugin } from "@/lib/auth/organization-plugin"

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

const mockAuthClient = {
  getSession: async () => sessionData,
  organization: {
    acceptInvitation: async () => null,
    cancelInvitation: async () => null,
    checkSlug: async () => ({ status: true }),
    create: async () => activeOrganization,
    delete: async () => null,
    getFullOrganization: async () => activeOrganization,
    hasPermission: async () => ({ success: true }),
    inviteMember: async () => null,
    leave: async () => null,
    list: async () => organizations,
    listInvitations: async () => organizationInvitations,
    listMembers: async (params?: { query?: { organizationId?: string } }) => ({
      members:
        params?.query?.organizationId === "org_northwind_docs"
          ? northwindMembers
          : organizationMembers
    }),
    listUserInvitations: async () => userInvitations,
    rejectInvitation: async () => null,
    removeMember: async () => null,
    setActive: async () => null,
    update: async () => activeOrganization,
    updateMemberRole: async () => null
  }
} as unknown as OrganizationAuthClient

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
      permissions: { invitation: ["cancel"] }
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
      plugins={[organizationPlugin({ slug: props.slug })]}
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

function OrganizationPreviewContent() {
  const queryClient = createStoryQueryClient()

  return (
    <OrganizationStoryProvider queryClient={queryClient} slug="acme">
      {() => (
        <main class="mx-auto min-h-[640px] w-full max-w-3xl bg-background p-6 text-foreground">
          <Organization path="settings" slug="acme" />
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
          <OrganizationSettings />
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
  title: "Zaidan/Plugins/Organization",
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const OrganizationSwitcherPreview: Story = {
  render: () => (
    <RouterProvider
      router={createStoryRouter(OrganizationSwitcherPreviewContent)}
    />
  )
}

export const OrganizationPreview: Story = {
  render: () => (
    <RouterProvider router={createStoryRouter(OrganizationPreviewContent)} />
  )
}

export const OrganizationSettingsPreview: Story = {
  render: () => (
    <RouterProvider
      router={createStoryRouter(OrganizationSettingsPreviewContent)}
    />
  )
}

export const OrganizationProfilePreview: Story = {
  render: () => (
    <RouterProvider
      router={createStoryRouter(OrganizationProfilePreviewContent)}
    />
  )
}

export const OrganizationDangerZonePreview: Story = {
  render: () => (
    <RouterProvider
      router={createStoryRouter(OrganizationDangerZonePreviewContent)}
    />
  )
}

export const OrganizationPeoplePreview: Story = {
  render: () => (
    <RouterProvider
      router={createStoryRouter(OrganizationPeoplePreviewContent)}
    />
  )
}

export const OrganizationMembersPreview: Story = {
  render: () => (
    <RouterProvider
      router={createStoryRouter(OrganizationMembersPreviewContent)}
    />
  )
}

export const OrganizationInvitationsPreview: Story = {
  render: () => (
    <RouterProvider
      router={createStoryRouter(OrganizationInvitationsPreviewContent)}
    />
  )
}

export const OrganizationsSettingsPreview: Story = {
  render: () => (
    <RouterProvider
      router={createStoryRouter(OrganizationsSettingsPreviewContent)}
    />
  )
}

export const UserInvitationsPreview: Story = {
  render: () => (
    <RouterProvider router={createStoryRouter(UserInvitationsPreviewContent)} />
  )
}
