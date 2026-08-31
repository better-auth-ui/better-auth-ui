import { localization } from "@better-auth-ui/core"
import { organizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { QueryClient } from "@tanstack/react-query"
import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AuthProvider } from "../src/components/auth/auth-provider"
import { OrganizationRoles } from "../src/components/auth/organization/organization-roles"
import { organizationPlugin } from "../src/lib/auth/organization-plugin"

const organizationId = "organization-id"
const role = { id: "support-role", role: "support", permission: {} }
const otherRole = { id: "reviewer-role", role: "reviewer", permission: {} }
const deleteButtonName = { name: organizationLocalization.deleteRole }
const cancelButtonName = { name: localization.settings.cancel }

function setup(memberCount = 0) {
  const organization = {
    getFullOrganization: vi.fn(async () => null),
    hasPermission: vi.fn(async () => ({ success: true })),
    listRoles: vi.fn(async () => [otherRole, role]),
    listMembers: vi.fn(async () => ({ members: [], total: memberCount })),
    getRole: vi.fn(async () => role),
    deleteRole: vi.fn(async () => ({}))
  }
  const authClient = {
    getSession: vi.fn(async () => ({ user: { id: "user-id" } })),
    organization
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"]
  render(
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[organizationPlugin()]}
      queryClient={
        new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false }
          }
        })
      }
    >
      <OrganizationRoles organizationId={organizationId} />
    </AuthProvider>
  )
  return { organization, user: userEvent.setup() }
}

async function getDeleteTrigger() {
  const row = await screen.findByRole("row", { name: new RegExp(role.role) })
  const trigger = within(row).getByRole("button", deleteButtonName)
  await waitFor(() => expect(trigger).toBeEnabled())
  return trigger
}

describe("organization role deletion", () => {
  it("requires confirmation and waits for deletion before closing", async () => {
    const { organization, user } = setup()
    const pending = Promise.withResolvers<object>()
    organization.deleteRole.mockReturnValueOnce(pending.promise)
    const trigger = await getDeleteTrigger()

    await user.click(trigger)
    let dialog = await screen.findByRole("alertdialog", deleteButtonName)
    expect(organization.getRole).not.toHaveBeenCalled()
    expect(organization.deleteRole).not.toHaveBeenCalled()
    await user.click(within(dialog).getByRole("button", cancelButtonName))
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
    await waitFor(() =>
      expect(trigger.closest("tr")).toContainElement(document.activeElement)
    )
    expect(organization.deleteRole).not.toHaveBeenCalled()

    await user.click(trigger)
    dialog = await screen.findByRole("alertdialog", deleteButtonName)
    const confirm = within(dialog).getByRole("button", deleteButtonName)
    await user.click(confirm)
    await waitFor(() => expect(organization.deleteRole).toHaveBeenCalledOnce())
    expect(organization.deleteRole).toHaveBeenCalledWith({
      roleId: role.id,
      organizationId,
      fetchOptions: { throw: true }
    })
    expect(confirm).toBeDisabled()
    expect(within(dialog).getByRole("button", cancelButtonName)).toBeDisabled()
    await user.keyboard("{Escape}")
    await user.click(confirm)
    expect(dialog).toBeVisible()
    expect(organization.deleteRole).toHaveBeenCalledOnce()

    await act(async () => pending.resolve({}))
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
  })

  it("keeps the dialog open after an error and lets the user retry", async () => {
    const { organization, user } = setup()
    organization.deleteRole.mockRejectedValueOnce(new Error("Deletion failed"))
    await user.click(await getDeleteTrigger())
    const dialog = await screen.findByRole("alertdialog", deleteButtonName)
    const confirm = within(dialog).getByRole("button", deleteButtonName)

    await user.click(confirm)
    await waitFor(() => expect(organization.deleteRole).toHaveBeenCalledOnce())
    await waitFor(() => expect(confirm).toBeEnabled())
    expect(dialog).toBeVisible()
    expect(within(dialog).getByRole("button", cancelButtonName)).toBeEnabled()

    await user.click(confirm)
    await waitFor(() =>
      expect(organization.deleteRole).toHaveBeenCalledTimes(2)
    )
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
  })

  it("does not open confirmation for a role that still has members", async () => {
    const { organization, user } = setup(1)
    const row = await screen.findByRole("row", { name: new RegExp(role.role) })
    const trigger = await within(row).findByRole("button", {
      name: organizationLocalization.roleInUse.replace("{{count}}", "1")
    })

    expect(trigger).toBeDisabled()
    await user.click(trigger)
    expect(screen.queryByRole("alertdialog")).toBeNull()
    expect(organization.deleteRole).not.toHaveBeenCalled()
  })
})
