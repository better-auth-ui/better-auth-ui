import type { AuthClient } from "@better-auth-ui/core"
import { afterEach, expect, it, vi } from "vitest"
import { useAuthenticate } from "../../react/src/hooks/auth/use-authenticate"

const { navigate, session } = vi.hoisted(() => ({
  navigate: vi.fn(),
  session: { data: null as unknown, isPending: false }
}))
vi.mock("react", () => ({ useEffect: (effect: () => void) => effect() }))
vi.mock("../../react/src/components/auth/auth-provider", () => ({
  useAuth: () => ({
    basePaths: { auth: "/auth" },
    viewPaths: { auth: { signIn: "sign-in" } },
    navigate
  })
}))
vi.mock("../../react/src/hooks/queries/use-session", () => ({
  useSession: () => session
}))

afterEach(() => {
  vi.unstubAllGlobals()
  navigate.mockClear()
  session.data = null
  session.isPending = false
})

it("redirects by view when a native window has no location", () => {
  vi.stubGlobal("window", {})
  useAuthenticate({} as AuthClient)
  expect(navigate).toHaveBeenCalledWith({
    to: "/auth/sign-in",
    view: "signIn",
    params: undefined,
    replace: true
  })
})

it("preserves the URL for browser redirects", () => {
  vi.stubGlobal("window", {
    location: { pathname: "/settings/security", search: "?tab=sessions" }
  })
  useAuthenticate({} as AuthClient)
  expect(navigate).toHaveBeenCalledWith({
    to: "/auth/sign-in?redirectTo=%2Fsettings%2Fsecurity%3Ftab%3Dsessions",
    view: "signIn",
    params: { redirectTo: "/settings/security?tab=sessions" },
    replace: true
  })
})

it.each([
  { data: {}, isPending: false },
  { data: null, isPending: true }
])("does not redirect while a session exists or is unresolved", (state) => {
  Object.assign(session, state)
  useAuthenticate({} as AuthClient)
  expect(navigate).not.toHaveBeenCalled()
})
