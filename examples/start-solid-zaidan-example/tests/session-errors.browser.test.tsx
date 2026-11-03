import "@testing-library/jest-dom/vitest"
import { authQueryKeys } from "@better-auth-ui/core"
import { QueryClient } from "@tanstack/solid-query"
import { cleanup, render, screen, waitFor } from "@solidjs/testing-library"
import { afterEach, expect, it, vi } from "vitest"
import { toast } from "solid-sonner"
import { AuthProvider } from "../src/components/auth/auth-provider"
import { ActiveSessionsSettings } from "../src/components/auth/settings/security/active-sessions"
function responseError(
  status: number,
  statusText: string,
  error: Record<string, unknown>
) {
  return Object.assign(new Error(statusText), { status, statusText, error })
}
const serverMessage = "Die Sitzungen konnten nicht geladen werden"
const genericMessage =
  "Sitzungen konnten nicht geladen werden. Erneut versuchen."
const rateLimitedMessage = "Zu viele Anfragen. Bitte warten."
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
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false }
    }
  })
  // Register the broad key first so the provider preserves the specific retry override.
  queryClient.setQueryDefaults(authQueryKeys.all, {})
  queryClient.setQueryDefaults(authQueryKeys.listSessions("ada"), {
    retry: false
  })
  clients.push(queryClient)
  const session = {
    user: { id: "ada", name: "Ada", email: "ada@example.com" },
    session: { id: "session" }
  }
  queryClient.setQueryData(authQueryKeys.session, session)
  const errorToast = vi.spyOn(toast, "error").mockReturnValue("test")
  const authClient = {
    getSession: async () => session,
    listSessions
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"]
  render(() => (
    <AuthProvider
      authClient={authClient}
      queryClient={queryClient}
      navigate={vi.fn()}
      localization={{
        errors: { generic: genericMessage, rateLimited: rateLimitedMessage }
      }}
      Link={(props) => <a {...props} />}
    >
      {() => <ActiveSessionsSettings />}
    </AuthProvider>
  ))
  return { listSessions, queryClient, errorToast }
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
    queryKey: authQueryKeys.listSessions("ada")
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
