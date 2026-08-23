import { expect, fn } from "storybook/test"
import type { StoryObj } from "storybook-solidjs-vite"

type StoryFunction = (...args: never[]) => unknown

export function withStoryActions<T>(value: T, name: string): T {
  if (typeof value === "function") {
    const action = fn(value as StoryFunction).mockName(name)

    for (const [key, child] of Object.entries(value)) {
      Object.assign(action, {
        [key]: withStoryActions(child, `${name}.${key}`)
      })
    }

    return action as T
  }

  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    return value
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      withStoryActions(child, `${name}.${key}`)
    ])
  ) as T
}

export const storyRenders: NonNullable<StoryObj["play"]> = async ({
  canvas,
  step,
  userEvent
}) => {
  await step("render the feature", async () => {
    await expect(await canvas.findByRole("main")).toBeVisible()
  })

  await step("exercise the primary control", async () => {
    const textboxes = canvas.queryAllByRole("textbox")

    for (const textbox of textboxes) {
      if (textbox.getAttribute("value")) continue

      const name = textbox.getAttribute("aria-label")?.toLowerCase() ?? ""
      const value = name.includes("email")
        ? "ada@example.com"
        : name.includes("password")
          ? "storybook-password"
          : "storybook"

      await userEvent.type(textbox, value)
    }

    const primaryControl = [
      /Create API key/i,
      /Create organization/i,
      /Invite member/i,
      /Enable two-factor/i,
      /Connect wallet/i,
      /Create client/i,
      /Continue as guest/i,
      /Send (Magic Link|code)/i,
      /Add passkey/i,
      /Save changes/i,
      /Update email/i,
      /Update password/i,
      /Delete account/i,
      /Ada Lovelace/i
    ]
      .map((name) => canvas.queryByRole("button", { name }))
      .find((control) => control && !control.hasAttribute("disabled"))

    if (primaryControl) {
      await userEvent.click(primaryControl)
    }
  })
}
