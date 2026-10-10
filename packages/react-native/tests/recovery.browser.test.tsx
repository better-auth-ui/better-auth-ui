import { authMutationKeys, authQueryKeys } from "@better-auth-ui/core"
import { useMutation } from "@tanstack/react-query"
import { cleanup, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, expect, it, vi } from "vitest"
import { useNativeReauthentication } from "../src/components/auth/reauthentication"
import { Button } from "../src/primitives/button"
import { nativeApp } from "./support/native-app"
vi.mock("expo-clipboard", () => ({ setStringAsync: vi.fn() }))
vi.mock("expo-image-picker", () => ({ launchImageLibraryAsync: vi.fn() }))
vi.mock("expo-image-manipulator", () => ({ SaveFormat: { PNG: "png" } }))
afterEach(cleanup)
function SensitiveAction({ action }: { action: () => Promise<void> }) {
  const mutation = useMutation({
    mutationKey: [...authMutationKeys.all, "protected"],
    mutationFn: action
  })
  const recovery = useNativeReauthentication()
  return (
    <>
      <Button onPress={() => mutation.mutate()}>Apply change</Button>
      <Button onPress={() => void recovery.complete()}>
        Finish authentication
      </Button>
    </>
  )
}
it.each([true, false])(
  "preserves a failed action and retries only after the same user signs in (same user: %s)",
  async (sameUser) => {
    const action = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(
        Object.assign(new Error("Fresh session required"), {
          code: "SESSION_NOT_FRESH"
        })
      )
      .mockResolvedValue(undefined)
    const signOut = vi.fn(async () => ({ success: true }))
    const app = nativeApp({ authenticated: true, client: { signOut } })
    app.render(<SensitiveAction action={action} />)
    const user = userEvent.setup()
    await user.click(
      screen.getByRole("button", { name: "Apply change", exact: true })
    )
    const authenticate = await screen.findByRole("button", {
      name: "Sign in again",
      exact: true
    })
    expect(action).toHaveBeenCalledTimes(1)
    await user.click(authenticate)
    await waitFor(() =>
      expect(app.navigation.push).toHaveBeenCalledWith("signIn", {
        replace: true,
        params: { reauthenticate: "true", redirectTo: "/settings/security" }
      })
    )
    app.queryClient.setQueryData(authQueryKeys.session, {
      ...app.session,
      user: { ...app.session.user, id: sameUser ? "user" : "different-user" }
    })
    await user.click(
      screen.getByRole("button", { name: "Finish authentication", exact: true })
    )
    await waitFor(() =>
      expect(app.navigation.navigate).toHaveBeenCalledWith({
        to: "/settings/security",
        replace: true
      })
    )
    expect(action).toHaveBeenCalledTimes(sameUser ? 2 : 1)
  }
)
it("cancels recovery without replaying the sensitive action", async () => {
  const action = vi.fn(async () => {
    throw Object.assign(new Error("Fresh session required"), {
      code: "SESSION_NOT_FRESH"
    })
  })
  const app = nativeApp({ authenticated: true })
  app.render(<SensitiveAction action={action} />)
  const user = userEvent.setup()
  await user.click(
    screen.getByRole("button", { name: "Apply change", exact: true })
  )
  await screen.findByRole("button", { name: "Sign in again", exact: true })
  await user.click(screen.getByRole("button", { name: "Cancel", exact: true }))
  await user.click(
    screen.getByRole("button", { name: "Finish authentication", exact: true })
  )
  expect(action).toHaveBeenCalledTimes(1)
  expect(app.navigation.push).not.toHaveBeenCalled()
})
