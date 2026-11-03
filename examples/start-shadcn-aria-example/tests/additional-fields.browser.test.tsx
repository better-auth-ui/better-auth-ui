import {
  resolveAuthConfig,
  type AdditionalField as FieldConfig,
  type AdditionalFieldFormValue,
  type AuthClient
} from "@better-auth-ui/core"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react"
import { useState } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { userEvent } from "vitest/browser"
import { AdditionalField } from "../src/components/auth/additional-field"
import "../src/styles/app.css"

const config = resolveAuthConfig({ authClient: {} as AuthClient })
vi.mock("@better-auth-ui/react", async (original) => ({
  ...(await original<typeof import("@better-auth-ui/react")>()),
  useAuth: () => config
}))
afterEach(cleanup)

function ControlledField({
  field,
  initial = null,
  isPending = false
}: {
  field: FieldConfig
  initial?: AdditionalFieldFormValue
  isPending?: boolean
}) {
  const [value, setValue] = useState(initial)
  return (
    <form>
      <AdditionalField
        name={field.name}
        field={field}
        value={value}
        onChange={setValue}
        onBlur={vi.fn()}
        isPending={isPending}
      />
      <output aria-label="Current value">
        {value instanceof Date ? value.toISOString() : String(value)}
      </output>
    </form>
  )
}

const options = [
  { value: "red", label: "Red" },
  { value: "blue", label: "Blue" }
]

describe("React Aria additional fields", () => {
  it("selects a value with the keyboard", async () => {
    render(
      <ControlledField
        field={{
          name: "color",
          type: "string",
          inputType: "select",
          label: "Color",
          options
        }}
      />
    )
    const trigger = screen.getByRole("button", { name: /Color/ })
    trigger.focus()
    await userEvent.keyboard("{ArrowDown}")
    const option = await screen.findByRole("option", { name: "Blue" })
    await userEvent.click(option)
    expect(screen.getByLabelText("Current value").textContent).toBe("blue")
    expect(new FormData(trigger.closest("form")!).get("color")).toBe("blue")
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it("filters combobox options and selects a key with the keyboard", async () => {
    render(
      <ControlledField
        field={{
          name: "color",
          type: "string",
          inputType: "combobox",
          label: "Color",
          options
        }}
      />
    )
    const input = screen.getByRole("combobox", { name: "Color" })
    await userEvent.fill(input, "Blu")
    await screen.findByRole("option", { name: "Blue" })
    await waitFor(() =>
      expect(screen.queryByRole("option", { name: "Red" })).toBeNull()
    )
    await userEvent.keyboard("{ArrowDown}{Enter}")
    await waitFor(() =>
      expect(screen.getByLabelText("Current value").textContent).toBe("blue")
    )
    expect(new FormData(input.closest("form")!).get("color")).toBe("blue")
  })

  it.each(["checkbox", "switch"] as const)(
    "changes a %s with the keyboard",
    async (inputType) => {
      render(
        <ControlledField
          field={{
            name: "enabled",
            type: "boolean",
            inputType,
            label: "Enabled"
          }}
          initial={false}
        />
      )
      const input = screen.getByRole(inputType, { name: "Enabled" })
      input.focus()
      await userEvent.keyboard(" ")
      expect(screen.getByLabelText("Current value").textContent).toBe("true")
    }
  )

  it("changes a slider and includes its value in FormData", async () => {
    render(
      <ControlledField
        field={{
          name: "amount",
          type: "number",
          inputType: "slider",
          label: <span>Amount</span>,
          min: 0,
          max: 10,
          step: 1
        }}
        initial={3}
      />
    )
    const slider = screen.getByRole("slider", { name: "Amount" })
    slider.focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(screen.getByLabelText("Current value").textContent).toBe("4")
    expect(new FormData(slider.closest("form")!).get("amount")).toBe("4")
  })

  it("selects a calendar date and restores focus", async () => {
    render(
      <ControlledField
        field={{
          name: "date",
          type: "date",
          inputType: "date",
          label: "Date",
          placeholder: "Choose date"
        }}
        initial={new Date(2026, 10, 3)}
      />
    )
    const trigger = screen.getByRole("button", { name: "Date" })
    await userEvent.click(trigger)
    const calendar = await screen.findByRole("grid")
    const day = calendar.querySelector<HTMLElement>(
      '[role="button"][aria-label*="November 4"]'
    )
    expect(day).not.toBeNull()
    await userEvent.click(day!)
    await waitFor(() => expect(screen.queryByRole("grid")).toBeNull())
    expect(
      new Date(screen.getByLabelText("Current value").textContent!).getDate()
    ).toBe(4)
    expect(document.activeElement).toBe(trigger)
  })

  it("keeps date and time together when the time changes", () => {
    render(
      <ControlledField
        field={{
          name: "date",
          type: "date",
          inputType: "datetime",
          label: "Date"
        }}
        initial={new Date(2026, 10, 3, 9, 30)}
      />
    )
    fireEvent.change(screen.getByLabelText(config.localization.settings.time), {
      target: { value: "11:45:00" }
    })
    const value = new Date(screen.getByLabelText("Current value").textContent!)
    expect([
      value.getFullYear(),
      value.getMonth(),
      value.getDate(),
      value.getHours(),
      value.getMinutes()
    ]).toEqual([2026, 10, 3, 11, 45])
  })
})
