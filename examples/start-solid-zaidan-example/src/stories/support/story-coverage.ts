import { expect, fn } from "storybook/test"
import type { StoryObj } from "storybook-solidjs-vite"

type StoryFunction = (...args: never[]) => unknown

export function withStoryActions<T>(value: T, name: string): T {
  if (typeof value === "function") {
    const action = fn(value as StoryFunction).mockName(name)

    for (const key of Object.keys(value)) {
      const child: unknown = Reflect.get(value, key)
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
      /Create API key/iu,
      /Create organization/iu,
      /Invite member/iu,
      /Enable two-factor/iu,
      /Connect wallet/iu,
      /Create client/iu,
      /Continue as guest/iu,
      /Send (Magic Link|code)/iu,
      /Add passkey/iu,
      /Save changes/iu,
      /Update email/iu,
      /Update password/iu,
      /Delete account/iu,
      /Ada Lovelace/iu
    ]
      .map((name) => canvas.queryByRole("button", { name }))
      .find((control) => control && !control.hasAttribute("disabled"))

    if (primaryControl) {
      await userEvent.click(primaryControl)
    }
  })
}
