import { QueryClient } from "@tanstack/react-query"
import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { AuthProvider } from "../src/components/auth/auth-provider"
import { CreateOrganizationDialog } from "../src/components/auth/organization/create-organization-dialog"
import { InviteMemberDialog } from "../src/components/auth/organization/invite-member-dialog"
import { OrganizationProfile } from "../src/components/auth/organization/organization-profile"
import { OrganizationSwitcher } from "../src/components/auth/organization/organization-switcher"
import { SlugField } from "../src/components/auth/organization/slug-field"
import { organizationPlugin } from "../src/lib/auth/organization-plugin"

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  })
}

const DEBOUNCE_TIMEOUT = 2500

async function sleep(ms: number) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms))
  })
}

function createSlugFieldAuthClient(
  impl: (params: {
    slug: string
  }) => Promise<{ status: boolean }> = async () => ({ status: true })
) {
  const checkSlug = vi.fn(impl)
  return {
    organization: { checkSlug },
    useSession: () => ({ data: null, isPending: false, error: null })
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"] & {
    organization: { checkSlug: typeof checkSlug }
  }
}

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise
  })

  return { promise, resolve }
}

function createOrganizationAuthClient(
  create: () => Promise<unknown> = async () => ({ data: {}, error: null })
) {
  const createOrganization = vi.fn(create)
  const checkSlug = vi.fn(async () => ({ status: true }))
  return {
    organization: { create: createOrganization, checkSlug },
    useSession: () => ({
      data: { user: { id: "user-id" } },
      isPending: false,
      error: null
    })
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"] & {
    organization: {
      create: typeof createOrganization
      checkSlug: typeof checkSlug
    }
  }
}

function createOrganizationScopeAuthClient() {
  const organization = {
    id: "org",
    name: "Acme",
    slug: "acme",
    createdAt: new Date()
  }
  const authClient = {
    getSession: vi.fn(async () => ({ user: { id: "user", name: "Alex" } })),
    organization: {
      getFullOrganization: vi.fn(async () => organization),
      list: vi.fn(async () => [organization]),
      listMembers: vi.fn(async () => ({ members: [], total: 0 })),
      hasPermission: vi.fn(async () => ({ success: true })),
      listInvitations: vi.fn(async () => []),
      listTeams: vi.fn(async () => [])
    }
  }
  return authClient as typeof authClient &
    Parameters<typeof AuthProvider>[0]["authClient"]
}

function renderCreateOrganizationDialog({
  authClient = createOrganizationAuthClient(),
  isOpen = true,
  onOpenChange = vi.fn(),
  hideSlug,
  localHideSlug,
  validate = async () => {}
}: {
  authClient?: ReturnType<typeof createOrganizationAuthClient>
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  hideSlug?: boolean
  localHideSlug?: boolean
  validate?: () => Promise<void>
} = {}) {
  const queryClient = createTestQueryClient()
  const renderDialog = (open: boolean) => (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[
        organizationPlugin({
          hideSlug,
          checkSlug: false,
          additionalFields: [
            {
              name: "approval",
              type: "string",
              label: "Approval",
              inputType: "hidden",
              defaultValue: "approved",
              validate
            }
          ]
        })
      ]}
      queryClient={queryClient}
    >
      <CreateOrganizationDialog
        isOpen={open}
        onOpenChange={onOpenChange}
        hideSlug={localHideSlug}
      />
    </AuthProvider>
  )
  const rendered = render(renderDialog(isOpen))

  return {
    ...rendered,
    authClient,
    rerenderDialog: (open: boolean) => rendered.rerender(renderDialog(open))
  }
}

function ControlledSlugField({
  initialValue = "",
  currentSlug
}: {
  initialValue?: string
  currentSlug?: string
}) {
  const [value, setValue] = useState(initialValue)
  return (
    <SlugField value={value} onChange={setValue} currentSlug={currentSlug} />
  )
}

function renderSlugField(
  options: {
    authClient?: ReturnType<typeof createSlugFieldAuthClient>
    pluginOptions?: Parameters<typeof organizationPlugin>[0]
    initialValue?: string
    currentSlug?: string
  } = {}
) {
  const authClient = options.authClient ?? createSlugFieldAuthClient()
  const { container } = render(
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[organizationPlugin(options.pluginOptions)]}
      queryClient={createTestQueryClient()}
    >
      <ControlledSlugField
        initialValue={options.initialValue}
        currentSlug={options.currentSlug}
      />
    </AuthProvider>
  )
  return { authClient, container }
}

describe("<SlugField />", () => {
  it("renders no availability indicator before any input", () => {
    const { container } = renderSlugField()

    expect(container.querySelector(".text-success")).not.toBeInTheDocument()
    expect(container.querySelector(".text-danger")).not.toBeInTheDocument()
  })

  it("shows the check icon after typing a free slug", async () => {
    const user = userEvent.setup()
    const { authClient, container } = renderSlugField({
      authClient: createSlugFieldAuthClient(async () => ({ status: true }))
    })

    await user.type(screen.getByLabelText("Slug"), "my-org")

    await waitFor(
      () => {
        expect(authClient.organization.checkSlug).toHaveBeenCalledTimes(1)
      },
      { timeout: DEBOUNCE_TIMEOUT }
    )

    expect(authClient.organization.checkSlug).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "my-org",
        fetchOptions: expect.objectContaining({ throw: true })
      })
    )

    await waitFor(() => {
      expect(container.querySelector(".text-success")).toBeInTheDocument()
    })
  })

  it("shows the X icon when the slug is unavailable", async () => {
    const user = userEvent.setup()
    const { container } = renderSlugField({
      authClient: createSlugFieldAuthClient(async () => {
        throw new Error("ORGANIZATION_SLUG_ALREADY_TAKEN")
      })
    })

    await user.type(screen.getByLabelText("Slug"), "taken")

    await waitFor(
      () => {
        expect(container.querySelector(".text-danger")).toBeInTheDocument()
      },
      { timeout: DEBOUNCE_TIMEOUT }
    )
  })

  it("does not call checkSlug when checkSlug is disabled", async () => {
    const user = userEvent.setup()
    const { authClient, container } = renderSlugField({
      pluginOptions: { checkSlug: false }
    })

    await user.type(screen.getByLabelText("Slug"), "my-org")
    await sleep(700)

    expect(authClient.organization.checkSlug).not.toHaveBeenCalled()
    expect(container.querySelector(".text-success")).not.toBeInTheDocument()
  })

  it("skips the availability check when the value matches currentSlug", async () => {
    const { authClient } = renderSlugField({
      currentSlug: "my-org",
      initialValue: "my-org"
    })

    await sleep(700)

    expect(authClient.organization.checkSlug).not.toHaveBeenCalled()
  })
})

describe("<CreateOrganizationDialog />", () => {
  it.each([{ hideSlug: true }, { localHideSlug: true }])(
    "creates an organization with a generated slug when hidden: %j",
    async (options) => {
      const user = userEvent.setup()
      const { authClient } = renderCreateOrganizationDialog(options)
      expect(screen.queryByLabelText("Slug")).not.toBeInTheDocument()
      await user.type(screen.getByLabelText("Name"), "  Café Partners  ")
      await user.click(
        screen.getByRole("button", { name: "Create organization" })
      )
      await waitFor(() =>
        expect(authClient.organization.create).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "  Café Partners  ",
            slug: "cafe-partners"
          })
        )
      )
    }
  )

  it("allows a visible field override and preserves a manually edited slug", async () => {
    const user = userEvent.setup()
    const { authClient } = renderCreateOrganizationDialog({
      hideSlug: true,
      localHideSlug: false
    })
    await user.type(screen.getByLabelText("Name"), "Acme")
    const slug = screen.getByLabelText("Slug")
    await user.clear(slug)
    await user.type(slug, "custom")
    await user.type(screen.getByLabelText("Name"), " Partners")
    await user.click(
      screen.getByRole("button", { name: "Create organization" })
    )
    await waitFor(() =>
      expect(authClient.organization.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Acme Partners", slug: "custom" })
      )
    )
  })

  it("retries a hidden slug collision and closes after successful creation", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const authClient = createOrganizationAuthClient()
    authClient.organization.create.mockRejectedValueOnce(
      Object.assign(new Error("Organization already exists"), {
        error: { code: "ORGANIZATION_ALREADY_EXISTS" }
      })
    )
    renderCreateOrganizationDialog({ authClient, hideSlug: true, onOpenChange })
    await user.type(screen.getByLabelText("Name"), "Acme")
    await user.click(
      screen.getByRole("button", { name: "Create organization" })
    )

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
    expect(authClient.organization.create).toHaveBeenCalledTimes(2)
    expect(authClient.organization.checkSlug).toHaveBeenCalledTimes(2)
    expect(authClient.organization.create).toHaveBeenLastCalledWith(
      expect.objectContaining({
        slug: expect.stringMatching(/^acme-[a-f0-9-]+$/)
      })
    )
  })

  it("keeps hidden creation open when the server rejects creation", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const authClient = createOrganizationAuthClient(async () => {
      throw new Error("Organization limit reached")
    })
    renderCreateOrganizationDialog({ authClient, hideSlug: true, onOpenChange })
    await user.type(screen.getByLabelText("Name"), "Acme")
    const submit = screen.getByRole("button", { name: "Create organization" })
    await user.click(submit)
    await waitFor(() =>
      expect(authClient.organization.create).toHaveBeenCalledOnce()
    )
    await waitFor(() =>
      expect(submit).not.toHaveAttribute("data-pending", "true")
    )
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it("does not create an organization when validation finishes after closing", async () => {
    const user = userEvent.setup()
    const validation = createDeferred<void>()
    const validate = vi.fn(() => validation.promise)
    const { authClient, rerenderDialog } = renderCreateOrganizationDialog({
      validate
    })

    await user.type(screen.getByLabelText("Name"), "Acme")
    await user.click(
      screen.getByRole("button", { name: "Create organization" })
    )
    await waitFor(() => expect(validate).toHaveBeenCalledTimes(1))

    act(() => rerenderDialog(false))
    act(() => rerenderDialog(true))
    await act(async () => validation.resolve())

    expect(authClient.organization.create).not.toHaveBeenCalled()
  })

  it("ignores a completed mutation from a previous dialog opening", async () => {
    const user = userEvent.setup()
    const creation = createDeferred<unknown>()
    const authClient = createOrganizationAuthClient(() => creation.promise)
    const onOpenChange = vi.fn()
    const { rerenderDialog } = renderCreateOrganizationDialog({
      authClient,
      onOpenChange
    })

    await user.type(screen.getByLabelText("Name"), "Acme")
    await user.click(
      screen.getByRole("button", { name: "Create organization" })
    )
    await waitFor(() => {
      expect(authClient.organization.create).toHaveBeenCalledTimes(1)
    })

    act(() => rerenderDialog(false))
    act(() => rerenderDialog(true))
    await act(async () => creation.resolve({ data: {}, error: null }))

    expect(onOpenChange).not.toHaveBeenCalled()
  })
})

describe("<OrganizationProfile />", () => {
  it("preserves the existing slug when renaming an organization with hidden slugs", async () => {
    const user = userEvent.setup()
    const update = vi.fn(async () => ({}))
    const authClient = {
      getSession: vi.fn(async () => ({ user: { id: "user" } })),
      organization: {
        getFullOrganization: vi.fn(async () => ({
          id: "org",
          name: "Acme",
          slug: "original-slug"
        })),
        hasPermission: vi.fn(async () => ({ success: true })),
        update
      }
    } as unknown as Parameters<typeof AuthProvider>[0]["authClient"]
    render(
      <AuthProvider
        authClient={authClient}
        navigate={() => {}}
        queryClient={createTestQueryClient()}
        plugins={[
          organizationPlugin({
            slug: "original-slug",
            hideSlug: true,
            logo: { enabled: false }
          })
        ]}
      >
        <OrganizationProfile />
      </AuthProvider>
    )
    const name = await screen.findByDisplayValue("Acme")
    await waitFor(() => expect(name).toBeEnabled())
    expect(screen.queryByLabelText("Slug")).not.toBeInTheDocument()
    await user.clear(name)
    await user.type(name, "Renamed")
    await user.click(screen.getByRole("button", { name: "Save changes" }))
    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: "org",
          data: { name: "Renamed" }
        })
      )
    )
  })
})

describe("<OrganizationSwitcher />", () => {
  it.each([
    {
      localHideSlug: undefined,
      pluginHideSlug: undefined,
      expectedHidden: true
    },
    { localHideSlug: true, pluginHideSlug: false, expectedHidden: true },
    { localHideSlug: false, pluginHideSlug: true, expectedHidden: false }
  ])(
    "passes its resolved slug visibility to the create dialog: %j",
    async ({ localHideSlug, pluginHideSlug, expectedHidden }) => {
      const user = userEvent.setup()
      render(
        <AuthProvider
          authClient={createOrganizationScopeAuthClient()}
          navigate={() => {}}
          queryClient={createTestQueryClient()}
          plugins={[
            organizationPlugin({ slug: "acme", hideSlug: pluginHideSlug })
          ]}
        >
          <OrganizationSwitcher hideSlug={localHideSlug} />
        </AuthProvider>
      )

      const trigger = screen.getByRole("button", {
        name: "Organization",
        exact: true
      })
      await waitFor(() => expect(trigger).toBeEnabled())
      await user.click(trigger)
      await user.click(
        await screen.findByRole("menuitem", { name: "Create organization" })
      )
      await screen.findByLabelText("Name")

      expect(screen.queryByLabelText("Slug") === null).toBe(expectedHidden)
    }
  )
})

describe("<InviteMemberDialog />", () => {
  it.each([false, true])(
    "loads teams only when enabled (teams: %s)",
    async (teams) => {
      const authClient = createOrganizationScopeAuthClient()
      const queryClient = createTestQueryClient()
      render(
        <AuthProvider
          authClient={authClient}
          navigate={() => {}}
          queryClient={queryClient}
          plugins={[organizationPlugin({ slug: "acme", teams })]}
        >
          <InviteMemberDialog isOpen onOpenChange={() => {}} />
        </AuthProvider>
      )

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Invite member" })
        ).toBeEnabled()
      )
      await waitFor(() => expect(queryClient.isFetching()).toBe(0))
      expect(authClient.organization.listTeams).toHaveBeenCalledTimes(
        teams ? 1 : 0
      )
    }
  )
})
