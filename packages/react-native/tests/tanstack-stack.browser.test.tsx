import {
  act,
  cleanup,
  render,
  renderHook,
  screen,
  waitFor
} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useEffect, useState, type ReactNode } from "react"
import { afterEach, expect, it, vi } from "vitest"
import { SignIn } from "../src/components/auth/sign-in"
import { ApiKeys } from "../src/components/auth/api-key/api-keys"
import { AdminUsers } from "../src/components/auth/admin/admin-users"
import { OrganizationMembers } from "../src/components/auth/organization/organization-members"
import { useNativeList } from "../src/components/auth/organization/list-tools"
import { useOrganizationTableState } from "../src/components/auth/organization/organization-table-state"
import {
  NativeTablePersistenceProvider,
  createNativeTablePersistenceAdapters
} from "../src/lib/table-persistence"
import { apiKeyPlugin } from "../src/lib/auth/api-key-plugin"
import { adminPlugin } from "../src/lib/auth/admin-plugin"
import { organizationPlugin } from "../src/lib/auth/organization-plugin"
import { Button } from "../src/primitives/button"
import { TextField, Label, FieldError } from "../src/primitives/field"
import { Input } from "../src/primitives/input"
import { Form, useForm } from "../src/primitives/form"
import { nativeApp } from "./support/native-app"

vi.mock("expo-clipboard", () => ({ setStringAsync: vi.fn() }))
vi.mock("expo-image-picker", () => ({ launchImageLibraryAsync: vi.fn() }))
vi.mock("expo-image-manipulator", () => ({ SaveFormat: { PNG: "png" } }))
afterEach(cleanup)

it("validates sign-in before calling the shared mutation", async () => {
  const email = vi.fn(async () => ({}))
  const app = nativeApp({ client: { signIn: { email } } })
  app.render(<SignIn />)
  await userEvent.click(
    screen.getByRole("button", { name: "Sign In", exact: true })
  )
  expect(email).not.toHaveBeenCalled()
  expect(await screen.findAllByText("This field is required")).toHaveLength(2)
})

it("keeps standalone Form validation and prevents overlapping submissions", async () => {
  let finish!: () => void
  const submit = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve
      })
  )
  function Standalone() {
    const [name, setName] = useState("")
    return (
      <Form onSubmit={submit}>
        <TextField
          name="name"
          value={name}
          onChange={setName}
          validate={(value) => (!value ? "Enter a name" : undefined)}
        >
          <Label>Name</Label>
          <Input />
          <FieldError />
        </TextField>
        <Button type="submit">Save</Button>
      </Form>
    )
  }
  render(<Standalone />)
  const user = userEvent.setup()
  const button = screen.getByRole("button", { name: "Save" })
  await user.click(button)
  await screen.findByText("Enter a name")
  expect(submit).not.toHaveBeenCalled()
  await user.type(screen.getByRole("textbox", { name: "Name" }), "Ada")
  await user.dblClick(button)
  expect(submit).toHaveBeenCalledTimes(1)
  expect(button).toHaveAttribute("aria-disabled", "true")
  finish()
  await waitFor(() =>
    expect(button).not.toHaveAttribute("aria-disabled", "true")
  )
})

const items = Array.from({ length: 12 }, (_, index) => ({
  id: `person-${index}`,
  name: `Person ${String(index).padStart(2, "0")}`
}))
const columns = { name: "Name" }
const sorters = {
  ascending: (a: (typeof items)[number], b: (typeof items)[number]) =>
    a.name.localeCompare(b.name),
  descending: (a: (typeof items)[number], b: (typeof items)[number]) =>
    b.name.localeCompare(a.name)
}

it("sorts and pages native rows, clears selection on changes, and restores preferences", async () => {
  const adapters = createNativeTablePersistenceAdapters()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NativeTablePersistenceProvider adapters={adapters}>
      {children}
    </NativeTablePersistenceProvider>
  )
  const useList = () => {
    const state = useOrganizationTableState("people", 10)
    return {
      state,
      list: useNativeList(items, columns, sorters, state, {
        accessors: {
          ascending: (row) => row.name,
          descending: (row) => row.name
        }
      })
    }
  }
  const first = renderHook(useList, { wrapper })
  await waitFor(() => expect(first.result.current.state.sorting.length).toBe(1))
  act(() => {
    first.result.current.list.setPage(1)
  })
  expect(first.result.current.list.rows.map((row) => row.id)).toEqual([
    "person-10",
    "person-11"
  ])
  act(() => {
    first.result.current.list.setSelected(["person-10"])
  })
  expect(first.result.current.list.selected).toEqual(["person-10"])
  act(() => {
    first.result.current.list.setSort("descending")
  })
  expect(first.result.current.list.page).toBe(0)
  expect(first.result.current.list.selected).toEqual([])
  expect(first.result.current.list.rows[0]?.id).toBe("person-11")
  expect(
    first.result.current.list.table.getRowModel().rows[0]?.getValue("name")
  ).toBe("Person 11")
  act(() => {
    first.result.current.list.setVisible([])
    first.result.current.list.setPage(1)
  })
  await waitFor(() =>
    expect(adapters.search.read().get("people.page")).toBe("2")
  )
  first.unmount()
  const second = renderHook(useList, { wrapper })
  await waitFor(() => expect(second.result.current.state.ready).toBe(true))
  expect(second.result.current.list.page).toBe(1)
  expect(second.result.current.list.sort).toBe("descending")
  expect(second.result.current.list.visible).toEqual([])
})

it("requests API key pages with a lookahead row and advances the server offset", async () => {
  const keys = Array.from({ length: 3 }, (_, index) => ({
    id: `key-${index}`,
    name: `Deploy ${index}`,
    start: "test",
    prefix: "test",
    createdAt: new Date(),
    updatedAt: new Date(),
    enabled: true,
    expiresAt: null
  }))
  const list = vi.fn(async ({ query }) => ({
    apiKeys: keys.slice(query.offset, query.offset + query.limit)
  }))
  const app = nativeApp({
    authenticated: true,
    plugins: [apiKeyPlugin({ pageSize: 2 })],
    client: { apiKey: { list } }
  })
  app.render(<ApiKeys hideCreate hideDelete hideUpdate />)
  await screen.findByText("Deploy 0")
  expect(screen.queryByText("Deploy 2")).toBeNull()
  await userEvent.click(screen.getByRole("button", { name: "Next page" }))
  await screen.findByText("Deploy 2")
  expect(list).toHaveBeenCalledWith(
    expect.objectContaining({
      query: expect.objectContaining({
        limit: 3,
        offset: 2,
        sortBy: "createdAt",
        sortDirection: "desc"
      })
    })
  )
  expect(screen.getByRole("button", { name: "Next page" })).toHaveAttribute(
    "aria-disabled",
    "true"
  )
})

it("debounces admin search before changing server query parameters", async () => {
  const listUsers = vi.fn(async () => ({
    data: { users: [], total: 0 },
    error: null
  }))
  const app = nativeApp({
    authenticated: true,
    plugins: [adminPlugin()],
    client: {
      admin: {
        hasPermission: async () => ({ data: { success: true }, error: null }),
        listUsers
      }
    }
  })
  app.render(<AdminUsers />)
  await waitFor(() => expect(listUsers).toHaveBeenCalled())
  const user = userEvent.setup()
  const before = listUsers.mock.calls.length
  await user.type(screen.getByRole("textbox", { name: "Search" }), "ada")
  expect(listUsers.mock.calls.length).toBe(before)
  await waitFor(() =>
    expect(listUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ searchValue: "ada", offset: 0 })
      })
    )
  )
})

it("uses configured member pages without downloading unrelated members for owner checks", async () => {
  const organization = {
    id: "org",
    slug: "acme",
    name: "Acme",
    createdAt: new Date()
  }
  const members = Array.from({ length: 3 }, (_, index) => ({
    id: `member-${index}`,
    organizationId: "org",
    userId: `other-${index}`,
    role: "member",
    createdAt: new Date(),
    user: {
      id: `other-${index}`,
      name: `Member ${index}`,
      email: `member${index}@example.com`
    }
  }))
  const owner = { ...members[0]!, id: "owner", userId: "user", role: "owner" }
  const listMembers = vi.fn(async ({ query }) =>
    query.filterField === "role"
      ? { members: [owner], total: 1 }
      : {
          members: members.slice(query.offset, query.offset + query.limit),
          total: members.length
        }
  )
  const app = nativeApp({
    authenticated: true,
    plugins: [organizationPlugin({ slug: "acme" })],
    client: {
      organization: {
        getFullOrganization: async () => organization,
        getActiveMemberRole: async () => ({ role: "owner" }),
        hasPermission: async () => ({ success: false }),
        listMembers
      }
    }
  })
  app.render(<OrganizationMembers pageSize={2} />)
  await screen.findByText("Member 0")
  expect(screen.queryByText("Member 2")).toBeNull()
  await userEvent.click(screen.getByRole("button", { name: "Next page" }))
  await screen.findByText("Member 2")
  expect(listMembers).toHaveBeenCalledWith(
    expect.objectContaining({
      query: expect.objectContaining({
        organizationId: "org",
        limit: 2,
        offset: 2
      })
    })
  )
  expect(
    listMembers.mock.calls.every(
      ([{ query }]) => query.limit === 2 || query.filterValue === "owner"
    )
  ).toBe(true)
  const search = screen.getByPlaceholderText("Search...")
  await userEvent.type(search, "Member 0")
  await screen.findByText("Member 0")
  expect(screen.queryByText("Member 2")).toBeNull()
  expect(listMembers).toHaveBeenCalledWith(
    expect.objectContaining({
      query: expect.objectContaining({ limit: 100, offset: 0 })
    })
  )
})

it("uses the shared native username form", async () => {
  const { SignInUsername } =
    await import("../src/components/auth/username/sign-in-username")
  const { usernamePlugin } = await import("../src/lib/auth/username-plugin")
  const app = nativeApp({ plugins: [usernamePlugin()] })
  app.render(<SignInUsername />)
  expect(screen.getByRole("textbox", { name: "Username" })).toBeTruthy()
})

it("searches API keys beyond the current page and sorts the complete matching result", async () => {
  const keys = Array.from({ length: 102 }, (_, index) => ({
    id: `key-${index}`,
    name: index >= 100 ? `Deploy ${index}` : `Build ${index}`,
    start: "test",
    prefix: "test",
    createdAt: new Date(),
    updatedAt: new Date(),
    enabled: true,
    expiresAt: null
  }))
  const list = vi.fn(async ({ query }) => ({
    apiKeys: keys.slice(query.offset, query.offset + query.limit)
  }))
  const app = nativeApp({
    authenticated: true,
    plugins: [apiKeyPlugin({ pageSize: 2 })],
    client: { apiKey: { list } }
  })
  app.render(<ApiKeys hideCreate hideDelete hideUpdate />)
  await screen.findByText("Build 0")
  await userEvent.type(screen.getByRole("textbox", { name: "Name" }), "Deploy")
  await screen.findByText("Deploy 100")
  await screen.findByText("Deploy 101")
  expect(screen.queryByText("Build 0")).toBeNull()
  expect(list).toHaveBeenCalledWith(
    expect.objectContaining({
      query: expect.objectContaining({ limit: 100, offset: 100 })
    })
  )
})

it("reports change-email failures once inline and preserves the edited value", async () => {
  const { ChangeEmail } =
    await import("../src/components/auth/settings/account/change-email")
  const { toast } = await import("../src/primitives/toast")
  const danger = vi.spyOn(toast, "danger").mockImplementation(() => {})
  try {
    const changeEmail = vi.fn(async () => {
      throw new Error("Email is already registered")
    })
    const app = nativeApp({ authenticated: true, client: { changeEmail } })
    app.render(<ChangeEmail />)
    const input = screen.getByRole("textbox", { name: "Email" })
    const user = userEvent.setup()
    await user.clear(input)
    await user.type(input, "new@example.com")
    await user.click(screen.getByRole("button", { name: "Update email" }))
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email is already registered"
    )
    expect(input).toHaveValue("new@example.com")
    expect(danger).not.toHaveBeenCalled()
  } finally {
    danger.mockRestore()
  }
})

it("preserves custom validator registration through TanStack Form", async () => {
  const submit = vi.fn()
  const validate = vi.fn(() => "Complete the custom field")
  function CustomField() {
    const form = useForm()
    useEffect(() => form?.register(validate), [form?.register])
    return null
  }
  const app = render(
    <Form onSubmit={submit}>
      <CustomField />
      <Button type="submit">Save</Button>
    </Form>
  )
  await userEvent.click(screen.getByRole("button", { name: "Save" }))
  await waitFor(() => expect(validate).toHaveBeenCalled())
  expect(submit).not.toHaveBeenCalled()
  app.rerender(
    <Form onSubmit={submit}>
      <Button type="submit">Save</Button>
    </Form>
  )
  await userEvent.click(screen.getByRole("button", { name: "Save" }))
  await waitFor(() => expect(submit).toHaveBeenCalledTimes(1))
})
