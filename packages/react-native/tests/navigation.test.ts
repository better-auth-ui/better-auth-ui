import { describe, expect, it, vi } from "vitest"
import { createExpoRouterNavigation } from "../src/navigation/expo-router-adapter"
import { createReactNavigationNavigation } from "../src/navigation/react-navigation-adapter"
import {
  getNavigationParams,
  getNavigationPath,
  resolveNavigationTarget
} from "../src/navigation/route-config"

const config = {
  basePaths: { auth: "/login", settings: "/account", organization: "/teams" },
  viewPaths: {
    auth: { signIn: "email", magicLink: "link" },
    organization: { people: "members", reports: "activity/reports" }
  },
  slugPrefix: "@",
  baseURL: "https://app.example.com"
}

describe("native route resolution", () => {
  it("round-trips configured auth and organization routes with escaped slugs and parameters", () => {
    const target = {
      section: "organization" as const,
      view: "reports",
      slug: "research & design"
    }
    const path = getNavigationPath(target, config, {
      redirectTo: "/settings?tab=keys",
      token: "a+b"
    })
    expect(resolveNavigationTarget({ to: path }, config)).toEqual(target)
    expect(getNavigationParams(path)).toEqual({
      redirectTo: "/settings?tab=keys",
      token: "a+b"
    })
    expect(
      resolveNavigationTarget(
        { to: "/login/link?email=ada%40example.com" },
        config
      )
    ).toEqual({ section: "auth", view: "magicLink" })
  })

  it("does not confuse paths that share a final segment or a base-path prefix", () => {
    expect(
      resolveNavigationTarget({ to: "/reports/email" }, config)
    ).toBeUndefined()
    expect(
      resolveNavigationTarget({ to: "/login-extra/email" }, config)
    ).toBeUndefined()
    expect(
      resolveNavigationTarget({ to: "/teams/@acme/members" }, config)
    ).toEqual({ section: "organization", slug: "acme", view: "people" })
  })

  it("matches same-origin absolute routes while preserving external application destinations", () => {
    expect(
      resolveNavigationTarget(
        { to: "https://app.example.com/login/email" },
        config
      )
    ).toEqual({ section: "auth", view: "signIn" })
    expect(
      resolveNavigationTarget(
        { to: "https://other.example.com/login/email" },
        config
      )
    ).toBeUndefined()
  })

  it("preserves encoded equals signs, repeated first values, fragments, and explicit parameter overrides", () => {
    expect(
      getNavigationParams(
        "/login?token=a%3Db&token=second&name=Ada+Lovelace#ignored",
        { token: "override" }
      )
    ).toEqual({ token: "override", name: "Ada Lovelace" })
  })

  it("composes default plugin paths without emitting undefined segments", () => {
    expect(getNavigationPath({ section: "auth", view: "magicLink" })).toBe(
      "/auth/magicLink"
    )
    expect(getNavigationPath({ section: "auth", view: "signIn" })).toBe(
      "/auth/sign-in"
    )
  })
})

it("configures Expo navigation with resolved paths and merges explicit route parameters", () => {
  const router = { push: vi.fn(), replace: vi.fn() }
  const navigation = createExpoRouterNavigation({
    router,
    authBasePath: "/custom"
  })
  navigation.configure?.(config)
  navigation.push("magicLink", { params: { token: "a+b" } })
  expect(router.push).toHaveBeenCalledWith("/custom/link?token=a%2Bb")
  navigation.navigate({
    to: "/callback?token=old#status",
    params: { token: "new", redirectTo: "/home" },
    replace: true
  })
  expect(router.replace).toHaveBeenCalledWith(
    "/callback?token=new&redirectTo=%2Fhome#status"
  )
})

it("resolves React Navigation organization routes, identity, and deep-link parameters", () => {
  const router = { navigate: vi.fn(), replace: vi.fn() }
  const navigation = createReactNavigationNavigation({
    navigation: router,
    screens: {
      auth: { magicLink: "Link" },
      organization: { people: "Members" }
    },
    route: { name: "Members", params: { slug: "acme" } }
  })
  navigation.configure?.(config)
  navigation.navigate({
    to: "/teams/@other/members?invite=a%2Bb",
    replace: true
  })
  expect(router.replace).toHaveBeenCalledWith("Members", {
    slug: "other",
    invite: "a+b"
  })
  expect(navigation.current()).toEqual({
    section: "organization",
    view: "people",
    slug: "acme"
  })
})

it("delegates unhandled name-based destinations and diagnoses unconfigured screens", () => {
  const onUnhandledNavigate = vi.fn()
  const navigation = createReactNavigationNavigation({
    navigation: { navigate: vi.fn() },
    screens: { auth: { signIn: "SignIn" } },
    onUnhandledNavigate
  })
  navigation.navigate({ to: "/dashboard", replace: true })
  expect(onUnhandledNavigate).toHaveBeenCalledWith({
    to: "/dashboard",
    replace: true
  })
  expect(() => navigation.push("signUp")).toThrow()
})

it("does not treat different native schemes as the same origin", () => {
  const nativeConfig = { baseURL: "myapp://", basePaths: { auth: "/auth" } }
  expect(
    resolveNavigationTarget({ to: "myapp:///auth/sign-in" }, nativeConfig)
  ).toEqual({ section: "auth", view: "signIn" })
  expect(
    resolveNavigationTarget({ to: "otherapp:///auth/sign-in" }, nativeConfig)
  ).toBeUndefined()
  expect(
    resolveNavigationTarget({ to: "myapp://other/auth/sign-in" }, nativeConfig)
  ).toBeUndefined()
})
