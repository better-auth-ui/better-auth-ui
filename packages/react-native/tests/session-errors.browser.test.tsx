import "@testing-library/jest-dom/vitest"
import { authQueryKeys, localization } from "@better-auth-ui/core"
import { QueryClient } from "@tanstack/react-query"
import { cleanup, screen, waitFor } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import { ActiveSessions } from "../src/components/auth/settings/security/active-sessions"
import { toast } from "../src/primitives/toast"
import { nativeApp } from "./support/native-app"
vi.mock("expo-clipboard", () => ({ setStringAsync: vi.fn() }))
vi.mock("expo-image-picker", () => ({ launchImageLibraryAsync: vi.fn() }))
vi.mock("expo-image-manipulator", () => ({ SaveFormat: { PNG: "png" } }))
function responseError(
  status: number,
  statusText: string,
  error: Record<string, unknown>
) {
  return Object.assign(new Error(statusText), { status, statusText, error })
}
const serverMessage = "Die Sitzungen konnten nicht geladen werden"
const genericMessage = localization.errors.generic
const rateLimitedMessage = localization.errors.rateLimited
const nestedError = responseError(400, "Bad Request", {
  code: "SESSIONS_UNAVAILABLE",
  message: serverMessage
})
const cases = [
  { name: "nested server message", error: nestedError, message: serverMessage },
  {
    name: "empty HTTP failure",
    error: responseError(503, "Service Unavailable", {}),
    message: genericMessage
  },
  {
    name: "rate-limited failure",
    error: responseError(429, "Too Many Requests", {}),
    message: rateLimitedMessage
  },
  {
    name: "network failure",
    error: new TypeError("Internal network details"),
    message: genericMessage
  }
]
const clients: QueryClient[] = []
afterEach(() => {
  cleanup()
  for (const client of clients.splice(0)) client.clear()
  vi.restoreAllMocks()
})
function setup(error: unknown) {
  const listSessions = vi.fn<() => Promise<[]>>().mockRejectedValue(error)
  const errorToast = vi.spyOn(toast, "danger").mockImplementation(() => {})
  const app = nativeApp({ authenticated: true, client: { listSessions } })
  // Register the broad key first so the provider preserves the specific retry override.
  app.queryClient.setQueryDefaults(authQueryKeys.all, {})
  app.queryClient.setQueryDefaults(authQueryKeys.listSessions("user"), {
    retry: false
  })
  clients.push(app.queryClient)
  app.render(<ActiveSessions />)
  return { ...app, listSessions, errorToast }
}
it.each(cases)(
  "shows one inline $name without a toast",
  async ({ error, message }) => {
    const app = setup(error)
    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent(message)
    expect(screen.getAllByText(message)).toHaveLength(1)
    expect(screen.getByText("Active sessions", { exact: true })).toBeVisible()
    expect(screen.queryByText("Bad Request", { exact: true })).toBeNull()
    expect(
      screen.queryByText("Service Unavailable", { exact: true })
    ).toBeNull()
    expect(
      screen.queryByText("Internal network details", { exact: true })
    ).toBeNull()
    expect(
      screen.queryByRole("button", { name: "Sign out everywhere" })
    ).toBeNull()
    expect(app.errorToast).not.toHaveBeenCalled()
  }
)
it("clears the error and restores session actions after a successful refetch", async () => {
  const app = setup(nestedError)
  expect(await screen.findByRole("alert")).toHaveTextContent(serverMessage)
  app.listSessions.mockResolvedValueOnce([])
  await app.queryClient.invalidateQueries({
    queryKey: authQueryKeys.listSessions("user")
  })
  await waitFor(() => expect(screen.queryByText(serverMessage)).toBeNull())
  expect(
    screen.getByRole("button", { name: "Sign out everywhere" })
  ).toBeVisible()
  expect(app.listSessions).toHaveBeenCalledTimes(2)
  expect(app.errorToast).not.toHaveBeenCalled()
})
it("preserves reauthentication without exposing or toasting the server error", async () => {
  const app = setup(
    responseError(401, "Unauthorized", {
      code: "SESSION_NOT_FRESH",
      message: "A fresh session is required"
    })
  )
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Sign in again" })).toBeVisible()
  )
  expect(
    screen.queryByText("A fresh session is required", { exact: true })
  ).toBeNull()
  expect(
    screen.queryByRole("button", { name: "Sign out everywhere" })
  ).toBeNull()
  expect(app.errorToast).not.toHaveBeenCalled()
})
