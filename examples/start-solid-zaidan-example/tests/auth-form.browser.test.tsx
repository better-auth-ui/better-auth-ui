import type { TablePersistenceAdapters } from "@better-auth-ui/core"
import { cleanup, fireEvent, render } from "@solidjs/testing-library"
import { afterEach, describe, expect, it, vi } from "vitest"

import { createAuthForm } from "../src/components/auth/auth-form"
import {
  createOrganizationColumnHelper,
  createOrganizationTable
} from "../src/components/auth/organization/organization-table"
import { OrganizationTableRenderer } from "../src/components/auth/organization/organization-table-renderer"
import { OrganizationTableSelectRow } from "../src/components/auth/organization/organization-table-selection"
import { createOrganizationTableState } from "../src/components/auth/organization/organization-table-state"

afterEach(cleanup)

type TestRow = {
  group: string
  id: string
  name: string
}

const tableColumnHelper = createOrganizationColumnHelper<TestRow>()
const tableColumns = tableColumnHelper.columns([
  tableColumnHelper.accessor("group", {
    cell: ({ getValue }) => getValue(),
    filterFn: "includesString",
    header: "Group"
  }),
  tableColumnHelper.accessor("name", {
    cell: ({ getValue }) => getValue(),
    filterFn: "includesString",
    header: "Name"
  })
])
const tableRows: TestRow[] = [
  { group: "b", id: "1", name: "Ada" },
  { group: "a", id: "2", name: "Charlie" },
  { group: "a", id: "3", name: "Bea" }
]

function NativeValidationForm() {
  const form = createAuthForm(() => ({
    defaultValues: {},
    onSubmit: vi.fn()
  }))

  return (
    <form.AppForm>
      <form.AuthFormRoot>
        <input aria-label="First" required />
        <input aria-label="Second" required />
        <form.AuthFormSubmitButton>Submit</form.AuthFormSubmitButton>
      </form.AuthFormRoot>
    </form.AppForm>
  )
}

function PendingAuthForm(props: { onSubmit: () => Promise<void> }) {
  const form = createAuthForm(() => ({
    defaultValues: {},
    onSubmit: props.onSubmit
  }))

  return (
    <form.AppForm>
      <form.AuthFormRoot>
        <form.AuthFormSubmitButton>Submit</form.AuthFormSubmitButton>
      </form.AuthFormRoot>
    </form.AppForm>
  )
}

function ValidatedAuthForm() {
  const form = createAuthForm(() => ({
    defaultValues: { email: "" },
    onSubmit: async () => {
      throw {
        body: {
          fieldErrors: { email: "This email is already registered" },
          message: "Account creation failed"
        }
      }
    }
  }))

  return (
    <form.AppForm>
      <form.AuthFormRoot>
        <form.AppField
          name="email"
          validators={{
            onChange: ({ value }) => (value ? undefined : "Email is required")
          }}
        >
          {(field) => <field.AuthFormTextField label="Email" type="email" />}
        </form.AppField>
        <form.AuthFormSubmitButton>Submit</form.AuthFormSubmitButton>
        <form.AuthFormServerError />
      </form.AuthFormRoot>
    </form.AppForm>
  )
}

function OrganizationTableFixture() {
  const table = createOrganizationTable({
    columns: tableColumns,
    data: tableRows,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 2 } }
  })

  return (
    <>
      <button
        onClick={() => table.getColumn("group")?.setFilterValue("a")}
        type="button"
      >
        Filter group
      </button>
      <button
        onClick={() => table.getColumn("name")?.toggleSorting(true)}
        type="button"
      >
        Sort names
      </button>
      <button onClick={() => table.nextPage()} type="button">
        Next page
      </button>
      <button
        onClick={() => table.getRow("1").toggleSelected(true)}
        type="button"
      >
        Select Ada
      </button>
      <output aria-label="Selected rows">
        {table
          .getSelectedRowModel()
          .rows.map((row) => row.id)
          .join(",")}
      </output>
      <OrganizationTableRenderer empty="No people" table={table} />
    </>
  )
}

function RouterTableStateFixture(props: {
  adapters: TablePersistenceAdapters
}) {
  const state = createOrganizationTableState(
    "router",
    10,
    ["group", "name"],
    props.adapters
  )

  return (
    <output aria-label="Restored table state">
      {state.ready()
        ? `${state.globalFilter()}|${state.sorting()[0]?.id ?? ""}|${state.pagination().pageIndex}`
        : "loading"}
    </output>
  )
}

describe("Solid auth form", () => {
  it("captures native invalid events and focuses the first invalid control", async () => {
    const view = render(() => <NativeValidationForm />)
    const formElement = view.container.querySelector("form")
    const firstControl = view.getByLabelText("First")
    const focus = vi.spyOn(firstControl, "focus")

    expect(formElement).not.toBeNull()
    formElement?.requestSubmit()

    await vi.waitFor(() => expect(focus).toHaveBeenCalled())
    expect(document.activeElement).toBe(firstControl)
  })

  it("rejects concurrent submission and exposes its pending state", async () => {
    let finishSubmission!: () => void
    const submission = new Promise<void>((resolve) => {
      finishSubmission = resolve
    })
    const onSubmit = vi.fn(() => submission)
    const view = render(() => <PendingAuthForm onSubmit={onSubmit} />)
    const formElement = view.container.querySelector("form")
    const submitButton = view.getByRole("button", { name: /Submit/ })

    expect(formElement).not.toBeNull()
    fireEvent.submit(formElement as HTMLFormElement)
    fireEvent.submit(formElement as HTMLFormElement)

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    await vi.waitFor(() => expect(submitButton).toBeDisabled())
    expect(view.getByRole("status", { name: "Loading" })).toBeInTheDocument()

    finishSubmission()
    await vi.waitFor(() => expect(submitButton).toBeEnabled())
  })

  it("owns field validation and maps rejected server errors", async () => {
    const view = render(() => <ValidatedAuthForm />)
    const email = view.getByRole("textbox", { name: "Email" })
    const submit = view.getByRole("button", { name: "Submit" })

    fireEvent.input(email, { target: { value: "" } })
    fireEvent.blur(email)
    await vi.waitFor(() =>
      expect(view.getByText("Email is required")).toBeVisible()
    )

    fireEvent.input(email, { target: { value: "ada@example.com" } })
    fireEvent.click(submit)

    await vi.waitFor(() =>
      expect(view.getByText("This email is already registered")).toBeVisible()
    )
    expect(view.getByText("Account creation failed")).toBeVisible()
  })
})

describe("Solid organization table selection", () => {
  it("preserves Shift for keyboard range selection", () => {
    const toggleSelected = vi.fn()
    const view = render(() => (
      <OrganizationTableSelectRow
        localization={{ selectRow: "Select row" }}
        row={{
          getCanSelect: () => true,
          getIsSelected: () => false,
          getToggleSelectedHandler: () => toggleSelected
        }}
      />
    ))
    const checkboxGroup = view.getByRole("group", { name: "Select row" })
    const checkbox = view.container.querySelector<HTMLInputElement>(
      '[data-slot="checkbox-input"]'
    )

    expect(checkbox).not.toBeNull()
    fireEvent.keyDown(checkboxGroup, { key: " ", shiftKey: true })
    fireEvent.click(checkbox as HTMLInputElement)

    expect(toggleSelected).toHaveBeenCalledWith({
      shiftKey: true,
      target: { checked: true }
    })
  })

  it("renders columns and composes filtering, sorting, pagination, and selection", async () => {
    const view = render(() => <OrganizationTableFixture />)

    expect(view.getByRole("columnheader", { name: "Group" })).toBeVisible()
    expect(view.getByRole("columnheader", { name: "Name" })).toBeVisible()
    expect(view.getByRole("cell", { name: "Ada" })).toBeVisible()
    expect(view.getByRole("cell", { name: "Charlie" })).toBeVisible()
    expect(view.queryByRole("cell", { name: "Bea" })).not.toBeInTheDocument()

    fireEvent.click(view.getByRole("button", { name: "Select Ada" }))
    expect(
      view.getByRole("status", { name: "Selected rows" })
    ).toHaveTextContent("1")

    fireEvent.click(view.getByRole("button", { name: "Next page" }))
    await vi.waitFor(() =>
      expect(view.getByRole("cell", { name: "Bea" })).toBeVisible()
    )

    fireEvent.click(view.getByRole("button", { name: "Filter group" }))
    await vi.waitFor(() => {
      expect(view.queryByRole("cell", { name: "Ada" })).not.toBeInTheDocument()
      expect(view.getByRole("cell", { name: "Charlie" })).toBeVisible()
      expect(view.getByRole("cell", { name: "Bea" })).toBeVisible()
    })

    fireEvent.click(view.getByRole("button", { name: "Sort names" }))
    await vi.waitFor(() => {
      const names = view
        .getAllByRole("cell")
        .map((cell) => cell.textContent)
        .filter((value) => value === "Bea" || value === "Charlie")
      expect(names).toEqual(["Charlie", "Bea"])
    })
  })

  it("restores URL state when a router adapter reports navigation", async () => {
    let params = new URLSearchParams("router.search=first")
    let notifyNavigation = () => undefined
    const adapters: TablePersistenceAdapters = {
      search: {
        read: () => new URLSearchParams(params),
        replace: (next) => {
          params = new URLSearchParams(next)
        },
        subscribe: (listener) => {
          notifyNavigation = listener
          return () => {
            notifyNavigation = () => undefined
          }
        }
      }
    }
    const view = render(() => <RouterTableStateFixture adapters={adapters} />)

    await vi.waitFor(() =>
      expect(
        view.getByRole("status", { name: "Restored table state" })
      ).toHaveTextContent("first||0")
    )

    params = new URLSearchParams(
      "router.search=restored&router.sort=name.desc&router.page=2"
    )
    notifyNavigation()

    await vi.waitFor(() =>
      expect(
        view.getByRole("status", { name: "Restored table state" })
      ).toHaveTextContent("restored|name|1")
    )
  })
})
