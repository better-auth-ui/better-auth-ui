import { expect, it, vi } from "vitest"
import { resolveOAuthRedirect } from "../src/lib/native-oauth"
vi.mock("react-native", () => ({ Linking: { openURL: vi.fn() } }))
it("restricts a native OAuth response to the verified callback's scheme, authority, and path", () => {
  const query = new URLSearchParams({
    redirect_uri: "myapp://oauth/callback",
    sig: "verified"
  }).toString()
  expect(
    resolveOAuthRedirect("myapp://oauth/callback?code=code&state=state", query)
  ).toBe("myapp://oauth/callback?code=code&state=state")
  for (const url of [
    "otherapp://oauth/callback",
    "myapp://other/callback",
    "myapp://oauth/different",
    "javascript:alert(1)",
    "file:///private/data",
    "https://user:password@example.com/"
  ])
    expect(() => resolveOAuthRedirect(url, query)).toThrow()
  expect(() =>
    resolveOAuthRedirect(
      "myapp://oauth/callback",
      query + "&redirect_uri=myapp%3A%2F%2Foauth%2Fcallback"
    )
  ).toThrow()
})
