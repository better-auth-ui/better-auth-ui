import {
  type AuthClient,
  type ListSession,
  resolveAuthConfig
} from "@better-auth-ui/core"
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library"
import { afterEach, describe, expect, it, vi } from "vitest"
import { ActiveSessionRow } from "../src/components/auth/settings/security/active-session"

const config = resolveAuthConfig({ authClient: {} as AuthClient })

vi.mock("@better-auth-ui/solid", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@better-auth-ui/solid")>()),
  useAuth: () => config
}))

afterEach(cleanup)

describe("active sessions", () => {
  it.each([null, "", undefined])(
    "keeps a session without a user agent revocable (%s)",
    (userAgent) => {
      const session: ListSession = {
        id: "session-1",
        token: "token-1",
        userId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
        userAgent
      }
      const onRevoke = vi.fn()
      render(() => (
        <ActiveSessionRow
          activeSession={session}
          displayName="Session"
          isCurrentSession={false}
          isRevoking={false}
          onRevoke={onRevoke}
          onSignOut={vi.fn()}
        />
      ))
      fireEvent.click(
        screen.getByRole("button", {
          name: config.localization.settings.revokeSession
        })
      )
      expect(onRevoke).toHaveBeenCalledWith(session)
    }
  )
})
